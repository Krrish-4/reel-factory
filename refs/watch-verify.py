"""Emit one verification line per reel, as soon as that reel finishes.

    python refs/watch-verify.py

Designed as a Monitor command: every stdout line becomes a notification, so
each reel is checked the moment it lands instead of everything being reviewed
in a lump at the end. Waiting until the end is how ten reels got analysed on a
downgraded model before anyone noticed.

Exits when the driving job prints its completion marker, which ends the watch
cleanly rather than leaving it armed.
"""
import importlib.util
import io
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("v", os.path.join(HERE, "verify.py"))
V = importlib.util.module_from_spec(spec)
spec.loader.exec_module(V)

# Which log ends the watch, passed in. Hard-coding a list of logs meant a
# COMPLETED marker left in yesterday's file ended today's watch within seconds
# of arming it — the watch reported "driving job finished" while the job it was
# supposed to follow had barely started.
LOG = sys.argv[1] if len(sys.argv) > 1 else "refs/resume.log"
DONE_MARKERS = ("RESUME COMPLETE", "FINISH COMPLETE", "RERUN COMPLETE",
                "QUOTA WALL")


def stamp(label):
    p = f"refs/formats/{label}.semantic.json"
    try:
        return os.path.getmtime(p)
    except OSError:
        return None


def line(label):
    bad, warn, st = V.check(label)
    if bad:
        flag = "FAIL"
        why = "; ".join(bad)
    elif warn:
        flag = "warn"
        why = "; ".join(warn)
    else:
        flag = "ok"
        why = ""
    return (f"[{flag}] {label}  {st.get('dur', 0):.0f}s  "
            f"anim={st.get('anims', 0)} timeline={st.get('timeline', 0)} "
            f"({st.get('tl_per_min', 0)}/min) dev={st.get('devices', 0)} "
            f"model={st.get('model')} T={st.get('temp')}"
            + (f"  <- {why}" if why else ""))


def main():
    # Seed silently. Restarting the watch must not replay every reel already on
    # disk — that has fired a full backlog twice, burying the one new result the
    # watch exists to surface. Only transitions after startup are events.
    seen = {}
    for p in os.listdir("refs/formats"):
        if p.endswith(".semantic.json"):
            label = p[: -len(".semantic.json")]
            st = stamp(label)
            if st is not None:
                seen[label] = st
    print(f"watch: armed, {len(seen)} reels already on disk (not re-reported)",
          flush=True)

    for _ in range(2000):
        for p in sorted(os.listdir("refs/formats")):
            if not p.endswith(".semantic.json"):
                continue
            label = p[: -len(".semantic.json")]
            s = stamp(label)
            if s is None:
                continue
            if seen.get(label) != s:
                # settle: the record/report are written just after the semantic
                time.sleep(2)
                if os.path.exists(f"refs/formats/{label}.report.md"):
                    seen[label] = s
                    print(line(label), flush=True)

        done = False
        try:
            tail = io.open(LOG, encoding="utf-8", errors="replace").read()[-600:]
            done = any(m in tail for m in DONE_MARKERS)
        except OSError:
            pass
        if done:
            print("watch: driving job finished", flush=True)
            return 0
        time.sleep(15)
    return 0


if __name__ == "__main__":
    sys.exit(main())
