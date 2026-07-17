# Moteur audio — spécification

Réf. depuis CLAUDE.md. Décrit l'architecture du moteur de lecture multipiste.
Contrainte souveraine : synchronisation échantillon-exacte des pistes. Tout le
reste s'y subordonne.

## Principe central

- **Un seul `AudioContext`**, créé à 44100 Hz.
- **Un seul `AudioWorkletNode`** exécutant un `AudioWorkletProcessor` qui mixe
  toutes les pistes. C'est LE moteur. Pas de `AudioBufferSourceNode`, pas de
  balise `<audio>`.
- Chaque piste est stockée en **PCM Int16** (`Int16Array` / `ArrayBuffer`), jamais
  en `AudioBuffer` Float32. Source FLAC 16 bits → Int16 est SANS PERTE.
- Le worklet maintient **un unique index de lecture maître** (en échantillons).
  C'est la source de vérité de la position. La synchro est intrinsèque : toutes les
  pistes sont lues au même index, au même instant.
- À chaque bloc de rendu (128 échantillons), le worklet lit ce bloc pour chaque
  piste au même index, convertit Int16→float, applique le gain de la piste, somme.

## Représentation & décodage

- FLAC décodé via `decodeAudioData` (qui produit du Float32), puis **converti en
  Int16** ; le Float32 est immédiatement libéré.
- **Décoder les pistes SÉQUENTIELLEMENT** (décoder → convertir → libérer), pas en
  parallèle : le décodage parallèle ferait coexister N buffers Float32 en RAM
  (~120 Mo par piste de 12 min), soit le pic mémoire qu'on cherche à éviter.
- Le fetch des fichiers, lui, peut rester parallèle ; seul le décodage est
  séquentiel.
- Évolution future possible : décodeur FLAC WASM sortant directement de l'Int16,
  pour supprimer le pic Float32 transitoire. Hors v1.

## Transfert vers le worklet

- Transférer les `ArrayBuffer` Int16 au worklet via `postMessage` avec liste de
  **transférables** (déplacement sans copie). Données chargées une fois par
  morceau, non mutées → le transfert convient.
- Ne PAS utiliser `SharedArrayBuffer` en v1 (exige l'isolation cross-origin
  COOP/COEP, qui complique le service de la PWA). À réévaluer seulement si besoin.
- Chargement du module worklet via `audioWorklet.addModule()`. Sous Vite, servir
  le fichier processeur comme module dédié (`new URL('./…', import.meta.url)`).

## Protocole de messages

Thread principal → worklet :

- `loadTracks` : buffers Int16 + méta par piste (channels, longueur, sampleRate)
- `play` / `pause` / `stop`
- `seek` : index d'échantillon cible
- `setLoop` : indices A et B / `clearLoop`
- `setTrackGain` : trackId + gain (mute = 0)

Worklet → thread principal :

- `position` : index de lecture courant, émis de façon **throttlée** (ex. tous les
  N blocs) pour la tête de lecture et la barre de progression. L'UI NE calcule PAS
  la position ; elle la reçoit du worklet.

## Lecture & position

- `play`/`pause`/`seek` agissent sur l'index maître du worklet.
- `seek` = déplacer l'index maître. Toutes les pistes suivent instantanément,
  toujours alignées. Aucune reconstruction de nœud.
- La position affichée vient exclusivement des messages `position` du worklet.

## Mute

- Un tableau de gains par piste dans le worklet. Mute = gain 0 ; unmute = gain
  précédent. Indépendant de la position → le mute survit naturellement au seek et
  à la boucle.
- Appliquer une **rampe courte (quelques ms)** sur les changements de gain pour
  éviter les clics.

## Boucle A→B

- `loopStart` / `loopEnd` en indices d'échantillon. Quand l'index maître atteint
  `loopEnd`, il repart à `loopStart`. Sample-exact.
- Décisions de comportement (figées) :
  - Poser B DERRIÈRE la tête de lecture → saut immédiat à A (= un seek).
  - `seek` EN DEHORS de [A,B] pendant une boucle active → effacer A/B et sortir du
    mode boucle.
- Micro-fondu optionnel au raccord (loopEnd→loopStart) pour supprimer un éventuel
  clic si A ou B tombent en milieu de note. Peut être ajouté après la v1.

## Chargement & erreurs

Flux : fetch des N pistes (parallèle) → décodage+conversion Int16 (séquentiel) →
transfert au worklet → activation de la lecture.

- Si UNE piste échoue (fetch ou décodage) : **bloquer tout le morceau** et
  **signaler quelle piste a échoué**. Une piste manquante = un mix faux, inacceptable.
- États UI : « téléchargement X/N » puis « préparation… » (le décodage ne renvoie
  qu'un état terminal, pas de progression fine).
- Débloquer l'`AudioContext` (`resume()`) sur une interaction utilisateur avant
  toute lecture (contrainte iOS).

## Mémoire

- **Un seul morceau en RAM à la fois.** Au changement de morceau, libérer les
  références des buffers Int16 (côté worklet et principal) pour le GC.
- **Mono quand la source est mono.** Ne jamais up-mixer en stéréo.
- **Estimer le poids AVANT de décoder** : durée × canaux × pistes × 2 octets.
  Avertir si le morceau dépasse le budget, plutôt que de laisser iOS tuer l'onglet
  sans erreur.
- Ordre de grandeur : morceau typique 5 min / 8 pistes mono ≈ ~165 Mo (confortable).
  Pire cas 12 min / 8 pistes mono ≈ ~500 Mo (plafond ; survivable sur iPhone récent,
  risqué sur ancien).
- **Cran de sécurité pour les cas extrêmes** : mode réduit à 32 kHz (créer
  l'`AudioContext` à 32000, `decodeAudioData` rééchantillonne à la baisse → ~30 %
  de RAM en moins, perte à peine audible en répétition). Optionnel, hors v1.

## Hors périmètre / évolutions

- **Ralentissement sans changement de pitch** : nécessite un algorithme de
  time-stretch (phase vocoder / WSOLA) appliqué identiquement à toutes les pistes.
  Non trivial. Laisser la place dans l'architecture, implémenter plus tard.
- Décodeur FLAC WASM direct en Int16 (cf. section décodage).
- `SharedArrayBuffer` si le transfert devient un goulet.
