"""Get the SEMANTIC half of a reference video from Gemini.

Used by refs/analyse.py; runnable alone for debugging:

    python refs/describe.py refs/corpus/ref-01.mp4 --label ref-01-name

WHY THIS EXISTS, AND WHAT IT IS NOT FOR
---------------------------------------
`measure-format.py` reads every frame and returns exact numbers, and is blind to
meaning: it cannot read a word of on-screen text, cannot hear the voiceover, and
cannot tell a chart from a face. Before this existed the meaning came from a
human looking at a 24-frame contact sheet — one sample every 2.3s, of a video
that lands an element every 0.1s. Most of the reel was never seen.

It is deliberately NOT asked for durations, frame counts or easings. Video
models sample on the order of one frame per second; our transitions are 7-25
frames. Asked for a number it will produce a confident one it did not measure.

So: this says WHAT moves and WHY. measure-format.py says WHEN and HOW FAST.

TWO CALLS, NOT ONE
------------------
The first version asked one call for animations, devices, transcript, on-screen
text, shots and narrative together. It returned 6 animations for a video with
109 measured element arrivals, and an empty device list — a large schema makes
the model spread its budget thin and skim. Splitting into two focused calls
fixes that, and they run concurrently so it costs no wall time.

MEASUREMENTS GO IN, NOT JUST OUT
--------------------------------
The measured record is computed first and injected into both prompts. Telling
the model "this video has 109 element arrivals and is 50.5% frozen — account for
them" is the most effective anti-skim instruction available, and it is free
because the numbers already exist.
"""
import argparse
import io
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://generativelanguage.googleapis.com"
# Keys: ~/.config/gemini/.env if it exists, else the repo's gitignored .env.
_USER_ENV = os.path.expanduser(os.path.join("~", ".config", "gemini", ".env"))
ENV = _USER_ENV if os.path.exists(_USER_ENV) else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
# Pro is capped at zero on the free tier (429, "limit: 0"), and any single flash
# model can 503 under load. Chain, tried in order, each with backoff.
# PRIMARY is what the corpus is supposed to be analysed with. The rest exist so
# a transient 503 does not abandon a run — but falling back CHANGES THE RESULT
# and must never look like a clean success. The first batch ran on 3.7-flash and
# the re-run silently landed entirely on 3.6-flash because 3.7 was overloaded;
# that made a prompt comparison impossible to interpret, because two variables
# had moved. Every record now carries the model it actually used and a
# `degraded` flag when it is not PRIMARY.
PRIMARY = os.environ.get("REFS_MODEL", "gemini-3.5-flash")
# Model choice here is governed by QUOTA, not by quality, and that took two
# wrong guesses to establish. 3.7-flash 503'd on every reel (newest = most
# contended). 3.6-flash then started returning 429 "quota exceeded" — the free
# tier meters each model separately and 21 reels x 3 passes exhausts one. A
# direct probe found 3.5-flash answering in 1.2s while 3.6 was hard-429ing.
#
# So the corpus is pinned to 3.5-flash: available beats newest, and a corpus
# analysed entirely on one model beats a mixture containing a better one.
# On a paid key this constraint disappears and PRIMARY can move up via
# REFS_MODEL.
# gemini-2.5-flash and -lite were in this chain and BOTH return 404 "no
# longer available". They silently burned retry budget on every failure.
FALLBACKS = ["gemini-3.6-flash", "gemini-flash-latest"]
MODELS = [PRIMARY] + [m for m in FALLBACKS if m != PRIMARY]

# Deterministic by default. This was 0.2 for no reason, and the cost was real:
# the same reel, same model, same prompt returned 6 animations in one run and 10
# in the next. Any single run's counts were therefore meaningless, including in
# my own before/after comparisons.
TEMPERATURE = float(os.environ.get("REFS_TEMPERATURE", "0"))
CACHE = "refs/.upload-cache.json"

# Precise definitions, not a name list. Given only names the model matched an
# animated bar chart to `StepPill` (a numbered step indicator) and reported that
# we could already build everything in the reel — a false negative on the only
# question that produces work items.
OUR_PRIMITIVES = """
  PopIn            an element scales up from small with a spring overshoot
  SlideIn          an element translates in from one edge and fades up
  Drop             an element falls in from above
  Exit             an element translates away and fades out
  Reveal           an element scales slightly and fades in place
  Camera           a slow continuous push in or pull out on everything
  Plate            a whole beat's worth of content pushes off as the next pushes on
  PushWipe         one image slides across and displaces another
  SliderReveal     a draggable divider sweeps across, showing image A one side, B the other
  ConvergePanels   two separate portraits travel together and merge into one split face
  ScrollReveal     a tall image scrolls vertically inside a fixed window
  Montage          a sequence of images replacing each other in one frame position
  TrimPath         a stroked path draws itself along its length
  DottedDraw       a dotted leader line grows from one point to another
  ContourDraw      a glowing outline traces around a shape
  DrawnCallout     a leader line draws out and a text label fades in at its end
  PanelArrow       a small arrow between two panels
  CountUp          a number counts from one value to another
  StepPill         a small numbered step badge (1, 2, 3) — NOT a chart
  TagStack         small chips pop in one after another and PERSIST, accumulating
  AnimatedCheckList  list rows tick in one at a time
  ChatThread       message bubbles arrive in sequence
  Cursor/SwipeCursor  a pointer travels along a path and clicks or drags
  SlideOver        a panel slides over the top of existing content
  ReasonIndex      a numbered editorial list with rules drawing out from the left
  SectionHeadline  a headline where words sharpen from blurred, one by one
  OutroCard        a light card wipes across at the end and holds
"""

STRICTNESS = """
Be STRICT about `we_already_have`. Only name a primitive if it performs the SAME
motion on the SAME kind of object. Adjacent is not a match: a bar chart growing
its bars is NOT StepPill, a 2x2 grid appearing is NOT Montage, a mask opening is
NOT PopIn. When there is no true match, set it to null and fill
`would_need_building` with what we would actually have to write.

A wrong match is far worse than a null: null creates a work item, a wrong match
silently hides one. If in doubt, use null.
"""


def api_keys():
    """Every key in the env file, in order.

    Free-tier quota is metered per key AND per model, so a full corpus run walks
    into a wall partway through. Rotating keys turns that from "stop for the day"
    into "carry on", and the whole reason this is a list rather than a swap is
    that a wall must be survivable mid-batch rather than requiring a restart.

    Keys are never logged. Records store the key's INDEX so a run is traceable
    without the secret leaking into a report.
    """
    keys = []
    for line in io.open(ENV, encoding="utf-8"):
        if line.startswith("GEMINI_API_KEY"):
            v = line.split("=", 1)[1].strip()
            if v and v not in keys:
                keys.append(v)
    if not keys:
        raise SystemExit(f"no GEMINI_API_KEY* in {ENV}")
    return keys


def api_key():
    """First key — kept for callers that only need one (uploads)."""
    return api_keys()[0]


def _req(url, data=None, headers=None, method=None):
    r = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    return urllib.request.urlopen(r, timeout=600)


def cached_upload(path, key):
    """Upload once per file and reuse across retries, models and both calls."""
    # Keyed by path AND key: an uploaded file is owned by the key that sent it,
    # so a rotated key cannot reference the other key's file. Reusing one across
    # keys made the request hang rather than fail, which surfaced as a timeout.
    stamp = f"{os.path.getsize(path)}-{int(os.path.getmtime(path))}-{key[-8:]}"
    cache = {}
    if os.path.exists(CACHE):
        try:
            cache = json.load(io.open(CACHE, encoding="utf-8"))
        except json.JSONDecodeError:
            cache = {}
    ck = f"{path}|{key[-8:]}"
    hit = cache.get(ck)
    if hit and hit.get("stamp") == stamp:
        try:
            info = json.load(_req(f"{API}/v1beta/{hit['name']}",
                                  headers={"x-goog-api-key": key}))
            if info.get("state") == "ACTIVE":
                return info
        except urllib.error.HTTPError:
            pass
    info = upload(path, key)
    cache[ck] = {"stamp": stamp, "name": info["name"]}
    io.open(CACHE, "w", encoding="utf-8").write(json.dumps(cache, indent=2))
    return info


def upload(path, key):
    """Files API, resumable protocol. Videos are too big for an inline part."""
    size = os.path.getsize(path)
    mime = mimetypes.guess_type(path)[0] or "video/mp4"
    start = _req(
        f"{API}/upload/v1beta/files",
        data=json.dumps({"file": {"display_name": os.path.basename(path)}}).encode(),
        headers={"x-goog-api-key": key,
                 "X-Goog-Upload-Protocol": "resumable",
                 "X-Goog-Upload-Command": "start",
                 "X-Goog-Upload-Header-Content-Length": str(size),
                 "X-Goog-Upload-Header-Content-Type": mime,
                 "Content-Type": "application/json"},
    )
    session = start.headers.get("X-Goog-Upload-URL")
    if not session:
        raise SystemExit("no upload URL returned")
    body = open(path, "rb").read()
    up = _req(session, data=body,
              headers={"x-goog-api-key": key,
                       "Content-Length": str(size),
                       "X-Goog-Upload-Offset": "0",
                       "X-Goog-Upload-Command": "upload, finalize"})
    info = json.load(up)["file"]
    for _ in range(120):  # transcoded server-side; unusable until ACTIVE
        if info.get("state") == "ACTIVE":
            return info
        if info.get("state") == "FAILED":
            raise SystemExit("upload FAILED server-side")
        time.sleep(3)
        info = json.load(_req(f"{API}/v1beta/{info['name']}",
                              headers={"x-goog-api-key": key}))
    raise SystemExit("file never became ACTIVE")


def normalise_times(sem, duration):
    """Repair MM:SS timestamps that the model emits past the minute mark.

    Asked for seconds, it returns 59.0 then 1.07 then 1.11 on a 91s reel —
    1:07, 1:11 as decimals. Read as floats the timeline appears to travel
    backwards, and merge-record.py then snaps those scenes to 0.0s.

    A value is only rewritten when it is LOWER than the one before it AND the
    MM:SS reading lands after that predecessor and inside the runtime. That
    triple condition means a genuinely out-of-order list is left alone rather
    than silently "corrected".
    """
    fixed = 0
    for field, key in (("timeline", "approx_t"), ("onscreen_text", "approx_t"),
                       ("transcript", "approx_t"), ("shots", "approx_start"),
                       ("shots", "approx_end"), ("animations", "approx_t")):
        rows = sem.get(field) or []
        prev = -1.0
        for r in rows:
            v = r.get(key)
            if not isinstance(v, (int, float)):
                continue
            # Variant A: MM.SS as a decimal — 1.07 meaning 1:07. Shows up as a
            # value LOWER than its predecessor.
            if v < prev - 0.5:
                mmss = int(v) * 60 + round((v - int(v)) * 100)
                if prev < mmss <= duration + 1:
                    r[key] = float(mmss)
                    fixed += 1
                    prev = float(mmss)
                    continue
            # Variant B: MMSS as an integer — 101 meaning 1:01. Shows up as a
            # value ABOVE the runtime, so the ordering test never sees it. Found
            # on ref-05: "101" and "103" in a 64.5s reel, i.e. 61s and 63s.
            # Requiring a whole integer here was too narrow: ref-13 carried
            # 103.5 (1:03.5) and 106.4 (1:06.4, exactly its runtime), which the
            # integer test skipped. Floor-divide on the float instead.
            if v > duration + 2 and v >= 100:
                mmss = (v // 100) * 60 + (v % 100)
                if prev < mmss <= duration + 1 and (v % 100) < 60:
                    r[key] = float(mmss)
                    fixed += 1
                    prev = float(mmss)
                    continue
            prev = max(prev, float(v))
    return fixed


def facts_block(m):
    """Measured numbers, injected so the model cannot skim."""
    if not m:
        return ""
    p, e, t = m["pacing"], m["element_events"], m["transitions"]
    c = m.get("continuous_motion") or {}
    return f"""
ALREADY MEASURED FROM EVERY FRAME (facts — do not contradict them or restate
them as your own estimates):
  duration {m['duration_s']}s at {m['canvas']['fps']}fps
  {p['cuts']} hard cuts, median shot {p['median_shot_s']}s
  {t['count']} transitions, median {t['median_s']}s
  {e['count']} separate element arrivals ({e['per_min']}/min, median gap
    {e['median_gap_s']}s) — things popping in WITHOUT a scene change
  {c.get('spans', 0)} spans of SUSTAINED LOCAL MOTION covering {c.get('total_s', 0)}s
    = {c.get('pct_of_runtime', 0)}% of the runtime — things scrolling, drifting or
    panning rather than popping. Each span usually carries SEVERAL pieces of
    content through the frame, so it represents many more events than one.
  the frame is frozen {p['frozen_pct']}% of the time
  speech occupies {m['audio']['speech_pct']}% of the runtime

Read those two together. {e['count']} discrete arrivals PLUS
{c.get('pct_of_runtime', 0)}% of the runtime under sustained local motion. A reel
with a low arrival count but a high continuous percentage is not sparse — it is
scrolling, and each scroll carries many items past the viewer. Your output must
be consistent with a video that busy; listing only a handful means you skimmed.
"""


def prompt_animations(m):
    return f"""You are analysing a short-form vertical video ad so its ANIMATION
LANGUAGE can be rebuilt in code (Remotion). Animation is the ONLY subject of
this pass.
{facts_block(m)}
You see roughly one frame per second and CANNOT see a 7-frame move. Describe
motion in WORDS, never in numbers. Never state a duration.

For each distinct animation give what moves, how, WHY it is there, and how it
could be reused for different content. Purpose and reuse are the valuable
fields — a list of effects with no purpose attached is useless.

We can already build these, and nothing else:
{OUR_PRIMITIVES}
{STRICTNESS}

Return ONLY JSON:
{{
  "animations": [
    {{"name": "short memorable name",
      "approx_t": 0.0,
      "what_moves": "",
      "motion": "translate | scale | fade | wipe | mask-reveal | draw-on | morph | blur | rotate | stagger | parallax | count | none",
      "direction": "e.g. up, left-to-right, outward, none",
      "feel": "snappy | smooth | elastic | abrupt | floaty | mechanical",
      "staggered": true,
      "layered_with": "other motion at the same time, or null",
      "purpose": "why this animation is used HERE, in this argument. Specific.",
      "reusable_as": "how the same motion could carry different content elsewhere",
      "we_already_have": "name of our primitive, or null",
      "would_need_building": "what we would have to build, or null"}}
  ],
  "animation_language_summary": {{
    "signature_moves": ["the 2-4 moves that define this video's feel"],
    "how_things_enter": "", "how_things_leave": "", "how_scenes_change": "",
    "what_stays_still": "",
    "rhythm": "how motion is distributed — constant, bursty, building"
  }},
  "what_we_should_steal": ["ranked, most valuable first, each tied to an animation above"]
}}

Be exhaustive. Include small moves: a chip popping, a label sliding, a bar
growing, a thumbnail strip staggering in. Work scene by scene through the whole
runtime and do not stop early."""


def prompt_content(m):
    return f"""You are analysing a short-form vertical video ad so it can be
rebuilt in code. This pass covers CONTENT and LAYOUT. A separate pass covers
animation — do not describe motion here.
{facts_block(m)}
Timings are approximate and only used to align you with the measurements.

TIMESTAMPS MUST BE SECONDS AS A PLAIN NUMBER. 67 seconds is 67, never "1:07"
and never 1.07. On a video longer than a minute this matters: a switch to MM:SS
partway through makes the whole list read as going backwards in time.

Return ONLY JSON:
{{
  "format_archetype": "the KIND of video, e.g. 'evidence explainer', 'product demo', 'talking-head UGC', 'kinetic type', 'listicle'",
  "one_line": "one sentence on what this video does",
  "hook": {{"approx_seconds": "0-3", "what_happens": "", "why_it_works": ""}},
  "shots": [
    {{"approx_start": 0.0, "approx_end": 0.0, "description": "",
      "layout": "e.g. full-bleed portrait, 2x2 grid, chart panel, phone mockup",
      "devices": ["named visual devices in this shot"]}}
  ],
  "devices": [{{"name": "", "what_it_is": "", "used_for": ""}}],
  "onscreen_text": [
    {{"approx_t": 0.0,
      "track": "headline | caption | label | chip | chart | citation | ui | other",
      "text": "exact text as shown"}}
  ],
  "transcript": [{{"approx_t": 0.0, "text": ""}}],
  "narrative_arc": ["ordered beats of the argument"],
  "cta": {{"approx_t": 0.0, "what": ""}},
  "subjects": ["people shown, named if identifiable, and their role"],
  "what_makes_it_work": ["specific and critical, not flattering"]
}}

Be exhaustive on onscreen_text and devices — the highest value fields of this
pass. Transcribe text exactly, including chart axis labels and academic
citations. List every distinct device, however small."""


def prompt_timeline(m, onscreen=None):
    """Third pass: enumerate INSTANCES, in order, not animation types.

    The animation pass returns a taxonomy — the distinct kinds of move in the
    video. That is the right answer to "what is this video's language" and the
    wrong answer to "what happens in it". On one 20s reel it returned four
    animations for a sequence that swaps fourteen labelled cards at one-second
    intervals: all fourteen were folded into a single 'card_scroll_stack'.

    So this pass walks the runtime and lists every visible change as its own
    row, explicitly forbidding summarisation of repeats. Known on-screen text
    timings are handed over as anchors, because each label change is proof that
    something animated at that moment.
    """
    dur = m["duration_s"] if m else None
    anchors = ""
    if onscreen:
        rows = chr(10).join(f"    {t.get('approx_t')}s  {t.get('text','')[:60]}"
                          for t in onscreen[:60])
        anchors = f"""
TEXT ALREADY SEEN ON SCREEN, with timings. Every one of these appearing or
changing means something animated at that moment. Your timeline must account
for all of them:
{rows}
"""
    return f"""List every ANIMATION INSTANCE in this video, in chronological
order. This is an inventory, not a summary.
{facts_block(m)}{anchors}
RULES:
  - One row per visible change. If the same move repeats fourteen times with
    different content, that is FOURTEEN rows, not one.
  - Never write "repeats", "x14", "and so on", or "similar cards follow".
  - Cover the whole runtime{f' ({dur}s)' if dur else ''} from start to end.
  - Describe motion in words. Never state a duration in seconds or frames.
  - `approx_t` is SECONDS AS A PLAIN NUMBER. 67 seconds is 67, never "1:07" and
    never 1.07. Do not switch to MM:SS after the one-minute mark.

Return ONLY JSON:
{{
  "timeline": [
    {{"approx_t": 0.0,
      "event": "short description of what happens",
      "element": "what appears, changes or moves",
      "motion": "translate | scale | fade | wipe | mask-reveal | draw-on | morph | blur | rotate | cut | none",
      "content": "the text or subject carried by it, if any"}}
  ]
}}"""


class QuotaExhausted(RuntimeError):
    """Every model refused on quota.

    Raised so a batch can STOP rather than grind on. Yesterday this condition
    produced eight consecutive reels failing after twelve minutes each, all
    reported as "timeout" — the retry budget outlived the thread join, so the
    real cause never reached the log. A wall is not a transient error and must
    not be retried like one.
    """


def call(file_info, key, model, prompt):
    body = {
        "contents": [{"parts": [
            {"file_data": {"mime_type": file_info["mimeType"],
                           "file_uri": file_info["uri"]}},
            {"text": prompt},
        ]}],
        "generationConfig": {"response_mime_type": "application/json",
                             "temperature": TEMPERATURE,
                             "max_output_tokens": 32768},
    }
    resp = _req(f"{API}/v1beta/models/{model}:generateContent",
                data=json.dumps(body).encode(),
                headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    d = json.load(resp)
    cand = d["candidates"][0]
    txt = "".join(p.get("text", "") for p in cand["content"]["parts"])
    return txt, d.get("usageMetadata", {})


def call_with_fallback(file_info, key, prompt, models=None, log=print,
                       keys=None, upload_for=None):
    """Try each MODEL across ALL KEYS before dropping to a weaker model.

    Returns (parsed, model, usage), with usage["_key_index"] recording which key
    answered — the index, never the secret.

    The loop order is the whole point. The first version walked models within
    one key and only rotated when that key had nothing left, so a run degraded
    to a weaker model while a fresh key sat unused holding full quota on the
    good one. Preferring the pinned model across keys is also what finally makes
    single-model consistency achievable: the constraint that defeated it all day
    was per-key, per-model quota, and rotation is exactly the lever for that.
    """
    chain = models or MODELS
    all_keys = keys or [key]
    exhausted = set()          # (model, key_index) pairs known to be dry
    for model in chain:
        if model != chain[0]:
            log(f"    DEGRADED: falling back to {model} (wanted {chain[0]})")
        for ki, k in enumerate(all_keys):
            if (model, ki) in exhausted:
                continue
            fi = file_info
            if upload_for is not None:
                try:
                    fi = upload_for(k)          # this key's own copy
                except Exception as e:  # noqa: BLE001
                    log(f"    key{ki + 1}: upload failed ({type(e).__name__})")
                    exhausted.add((model, ki))
                    continue
            for attempt in range(3):
                try:
                    txt, usage = call(fi, k, model, prompt)
                    parsed = json.loads(txt)
                    usage = dict(usage or {})
                    usage["_key_index"] = ki
                    if ki:
                        log(f"    answered by key {ki + 1}")
                    return parsed, model, usage
                except urllib.error.HTTPError as e:
                    detail = e.read()[:300].decode(errors="replace")
                    if e.code == 429 and "limit: 0" in detail:
                        log(f"    {model}: not on this tier")
                        exhausted.add((model, ki))
                        break
                    if e.code == 429 and "quota" in detail.lower():
                        log(f"    {model} key{ki + 1}: quota exhausted")
                        exhausted.add((model, ki))
                        break
                    if e.code == 404:
                        log(f"    {model}: no longer exists")
                        for j in range(len(all_keys)):
                            exhausted.add((model, j))
                        break
                    if e.code in (500, 503):
                        time.sleep(8 * (attempt + 1))
                        continue
                    raise SystemExit(f"HTTP {e.code}: {detail}")
                except json.JSONDecodeError:
                    log(f"    {model}: unparseable JSON, retrying")
                    time.sleep(3)
    raise QuotaExhausted(
        f"every model exhausted across all {len(all_keys)} key(s)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--label", default=None)
    a = ap.parse_args()
    label = a.label or os.path.splitext(os.path.basename(a.path))[0]
    key = api_key()
    mpath = f"refs/formats/{label}.json"
    m = json.load(io.open(mpath, encoding="utf-8")) if os.path.exists(mpath) else None

    info = cached_upload(a.path, key)
    anim, mdl, _ = call_with_fallback(info, key, prompt_animations(m))
    cont, _, _ = call_with_fallback(info, key, prompt_content(m))
    rec = {**cont, **anim, "_meta": {"model": mdl, "source": a.path}}
    out = f"refs/formats/{label}.semantic.json"
    io.open(out, "w", encoding="utf-8").write(
        json.dumps(rec, indent=2, ensure_ascii=False))
    print(f"wrote {out}: {len(rec.get('animations', []))} animations, "
          f"{len(rec.get('devices', []))} devices")


if __name__ == "__main__":
    sys.exit(main())
