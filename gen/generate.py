"""Generate procedure previews through gflow-cli, one run per (procedure x strategy).

Replaces the manual loop (type a prompt into Flow, download from ~/Downloads,
rename by hand) that produced the 2026-08-10 batch. Reads gen/procedures.toml,
writes every render under gen/out/<run>/, and records the exact prompt and
command for each so a render that works is reproducible.

    python gen/generate.py --dry-run          # print the commands, generate nothing
    python gen/generate.py                    # everything in the spec
    python gen/generate.py --only rhinoplasty --strategy region

Generating images does not spend Flow credits. Requires `gflow auth login`.
"""
import argparse
import re
import datetime
import json
import shutil
import subprocess
import sys
import tomllib
from pathlib import Path

from align_core import REGIONS, metrics, TARGET_HW
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SPEC = Path(__file__).resolve().parent / "procedures.toml"


def find_gflow():
    exe = shutil.which("gflow") or shutil.which("gflow.exe")
    if exe:
        return exe
    fallback = Path.home() / ".local" / "bin" / "gflow.exe"
    if fallback.exists():
        return str(fallback)
    sys.exit("gflow not found on PATH. Install it, then run `gflow auth login --browser chrome`.")


def region_crop(source: Path, target: str, dest: Path) -> Path:
    """Tight crop of a procedure's target box, for strategies that send it as a 2nd ref.

    Uses the same head-normalised boxes as the scorer, so the crop the model is
    shown is exactly the region the render is later graded on.
    """
    im = Image.open(source).convert("RGB")
    top, cx, hw = metrics(im)
    scale = hw / TARGET_HW           # spec boxes are in aligned-frame units
    x0, y0, x1, y1 = REGIONS[target]
    pad = 0.12                       # a little context so the edit blends
    box = (
        int(cx + (x0 - pad) * TARGET_HW * scale),
        int(top + (y0 - pad) * TARGET_HW * scale),
        int(cx + (x1 + pad) * TARGET_HW * scale),
        int(top + (y1 + pad) * TARGET_HW * scale),
    )
    box = (max(box[0], 0), max(box[1], 0), min(box[2], im.width), min(box[3], im.height))
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.crop(box).save(dest)
    return dest


# Flow's download menu offers 1K original / 2K / 4K; gflow saves only the 1K
# `fifeUrl` unless asked. `image upscale` is the same server call the 2K menu
# entry makes -- 896x1200 -> 1792x2400, which is what puts a render above our
# 1122x1402 source. 4K is Ultra-tier gated and 403s on anything less.
UPSCALE_SUFFIX = "_2k"
# Measured on the first 2K render: a 47x47 Gemini sparkle sits 5.3% from the
# right and 4.0% from the bottom. Cropping the bottom 6% clears it, and on these
# portraits that band is turtleneck, not chin.
WATERMARK_CROP_FRAC = 0.06


_UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)


def media_id_of(render: Path) -> str | None:
    """Flow's media UUID is the filename stem minus gflow's `_<n>` variant suffix."""
    stem = render.stem.rsplit("_", 1)[0]
    return stem if _UUID_RE.match(stem) else None


def upscale(gflow: str, render: Path, scale: str) -> Path | None:
    """Fetch the 2K/4K variant and park it beside its 1K sibling.

    `image upscale --out` date-partitions into <dir>/images/<YYYY-MM-DD>/ rather
    than writing flat like `image i2i --out` does, so the result is moved back
    next to the original.
    """
    mid = media_id_of(render)
    if mid is None:
        print(f"  ! {render.name}: cannot derive a media id, skipping upscale")
        return None
    staging = render.parent / "_upscale_tmp"
    staging.mkdir(exist_ok=True)
    res = subprocess.run([gflow, "image", "upscale", mid, "--scale", scale, "--out", str(staging)],
                         capture_output=True, text=True)
    if res.returncode != 0:
        last = (res.stderr.strip().splitlines() or ["(no stderr)"])[-1]
        print(f"  ! {render.name}: upscale exit {res.returncode}: {last}")
        shutil.rmtree(staging, ignore_errors=True)
        return None
    produced = sorted(staging.rglob("*.jpg")) + sorted(staging.rglob("*.png"))
    if not produced:
        print(f"  ! {render.name}: upscale reported success but wrote nothing")
        shutil.rmtree(staging, ignore_errors=True)
        return None
    dest = render.with_name(f"{render.stem}{UPSCALE_SUFFIX}{produced[0].suffix}")
    shutil.move(str(produced[0]), dest)
    shutil.rmtree(staging, ignore_errors=True)
    return dest


def strip_watermark(img: Path) -> Path:
    """Write a watermark-free copy; never overwrite the master."""
    im = Image.open(img)
    out = im.crop((0, 0, im.width, int(im.height * (1 - WATERMARK_CROP_FRAC))))
    dest = img.with_name(f"{img.stem}_clean{img.suffix}")
    out.save(dest, quality=95)
    return dest


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--spec", type=Path, default=SPEC)
    ap.add_argument("--only", action="append", help="procedure id (repeatable); default all")
    ap.add_argument("--strategy", action="append", help="strategy id (repeatable); default all")
    ap.add_argument("--count", type=int, help="override variants per pair")
    ap.add_argument("--model", help="override image model")
    ap.add_argument("--upscale", choices=["none", "2k", "4k"], default=None,
                    help="fetch the upscaled variant of every render (default: from procedures.toml). "
                         "4k needs a Flow Ultra plan.")
    ap.add_argument("--clean", action="store_true",
                    help="also write a _clean copy with the bottom cropped past the Gemini watermark")
    ap.add_argument("--dry-run", action="store_true", help="print commands without generating")
    args = ap.parse_args()

    spec = tomllib.loads(args.spec.read_text(encoding="utf-8"))
    source = ROOT / spec["source"]
    if not source.exists():
        sys.exit(f"source portrait not found: {source}")

    procs = [p for p in spec["procedures"] if not args.only or p["id"] in args.only]
    strats = [s for s in spec["strategies"] if not args.strategy or s["id"] in args.strategy]
    if not procs or not strats:
        sys.exit("nothing selected — check --only / --strategy against procedures.toml")

    run = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = ROOT / spec["out"] / run
    gflow = find_gflow()
    model = args.model or spec["model"]
    count = args.count or spec["count"]
    scale = args.upscale or spec.get("upscale", "none")

    manifest = {"run": run, "source": spec["source"], "model": model,
                "aspect": spec["aspect"], "count": count, "upscale": scale, "items": []}

    for proc in procs:
        for strat in strats:
            pair = f"{proc['id']}__{strat['id']}"
            out_dir = run_dir / pair
            out_dir.mkdir(parents=True, exist_ok=True)
            prompt = strat["template"].format(change=proc["change"]).strip()

            refs = []
            for kind in strat.get("refs", ["source"]):
                if kind == "source":
                    refs.append(source)
                elif kind == "region":
                    if proc["target"] == "any":
                        continue          # no box to crop for a whole-face change
                    refs.append(region_crop(source, proc["target"], out_dir / "_ref-region.png"))
                else:
                    sys.exit(f"unknown ref kind {kind!r} in strategy {strat['id']!r}")

            cmd = [gflow, "image", "i2i", prompt,
                   "--model", model, "--aspect", spec["aspect"],
                   "-n", str(count), "--out", str(out_dir), "--json"]
            for r in refs:
                cmd += ["--ref", str(r)]

            item = {"procedure": proc["id"], "strategy": strat["id"], "target": proc["target"],
                    "prompt": prompt, "refs": [str(r) for r in refs], "out": str(out_dir)}

            if args.dry_run:
                print(f"\n# {pair}  (target: {proc['target']})")
                print(" ".join(f'"{c}"' if " " in c or "\n" in c else c for c in cmd))
                manifest["items"].append(item)
                continue

            print(f"\n=== {pair} (target: {proc['target']}) ===")
            res = subprocess.run(cmd, capture_output=True, text=True)
            item["exit_code"] = res.returncode
            if res.returncode != 0:
                # gflow fails fast with distinct exit codes (14 = wrong browser,
                # 23 = Flow UI selector drift). Record and keep going.
                print(f"  FAILED exit {res.returncode}: {res.stderr.strip().splitlines()[-1:] or ''}")
                item["error"] = res.stderr.strip()[-2000:]
            else:
                # gflow writes .jpg despite --out's help text saying PNG; match either.
                got = sorted(p.name for p in out_dir.iterdir()
                             if p.suffix.lower() in {".png", ".jpg", ".jpeg"}
                             and not p.name.startswith("_ref"))
                item["renders"] = got
                print(f"  {len(got)} render(s): {', '.join(got) or '(none - check gflow stdout)'}")
                if scale != "none":
                    ups, cleans = [], []
                    for name in got:
                        big = upscale(gflow, out_dir / name, scale)
                        if big is None:
                            continue
                        ups.append(big.name)
                        print(f"  {scale} {big.name} ({big.stat().st_size // 1024} KB)")
                        if args.clean:
                            cleans.append(strip_watermark(big).name)
                    item["upscaled"] = ups
                    if args.clean:
                        item["cleaned"] = cleans
            manifest["items"].append(item)

    if args.dry_run:
        print(f"\n(dry run - nothing generated, would have written to {run_dir})")
        return 0

    (run_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nwrote {run_dir / 'manifest.json'}")
    # Screen the largest variant we actually produced, so the numbers describe the
    # image that would ship rather than the 1K proof.
    tier = "*_2k_clean.jpg" if (args.clean and scale != "none") else (
        "*_2k.jpg" if scale != "none" else "*.jpg")
    print("\nScreen the results before looking at them:")
    for proc in procs:
        print(f"  python gen/score.py {spec['source']} --target {proc['target']} "
              f"{spec['out']}/{run}/{proc['id']}__*/{tier}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
