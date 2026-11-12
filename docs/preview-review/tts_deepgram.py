"""Voiceover synthesis: script text in, a real VO and exact per-word frames out.

This is the third mode alongside `voscript.measure()` and `voscript.estimate()`,
and it changes what those two are for.

  estimate()   -- no voiceover. Every frame provisional.
  measure()    -- a recorded voiceover exists. Phrase boundaries inferred from
                  silencedetect, words spread by character weight inside them.
  synthesize() -- WE make the voiceover. So the pauses are not inferred, they
                  are the ones the script declared, and the word onsets are not
                  spread by a proxy, they are measured by speech-to-text on the
                  audio we just generated.

That last point is the whole reason this exists. `measure()` distributes words
across a phrase in proportion to their character count, because it cannot see
inside the speech -- it is a good proxy, and `gen-words.py` still needs a table
of hand-measured OVERRIDES where the proxy misreads an emphasised word. Here
each word carries a timestamp that came back from the audio, so there is
nothing to override.

WHY THIS DOES NOT VIOLATE INVARIANT E
-------------------------------------
The reel's words are load-bearing -- "a preview, not a promise", the compliance
chip -- and a transcription pass that rewrote them would be a machine editing a
claim. It cannot happen here: the SCRIPT is the input to synthesis, so the
transcript is a round-trip of text we already wrote. `align()` maps timings ONTO
the script's own words and never adopts the transcript's. Where the two disagree
(numerals, hyphenation, a swallowed article) the script wins and the timing is
interpolated. Disagreements are reported, never silently absorbed.

CACHING
-------
Each phrase is cached by (text, voice) hash under `refs/.tts-cache/`. Re-running
after editing one line re-synthesises one line. This keeps credits down and
makes repeat runs deterministic -- the same text always yields the same audio.

    from tts_deepgram import synthesize
    rows, total = synthesize(SCRIPT, "public/voiceover6.mp3", voice="vesta")
"""

from __future__ import annotations

import array
import difflib
import hashlib
import io
import json
import math
import os
import pathlib
import re
import statistics
import subprocess
import urllib.error
import urllib.request
import wave

FPS = 30
SILENCE_DBFS = -45.0  # anything quieter than this is a failed synthesis
SPEAK_URL = "https://api.deepgram.com/v1/speak"
LISTEN_URL = "https://api.deepgram.com/v1/listen"
RATE = 24000  # Aura-2 native; keep every segment here so concat is lossless
CACHE = pathlib.Path("refs/.tts-cache")
# run-up given to the recogniser either side of a cue during verification;
# see the note in verify() for why cutting exactly on the onset is unsafe
# Must stay BELOW the smallest declared pause in any script (0.25s in
# changed.txt). Rows are contiguous — row i starts exactly on its first word's
# onset, and the pause preceding it lives at the END of row i-1 — so a run-up
# longer than that pause reaches into the previous phrase and the recogniser
# returns its trailing words instead. Measured: 0.35s took the count over
# tolerance from 4 to 8.
PAD_S = 0.15


# ── credentials ──────────────────────────────────────────────────────


def api_key():
    """Read DEEPGRAM_API_KEY from the environment or the gitignored .env."""
    k = os.environ.get("DEEPGRAM_API_KEY")
    if k:
        return k.strip()
    env = pathlib.Path(".env")
    if env.is_file():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("DEEPGRAM_API_KEY="):
                return line.split("=", 1)[1].strip()
    raise SystemExit(
        "DEEPGRAM_API_KEY not found. Put it in .env (gitignored) as\n"
        "  DEEPGRAM_API_KEY=<key>\n"
        "or export it in the environment."
    )


def _post(url, body, key, content_type, accept_json):
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Authorization": f"Token {key}", "Content-Type": content_type},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=int(os.environ.get('DEEPGRAM_TIMEOUT', '180'))) as r:
            raw = r.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:400]
        raise SystemExit(f"Deepgram HTTP {e.code} at {url}\n  {detail}")
    return json.loads(raw.decode("utf-8")) if accept_json else raw


# ── synthesis ────────────────────────────────────────────────────────


def peak_dbfs(wav_bytes):
    """Peak level of a PCM wav, in dBFS. -inf for digital silence.

    Computed here rather than shelling to ffmpeg because it runs per phrase and
    per retry. `audioop` was removed in Python 3.13, so this reads the frames
    directly.
    """
    with wave.open(io.BytesIO(wav_bytes), "rb") as w:
        if w.getsampwidth() != 2:
            return 0.0  # not 16-bit; assume fine rather than guess
        frames = w.readframes(w.getnframes())
    if not frames:
        return float("-inf")
    a = array.array("h")
    a.frombytes(frames[: len(frames) - (len(frames) % 2)])
    pk = max(abs(x) for x in a) if a else 0
    return float("-inf") if pk == 0 else 20 * math.log10(pk / 32768.0)


def speak(text, voice, key, tries=3):
    """One phrase to 24kHz mono PCM wav bytes, cached by (text, voice).

    GUARDED AGAINST SILENT OUTPUT. Aura-2 intermittently returns HTTP 200 with a
    well-formed WAV that contains no speech -- observed on a clean six-word line
    at -74 dBFS mean. Nothing downstream notices: the file is valid, its duration
    is plausible, and the words simply get interpolated across silence. A reel
    would ship with a line missing from the read.

    So every synthesis is level-checked and retried, and a silent result is never
    written to the cache -- caching it would make the failure permanent and
    survive a re-run, which is the worst possible outcome.
    """
    CACHE.mkdir(parents=True, exist_ok=True)
    h = hashlib.sha1(f"{voice}\x00{text}".encode("utf-8")).hexdigest()[:16]
    hit = CACHE / f"{h}.wav"
    if hit.is_file() and hit.stat().st_size > 1000:
        return hit.read_bytes(), True

    url = (
        f"{SPEAK_URL}?model=aura-2-{voice}-en"
        f"&encoding=linear16&container=wav&sample_rate={RATE}"
    )
    body = json.dumps({"text": text}).encode("utf-8")
    last = None
    for attempt in range(1, tries + 1):
        raw = _post(url, body, key, "application/json", accept_json=False)
        if len(raw) < 1000:
            last = f"{len(raw)} bytes"
            continue
        pk = peak_dbfs(raw)
        if pk > SILENCE_DBFS:
            hit.write_bytes(raw)
            return raw, False
        last = f"peak {pk:.1f} dBFS"
        print(f"      silent output (attempt {attempt}/{tries}, {last}) -- retrying")
    raise SystemExit(
        f"Aura-2 returned silence {tries} times for: {text[:60]!r} ({last}).\n"
        "Not cached. Re-run, or reword the line."
    )


_WHISPER = None


def _transcribe_local(wav_bytes):
    """Same contract as transcribe(), run offline with faster-whisper small.en.

    Added 2026-10-23 (RefinaTrio): Deepgram's API became unreachable from this
    network mid-build -- TLS handshakes timing out -- AFTER every TTS unit had
    landed in the cache. Only the word-timing pass was left, and it does not
    need Deepgram: it needs onsets. Opt in with VO_STT=local. The VOICE is still
    Aura-2 vesta; nothing about the read changes.
    """
    global _WHISPER
    import io
    from faster_whisper import WhisperModel
    if _WHISPER is None:
        _WHISPER = WhisperModel("small.en", device="cpu", compute_type="int8")
    # Decode ourselves: faster-whisper's own decoder goes through PyAV, and the
    # installed PyAV rejects its `metadata_errors` argument. A 16 kHz mono float
    # array is what it wants anyway.
    import wave
    import numpy as np
    with wave.open(io.BytesIO(wav_bytes)) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16 if sw == 2 else np.int32)
    x = pcm.reshape(-1, ch).mean(axis=1).astype(np.float32) / (32768.0 if sw == 2 else 2**31)
    if sr != 16000:
        n = int(round(len(x) * 16000 / sr))
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
    segs, _ = _WHISPER.transcribe(x, word_timestamps=True, language="en", beam_size=5)
    return [(w.word.strip(), float(w.start), float(w.end))
            for s in segs for w in (s.words or [])]


def transcribe(wav_bytes, key):
    """Word-level timings for one audio blob: [(word, start_s, end_s)]."""
    if os.environ.get("VO_STT") == "local":
        return _transcribe_local(wav_bytes)
    url = f"{LISTEN_URL}?model=nova-3&smart_format=false&punctuate=false"
    d = _post(url, wav_bytes, key, "audio/wav", accept_json=True)
    alt = d["results"]["channels"][0]["alternatives"][0]
    return [(w["word"], float(w["start"]), float(w["end"])) for w in alt.get("words", [])]


# ── alignment ────────────────────────────────────────────────────────


def norm(w):
    """Compare-form of a word: lowercase, letters and digits only.

    'before-and-afters' -> 'beforeandafters', 'Refina.' -> 'refina'. Hyphens are
    dropped rather than split because the script treats a hyphenated compound as
    one word and its `w:` array must stay the same length as `text.split(" ")`.
    """
    return re.sub(r"[^a-z0-9]", "", w.lower())


def align(script_words, stt):
    """Map STT onsets onto the SCRIPT's words. Returns (starts, n_missed).

    The script's word list is authoritative and its length is preserved exactly.

    MATCHING IS CHARACTER-LEVEL, NOT TOKEN-LEVEL. Token matching looks obvious
    and is wrong here, because the transcript does not tokenise the way the
    script does:

      script  "before-and-afters."   ->  STT  "before" "and" "afters"
      script  "Refina."              ->  STT  "rufina"   (unknown proper noun)

    Token matching fails both -- one script word against three, and a near-miss
    spelling -- so those words fall through to interpolation and land tens of
    frames off. Aligning the normalised character streams instead matches
    'before' inside 'beforeandafters' and 'refina' against 'rufina', and each
    script word takes the onset of the first transcript token its characters
    reach. Unmatched words are still interpolated between known neighbours, so a
    genuinely swallowed 'a' never shifts the words around it.
    """
    s_chars, s_owner = [], []
    for i, w in enumerate(script_words):
        for ch in norm(w):
            s_chars.append(ch)
            s_owner.append(i)
    t_chars, t_owner = [], []
    for j, (w, _s, _e) in enumerate(stt):
        for ch in norm(w):
            t_chars.append(ch)
            t_owner.append(j)
    if not t_chars or not s_chars:
        return None, len(script_words)

    starts = [None] * len(script_words)
    sm = difflib.SequenceMatcher(a="".join(s_chars), b="".join(t_chars), autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            wi = s_owner[blk.a + k]
            if starts[wi] is None:
                starts[wi] = stt[t_owner[blk.b + k]][1]
    missed = sum(1 for s in starts if s is None)

    # Interpolate gaps. Ends clamp to the nearest known value.
    known = [i for i, s in enumerate(starts) if s is not None]
    if not known:
        return None, len(a)
    for i in range(len(starts)):
        if starts[i] is not None:
            continue
        prev = max((k for k in known if k < i), default=None)
        nxt = min((k for k in known if k > i), default=None)
        if prev is None:
            starts[i] = starts[nxt]
        elif nxt is None:
            starts[i] = starts[prev]
        else:
            f = (i - prev) / (nxt - prev)
            starts[i] = starts[prev] + (starts[nxt] - starts[prev]) * f
    return starts, missed


# ── audio assembly ───────────────────────────────────────────────────


def trim_silence(wav_bytes, floor_db=-50.0, keep=0.03):
    """Strip the silence Aura-2 pads each phrase with. Returns (bytes, lead_s).

    WHY THIS IS NOT OPTIONAL. The script declares the pause after every phrase,
    and the whole point of declaring them per phrase is that a script written in
    short punches IS its pauses. But Aura-2 hands back its own leading and
    trailing silence on top of that — the same non-determinism the caching note
    describes, "differs in length by up to a second, mostly trailing silence."
    Concatenating the raw phrase and then appending the declared pause stacks
    the two.

    Measured on the first full run of `changed.txt`: 12.9s of declared pauses
    turned into 31.5s of actual silence, so the reel came out 31% silence
    against a corpus median of 4%, and 40 seconds longer than its own script
    said it should be. The gaps were not authored, they were inherited.

    `keep` leaves a sliver of room either side so consecutive phrases do not
    butt hard against each other. The returned `lead` is what the caller must
    subtract from every STT word onset, because those were measured against the
    untrimmed audio.
    """
    with wave.open(io.BytesIO(wav_bytes), "rb") as w:
        if w.getsampwidth() != 2 or w.getnchannels() != 1:
            return wav_bytes, 0.0
        rate = w.getframerate()
        frames = w.readframes(w.getnframes())
        params = w.getparams()

    a = array.array("h")
    a.frombytes(frames[: len(frames) - (len(frames) % 2)])
    if not a:
        return wav_bytes, 0.0

    thresh = (10 ** (floor_db / 20.0)) * 32768.0
    win = max(1, rate // 200)  # 5ms
    loud = [
        i
        for i in range(0, len(a) - win, win)
        if max(abs(v) for v in a[i : i + win]) > thresh
    ]
    if not loud:
        return wav_bytes, 0.0  # all quiet; speak() already guards this case

    pad = int(keep * rate)
    start = max(0, loud[0] - pad)
    end = min(len(a), loud[-1] + win + pad)

    out = io.BytesIO()
    with wave.open(out, "wb") as w:
        w.setparams(params)
        w.setnframes(0)
        w.writeframes(a[start:end].tobytes())
    return out.getvalue(), start / float(rate)


def rms_dbfs(wav_bytes):
    """RMS level of a PCM wav, in dBFS. The sibling of `peak_dbfs`."""
    with wave.open(io.BytesIO(wav_bytes), "rb") as w:
        if w.getsampwidth() != 2:
            return 0.0
        frames = w.readframes(w.getnframes())
    if not frames:
        return float("-inf")
    a = array.array("h")
    a.frombytes(frames[: len(frames) - (len(frames) % 2)])
    if not a:
        return float("-inf")
    s = math.sqrt(sum(float(x) * x for x in a) / len(a))
    return float("-inf") if s == 0 else 20 * math.log10(s / 32768.0)


def set_rms(wav_bytes, target_dbfs, ceiling_dbfs=-1.0):
    """Scale a PCM wav to a target RMS, without letting the peak clip.

    WHY LEVEL IS MATCHED AT ALL. Aura-2 is called once per unit and picks its own
    loudness each time, so the finished read drifts in level between units with
    nothing in the pipeline watching. Measured on `voiceover-size.mp3` the units
    spanned **11.5 dB**, which is most of the way to sounding like two different
    recordings spliced together — Rahul heard exactly that. Grouping the calls
    shrinks the problem; this removes what is left.

    It is a constant gain per unit, never a compressor: the level RELATIONSHIPS
    inside a unit are the performance, and flattening those is what the Sound
    section of CLAUDE.md records as burying every soft word ending.
    """
    with wave.open(io.BytesIO(wav_bytes), "rb") as w:
        params = w.getparams()
        if w.getsampwidth() != 2:
            return wav_bytes
        frames = w.readframes(w.getnframes())
    a = array.array("h")
    a.frombytes(frames[: len(frames) - (len(frames) % 2)])
    if not a:
        return wav_bytes
    cur = rms_dbfs(wav_bytes)
    if cur == float("-inf"):
        return wav_bytes
    gain = 10 ** ((target_dbfs - cur) / 20.0)
    pk = max(abs(x) for x in a) / 32768.0
    if pk * gain > 10 ** (ceiling_dbfs / 20.0):
        gain = (10 ** (ceiling_dbfs / 20.0)) / max(pk, 1e-9)
    out = array.array("h", (int(max(-32768, min(32767, round(x * gain)))) for x in a))
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setparams(params)
        w.setnframes(0)
        w.writeframes(out.tobytes())
    return buf.getvalue()


def splice_pauses(wav_bytes, cuts_s, pauses_s):
    """Insert silence INSIDE one continuously-spoken unit, at measured points.

    WHY A GROUPED READ STILL NEEDS THIS. Making the beat the unit of synthesis
    fixed the read sounding like spliced takes, but it also took the script's
    pauses away inside a beat: the model runs its phrases together at whatever
    spacing it likes. At `--speed 1.22` that left the hook's first caption
    finished for SEVEN frames before the next line replaced it, against a floor
    of twelve -- `check-legibility.py` caught it, and it is a real defect: a
    caption nobody can finish reading is not a caption.

    Splicing silence at a phrase boundary is not the thing that caused the
    original problem. That was 27 SEPARATE TTS CALLS, each with its own pace and
    pitch. Here the voice either side of the gap is one continuous take, so
    there is no seam to hear -- only room to read.

    `cuts_s` are offsets into the audio, `pauses_s` the silence to insert at
    each. Returns (bytes, shifts) where shifts[i] is the total seconds inserted
    BEFORE cuts_s[i], so the caller can move its word onsets.
    """
    with wave.open(io.BytesIO(wav_bytes), "rb") as w:
        params = w.getparams()
        rate = w.getframerate()
        frames = w.readframes(w.getnframes())
    a = array.array("h")
    a.frombytes(frames[: len(frames) - (len(frames) % 2)])

    out = array.array("h")
    shifts, prev, added = [], 0, 0.0
    for c, p in zip(cuts_s, pauses_s):
        shifts.append(added)
        if p <= 0:
            continue
        i = max(0, min(len(a), int(round(c * rate))))
        out.extend(a[prev:i])
        out.extend(array.array("h", [0] * int(round(p * rate))))
        prev = i
        added += p
    out.extend(a[prev:])

    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setparams(params)
        w.setnframes(0)
        w.writeframes(out.tobytes())
    return buf.getvalue(), shifts


def voiced_seconds(wav_bytes, win_s=0.03, floor_db=-45.0):
    """Seconds of the wav that carry speech, for a rate measurement.

    Rate has to be measured over the VOICED span, not the file: a unit that ends
    on a long breath is not speaking slowly, it is speaking and then pausing.
    """
    with wave.open(io.BytesIO(wav_bytes), "rb") as w:
        if w.getsampwidth() != 2:
            return 0.0
        rate = w.getframerate()
        frames = w.readframes(w.getnframes())
    a = array.array("h")
    a.frombytes(frames[: len(frames) - (len(frames) % 2)])
    win = max(1, int(win_s * rate))
    n = len(a) // win
    total = 0
    for i in range(n):
        chunk = a[i * win:(i + 1) * win]
        s = math.sqrt(sum(float(x) * x for x in chunk) / len(chunk))
        if s > 0 and 20 * math.log10(s / 32768.0) > floor_db:
            total += 1
    return total * win / float(rate)


def set_tempo(wav_bytes, factor):
    """Re-time speech by `factor` (>1 faster) without moving its pitch.

    WHY THIS IS BOUNDED AND CONDITIONAL. Aura-2 exposes no rate control, so a
    unit it decides to rush can only be corrected after the fact. `atempo` is a
    phase-vocoder and is transparent on speech at small ratios; it is audible as
    a smear well before it is useful as a fix. So callers apply it only to units
    that fall OUTSIDE tolerance, and only far enough to bring them to the edge of
    it -- never to flatten every unit onto the median. A read where every beat
    is delivered at identical speed is not a read, it is a metronome, and the
    variation between a hook and a CTA is the performance.
    """
    if abs(factor - 1.0) < 0.01:
        return wav_bytes
    p = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "wav", "-i", "pipe:0",
         "-filter:a", f"atempo={factor:.4f}", "-c:a", "pcm_s16le",
         "-ar", str(RATE), "-ac", "1", "-f", "wav", "pipe:1"],
        input=wav_bytes, stdout=subprocess.PIPE, check=True,
    )
    return p.stdout


def _silence(seconds, path):
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "lavfi",
         "-i", f"anullsrc=r={RATE}:cl=mono", "-t", f"{seconds:.4f}",
         "-c:a", "pcm_s16le", str(path), "-y"],
        check=True,
    )


def _wav_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return float(out)


# ── the mode ─────────────────────────────────────────────────────────


def synthesize(script, out_audio, voice="vesta", work=None, verbose=True,
               groups=None, match_level=True,
               rate_tol=0.25, max_tempo=0.18, speed=1.0):
    """Build the voiceover and its per-word frame table.

    `script` is [(text, pause_after_seconds)] -- the same shape `measure()` and
    `estimate()` take, so a reel switches modes by changing one call.

    Returns (rows, total_frames, report) where rows is
    [(f, t, text, [word_frames])] exactly as `voscript.write_ts` expects.

    `groups` IS THE FIX FOR A READ THAT DOES NOT SOUND LIKE ONE PERSON. It is a
    list of phrase counts -- normally a reel's beat structure -- and it changes
    the unit of synthesis from the PHRASE to the GROUP.

    One TTS call per phrase is what makes the timing exact, and it is also why
    `voiceover-size.mp3` came back sounding like it was assembled from takes:
    Aura-2 chooses pace, pitch and loudness afresh for every call, with no
    knowledge of the phrases either side. Measured over its 27 phrases, the
    speaking rate ran **111 to 417 wpm** and the level spanned **11.5 dB**.
    Probed directly, its `cta` beat's four phrases varied 2.35x in rate and 7.0
    dB in level when spoken separately, and not at all when spoken as one call.

    So a group is synthesised, transcribed and levelled as ONE utterance, and
    the phrase boundaries inside it come from the MEASURED word onsets rather
    than from declared silence. Two consequences worth stating plainly:

      * A pause declared on a line INSIDE a group is dropped -- the model's own
        phrasing supplies it. Only the last line of a group keeps its pause,
        which becomes the gap to the next group. The declared pauses are still
        the script's intent; they just stop being inserted mid-sentence.
      * Timing stays measured, so nothing downstream changes. `words-vo.ts` has
        the same shape and `verify()` still re-measures the finished mp3.

    Pass `groups=None` for the original phrase-at-a-time behaviour.
    """
    key = api_key()
    work = pathlib.Path(work or "refs/.tts-build")
    work.mkdir(parents=True, exist_ok=True)
    for old in work.glob("seg-*.wav"):
        old.unlink()

    rows, parts, offset, report = [], [], 0.0, {"cached": 0, "synth": 0, "missed": []}

    # Units of synthesis. One phrase each by default; one BEAT each when the
    # caller passes `groups`, which is what makes the read sound continuous.
    if groups is None:
        units = [[i] for i in range(len(script))]
    else:
        if sum(groups) != len(script):
            raise SystemExit(
                f"groups sum to {sum(groups)} but the script has {len(script)} lines"
            )
        units, k = [], 0
        for n in groups:
            units.append(list(range(k, k + n)))
            k += n

    # PASS 1 — speak, transcribe and trim every unit before writing any of them,
    # because the level target is the read's OWN median and is not known until
    # all of them exist. Levelling to a fixed constant instead would move every
    # reel's loudness whenever the voice changed.
    built = []
    for u, idx in enumerate(units):
        texts = [script[j][0] for j in idx]
        joined = " ".join(texts)
        raw, cached = speak(joined, voice, key)
        report["cached" if cached else "synth"] += 1
        trimmed, _lead = trim_silence(raw)
        built.append(dict(idx=idx, texts=texts, joined=joined, wav=trimmed,
                          cached=cached, pause=script[idx[-1]][1]))
        if verbose:
            dropped = sum(1 for j in idx[:-1] if script[j][1] > 0)
            note = f"  ({dropped} inner pause(s) now phrasing)" if dropped else ""
            print(f"  [{u + 1:2}/{len(units)}] "
                  f"{'cache' if cached else 'synth'}  {len(idx)} line(s){note}")

    target = statistics.median(rms_dbfs(b["wav"]) for b in built)
    if verbose and match_level:
        print(f"  levelling {len(built)} unit(s) to {target:.1f} dBFS RMS")

    # RATE: pull only the OUTLIERS back, and measure them AFTER levelling.
    #
    # Aura-2 has no rate control and will rush a unit for no stated reason --
    # measured on this reel's `demo` beat at 268 wpm against a ~200 median, which
    # is what "somewhere it is fast" sounds like. Everything inside tolerance is
    # left exactly as delivered, because the difference between a hook and a CTA
    # is the performance and flattening it produces a metronome.
    #
    # THE ORDER HERE IS LOAD-BEARING. Rate is words over the VOICED span, and
    # "voiced" is a level threshold, so changing a unit's gain changes how many
    # frames clear it and therefore its measured rate. Measuring before levelling
    # put this generator's median at 210 wpm while `check-prosody.py` -- which
    # reads the finished mp3 -- saw 202, so the generator corrected a beat the
    # check thought was fine and under-corrected one it did not. Level first,
    # then measure, and the two agree.
    for b in built:
        b["levelled"] = set_rms(b["wav"], target) if match_level else b["wav"]
        vs = voiced_seconds(b["levelled"])
        b["wpm"] = len(b["joined"].split()) / vs * 60 if vs > 0.2 else 0.0
    rates = [b["wpm"] for b in built if b["wpm"] > 0]
    med_rate = statistics.median(rates) if rates else 0.0
    for b in built:
        b["tempo"] = 1.0
        if not (rate_tol and med_rate and b["wpm"]):
            continue
        hi, lo = med_rate * (1 + rate_tol), med_rate * (1 - rate_tol)
        if lo <= b["wpm"] <= hi:
            continue
        # Land COMFORTABLY inside the band, not exactly on its edge: mp3
        # encoding moves the measurement by a hair, and a unit parked on the
        # threshold flips between passing and failing between runs.
        want = med_rate * (1 + rate_tol * 0.5) if b["wpm"] > hi else med_rate * (1 - rate_tol * 0.5)
        f = want / b["wpm"]
        b["tempo"] = max(1 - max_tempo, min(1 + max_tempo, f))
        b["evened"] = True
        if verbose:
            print(f"  rate: {b['joined'][:30]!r} {b['wpm']:.0f} wpm vs "
                  f"{med_rate:.0f} median -> atempo {b['tempo']:.3f}"
                  + ("  (clamped)" if abs(f - b["tempo"]) > 1e-6 else ""))

    # SPEED is a deliberate, GLOBAL multiplier on top of the evening-out above.
    #
    # It is a different thing from the outlier correction and must not be
    # confused with it: that one removes differences BETWEEN units, this one
    # moves the whole read and leaves every relationship intact. Aura-2 has no
    # rate parameter, so overall pace can only be set here.
    #
    # `vesta` delivers this repo's scripts at roughly 130 wpm counted the
    # conventional way (words over WALL-CLOCK, pauses included), against ~170
    # for the corpus explainers -- which is why our reels keep coming out long.
    # Speed is the lever for that; the script's word count is the other one.
    if speed and abs(speed - 1.0) > 0.001:
        for b in built:
            b["tempo"] *= speed
        if verbose:
            print(f"  speed: x{speed:.2f} on every unit")

    # PASS 2 — retime, level, write, then TRANSCRIBE THE FINISHED SEGMENT.
    #
    # Transcription used to run on the raw cached audio and every onset was then
    # shifted back by the amount `trim_silence` had removed. That fudge cannot
    # survive retiming, and it was never necessary: measure the bytes that
    # actually get concatenated and the onsets need no correction at all.
    for u, b in enumerate(built):
        # `levelled` already carries the gain; retiming does not change RMS
        # enough to matter, and re-levelling after it would undo the very
        # measurement the tempo decision was made against.
        wav = set_tempo(b["levelled"], b["tempo"]) if b["tempo"] != 1.0 else b["levelled"]
        seg = work / f"seg-{u:03d}.wav"
        seg.write_bytes(wav)
        dur = _wav_duration(seg)
        parts.append(seg)

        stt = transcribe(wav, key)
        words = b["joined"].split(" ")
        starts, missed = align(words, stt)
        if starts is None:
            # No transcript at all -- fall back to character weighting so the
            # build still completes, and say so loudly.
            ws = [len(w) + 1 for w in words]
            s = sum(ws)
            acc, starts = 0, []
            for w in ws:
                starts.append(dur * acc / s)
                acc += w
            report["missed"].append((u, b["joined"], "NO TRANSCRIPT"))
        elif missed:
            report["missed"].append((u, b["joined"], f"{missed}/{len(words)} interpolated"))

        # HONOUR THE SCRIPT'S PAUSES INSIDE THE UNIT, by splicing silence at the
        # MEASURED phrase boundaries. The boundary is the first word onset of the
        # next phrase, so this is the script's declared breathing room landing
        # exactly where the script asked for it, in audio that is still one take.
        inner = [script[j][1] for j in b["idx"][:-1]]
        if any(p > 0 for p in inner):
            edges, k = [], 0
            for j in b["idx"][:-1]:
                k += len(script[j][0].split(" "))
                edges.append(starts[k] if k < len(starts) else dur)
            wav, shifts = splice_pauses(wav, edges, inner)
            seg.write_bytes(wav)
            dur = _wav_duration(seg)
            # every onset moves by the silence inserted before it
            moved, k, si = [], 0, 0
            for j in b["idx"]:
                n = len(script[j][0].split(" "))
                # shifts[i] is what was inserted BEFORE boundary i, inner[i] is
                # what was inserted AT it, so everything after boundary si-1
                # moves by their sum. The first phrase never moves.
                add = 0.0 if si == 0 else (shifts[si - 1] + inner[si - 1])
                moved += [s + add for s in starts[k:k + n]]
                k += n
                si += 1
            starts = moved

        unit_end = round((offset + dur + b["pause"]) * FPS)
        # `starts` came from the FINISHED segment, so no correction is needed.
        at = [round((offset + max(0.0, s)) * FPS) for s in starts]

        # Split the unit's word onsets back onto its phrases, in order.
        cut = 0
        for p, j in enumerate(b["idx"]):
            text = script[j][0]
            n = len(text.split(" "))
            times = sorted(at[cut: cut + n]) or [round(offset * FPS)]
            f = times[0]
            # A phrase ends where the next one starts; the last ends with the
            # unit, pause included. That is what keeps a caption on screen
            # through the gap the model itself left.
            if p + 1 < len(b["idx"]):
                nxt = at[cut + n] if cut + n < len(at) else unit_end
                end = max(f + 1, nxt)
            else:
                end = max(f + 1, unit_end)
            times = [max(f, min(end - 1, t)) for t in times]
            rows.append((f, end, text, times))
            cut += n

        if b["pause"] > 0:
            sil = work / f"seg-{u:03d}-pause.wav"
            _silence(b["pause"], sil)
            parts.append(sil)
        offset += dur + b["pause"]

    # One concat, one encode.
    lst = work / "concat.txt"
    io.open(lst, "w", encoding="utf-8", newline="\n").write(
        "\n".join(f"file '{p.resolve().as_posix()}'" for p in parts) + "\n"
    )
    pathlib.Path(out_audio).parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "concat",
         "-safe", "0", "-i", str(lst), "-c:a", "libmp3lame", "-b:a", "192k",
         "-ar", str(RATE), "-ac", "1", str(out_audio), "-y"],
        check=True,
    )
    return rows, round(offset * FPS), report


def _slice_wav(src, start_s, end_s, dst):
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{start_s:.3f}",
         "-to", f"{end_s:.3f}", "-i", str(src), "-c:a", "pcm_s16le",
         "-ar", str(RATE), "-ac", "1", str(dst), "-y"],
        check=True,
    )


def verify(out_audio, rows, tolerance_frames=6, work=None):
    """Re-measure the FINISHED mp3 and compare against the table we wrote.

    Invariant I: claims about the finished artefact are made against the finished
    artefact. Everything in `synthesize()` is computed from per-phrase wavs plus
    an arithmetic offset; this is what proves concatenation and mp3 encoding did
    not move anything.

    PER PHRASE, NOT ONE PASS OVER THE WHOLE FILE. Transcribing the finished mp3
    in a single call looks cheaper and silently under-reports: on a 23s / 36-word
    test the whole-file pass returned 33 words and dropped the entire final
    phrase, which the check then read as 126 frames of drift that did not exist.
    The audio was correct; the measurement was not. Slicing each cue out of the
    finished file and transcribing it alone keeps every phrase short enough to
    come back complete, at the cost of one call per cue.
    """
    key = api_key()
    work = pathlib.Path(work or "refs/.tts-build")
    work.mkdir(parents=True, exist_ok=True)
    src = pathlib.Path(out_audio)

    n_words = n_missed = over = 0
    drifts = []
    worst_cue = None
    for i, (f, t, text, times) in enumerate(rows):
        piece = work / f"vfy-{i:03d}.wav"
        # PAD THE SLICE. Cutting exactly on the first word's onset leaves the
        # recogniser no run-up, and nova-3 intermittently drops the opening
        # words of a short clip: "Chin down hides a jawline." came back three
        # times as just "hides a jawline", which made `align` map the script's
        # first word onto `hides` and reported 21 frames of drift that did not
        # exist — the same phrase transcribed with room around it returned all
        # five words and matched the table to one frame.
        #
        # This is failure mode B at the other end of the clip. Whole-file
        # transcription drops the tail; exactly-cut slices drop the head.
        lead = min(PAD_S, f / FPS)
        _slice_wav(src, f / FPS - lead, t / FPS + PAD_S, piece)
        stt = transcribe(piece.read_bytes(), key)
        words = text.split(" ")
        starts, missed = align(words, stt)
        n_words += len(words)
        if starts is None:
            n_missed += len(words)
            continue
        n_missed += missed
        for k, s in enumerate(starts):
            d = abs(round((f / FPS - lead + s) * FPS) - times[k])
            drifts.append(d)
            if d > tolerance_frames:
                over += 1
                if worst_cue is None or d > worst_cue[1]:
                    worst_cue = (f"cue {i} '{words[k]}'", d)
        piece.unlink(missing_ok=True)

    return {
        "words": n_words,
        "interpolated": n_missed,
        "max_drift_frames": max(drifts) if drifts else 0,
        "mean_drift_frames": round(sum(drifts) / len(drifts), 2) if drifts else 0,
        "over_tolerance": over,
        "tolerance": tolerance_frames,
        "worst": worst_cue,
    }
