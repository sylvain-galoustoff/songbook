#!/usr/bin/env bash
set -euo pipefail

LOG="docs/session-log.md"
[ -f "$LOG" ] || exit 0

# Âge du fichier, pour repérer un log périmé
AGE_MIN=$(( ( $(date +%s) - $(stat -c %Y "$LOG") ) / 60 ))
STAMP=$(date -r "$LOG" '+%H:%M')

if [ -n "${WAYLAND_DISPLAY:-}" ] && command -v wl-copy >/dev/null; then
  wl-copy < "$LOG"
elif command -v xclip >/dev/null; then
  xclip -selection clipboard < "$LOG"
else
  notify-send "Songbook" "Aucun outil presse-papier (wl-clipboard ou xclip)"
  exit 0
fi

if [ "$AGE_MIN" -gt 10 ]; then
  notify-send -u critical "Songbook" \
    "⚠ session-log date de $STAMP ($AGE_MIN min) — lance /session-log"
else
  notify-send "Songbook" "session-log copié ($STAMP)"
fi