# État des lieux du code — Songbook

Document généré par analyse statique du dépôt à la date du 2026-07-18,
branche `feat/audio-sync-poc`. Constat factuel uniquement : aucune
recommandation, aucune implémentation.

Mise à jour le 2026-07-18 (même jour) : la branche contenait des
modifications non commitées au moment de la première rédaction du
document. Elles sont intégrées ici. Changements constatés depuis la
version précédente :
- les pistes de démonstration sont passées de 3 fichiers MP3 stéréo
  (`guitar.mp3`, `basse.mp3`, `batterie.mp3`) à 4 fichiers **FLAC mono**
  (`Batterie.flac`, `Chant1.flac`, `Clavier.flac`, `Guitare.flac`) —
  ceci corrige les deux écarts de format précédemment relevés ;
- le dictionnaire de labels d'affichage (`TRACK_LABELS`) a été supprimé
  de `PlaybackPoc.tsx` ; l'UI affiche désormais l'`id` brut de la piste.

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
│   ├── audioEngine.ts                          — classe AudioEngine : création AudioContext, chargement/décodage pistes, API play/pause/seek/mute/loop (145 lignes)
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
│   └── useAudioEngine.ts                       — hook React encapsulant AudioEngine + état UI (110 lignes)
├── router/
│   └── index.tsx                                — un seul route "/" → App (9 lignes)
└── styles/
    ├── index.scss                               — point d'entrée SCSS global (1 ligne)
    └── reset.scss                               — reset CSS (135 lignes)
```

Total du code applicatif (hors assets) : 1120 lignes.

Répertoires prévus par CLAUDE.md mais **absents** : `src/firebase/`, `src/types/`.

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

- Aucune dépendance `firebase` (ni `firebase`, ni `firebase-admin`, ni SDK modulaire) n'est présente dans `package.json`, ni ailleurs dans le dépôt (recherche `firebase` limitée à deux lignes de permissions dans `.claude/settings.json`).
- Aucune dépendance de test (`vitest`, `@testing-library/*`, etc.).
- Node : v22.23.1 (fixé par `.nvmrc` = `22`).
- npm : 10.9.8.
- `package.json` ne définit **aucun script `test`**, alors que CLAUDE.md documente `npm run test — Vitest`.

## 3. Moteur audio

Fichiers présents dans `src/audio/` : `audioEngine.ts`, `worklet/protocol.ts`, `worklet/mixer-processor.ts`. Aucun fichier de "transport" ou de "boucle" séparé : cette logique est intégrée directement dans `audioEngine.ts` (thread principal) et `mixer-processor.ts` (worklet).

### `audioEngine.ts` — API publique exportée

- `SAMPLE_RATE` (constante = 44100)
- `interface TrackSource { id, url }`
- `interface LoopRange { start, end }`
- `class AudioEngine` :
  - `constructor()`
  - `setPositionListener(listener)`
  - `setLoopListener(listener)`
  - `getDurationSamples()`
  - `loadTracks(sources: TrackSource[]): Promise<void>`
  - `play(): Promise<void>`
  - `pause(): void`
  - `setTrackMuted(id, muted): void`
  - `seek(index): void`
  - `toggleLoopPoint(): void`
  - `dispose(): void`

Pas de méthode `stop()`, `setLoop(a,b)`/`clearLoop()` explicites : le protocole n'expose qu'un `toggleLoopPoint` à trois états (rien → A → B → rien), piloté par un seul bouton UI. Pas de méthode de sélection de morceau (un seul morceau est câblé en dur, cf. section 6).

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
- Pas de gestion d'erreur de piste individuelle : `loadTracks` dans `audioEngine.ts` utilise `Promise.all` pour le fetch puis une boucle séquentielle pour le décodage, mais **aucun `try/catch`** n'entoure fetch ou décodage — une erreur sur une piste fait planter la promesse globale sans message d'erreur ciblé ni état "quelle piste a échoué" (cf. section 4).
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
| Format audio source : FLAC | Respecté | `src/hooks/useAudioEngine.ts` référence désormais `Batterie.flac`, `Chant1.flac`, `Clavier.flac`, `Guitare.flac` (vérifié via `ffprobe` : codec `flac`, 44100 Hz) |
| Mono quand la source est mono | Respecté | les 4 fichiers `public/*.flac` sont mono (`channels=1`, vérifié via `ffprobe`) |
| Si UNE piste échoue, bloquer tout le morceau et signaler laquelle | **Absent** | `src/audio/audioEngine.ts` (`loadTracks` n'a aucun `try/catch`, aucune piste identifiée en cas d'échec) |
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
| Storage Firebase (fichiers audio) | **Absent** — les pistes sont servies depuis `public/` (statique Vite), pas depuis Firebase Storage | `public/*.mp3` |
| Règles de sécurité Firestore/Storage | **Absent** | aucun fichier `*.rules` dans le dépôt |
| TypeScript strict | **Violé** | `tsconfig.app.json`/`tsconfig.node.json` n'activent `"strict"` nulle part |
| Pas de `any` sauf justification | Respecté (aucune occurrence de `any` trouvée dans `src/`) | — |
| Composants fonctionnels + hooks uniquement | Respecté | `src/components/`, `src/hooks/` |
| Logique audio indépendante des composants React | Respecté (`src/audio/` n'importe rien de React) | `src/audio/` |
| Identifiants de code en anglais | Partiel — le code applicatif (`audioEngine`, `mixer-processor`…) est en anglais, mais les `id` de piste utilisés comme identifiants (`Batterie`, `Chant1`, `Clavier`, `Guitare`) sont en français | `src/hooks/useAudioEngine.ts` |

## 5. Firebase

- Aucune dépendance Firebase installée (`package.json` ne référence ni `firebase` ni `firebase-admin`).
- Aucun fichier de configuration Firebase (`firebase.json`, `.firebaserc`) dans le dépôt.
- Aucune règle de sécurité (`firestore.rules`, `storage.rules`) présente.
- Aucun code d'authentification, aucune allowlist d'emails, aucun accès Firestore ou Storage nulle part dans `src/`.
- Les seules mentions de "firebase" dans tout le dépôt sont deux lignes de permissions dans `.claude/settings.json` (règles d'autorisation Bash/Read pour un futur usage de la CLI Firebase et des clés `serviceAccount`/`firebase-adminsdk`), ce qui indique une intention future mais aucune implémentation actuelle.
- Les pistes audio sont servies en statique depuis `public/` (mp3), pas depuis Firebase Storage.
- Conclusion : le backend Firebase décrit dans CLAUDE.md est intégralement absent du code. Le projet actuel est un front-end pur, sans back-end.

## 6. Ce qui fonctionne / ne fonctionne pas

Constat basé sur lecture du code, `npm run lint` (0 erreur) et `tsc -b --noEmit` (0 erreur) exécutés sur ce dépôt. Je n'ai pas ouvert l'app dans un navigateur ni testé le rendu audio réel dans cette session : les points suivants sur le comportement runtime sont déduits du code, pas observés en exécution.

Ce qui est démontrable par lecture de code / compilation :
- Le projet compile sans erreur TypeScript et passe le lint sans erreur.
- Un unique morceau est câblé en dur dans `useAudioEngine.ts` (4 pistes FLAC mono 44100 Hz : `Batterie.flac`, `Chant1.flac`, `Clavier.flac`, `Guitare.flac`, durée ~8 min 30 s chacune, servies depuis `public/`) — il n'existe aucune sélection de morceau, aucune liste de morceaux. Estimation mémoire PCM Int16 pour ce jeu de pistes : ~180 Mo au total (4 pistes mono × ~510 s × 44100 Hz × 2 octets), largement sous le plafond de 500 Mo de la spec — cohérent avec le fait qu'aucun garde-fou mémoire n'est nécessaire ici, mais ce garde-fou reste absent du code (cf. section 4).
- Trois fichiers MP3 devenus orphelins (`public/guitar.mp3`, `public/basse.mp3`, `public/batterie.mp3`, ~34 Mo au total) restent sur disque sans être référencés par aucun code depuis le passage aux FLAC ; ils seront copiés tels quels dans `dist/` au prochain build.
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
- **Gestion d'erreur de chargement absente** : la règle "une piste échouée bloque tout le morceau et signale laquelle" n'est pas implémentée ; un `try/catch` et un état d'erreur détaillé par piste restent à écrire avant tout usage au-delà du POC.
- **TypeScript strict non activé** : aucun `tsconfig` du dépôt ne porte `"strict": true`, ce qui contredit une convention explicite de CLAUDE.md et peut laisser passer des erreurs de types que la convention est censée empêcher.
- **Pas de vérification empirique iOS** : la contrainte "iOS doit être correctement supporté" (priorité 2) n'a fait l'objet d'aucun test constaté dans ce dépôt (pas de captures, pas de notes, pas de CI mobile).
