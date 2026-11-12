"""Check every reference's result and flag anything suspect.

    python refs/verify.py            # report
    python refs/verify.py --stale    # print labels needing a re-run, one per line

A corpus is only as good as its worst record, and bad records do not announce
themselves — they look like small numbers. Every failure this checks for has
actually happened in this repo:

  * a reel analysed by a fallback model because the primary was overloaded,
    with nothing in the output saying so
  * temperature 0.2, which made the same reel return 6 animations one run and
    10 the next
  * a taxonomy of 2 animations for a reel measured at 11 element arrivals
  * an empty device list, from one over-large prompt
  * a missing timeline, because the pass did not exist yet

The point is to make "is the corpus sound?" a command rather than a feeling.
"""
import argparse
import glob
import io
import json
import os
import sys

PRIMARY = os.environ.get("REFS_MODEL", "gemini-3.5-flash")


def check(label):
    """-> (list of blocking problems, list of warnings, stats dict)"""
    bad, warn, st = [], [], {}
    sp = f"refs/formats/{label}.semantic.json"
    mp = f"refs/formats/{label}.json"
    rp = f"refs/formats/{label}.record.json"

    for p in (sp, mp, rp, f"refs/formats/{label}.report.md"):
        if not os.path.exists(p):
            bad.append(f"missing {os.path.basename(p)}")
    if bad:
        return bad, warn, st

    sem = json.load(io.open(sp, encoding="utf-8"))
    m = json.load(io.open(mp, encoding="utf-8"))
    meta = sem.get("_meta") or {}

    st["dur"] = m["duration_s"]
    st["arrivals"] = m["element_events"]["count"]
    st["cont_pct"] = (m.get("continuous_motion") or {}).get("pct_of_runtime")
    st["anims"] = len(sem.get("animations") or [])
    st["timeline"] = len(sem.get("timeline") or [])
    st["devices"] = len(sem.get("devices") or [])
    st["text"] = len(sem.get("onscreen_text") or [])
    st["model"] = meta.get("model", "?")
    st["temp"] = meta.get("temperature")

    # Judge against the CURRENT primary, using the model actually used.
    #
    # The stored `degraded` flag cannot be the verdict: it records whether the
    # model matched whatever PRIMARY happened to be at run time, and PRIMARY has
    # moved twice while chasing quota (3.7 -> 3.6 -> 3.5). A record made when
    # PRIMARY was 3.6 carries degraded=true forever, even after 3.5 became the
    # correct target. What matters is only whether the whole corpus agrees with
    # the current pin.
    # Model mismatch is a WARNING, not a failure.
    #
    # I spent a day enforcing single-model consistency and repinned three times
    # (3.7 -> 3.6 -> 3.5), each pin dying on that model's separate free-tier
    # quota. Chasing it is a treadmill, and the cost was never justified: the
    # variance I actually MEASURED came from temperature — same reel, same
    # model, 6 animations one run and 10 the next. The model difference was
    # never cleanly isolated because my one A/B had the prompt changed too.
    #
    # So the corpus enforces what was proven to matter and records the rest.
    if meta.get("model") and meta["model"] != PRIMARY:
        warn.append(f"model {meta.get('model')}, not the pinned {PRIMARY}")
    elif meta.get("degraded"):
        warn.append(f"recorded as degraded against {meta.get('wanted_model')}, "
                    f"but matches the current pin")
    if meta.get("temperature") is None:
        bad.append("no temperature recorded (pre-fix run)")
    elif meta["temperature"] != 0:
        bad.append(f"temperature {meta['temperature']}, not 0")

    # measurement freshness
    if "continuous_motion" not in m:
        bad.append("measured before continuous-motion detection existed")

    # content sanity
    if not sem.get("timeline"):
        bad.append("no timeline — PARTIAL, the third pass never landed"
                   if sem.get("animations") else "no timeline")
    if not sem.get("animations"):
        bad.append("no animations")
    if not sem.get("devices"):
        warn.append("no devices")
    if not sem.get("onscreen_text"):
        warn.append("no on-screen text")
    if not sem.get("transcript"):
        warn.append("no transcript")

    # density sanity: a timeline should track the video's real busyness
    dur_min = max(m["duration_s"] / 60, 0.01)
    tl_per_min = st["timeline"] / dur_min
    st["tl_per_min"] = round(tl_per_min, 1)
    if st["timeline"] and tl_per_min < 12:
        warn.append(f"sparse timeline: {tl_per_min:.0f} events/min")
    if st["anims"] and st["anims"] < 4:
        warn.append(f"taxonomy of only {st['anims']} animations")

    # Timestamps must run forwards.
    #
    # The model answers in seconds until the one-minute mark and then switches
    # to MM:SS as a decimal — 59.0 followed by 1.07 on a 91s reel. Read as
    # floats the timeline travels backwards, and the merge snapped those scenes
    # to 0.0s. Nothing in this checker noticed; it only surfaced because a full
    # report was read by eye. `normalise_times` repairs it on ingest, and this
    # is the assertion that the repair actually worked.
    # Only the strictly sequential fields are held to strict order.
    #
    # First version failed any backwards step anywhere and flagged seven reels,
    # all of them fine: `onscreen_text` lists items that COEXIST on screen, so a
    # persistent headline logged after the labels beneath it reads as 16.5 ->
    # 15.5, and a title present from 0.0s can legitimately appear last. A
    # checker that cries wolf gets ignored, which is worse than not having one.
    #
    # `timeline` is explicitly "in chronological order" and `shots` are
    # sequential scenes — those must run forwards. The rest only matter if the
    # jump is large enough to be a format error rather than an ordering choice.
    for field, key, strict in (("timeline", "approx_t", True),
                               ("shots", "approx_start", True),
                               ("onscreen_text", "approx_t", False),
                               ("transcript", "approx_t", False)):
        ts = [r.get(key) for r in (sem.get(field) or [])
              if isinstance(r.get(key), (int, float))]
        drops = [(x, y) for x, y in zip(ts, ts[1:]) if y < x - 0.5]
        if strict and drops:
            bad.append(f"{field} timestamps go backwards ({len(drops)}x)")
        elif drops:
            big = [d for d in drops if d[0] - d[1] > 20]
            if big:
                warn.append(f"{field} jumps back {big[0][0] - big[0][1]:.0f}s "
                            f"— possible MM:SS")
        if ts and max(ts) > m["duration_s"] + 2:
            warn.append(f"{field} timestamp {max(ts):.0f}s exceeds "
                        f"{m['duration_s']:.0f}s runtime")

    rec = json.load(io.open(rp, encoding="utf-8"))
    scenes = rec.get("scenes") or []
    snapped = sum(1 for s in scenes if s.get("snapped_to_measured_cut"))
    st["scenes"] = f"{snapped}/{len(scenes)}"
    return bad, warn, st


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stale", action="store_true",
                    help="print only labels that need re-running")
    a = ap.parse_args()

    labels = sorted(
        os.path.basename(p)[: -len(".semantic.json")]
        for p in glob.glob("refs/formats/*.semantic.json"))
    if not labels:
        raise SystemExit("no records found")

    stale, results = [], []
    for label in labels:
        bad, warn, st = check(label)
        results.append((label, bad, warn, st))
        if bad:
            stale.append(label)

    if a.stale:
        # LF only, written to the raw buffer. Python's print emits CRLF on
        # Windows, and bash word-splitting does not treat CR as whitespace — so
        # `for l in $(verify.py --stale)` yielded labels with a trailing CR and
        # every downstream path became 'refs/formats/ref-02\r.json'. Eight reels
        # failed on that alone, surfacing only as OSError Errno 22.
        payload = "\n".join(stale) + ("\n" if stale else "")
        sys.stdout.buffer.write(payload.encode("utf-8"))
        return 0

    print(f"{'reel':<28} {'dur':>5} {'anim':>5} {'tl':>4} {'tl/min':>7} "
          f"{'dev':>4} {'model':<18} {'T':>4}  status")
    print("-" * 104)
    for label, bad, warn, st in results:
        status = "FAIL " + "; ".join(bad) if bad else (
            "warn " + "; ".join(warn) if warn else "ok")
        print(f"{label:<28} {st.get('dur', 0):>4.0f}s {st.get('anims', 0):>5} "
              f"{st.get('timeline', 0):>4} {st.get('tl_per_min', 0):>7} "
              f"{st.get('devices', 0):>4} {str(st.get('model'))[:17]:<18} "
              f"{str(st.get('temp')):>4}  {status[:44]}")

    ok = sum(1 for _, b, w, _ in results if not b and not w)
    warned = sum(1 for _, b, w, _ in results if not b and w)
    print(f"\n{ok} clean, {warned} with warnings, {len(stale)} needing a re-run")
    if stale:
        print("re-run: " + " ".join(stale))
    return 0


if __name__ == "__main__":
    sys.exit(main())
