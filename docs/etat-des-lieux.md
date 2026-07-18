# État des lieux du code — Songbook

Document généré par analyse statique du dépôt à la date du 2026-07-18,
branche `feat/audio-sync-poc` (état non commité de la copie de travail
inclus). Constat factuel uniquement : aucune recommandation, aucune
implémentation.

## 1. Arborescence

```
src/
├── App.scss                                  — styles racine de l'app (184 lignes)
├── App.tsx                                    — composant racine, monte PlaybackPoc (8 lignes)
├── main.tsx                                    — point d'entrée React, monte le router + PwaUpdatePrompt (13 lignes)
├── vite-env.d.ts                               — déclarations d'ambiance Vite par défaut (3 lignes)
├── assets/
│   ├── hero.png                               — image (asset, non listée en lignes)
│   ├── react.svg                              — logo React par défaut du template Vite (asset)
│   └── vite.svg                                — logo Vite par défaut du template Vite (asset)
├── audio/
│   ├── audioEngine.ts                          — classe AudioEngine : création AudioContext, chargement/décodage pistes, API play/pause/seek/mute/loop (157 lignes)
│   ├── trackProvider.ts                        — abstraction TrackByteProvider + implémentation StaticTrackProvider (fetch depuis public/) (21 lignes)
│   └── worklet/
│       ├── mixer-processor.ts                  — AudioWorkletProcessor : mixage, index maître, gain/rampe, boucle A→B (256 lignes)
│       └── protocol.ts                         — types des messages thread principal ↔ worklet (23 lignes)
├── components/
│   ├── PlaybackPoc/
│   │   ├── PlaybackPoc.scss                    — styles du composant (74 lignes)
│   │   └── PlaybackPoc.tsx                     — UI de lecture : play/pause, seek bar, mutes, bouton boucle (84 lignes)
│   └── PwaUpdatePrompt/
│       ├── PwaUpdatePrompt.scss                — styles du composant (37 lignes)
│       └── PwaUpdatePrompt.tsx                 — bandeau "nouvelle version disponible" (Workbox) (33 lignes)
├── hooks/
│   └── useAudioEngine.ts                       — hook React encapsulant AudioEngine + état UI (121 lignes)
├── router/
│   └── index.tsx                                — un seul route "/" → App (9 lignes)
└── styles/
    ├── index.scss                               — point d'entrée SCSS global (1 ligne)
    └── reset.scss                               — reset CSS (135 lignes)
```

Total du code applicatif (hors assets) : 1159 lignes.

Répertoires prévus par la structure documentée dans CLAUDE.md mais
**absents** : `src/firebase/`, `src/types/`.

## 2. Dépendances

`package.json` :

```json
"dependencies": {
  "react": "^19.2.7",
  "react-dom": "^19.2.7",
  "react-router": "^8.2.0"
},
"devDependencies": {
  "@eslint/js": "^10.0.1",
  "@types/node": "^24.13.2",
  "@types/react": "^19.2.17",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.3",
  "eslint": "^10.6.0",
  "eslint-plugin-react-hooks": "^7.1.1",
  "eslint-plugin-react-refresh": "^0.5.3",
  "globals": "^17.7.0",
  "sass-embedded": "^1.100.0",
  "typescript": "~6.0.2",
  "typescript-eslint": "^8.62.0",
  "vite": "^8.1.1",
  "vite-plugin-pwa": "^1.3.0"
}
```

- Aucune dépendance `firebase` (ni `firebase`, ni `firebase-admin`, ni SDK modulaire) n'est présente dans `package.json`, ni ailleurs dans le dépôt (recherche `firebase` limitée à des lignes de permissions dans `.claude/settings.json`, sans rapport avec le code applicatif).
- Aucune dépendance de test (`vitest`, `@testing-library/*`, etc.).
- Node : v22.23.1 (fixé par `.nvmrc` = `22`).
- npm : 10.9.8.
- `package.json` ne définit **aucun script `test`**, alors que CLAUDE.md documente `npm run test — Vitest`.
- `npm run lint` (ESLint) et `tsc -b --noEmit` s'exécutent tous deux sans erreur sur l'état actuel du dépôt.

## 3. Moteur audio

Fichiers présents dans `src/audio/` : `audioEngine.ts`, `trackProvider.ts`, `worklet/protocol.ts`, `worklet/mixer-processor.ts`. Aucun fichier de "transport" ou de "boucle" séparé : cette logique est intégrée directement dans `audioEngine.ts` (thread principal) et `mixer-processor.ts` (worklet).

### `audioEngine.ts` — API publique exportée

- `SAMPLE_RATE` (constante = 44100)
- `interface TrackSource { id, instrument, durationSamples, channels }` — métadonnées réelles d'une piste, connues seulement après décodage
- `interface LoopRange { start, end }`
- `class AudioEngine` :
  - `constructor()`
  - `setPositionListener(listener)`
  - `setLoopListener(listener)`
  - `getDurationSamples()`
  - `loadTracks(sources: TrackRequest[], provider: TrackByteProvider): Promise<TrackSource[]>`
  - `play(): Promise<void>`
  - `pause(): void`
  - `setTrackMuted(id, muted): void`
  - `seek(index): void`
  - `toggleLoopPoint(): void`
  - `dispose(): void`

Pas de méthode `stop()`, `setLoop(a,b)`/`clearLoop()` explicites : le protocole n'expose qu'un `toggleLoopPoint` à trois états (rien → A → B → rien), piloté par un seul bouton UI. Pas de méthode de sélection de morceau (un seul morceau est câblé en dur, cf. section 6).

### `trackProvider.ts` — API publique exportée

- `interface TrackRequest { id, instrument }` — ce qui est demandé (avant fetch)
- `interface TrackByteProvider { fetchTrackBytes(track: TrackRequest): Promise<ArrayBuffer> }` — contrat d'obtention des octets bruts d'une piste
- `class StaticTrackProvider implements TrackByteProvider` — unique implémentation : fait `fetch(`/${track.id}.flac`)` sur `public/`. Le chemin est construit par convention de nommage (id de piste = nom de fichier), sans passer par Firestore/Storage.

Cette abstraction sépare la source des octets (aujourd'hui : fichiers statiques `public/`) du décodage/mixage dans `AudioEngine`, ce qui rendrait un remplacement futur par un fournisseur Firebase Storage possible sans toucher au moteur — mais ce remplacement n'existe pas encore : `StaticTrackProvider` est la seule implémentation du dépôt.

### `worklet/protocol.ts` — protocole de messages réellement implémenté

Thread principal → worklet (`MainToWorkletMessage`) :
- `loadTracks` (tableau de `TrackPayload { id, channels: ArrayBuffer[], length }`)
- `play`
- `pause`
- `setTrackGain { id, gain }`
- `seek { index }`
- `toggleLoopPoint`

Worklet → thread principal (`WorkletToMainMessage`) :
- `position { index }`
- `loop { start, end }`

Écart par rapport au protocole décrit dans `.claude/rules/audio-engine.md` : pas de message `stop` distinct de `pause`, pas de `setLoop`/`clearLoop` (remplacés par le toggle unique), pas de champs `channels`/`sampleRate` par piste dans le message (le `sampleRate` global vient de la variable globale du worklet, pas d'un message dédié).

### Ce qui est un stub ou du code mort

- Rien d'identifié comme stub silencieux : chaque message du protocole a un handler implémenté dans `mixer-processor.ts` (`handleMessage`).
- Le paramètre `_inputs` de `process()` est explicitement ignoré (préfixé `_`), cohérent avec `numberOfInputs: 0` déclaré à la création du node — pas du code mort, un choix volontaire (pas d'entrée audio).
- Pas de gestion d'erreur de piste individuelle : `loadTracks` dans `audioEngine.ts` utilise `Promise.all` sur `provider.fetchTrackBytes(...)` puis une boucle séquentielle pour le décodage, mais **aucun `try/catch`** n'entoure fetch ou décodage — une erreur sur une piste fait planter la promesse globale sans message d'erreur ciblé ni état "quelle piste a échoué" (cf. section 4). `StaticTrackProvider.fetchTrackBytes` ne vérifie pas non plus `response.ok` avant d'appeler `.arrayBuffer()` : une 404 ne lève pas d'erreur explicite, elle produit un `ArrayBuffer` qui échouera probablement au décodage avec un message générique.
- Pas de fondu au raccord de boucle (micro-fade), conforme à la spec qui le marque optionnel/post-v1.
- Pas d'implémentation du ralentissement sans changement de pitch (explicitement hors périmètre v1 selon la spec).

## 4. Écarts avec la spécification

| Point de spec | Statut | Fichier concerné |
|---|---|---|
| Un seul `AudioContext` à 44100 Hz | Respecté | `src/audio/audioEngine.ts` |
| Un seul `AudioWorkletNode`/`AudioWorkletProcessor` qui mixe toutes les pistes, pas de `AudioBufferSourceNode`/`<audio>` | Respecté | `src/audio/audioEngine.ts`, `src/audio/worklet/mixer-processor.ts` |
| Pistes stockées en PCM Int16, jamais en `AudioBuffer` Float32 | Respecté (conversion immédiate après `decodeAudioData`) | `src/audio/audioEngine.ts` |
| Index de lecture maître unique dans le worklet, source de vérité | Respecté | `src/audio/worklet/mixer-processor.ts` |
| Mute = gain de piste à 0 dans le mixage, ramp anti-clic | Respecté | `src/audio/worklet/mixer-processor.ts` |
| Boucle A→B sample-exact, bornage de l'index maître | Respecté (boucle testée par échantillon, pas par bloc) | `src/audio/worklet/mixer-processor.ts` |
| Déblocage `AudioContext` sur interaction utilisateur (iOS) | Respecté (`context.resume()` dans `play()`) | `src/audio/audioEngine.ts` |
| Décodage séquentiel des pistes (fetch parallèle, décodage séquentiel) | Respecté | `src/audio/audioEngine.ts` |
| Transfert des buffers Int16 au worklet via transférables | Respecté (`transferables` passés à `postMessage`) | `src/audio/audioEngine.ts` |
| Chargement du worklet via `audioWorklet.addModule()` + fichier dédié Vite | Respecté (`?worker&url`) | `src/audio/audioEngine.ts` |
| Format audio source : FLAC | Respecté | `public/Batterie.flac`, `Chant1.flac`, `Clavier.flac`, `Guitare.flac` (vérifié via `ffprobe` : codec `flac`, 44100 Hz) |
| Mono quand la source est mono | Respecté | les 4 fichiers `public/*.flac` sont mono (`channels=1`, vérifié via `ffprobe`) |
| Si UNE piste échoue, bloquer tout le morceau et signaler laquelle | **Absent** | `src/audio/audioEngine.ts`, `src/audio/trackProvider.ts` (aucun `try/catch`, aucune vérification `response.ok`, aucune piste identifiée en cas d'échec) |
| États UI « téléchargement X/N » puis « préparation… » | **Absent** (seuls 3 états globaux `loading/ready/error` existent, sans détail X/N) | `src/hooks/useAudioEngine.ts` |
| Estimer le poids mémoire avant décodage, avertir si dépassement budget | **Absent** | aucune trace dans `src/audio/audioEngine.ts` |
| Cran de sécurité 32 kHz pour cas extrêmes | Absent (marqué optionnel/hors v1 dans la spec elle-même) | — |
| `SharedArrayBuffer` non utilisé en v1 | Respecté (aucune trace) | — |
| Un seul morceau en RAM, libération au changement de morceau | Non vérifiable — il n'existe qu'un seul morceau câblé en dur, aucune fonctionnalité de changement de morceau n'existe | `src/hooks/useAudioEngine.ts` |
| PWA : precache du shell uniquement, jamais l'audio | Respecté | `vite.config.ts` (`globIgnores` exclut mp3/flac/wav) |
| Stockage hors-ligne des pistes en IndexedDB, téléchargement à la demande | **Absent** | aucune trace d'IndexedDB dans le dépôt |
| `navigator.storage.persist()` / écran de gestion du stockage | **Absent** | aucune trace |
| Firebase Auth (allowlist d'emails) | **Absent** | aucune dépendance `firebase`, aucun code d'auth |
| Firestore (songs/tracks/members) | **Absent** | aucune dépendance, aucun modèle de données implémenté |
| Storage Firebase (fichiers audio) | **Absent** — les pistes sont servies depuis `public/` (statique Vite), pas depuis Firebase Storage | `public/*.flac`, `src/audio/trackProvider.ts` |
| Règles de sécurité Firestore/Storage | **Absent** | aucun fichier `*.rules` dans le dépôt |
| TypeScript strict | Respecté | `"strict": true` présent dans `tsconfig.app.json` et `tsconfig.node.json` |
| Pas de `any` sauf justification | Respecté (aucune occurrence de `any` trouvée dans `src/`) | — |
| Composants fonctionnels + hooks uniquement | Respecté | `src/components/`, `src/hooks/` |
| Logique audio indépendante des composants React | Respecté (`src/audio/` n'importe rien de React) | `src/audio/` |
| Identifiants de code en anglais | Partiel — le code applicatif (`audioEngine`, `mixer-processor`, `trackProvider`…) est en anglais, mais les `id`/`instrument` de piste utilisés comme identifiants (`Batterie`, `Chant1`, `Clavier`, `Guitare`) sont en français | `src/hooks/useAudioEngine.ts` |

## 5. Firebase

- Aucune dépendance Firebase installée (`package.json` ne référence ni `firebase` ni `firebase-admin`).
- Aucun fichier de configuration Firebase (`firebase.json`, `.firebaserc`) dans le dépôt.
- Aucune règle de sécurité (`firestore.rules`, `storage.rules`) présente.
- Aucun code d'authentification, aucune allowlist d'emails, aucun accès Firestore ou Storage nulle part dans `src/`.
- Les seules mentions de "firebase" dans tout le dépôt sont des lignes de permissions dans `.claude/settings.json` (règles d'autorisation Bash/Read pour un futur usage de la CLI Firebase et des clés `serviceAccount`/`firebase-adminsdk`), ce qui indique une intention future mais aucune implémentation actuelle.
- Les pistes audio sont servies en statique depuis `public/` (FLAC), pas depuis Firebase Storage ; `src/audio/trackProvider.ts` définit une abstraction (`TrackByteProvider`) qui pourrait accueillir un fournisseur Firebase Storage plus tard, mais seule `StaticTrackProvider` existe aujourd'hui.
- Conclusion : le backend Firebase décrit dans CLAUDE.md est intégralement absent du code. Le projet actuel est un front-end pur, sans back-end.

## 6. Ce qui fonctionne / ne fonctionne pas

Constat basé sur lecture du code, `npm run lint` (0 erreur) et `tsc -b --noEmit` (0 erreur) exécutés sur ce dépôt. Je n'ai pas ouvert l'app dans un navigateur ni testé le rendu audio réel dans cette session : les points suivants sur le comportement runtime sont déduits du code, pas observés en exécution.

Ce qui est démontrable par lecture de code / compilation :
- Le projet compile sans erreur TypeScript et passe le lint sans erreur.
- Un unique morceau est câblé en dur dans `useAudioEngine.ts` (`TRACK_REQUESTS` : 4 pistes `{ id, instrument }` — `Batterie`, `Chant1`, `Clavier`, `Guitare` — résolues par `StaticTrackProvider` vers `public/Batterie.flac` etc., mono 44100 Hz, durée ~8 min 30 s chacune) — il n'existe aucune sélection de morceau, aucune liste de morceaux.
- Estimation mémoire PCM Int16 pour ce jeu de pistes : ~180 Mo au total (4 pistes mono × ~510 s × 44100 Hz × 2 octets), largement sous le plafond de 500 Mo de la spec — mais aucun garde-fou d'estimation avant décodage n'existe dans le code (cf. section 4), ce constat repose sur un calcul manuel, pas sur une fonctionnalité de l'app.
- L'architecture play/pause/seek/mute/boucle A→B suit le protocole décrit en section 3, avec un index maître unique dans le worklet et un mixage échantillon par échantillon.
- Le service worker PWA (Workbox via `vite-plugin-pwa`) est configuré pour précacher le shell et exclure l'audio ; un composant `PwaUpdatePrompt` gère la notification de mise à jour.

Ce que je n'ai **pas vérifié en exécution** dans cette session et ne peux donc pas certifier :
- Que la lecture audio démarre effectivement et reste synchronisée sur un vrai navigateur/appareil (desktop ou iOS).
- Que le déblocage de l'`AudioContext` fonctionne réellement sur iOS Safari.
- Que le mixage ne produit pas de clics/glitches en usage réel.
- Que le service worker s'enregistre et fonctionne correctement une fois déployé (le SW exige HTTPS, non testable en `npm run dev`).
- Que l'app fonctionne correctement hors-ligne (aucun mécanisme de stockage hors-ligne des pistes n'est implémenté de toute façon, cf. section 4).

Absent, donc non fonctionnel par construction (aucune tentative d'implémentation trouvée) :
- Authentification et contrôle d'accès (allowlist).
- Chargement de morceaux depuis Firestore/Storage.
- Changement de morceau, liste de morceaux.
- Téléchargement/lecture hors-ligne via IndexedDB.
- Écran de gestion du stockage.
- Tout test automatisé (`npm run test` n'existe pas en tant que script, aucune dépendance de test installée, aucun fichier `*.test.*`/`*.spec.*` dans le dépôt).

## 7. Points de blocage

- **Aucune infrastructure Firebase** : sans décision sur le projet Firebase (Auth/Firestore/Storage) et sans règles de sécurité écrites, impossible d'avancer sur la persistance des morceaux, l'allowlist ou le stockage des fichiers audio réels — tout le code actuel dépend de fichiers statiques dans `public/`.
- **Jeu de test encore limité** : le jeu de pistes FLAC mono actuel (4 pistes, ~8 min 30 s) est conforme au format visé mais reste en deçà du pire cas de la spec (8 pistes, 12 min) ; le budget mémoire au plafond (~500 Mo) et le garde-fou d'estimation avant décodage (toujours absent du code, cf. section 4) n'ont donc pas été mis à l'épreuve dans les conditions extrêmes.
- **Absence totale de tests automatisés** : `npm run test` est documenté dans CLAUDE.md mais n'existe pas (pas de script, pas de dépendance Vitest). Toute vérification de non-régression sur la synchro est actuellement manuelle.
- **Gestion d'erreur de chargement absente** : la règle "une piste échouée bloque tout le morceau et signale laquelle" n'est pas implémentée ; ni `AudioEngine.loadTracks` ni `StaticTrackProvider.fetchTrackBytes` n'ont de `try/catch` ou de vérification `response.ok`. Un état d'erreur détaillé par piste reste à écrire avant tout usage au-delà du POC.
- **Pas de vérification empirique iOS** : la contrainte "iOS doit être correctement supporté" (priorité 2) n'a fait l'objet d'aucun test constaté dans ce dépôt (pas de captures, pas de notes, pas de CI mobile).
