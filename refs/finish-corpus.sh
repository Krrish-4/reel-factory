#!/usr/bin/env bash
# Finish the last stale reels, then rebuild everything.
set -u
cd "$(dirname "$0")/.." || exit 1
for label in $(python refs/verify.py --stale | tr -d '\r'); do
  echo "--- $label"
  src="refs/corpus/${label}.mp4"
  [ -f "$src" ] || src="refs/corpus/ref-01.mp4"
  python refs/analyse.py "$src" --label "$label"
  rc=$?
  [ $rc -eq 3 ] && { echo "=== QUOTA WALL at $label ==="; break; }
  [ $rc -ne 0 ] && echo "    FAILED $label (rc=$rc)"
  sleep 6
done
echo "=== re-measuring our own reels ==="
python refs/measure-format.py out/refina-preview-v10.mp4 --label ours-preview-v10
python refs/measure-format.py out/refina-protocol-v4.mp4  --label ours-protocol-v4
echo "=== rebuilding ==="
python refs/library.py
python refs/cluster-build.py || echo "clustering failed"
python refs/verify.py
echo "=== CORPUS COMPLETE ==="
