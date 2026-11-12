"""ElevenLabs TTS with word timings, for the Glow Up pack reels.

One request for the whole read (keeps prosody continuous), via the
/with-timestamps endpoint, so word onsets come from the synthesiser's own
character alignment -- no STT pass, nothing typed.

  python gen/glowup/tts_eleven.py --script docs/scripts/glowup-s2.txt \
      --voice EXAVITQu4vr4xnSDxMaL --out public-glowup/s2/vo.mp3 \
      --words public-glowup/s2/words.json [--speed 1.1]

Key: ELEVENLABS_API_KEY (Windows user env var; set 2026-11-12). Never printed.
Spends characters on the account: ask Rahul first (spend-approval rule).
"""
import argparse, base64, json, os, re, sys, urllib.request


def key():
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k and sys.platform == "win32":
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as h:
            k = winreg.QueryValueEx(h, "ELEVENLABS_API_KEY")[0]
    if not k:
        sys.exit("ELEVENLABS_API_KEY not set")
    return k


def words_from_alignment(al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur = [], None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur:
                out.append(cur); cur = None
            continue
        if cur is None:
            cur = {"text": c, "start": s, "end": e}
        else:
            cur["text"] += c; cur["end"] = e
    if cur:
        out.append(cur)
    # a bare dash is punctuation, not a word: fold it out
    out = [w for w in out if re.search(r"[A-Za-z0-9]", w["text"])]
    for w in out:
        w["word"] = re.sub(r"[^A-Za-z0-9']", "", w["text"]).lower()
        w["start"], w["end"] = round(w["start"], 3), round(w["end"], 3)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", required=True)
    ap.add_argument("--voice", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--words", required=True)
    ap.add_argument("--model", default="eleven_multilingual_v2")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--stability", type=float, default=0.55)
    a = ap.parse_args()
    text = " ".join(open(a.script, encoding="utf-8").read().split())
    body = json.dumps({
        "text": text, "model_id": a.model,
        "voice_settings": {"stability": a.stability, "similarity_boost": 0.8,
                           "style": 0.0, "use_speaker_boost": True, "speed": a.speed},
    }).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{a.voice}/with-timestamps?output_format=mp3_44100_128",
        data=body, headers={"xi-api-key": key(), "Content-Type": "application/json", "User-Agent": "refina-reel/1.0"})
    r = json.load(urllib.request.urlopen(req, timeout=300))
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, "wb").write(base64.b64decode(r["audio_base64"]))
    words = words_from_alignment(r.get("alignment") or r["normalized_alignment"])
    json.dump({"text": text, "voice": a.voice, "model": a.model, "speed": a.speed,
               "words": words}, open(a.words, "w"), indent=1)
    dur = words[-1]["end"]
    print(f"{len(words)} words, last word ends {dur:.2f}s, {len(words)/dur*60:.0f} wpm, {len(text)} chars")


if __name__ == "__main__":
    main()
