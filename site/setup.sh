#!/usr/bin/env bash
# setup.sh — instala ffmpeg (si hace falta) y extrae los 121 frames de edificio.mp4

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/site"
VIDEO="$ROOT/edificio.mp4"
FRAMES="$SITE/frames"

if [ ! -f "$VIDEO" ]; then
  echo "✘ No se encontró $VIDEO" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "→ Instalando ffmpeg con Homebrew…"
    brew install ffmpeg
  else
    echo "✘ Falta ffmpeg y no hay Homebrew. Instalar manualmente: https://ffmpeg.org/" >&2
    exit 1
  fi
fi

mkdir -p "$FRAMES"
rm -f "$FRAMES"/frame_*.jpg

echo "→ Analizando video…"
ffprobe -v quiet -print_format json -show_streams "$VIDEO" | grep -E '"(width|height|nb_frames|r_frame_rate)"' || true

echo "→ Extrayendo frames a 416x552 @ 24fps…"
ffmpeg -hide_banner -loglevel error -i "$VIDEO" \
  -an \
  -vf "fps=24,scale=416:552" \
  -c:v mjpeg \
  -q:v 2 \
  "$FRAMES/frame_%04d.jpg"

COUNT=$(ls "$FRAMES"/frame_*.jpg | wc -l | tr -d ' ')
echo "✓ $COUNT frames extraídos en $FRAMES"
echo ""
echo "Servir con:"
echo "  cd $SITE && python3 -m http.server 8765"
echo "Abrir: http://localhost:8765"
