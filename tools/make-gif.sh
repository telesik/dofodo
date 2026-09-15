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
WANT=$(sed -n 's/.*"frames": *\([0-9]*\).*/\1/p' "$META")
PX=$(sed -n 's/.*"px": *\([0-9]*\).*/\1/p' "$META")
# Растеризуем ровно под финальный размер MP4 (вдвое шире GIF), не крупнее.
SCALE=$(awk -v w="$WIDTH" -v p="$PX" 'BEGIN { s = w * 2 / p; print (s < 1 ? 1 : s) }')

# 1. SVG → PNG в два раза крупнее кадра: уменьшение lanczos'ом даёт чистые точки
COUNT=0
while IFS= read -r svg; do
  swift "$HERE/svg-png.swift" "$svg" "${svg%.svg}.png" "$SCALE"
  COUNT=$((COUNT + 1))
done < <(find "$DIR" -name 'frame-*.svg' | sort)
echo "растеризовано кадров: $COUNT (масштаб $SCALE)"
[ "$COUNT" = "$WANT" ] || { echo "кадров $COUNT, а в meta.json $WANT" >&2; exit 1; }

# 2. GIF: своя палитра по всем кадрам. Дизеринг выключен: кости и сукно —
#    плоские заливки и мягкий градиент, полос не видно, а файл меньше в полтора раза.
ffmpeg -y -loglevel error -framerate "$FPS" -i "$DIR/frame-%04d.png" \
  -filter_complex "scale=${WIDTH}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
  -loop 0 "$DIR/dofodo-live.gif"

# 3. MP4 тем же материалом: App Store preview и соцсети, где GIF хуже
ffmpeg -y -loglevel error -framerate "$FPS" -i "$DIR/frame-%04d.png" \
  -vf "scale=$((WIDTH * 2)):-2:flags=lanczos,format=yuv420p" -r 30 \
  -movflags +faststart "$DIR/dofodo-live.mp4"

# Проверка: все ли кадры дошли до файла. Кадры разного пиксельного размера
# ffmpeg молча обрывает — ролик тогда короче, и это надо ловить сборкой.
GOT=$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$DIR/dofodo-live.gif")
[ "$GOT" = "$WANT" ] || { echo "в GIF $GOT кадров вместо $WANT — сборка оборвалась" >&2; exit 1; }
echo "кадров в GIF: $GOT из $WANT, длительность $(awk -v n="$GOT" -v f="$FPS" 'BEGIN{printf "%.1f", n/f}') с"
find "$DIR" -maxdepth 1 -name 'dofodo-live.*' -exec ls -lh {} \; | awk '{print $9, $5}'
