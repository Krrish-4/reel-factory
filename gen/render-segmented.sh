#!/usr/bin/env bash
# Render a long composition in frame segments, then concatenate.
#
# WHY THIS EXISTS. This machine has 16 GB with ~2-2.5 GB free, and a single
# `remotion render` of RefinaSize (2042 frames of 1080x1920) is killed by the
# OS for low memory at around frame 420 -- twice, once with the full 191 MB
# public/ and once with the verified 9.8 MB public-size/, so it is NOT the asset
# copy. Chrome's footprint grows across a long render; splitting it into
# segments lets each process exit and hand its memory back.
#
#   bash gen/render-segmented.sh RefinaSize out/refina-size-v1.mp4 2042 public-size
#
# Segments are concatenated with `-c copy`, so nothing is re-encoded and the
# result is the same bitstream the segments carry.
set -euo pipefail

COMP="$1"; OUT="$2"; TOTAL="$3"; PUBDIR="${4:-public}"
SEG="${SEG:-409}"
WORK="$(dirname "$OUT")/.segments-$COMP"
mkdir -p "$WORK"
: > "$WORK/list.txt"

# IT RESUMES. The OS kills this render for low memory often enough that
# restarting from frame 0 each time is how you never finish: an attempt that
# dies in segment 2 has still banked segments 0 and 1. A segment file is only
# trusted if ffprobe can read a frame count from it, so a half-written mp4 from
# the moment of the kill is re-rendered rather than silently concatenated.
# DELETE THE WORK DIR BY HAND after changing the composition — the segments are
# not fingerprinted against the source, and stale ones would splice a previous
# cut into the middle of a new one.
i=0; start=0
while [ "$start" -lt "$TOTAL" ]; do
  end=$(( start + SEG - 1 ))
  [ "$end" -ge "$TOTAL" ] && end=$(( TOTAL - 1 ))
  want=$(( end - start + 1 ))
  have=$(ffprobe -v error -select_streams v:0 -count_frames \
          -show_entries stream=nb_read_frames -of csv=p=0 "$WORK/seg$i.mp4" 2>/dev/null || true)
  if [ "${have:-0}" = "$want" ]; then
    printf '\n=== segment %d: frames %d-%d  (cached, %s frames) ===\n' "$i" "$start" "$end" "$have"
  else
    printf '\n=== segment %d: frames %d-%d ===\n' "$i" "$start" "$end"
    rm -f "$WORK/seg$i.mp4"
    npx remotion render "$COMP" "$WORK/seg$i.mp4" \
        --codec h264 --concurrency=1 --public-dir="$PUBDIR" \
        --frames="$start-$end"
  fi
  printf "file '%s'\n" "seg$i.mp4" >> "$WORK/list.txt"
  i=$(( i + 1 )); start=$(( end + 1 ))
done

printf '\n=== concatenating %d segments ===\n' "$i"
ffmpeg -y -f concat -safe 0 -i "$WORK/list.txt" -c copy "$OUT" 2>&1 | tail -3
ls -la "$OUT"
