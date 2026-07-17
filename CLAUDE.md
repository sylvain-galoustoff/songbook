# Songbook

Lecteur multipiste pour répétitions. Chaque morceau est enregistré en multipiste
(un instrument = une piste). L'app lit les pistes **en synchronisation parfaite**
et permet de :

- **couper (mute)** une ou plusieurs pistes pour jouer par-dessus
  (ex. : le bassiste coupe sa piste et joue sur une bande sans basse) ;
- **boucler entre deux points A et B** du morceau pour travailler un passage précis.

Projet personnel, pour l'usage du groupe uniquement. Sans lien avec les projets Onze+.

## Priorités produit (dans l'ordre)

1. **Synchronisation échantillon-exacte des pistes** — non négociable, prime sur tout.
2. Utilisation sur mobile. **iOS doit être correctement supporté**, sans être prioritaire.
3. Fonctionnement hors-ligne — souhaité, secondaire à la synchro.

## Commandes

- `npm run dev` — serveur de dev Vite
- `npm run build` — build de production
- `npm run preview` — prévisualise le build
- `npm run lint` — ESLint
- `npm run test` — Vitest
<!-- Ajouter les commandes Firebase (emulators, deploy des règles) une fois configuré. -->

## Stack (NON NÉGOCIABLE)

- **Front** : React + Vite + TypeScript. Aucun autre framework ni bundler.
  - **PWA** via `vite-plugin-pwa` (Workbox). App installable.
- **Back** : Firebase uniquement. Pas de serveur Node/Express custom.
  - **Auth** — accès réservé aux membres du groupe (allowlist d'emails).
  - **Firestore** — métadonnées des morceaux et pistes.
  - **Storage** — fichiers audio des pistes (FLAC).
  <!-- Pas de Firebase Hosting. Cible de déploiement à décider (le SW impose du HTTPS). -->

  ## Architecture audio (RÈGLE CRITIQUE)

La synchro multipiste échantillon-exacte est le cœur du produit et prime sur tout.

- Un seul `AudioContext` (44100 Hz) + un seul `AudioWorkletNode` qui mixe toutes
  les pistes. PAS de `AudioBufferSourceNode`, PAS de balises `<audio>`, PAS de
  streaming (casse la synchro et la boucle).
- Pistes stockées en **PCM Int16** (source FLAC 16 bits → sans perte), jamais en
  `AudioBuffer` Float32.
- Un unique index de lecture maître dans le worklet = source de vérité de la
  position. Mute = gain de piste à 0 dans le mixage. Boucle A→B = bornage de
  l'index maître.
- Débloquer l'`AudioContext` sur interaction utilisateur (iOS).

**Spécification détaillée du moteur : voir `.claude/rules/audio-engine.md`.**
(protocole worklet, format Int16, décodage séquentiel, mute, boucle, mémoire)

## Format & stockage audio

- **Format : FLAC**, produit via Audacity (export multiple, un fichier par piste),
  toutes les pistes à la MÊME fréquence (44100 Hz), mono quand la source est mono.
- Décodé une fois en Int16 en RAM (cf. audio-engine.md). Un seul morceau en RAM.
- Budget mémoire : ~500 Mo au pire cas (8 pistes × 12 min mono). Estimer avant
  décodage et avertir si dépassement. iOS tue l'onglet sans erreur au-delà.

## Hors-ligne (secondaire à la synchro)

- `vite-plugin-pwa` : precache du shell applicatif uniquement. Ne PAS precacher l'audio.
- Audio hors-ligne stocké en **IndexedDB** (blobs), téléchargé **à la demande**
  (l'utilisateur choisit les morceaux). Jamais la bibliothèque entière.
- **Support iOS correct** : l'`AudioContext` doit être débloqué sur geste utilisateur ;
  pour la persistance du stockage, proposer l'installation sur l'écran d'accueil et
  appeler `navigator.storage.persist()`.
- Écran de gestion du stockage : `navigator.storage.estimate()`, liste des morceaux
  téléchargés, purge manuelle.

## Modèle de données (identifiants en anglais)

Firestore :

- `songs/{songId}` : `{ title, order, createdAt, createdBy, tempo?, key? }`
  - sous-collection `tracks/{trackId}` : `{ instrument, storagePath, order, defaultGain? }`
- `members/{uid}` : `{ email, displayName }`

Storage :

- `songs/{songId}/{trackId}.flac` — un fichier par piste.

## Auth

- Accès restreint à une **allowlist d'emails** : les 6 membres du groupe au départ,
  extensible facilement (ajout de membres plus tard).
- Vérifier l'appartenance à l'allowlist côté client ET dans les **règles de sécurité
Firestore/Storage** (ne jamais faire confiance au seul contrôle front).
<!-- Décider : allowlist en dur, en config, ou en collection Firestore `members`. -->

## Structure du projet

- `src/components/` — composants UI
- `src/audio/` — moteur audio (AudioContext, AudioWorklet, transport, boucle) — hors React
- `src/firebase/` — init et accès Firestore/Storage/Auth
- `src/hooks/` — hooks React
- `src/types/` — types TypeScript partagés

## Conventions

- TypeScript strict. Pas de `any` sauf justification en commentaire.
- Composants fonctionnels + hooks uniquement.
- La logique audio reste dans `src/audio/`, indépendante des composants React.
- Identifiants de code, collections et champs en anglais.

## À NE JAMAIS FAIRE

- Ne pas committer de secrets. Clés Firebase et `.env*` ne vont jamais dans Git.
- Ne pas déployer sans validation explicite de ma part.
- Ne pas lire les pistes via des balises `<audio>` parallèles (désynchro).
- Ne pas utiliser de streaming audio (casse la boucle A→B et la synchro).
- Ne pas precacher les fichiers audio dans le service worker.
- Ne pas remplacer la stack imposée ni ajouter de dépendance lourde sans demander.
