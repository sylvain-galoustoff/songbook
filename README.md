# Songbook

Lecteur multipiste pour répétitions de groupe. Chaque morceau est enregistré
en multipiste (un instrument = une piste) ; l'app lit toutes les pistes en
synchronisation échantillon-exacte et permet de couper certaines pistes
(pour jouer par-dessus) ou de boucler un passage entre deux points A et B.

Projet personnel, pour l'usage du groupe uniquement.

## Stack

- **Front** : React 19 + Vite + TypeScript, PWA via `vite-plugin-pwa`.
- **Back** : Firebase (Auth, Firestore, Storage). Pas de serveur custom.
- **Audio** : `AudioContext` unique + `AudioWorkletNode` unique qui mixe les
  pistes en PCM Int16 — voir [`.claude/rules/audio-engine.md`](.claude/rules/audio-engine.md)
  pour la spécification détaillée du moteur.

Voir [CLAUDE.md](CLAUDE.md) pour les règles et contraintes du projet.

## Commandes

```bash
npm run dev      # serveur de dev Vite
npm run build     # build de production (tsc -b && vite build)
npm run preview   # prévisualise le build
npm run lint       # ESLint
```

## État actuel

### Fonctionnel

- **Authentification** — connexion par email/mot de passe (comptes créés
  manuellement dans la console Firebase, aucune inscription publique dans
  l'app). Routes protégées (`/`, `/song/:id`, `/new-song/*`) redirigent vers
  `/login` si non connecté.
- **Liste des morceaux** (`/`) — récupérée depuis Firestore (`listReadySongs`),
  seuls les morceaux au statut `ready` sont affichés.
- **Import d'un morceau** (`/new-song/*`, wizard en 4 étapes : nom du morceau,
  sélection de piste, association à un instrument, récapitulatif) — chaque
  piste FLAC est décodée et validée localement (fréquence, durée, empreinte)
  avant upload vers Storage ; le morceau passe de `draft` à `ready` en fin de
  wizard.
- **Lecture d'un morceau** (`/song/:id`) — chargement (fetch parallèle +
  décodage séquentiel Int16) avec indicateur de progression, lecture
  synchronisée de toutes les pistes via le moteur `AudioEngine`/`AudioWorklet` :
  play/pause, seek, mute par piste (grille d'instruments), boucle A→B, barre
  de progression pilotée par la position renvoyée par le worklet.

### Connu comme incomplet / à faire

- Pas de stockage hors-ligne (IndexedDB) ni d'écran de gestion du stockage —
  prévu par CLAUDE.md, non implémenté.
- Pas de `SharedArrayBuffer` ni de ralentissement sans changement de pitch
  (hors périmètre v1, cf. `.claude/rules/audio-engine.md`).

## Structure du projet

- `src/components/` — composants UI
- `src/audio/` — moteur audio (AudioContext, AudioWorklet, transport, boucle), indépendant de React
- `src/firebase/` — init et accès Firestore/Storage/Auth
- `src/hooks/` — hooks React
- `src/router/` — routes et gardes d'accès
- `src/views/` — écrans (Home, Song, LogIn, wizard NewSong)
- `src/types/` — types TypeScript partagés

## Modèle de données

Voir la section « Modèle de données » de [CLAUDE.md](CLAUDE.md) pour le détail
des collections Firestore (`songs/{songId}`, tableau `tracks` embarqué) et du
Storage (`songs/{songId}/{trackId}.flac`).
