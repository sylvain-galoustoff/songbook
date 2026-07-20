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
  <!-- Règles Firebase (firestore.rules, storage.rules) déployées sur le
       projet songbook-97910 (alias "default" dans .firebaserc). Pour
       redéployer après modification, toujours avec validation explicite :
       firebase deploy --only firestore:rules
       firebase deploy --only storage
       (le combiné --only firestore:rules,storage:rules a échoué en pratique
       — cible "storage:rules" introuvable ; déployer les deux séparément.) -->

## Stack (NON NÉGOCIABLE)

- **Front** : React + Vite + TypeScript. Aucun autre framework ni bundler.
  - **PWA** via `vite-plugin-pwa` (Workbox). App installable.
- **Back** : Firebase uniquement. Pas de serveur Node/Express custom.
  - **Auth** — comptes créés manuellement dans la console Firebase, aucune
    inscription publique dans l'app (voir section « Auth »).
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
- **Import via wizard** : le FLAC est décodé **localement, avant upload**, pour
  en extraire les métadonnées (fréquence d'échantillonnage, durée en
  échantillons, nombre de canaux, taille en octets, empreinte de contenu — cf.
  « Modèle de données »). Le wizard **refuse** toute piste dont la fréquence
  d'échantillonnage diffère de celle du morceau, ou dont la durée s'écarte
  sensiblement des autres pistes déjà importées.
- **L'estimation mémoire avant lecture se calcule à partir des seules
  métadonnées Firestore** (durée, canaux, nombre de pistes), sans télécharger
  l'audio — cf. budget mémoire ci-dessus.
- Un morceau porte un champ `status` (`draft` / `ready`). Un morceau `draft`
  (import en cours ou incomplet) **n'est ni listé ni jouable** ; il ne passe
  à `ready` qu'une fois toutes ses pistes validées par le wizard.

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

- `songs/{songId}` : `{ title, order, createdAt, createdBy, tempo?, key?, status, sampleRate?, durationSamples? }`
  - `status` : `"draft" | "ready"` (cf. « Format & stockage audio »).
  - `sampleRate?` / `durationSamples?` : fréquence et durée **canoniques du
    morceau**, absentes tant que `status` est `"draft"`. Posées en une seule
    fois par le wizard d'import, à la finalisation (cf. « Format & stockage
    audio ») : `sampleRate` = celle de la première piste importée (référence
    de validation) ; `durationSamples` = la plus longue durée parmi les
    pistes, cohérente avec la durée que `AudioEngine.getDurationSamples`
    calcule au chargement (`src/audio/audioEngine.ts`).
  - `tracks` : **tableau embarqué** (pas de sous-collection) d'objets
    `{ id, instrument, storagePath, order, defaultGain?, sampleRate,
durationSamples, channels, sizeBytes, contentHash }`. Choix justifié par
    la lecture systématiquement groupée (toutes les pistes d'un morceau sont
    chargées ensemble, jamais une seule), l'écriture atomique en fin de
    wizard d'import (le morceau passe en un seul document de `draft` à
    `ready`), et le volume négligeable (quelques pistes par morceau).

Storage :

- `songs/{songId}/{trackId}.flac` — un fichier par piste.

## Auth

- **Pas d'allowlist, pas d'inscription publique.** Les comptes des membres du
  groupe sont créés **manuellement dans la console Firebase** (Authentication).
  L'application n'expose **aucun parcours de création de compte** (pas de
  formulaire d'inscription, pas d'appel `createUserWithEmailAndPassword`
  côté app).
- Le contrôle d'accès se limite à « utilisateur authentifié ou non » : les
  **règles de sécurité Firestore/Storage** exigent simplement `request.auth
!= null`. Comme les comptes ne peuvent être créés que depuis la console,
  être authentifié suffit à prouver l'appartenance au groupe — pas besoin
  d'allowlist ni de collection `members`.

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
- Pour les icones, on utilise toujours les icones io5 du module react-icons

## À NE JAMAIS FAIRE

- Ne pas committer de secrets. Clés Firebase et `.env*` ne vont jamais dans Git.
- Ne pas déployer sans validation explicite de ma part.
- Ne pas lire les pistes via des balises `<audio>` parallèles (désynchro).
- Ne pas utiliser de streaming audio (casse la boucle A→B et la synchro).
- Ne pas precacher les fichiers audio dans le service worker.
- Ne pas remplacer la stack imposée ni ajouter de dépendance lourde sans demander.
- Ne jamais réintroduire de parcours d'inscription publique (pas de
  `createUserWithEmailAndPassword` ni de formulaire de création de compte
  côté app) : les comptes se créent uniquement dans la console Firebase.
- Ne jamais écrire dans Figma. Le MCP Figma est en LECTURE seule : aucune création ni modification de nœud, variable ou composant. La maquette fait foi, jamais l'inverse.
