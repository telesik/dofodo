#!/usr/bin/env bash
# Сборка GIF и MP4 из кадров tools/gif-frames.ts (тикет 0037 штаба).
#
#   npx vite-node tools/gif-frames.ts -- --out DIR    # SVG-кадры + meta.json
#   tools/make-gif.sh DIR [ширина=600]
#
# Требуется: swift (растеризация, tools/svg-png.swift) и ffmpeg.
set -euo pipefail

DIR="${1:?каталог с кадрами}"
WIDTH="${2:-600}"
HERE="$(cd "$(dirname "$0")" && pwd)"
META="$DIR/meta.json"
[ -f "$META" ] || { echo "нет $META — сначала запустите tools/gif-frames.ts" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "нет ffmpeg" >&2; exit 1; }
FPS=$(sed -n 's/.*"fps": *\([0-9]*\).*/\1/p' "$META")

# 1. SVG → PNG в два раза крупнее кадра: уменьшение lanczos'ом даёт чистые точки
COUNT=0
while IFS= read -r svg; do
  swift "$HERE/svg-png.swift" "$svg" "${svg%.svg}.png" 2
  COUNT=$((COUNT + 1))
done < <(find "$DIR" -name 'frame-*.svg' | sort)
echo "растеризовано кадров: $COUNT"

# 2. GIF: своя палитра по всем кадрам (кости — плоские заливки, дизеринг лёгкий)
ffmpeg -y -loglevel error -framerate "$FPS" -i "$DIR/frame-%04d.png" \
  -filter_complex "scale=${WIDTH}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" \
  -loop 0 "$DIR/dofodo-live.gif"

# 3. MP4 тем же материалом: App Store preview и соцсети, где GIF хуже
ffmpeg -y -loglevel error -framerate "$FPS" -i "$DIR/frame-%04d.png" \
  -vf "scale=$((WIDTH * 2)):-2:flags=lanczos,format=yuv420p" -r 30 \
  -movflags +faststart "$DIR/dofodo-live.mp4"

find "$DIR" -maxdepth 1 -name 'dofodo-live.*' -exec ls -lh {} \; | awk '{print $9, $5}'
