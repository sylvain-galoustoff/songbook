# État des lieux — Songbook

Constat factuel de l'état réel du dépôt à la date du jour. Document généré,
écrasé à chaque exécution de `/etat-des-lieux`. Aucune recommandation
d'amélioration ci-dessous : uniquement ce qui existe, ce qui manque, ce qui
diverge de la spec.

---

## 1. Arborescence

`src/` (2 niveaux), description en une ligne, nombre de lignes par fichier.

```
src/
├── audio/                          moteur audio, hors React (cf. §3)
│   ├── audioEngine.ts              204  classe AudioEngine : AudioContext + AudioWorkletNode, chargement/décodage
│   ├── trackProvider.ts             31  fournisseur d'octets Firebase Storage (fetch, pas de streaming)
│   ├── trackValidation.ts          111  validation locale (sampleRate/durée/hash) d'un FLAC avant upload
│   └── worklet/
│       ├── mixer-processor.ts      256  AudioWorkletProcessor : mixage, index maître, mute, boucle A→B
│       └── protocol.ts              23  types des messages thread principal ↔ worklet
├── components/                     UI réutilisable
│   ├── Button/                      61+55  bouton (variantes primary/secondary, rendu <button> ou <Link>)
│   ├── Header/                      43+64  en-tête (retour, titre/sous-titre, déconnexion)
│   ├── InstrumentIcon/              25+28  icône SVG masquée par instrument (couleur pilotée par token)
│   ├── Loader/                      36+70  spinner + barre de progression (déterministe ou non)
│   ├── LyricsPasteForm/             78+45  textarea de saisie/édition de paroles, partagé création+édition
│   ├── PwaUpdatePrompt/             33+37  bannière de mise à jour du service worker (pas d'auto-reload)
│   ├── SongCard/                    21+41  lien vers un morceau dans la liste d'accueil
│   ├── SongList/                    29+22  liste des morceaux (état vide inclus)
│   └── TextField/                   30+47  champ texte labellisé avec icône
├── firebase/                        accès Firebase, aucun serveur custom
│   ├── config.ts                    19  initialisation app/auth/firestore/storage depuis les env VITE_*
│   ├── songImport.ts               115  orchestration import (draft → upload pistes → ready), pas d'accès direct SDK
│   ├── songs.ts                    253  CRUD Firestore songs, isPlayable/hasLyrics/linesFromBlock/joinLinesToBlock
│   └── trackUpload.ts               54  upload/suppression des fichiers FLAC dans Storage
├── hooks/
│   ├── AuthProvider.tsx             18  contexte auth (onAuthStateChanged)
│   ├── NewSongWizardProvider.tsx    49  état du wizard de création (titre, mode, piste en cours, pistes confirmées)
│   ├── useAudioEngine.ts           179  hook React autour d'AudioEngine (status, position, mute, boucle, seek)
│   ├── useAuthUser.ts               19  accès au contexte auth
│   ├── useNewSongWizard.ts          31  accès au contexte wizard
│   └── useRotatingMessage.ts        25  message d'attente qui tourne toutes les N ms
├── router/
│   ├── index.tsx                    69  déclaration des routes (createBrowserRouter)
│   ├── ProtectedRoute.tsx           17  redirige vers /login si non authentifié
│   └── PublicOnlyRoute.tsx          17  redirige vers / si déjà authentifié
├── styles/                          reset.scss, tokens.css, index.scss — pas de composants ici
├── types/
│   ├── instrument.ts                14  liste fermée des 5 instruments (drums/bass/guitar/keyboard/vocals)
│   ├── song.ts                       4  type `Song` minimal ({id, title}), utilisé uniquement par Home/SongList/SongCard
│   └── track.ts                     16  TrackModeChoice, WizardTrack, SINGLE_TRACK_INSTRUMENT_ID
└── views/
    ├── Home/                        63+29  liste des morceaux ready + bouton "Ajouter une compo"
    ├── LogIn/                       70+35  connexion email/mot de passe (aucun formulaire d'inscription)
    ├── NewSong/                     wizard de création, 7 écrans sous NewSongWizardProvider
    │   ├── LyricsText/              47+18  action "paroles" sur morceau NEUF (coller, écriture ready directe)
    │   ├── Recap/                  148+114 récap des pistes ajoutées, upload séquentiel + finalize
    │   ├── SelectInstrument/        66+74  choix de l'instrument pour la piste en cours
    │   ├── SelectTrack/            167+50  sélection du fichier FLAC + validation locale
    │   ├── SongAction/              88+79  sélecteur d'action (audio / paroles / accords parqué)
    │   ├── SongName/                48+25  saisie du titre (prélude partagé)
    │   └── TrackMode/               71+73  choix single/multi
    └── Song/                        écran lecteur (prompteur)
        ├── AudioControls.tsx       112+109  play/pause, barre de seek, bouton boucle 3 états
        ├── InstrumentGrid.tsx       52+64  grille de mute par instrument
        ├── LyricsEdit/             101+30  page d'édition dédiée des paroles (route protégée, ajoutée cette session)
        ├── LyricsPrompter.tsx      264+131  autoscroll libre, gestes hold/swipe, tailles de police
        ├── Song.tsx                181+54  écran lecteur : onglets, chargement, états vides
        └── Tabbar.tsx               48+41  navigation Lyrics/Musique/Accords (Accords inerte)
```

Pas de dossier `tests/`, pas de fichier `*.test.*` ni `*.spec.*` dans tout le
dépôt. Pas de `.github/workflows` : aucune CI configurée.

---

## 2. Dépendances

**`dependencies`**

| Paquet | Version |
|---|---|
| `firebase` | ^12.16.0 |
| `react` | ^19.2.7 |
| `react-dom` | ^19.2.7 |
| `react-icons` | ^5.7.0 |
| `react-router` | ^8.2.0 |
| `@fontsource/alegreya-sans` | ^5.3.0 |
| `@fontsource/work-sans` | ^5.3.0 |

**`devDependencies`**

| Paquet | Version |
|---|---|
| `typescript` | ~6.0.2 |
| `vite` | ^8.1.1 |
| `@vitejs/plugin-react` | ^6.0.3 |
| `vite-plugin-pwa` | ^1.3.0 |
| `eslint` | ^10.6.0 |
| `typescript-eslint` | ^8.62.0 |
| `eslint-plugin-react-hooks` | ^7.1.1 |
| `eslint-plugin-react-refresh` | ^0.5.3 |
| `@eslint/js` | ^10.0.1 |
| `globals` | ^17.7.0 |
| `sass-embedded` | ^1.100.0 |
| `@types/node` | ^24.13.2 |
| `@types/react` | ^19.2.17 |
| `@types/react-dom` | ^19.2.3 |

Aucun champ `engines` dans `package.json` : aucune contrainte Node/npm
déclarée. Environnement d'exécution constaté : Node v22.23.1, npm 10.9.8.

Conforme à CLAUDE.md « Stack » : React + Vite + TypeScript + Firebase
uniquement, aucun framework/bundler additionnel, pas de serveur custom.

---

## 3. Moteur audio

### Fichiers et signatures publiques

**`src/audio/audioEngine.ts`** — `export class AudioEngine`
- `constructor()` — crée `new AudioContext({ sampleRate: 44100 })`, lance `setupWorklet()`.
- `setPositionListener(listener)`, `setLoopListener(listener)`
- `getDurationSamples(): number`
- `async loadTracks(sources, provider, onProgress?): Promise<TrackSource[]>`
- `async play(): Promise<void>` — `context.resume()` puis `postMessage({type:"play"})`
- `pause(): void`, `setTrackMuted(id, muted): void`, `seek(index): void`, `toggleLoopPoint(): void`
- `dispose(): void` — `workletNode.disconnect()` + `context.close()`
- `export class TrackLoadError extends Error` — porte `trackId`/`instrument` de la piste fautive.

**`src/audio/worklet/mixer-processor.ts`** — `class MixerProcessor extends AudioWorkletProcessor`, enregistré sous `"mixer-processor"`. Toute la logique (mixage, gains, index maître, boucle) vit ici ; rien n'est dupliqué côté thread principal.

**`src/audio/worklet/protocol.ts`** — types purs, aucune logique :
```
MainToWorkletMessage = loadTracks | play | pause | setTrackGain | seek | toggleLoopPoint
WorkletToMainMessage = position | loop
```

**`src/audio/trackProvider.ts`** — `export class FirebaseTrackProvider implements TrackByteProvider` : un seul appel `getBytes()` par piste (téléchargement intégral, aucun streaming).

**`src/audio/trackValidation.ts`** — `export async function validateTrackFile(file, reference): Promise<TrackValidationResult>` : décode dans un `AudioContext` temporaire, hache (SHA-256) avant décodage, compare fréquence/durée à une référence, ferme le contexte dans un `finally`.

### Protocole de messages effectivement implémenté

Identique à `protocol.ts` des deux côtés — aucun message fantôme, aucun message documenté mais non câblé. `loadTracks` transfère les `ArrayBuffer` Int16 avec liste de transférables (`transfer` dans `postMessage`). `position`/`loop` sont les deux seuls messages worklet → principal ; l'UI ne calcule ni ne déduit la position ou l'état de boucle ailleurs que dans ces handlers (`AudioEngine.setupWorklet`).

### Stubs et code mort

- **Aucun stub identifié** dans `src/audio/` : chaque fonction exportée a une implémentation complète et est appelée par au moins un point du reste de l'app (`useAudioEngine.ts` pour `AudioEngine`/`FirebaseTrackProvider`, `SelectTrack.tsx`/wizard pour `trackValidation.ts`).
- Micro-fondu au raccord de boucle (mentionné « optionnel, hors v1 » dans `.claude/rules/audio-engine.md`) : **absent**, cohérent avec la spec qui ne l'exige pas encore.
- Fin de piste : `process()` arrête la lecture (`this.playing = false`) quand `masterIndex >= trackLength`, sans bouclage automatique — commentaire explicite dans le code confirmant que c'est voulu pour cette version.
- `src/types/song.ts` (`Song { id, title }`) n'est pas du code audio mais mérite d'être signalé comme un type parallèle et plus étroit que `SongRecord` (`songs.ts`), utilisé uniquement par `Home`/`SongList`/`SongCard` — pas un doublon accidentel (Home ne projette que ces deux champs), mais deux définitions du « morceau » coexistent dans le code.

---

## 4. Écarts avec la spécification

| Point de spec | Statut | Fichier(s) |
|---|---|---|
| Un seul `AudioContext` (44100 Hz) + un seul `AudioWorkletNode` mixant toutes les pistes | Respecté | `audioEngine.ts` |
| Aucun `AudioBufferSourceNode`, aucune balise `<audio>` | Respecté | `audio/**` (grep négatif sur tout `src/`) |
| Aucun streaming audio | Respecté | `trackProvider.ts` (`getBytes`, pas `getStream`) |
| Pistes en PCM Int16, jamais `AudioBuffer` Float32 conservé | Respecté | `audioEngine.ts` (`float32ToInt16`, Float32 non retenu au-delà de la conversion) |
| Décodage séquentiel, fetch parallèle | Respecté | `audioEngine.ts` (`Promise.all` pour le fetch, boucle `for`+`await` pour le décodage) |
| Index de lecture maître unique, source de vérité | Respecté | `mixer-processor.ts` (`masterIndex`) |
| Mute = gain 0 dans le mixage, rampe courte anti-clic | Respecté | `mixer-processor.ts` (`GAIN_RAMP_DURATION_SECONDS = 0.005`) |
| Boucle A→B, 3 états sur un seul contrôle `toggleLoopPoint` | Respecté | `mixer-processor.ts` (`toggleLoopPoint`) |
| B posé derrière/sur la tête → seek immédiat vers A | Respecté | `mixer-processor.ts` (`toggleLoopPoint`, cas `masterIndex <= loopStart`) |
| Seek hors [A,B] pendant boucle active → efface A/B | Respecté | `mixer-processor.ts` (`seek`) |
| Position affichée exclusivement via message `position` du worklet | Partiel | `useAudioEngine.ts` (`seek()` écrit `position` localement pendant le drag, avant confirmation worklet — écart mineur assumé pour la réactivité du glisser, pas un recalcul de position de lecture) |
| Transfert des buffers via `postMessage` + transférables | Respecté | `audioEngine.ts` (`transferables` passé à `postMessage`) |
| Pas de `SharedArrayBuffer` en v1 | Respecté | absent de tout `src/` |
| Chargement worklet via `audioWorklet.addModule()` | Respecté (variante technique) | `audioEngine.ts` importe via `?worker&url` plutôt que `new URL('./…', import.meta.url)` littéral — même résultat (module séparé), formulation Vite différente de celle suggérée dans la spec |
| Une piste en échec bloque tout le morceau, signale laquelle | Respecté | `TrackLoadError` (trackId/instrument), `Promise.all`/`for` propagent l'échec |
| États UI « téléchargement X/N » puis « préparation » | Respecté | `LoadProgress` (`fetching`/`decoding`), `Song.tsx` (loader + flavors) |
| Débloquer l'`AudioContext` sur interaction utilisateur (iOS) | Respecté | `AudioEngine.play()` → `context.resume()` |
| Un seul morceau en RAM, libération des refs au changement | Respecté | `useAudioEngine.ts` (`engine.dispose()` au cleanup d'effet), `mixer-processor.ts` (`this.tracks` réassigné à `loadTracks`) |
| Mono quand la source est mono, jamais d'up-mix stockage | Respecté (par confiance en `decodeAudioData`) | `audioEngine.ts` — aucun forçage stéréo à la conversion ; le `outputChannelCount:[2]` du `AudioWorkletNode` concerne uniquement la sortie haut-parleur finale, pas le stockage par piste |
| **Estimer le poids mémoire AVANT décodage, avertir si dépassement budget** | **Absent** | aucune fonction d'estimation trouvée dans `src/audio/` ni `hooks/useAudioEngine.ts` (grep vide sur « estimate/budget/Mo ») — **violation d'une règle explicite de audio-engine.md « Mémoire »** |
| Cran de sécurité 32 kHz pour cas extrêmes | Absent (optionnel, hors v1 par la spec) | — |
| Ralentissement sans changement de pitch (time-stretch) | Absent (explicitement hors périmètre) | — |
| Décodeur FLAC WASM direct Int16 | Absent (explicitement hors v1) | — |
| **PWA precache shell uniquement, jamais l'audio** | Respecté | `vite.config.ts` (`globIgnores: ["**/*.{mp3,flac,wav}"]`) |
| **Audio hors-ligne en IndexedDB, téléchargé à la demande** | **Absent** | aucune référence à IndexedDB/idb dans `src/` — fonctionnalité non commencée |
| **iOS : proposer l'installation écran d'accueil + `navigator.storage.persist()`** | **Absent** | grep vide sur `navigator.storage` dans tout `src/` ; seule la partie « manifest installable » existe (icônes/splashscreens dans `index.html`, `vite-plugin-pwa`) |
| **Écran de gestion du stockage (`navigator.storage.estimate()`, purge)** | **Absent** | aucune vue de ce type dans `src/views/` |
| Auth : pas d'inscription publique, comptes créés en console | Respecté | grep vide sur `createUserWithEmailAndPassword` dans `src/` ; `LogIn.tsx` n'utilise que `signInWithEmailAndPassword` |
| Règles Firestore/Storage : `request.auth != null` uniquement | Respecté | `firestore.rules`, `storage.rules` |
| Modèle de données `SongRecord` documenté dans CLAUDE.md | Partiel | `songs.ts` ajoute un champ `lyrics?: { lines: LyricLine[] }` **non listé** dans la section « Modèle de données » de CLAUDE.md (qui ne documente que `docs/lyrics-feature.md`) — dérive documentaire, pas un bug de code |
| Wizard refuse fréquence différente / durée trop écartée | Respecté | `trackValidation.ts` (`sampleRateMismatch`, `durationMismatch`) |
| `status: draft` non listé, non jouable | Respecté | `songs.ts` (`listReadySongs` filtre `status=="ready"`), `Song.tsx` (`playableSong` exige `status==="ready"`) |
| Action « audio » réutilisable sur morceau existant (garde-fou anti-recast-draft) | **Absent** (séquencement §11 étape 6, non atteinte) | `Song.tsx` : bouton « Ajouter de l'audio » de l'état vide Musique est un `<Button>` sans `to`/`onClick` — inerte ; tout le flux d'upload (`songImport.ts`, wizard) ne crée que des morceaux **neufs** (`startSongImport` = `createDraftSong`), aucun chemin n'ajoute de pistes à un morceau déjà `ready` |
| TypeScript strict, pas de `any`, pas de `!` | Respecté à une exception près | `main.tsx:9` — `document.getElementById("root")!` (non-null assertion sur le point d'entrée, hors du périmètre applicatif) |
| Icônes exclusivement `react-icons/io5` | Respecté | tous les imports d'icônes grep'és pointent vers `react-icons/io5` |

---

## 5. Firebase

**Auth**
- Initialisée dans `src/firebase/config.ts` via `getAuth(app)`, config lue depuis les variables d'environnement `VITE_FIREBASE_*` (`.env.local` présent, non lu par ce constat — fichier sensible).
- Seul flux applicatif : `signInWithEmailAndPassword` (`LogIn.tsx`). Aucun `createUserWithEmailAndPassword`, aucun formulaire d'inscription.
- `ProtectedRoute`/`PublicOnlyRoute` redirigent selon `useAuthUser()` (contexte alimenté par `onAuthStateChanged`).

**Firestore**
- Une seule collection utilisée : `songs`. Fonctions CRUD dans `songs.ts` (`listReadySongs`, `getSong`, `createDraftSong`, `createReadySongWithLyrics`, `updateSong`, `deleteSong`, `getNextSongOrder`).
- Règles présentes (`firestore.rules`) : lecture/écriture sur `songs/{songId}` réservée à `request.auth != null` ; tout le reste explicitement refusé. Alignées avec CLAUDE.md « Auth ».
- Pas de sous-collection ; `tracks` est un tableau embarqué, conforme au modèle documenté.

**Storage**
- Un seul bucket, chemin `songs/{songId}/{trackId}.flac` (`trackUpload.ts`).
- Règles présentes (`storage.rules`), même politique que Firestore (`request.auth != null` sur `songs/**`, reste refusé).
- Upload via `uploadBytesResumable` avec suivi de progression ; suppression via `deleteAllSongFiles` (utilisé par `abortSongImport` en cas d'échec du wizard).

**Déploiement**
- `firebase.json` ne référence que `firestore.rules`/`storage.rules` (pas d'Hosting configuré, conforme à la note CLAUDE.md).
- `.firebaserc` pointe le projet `songbook-97910` en alias `default`.
- Aucune trace de déploiement automatisé (pas de CI) : tout déploiement de règles est manuel, conforme à « Ne pas déployer sans validation explicite ».

---

## 6. Ce qui fonctionne / ne fonctionne pas

**Vérifié dans cette session (statique, pas d'exécution navigateur)**
- `npm run lint` (ESLint) : **vert**, zéro erreur/warning.
- `npm run build` (`tsc -b && vite build`) : **vert**, build de production généré (y compris le service worker PWA, `dist/sw.js`).
- Ces deux vérifications garantissent l'absence d'erreur de typage/lint à travers tout le dépôt, **pas** le comportement runtime.

**Non vérifié dans cette session — je n'ai pas lancé l'app dans un navigateur**
- Aucune capture d'écran, aucun test manuel de la synchro multipiste, du mute, de la boucle A→B, des gestes du prompteur, ni de la connexion Firebase réelle (nécessite des identifiants et des données existantes dans le projet `songbook-97910`).
- Je ne peux donc pas confirmer à l'exécution : la synchro échantillon-exacte réelle sous charge, le comportement iOS Safari (contrainte de déblocage AudioContext, `decodeAudioData` FLAC), ni le rendu visuel des écrans ajoutés cette session (`LyricsEdit`).

**Déductible du code avec un niveau de confiance élevé (logique complète, chemins câblés bout en bout)**
- Connexion / déconnexion.
- Liste des morceaux `ready` + navigation vers un morceau.
- Wizard de création complet : titre → choix action → (audio multi-piste avec upload séquentiel et récap, OU audio simple piste, OU paroles collées) → écriture Firestore finale.
- Lecture audio d'un morceau `ready` avec pistes : chargement, play/pause, seek, mute par piste, boucle A→B.
- Onglet Lyrics : prompteur en autoscroll libre (gestes hold/swipe, taille de police, persistance `localStorage`), édition des paroles (page dédiée ajoutée cette session, contrat succès/échec respecté au niveau du code).
- Mise à jour PWA (bannière, pas d'auto-reload).

**Certainement non fonctionnel car non implémenté (pas un bug — une absence)**
- Ajouter de l'audio à un morceau existant (bouton présent, inerte).
- Tout le hors-ligne « à la demande » (téléchargement IndexedDB, écran de gestion du stockage, `storage.persist()`).
- Estimation mémoire avant lecture / avertissement de dépassement de budget.
- Action « accords » (parquée, boutons désactivés partout où elle apparaît).

---

## 7. Points de blocage

- **Estimation mémoire avant décodage** (règle explicite de `.claude/rules/audio-engine.md`, section « Mémoire ») : absente. Un morceau dépassant le budget (~500 Mo pire cas) ne déclenche aujourd'hui aucun avertissement ; iOS pourrait tuer l'onglet sans erreur, conformément au risque que la règle cherchait justement à couvrir.
- **Hors-ligne quasi entièrement non commencé** : seul le precache du shell applicatif existe. Aucun stockage IndexedDB, aucune UI de téléchargement/purge, aucun `navigator.storage.persist()`. Point secondaire selon les priorités produit de CLAUDE.md, mais entièrement à construire.
- **Action « audio » non réutilisable sur un morceau existant** : séquencement `docs/lyrics-feature.md` §11 étape 6 non atteinte. Un morceau lyrics-only ne peut aujourd'hui recevoir de pistes audio par l'UI (bouton inerte, aucune brique d'ajout de pistes à un morceau `ready`).
- **Aucun test automatisé, aucune CI** : toute régression (y compris sur la synchro, règle « non négociable ») ne peut être détectée qu'en testant manuellement dans un navigateur/iOS réel.
- **Dérive documentaire mineure** : le champ Firestore `lyrics` (implémenté, utilisé) n'apparaît pas dans la section « Modèle de données » de CLAUDE.md, qui documente encore le modèle pré-feature-lyrics.
