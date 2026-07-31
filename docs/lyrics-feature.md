# Fonctionnalité Lyrics (prompteur) — spécification

Réf. produit/archi pour Songbook. À déposer dans les connaissances du projet et
à découper en prompts Claude Code. Ne décrit **pas** de code : elle fixe le
modèle de données, les deux modes de défilement, les surfaces UI, le
séquencement d'implémentation et les décisions figées.

Contrainte souveraine du projet (rappel) : la synchro échantillon-exacte prime
sur tout. **Cette feature ne touche ni le moteur audio, ni le worklet, ni le
protocole de messages.** Elle lit la position déjà exposée par React, rien de
plus.

---

## 1. But & périmètre

Afficher les paroles d'un morceau en mode prompteur, pour travailler à la maison
(mains sur l'instrument, regard sur l'écran).

Deux modes, livrés en deux phases :

- **Phase 1 — Autoscroll libre.** Le texte défile à un rythme réglable,
  totalement découplé de l'audio. Fonctionne y compris pour un morceau **sans
  audio** (paroles seules) et pour un morceau dont les paroles ne sont pas
  encore horodatées. C'est le **plancher garanti** de la feature.
- **Phase 2 — Défilement synchronisé (plus tard).** Les paroles horodatées
  (`timeMs` par ligne) sont calées sur la position de lecture réelle du worklet.
  C'est le mode « waouh », mais il n'est pas bloquant pour livrer.

Décisions produit figées dans les échanges précédents :

- **Défilement continu lisse** (regard fixe, ligne active scotchée à ~40 % de
  hauteur), **pas** de karaoké ligne-à-ligne.
- **Pas de détection automatique de BPM.** Abandonné : le BPM mesure le beat,
  pas le débit des paroles ; désynchro dès la première rupture (pont, tenue,
  silence). Le tempo, si un jour utile, se saisit à la main (`tempo?` existe
  déjà dans le modèle).
- **Pas de séparation de sources** (Demucs/Spleeter) en v1. Hors périmètre,
  parké en évolutions.

---

## 2. Modèle de données

Les paroles vivent dans le **document song complet** (`SongRecord`, retourné par
`getSong`), **jamais** dans le `types/song.ts` léger (id/title, réservé aux
listes). Ajout d'un champ optionnel :

```
lyrics?: {
  lines: LyricLine[];        // source d'affichage
  source?: "paste" | "docx" | "pdf";   // provenance, informatif
  updatedAt?: Date;          // pour édition/cache
}

LyricLine = {
  text: string;
  timeMs?: number;           // absent en Phase 1 ; présent = ligne horodatée (Phase 2)
}
```

Notes :

- `lines` est **dérivé** d'un bloc de texte brut découpé sur les sauts de ligne.
  L'éditeur (wizard) travaille sur le bloc ; à la sauvegarde on (re)génère
  `lines`. Une ligne vide reste une ligne (respiration visuelle du prompteur).
- `timeMs` **optionnel** porte les deux mondes d'un seul modèle : absent →
  autoscroll libre ; présent → synchronisé. Ne jamais forcer une valeur par
  défaut dessus.
- Cohérent avec la décision « tracks embarqué » : un seul document, une seule
  lecture, une écriture atomique.

### Découplage « ready » vs « playable » vs « has lyrics »

Point critique introduit par les **morceaux sans audio**. Trois notions
distinctes, à ne plus confondre :

- `status: "ready"` = morceau finalisé et **listé** (`listReadySongs`).
  Un morceau lyrics-only peut être `ready`.
- **playable** = `tracks.length > 0`. Conditionne l'onglet **Musique** et le
  chargement du moteur audio.
- **has lyrics** = `lyrics` présent avec au moins une ligne non vide.
  Conditionne l'onglet **Lyrics**.

Conséquence directe sur `Song.tsx` : le verrou actuel
`playableSong && status === "ready"` gouverne **uniquement** le contenu Musique.
Il ne doit plus gouverner l'écran entier, sinon un morceau lyrics-only n'affiche
rien.

### `trackMode` pour un morceau lyrics-only

`trackMode: "single" | "multi"` ne veut rien dire sans audio. **Décision à
confirmer** (reco par défaut) : rendre `trackMode` non pertinent quand
`tracks` est vide (ne pas l'exiger, ne pas inventer une 3ᵉ valeur). Un
morceau lyrics-only a `tracks: []` et un `trackMode` absent ou ignoré.

---

## 3. Saisie (dans le wizard)

Point d'entrée : l'option **« Enregistrer les paroles »** de `SongAction`
(aujourd'hui désactivée, `aria-disabled`, « Bientôt disponible »).

`SongAction` cesse d'être une première étape linéaire pour devenir un **hub** :
audio / paroles / accords sont des contenus **indépendants et combinables**. Un
morceau peut avoir audio seul, paroles seules, ou les deux.

### Chemins de saisie

1. **Copier-coller (chemin principal).** Un `textarea` où l'utilisateur colle
   son texte. 90 % de la valeur, zéro dépendance. À implémenter en premier et à
   traiter comme le cas nominal.
2. **Upload de fichier (chemin secondaire, étagé).** Par ordre de propreté
   croissante de parsing :
   - `.txt` — trivial, aucune dépendance.
   - `.docx` — via `mammoth`. Parsing relativement propre.
   - `.pdf` — via `pdf.js`. Parsing le plus sale (accords intercalés, colonnes,
     sauts de page). **En dernier, voire jamais.**

   ⚠️ **`mammoth` et `pdf.js` seraient les toutes premières dépendances lourdes
   du projet** (arbre actuellement immaculé). `CLAUDE.md` exige une validation
   explicite avant toute dépendance lourde. **Ne pas les ajouter sans un GO
   dédié.** Livrer le paste d'abord ; décider de l'upload ensuite, format par
   format.

   Quel que soit le format uploadé, il est converti en **texte brut** et
   réinjecté dans le même `textarea` : l'utilisateur relit/corrige avant
   sauvegarde. L'upload n'est qu'un pré-remplissage.

### Orchestration d'import

`songImport` gère aujourd'hui : _draft → upload pistes → ready_. Ajouter un
chemin **sans upload** :

- Morceau lyrics-only : _draft → écrire `lyrics` → ready_ (aucun fichier
  Storage).
- Morceau audio + paroles : les paroles s'écrivent dans le même document, à la
  finalisation ou lors d'une édition ultérieure.

### Édition d'un morceau existant — **décidé : page d'édition dédiée**

Le wizard reste **exclusivement dédié à la création** d'un morceau. L'édition
des paroles d'un morceau finalisé se fait ailleurs : une **page/route dédiée**,
séparée du wizard et du prompteur.

Flux retenu :

1. Depuis le prompteur (onglet Lyrics), un bouton **« Éditer »**.
2. Le clic **quitte le prompteur** (changement de route, pas un onglet ni une
   modale) et ouvre une page d'édition : un `textarea` **pré-rempli** avec les
   paroles courantes (les `lines` rejointes en bloc de texte).
3. L'utilisateur édite, puis sauvegarde → `updateSong` sur le champ `lyrics`
   (re-split du bloc en `lines`).
4. **Retour au prompteur uniquement une fois l'enregistrement effectif** (write
   Firestore résolu), avec les paroles à jour.

Conséquences à gérer explicitement :

- **Sauvegarde asynchrone.** Ne revenir au prompteur qu'après résolution du
  write. Pendant l'écriture : état « enregistrement… » (bouton désactivé). En
  cas d'échec : **rester sur la page d'édition, conserver le texte saisi**,
  afficher l'erreur — ne jamais renvoyer au prompteur sur un échec silencieux.
- **Quitter sans sauver.** Si l'utilisateur quitte la page d'édition (bouton
  retour navigateur) avec des modifications non enregistrées, prévoir au minimum
  une garde « modifications non enregistrées » (optionnel v1, mais à ne pas
  oublier).
- **Audio.** Quitter l'écran lecteur pour la page d'édition démonte `Song` et
  libère le moteur audio (`dispose()`), cohérent avec « un seul morceau en
  RAM ». Au retour, le morceau se recharge normalement. Pour de l'édition de
  texte, c'est acceptable — voire souhaitable (RAM libérée pendant qu'on tape).

Route : nouvelle route protégée (ex. `/song/:songId/lyrics/edit`), dans la
lignée de `router/index.tsx` + `ProtectedRoute`.

---

## 4. Affichage (onglet Lyrics de l'écran lecteur)

### Machinerie d'onglets à construire

Constat : `Tabbar` est **purement statique** (aucun state, aucun `onClick`,
« Musique » actif en dur), et il n'existe **aucun** state d'onglet dans
`Song.tsx`. La feature commence donc par **créer la machinerie d'onglets** :

- Un state d'onglet actif dans `Song.tsx` (`"lyrics" | "musique" | "accords"`).
- `Tabbar` reçoit l'onglet actif + un callback de changement en props.
- Onglet par défaut : **Musique** si le morceau est playable, **Lyrics** si
  lyrics-only. (Accords : hors périmètre de cette spec, laisser l'onglet inerte
  ou masqué.)
- Onglet **Lyrics** cliquable **seulement si** `has lyrics`. Sinon, état vide
  (« Pas encore de paroles » + accès à la saisie via édition si retenue).

### Cycle de vie / perf

Le contenu Lyrics est **monté uniquement quand l'onglet Lyrics est actif**, et
démonté sinon. Bénéfice direct : la boucle d'animation (Phase 2, `rAF`) ne
tourne **que** quand on regarde le texte. Pas de calcul de défilement en
arrière-plan quand on est sur Musique.

✅ Cycle de vie de la saisie **non sauvée** : dissous par le choix d'une page
d'édition **séparée** (§3). La saisie ne cohabite jamais avec le `Tabbar` —
éditer, c'est quitter le prompteur pour une autre route, donc pas de risque
« changement d'onglet efface le brouillon ». Le seul risque résiduel, plus
contenu, est de **quitter la page d'édition sans sauver** (traité en §3).

---

## 5. Phase 1 — Autoscroll libre

### Modèle de vitesse (le point délicat)

**Ne jamais régler une vitesse en pixels/seconde brute.** Le range pilote un
**rythme de lecture** (assimilable à des lignes/minute). Les pixels sont
dérivés :

```
pxParSeconde = rythmeDeLecture × hauteurDeLigne
```

`hauteurDeLigne` dépend de la taille de police choisie (§6). Quand la police
change, `pxParSeconde` se recalcule automatiquement pour **conserver le même
confort de lecture**. L'intention utilisateur (« à quelle vitesse je lis ») est
découplée du rendu (« combien de pixels ça représente »).

### Contrôles

- **`input type="range"`** : règle le rythme de lecture. Un **rythme par défaut**
  est fourni (calibré à la lecture, pas au hasard — à affiner sur les premiers
  morceaux réels). Utilisable même sans audio.
- **Défilement continu lisse** : translation régulière du texte, ligne active
  maintenue à un point fixe de l'écran (~40 % de hauteur).

### Gestes (voir §7 pour la synthèse)

- **Maintenir le doigt immobile (hold)** = geler le défilement tant que le
  contact dure ; reprise à la levée.
- **Glisser verticalement (swipe)** = ajuster le rythme.
- Désambiguïsation hold vs swipe : un contact **immobile** gèle, un contact
  **avec déplacement** ajuste. Distinguables nativement au toucher.

---

## 6. Taille de police

- **Set fermé de tailles** exposé en tokens sémantiques :
  `--lyrics-font-sm / md / lg / xl` (échelle finie, cohérente avec la règle
  « échelles de type = ensembles finis fermés » et « styling par tokens
  uniquement, zéro valeur en dur »).
- UI : **segmented control** (S / M / L / XL), pas de slider continu.
- Effet sur le défilement : la taille change `hauteurDeLigne`, donc `px/s` en
  autoscroll (§5) — recalcul automatique, rythme de lecture préservé.
- En mode synchronisé (Phase 2), la taille est **purement une question de mise
  en page** : elle n'affecte aucun timing (c'est la position qui commande).

---

## 7. Gestes & interactions (synthèse)

La **sémantique des gestes et du range dépend du mode** :

| Contrôle                | Autoscroll libre (Phase 1)     | Synchronisé (Phase 2)                          |
| ----------------------- | ------------------------------ | ---------------------------------------------- |
| `input range`           | règle le **rythme de lecture** | devient un **trim ±ms** (recale l'alignement)  |
| Hold (contact immobile) | **gèle** le défilement         | sans objet (position pilote)                   |
| Swipe vertical          | **ajuste le rythme**           | sans objet (ou navigation manuelle temporaire) |
| Taille de police        | change px/s (rythme préservé)  | pure mise en page, zéro timing                 |

Même composant prompteur, deux sémantiques selon la présence de `timeMs`.

---

## 8. Phase 2 — Défilement synchronisé (plus tard, non bloquant)

À n'implémenter qu'après la Phase 1 validée.

### Source de position

La position vient de l'état React `position` déjà exposé par `useAudioEngine`
(messages `position` du worklet, ~10 Hz en lecture, snap hors-cadence sur
`seek`/boucle). **Le prompteur lit `position` en prop**, comme `AudioControls`.
Il ne s'abonne à rien, ne crée aucun second `AudioContext`, ne touche pas au
`setPositionListener` mono-slot.

### Lissage 60 fps (obligatoire)

Les ~10 messages/s produiraient un défilement saccadé à 10 fps. Découpler
affichage et source :

- À chaque nouvelle `position`, mémoriser `(index, performance.now())` comme
  **ancre**.
- Dans une boucle `requestAnimationFrame`, estimer entre deux ancres :
  `indexEstimé = ancre.index + (now - ancre.temps) × sampleRate` (uniquement
  quand ça joue).
- Défilement lisse à 60 fps ; les messages hors-cadence (seek/boucle) donnent le
  **snap instantané** gratuitement ; sur pause, geler ; le drift est corrigé
  ~10×/s, invisible.

### Trim ±ms

Le range ne règle plus une vitesse : il applique un **décalage d'avance/retard**
(±X ms) pour recaler un alignement qui dériverait. C'est aussi le filet des
morceaux single-track alignés sur le mix (alignement plus grossier).

### Agent d'alignement (automatisation, hors runtime)

Génération des `timeMs` **hors de la PWA** (modèles trop lourds pour le
navigateur), en **batch à l'import** :

1. Entrée : les paroles collées (texte **connu**) + l'audio.
2. **Forced alignment** (type WhisperX) — on **place** un texte connu dans le
   temps, on ne transcrit pas à l'aveugle → robuste même sur un mix dense.
   - Si une piste `instrument = chant/voix` isolée existe → aligner dessus
     (excellent).
   - Sinon (single-track / pas de stem voix) → aligner sur le mix (correct,
     trim pour peaufiner).
3. Sortie : `[{ text, timeMs }]` écrit dans le document Firestore.

Se loge dans le wizard d'import, hors du moteur audio. Coche la case « agent
IA » sans polluer le runtime. **Hors périmètre Phase 1.**

Trois niveaux de qualité, un seul modèle de données :
stem voix propre → alignement excellent ; mix + paroles connues → correct + trim ;
rien → autoscroll libre.

---

## 9. Hors périmètre de cette feature

- Détection automatique de BPM (abandonnée, cf. §1).
- Séparation de sources (Demucs/Spleeter) — parkée en évolutions, comme le
  décodeur FLAC WASM.
- Onglet **Accords** — l'UI existe (Tabbar, SongAction) mais le contenu n'est
  pas spécifié ici.
- Ralentissement sans changement de pitch — déjà hors périmètre v1 du projet.

---

## 10. Séquencement d'implémentation (pour Claude Code)

Ordre imposé par le projet : **docs → types → implémentation.** Découper en
sessions courtes, une préoccupation par session.

1. **Types & modèle.** Ajouter `lyrics?` à `SongRecord` (+ `LyricLine`).
   Introduire le découplage ready / playable / has-lyrics au niveau des types
   et helpers de `songs.ts`. Aucune UI encore.
2. **Machinerie d'onglets.** State d'onglet dans `Song.tsx`, `Tabbar` piloté par
   props (onglet actif + callback), onglet par défaut selon playable/lyrics-only,
   Lyrics cliquable seulement si `has lyrics`. Découpler le verrou
   `playableSong && ready` pour qu'il ne gouverne que la Musique.
3. **Saisie wizard — paste uniquement.** Activer « Enregistrer les paroles »
   dans `SongAction`, étape `textarea`, chemin d'import sans upload
   (draft → lyrics → ready). **Pas de dépendance d'upload à ce stade.**
4. **Affichage prompteur — autoscroll libre (Phase 1).** Composant Lyrics enfant
   de `Song`, monté seulement quand l'onglet est actif ; défilement continu
   lisse, range = rythme de lecture, tailles de police en tokens, gestes
   hold/swipe.
5. **Page d'édition dédiée (§3).** Route protégée séparée, `textarea`
   pré-rempli, sauvegarde asynchrone (`updateSong`), retour au prompteur sur
   succès uniquement. Le wizard n'est pas touché : il reste dédié à la création.
6. **(GO explicite requis)** Upload `.txt` → `.docx` → `.pdf`, format par format,
   avec validation de dépendance pour `mammoth`/`pdf.js`.
7. **(Plus tard)** Phase 2 : ancre + rAF, trim ±ms, agent d'alignement à l'import.

### Prohibitions à rappeler dans chaque prompt Claude Code

- **Ne pas modifier** `src/audio/` (moteur), le worklet, ni le protocole de
  messages. La feature lit `position` en prop, point.
- **Ne pas créer** de second `AudioContext` ni appeler `useAudioEngine` une
  deuxième fois.
- **Styling par tokens uniquement**, zéro valeur en dur (couleurs, tailles,
  espacements).
- **TypeScript strict, pas de `any`, pas de `!`.**
- **Aucune dépendance lourde** (`mammoth`, `pdf.js`, autre) sans GO explicite.
- Icônes exclusivement `react-icons/io5`.

---

## 11. Décisions à confirmer

1. **`trackMode` pour un morceau lyrics-only** : non pertinent quand `tracks`
   est vide (reco) — confirmer qu'on n'introduit pas de 3ᵉ valeur.
2. **Upload de fichiers** : va-t-on jusqu'au `.docx` / `.pdf`, ou paste + `.txt`
   suffisent pour 6 utilisateurs sur leurs propres morceaux ?

**Décidé** : édition des paroles via **page dédiée** séparée du wizard (§3) ;
défilement continu lisse ; autoscroll d'abord ; création (audio et/ou paroles)
dans le wizard ; tailles de police en set fermé de tokens.
