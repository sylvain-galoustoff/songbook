---
description: Ajoute un item à la TODO list du projet
model: claude-haiku-4-5-20251001
---

Ajoute un item à `TODO.md` (racine du projet), sous la section "À faire".

Label de l'item : $ARGUMENTS

- Ajoute une ligne `- <label>` à la fin de la section "À faire". Ne touche à
  aucune autre section ni aucun autre fichier.
- Si `TODO.md` n'existe pas, crée-le avec les sections "En cours", "À faire",
  "Fait" avant d'y ajouter l'item.
- Si `$ARGUMENTS` est vide, ne modifie rien et demande le label.
