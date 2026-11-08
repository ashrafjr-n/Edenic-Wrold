#!/bin/sh
# Turns one source video into a lesson reel for the web:
#   <out>.mp4  H.264 High, 720x1280 (the reel frame is 9:16), CRF 27,
#              AAC 96k mono, loudness-normalised, faststart (plays while loading)
#   <out>.jpg  its poster, the frame 1 s in, 720 px wide
# H.264 because every browser plays it (the sources are HEVC/ProRes .mov or
# 50-75 Mbit/s .mp4 — both far too heavy or not playable in Chrome).
#
#   sh tools/reels/encode.sh "<source video>" public/assets/learn/<friend>/<course>/reels/<word>
set -e
src="$1"; out="$2"
[ -f "$src" ] && [ -n "$out" ] || { echo "usage: encode.sh <source> <out-without-extension>"; exit 1; }
mkdir -p "$(dirname "$out")"
ffmpeg -nostdin -v error -y -i "$src" -map 0:v:0 -map 0:a:0? \
  -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" \
  -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 96k -ac 1 -ar 44100 \
  -movflags +faststart "$out.mp4"
ffmpeg -nostdin -v error -y -ss 1 -i "$out.mp4" -frames:v 1 -q:v 4 "$out.jpg"
echo "$out.mp4 $(du -h "$out.mp4" | cut -f1)"
