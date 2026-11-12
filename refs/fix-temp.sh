#!/usr/bin/env bash
# Re-run only the reels whose temperature was never recorded (the pre-fix runs).
# Temperature is the ONE source of variance that was actually measured: the same
# reel, same model, gave 6 animations at T=0.2 and 10 on a repeat. Model choice
# was never cleanly isolated, so it is recorded and not enforced.
set -u
cd "$(dirname "$0")/.." || exit 1
export REFS_MODEL=gemini-3.6-flash   # 3.5 is quota-exhausted right now
for label in $(python refs/verify.py --stale | tr -d '\r'); do
  echo "--- $label"
  src="refs/corpus/${label}.mp4"
  [ -f "$src" ] || src="refs/corpus/ref-01.mp4"
  python refs/analyse.py "$src" --label "$label"
  rc=$?
  [ $rc -eq 3 ] && { echo "=== QUOTA WALL at $label ==="; break; }
  [ $rc -ne 0 ] && echo "    FAILED $label (rc=$rc)"
  sleep 8
done
echo "=== rebuilding ==="
python refs/library.py
python refs/cluster-build.py || echo "clustering failed"
python refs/verify.py
echo "=== FIXTEMP COMPLETE ==="
