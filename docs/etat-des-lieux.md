# État des lieux — Songbook

Constat factuel de l'état réel du dépôt, généré par lecture directe du code
(commit `e1c234a`, branche `feat/lyrics-wizard`). Aucune amélioration n'est
proposée ici.

## 1. Arborescence

`src/` compte 4010 lignes au total (fichiers `.ts`/`.tsx`/`.scss`/`.css`
confondus). Arborescence sur 2 niveaux, lignes par fichier :

```
src/
├── audio/                          — moteur audio, indépendant de React
│   ├── audioEngine.ts (204)        — classe AudioEngine : orchestration chargement/lecture,
│   │                                  un seul AudioContext + un seul AudioWorkletNode
│   ├── trackProvider.ts (31)       — abstraction de récupération des octets d'une piste
│   │                                  (impl. unique : Firebase Storage)
│   ├── trackValidation.ts (111)    — validation locale d'un fichier FLAC avant upload (wizard)
│   └── worklet/
│       ├── mixer-processor.ts (256) — AudioWorkletProcessor : mixage Int16, index maître,
│       │                               boucle A/B, rampes de gain
│       └── protocol.ts (23)         — types des messages thread principal ↔ worklet
├── components/                     — composants UI génériques
│   ├── Button/         (61 + 55 scss)
│   ├── Header/         (43 + 64 scss)
│   ├── InstrumentIcon/ (25 + 28 scss)
│   ├── Loader/         (36 + 70 scss)
│   ├── PwaUpdatePrompt/(33 + 37 scss)
│   ├── SongCard/       (21 + 41 scss)
│   ├── SongList/       (29 + 22 scss)
│   └── TextField/      (30 + 47 scss)
├── firebase/                       — accès Firebase
│   ├── config.ts (19)              — init app + exports auth/firestore/storage
│   ├── songImport.ts (115)         — orchestration import (draft → upload pistes → ready)
│   ├── songs.ts (182)              — CRUD Firestore sur la collection `songs`
│   └── trackUpload.ts (54)         — upload / suppression des fichiers Storage
├── hooks/                          — hooks et contexts React
│   ├── AuthProvider.tsx (18)       — provider Firebase Auth (onAuthStateChanged)
│   ├── NewSongWizardProvider.tsx (49) — état du wizard d'import (context)
│   ├── useAudioEngine.ts (179)     — hook consommant AudioEngine ; seul point d'entrée React
│   │                                  vers l'audio
│   ├── useAuthUser.ts (19)         — context + hook d'accès à l'état auth
│   ├── useNewSongWizard.ts (31)    — context + hook du wizard
│   └── useRotatingMessage.ts (25)  — rotation de messages « fun » pendant le loader
├── router/                         — routage
│   ├── index.tsx (58)              — déclaration des routes (createBrowserRouter)
│   ├── ProtectedRoute.tsx (17)     — garde route authentifiée
│   └── PublicOnlyRoute.tsx (17)    — garde route non-authentifiée (login)
├── styles/                         — styles globaux
│   ├── index.scss (8)
│   ├── reset.scss (135)
│   └── tokens.css (12)
├── types/                          — types partagés
│   ├── instrument.ts (14)          — InstrumentId + liste INSTRUMENTS (5 valeurs fixes)
│   ├── song.ts (4)                 — type Song minimal (id, title), utilisé par Home/SongList
│   └── track.ts (16)               — TrackModeChoice, WizardTrack, SINGLE_TRACK_INSTRUMENT_ID
├── views/                          — écrans applicatifs
│   ├── Home/     (63 + 29 scss)    — liste des morceaux "ready"
│   ├── LogIn/    (70 + 35 scss)    — formulaire email/mot de passe
│   ├── NewSong/                    — wizard de création/import (6 étapes routées)
│   │   ├── Recap/            (148 + 114 scss) — récap multi-piste, upload séquentiel, finalise l'import
│   │   ├── SelectInstrument/ (66 + 74 scss)   — choix de l'instrument (mode multi)
│   │   ├── SelectTrack/      (167 + 50 scss)  — choix + validation du fichier FLAC
│   │   ├── SongAction/       (69 + 69 scss)   — choix « envoyer audio / paroles / accords »
│   │   ├── SongName/         (48 + 25 scss)   — titre du morceau
│   │   └── TrackMode/        (71 + 73 scss)   — choix simple/multi-piste
│   └── Song/                       — écran lecteur
│       ├── AudioControls.tsx (112 + 109 scss) — play/pause, barre de progression, bouton boucle
│       ├── InstrumentGrid.tsx (52 + 64 scss)  — grille de mute par instrument
│       ├── Song.tsx          (133 + 39 scss)  — écran lecteur, orchestre useAudioEngine
│       └── Tabbar.tsx        (23 + 36 scss)   — 3 onglets Lyrics/Musique/Accords
├── main.tsx (16)                   — bootstrap React (AuthProvider + Router + PwaUpdatePrompt)
└── vite-env.d.ts (16)
```

## 2. Dépendances

**Environnement** : Node v22.23.1, npm 10.9.8.

**dependencies** :
| paquet | version |
|---|---|
| @fontsource/alegreya-sans | ^5.3.0 |
| @fontsource/work-sans | ^5.3.0 |
| firebase | ^12.16.0 |
| react | ^19.2.7 |
| react-dom | ^19.2.7 |
| react-icons | ^5.7.0 |
| react-router | ^8.2.0 |

**devDependencies** :
| paquet | version |
|---|---|
| @eslint/js | ^10.0.1 |
| @types/node | ^24.13.2 |
| @types/react | ^19.2.17 |
| @types/react-dom | ^19.2.3 |
| @vitejs/plugin-react | ^6.0.3 |
| eslint | ^10.6.0 |
| eslint-plugin-react-hooks | ^7.1.1 |
| eslint-plugin-react-refresh | ^0.5.3 |
| globals | ^17.7.0 |
| sass-embedded | ^1.100.0 |
| typescript | ~6.0.2 |
| typescript-eslint | ^8.62.0 |
| vite | ^8.1.1 |
| vite-plugin-pwa | ^1.3.0 |

Aucune dépendance lourde hors stack imposée (pas de librairie de state
management, pas de librairie audio tierce, pas de décodeur FLAC WASM).

## 3. Moteur audio

Fichiers réels dans `src/audio/` : `audioEngine.ts`, `trackProvider.ts`,
`trackValidation.ts`, `worklet/mixer-processor.ts`, `worklet/protocol.ts`.
Aucun autre fichier (pas de fichier « transport », « loop », « memory » à
part — toute la logique tient dans ces 5 fichiers).

**Signatures publiques exportées :**

- `audioEngine.ts` : `SAMPLE_RATE = 44100` ; classe `AudioEngine` avec
  `setPositionListener`, `setLoopListener`, `getDurationSamples`,
  `loadTracks(sources, provider, onProgress?)`, `play()`, `pause()`,
  `setTrackMuted(id, muted)`, `seek(index)`, `toggleLoopPoint()`,
  `dispose()` ; types `TrackSource`, `LoopRange`, `LoadProgress`,
  `LoadProgressListener` ; classe d'erreur `TrackLoadError` (porte
  `trackId`/`instrument` de la piste fautive).
- `trackProvider.ts` : interface `TrackByteProvider`, type `TrackRequest`,
  classe `FirebaseTrackProvider` (implémentation unique, lit
  `songs/{songId}/{trackId}.flac` via `getBytes`, en une fois — pas de
  streaming).
- `trackValidation.ts` : `DURATION_TOLERANCE_SAMPLES = 22050` (~0,5 s),
  `validateTrackFile(file, reference)` → hash SHA-256 + décodage local +
  vérification fréquence/durée par rapport à la première piste importée.
- `worklet/protocol.ts` : `MainToWorkletMessage` (`loadTracks`, `play`,
  `pause`, `setTrackGain`, `seek`, `toggleLoopPoint`) et
  `WorkletToMainMessage` (`position`, `loop`) — protocole **effectivement
  implémenté à l'identique** des deux côtés (`audioEngine.ts` ↔
  `mixer-processor.ts`), aucun message documenté qui ne soit pas géré.
- `worklet/mixer-processor.ts` : classe `MixerProcessor` (non exportée
  directement, enregistrée via `registerProcessor("mixer-processor", …)`).
  Index maître `masterIndex`, mixage par bloc de 128 échantillons, gains
  par piste avec rampe de 5 ms, boucle A→B sample-exact, throttle de
  position à 100 ms.

**Stubs et code mort constatés :**

- Aucun stub explicite (pas de `TODO`, pas de fonction vide) dans ces 5
  fichiers.
- Le « cran de sécurité 32 kHz » et le « micro-fondu au raccord de boucle »
  mentionnés comme optionnels dans `audio-engine.md` ne sont pas codés —
  cohérent avec leur statut « hors v1 » dans la spec elle-même, donc pas
  un écart.
- Le ralentissement sans changement de pitch (time-stretch) n'a aucune
  trace dans le code — également hors périmètre déclaré.
- Rien dans `mixer-processor.ts` ou `audioEngine.ts` n'est mort : chaque
  export est consommé par `useAudioEngine.ts` ou par `mixer-processor.ts`
  lui-même.

## 4. Écarts avec la spécification

| Point de spec | Statut | Fichier concerné |
|---|---|---|
| Un seul AudioContext (44100 Hz) + un seul AudioWorkletNode | Respecté | `audioEngine.ts:62-73` |
| Pas de `AudioBufferSourceNode`, pas de `<audio>` | Respecté | grep sur tout `src/` : 0 occurrence |
| Pas de streaming audio | Respecté | `trackProvider.ts` (`getBytes`, pas de fetch en Range/stream) |
| Pistes en PCM Int16, jamais en `AudioBuffer` Float32 conservé | Respecté | `audioEngine.ts:140-144` (Float32 converti puis libéré), `mixer-processor.ts:26,247` |
| Index de lecture maître unique côté worklet | Respecté | `mixer-processor.ts:44` |
| Mute = gain de piste à 0 dans le mixage | Respecté | `mixer-processor.ts:154-171,205-210` |
| Boucle A→B = bornage de l'index maître, sample-exact | Respecté | `mixer-processor.ts:107-131,215-223` |
| Débloquer l'AudioContext sur interaction utilisateur (iOS) | Respecté | `audioEngine.ts:159-163` (`context.resume()` dans `play()`) |
| Décodage séquentiel des pistes (fetch parallèle OK) | Respecté | `audioEngine.ts:110-152` |
| Transfert des buffers via `postMessage` + transférables | Respecté | `audioEngine.ts:155,186-194` |
| Pas de `SharedArrayBuffer` en v1 | Respecté | grep : 0 occurrence |
| Protocole de messages (`loadTracks`/`play`/…/`position`/`loop`) | Respecté | `worklet/protocol.ts`, implémenté à l'identique des deux côtés |
| Position UI exclusivement dérivée des messages `position` du worklet | Respecté | `useAudioEngine.ts:63`, aucun calcul de position côté React |
| État de boucle UI exclusivement dérivé des messages `loop` | Respecté | `useAudioEngine.ts:64`, `AudioControls.tsx:22-25` |
| `toggleLoopPoint` unique, 3 états, logique côté worklet | Respecté | `mixer-processor.ts:107-131` |
| Une piste en échec bloque tout le morceau, piste fautive signalée | Respecté | `audioEngine.ts:39-50,110-121,133-137`, `TrackLoadError` porte l'instrument |
| Rampe courte sur les changements de gain (mute/unmute) | Respecté | `mixer-processor.ts:36,167-171,195-199` |
| Un seul morceau en RAM, libération au changement | Respecté | `useAudioEngine.ts:110-116` (`dispose()` à chaque démontage/changement de `songId`) |
| Mono quand la source est mono (pas d'up-mix) | Respecté | `audioEngine.ts:138-144` (boucle sur `numberOfChannels` réel) |
| **Estimer le poids mémoire AVANT de décoder, avertir si dépassement** | **Absent** | aucune trace dans `src/` (grep négatif) |
| **Estimation mémoire avant lecture à partir des seules métadonnées Firestore** | **Absent** | idem — aucun calcul de ce type, ni dans `Song.tsx` ni dans `useAudioEngine.ts` |
| Toutes les pistes d'un morceau à la même fréquence (44100 Hz explicitement) | Partiel | `trackValidation.ts:72-81` ne valide que la cohérence **entre pistes** (référence = 1ʳᵉ piste importée), jamais l'égalité avec 44100 Hz. Fonctionne quand même car `decodeAudioData` rééchantillonne vers le taux du contexte, mais la garantie « 44100 Hz » n'est pas vérifiée à l'import |
| Wizard refuse fréquence différente / durée trop écartée | Respecté | `trackValidation.ts:72-97` |
| Champ `status` draft/ready, draft ni listé ni jouable | Respecté | `songs.ts:126-134` (`listReadySongs` filtre `status=="ready"`), `Song.tsx:72` |
| `sampleRate`/`durationSamples` posés une seule fois à la finalisation | Respecté | `songImport.ts:94-109` |
| Modèle de données Firestore (`songs/{songId}`, tableau `tracks` embarqué) | Respecté | `songs.ts:28-98` correspond champ à champ à CLAUDE.md |
| Storage `songs/{songId}/{trackId}.flac` | Respecté | `trackUpload.ts:19-21` |
| Auth : pas d'allowlist, comptes créés en console uniquement | Respecté | `LogIn.tsx` (`signInWithEmailAndPassword` uniquement), grep `createUserWithEmailAndPassword` : 0 occurrence |
| Règles Firestore/Storage : `request.auth != null` uniquement | Respecté | `firestore.rules`, `storage.rules` |
| **PWA : precache shell uniquement, jamais l'audio** | Respecté | `vite.config.ts` (`globIgnores` sur `mp3/flac/wav`) |
| **Hors-ligne : audio en IndexedDB, téléchargé à la demande** | **Absent** | aucune trace d'IndexedDB dans `src/` |
| **`navigator.storage.persist()` / proposition d'installation** | **Absent** | grep négatif sur tout `src/` |
| **Écran de gestion du stockage (estimate, liste, purge)** | **Absent** | aucune vue de ce type dans `src/views/` |
| TypeScript strict, pas de `any` | Respecté | `tsconfig.app.json` (`strict: true`), grep `any` : 0 occurrence hors libs |
| Composants fonctionnels + hooks uniquement | Respecté | aucune classe React dans `src/components`/`src/views` |
| Icônes exclusivement `react-icons/io5` | Respecté | tous les imports d'icônes relevés viennent de `react-icons/io5` |
| Pas de secrets committés | Respecté | `.env`, `.env.local` dans `.gitignore`, seul `.env.example` est versionné |

**Synthèse des écarts** : les trois points marqués **Absent** touchent tous
la section « Hors-ligne » de CLAUDE.md — explicitement qualifiée de
« souhaité, secondaire à la synchro » dans les priorités produit. Aucun
écart ne touche la règle CRITIQUE / NON NÉGOCIABLE (synchro échantillon-
exacte, un seul AudioContext, pas de streaming, pas de precache audio) :
ces règles sont toutes respectées. Le seul écart touchant une exigence non
qualifiée d'optionnelle est l'estimation mémoire avant décodage
(section « Mémoire », `audio-engine.md`), qui n'a aucune implémentation.

## 5. Firebase

**Auth** : `firebase/auth` initialisé dans `config.ts` via `getAuth(app)`.
Seul flux exposé : connexion par email/mot de passe
(`signInWithEmailAndPassword`, `LogIn.tsx`) et déconnexion (`signOut`,
appelée depuis le bouton logout du `Header` sur chaque écran protégé).
Aucun formulaire d'inscription, aucun appel à
`createUserWithEmailAndPassword` dans tout `src/`. Garde de routes via
`ProtectedRoute`/`PublicOnlyRoute` + contexte `AuthProvider`
(`onAuthStateChanged`).

**Firestore** : une seule collection `songs`, accédée exclusivement via
`src/firebase/songs.ts` (`listReadySongs`, `getSong`, `createDraftSong`,
`updateSong`, `deleteSong`, `getNextSongOrder`). Pas de sous-collection,
conforme au modèle « tableau `tracks` embarqué » de CLAUDE.md.

**Storage** : un seul chemin logique `songs/{songId}/{trackId}.flac`, géré
par `src/firebase/trackUpload.ts` (`uploadTrackFile` avec
`uploadBytesResumable`, `deleteAllSongFiles`).

**Règles de sécurité présentes** (racine du dépôt, hors `src/`) :
- `firestore.rules` : lecture/écriture sur `songs/{songId}` si
  `request.auth != null`, tout le reste refusé explicitement.
- `storage.rules` : lecture/écriture sur `songs/**` si
  `request.auth != null`, tout le reste refusé explicitement.
- `firebase.json` référence les deux fichiers de règles ; pas de config
  Hosting (cohérent avec la note CLAUDE.md « pas de Firebase Hosting »).
- `.firebaserc` pointe le projet `songbook-97910` en alias `default`.

Ces règles correspondent exactement à la section « Auth » de CLAUDE.md
(pas d'allowlist, pas de distinction propriétaire). Aucune règle plus fine
(par exemple limitation d'écriture à `createdBy`) n'existe — ce n'est pas
un écart, CLAUDE.md ne le demande pas.

**Ce qui est absent côté Firebase** : pas de Cloud Functions, pas de
fichier `firestore.indexes.json` — la requête `listReadySongs` combine
`where("status","==","ready")` et `orderBy("order")` sur des champs
différents, ce qui nécessite un index composite ; s'il n'a pas été créé
manuellement dans la console, cette requête échoue à l'exécution — non
vérifiable depuis le code seul.

## 6. Ce qui fonctionne / ne fonctionne pas

**Démontrable à l'exécution** (`npm run build` et `npm run lint` passent
tous les deux sans erreur au moment de ce constat) :

- Le build de production compile sans erreur TypeScript et sans erreur
  ESLint.
- Le graphe d'appels login → liste des morceaux → lecteur → wizard
  d'import est complet et cohérent : chaque écran référencé par le routeur
  existe, chaque hook consommé est défini, chaque appel Firestore/Storage
  a une contrepartie dans les règles de sécurité.
- Le moteur audio (chargement, lecture, pause, seek, mute, boucle A→B) est
  entièrement implémenté des deux côtés du protocole worklet, sans pièce
  manquante identifiable par lecture du code.
- Le wizard d'import a deux chemins distincts et complets : mode
  « single » (`SelectTrack.tsx handleFinishSingleTrack`, draft→ready en un
  appel) et mode « multi » (`SelectTrack → SelectInstrument → Recap`,
  upload séquentiel puis finalisation).

**Non démontrable / non exécuté dans le cadre de ce constat** — aucun
serveur de dev n'a été lancé, aucun test dans un navigateur (encore moins
sur iOS) n'a été effectué. Le rapport ci-dessus reflète uniquement ce que
le code implique statiquement, pas un test d'exécution réel. En
particulier, la requête composite `where("status","==","ready") +
orderBy("order")` de `listReadySongs` (`songs.ts:126-134`) exige un index
Firestore composite : son existence effective sur le projet
`songbook-97910` n'a pas été vérifiée.

**Fonctionnalités visibles dans l'UI mais non implémentées** :

- `Tabbar.tsx` (écran lecteur) affiche 3 onglets « Lyrics / Musique /
  Accords » : seul l'onglet « Musique » a un style actif câblé en dur
  (`className={`${styles.tab} ${styles.active}`}`) ; les deux autres
  boutons n'ont ni `onClick` ni routing — non fonctionnels.
- `SongAction.tsx` (étape du wizard) présente 3 options : « Envoyer de
  l'audio » est la seule cliquable/active, « Enregistrer les paroles » et
  « Enregistrer les accords » sont visuellement désactivées
  (`aria-disabled`, `title="Bientôt disponible"`) et n'ont pas de handler.
- Aucun écran de gestion du stockage hors-ligne n'existe (cf. section 4).

## 7. Points de blocage

- **Absence totale de la fonctionnalité hors-ligne** décrite dans
  CLAUDE.md (IndexedDB, `navigator.storage.persist()`, écran de gestion
  du stockage) : rien n'est amorcé, ni type ni composant ni hook dédié.
  Secondaire selon les priorités produit, mais à construire entièrement
  depuis zéro le jour où elle est demandée.
- **Absence de l'estimation mémoire avant décodage** (section « Mémoire »
  de `audio-engine.md`) : aucun garde-fou n'empêche aujourd'hui de
  charger un morceau qui dépasserait le budget ~500 Mo ; le seul
  comportement en cas de dépassement serait celui, non contrôlé, du
  moteur JS/iOS (crash silencieux d'onglet, cf. la mise en garde de la
  spec elle-même).
- **Validation de fréquence d'échantillonnage relative, pas absolue** :
  le wizard garantit la cohérence entre pistes d'un même morceau mais pas
  l'égalité avec 44100 Hz. Un import entièrement à une autre fréquence
  (ex. 48000 Hz) passerait la validation et reposerait ensuite sur le
  rééchantillonnage implicite de `decodeAudioData`, jamais vérifié
  explicitement.
- **Non-vérification de l'index Firestore composite** requis par
  `listReadySongs` (`where` + `orderBy` sur des champs différents) : sans
  lecture de la console Firebase, impossible de confirmer depuis le code
  que la page d'accueil fonctionne réellement en production.
- **Fonctionnalités lyrics/accords à l'état de coquille visuelle** :
  `Tabbar` et `SongAction` exposent déjà l'UI (cohérent avec le nom de la
  branche `feat/lyrics-wizard`) mais aucune logique, type de données ni
  route associée n'existe encore pour les paroles ou les accords.
