#!/usr/bin/env bash
# Full corpus re-run: fresh measurements + all three Gemini passes.
#
#   bash refs/rerun-all.sh
#
# The first batch ran on prompt template v3 (two passes). Since then the
# template gained a third pass — the instance timeline — and the measurement
# gained continuous-motion detection, whose numbers are injected into all three
# prompts. Both changes affect every reference, so the corpus is rebuilt rather
# than patched.
#
# Absolute cd on purpose: a relative one that fails silently would leave the
# rm below pointed at whatever directory the shell happened to be in.
set -u
cd "$(dirname "$0")/.." || exit 1

echo "=== clearing derived files (videos in refs/corpus are kept) ==="
rm -f refs/formats/*.report.md refs/formats/*.semantic.json refs/formats/*.record.json
rm -f refs/batch-log.json

echo "=== ref-01 (not in urls.txt — it seeded the corpus) ==="
python refs/analyse.py refs/corpus/ref-01.mp4 --label ref-01-piercings-explainer

echo "=== ref-02 .. ref-21 ==="
python refs/batch.py refs/urls.txt

echo "=== re-measuring our own reels with the new detector ==="
python refs/measure-format.py out/refina-preview-v10.mp4 --label ours-preview-v10
python refs/measure-format.py out/refina-protocol-v4.mp4  --label ours-protocol-v4

echo "=== rebuilding library and build plan ==="
python refs/library.py
python refs/cluster-build.py

echo "=== RERUN COMPLETE ==="
