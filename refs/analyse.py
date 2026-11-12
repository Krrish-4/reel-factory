"""One command per reference: download, measure, describe, merge, report.

    python refs/analyse.py "https://www.instagram.com/p/XXXX/" --label ref-02-name
    python refs/analyse.py refs/corpus/ref-02.mp4 --label ref-02-name

Produces, in refs/formats/:
    <label>.json           measured, every frame          (time authority)
    <label>.semantic.json  described by Gemini            (meaning authority)
    <label>.record.json    merged, scenes snapped to cuts (read this)
    <label>.report.md      readable, animation-first      (read this too)
and a contact sheet in refs/sheets/<label>.png

HOW IT RUNS
-----------
The 10 MB upload starts immediately on a background thread while the frame
measurement runs on the main one — network-bound against CPU-bound, so they
overlap for free.

The Gemini calls then run AFTER measurement, deliberately, because the measured
numbers are injected into the prompts: "this video has 109 element arrivals and
is 50.5% frozen, account for them". Without that the model skimmed and returned
6 animations for a 109-arrival video. The two Gemini passes (animation, content)
then run concurrently against the already-uploaded file.

WHY TWO ANALYSES
----------------
They fail in opposite directions. A video model samples about one frame per
second and cannot see a 7-frame move, so any duration it gives you is invented.
Pixel measurement reads every frame exactly and cannot read a word, hear a
syllable, or tell a chart from a face.

So: Gemini says WHAT moves and WHY. ffmpeg+numpy says WHEN and HOW FAST. The
prompt forbids the model from emitting numbers at all, and the merge snaps its
soft scene boundaries onto measured cuts.
"""
import argparse
import importlib.util
import io
import json
import os
import re
import subprocess
import sys
import threading


HERE = os.path.dirname(os.path.abspath(__file__))


def _load(fname, modname):
    """Load a sibling script by path — their filenames contain hyphens."""
    spec = importlib.util.spec_from_file_location(modname, os.path.join(HERE, fname))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


measure = _load("measure-format.py", "measure_format")
describe_mod = _load("describe.py", "describe_mod")
merge_mod = _load("merge-record.py", "merge_record")


def fetch(url, label):
    os.makedirs("refs/corpus", exist_ok=True)
    out = f"refs/corpus/{label}.mp4"
    if os.path.exists(out):
        print(f"  already downloaded: {out}")
        return out
    print(f"  downloading {url}")
    r = subprocess.run(
        ["yt-dlp", "--no-warnings", "-q", "--merge-output-format", "mp4",
         "-o", f"refs/corpus/{label}.%(ext)s", url],
        capture_output=True, text=True)
    if not os.path.exists(out):
        raise SystemExit(f"download failed:\n{r.stderr[-800:]}")
    return out


def contact_sheet(path, label, n=24):
    os.makedirs("refs/sheets", exist_ok=True)
    tmp = f"refs/sheets/_{label}"
    os.makedirs(tmp, exist_ok=True)
    dur = measure.probe(path)["duration"]
    for i in range(n):
        t = i * dur / n
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", path,
                        "-frames:v", "1", "-vf", "scale=180:-1",
                        f"{tmp}/f{i:02d}.png"], capture_output=True)
    out = f"refs/sheets/{label}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{tmp}/f%02d.png",
                    "-filter_complex", "tile=8x3:margin=4:padding=4:color=0x181818",
                    out], capture_output=True)
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    return out


# The real export list. The model sometimes returns a plausible name we do not
# actually have; anything outside this set is treated as "needs building"
# rather than silently trusted. This catches invented names. It does NOT catch
# a real name used for the wrong motion (a node-network spread mapped to
# TagStack), which is why the cross-corpus audit reviews mappings by hand.
KNOWN = {
    "PopIn", "SlideIn", "Exit", "Reveal", "Drop", "Camera", "Plate", "PushWipe",
    "SliderReveal", "ConvergePanels", "ScrollReveal", "Montage", "TrimPath",
    "DottedDraw", "ContourDraw", "DrawnCallout", "PanelArrow", "CountUp",
    "StepPill", "TagStack", "AnimatedCheckList", "ChatThread", "Cursor",
    "SwipeCursor", "SlideOver", "ReasonIndex", "SectionHeadline", "OutroCard",
}


def report(label):
    """Readable, animation-first. The JSON is complete; this is what gets read."""
    rec = json.load(io.open(f"refs/formats/{label}.record.json", encoding="utf-8"))
    sem = json.load(io.open(f"refs/formats/{label}.semantic.json", encoding="utf-8"))
    m, L = rec["measured"], []
    A = L.append

    A(f"# {label}\n")
    A(f"**{rec.get('archetype')}** — {rec.get('one_line')}\n")
    A(f"{rec['duration_s']}s · {rec['canvas']['width']}x{rec['canvas']['height']} "
      f"@{rec['canvas']['fps']}\n")

    lang = sem.get("animation_language_summary") or {}
    if lang:
        A("## Animation language\n")
        for k in ("signature_moves", "how_things_enter", "how_things_leave",
                  "how_scenes_change", "what_stays_still", "rhythm"):
            v = lang.get(k)
            if not v:
                continue
            v = ", ".join(v) if isinstance(v, list) else v
            A(f"- **{k.replace('_', ' ')}** — {v}")
        A("")

    A("## Measured rhythm\n")
    p, e = m["pacing"], m["element_events"]
    A(f"| metric | this reel |")
    A(f"|---|---|")
    A(f"| frozen frames | {p['frozen_pct']}% |")
    A(f"| element arrivals / min | {e['per_min']} |")
    A(f"| hard cuts | {p['cuts']} ({p['cuts_per_min']}/min) |")
    A(f"| median shot | {p['median_shot_s']}s |")
    A(f"| transitions | {m['transitions']['count']} "
      f"(median {m['transitions']['median_s']}s) |")
    A(f"| speech | {m['audio']['speech_pct']}% |")
    ss = rec["scene_change_style"]
    A(f"| scene changes that are cuts | {ss['pct_scene_changes_that_are_cuts']}% "
      f"({ss['hard_cuts']} of {ss['described_scenes'] - 1}) |")
    A(f"| ground | `{m['treatment']['dominant_hex']}` "
      f"flat={m['treatment']['flat_background']} |\n")

    anims = sem.get("animations", [])
    for a in anims:
        claim = (a.get("we_already_have") or "").strip()
        base = claim.split("/")[0].strip()
        if claim and base not in KNOWN:
            a["_claimed_but_unknown"] = claim
            a["we_already_have"] = None
            a.setdefault("would_need_building",
                         f"model claimed '{claim}', which we do not have")
    have = [a for a in anims if a.get("we_already_have")]
    need = [a for a in anims if not a.get("we_already_have")]
    A(f"## Animations ({len(anims)})\n")
    A(f"{len(have)} we can already build · **{len(need)} we cannot**\n")

    if need:
        A("### Would need building\n")
        for a in need:
            A(f"**{a.get('name')}** — {a.get('what_moves')}  ")
            A(f"`{a.get('motion')}` · {a.get('direction')} · {a.get('feel')}"
              f"{' · staggered' if a.get('staggered') else ''}  ")
            A(f"*Purpose:* {a.get('purpose')}  ")
            A(f"*Reusable as:* {a.get('reusable_as')}  ")
            if a.get("would_need_building"):
                A(f"*Build:* {a.get('would_need_building')}")
            A("")

    if have:
        A("### Already in our vocabulary\n")
        A("| animation | our primitive | purpose |")
        A("|---|---|---|")
        for a in have:
            A(f"| {a.get('name')} | `{a.get('we_already_have')}` | "
              f"{str(a.get('purpose'))[:90]} |")
        A("")

    steal = sem.get("what_we_should_steal") or []
    if steal:
        A("## What to steal, ranked\n")
        for i, s in enumerate(steal, 1):
            A(f"{i}. {s}")
        A("")

    # The animation list above is a TAXONOMY of moves. This is the INVENTORY of
    # instances, and the two differ wildly: on ref-10 the taxonomy was 4 entries
    # for a sequence that swaps 14 labelled cards one after another.
    tl = sem.get("timeline") or []
    if tl:
        A(f"## Timeline — every animation instance ({len(tl)})\n")
        A("| t | motion | element | content |")
        A("|---|---|---|---|")
        for e in tl:
            A(f"| {e.get('approx_t')}s | `{e.get('motion')}` | "
              f"{str(e.get('element'))[:38]} | {str(e.get('content'))[:44]} |")
        A("")

    A("## Scenes\n")
    A("| start | frame | on a cut | layout | devices |")
    A("|---|---|---|---|---|")
    for s in rec["scenes"]:
        A(f"| {s['start_s']}s | {s['start_frame']} | "
          f"{'yes' if s['snapped_to_measured_cut'] else 'transition'} | "
          f"{s['layout']} | {', '.join(s['devices'])} |")
    A("")

    A("## Narrative arc\n")
    for i, b in enumerate(rec.get("narrative_arc") or [], 1):
        A(f"{i}. {b}")
    A("")

    # The inventory merges the top-level device list with the per-shot lists, so
    # the same thing arrives twice under different capitalisation — "Citation
    # Card" beside "citation overlay card". Left alone this inflated the corpus
    # device total to a number I quoted and had to walk back.
    seen, devs = set(), []
    for d in rec["device_inventory"]:
        k = re.sub(r"[^a-z0-9]", "", d["name"].lower()).rstrip("s")
        if k and k not in seen:
            seen.add(k)
            devs.append(d["name"])
    A(f"## Devices ({len(devs)})\n")
    A(", ".join(devs))
    A("")

    out = f"refs/formats/{label}.report.md"
    io.open(out, "w", encoding="utf-8").write("\n".join(L))
    return out, len(anims), len(need)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source", help="URL or local video path")
    ap.add_argument("--label", required=True)
    ap.add_argument("--model", default=None)
    a = ap.parse_args()
    label = a.label

    print(f"\n=== {label} ===")
    path = a.source if os.path.exists(a.source) else fetch(a.source, label)

    keys = describe_mod.api_keys()
    key = keys[0]
    box = {}

    def do_upload():
        # The Files API is metered too, so the upload has to rotate as well —
        # otherwise a dead first key blocks the run before any model is tried.
        last = None
        for k in keys:
            try:
                box["file"] = describe_mod.cached_upload(path, k)
                box["upload_key"] = k
                return
            except Exception as e:  # noqa: BLE001 - surfaced below
                last = f"{type(e).__name__}: {e}"
        box["upload_err"] = last

    up = threading.Thread(target=do_upload, daemon=True)
    up.start()
    print("  [gemini]  uploading in background")

    print("  [measure] reading every frame")
    sys.argv = ["measure-format.py", path, "--label", label]
    measure.main()
    sheet = contact_sheet(path, label)
    print(f"  [measure] contact sheet -> {sheet}")

    up.join(timeout=600)
    if "file" not in box:
        raise SystemExit(f"  upload failed: {box.get('upload_err', 'timeout')}")
    finfo = box["file"]
    key = box.get("upload_key", key)   # describe against the key that holds it

    m = json.load(io.open(f"refs/formats/{label}.json", encoding="utf-8"))
    models = [a.model] if a.model else None

    def run(kind, prompt):
        try:
            parsed, model, usage = describe_mod.call_with_fallback(
                finfo, key, prompt, models=models, keys=keys,
                upload_for=lambda k: describe_mod.cached_upload(path, k),
                log=lambda m: print(f'  [gemini] {m.strip()}', flush=True))
            box[kind] = parsed
            box[kind + "_meta"] = (model, usage.get("totalTokenCount"),
                                   usage.get("_key_index", 0))
        except describe_mod.QuotaExhausted as e:
            box["quota_wall"] = str(e)
            box[kind + "_err"] = f"QuotaExhausted: {e}"
        except Exception as e:  # noqa: BLE001
            box[kind + "_err"] = f"{type(e).__name__}: {e}"

    print("  [gemini]  two passes: animation + content")
    threads = [
        threading.Thread(target=run, args=("anim", describe_mod.prompt_animations(m)),
                         daemon=True),
        threading.Thread(target=run, args=("cont", describe_mod.prompt_content(m)),
                         daemon=True),
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=900)

    if box.get("quota_wall"):
        # exit 3 so the batch can tell "out of quota, stop" apart from
        # "this one reel is broken, keep going"
        print(f"  [gemini] QUOTA WALL: {box['quota_wall']}")
        sys.exit(3)
    for kind in ("anim", "cont"):
        if kind not in box:
            raise SystemExit(f"  [gemini] {kind} pass failed: "
                             f"{box.get(kind + '_err', 'timeout')}")

    # Third pass runs last because it uses the on-screen text from the content
    # pass as anchors. The animation pass returns a TAXONOMY of moves; this
    # returns the INVENTORY of instances. Both are needed: on one reel the
    # taxonomy was 4 entries for a sequence that swaps 14 labelled cards.
    print("  [gemini]  third pass: instance timeline")
    run("time", describe_mod.prompt_timeline(m, box["cont"].get("onscreen_text")))
    if box.get("quota_wall"):
        # A wall during the THIRD pass was not checked, only the first two. So
        # ref-04 was written with anim + content complete and timeline empty,
        # and reported as a finished reel. A half-analysed record that looks
        # finished is worse than a failed one: it does not get retried.
        print(f"  [gemini] QUOTA WALL on the timeline pass: {box['quota_wall']}")
        sys.exit(3)
    if "time" not in box:
        print(f"  [gemini] timeline pass failed: {box.get('time_err')}, continuing")

    used_model = box["anim_meta"][0]
    degraded = used_model != describe_mod.PRIMARY
    if degraded:
        print(f"  [gemini]  WARNING degraded: used {used_model}, "
              f"wanted {describe_mod.PRIMARY}")
    sem = {**box["cont"], **box["anim"],
           "timeline": (box.get("time") or {}).get("timeline", []),
           # Provenance so a corpus is never silently mixed again: the model
           # actually used, whether that was a downgrade, and the temperature.
           "_meta": {"model": used_model,
                     "wanted_model": describe_mod.PRIMARY,
                     "degraded": degraded,
                     "temperature": describe_mod.TEMPERATURE,
                     "key_index": box["anim_meta"][2],
                     "source": path,
                     "tokens": {"animation": box["anim_meta"][1],
                                "content": box["cont_meta"][1]},
                     "caveat": "timings approximate; measure-format.py is the "
                               "authority on time"}}
    n_fixed = describe_mod.normalise_times(sem, m["duration_s"])
    if n_fixed:
        print(f"  [gemini]  normalised {n_fixed} MM:SS timestamps to seconds")
    io.open(f"refs/formats/{label}.semantic.json", "w", encoding="utf-8").write(
        json.dumps(sem, indent=2, ensure_ascii=False))
    print(f"  [gemini]  ok via {box['anim_meta'][0]} — "
          f"{len(sem.get('animations', []))} animations, "
          f"{len(sem.get('devices', []))} devices, "
          f"{len(sem.get('timeline', []))} timeline events")

    sys.argv = ["merge-record.py", label]
    merge_mod.main()
    out, n_anim, n_need = report(label)
    print(f"\n  {n_anim} animations catalogued, {n_need} we cannot build yet")
    print(f"  report -> {out}")


if __name__ == "__main__":
    sys.exit(main())
