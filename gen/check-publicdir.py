"""Preflight: a per-reel `public-*/` dir must match `public/`, byte for byte.

    python gen/check-publicdir.py            # every public-* dir
    python gen/check-publicdir.py public-size

WHY THIS EXISTS. `public/` is 191 MB and Remotion copies it before every render,
so each reel gets a minimal `public-<reel>/` holding only the files it reads,
verified once against a full-`public/` render by md5. The verification is the
problem: it is done ONCE, at the moment the directory is created, and the
directory is then a SECOND COPY of assets that keep changing.

It went wrong the first time it could. `public-size/` was built, verified
byte-identical, and then `public/voiceover-size.mp3` was regenerated twice to
fix the read. Nothing copied the new audio across, so two finished renders went
out carrying the ORIGINAL 27-take voiceover -- and because the visuals had been
re-cut to the new 71.8s cue table while the audio was still 68.1s, the read also
ran ahead of the pictures. Every other check passed: `check-prosody` measured
`public/`, `shots.py --verify` measures the picture, and the phone sheet is
stills. The defect was invisible to all of them and was found by Rahul saying
the voiceover had not changed.

A cache that is verified once and then diverges silently is worse than no cache.
This makes the divergence a failure instead.
"""
import hashlib
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FULL = ROOT / "public"


def md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def check(d):
    bad, missing, n = [], [], 0
    for p in sorted(d.rglob("*")):
        if not p.is_file():
            continue
        n += 1
        rel = p.relative_to(d)
        src = FULL / rel
        if not src.is_file():
            missing.append(rel)
            continue
        if md5(src) != md5(p):
            bad.append(rel)
    print(f"   {d.name}: {n} file(s) against public/")
    for rel in missing:
        print(f"   !! {rel} — not in public/ at all")
    for rel in bad:
        print(f"   !! {rel} — STALE, differs from public/")
    if bad or missing:
        print(f"\n   FIX: copy the changed file(s) across, e.g.")
        for rel in (bad + missing)[:4]:
            print(f"     cp public/{rel.as_posix()} {d.name}/{rel.as_posix()}")
        return False
    return True


def main():
    dirs = ([ROOT / a for a in sys.argv[1:]]
            if len(sys.argv) > 1
            else sorted(p for p in ROOT.glob("public-*") if p.is_dir()))
    if not dirs:
        print("   no public-* dirs — nothing to check")
        return 0
    ok = True
    for d in dirs:
        if not d.is_dir():
            print(f"   {d} is not a directory")
            ok = False
            continue
        ok &= check(d)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
