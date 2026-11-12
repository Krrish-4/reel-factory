#!/usr/bin/env bash
# Resume the corpus after a quota reset.
#
#   bash refs/resume.sh
#
# ORDER MATTERS. The 8 reels that failed yesterday have NO data at all; the 9
# stale ones have usable data that is merely on the wrong config. Yesterday's
# run cost roughly 60 calls to exhaust the daily allowance and this needs 51, so
# it may well not finish. Doing the empty ones first means a second quota wall
# costs us consistency, not coverage.
set -u
cd "$(dirname "$0")/.." || exit 1

MISSING="ref-14 ref-15 ref-16 ref-17 ref-18 ref-19 ref-20 ref-21"
STALE=$(python refs/verify.py --stale | tr -d '')

run_one() {
  label="$1"
  src="refs/corpus/${label}.mp4"
  [ -f "$src" ] || src="refs/corpus/ref-01.mp4"   # ref-01 keeps its long label
  if [ ! -f "$src" ]; then
    echo "    no video for $label, skipping"; return 0
  fi
  python refs/analyse.py "$src" --label "$label"
  rc=$?
  if [ $rc -eq 3 ]; then
    echo "=== QUOTA WALL at $label — stopping cleanly ==="
    return 3
  fi
  [ $rc -ne 0 ] && echo "    FAILED $label (rc=$rc)"
  sleep 8
  return 0
}

echo "=== phase 1: reels with no data at all ==="
for label in $MISSING; do
  echo "--- $label"
  run_one "$label" || { [ $? -eq 3 ] && break; }
done

echo
echo "=== phase 2: reels on a stale config ==="
for label in $STALE; do
  echo "--- $label"
  run_one "$label" || { [ $? -eq 3 ] && break; }
done

echo
echo "=== re-measuring our own reels ==="
python refs/measure-format.py out/refina-preview-v10.mp4 --label ours-preview-v10
python refs/measure-format.py out/refina-protocol-v4.mp4  --label ours-protocol-v4

echo
echo "=== rebuilding library and build plan ==="
python refs/library.py
python refs/cluster-build.py || echo "clustering failed (likely quota) — rerun later"

echo
echo "=== final verification ==="
python refs/verify.py

echo "=== RESUME COMPLETE ==="
