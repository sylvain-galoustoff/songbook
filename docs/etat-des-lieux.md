# État des lieux du code — Songbook

Document généré par analyse statique du dépôt à la date du 2026-07-19,
branche `master`, commit `498c7d1` (« Feat/uplaod wizard (#18) »), à jour
avec `origin/master`, copie de travail propre. Constat factuel uniquement :
aucune recommandation, aucune implémentation.

## 1. Arborescence

```
src/
├── App.scss                                  (184 lignes) — styles de l'écran POC historique, mort avec App.tsx (cf. §3/§6)
├── App.tsx                                    (8 lignes)   — monte PlaybackPoc ; N'EST PLUS RÉFÉRENCÉ par le router ni par main.tsx (code mort, cf. §3/§6)
├── main.tsx                                    (16 lignes)  — point d'entrée réel : monte AuthProvider + RouterProvider + PwaUpdatePrompt
├── vite-env.d.ts                               (16 lignes)  — déclarations d'environnement Vite
│
├── assets/
│   ├── hero.png                               (image PNG)  — usage non trouvé dans le code
│   ├── react.svg                              (0 ligne)    — asset par défaut du template Vite, inutilisé
│   └── vite.svg                                (1 ligne)    — asset par défaut du template Vite, inutilisé
│
├── audio/
│   ├── audioEngine.ts                          (184 lignes) — classe AudioEngine + TrackLoadError : AudioContext + AudioWorkletNode, chargement/décodage, erreurs attribuées à la piste fautive, API play/pause/seek/mute/loop
│   ├── trackProvider.ts                        (40 lignes)  — TrackByteProvider ; StaticTrackProvider (fetch public/) ET FirebaseTrackProvider (Storage) — cette 2ᵉ classe n'est instanciée nulle part (code mort, cf. §3)
│   ├── trackValidation.ts                      (111 lignes) — validateTrackFile : décodage local + hash SHA-256 + contrôle fréquence/durée avant upload (wizard)
│   └── worklet/
│       ├── mixer-processor.ts                  (256 lignes) — AudioWorkletProcessor : mixage, index maître, gain/rampe, boucle A→B
│       └── protocol.ts                         (23 lignes)  — types des messages thread principal ↔ worklet
│
├── components/
│   ├── Button/                                 (61+55 l.)   — bouton générique, rendu <button> ou <Link> selon la prop `to`
│   ├── Header/                                 (43+64 l.)   — en-tête titre/sous-titre + boutons retour/déconnexion optionnels
│   ├── InstrumentIcon/                         (25+28 l.)   — icône d'instrument en masque CSS depuis public/instruments/{id}.svg
│   ├── PlaybackPoc/                             (89+74 l.)   — UI du lecteur multipiste (POC) ; seul consommateur de useAudioEngine ; INACCESSIBLE depuis l'app (cf. §3/§6)
│   ├── PwaUpdatePrompt/                        (33+37 l.)   — bandeau "nouvelle version" du service worker, sans auto-reload
│   ├── SongCard/                                (18+37 l.)  — carte d'un morceau (titre + chevron), AUCUNE navigation au clic
│   ├── SongList/                                (29+22 l.)  — liste de SongCard ou message d'état vide
│   └── TextField/                              (30+47 l.)   — champ de formulaire label + icône + input
│
├── firebase/
│   ├── config.ts                                (19 lignes)  — initializeApp + getAuth + getFirestore + getStorage, clés lues depuis import.meta.env
│   ├── songImport.ts                            (115 lignes) — orchestration draft→upload pistes→ready (compose songs.ts + trackUpload.ts)
│   ├── songs.ts                                 (173 lignes) — CRUD Firestore collection `songs` (listReadySongs, getSong non utilisés ailleurs, cf. §3)
│   └── trackUpload.ts                           (54 lignes)  — upload/suppression des fichiers Storage songs/{songId}/{trackId}.flac
│
├── hooks/
│   ├── AuthProvider.tsx                        (18 lignes)  — Context provider basé sur onAuthStateChanged
│   ├── NewSongWizardProvider.tsx                (46 lignes)  — état du wizard d'import (titre, piste en cours, pistes confirmées) en mémoire, non persisté
│   ├── useAudioEngine.ts                        (135 lignes) — hook encapsulant AudioEngine ; 4 pistes CODÉES EN DUR (StaticTrackProvider, fichiers public/*.flac), expose `loadError`
│   ├── useAuthUser.ts                            (19 lignes)  — hook + Context de lecture de l'état auth
│   └── useNewSongWizard.ts                      (29 lignes)  — hook + Context de lecture/écriture de l'état du wizard
│
├── router/
│   ├── index.tsx                                (45 lignes)  — routes : "/" (Home, protégée), "/login", "/new-song/*" (wizard, protégé, 4 sous-routes)
│   ├── ProtectedRoute.tsx                       (17 lignes)  — redirige vers /login si pas d'utilisateur
│   └── PublicOnlyRoute.tsx                      (17 lignes)  — redirige vers / si utilisateur déjà connecté
│
├── styles/
│   ├── index.scss                               (8 lignes)
│   ├── reset.scss                               (135 lignes)
│   └── tokens.css                               (12 lignes)
│
├── types/
│   ├── instrument.ts                            (14 lignes)  — InstrumentId (anglais : drums/bass/guitar/keyboard/vocals) + liste INSTRUMENTS (id, label FR)
│   ├── song.ts                                  (4 lignes)   — Song { id, title } — modèle minimal, DIFFÉRENT et DÉCONNECTÉ de SongRecord (firebase/songs.ts), cf. §4
│   └── track.ts                                 (8 lignes)   — WizardTrack { instrument, file, metadata } (état transitoire du wizard, pas le modèle Firestore)
│
└── views/
    ├── Home/                                    (39+17 l.)   — écran principal ; affiche une liste de morceaux EN DUR (mockSongs), n'appelle jamais Firestore (cf. §4/§6)
    ├── LogIn/                                    (70+35 l.)  — formulaire signInWithEmailAndPassword uniquement (pas d'inscription)
    └── NewSong/
        ├── SongName/                             (48+25 l.)  — étape 1 : titre du morceau
        ├── SelectTrack/                          (104+50 l.) — étape 2 : sélection + validation locale d'un fichier FLAC
        ├── SelectInstrument/                     (66+74 l.)  — étape 3 : association piste ↔ instrument
        └── Recap/                                (143+114 l.) — étape 4 : récapitulatif, upload séquentiel des pistes, écriture Firestore finale
```

Total du code applicatif (`.ts`/`.tsx`) : 2165 lignes. En comptant aussi les
`.scss`/`.css` : 3183 lignes.

Répertoires prévus par la structure documentée dans CLAUDE.md — désormais
**tous présents** : `src/components/`, `src/audio/`, `src/firebase/`,
`src/hooks/`, `src/types/` (absents lors du précédent constat, ce n'est
plus le cas).

## 2. Dépendances

**Node / npm** : Node v22.23.1, npm 10.9.8. `.nvmrc` prescrit Node `22`.
Aucune contrainte `engines` dans `package.json`.

`dependencies` :

| Paquet | Version |
|---|---|
| `@fontsource/alegreya-sans` | ^5.3.0 |
| `@fontsource/work-sans` | ^5.3.0 |
| `firebase` | ^12.16.0 |
| `react` | ^19.2.7 |
| `react-dom` | ^19.2.7 |
| `react-icons` | ^5.7.0 |
| `react-router` | ^8.2.0 |

`devDependencies` :

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

- `firebase` est maintenant présent (^12.16.0) — ce n'était pas le cas au
  précédent constat.
- Aucune dépendance de test (`vitest`, `@testing-library/*`, etc.) :
  toujours absente.
- `package.json` ne définit **aucun script `test`**, alors que CLAUDE.md
  documente `npm run test — Vitest` (avec un commentaire HTML dans le
  fichier signalant lui-même cette incohérence).
- `npm run lint` (ESLint) et `tsc -b --noEmit` s'exécutent tous deux sans
  erreur sur l'état actuel du dépôt.

## 3. Moteur audio

Fichiers réels dans `src/audio/` : `audioEngine.ts`, `trackProvider.ts`,
`trackValidation.ts`, `worklet/mixer-processor.ts`, `worklet/protocol.ts`.
Pas de module « transport » ou « loop » séparé : cette logique reste dans
`audioEngine.ts` et `mixer-processor.ts`.

### Signatures publiques exportées

`audioEngine.ts` :
- `SAMPLE_RATE = 44100`
- `interface TrackSource { id, instrument, durationSamples, channels }`
- `interface LoopRange { start: number | null, end: number | null }`
- `class TrackLoadError extends Error` — porte `trackId`, `instrument` et
  `cause` ; message identifiant la piste en échec.
- `class AudioEngine` : `constructor()`, `setPositionListener`,
  `setLoopListener`, `getDurationSamples()`,
  `loadTracks(sources, provider): Promise<TrackSource[]>` (lève un
  `TrackLoadError` si fetch ou décodage échoue), `play()`, `pause()`,
  `setTrackMuted(id, muted)`, `seek(index)`, `toggleLoopPoint()`,
  `dispose()`.

`trackProvider.ts` :
- `interface TrackRequest { id, instrument }`
- `interface TrackByteProvider { fetchTrackBytes(track): Promise<ArrayBuffer> }`
- `class StaticTrackProvider` — fetch `/${id}.flac` sur `public/` — **seule
  implémentation réellement utilisée** (par `useAudioEngine.ts`).
- `class FirebaseTrackProvider` — lit `songs/{songId}/{trackId}.flac`
  depuis Firebase Storage via `getBytes` (pas de streaming) — **définie
  mais jamais instanciée nulle part dans le dépôt : code mort.**

`trackValidation.ts` :
- `DURATION_TOLERANCE_SAMPLES = 22050` (~0,5 s à 44100 Hz)
- `interface TrackReference { sampleRate, durationSamples }`
- `interface ValidatedTrackMetadata { sampleRate, durationSamples, channels, sizeBytes, contentHash }`
- `type TrackRejectionReason` = `sampleRateMismatch | durationMismatch | unreadableFile`
- `type TrackValidationResult` = `{ ok: true, metadata } | { ok: false, reason }`
- `validateTrackFile(file, reference): Promise<TrackValidationResult>` —
  hache (SHA-256) puis décode localement, compare à la référence.

`worklet/protocol.ts` — protocole de messages réellement implémenté :
- Thread principal → worklet : `loadTracks`, `play`, `pause`,
  `setTrackGain { id, gain }`, `seek { index }`, `toggleLoopPoint`.
- Worklet → thread principal : `position { index }`,
  `loop { start, end }`.
- Écart persistant par rapport à `.claude/rules/audio-engine.md` : pas de
  message `stop` distinct de `pause`, pas de `setLoop`/`clearLoop`
  (remplacés par le toggle unique), pas de champ `sampleRate` par message
  (la variable globale du worklet suffit).

### Stubs et code mort — section critique de ce constat

Le moteur audio bas niveau (worklet, index maître, boucle, mute, décodage,
validation) est solide et inchangé dans ses principes. Mais **le wizard
d'import Firebase (§5) et le moteur de lecture (`useAudioEngine.ts`) ne
sont pas reliés entre eux** :

- `PlaybackPoc` (et son parent `App.tsx`) ne sont montés par **aucune
  route** du router (`src/router/index.tsx`) ni par `main.tsx`. C'est du
  code mort du point de vue de l'utilisateur : il compile, mais est
  inatteignable depuis l'application réelle.
- `useAudioEngine.ts` charge 4 pistes codées en dur
  (`Batterie`/`Chant1`/`Clavier`/`Guitare`) via `StaticTrackProvider`
  depuis `public/*.flac` — des fichiers de démonstration, sans aucun lien
  avec les morceaux réels créés par le wizard et stockés dans Firebase.
- `FirebaseTrackProvider` (le fournisseur qui lirait les vraies pistes
  depuis Storage) existe mais n'est utilisé par rien.
- Aucun écran ne permet d'ouvrir/lire un morceau réel : `SongCard` (dans
  `Home`) n'a ni `onClick` ni `Link`, la liste de morceaux affichée est
  `mockSongs` codée en dur dans `Home.tsx`, pas les données Firestore.
- `listReadySongs()` et `getSong()` (`src/firebase/songs.ts`) sont
  exportées mais **appelées nulle part** dans le dépôt : code mort côté
  lecture, symétrique du `FirebaseTrackProvider` côté audio.

Autres constats :
- Gestion d'erreur de piste **désormais implémentée** : `loadTracks` et
  `provider.fetchTrackBytes` sont enveloppés dans un `try/catch` qui lève
  un `TrackLoadError` nommant la piste fautive ; `useAudioEngine.ts`
  expose ce message via `loadError`, affiché par `PlaybackPoc` — mais ceci
  reste invérifiable en usage réel puisque `PlaybackPoc` est inatteignable
  (point ci-dessus).
- Pas de fondu au raccord de boucle (micro-fade) : conforme, la spec le
  marque optionnel/post-v1.
- Pas d'implémentation du ralentissement sans changement de pitch :
  explicitement hors périmètre v1 selon la spec.
- Incohérence de commentaire : `src/firebase/songs.ts` affirme en
  commentaire que les champs `sampleRate`/`durationSamples` du document
  `songs/{songId}` « ne figurent pas dans le modèle de données de
  CLAUDE.md » — c'est **factuellement inexact** : CLAUDE.md (section
  « Modèle de données ») les documente explicitement comme champs
  canoniques posés par le wizard à la finalisation. Le commentaire est
  resté périmé par rapport à une mise à jour antérieure de CLAUDE.md.

## 4. Écarts avec la spécification

| Point de spec | Statut | Fichier concerné |
|---|---|---|
| Un seul `AudioContext` à 44100 Hz | Respecté | `src/audio/audioEngine.ts` |
| Un seul `AudioWorkletNode`/`AudioWorkletProcessor`, pas de `AudioBufferSourceNode`/`<audio>` | Respecté | `src/audio/audioEngine.ts`, `src/audio/worklet/mixer-processor.ts` |
| Pistes stockées en PCM Int16, jamais en `AudioBuffer` Float32 | Respecté | `src/audio/audioEngine.ts` |
| Index de lecture maître unique dans le worklet | Respecté | `src/audio/worklet/mixer-processor.ts` |
| Mute = gain à 0, rampe anti-clic | Respecté | `src/audio/worklet/mixer-processor.ts` |
| Boucle A→B sample-exact | Respecté | `src/audio/worklet/mixer-processor.ts` |
| Déblocage `AudioContext` sur interaction utilisateur (iOS) | Respecté | `src/audio/audioEngine.ts` |
| Décodage séquentiel, fetch parallèle | Respecté | `src/audio/audioEngine.ts` |
| Transfert Int16 via transférables | Respecté | `src/audio/audioEngine.ts` |
| Format FLAC, mono quand la source est mono | Respecté pour les pistes de démo ; **non vérifiable en usage réel** (aucun morceau réel n'est joué, cf. §3) | `public/*.flac`, `src/audio/trackValidation.ts` (aucun contrôle mono/stéréo à l'import, seule la fréquence/durée est validée) |
| Wizard : décodage local avant upload, extraction métadonnées, refus si fréquence/durée incohérente | Respecté | `src/audio/trackValidation.ts`, `src/views/NewSong/SelectTrack/SelectTrack.tsx` |
| Estimation mémoire avant lecture à partir des seules métadonnées Firestore | **Absent** — aucune fonction ne calcule cette estimation, et aucun écran ne lit un morceau réel de toute façon | — |
| Statut `draft`/`ready`, un morceau `draft` n'est ni listé ni jouable | Partiel — le champ existe et est posé correctement par le wizard (`songImport.ts`), mais l'écran `Home` ne filtre rien lui-même : il n'interroge pas Firestore du tout (`mockSongs`), donc la règle n'est ni violée ni démontrée | `src/firebase/songImport.ts`, `src/views/Home/Home.tsx` |
| Si UNE piste échoue au chargement, bloquer et signaler laquelle | Respecté (mécanisme) — `TrackLoadError` ; invérifiable en usage réel car l'écran de lecture est inatteignable | `src/audio/audioEngine.ts` |
| États UI « téléchargement X/N » puis « préparation… » | **Absent** — seuls 3 états globaux `loading/ready/error` | `src/hooks/useAudioEngine.ts` |
| Un seul morceau en RAM, libération au changement de morceau | Non vérifiable — aucune fonctionnalité de changement de morceau n'existe (un seul jeu de pistes codé en dur) | `src/hooks/useAudioEngine.ts` |
| PWA : precache du shell uniquement, jamais l'audio | Respecté | `vite.config.ts` |
| Stockage hors-ligne IndexedDB, téléchargement à la demande | **Absent** | aucune trace dans le dépôt |
| `navigator.storage.persist()` / écran de gestion du stockage | **Absent** | aucune trace |
| Firebase Auth, comptes créés en console, pas d'inscription publique | Respecté | `src/views/LogIn/LogIn.tsx` (`signInWithEmailAndPassword` uniquement, aucun `createUserWithEmailAndPassword` dans tout le dépôt) |
| Règles Firestore/Storage : `request.auth != null`, pas d'allowlist | Respecté | `firestore.rules`, `storage.rules` |
| Modèle Firestore `songs/{songId}` avec `tracks` en tableau embarqué | Respecté dans `src/firebase/songs.ts` (`SongRecord`, `TrackMeta`) | `src/firebase/songs.ts` |
| Modèle partagé exposé via `src/types/` | Partiel/violé — `src/types/song.ts` définit un `Song` minimal (`id`, `title`) **différent et déconnecté** du vrai modèle `SongRecord` de `firebase/songs.ts` ; les deux ne convergent jamais (aucun mapping Firestore → `Song`) | `src/types/song.ts`, `src/firebase/songs.ts` |
| Storage : `songs/{songId}/{trackId}.flac` | Respecté | `src/firebase/trackUpload.ts` |
| TypeScript strict | Respecté | `tsconfig.app.json`, `tsconfig.node.json` |
| Pas de `any` sauf justification | Respecté (aucune occurrence) | — |
| Composants fonctionnels + hooks uniquement | Respecté | `src/components/`, `src/hooks/`, `src/views/` |
| Logique audio indépendante des composants React | Respecté (`src/audio/` n'importe rien de React), à l'exception de l'import Firebase dans `trackProvider.ts` qui est un import de SDK, pas de React | `src/audio/` |
| Identifiants de code en anglais | Partiel — les identifiants du wizard (`InstrumentId` : `drums`, `bass`, `guitar`, `keyboard`, `vocals`) sont en anglais et respectent la convention ; mais les `id` de piste du POC audio historique (`Batterie`, `Chant1`, `Clavier`, `Guitare`) restent en français | `src/types/instrument.ts` (conforme), `src/hooks/useAudioEngine.ts` (non conforme) |
| Icônes react-icons/io5 uniquement | Respecté (`IoAddCircle`, `IoArrowBack`, `IoArrowForward`, `IoCheckbox`, `IoCheckmark`, `IoCheckmarkDone`, `IoFolder`, `IoPower`, `IoSquareOutline`, `IoCaretForward`, `IoText`) | `src/components/`, `src/views/` |
| Pas de secrets committés | Respecté | `.env.local` gitignoré, `src/firebase/config.ts` lit `import.meta.env.VITE_FIREBASE_*` |

## 5. Firebase

- **Dépendance** : `firebase` ^12.16.0 installée. `src/firebase/config.ts`
  initialise `app`, exporte `auth`, `firestore`, `storage`, tous les trois
  utilisés dans le code (Auth par `AuthProvider`/`LogIn`, Firestore par
  `songs.ts`, Storage par `trackUpload.ts`/`trackProvider.ts`).
- **Auth** : `signInWithEmailAndPassword` uniquement (`LogIn.tsx`). Aucun
  `createUserWithEmailAndPassword` ni formulaire d'inscription dans tout
  le dépôt — conforme à CLAUDE.md. `AuthProvider`/`useAuthUser` exposent
  l'état (`user`, `loading`) via Context ; `ProtectedRoute`/
  `PublicOnlyRoute` s'en servent pour les redirections.
- **Firestore** : collection `songs` gérée par `src/firebase/songs.ts`
  (`createDraftSong`, `updateSong`, `deleteSong`, `getSong`,
  `listReadySongs`, `getNextSongOrder`). Le modèle (`SongRecord`,
  `TrackMeta`) correspond fidèlement à celui documenté dans CLAUDE.md
  (tableau `tracks` embarqué, `status draft/ready`, `sampleRate`/
  `durationSamples` posés à la finalisation). Seules `createDraftSong`
  (via `startSongImport`), `updateSong` (via `finalizeSongImport`) et
  `deleteSong` (via `abortSongImport`) sont réellement appelées par
  l'app ; `getSong` et `listReadySongs` sont mortes (cf. §3).
- **Storage** : `src/firebase/trackUpload.ts` fait l'upload
  (`uploadBytesResumable`, avec suivi de progression) et la suppression
  (`deleteObject`/`listAll`) des fichiers `songs/{songId}/{trackId}.flac`.
  Utilisé par le wizard (`Recap.tsx` → `songImport.ts`).
- **Règles de sécurité** : `firestore.rules` et `storage.rules` sont
  présentes à la racine du dépôt, déployables (`firebase.json`,
  `.firebaserc` pointant vers le projet `songbook-97910`). Les deux
  suivent exactement la règle décrite dans CLAUDE.md : accès autorisé si
  `request.auth != null`, tout le reste explicitement refusé — pas
  d'allowlist, pas de distinction de rôle ou de propriétaire.
- **Ce qui est absent** : aucune règle ne distingue `draft` de `ready`
  (un client authentifié peut lire un `draft` par requête directe ; ce
  n'est filtré qu'au niveau applicatif par `listReadySongs`, qui n'est de
  toute façon jamais appelée, cf. §3) ; pas de Cloud Functions ; pas de
  Firebase Hosting (non prévu, cf. CLAUDE.md) ; pas de gestion des
  comptes autre que la console Firebase (conforme, voulu).

## 6. Ce qui fonctionne / ne fonctionne pas

Constat basé sur lecture du code, `npm run lint` (0 erreur) et
`tsc -b --noEmit` (0 erreur). Je n'ai pas ouvert l'app dans un navigateur
ni testé une authentification ou un import réel dans cette session : les
points suivants sont déduits du code, pas observés en exécution.

Démontrable par lecture de code / compilation :
- Le projet compile sans erreur TypeScript et passe le lint sans erreur.
- Le parcours d'authentification (redirection `/login` ↔ `/`) est
  cohérent : `ProtectedRoute`/`PublicOnlyRoute` s'appuient tous deux sur
  `useAuthUser`, qui reflète `onAuthStateChanged`.
- Le wizard d'import (`/new-song/song-name` → `select-track` →
  `select-instrument` → `recap`) est câblé de bout en bout dans le
  router, protégé par `ProtectedRoute`, et son état (titre, pistes
  confirmées) circule via `NewSongWizardProvider`/`useNewSongWizard`.
  `SelectTrack` valide chaque fichier localement (fréquence, durée,
  hash) avant de l'accepter. `Recap.handleFinish` suit exactement la
  séquence documentée dans `songImport.ts` (draft → upload séquentiel
  avec `await` → finalisation unique → `status: "ready"`), avec un
  nettoyage (`abortSongImport`) en cas d'échec.
- Le moteur audio bas niveau (worklet, index maître, boucle A→B, mute
  avec rampe, gestion d'erreur par piste) est implémenté selon le
  protocole documenté.
- Le service worker PWA est configuré pour précacher le shell et exclure
  l'audio.

Ce que je n'ai **pas vérifié en exécution** et ne peux donc pas certifier :
- Qu'une connexion réelle contre Firebase Auth aboutit (nécessite un
  compte créé en console et les variables `VITE_FIREBASE_*` dans
  `.env.local`, que je n'ai pas inspectées).
- Que l'upload réel d'un fichier FLAC vers Firebase Storage aboutit et
  que le document Firestore correspondant passe bien à `ready`.
- Que la lecture audio démarre et reste synchronisée sur un vrai
  navigateur/appareil, ou que le déblocage `AudioContext` fonctionne sur
  iOS Safari — d'autant plus qu'aucun écran de l'app ne permet
  aujourd'hui d'atteindre l'écran de lecture (cf. ci-dessous).
- Que le service worker s'enregistre correctement une fois déployé
  (HTTPS requis, non testable en `npm run dev`).

**Ce qui ne fonctionne manifestement pas, par construction** (vérifiable
par simple lecture du routing, pas par supposition) :
- **On ne peut pas écouter un morceau réel dans l'app aujourd'hui.**
  `Home` affiche une liste figée (`mockSongs`), `SongCard` ne navigue
  nulle part, et le seul composant capable de jouer de l'audio
  (`PlaybackPoc`) n'est monté par aucune route. Le wizard d'import et le
  moteur de lecture sont deux features complètes mais non reliées.
- Authentification par inscription : absente par construction (voulu).
- Téléchargement/lecture hors-ligne via IndexedDB : absent.
- Écran de gestion du stockage : absent.
- Tout test automatisé : `npm run test` n'existe pas en tant que script,
  aucune dépendance de test installée, aucun fichier `*.test.*`/`*.spec.*`.

## 7. Points de blocage

- **Le wizard d'import et la lecture audio ne sont pas reliés** : c'est le
  blocage le plus structurant de l'état actuel. Tant qu'un écran ne lira
  pas un morceau réel (liste Firestore via `listReadySongs`, ouverture
  d'un `SongCard`, `AudioEngine.loadTracks` alimenté par
  `FirebaseTrackProvider` plutôt que par `StaticTrackProvider`), la
  fonctionnalité centrale du produit — écouter et travailler un morceau
  du groupe — reste indémontrable de bout en bout malgré deux moitiés
  fonctionnelles solides.
- **`src/types/song.ts` ne reflète pas le modèle réel** : `Song { id,
  title }` devra converger vers (ou être remplacé par) `SongRecord` de
  `firebase/songs.ts` avant que `Home` puisse afficher de vraies données
  sans réécrire ses composants (`SongCard`, `SongList`).
- **Absence totale de tests automatisés** : `npm run test` est documenté
  dans CLAUDE.md mais n'existe pas. Toute vérification de non-régression
  (sur la synchro comme sur le wizard) est actuellement manuelle.
- **Estimation mémoire avant lecture** : toujours absente du code ; sans
  écran de lecture réel, ce garde-fou n'a même pas encore de point
  d'insertion évident dans le flux actuel.
- **Hors-ligne (IndexedDB, `storage.persist()`, écran de stockage)** :
  rien n'existe ; secondaire selon les priorités produit mais à garder en
  tête une fois la lecture réelle branchée.
- **Pas de vérification empirique iOS** : aucun test constaté dans ce
  dépôt (pas de captures, pas de notes, pas de CI mobile) ; d'autant plus
  impossible à évaluer tant que l'écran de lecture reste inatteignable.
