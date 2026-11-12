#!/usr/bin/env bash
# Wait for the running corpus job, re-run anything analysed on a stale config,
# then verify every reel and rebuild the library.
#
#   bash refs/finish.sh
#
# Mid-run the model was pinned to a primary and temperature dropped to 0, so the
# reels analysed before that point carry a different configuration. `verify.py`
# identifies them from the provenance now stored in each record rather than from
# a guess about ordering.
set -u
cd "$(dirname "$0")/.." || exit 1

echo "=== waiting for the in-flight corpus run ==="
for _ in $(seq 1 200); do
  grep -q "RERUN COMPLETE" refs/rerun.log 2>/dev/null && break
  sleep 30
done
grep -q "RERUN COMPLETE" refs/rerun.log 2>/dev/null \
  || { echo "in-flight run did not finish; stopping"; exit 1; }

echo
echo "=== state before repair ==="
python refs/verify.py

STALE=$(python refs/verify.py --stale)
if [ -n "$STALE" ]; then
  n=$(echo "$STALE" | wc -l)
  echo
  echo "=== re-running $n reels on the pinned model at temperature 0 ==="
  for label in $STALE; do
    src="refs/corpus/${label}.mp4"
    [ -f "$src" ] || src="refs/corpus/ref-01.mp4"   # ref-01 keeps its long label
    echo "--- $label"
    python refs/analyse.py "$src" --label "$label" || echo "    FAILED $label"
    sleep 10
  done
else
  echo "nothing stale"
fi

echo
echo "=== rebuilding library and build plan ==="
python refs/library.py
python refs/cluster-build.py

echo
echo "=== final verification ==="
python refs/verify.py

echo "=== FINISH COMPLETE ==="
