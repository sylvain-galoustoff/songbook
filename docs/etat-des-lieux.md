# État des lieux — Songbook

Document généré automatiquement (`/etat-des-lieux`). Constat factuel, pas de
recommandations. Dernière génération : 2026-07-19, à partir du commit `01d4f34`
(branche `master`), avec les fichiers suivants modifiés mais non commités dans
la copie de travail : `CLAUDE.md`, `.claude/rules/audio-engine.md`,
`src/audio/audioEngine.ts`, `src/hooks/useAudioEngine.ts`,
`src/components/PlaybackPoc/PlaybackPoc.tsx`, `src/views/Home/Home.tsx`,
`docs/etat-des-lieux.md` (ce fichier).

## 1. Arborescence de `src/`

```
src/
├── App.tsx                          (8 lignes)  — composant racine historique, N'EST PLUS MONTÉ (voir §3bis/§6, code mort)
├── App.scss                         (184 lignes) — styles associés à App.tsx (mort avec lui)
├── main.tsx                         (16 lignes) — point d'entrée réel : monte AuthProvider + RouterProvider + PwaUpdatePrompt
├── vite-env.d.ts                    (16 lignes) — déclarations d'environnement Vite
│
├── assets/
│   ├── hero.png                     (binaire)   — image, usage non trouvé dans le code
│   ├── react.svg                    (0 ligne)   — asset par défaut du template Vite, inutilisé
│   └── vite.svg                     (1 ligne)   — asset par défaut du template Vite, inutilisé
│
├── audio/
│   ├── audioEngine.ts               (184 lignes) — classe AudioEngine + TrackLoadError : AudioContext + AudioWorkletNode, chargement/décodage des pistes (erreurs attribuées à la piste fautive), API play/pause/seek/mute/loop
│   ├── trackProvider.ts             (21 lignes)  — StaticTrackProvider : fetch des .flac depuis /public (pas Firebase Storage)
│   └── worklet/
│       ├── mixer-processor.ts       (256 lignes) — AudioWorkletProcessor : mixage, index maître, gain/rampe, boucle A→B
│       └── protocol.ts              (23 lignes)  — types des messages thread principal ↔ worklet
│
├── components/
│   ├── Button/                      (Button.tsx 49 l. + module.scss 46 l.) — bouton générique (lien ou submit)
│   ├── Header/                      (Header.tsx 32 l. + module.scss 52 l.) — en-tête titre/sous-titre/logout
│   ├── PlaybackPoc/                 (PlaybackPoc.tsx 89 l. + scss 74 l.) — UI du lecteur multipiste (POC), seul consommateur de useAudioEngine, affiche désormais le message d'erreur de chargement le cas échéant
│   ├── PwaUpdatePrompt/             (PwaUpdatePrompt.tsx 33 l. + scss 37 l.) — bandeau "nouvelle version" du SW, sans auto-reload
│   ├── SongCard/                    (SongCard.tsx 18 l. + module.scss 37 l.) — carte d'un morceau (titre + chevron)
│   ├── SongList/                    (SongList.tsx 29 l. + module.scss 22 l.) — liste de SongCard ou état vide
│   └── TextField/                   (TextField.tsx 30 l. + module.scss 47 l.) — champ de formulaire label+input
│
├── firebase/
│   └── config.ts                    (15 lignes)  — initializeApp + getAuth uniquement. Pas de getFirestore, pas de getStorage.
│
├── hooks/
│   ├── AuthProvider.tsx             (18 lignes)  — Context provider basé sur onAuthStateChanged
│   ├── useAuthUser.ts                (19 lignes)  — hook + Context de lecture de l'état auth
│   └── useAudioEngine.ts            (135 lignes) — hook React encapsulant AudioEngine, liste de pistes CODÉE EN DUR (4 pistes), expose désormais `loadError` (message identifiant la piste en échec)
│
├── router/
│   ├── index.tsx                    (29 lignes)  — 3 routes : "/" (Home, protégée), "/login", "/signin"
│   ├── ProtectedRoute.tsx           (17 lignes)  — redirige vers /login si pas d'utilisateur
│   └── PublicOnlyRoute.tsx          (17 lignes)  — redirige vers / si utilisateur déjà connecté
│
├── styles/
│   ├── index.scss                   (8 lignes)
│   ├── reset.scss                   (135 lignes)
│   └── tokens.css                   (12 lignes)
│
├── types/
│   └── song.ts                      (4 lignes)   — type Song { id, title } — pas de tracks, pas de status, pas de metadata (tempo/key/order)
│
└── views/
    ├── Home/                        (Home.tsx 39 l. + module.scss 17 l.) — écran principal, données de morceaux EN DUR (mockSongs)
    ├── LogIn/                       (LogIn.tsx 76 l. + module.scss 50 l.) — formulaire signInWithEmailAndPassword, lien vers /signin
    └── Signin/                      (Signin.tsx 95 l. + module.scss 50 l.) — formulaire createUserWithEmailAndPassword — voir §4/§7 : ce parcours est désormais explicitement interdit par CLAUDE.md à jour, mais toujours présent et accessible dans le code
```

## 2. Dépendances

**Node / npm (environnement d'exécution actuel)** : Node v22.23.1, npm 10.9.8.
`.nvmrc` prescrit Node `22`. Aucune contrainte `engines` dans `package.json` (les
seules entrées `engines` trouvées viennent de paquets tiers dans
`package-lock.json`, pas du projet lui-même).

**`dependencies`**

| Paquet | Version |
|---|---|
| `@fontsource/alegreya-sans` | ^5.3.0 |
| `@fontsource/work-sans` | ^5.3.0 |
| `firebase` | ^12.16.0 |
| `react` | ^19.2.7 |
| `react-dom` | ^19.2.7 |
| `react-icons` | ^5.7.0 |
| `react-router` | ^8.2.0 |

**`devDependencies`**

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

**Aucune dépendance de test** : ni `vitest` ni équivalent n'est présente dans
`package.json`. Ce fait est maintenant signalé par un commentaire HTML dans
`CLAUDE.md` (section « Commandes »), mais la commande `npm run test` reste
documentée et **n'existe toujours pas**. Voir §7.

## 3. Moteur audio

Fichiers réels dans `src/audio/` : `audioEngine.ts`, `trackProvider.ts`,
`worklet/mixer-processor.ts`, `worklet/protocol.ts`. Pas d'autre fichier
(pas de module "transport" ni "loop" séparés — tout est dans ces quatre fichiers).

### Signatures publiques exportées

`audioEngine.ts` :
- `SAMPLE_RATE = 44100`
- `interface TrackSource { id, instrument, durationSamples, channels }`
- `interface LoopRange { start: number | null, end: number | null }`
- `class TrackLoadError extends Error` — nouveau. Porte `trackId`, `instrument`
  et `cause` (l'erreur d'origine), avec un message identifiant la piste en
  échec (ex. `Échec du chargement de la piste "Guitare".`).
- `class AudioEngine` :
  - `constructor()`
  - `setPositionListener(listener)`
  - `setLoopListener(listener)`
  - `getDurationSamples(): number`
  - `async loadTracks(sources, provider): Promise<TrackSource[]>` — lève
    désormais un `TrackLoadError` (au lieu d'une erreur brute) si le fetch ou
    le décodage d'une piste échoue.
  - `async play(): Promise<void>`
  - `pause(): void`
  - `setTrackMuted(id, muted): void`
  - `seek(index): void`
  - `toggleLoopPoint(): void`
  - `dispose(): void`

`trackProvider.ts` :
- `interface TrackRequest { id, instrument }`
- `interface TrackByteProvider { fetchTrackBytes(track): Promise<ArrayBuffer> }`
- `class StaticTrackProvider implements TrackByteProvider` — fetch statique
  `/${track.id}.flac` (fichiers servis depuis `public/`, PAS depuis Firebase
  Storage).

`worklet/protocol.ts` :
- `interface TrackPayload { id, channels: ArrayBuffer[], length }`
- `type MainToWorkletMessage` = `loadTracks | play | pause | setTrackGain | seek | toggleLoopPoint`
- `type WorkletToMainMessage` = `position | loop`

`worklet/mixer-processor.ts` :
- `class MixerProcessor extends AudioWorkletProcessor`, enregistrée sous le nom
  `"mixer-processor"`.

### Protocole de messages effectivement implémenté

Thread principal → worklet : `loadTracks`, `play`, `pause`, `setTrackGain`,
`seek`, `toggleLoopPoint`.

Worklet → thread principal : `position` (throttlé à 0.1s), `loop` (start/end).

Ce protocole correspond maintenant exactement à celui documenté dans
`.claude/rules/audio-engine.md` (la spec a été alignée sur le code : le
message `toggleLoopPoint` sans paramètre y est désormais décrit tel qu'il est
implémenté, à la place de l'ancien `setLoop`/`clearLoop` qui n'a jamais existé
dans le code).

### Stubs et code mort

- **Aucun stub** : les fonctions exportées ont toutes un corps non trivial.
- **`toggleLoopPoint`** implémente la boucle A→B complète (y compris le cas "B
  derrière la tête de lecture" et "seek hors [A,B] efface la boucle"), telle
  que figée dans `audio-engine.md`.
- **Fin de piste** : à `masterIndex >= trackLength`, la lecture s'arrête
  (`playing = false`), sans bouclage automatique — comportement documenté comme
  volontaire pour ce POC (commentaire dans `mixer-processor.ts:188-191`).
- **Échec de chargement d'une piste** : `loadTracks` attribue désormais
  l'échec à la piste fautive via `TrackLoadError` (`audioEngine.ts:96-103` pour
  le fetch, `:111-117` pour le décodage). `useAudioEngine.ts:57-66` capture
  cette erreur et expose son message dans `loadError`. `PlaybackPoc.tsx`
  l'affiche (`load-error`). Ce n'est plus un écart avec la spec (voir §4).
- **`src/App.tsx`** (racine historique montant `<PlaybackPoc />`) n'est
  référencé par aucun autre fichier. `index.html` charge `/src/main.tsx`, qui
  monte le `router` (pas `App`). `App.tsx` et `App.scss` sont donc du **code
  mort** — `PlaybackPoc` n'est atteignable que via ce fichier orphelin,
  autrement dit **le POC audio n'est actuellement monté nulle part dans
  l'application réelle** (voir §6). Ce POC reste volontairement en l'état
  (code d'exemple), sans être relié au reste de l'app.
- **`useAudioEngine.ts`** code en dur une liste fixe de 4 pistes
  (`Batterie`, `Chant1`, `Clavier`, `Guitare`) au lieu de les charger depuis
  Firestore — cohérent avec le stade POC, mais à noter comme donnée statique.

## 4. Écarts avec la spécification

*Spécification de référence : `CLAUDE.md` et `.claude/rules/audio-engine.md`
tels que modifiés dans cette session (allowlist abandonnée, `tracks` en
tableau embarqué, statut `draft`/`ready`, métadonnées audio par piste,
protocole worklet aligné sur le code).*

| Point de spec | Statut | Fichier(s) concerné(s) |
|---|---|---|
| Un seul `AudioContext` (44100 Hz) + un seul `AudioWorkletNode` | **Respecté** | `src/audio/audioEngine.ts` |
| Pas de `AudioBufferSourceNode`, pas de `<audio>`, pas de streaming | **Respecté** | `src/audio/audioEngine.ts`, `trackProvider.ts` |
| Pistes en PCM Int16, jamais `AudioBuffer` Float32 conservé | **Respecté** | `mixer-processor.ts` (stocke `Int16Array`), conversion immédiate dans `audioEngine.ts:118-124` |
| Index de lecture maître unique dans le worklet | **Respecté** | `mixer-processor.ts` (`masterIndex`) |
| Mute = gain de piste à 0 dans le mixage, indépendant de la position | **Respecté** | `mixer-processor.ts:154-171` |
| Rampe courte sur les changements de gain | **Respecté** | `mixer-processor.ts` (`GAIN_RAMP_DURATION_SECONDS = 0.005`) |
| Boucle A→B sample-exact, un seul contrôle `toggleLoopPoint` à 3 états | **Respecté** | `mixer-processor.ts:107-131, 214-223` ; spec alignée dans `audio-engine.md` |
| Décodage séquentiel des pistes (pas parallèle) | **Respecté** | `audioEngine.ts:109-132` (boucle `for` séquentielle), fetch en parallèle via `Promise.all` |
| Transfert des buffers Int16 au worklet via `postMessage` + transférables | **Respecté** | `audioEngine.ts:135` (`transferables` peuplé et passé) |
| Débloquer l'`AudioContext` sur interaction utilisateur (iOS) | **Respecté** | `audioEngine.ts:139-143` (`context.resume()` dans `play()`) |
| Position affichée exclusivement via messages `position` du worklet | **Respecté** | `useAudioEngine.ts:45` (sauf pendant un drag de seek, cf. commentaire `useAudioEngine.ts:99-107`, écart mineur assumé) |
| Si une piste échoue, bloquer tout le morceau et signaler laquelle | **Respecté** (nouveau) | `audioEngine.ts` (`TrackLoadError`), `useAudioEngine.ts:57-66` (`loadError`), `PlaybackPoc.tsx` (affichage) |
| États UI "téléchargement X/N" puis "préparation…" | **Absent** (inchangé) | `PlaybackPoc.tsx` — un seul état `"loading"` générique ("Chargement…"), pas de progression |
| Estimer le poids mémoire avant décodage, avertir si dépassement budget | **Absent** | aucune trace dans `audioEngine.ts` |
| Estimation mémoire calculée à partir des seules métadonnées Firestore, avant tout téléchargement | **Absent** | Firestore n'est pas utilisé (voir §5) ; aucune estimation mémoire du tout actuellement |
| Mode réduit 32 kHz (cran de sécurité mémoire) | **Absent** (explicitement hors v1 dans la spec) | — |
| Libérer les références des buffers au changement de morceau | **Non vérifiable / absent** | `AudioEngine` ne gère qu'un seul morceau fixe pour l'instant (pas de flux "changer de morceau" implémenté) |
| Wizard d'import : décodage local avant upload, rejet piste hors fréquence/durée du morceau | **Absent** | aucun composant/flux d'import de piste dans `src/` |
| Champ `status` (`draft`/`ready`) sur les morceaux, morceau `draft` ni listé ni jouable | **Absent** | `types/song.ts` (`Song`) n'a que `id`/`title` ; `Home.tsx` liste `mockSongs` sans notion de statut |
| Métadonnées audio par piste (sampleRate, durationSamples, channels, sizeBytes, contentHash) stockées | **Absent** | Firestore non utilisé ; `TrackSource` (local, en mémoire) n'a que `durationSamples`/`channels`, pas `sampleRate`/`sizeBytes`/`contentHash` |
| **PWA installable, precache du shell uniquement, jamais l'audio** | **Respecté** | `vite.config.ts` (`globIgnores` exclut `mp3/flac/wav` explicitement) |
| Audio hors-ligne en IndexedDB, téléchargé à la demande | **Absent** | aucune référence à IndexedDB dans `src/` ; les FLAC sont servis statiquement depuis `public/` |
| Écran de gestion du stockage (`navigator.storage.estimate()`, purge) | **Absent** | aucun composant ni hook correspondant |
| `navigator.storage.persist()` proposé | **Absent** | aucune référence trouvée |
| **Auth : pas d'allowlist, pas d'inscription publique, comptes créés en console Firebase** | **Violé** | `Signin.tsx` implémente toujours `createUserWithEmailAndPassword`, exposé publiquement via la route `/signin` et un lien depuis `LogIn.tsx` (`Pas de compte ? Inscrivez-vous`) — contredit directement la nouvelle section « Auth » et la nouvelle règle « À NE JAMAIS FAIRE » de `CLAUDE.md` |
| Règles de sécurité Firestore/Storage exigeant `request.auth != null` | **Absent** | aucun fichier `firestore.rules`/`storage.rules` dans le dépôt (voir §5) — sans conséquence pratique tant que Firestore/Storage ne sont pas branchés |
| Firestore : `songs/{songId}` avec `tracks` en tableau embarqué (pas de sous-collection) | **Absent** | `Home.tsx` utilise un tableau `mockSongs` codé en dur ; aucun appel `getFirestore`/`collection` dans tout `src/` |
| Storage : `songs/{songId}/{trackId}.flac` | **Absent** | les FLAC sont servis depuis `public/`, pas depuis Firebase Storage ; aucun appel `getStorage` dans `src/` |
| Composants fonctionnels + hooks uniquement | **Respecté** | tous les composants lus sont des fonctions |
| TypeScript strict, pas de `any` | **Respecté** | `tsconfig.app.json` a `"strict": true` ; aucun `any` rencontré dans les fichiers lus ; `npx tsc -b` passe sans erreur |
| Logique audio indépendante des composants React | **Respecté** | `src/audio/` n'importe rien de React |
| Ralentissement sans changement de pitch | **Absent** (explicitement hors périmètre v1 dans la spec) | — |

## 5. Firebase

- **Auth** : configurée et fonctionnelle côté client (`src/firebase/config.ts`
  appelle `getAuth(app)`). `AuthProvider` écoute `onAuthStateChanged`.
  Sign-in (`LogIn.tsx`) et sign-up (`Signin.tsx`) sont tous deux implémentés
  avec email/mot de passe. **La spec a changé** (voir §4) : `CLAUDE.md`
  interdit désormais explicitement tout parcours d'inscription publique et
  prescrit des comptes créés uniquement en console Firebase — mais le code
  n'a pas été modifié en conséquence, `Signin.tsx` et la route `/signin`
  restent pleinement fonctionnels et accessibles depuis `LogIn.tsx`.
- **Firestore** : **non configuré**. Aucun appel `getFirestore` dans le code.
  Le modèle de données `songs/` (avec `tracks` embarqué et `status`) décrit
  dans `CLAUDE.md` n'existe nulle part dans le code — `Home.tsx` utilise des
  données en dur.
- **Storage** : **non configuré**. Aucun appel `getStorage`. Les fichiers audio
  sont servis comme assets statiques Vite depuis `public/*.flac`.
- **Règles de sécurité** : **absentes**. Aucun fichier `firestore.rules`,
  `storage.rules` ni `firebase.json` n'existe dans le dépôt (recherche à la
  racine et sur deux niveaux, aucun résultat).
- **Variables d'environnement** : `.env.local` et `.env.example` existent à la
  racine (non lisibles depuis cet outil, exclus par la configuration de
  permissions) ; `.gitignore` exclut correctement `.env` et `.env.local` du
  dépôt Git.

## 6. Ce qui fonctionne / ne fonctionne pas

**Vérifié par exécution d'outils dans cette session** (pas de serveur de dev
lancé ni de test manuel dans un navigateur) :

- `npx tsc -b` — **passe sans erreur**, y compris après l'ajout de
  `TrackLoadError` et des champs `loadError`.
- `npx eslint .` — **passe sans erreur**.
- Un dossier `dist/` existant sur disque (contenant les FLAC, le service
  worker `sw.js`, `manifest.webmanifest`) atteste qu'un `npm run build`
  **a déjà réussi** à une exécution antérieure. Non re-testé dans cette
  session après les derniers changements.

**Non vérifié à l'exécution (à ne pas supposer)** :

- Le comportement réel du moteur audio dans un navigateur (lecture, mute,
  boucle A→B, synchro échantillon-exacte, affichage du message d'erreur en
  cas de piste manquante) n'a pas été testé ici — l'analyse ci-dessus est une
  lecture statique du code, pas une observation d'exécution.
- Le flux d'authentification (création de compte, connexion, redirections de
  route) n'a pas été exercé dans un navigateur.
- Le comportement du service worker / prompt de mise à jour PWA n'a pas été
  observé en conditions réelles.

**Constat structurel important** (inchangé) : `App.tsx`, qui montait le
composant `PlaybackPoc` (donc le lecteur audio multipiste), n'est importé par
aucun autre fichier. Le point d'entrée réel (`main.tsx`) monte le `router`,
dont la route `"/"` affiche `Home` (liste de morceaux mockée), pas le
lecteur. **Le POC du moteur audio n'est donc actuellement accessible nulle
part dans l'application telle que servie.**

Il n'existe aucun test automatisé (§7), donc aucune de ces affirmations
n'est vérifiable autrement que par lecture du code ou exécution manuelle.

## 7. Points de blocage

- **Contradiction Auth active** : `CLAUDE.md` interdit désormais explicitement
  l'inscription publique et exige des comptes créés en console Firebase, mais
  `Signin.tsx` (formulaire `createUserWithEmailAndPassword`, route `/signin`,
  lien depuis `LogIn.tsx`) reste présent et pleinement fonctionnel dans le
  code. C'est la contradiction la plus directe entre doc et code à ce jour.
- **Aucun test automatisé.** `package.json` ne déclare ni script `test` ni
  dépendance `vitest` (ou équivalent), alors que `CLAUDE.md` documente
  toujours `npm run test` (désormais accompagné d'un commentaire HTML
  signalant l'écart) — la commande **n'existe pas** dans ce dépôt.
- **Le lecteur audio (cœur du produit) n'est monté nulle part** dans
  l'application réelle (voir §6) — `App.tsx` est orphelin.
- **Aucune donnée réelle** : morceaux (`Home.tsx`) et pistes
  (`useAudioEngine.ts`) sont codés en dur ; Firestore et Storage, censés être
  la source de vérité selon `CLAUDE.md` (avec le nouveau modèle `tracks`
  embarqué, `status`, métadonnées audio), ne sont branchés nulle part dans le
  code.
- **Wizard d'import et validations associées absents** : ni décodage local
  avant upload, ni rejet des pistes hors fréquence/durée, ni champ `status`,
  ni métadonnées audio (sampleRate, sizeBytes, contentHash) persistées.
- **Aucune règle de sécurité Firestore/Storage** n'existe dans le dépôt — mais
  comme Firestore/Storage eux-mêmes ne sont pas encore utilisés côté client,
  ce point est actuellement sans conséquence pratique ; il deviendra bloquant
  dès que ces services seront branchés.
- **Aucune brique hors-ligne** (IndexedDB, écran de gestion du stockage,
  `navigator.storage.persist()`) — le hors-ligne est documenté comme
  secondaire dans `CLAUDE.md`, cohérent avec son absence actuelle, mais il est
  entièrement à construire.
- **Estimation mémoire absente**, y compris la nouvelle exigence de la
  calculer à partir des seules métadonnées Firestore — non bloquant tant que
  les morceaux testés restent petits, mais aucun garde-fou n'existe contre le
  cas extrême documenté (~500 Mo, iOS tue l'onglet sans erreur).

**Résolu depuis la précédente génération** : la gestion d'erreur de
chargement de piste identifie désormais la piste fautive (`TrackLoadError`),
conformément à `.claude/rules/audio-engine.md` — ce n'est plus un point de
blocage.
