# État des lieux

Constat factuel de l'état réel du dépôt, généré par analyse statique du code
(pas de proposition, pas d'implémentation). Voir `CLAUDE.md` et
`.claude/rules/audio-engine.md` pour la spécification de référence.

## 1. Arborescence

```
src/
├── audio/                     moteur audio, indépendant de React
│   ├── audioEngine.ts             204 l.  classe AudioEngine (thread principal)
│   ├── trackProvider.ts            31 l.  fetch des octets FLAC (Firebase Storage)
│   ├── trackValidation.ts         111 l.  validation locale d'une piste (wizard d'import)
│   └── worklet/
│       ├── mixer-processor.ts     256 l.  AudioWorkletProcessor (mixage, boucle, gain)
│       └── protocol.ts             23 l.  types des messages thread principal ↔ worklet
├── components/                 composants UI réutilisables
│   ├── Button/                     61 l.  bouton (variantes lien/action)
│   ├── ChordCard/                  64 l.  carte d'accord (affichage)
│   ├── Header/                     43 l.  en-tête de page (titre, retour, déconnexion)
│   ├── InstrumentIcon/             25 l.  icône par instrument
│   ├── Loader/                     36 l.  écran de chargement (message + progression)
│   ├── LyricsPasteForm/            78 l.  formulaire de collage de paroles
│   ├── PwaUpdatePrompt/            33 l.  bandeau de mise à jour PWA
│   ├── SongCard/                   21 l.  carte de morceau (liste d'accueil)
│   ├── SongList/                   29 l.  liste des morceaux
│   └── TextField/                  30 l.  champ de saisie générique
├── firebase/                   accès Firebase, pas de logique métier hors CRUD
│   ├── config.ts                    19 l.  initialisation app/auth/firestore/storage
│   ├── songImport.ts               115 l.  orchestration wizard (draft → ready)
│   ├── songs.ts                    266 l.  CRUD Firestore `songs` + helpers de statut
│   └── trackUpload.ts               54 l.  upload/suppression fichiers Storage
├── hooks/                      hooks React
│   ├── AuthProvider.tsx             18 l.  contexte d'authentification (onAuthStateChanged)
│   ├── NewSongWizardProvider.tsx    49 l.  état du wizard d'import (contexte)
│   ├── useAudioEngine.ts           179 l.  pont React ↔ AudioEngine
│   ├── useAuthUser.ts               19 l.  hook de lecture du contexte auth
│   ├── useChordsAutosave.ts         43 l.  sauvegarde différée des accords
│   ├── useNewSongWizard.ts          31 l.  hook de lecture du contexte wizard
│   └── useRotatingMessage.ts        25 l.  rotation de messages d'attente
├── router/                     routage et gardes d'accès
│   ├── index.tsx                    69 l.  déclaration des routes
│   ├── ProtectedRoute.tsx           17 l.  redirige vers /login si non authentifié
│   └── PublicOnlyRoute.tsx          17 l.  redirige vers / si déjà authentifié
├── styles/                     SCSS global, reset, tokens CSS
├── types/                      types partagés
│   ├── chord.ts                     69 l.  types accords + libellés (solfège FR)
│   ├── instrument.ts                14 l.  identifiants d'instruments
│   ├── song.ts                       4 l.  type minimal, semble non utilisé (cf. §3)
│   └── track.ts                     16 l.  types piste (wizard) + mode de piste
└── views/                      écrans, un dossier par route (ou sous-route)
    ├── Home/                        63 l.  accueil, liste des morceaux
    ├── LogIn/                       70 l.  connexion email/mot de passe
    ├── NewSong/                     wizard d'import (7 étapes, 1 dossier chacune)
    │   ├── LyricsText/              47 l.  saisie paroles (morceau lyrics-only)
    │   ├── Recap/                  148 l.  récapitulatif + finalisation import
    │   ├── SelectInstrument/        66 l.  association piste ↔ instrument
    │   ├── SelectTrack/            167 l.  sélection + validation locale du fichier
    │   ├── SongAction/              88 l.  choix audio / paroles
    │   ├── SongName/                48 l.  saisie du titre
    │   └── TrackMode/               71 l.  choix single/multi piste
    └── Song/                        écran morceau (musique/paroles/accords)
        ├── AddSectionForm.tsx       64 l.  ajout d'une partie (accords)
        ├── AudioControls.tsx       112 l.  transport (play/pause, seek, boucle)
        ├── ChordComposer.tsx       134 l.  compositeur d'accords
        ├── ChordsView.tsx          210 l.  onglet Accords
        ├── InstrumentGrid.tsx       52 l.  grille de mute par piste
        ├── LyricsEdit/             101 l.  édition des paroles
        ├── LyricsPrompter.tsx      264 l.  onglet Paroles (défilement)
        ├── SectionBlock.tsx        139 l.  bloc d'une partie (accords)
        ├── Song.tsx                186 l.  orchestrateur de l'écran morceau
        └── Tabbar.tsx               49 l.  barre d'onglets Musique/Paroles/Accords
```

Total TS/TSX : 4180 lignes (56 fichiers). Total SCSS/CSS : 1852 lignes
(31 fichiers).

## 2. Dépendances

Node : `v22.23.1` (`.nvmrc` fixe `22`). npm : `10.9.8`.

**dependencies**

| Paquet | Version |
|---|---|
| `@fontsource/alegreya-sans` | ^5.3.0 |
| `@fontsource/work-sans` | ^5.3.0 |
| `firebase` | ^12.16.0 |
| `react` | ^19.2.7 |
| `react-dom` | ^19.2.7 |
| `react-icons` | ^5.7.0 |
| `react-router` | ^8.2.0 |

**devDependencies**

| Paquet | Version |
|---|---|
| `@eslint/js` | ^10.0.1 |
| `@types/node` | ^24.13.2 |
| `@types/react` | ^19.2.17 |
| `@types/react-dom` | ^19.2.3 |
| `@vitejs/plugin-react` | ^6.0.3 |
| `eslint` | ^10.6.0 |
| `eslint-plugin-react-hooks` | ^7.1.1 |
| `eslint-plugin-react-refresh` | ^0.5.3 |
| `globals` | ^17.7.0 |
| `sass-embedded` | ^1.100.0 |
| `typescript` | ~6.0.2 |
| `typescript-eslint` | ^8.62.0 |
| `vite` | ^8.1.1 |
| `vite-plugin-pwa` | ^1.3.0 |

Aucune dépendance de test (pas de Vitest/Jest/Playwright installé). Aucun
décodeur FLAC WASM (le décodage passe par `AudioContext.decodeAudioData`
natif). `npx tsc -b --noEmit` et `npm run lint` passent tous deux sans erreur
ni avertissement au moment de l'analyse.

## 3. Moteur audio

Fichiers réels dans `src/audio/` : `audioEngine.ts`, `trackProvider.ts`,
`trackValidation.ts`, `worklet/mixer-processor.ts`, `worklet/protocol.ts`.
Pas de fichier `transport.ts` ou `loop.ts` séparé — boucle et transport sont
intégrés directement dans `mixer-processor.ts` et `audioEngine.ts`.

**Signatures publiques exportées**

- `audioEngine.ts` : `SAMPLE_RATE = 44100`, `interface TrackSource`,
  `interface LoopRange`, `type LoadProgress`, `type LoadProgressListener`,
  `class TrackLoadError extends Error` (porte `trackId`/`instrument`),
  `class AudioEngine` avec `setPositionListener`, `setLoopListener`,
  `getDurationSamples`, `loadTracks(sources, provider, onProgress?)`, `play`
  (async, appelle `context.resume()`), `pause`, `setTrackMuted(id, muted)`,
  `seek(index)`, `toggleLoopPoint()`, `dispose()`.
- `trackProvider.ts` : `interface TrackRequest`, `interface
  TrackByteProvider`, `class FirebaseTrackProvider` (lit
  `songs/{songId}/{trackId}.flac` via `getBytes`, pas de streaming).
- `trackValidation.ts` : `DURATION_TOLERANCE_SAMPLES = 22050` (~0,5 s),
  `interface TrackReference`, `interface ValidatedTrackMetadata`, `type
  TrackRejectionReason`, `type TrackValidationResult`, `async function
  validateTrackFile(file, reference)`.
- `worklet/protocol.ts` : `interface TrackPayload`, `type
  MainToWorkletMessage` (`loadTracks | play | pause | setTrackGain | seek |
  toggleLoopPoint`), `type WorkletToMainMessage` (`position | loop`).
- `worklet/mixer-processor.ts` : `class MixerProcessor extends
  AudioWorkletProcessor`, enregistrée sous `"mixer-processor"`. Pas
  d'export : chargée exclusivement comme module worklet séparé via
  `mixer-processor.ts?worker&url`.

**Protocole de messages réellement implémenté**

Thread principal → worklet : `loadTracks` (tableau `TrackPayload`), `play`,
`pause`, `setTrackGain` (id + gain), `seek` (index), `toggleLoopPoint` (sans
paramètre). Correspond exactement à la spec.

Worklet → thread principal : `position` (index), `loop` (`start`/`end`,
chacun `number | null`). Correspond exactement à la spec, y compris le
throttling de `position` (tous les `sampleRate * 0.1` échantillons, ou à
chaque événement notable : arrêt, changement de boucle, seek).

**Stubs / code mort**

- `src/types/song.ts` (`interface Song { id, title }`) — aucune référence
  trouvée ailleurs dans le code ; le type réellement utilisé partout est
  `SongRecord` de `src/firebase/songs.ts`. Probable reliquat d'un stade
  antérieur du projet.
- Le mécanisme de fondu au raccord de boucle (« micro-fondu optionnel »,
  prévu comme facultatif par la spec) n'est pas implémenté — cohérent avec
  son statut « peut être ajouté après la v1 ».
- Le mode réduit 32 kHz (cran de sécurité mémoire, explicitement optionnel
  dans la spec) n'est pas implémenté.
- Pas de bouclage automatique de fin de piste : à `masterIndex >=
  trackLength`, la lecture s'arrête (`this.playing = false`), comportement
  documenté en commentaire comme volontaire pour ce stade (« pas de
  bouclage automatique de fin de piste en v1 »).

## 4. Écarts avec la spécification

| Point de spec | Statut | Fichier concerné |
|---|---|---|
| Un seul `AudioContext` à 44100 Hz | Respecté | `src/audio/audioEngine.ts` |
| Un seul `AudioWorkletNode`/`AudioWorkletProcessor` qui mixe tout | Respecté | `src/audio/audioEngine.ts`, `src/audio/worklet/mixer-processor.ts` |
| Pas de `AudioBufferSourceNode`, pas de `<audio>`, pas de streaming | Respecté | `src/audio/*`, `src/audio/trackProvider.ts` (`getBytes`, jamais de flux) |
| Pistes en PCM Int16, jamais `AudioBuffer` Float32 conservé | Respecté | `audioEngine.ts` (`float32ToInt16`, Float32 non conservé après conversion) |
| Index de lecture maître unique côté worklet, source de vérité | Respecté | `mixer-processor.ts` (`masterIndex`) |
| Mute = gain de piste à 0 dans le mixage | Respecté | `mixer-processor.ts` (`setTrackGain`) |
| Rampe courte sur changement de gain | Respecté | `mixer-processor.ts` (`GAIN_RAMP_DURATION_SECONDS = 0.005`) |
| Boucle A→B = bornage sample-exact de l'index maître | Respecté | `mixer-processor.ts` (boucle par échantillon, pas par bloc) |
| `toggleLoopPoint` unique, 3 états, logique côté worklet | Respecté | `mixer-processor.ts`, `worklet/protocol.ts` |
| Seek en dehors de [A,B] efface la boucle | Respecté | `mixer-processor.ts` (`seek()`) |
| Position UI exclusivement via message `position` du worklet | Respecté | `useAudioEngine.ts`, `AudioControls.tsx` |
| État boucle UI exclusivement via message `loop` du worklet | Respecté | `useAudioEngine.ts` (pas de mise à jour optimiste, commenté explicitement) |
| Décodage séquentiel des pistes (pas de pic mémoire Float32 parallèle) | Respecté | `audioEngine.ts` (boucle `for` séquentielle sur `decodeAudioData`) |
| Fetch des pistes en parallèle | Respecté | `audioEngine.ts` (`Promise.all`) |
| Transfert des `ArrayBuffer` au worklet via transférables | Respecté | `audioEngine.ts` (`transferables` passés à `postMessage`) |
| Débloquer l'`AudioContext` sur interaction utilisateur (iOS) | Respecté | `audioEngine.ts` (`play()` appelle `context.resume()`) |
| Une piste en échec bloque tout le morceau, piste fautive signalée | Respecté | `audioEngine.ts` (`TrackLoadError`), `useAudioEngine.ts` |
| États UI « téléchargement X/N » puis « préparation… » | Respecté | `audioEngine.ts` (`LoadProgress`), `Song.tsx` (messages fetching/decoding) |
| Un seul morceau en RAM, libération au changement | Respecté | `useAudioEngine.ts` (`engine.dispose()` au cleanup de l'effet) |
| Mono quand la source est mono (pas d'up-mix) | Respecté | `audioEngine.ts` (nombre de canaux dérivé de `audioBuffer.numberOfChannels`) |
| Estimation mémoire avant décodage, avertissement si dépassement | **Absent** | aucune trace dans `src/audio/` ni ailleurs — CLAUDE.md le décrit comme obligatoire (« Estimer AVANT de décoder ») |
| Estimation mémoire avant lecture, à partir des seules métadonnées Firestore | **Absent** | idem — aucun calcul de ce type trouvé côté `Song.tsx` ou `useAudioEngine.ts` |
| Mode réduit 32 kHz (cran de sécurité mémoire) | Absent (explicitement optionnel/hors v1) | — |
| Micro-fondu au raccord de boucle | Absent (explicitement optionnel/hors v1) | — |
| Ralentissement sans changement de pitch | Absent (explicitement hors périmètre v1) | — |
| `SharedArrayBuffer` | Absent (explicitement écarté v1) | — |
| Décodeur FLAC WASM direct Int16 | Absent (explicitement évolution future) | — |
| PWA : precache du shell uniquement, jamais l'audio | Respecté | `vite.config.ts` (`globIgnores` exclut mp3/flac/wav) |
| Stockage hors-ligne audio en IndexedDB, à la demande | **Absent** | aucune référence à IndexedDB dans `src/` |
| Écran de gestion du stockage (`storage.estimate()`, purge) | **Absent** | aucune vue ni composant correspondant |
| `navigator.storage.persist()` | **Absent** | aucune référence dans `src/` |
| Auth : comptes créés uniquement en console, pas d'inscription publique | Respecté | aucun appel à `createUserWithEmailAndPassword` trouvé dans `src/` ; `LogIn.tsx` n'utilise que `signInWithEmailAndPassword` |
| Règles Firestore/Storage : authentifié suffit, pas d'allowlist | Respecté | `firestore.rules`, `storage.rules` |
| Modèle de données `tracks` en tableau embarqué | Respecté | `src/firebase/songs.ts` (`TrackMeta[]` dans `SongRecord`) |
| `status` draft/ready, morceau draft ni listé ni jouable | Respecté | `songs.ts` (`listReadySongs` filtre `status == "ready"`), `Song.tsx` (`playableSong` exige `status === "ready"`) |
| Import wizard : décodage local avant upload, refus si fréquence/durée incohérente | Respecté | `trackValidation.ts`, `SelectTrack.tsx` |
| `sampleRate`/`durationSamples` posés en une seule fois à la finalisation | Respecté | `songImport.ts` (`finalizeSongImport`) |
| TypeScript strict, pas de `any` sans justification | Respecté (aucun `any` trouvé dans `src/`) | — |
| Identifiants de code/collections/champs en anglais | Respecté | `src/firebase/songs.ts`, `src/types/*` |
| Icônes react-icons/io5 uniquement | Respecté | tous les composants observés importent depuis `react-icons/io5` |

## 5. Firebase

- **Auth** : email/mot de passe uniquement (`signInWithEmailAndPassword` dans
  `LogIn.tsx`, `signOut` dans plusieurs vues). Aucun formulaire ni fonction de
  création de compte côté app. `AuthProvider.tsx` expose l'état via
  `onAuthStateChanged`. `ProtectedRoute`/`PublicOnlyRoute` gardent les routes
  selon cet état.
- **Firestore** : une seule collection `songs`, accès CRUD dans
  `src/firebase/songs.ts` (`listReadySongs`, `getSong`, `createDraftSong`,
  `createReadySongWithLyrics`, `updateSong`, `deleteSong`). Règles
  (`firestore.rules`) : `read, write` autorisé sur `songs/{songId}` si
  `request.auth != null` ; tout le reste explicitement refusé. Pas de
  validation de schéma dans les règles (aucune contrainte sur les champs).
- **Storage** : chemin `songs/{songId}/{trackId}.flac`, accès dans
  `trackUpload.ts` (`uploadTrackFile` via `uploadBytesResumable`,
  `deleteAllSongFiles`). Règles (`storage.rules`) : même politique — auth
  suffisant sur `songs/**`, reste refusé.
- **Config** (`firebase.json`, `.firebaserc`) : déploiement des règles
  Firestore/Storage uniquement, projet `songbook-97910`. Pas de Firebase
  Hosting configuré (conforme à la note de CLAUDE.md — cible de déploiement
  non décidée). Clés d'app lues depuis variables d'environnement
  `VITE_FIREBASE_*` (`.env.local` présent localement, ignoré par git).
- **Absent** : pas de Cloud Functions, pas de règles de validation de champs
  côté Firestore, pas de collection `members` (cohérent avec le choix
  documenté « pas d'allowlist »).

## 6. Ce qui fonctionne / ne fonctionne pas

D'après la lecture du code (aucune exécution manuelle dans le navigateur
effectuée pour produire ce document) :

**Démontrable par la structure du code, cohérent de bout en bout**

- Connexion email/mot de passe et déconnexion, garde de routes.
- Liste des morceaux `ready` sur l'accueil.
- Wizard d'import multipiste complet (nom → action → mode de piste →
  sélection/validation locale des fichiers → association instrument →
  récapitulatif → écriture Firestore/Storage), avec chemin alternatif
  « lyrics-only » (`createReadySongWithLyrics`) et mode `single`.
- Lecture synchronisée : chargement (fetch parallèle, décodage séquentiel,
  indicateur de progression), play/pause, seek, mute par piste, boucle A→B
  3-états, tout piloté par les messages worklet ↔ thread principal comme
  spécifié.
- Édition des paroles et défilement (`LyricsPrompter`), édition/composition
  d'accords (`ChordsView`, `ChordComposer`) avec autosave (`useChordsAutosave`).
- PWA : manifest et precache du shell configurés, exclusion explicite de
  l'audio.
- `npx tsc -b --noEmit` et `npm run lint` passent sans erreur au moment de
  l'analyse — cette absence d'erreurs de typage/lint ne garantit pas
  l'absence de bug d'exécution.

**Non vérifié par ce constat** (pas de lancement du navigateur) : le rendu
visuel réel, le comportement tactile sur mobile/iOS, le comportement de
l'`AudioContext` sous Safari/iOS en pratique, la latence effective de la
boucle A→B à l'oreille.

**Non implémenté, donc non fonctionnel par construction**

- Tout stockage/lecture hors-ligne de l'audio (IndexedDB) : absent, donc la
  lecture ne fonctionne qu'en ligne.
- Écran de gestion du stockage : absent, rien à tester.
- Estimation mémoire avant décodage/lecture et avertissement associé :
  absents — un morceau dépassant le budget mémoire décrit par CLAUDE.md
  n'est pas détecté avant de tenter le chargement complet.
- Bouclage automatique de fin de piste, fondu au raccord, mode 32 kHz,
  ralentissement sans changement de pitch : tous absents (cohérent avec leur
  statut hors-v1 dans la spec).

## 7. Points de blocage

- **Estimation mémoire absente** : CLAUDE.md et `audio-engine.md` présentent
  ce point comme une garantie explicite (« estimer AVANT de décoder »,
  « avertir si dépassement »), mais aucun code ne le fait. Le risque décrit
  par la spec elle-même (iOS tue l'onglet sans erreur au-delà du budget)
  n'est donc couvert par aucun garde-fou actuel.
- **Hors-ligne entièrement absent** : la section « Hors-ligne » de CLAUDE.md
  (IndexedDB, écran de gestion du stockage, `navigator.storage.persist()`)
  n'a aucune trace dans le code. Le README du dépôt le confirme
  explicitement dans sa section « Connu comme incomplet ».
- **`src/types/song.ts`** : type `Song { id, title }` sans référence
  d'usage trouvée — décalage potentiel avec `SongRecord`, à vérifier avant
  toute intervention qui s'appuierait dessus.
- **Absence de tests** : aucun framework de test installé, aucun fichier de
  test trouvé dans `src/`. La conformité fonctionnelle décrite en §6 repose
  entièrement sur la lecture du code, pas sur une suite automatisée.
- **Pas de vérification navigateur effectuée** : ce constat ne certifie pas
  le comportement à l'exécution, en particulier sur iOS (priorité produit
  n°2 de CLAUDE.md), faute de lancement de l'app pendant cette analyse.
