"""Run the reference pipeline over a list of URLs, unattended.

    python refs/batch.py refs/urls.txt

`urls.txt` is one URL per line; blank lines and `#` comments ignored.
Labels are assigned ref-NN in file order.

Designed to be left alone for an hour:

  * RESUMABLE. A reference whose .report.md already exists is skipped, so the
    batch can be killed and restarted without redoing work or re-uploading.
  * FAILURE-TOLERANT. One dead link or one model outage must not abandon the
    other nineteen. Each failure is recorded and the run continues.
  * RATE-LIMITED. The free tier counts requests per minute and each reference
    costs two. A gap between references keeps the batch under the limit; the
    per-call backoff in describe.py handles anything that still slips through.

Writes refs/batch-log.json with the outcome of every reference.
"""
import importlib.util
import io
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
GAP_S = 12  # between references, to stay under free-tier RPM


def load_urls(path):
    out = []
    for line in io.open(path, encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#"):
            out.append(line)
    return out


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "refs/urls.txt"
    urls = load_urls(src)
    log_path = "refs/batch-log.json"
    log = {}
    if os.path.exists(log_path):
        try:
            log = json.load(io.open(log_path, encoding="utf-8"))
        except json.JSONDecodeError:
            log = {}

    print(f"batch: {len(urls)} references\n", flush=True)
    for i, url in enumerate(urls, start=2):  # ref-01 already done
        label = f"ref-{i:02d}"
        report = f"refs/formats/{label}.report.md"
        if os.path.exists(report):
            print(f"[{i-1}/{len(urls)}] {label}  SKIP (already done)", flush=True)
            log[label] = {**log.get(label, {}), "url": url, "status": "done"}
            continue

        print(f"[{i-1}/{len(urls)}] {label}  {url}", flush=True)
        t0 = time.time()
        r = subprocess.run(
            [sys.executable, os.path.join(HERE, "analyse.py"), url, "--label", label],
            capture_output=True, text=True)
        took = round(time.time() - t0, 1)

        if r.returncode == 3:
            # quota wall: every remaining reel would fail the same way
            print(f"        QUOTA EXHAUSTED — stopping with "
                  f"{len(urls) - (i - 1)} reels unprocessed", flush=True)
            log[label] = {"url": url, "status": "quota", "seconds": took}
            io.open(log_path, "w", encoding="utf-8").write(json.dumps(log, indent=2))
            break
        if r.returncode == 0 and os.path.exists(report):
            rec = json.load(io.open(f"refs/formats/{label}.record.json",
                                    encoding="utf-8"))
            sem = json.load(io.open(f"refs/formats/{label}.semantic.json",
                                    encoding="utf-8"))
            anims = sem.get("animations", [])
            need = [a for a in anims if not a.get("we_already_have")]
            log[label] = {
                "url": url, "status": "done", "seconds": took,
                "archetype": rec.get("archetype"),
                "animations": len(anims), "need_building": len(need),
                "devices": len(rec.get("device_inventory", [])),
            }
            print(f"        ok in {took}s — {rec.get('archetype')}, "
                  f"{len(anims)} animations, {len(need)} to build", flush=True)
        else:
            tail = (r.stderr or r.stdout or "")[-500:]
            log[label] = {"url": url, "status": "failed", "seconds": took,
                          "error": tail}
            print(f"        FAILED in {took}s\n{tail}", flush=True)

        io.open(log_path, "w", encoding="utf-8").write(json.dumps(log, indent=2))
        time.sleep(GAP_S)

    done = [k for k, v in log.items() if v.get("status") == "done"]
    failed = [k for k, v in log.items() if v.get("status") == "failed"]
    print(f"\nbatch complete: {len(done)} done, {len(failed)} failed", flush=True)
    if failed:
        print("failed: " + ", ".join(failed), flush=True)


if __name__ == "__main__":
    sys.exit(main())
