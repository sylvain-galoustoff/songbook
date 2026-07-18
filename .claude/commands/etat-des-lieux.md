---
description: Régénère le constat complet de l'état du dépôt
---

Analyse ce dépôt et produis/écrase `docs/etat-des-lieux.md` décrivant l'état
RÉEL du code. Tu ne modifies aucun autre fichier. Tu n'implémentes rien, tu ne
proposes aucune amélioration : ce document est un constat.

## 1. Arborescence

Arborescence de `src/` (2 niveaux), une ligne de description et le nombre de
lignes par fichier.

## 2. Dépendances

`dependencies` + `devDependencies` avec versions, versions Node/npm.

## 3. Moteur audio

Ce qui existe réellement dans `src/audio/` : fichiers, signatures publiques
exportées, protocole de messages effectivement implémenté entre thread
principal et worklet. Signale explicitement les stubs et le code mort.

## 4. Écarts avec la spécification

Compare le code à `CLAUDE.md` et `.claude/rules/audio-engine.md`.
Tableau : point de spec | statut (respecté / partiel / absent / violé) |
fichier concerné. Factuel et impitoyable, y compris sur les règles marquées
CRITIQUE ou NON NÉGOCIABLE.

## 5. Firebase

Auth, Firestore, Storage : ce qui est configuré, les règles de sécurité
présentes, ce qui est absent.

## 6. Ce qui fonctionne / ne fonctionne pas

Ce qui est démontrable à l'exécution aujourd'hui. Si tu n'as pas la certitude
qu'une fonctionnalité tourne, écris-le au lieu de supposer.

## 7. Points de blocage

Aucune section vide : si une partie est inexistante, écris "absent".
