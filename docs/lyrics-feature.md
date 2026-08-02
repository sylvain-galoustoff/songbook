# Fonctionnalité Lyrics (prompteur) — spécification

Réf. produit/archi pour Songbook. À déposer dans `docs/` **et** dans les
connaissances du Projet claude.ai. Ne décrit **pas** de code : elle fixe le
modèle de données, le modèle d'actions du wizard, les deux modes de défilement,
les surfaces UI, le séquencement d'implémentation et les décisions figées.

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
  Mode « waouh », non bloquant pour livrer.

Décisions produit figées :

- **Défilement continu lisse** (regard fixe, ligne active scotchée à ~40 % de
  hauteur), **pas** de karaoké ligne-à-ligne.
- **Pas de détection automatique de BPM.** Le BPM mesure le beat, pas le débit
  des paroles ; désynchro dès la première rupture. Le tempo, si utile un jour,
  se saisit à la main (`tempo?` existe déjà).
- **Pas de séparation de sources** (Demucs/Spleeter) en v1. Parké en évolutions.

---

## 2. Modèle de données

Les paroles vivent dans le **document song complet** (`SongRecord`, retourné par
`getSong`), **jamais** dans le `types/song.ts` léger (id/title, réservé aux
listes).

### Champs ajoutés / modifiés sur `SongRecord`

```
lyrics?: {
  lines: LyricLine[];        // source d'affichage — SEUL champ en v1
}

LyricLine = {
  text: string;              // "" est une ligne légitime (séparateur couplet/refrain)
  timeMs?: number;           // absent en Phase 1 ; présent = horodaté (Phase 2)
}

trackMode?: "single" | "multi";   // DEVIENT OPTIONNEL — absent quand tracks est vide
```

Décisions figées sur le modèle :

- **`lyrics` minimal.** Uniquement `{ lines }` en v1. Pas de `source`, pas de
  `updatedAt` : aucun consommateur tant que l'upload n'existe pas. On étendra
  (`source: "paste" | "docx" | "pdf"`) le jour où l'upload arrive, pas avant.
  Zéro type mort.
- **`lines` dérivé d'un bloc de texte.** L'éditeur travaille sur un bloc brut ;
  à la sauvegarde on split sur `\n` **sans filtrer les lignes vides** (une ligne
  vide = `{ text: "" }`, respiration visuelle du prompteur). À l'affichage/
  édition, on rejoint les `lines` en bloc avec `\n`.
- **`timeMs` optionnel** porte les deux mondes d'un seul modèle : absent →
  autoscroll libre ; présent → synchronisé. Ne jamais forcer de valeur défaut.
- **`trackMode` optionnel.** `"single" | "multi"` n'a aucun sens sans audio. Un
  morceau lyrics-only a `tracks: []` et **pas** de `trackMode` (pas de 3ᵉ valeur
  fantôme). Il se remplit quand une action audio est appliquée au morceau.
- Cohérent avec « tracks embarqué » : un seul document, une lecture, une
  écriture atomique.

### Trois notions distinctes — fonctions pures dans `songs.ts`

À ne plus confondre. **Zéro champ dérivé stocké en base** — rien à maintenir :

- `status: "ready"` = morceau finalisé et **listé** (`listReadySongs`). Un
  lyrics-only peut être `ready`.
- **`isPlayable(song)`** = `song.tracks.length > 0`. Conditionne l'onglet
  **Musique** et le chargement du moteur audio.
- **`hasLyrics(song)`** = `lyrics` présent avec au moins une ligne non vide.
  Conditionne l'onglet **Lyrics**.

Deux fonctions pures exportées de `songs.ts`, appelées à l'affichage. Le verrou
actuel `playableSong && status === "ready"` de `Song.tsx` ne doit plus gouverner
l'écran entier — **uniquement** le contenu Musique.

---

## 3. Modèle d'actions du wizard (RÉFRAME — principe central de la saisie)

**Principe abandonné : « le wizard = la création d'un morceau ».**
**Principe adopté et gravé : un wizard = UNE action, rejouable.**

Une **action** produit ou modifie un contenu d'un morceau. Trois actions :

1. **Ajouter de l'audio** (simple ou multi-piste).
2. **Ajouter des paroles.**
3. **Ajouter des accords** (parké — hors périmètre de cette spec).

### Règles du modèle d'actions

- **Un morceau naît d'une action.** Créer un nouveau morceau = lancer l'une des
  actions sur du vide. Il n'existe **pas** de morceau vide sans contenu.
- **Les actions sont rejouables sur un morceau existant.** Un lyrics-only reçoit
  l'action audio ; un morceau audio sans paroles reçoit l'action paroles. Chaque
  action cible indifféremment un morceau neuf ou déjà finalisé. La distinction
  création/édition **disparaît** : il n'y a que des actions appliquées à un
  morceau.
- **Titre = prélude partagé.**
  - Morceau **neuf** : on **nomme d'abord** (écran titre), puis on choisit
    l'action. L'écran `SongAction` actuel devient exactement ce **sélecteur
    d'action**.
  - Morceau **existant** : pas de nommage, on saute **directement** dans
    l'action ciblée.
- **3 wizards indépendants.** On en construit 2 : audio (existe déjà en grande
  partie) et paroles (neuf). Accords parké.

### Action « paroles » — édition fusionnée

L'action paroles **absorbe l'édition** : il n'y a **pas** de route d'édition
séparée. Relancer l'action paroles sur un morceau qui en a déjà ouvre la surface
de saisie **pré-remplie**.

- **Points d'entrée unifiés** vers la même surface :
  - bouton **« Éditer »** du prompteur (onglet Lyrics, paroles présentes) ;
  - bouton **« créer »** de l'état vide de l'onglet Lyrics (paroles absentes) ;
  - action paroles depuis le sélecteur d'un morceau neuf.
- **Saisie :**
  - Morceau neuf / première saisie : choix **coller** (textarea, chemin
    principal) ou upload (parké, cf. §9).
  - Édition (paroles déjà présentes) : on entre **directement sur le textarea
    pré-rempli** (les `lines` rejointes en bloc), sans repasser par « coller ou
    uploader ».
- **Sauvegarde** (comportement gravé, surtout au retour depuis le prompteur) :
  - `updateSong` sur le champ `lyrics` (re-split du bloc en `lines`).
  - **Retour au prompteur uniquement une fois le write Firestore résolu.**
  - Pendant l'écriture : état « enregistrement… », bouton désactivé.
  - **En cas d'échec : rester sur la page, conserver le texte saisi, afficher
    l'erreur.** Jamais de retour au prompteur sur un échec silencieux.
  - Quitter avec des modifications non enregistrées (retour navigateur) : garde
    « modifications non enregistrées » (optionnel v1, à ne pas oublier).
- **Audio pendant l'édition :** quitter l'écran lecteur pour la surface d'édition
  démonte `Song` et libère le moteur (`dispose()`), cohérent avec « un seul
  morceau en RAM ». Au retour, le morceau se recharge. Acceptable, voire
  souhaitable pour de l'édition de texte.
- **Route :** route protégée dédiée (ex. `/song/:songId/lyrics/edit`), dans la
  lignée de `router/index.tsx` + `ProtectedRoute`.

### Action « audio » sur un morceau existant

Le flux audio (validation FLAC, upload séquentiel, choix single/multi) vit
aujourd'hui **dans** le wizard de création. Le réframe impose de l'**extraire**
en une brique réutilisable capable de cibler soit un morceau neuf, soit un
morceau déjà là. C'est là que `trackMode` se remplit pour un ex-lyrics-only.

- ⚠️ **Garde-fou.** Ajouter de l'audio à un lyrics-only déjà `ready` doit
  **appendre les pistes sans le recasser en `draft` à l'aveugle**. Ne pas
  reproduire mécaniquement le cycle draft→upload→ready d'une création si le
  morceau est déjà finalisé.

### Orchestration d'écriture — asymétrie assumée

- **Audio** : crée un `draft` immédiatement (upload séquentiel oblige,
  comportement actuel).
- **Paroles** : rien à uploader → écriture d'un coup à la sauvegarde
  (draft→ready en un write), **zéro draft orphelin** si l'utilisateur abandonne.

---

## 4. Affichage (onglet Lyrics de l'écran lecteur)

### Machinerie d'onglets à construire

Constat : `Tabbar` est **purement statique** (aucun state, aucun `onClick`,
« Musique » actif en dur), et il n'existe **aucun** state d'onglet dans
`Song.tsx`. La feature commence donc par **créer la machinerie d'onglets** :

- State d'onglet actif dans `Song.tsx` (`"lyrics" | "musique" | "accords"`).
- `Tabbar` reçoit l'onglet actif + un callback de changement en props.
- **Onglet par défaut : toujours Musique** (écran-roi, uniforme pour tous les
  morceaux). Un lyrics-only ouvre donc sur Musique-vide (cf. états vides).
- Onglet **Lyrics** cliquable **seulement si `hasLyrics`**.
- Onglet **Accords** parké : inerte ou masqué (à régler au rendu, non bloquant).

> Note produit assumée : ouvrir un lyrics-only sur son onglet audio _vide_ est un
> choix (uniformité), pas un oubli. Si ça gratte à l'usage, bascule « défaut =
> onglet qui a du contenu » = un `if` d'une ligne.

### États vides

- **Onglet Musique sans audio** (`!isPlayable`) : message « Il n'y a pas encore
  de piste audio » + **bouton d'upload** → lance l'action audio sur ce morceau.
- **Onglet Lyrics sans paroles** (`!hasLyrics`, si l'onglet est atteint) :
  « Pas de paroles » + **bouton créer** → lance l'action paroles sur ce morceau.

### Cycle de vie / perf

Le contenu Lyrics est **monté uniquement quand l'onglet Lyrics est actif**,
démonté sinon. La boucle d'animation (Phase 2, `rAF`) ne tourne **que** quand on
regarde le texte.

✅ Saisie non sauvée : **dissoute** par le modèle d'actions. Éditer, c'est
quitter le prompteur pour une autre route — la saisie ne cohabite jamais avec le
`Tabbar`, donc pas de risque « changement d'onglet efface le brouillon ». Seul
risque résiduel : quitter la page d'édition sans sauver (traité en §3).

---

## 5. Phase 1 — Autoscroll libre

### Modèle de vitesse (le point délicat)

**Ne jamais régler une vitesse en pixels/seconde brute.** Le range pilote un
**rythme de lecture** (lignes/minute). Les pixels sont dérivés :

```
pxParSeconde = rythmeDeLecture × hauteurDeLigne
```

`hauteurDeLigne` dépend de la taille de police (§6). Quand la police change,
`pxParSeconde` se recalcule pour **conserver le même confort de lecture**.
L'intention (« à quelle vitesse je lis ») est découplée du rendu (« combien de
pixels »).

### Valeurs de départ (arbitraires, à affiner à l'usage)

- **Rythme par défaut : ~20 lignes/minute** (≈ 1 ligne / 3 s).
- **Range : ~8 à ~40 lignes/minute.**

Ces chiffres sont un point de départ à calibrer sur les vrais morceaux, pas une
vérité gravée.

### Contrôles

- **`input type="range"`** : règle le rythme de lecture. Utilisable même sans
  audio.
- **Défilement continu lisse** : translation régulière, ligne active maintenue à
  ~40 % de hauteur.

### Gestes (voir §7)

- **Contact immobile (hold)** = geler le défilement tant que le contact dure ;
  reprise à la levée.
- **Glissement vertical (swipe)** = ajuster le rythme.
- Désambiguïsation : contact **immobile** gèle, contact **avec déplacement**
  ajuste. Distinguables nativement au toucher.

---

## 6. Taille de police

- **Set fermé de 3 tailles**, tokens sémantiques (échelle finie, styling par
  tokens uniquement, zéro valeur en dur) :
  - `--lyrics-font-sm: 1rem` — **défaut**
  - `--lyrics-font-md: 1.5rem`
  - `--lyrics-font-lg: 2rem`
- UI : **segmented control** à 3 crans (S / M / L), pas de slider continu.
- Effet sur le défilement : la taille change `hauteurDeLigne`, donc `px/s` en
  autoscroll (§5) — recalcul automatique, rythme de lecture préservé.
- En mode synchronisé (Phase 2), la taille est **pure mise en page** : elle
  n'affecte aucun timing (c'est la position qui commande).

---

## 7. Gestes & interactions (synthèse)

La **sémantique des gestes et du range dépend du mode** :

| Contrôle                | Autoscroll libre (Phase 1)     | Synchronisé (Phase 2)                    |
| ----------------------- | ------------------------------ | ---------------------------------------- |
| `input range`           | règle le **rythme de lecture** | devient un **trim ±ms**                  |
| Hold (contact immobile) | **gèle** le défilement         | sans objet (position pilote)             |
| Swipe vertical          | **ajuste le rythme**           | sans objet (ou nav. manuelle temporaire) |
| Taille de police        | change px/s (rythme préservé)  | pure mise en page, zéro timing           |

Même composant prompteur, deux sémantiques selon la présence de `timeMs`.

---

## 8. Préférences d'affichage

- **Taille de police + vitesse d'autoscroll mémorisées en `localStorage`**
  (par appareil).
- Pour 6 personnes sur leur téléphone perso, « par appareil » ≈ « par
  utilisateur ». Un même compte sur tel + desktop aura deux réglages distincts —
  invisible en pratique.
- **Évolution possible** (non v1) : migration vers `users/{uid}` en Firestore
  pour une vraie synchro multi-appareils (créerait la 1ʳᵉ collection `users` du
  projet + ses règles). À faire seulement si le besoin se fait sentir.
- **Sous-note** : la vitesse est mémorisée globalement, mais chaque morceau a son
  débit naturel. Une vitesse **par morceau** pourra devenir souhaitable un jour.
  Non bloquant, noté.

---

## 9. Phase 2 — Défilement synchronisé (plus tard, non bloquant)

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

- À chaque nouvelle `position`, mémoriser `(index, performance.now())` = **ancre**.
- Dans une boucle `requestAnimationFrame`, estimer entre deux ancres :
  `indexEstimé = ancre.index + (now − ancre.temps) × sampleRate` (uniquement
  quand ça joue).
- Défilement lisse à 60 fps ; les messages hors-cadence (seek/boucle) donnent le
  **snap instantané** gratuitement ; sur pause, geler ; le drift est corrigé
  ~10×/s, invisible.

### Trim ±ms

Le range applique un **décalage d'avance/retard** (±X ms) pour recaler un
alignement qui dérive. C'est aussi le filet des morceaux single-track alignés
sur le mix (alignement plus grossier).

### Agent d'alignement (automatisation, hors runtime)

Génération des `timeMs` **hors de la PWA** (modèles trop lourds pour le
navigateur), en **batch à l'import** :

1. Entrée : paroles collées (texte **connu**) + audio.
2. **Forced alignment** (type WhisperX) — on **place** un texte connu dans le
   temps, on ne transcrit pas à l'aveugle → robuste même sur un mix dense.
   - Piste `instrument = chant/voix` isolée → aligner dessus (excellent).
   - Sinon (single-track / pas de stem voix) → aligner sur le mix (correct,
     trim pour peaufiner).
3. Sortie : `[{ text, timeMs }]` écrit dans le document Firestore.

Se loge dans l'action d'import, hors du moteur audio. **Hors périmètre Phase 1.**

Trois niveaux de qualité, un seul modèle : stem voix propre → excellent ; mix +
paroles connues → correct + trim ; rien → autoscroll libre.

---

## 10. Hors périmètre de cette feature

- Détection automatique de BPM (abandonnée).
- Séparation de sources (Demucs/Spleeter) — parkée en évolutions.
- Onglet **Accords** — 3ᵉ action, non spécifiée ici.
- Upload de fichiers paroles (`.txt` / `.docx` / `.pdf`) — cf. prohibitions §11.
- Ralentissement sans changement de pitch — déjà hors v1 du projet.

---

## 11. Séquencement d'implémentation (pour Claude Code)

Ordre imposé : **docs → types → implémentation.** Sessions courtes, une
préoccupation par session.

1. **Types & modèle.** `lyrics?` + `LyricLine` sur `SongRecord` ; `trackMode`
   passe optionnel ; fonctions pures `isPlayable` / `hasLyrics` dans `songs.ts`.
   **Aucune UI.**
2. **Machinerie d'onglets.** State d'onglet dans `Song.tsx`, `Tabbar` piloté par
   props (onglet actif + callback), défaut = Musique, Lyrics cliquable seulement
   si `hasLyrics`. Découpler le verrou `playableSong && ready` pour qu'il ne
   gouverne que la Musique. États vides Musique (bouton upload) et Lyrics
   (bouton créer).
3. **Action paroles — coller uniquement.** Sélecteur d'action (`SongAction`)
   activé pour « paroles », étape `textarea`, écriture sans upload
   (draft → lyrics → ready). Prélude titre pour un morceau neuf.
   **Pas de dépendance d'upload.**
4. **Prompteur — autoscroll libre (Phase 1).** Composant Lyrics enfant de
   `Song`, monté seulement quand l'onglet est actif ; défilement continu lisse,
   range = rythme de lecture, tailles de police en tokens, gestes hold/swipe,
   prefs en `localStorage`.
5. **Surface d'édition (route dédiée §3).** `textarea` pré-rempli, sauvegarde
   async (`updateSong`), retour au prompteur sur succès uniquement. Points
   d'entrée unifiés (Éditer / créer / action neuve).
6. **Action audio réutilisable.** Extraire la brique upload pour cibler un
   morceau existant (append de pistes, garde-fou anti-recast-draft).
7. **(GO explicite requis)** Upload paroles `.txt` → `.docx` → `.pdf`, format
   par format, validation de dépendance pour `mammoth`/`pdf.js`.
8. **(Plus tard)** Phase 2 : ancre + rAF, trim ±ms, agent d'alignement.

### Prohibitions à rappeler dans chaque prompt Claude Code

- **Ne pas modifier** `src/audio/` (moteur), le worklet, ni le protocole de
  messages. La feature lit `position` en prop, point.
- **Ne pas créer** de second `AudioContext` ni appeler `useAudioEngine` deux fois.
- **Styling par tokens uniquement**, zéro valeur en dur (couleurs, tailles,
  espacements).
- **TypeScript strict, pas de `any`, pas de `!`.**
- **Aucune dépendance lourde** (`mammoth`, `pdf.js`, autre) sans GO explicite.
- Icônes exclusivement `react-icons/io5`.

---

## 12. Décisions à confirmer (résiduel)

1. **Upload de fichiers paroles** : va-t-on jusqu'au `.docx` / `.pdf`, ou paste
   - `.txt` suffisent pour 6 utilisateurs sur leurs propres morceaux ?

**Décidé dans ce fil :** wizard = 1 action (audio / paroles / accords),
rejouable sur morceau neuf ou existant · un morceau naît d'une action · titre =
prélude partagé · édition fusionnée dans l'action paroles (route dédiée, save
async) · défaut onglet = Musique · états vides avec bouton d'action ·
`trackMode` optionnel · `lyrics: { lines }` minimal · `LyricLine = { text }`,
ligne vide légitime · `isPlayable` / `hasLyrics` fonctions pures, zéro champ
stocké · tailles police sm 1rem (défaut) / md 1.5rem / lg 2rem · autoscroll
~20 l/min (range 8–40) · prefs en `localStorage` · défilement continu lisse ·
autoscroll avant sync · accords parké.
