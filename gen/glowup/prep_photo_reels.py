"""Stage app material for the two photo reels converted to the pack (2026-11-17):
GlowupSize (Sydney Sweeney, S4 self-tests) and GlowupLawrence (S1-style read).
Real Refina screens and sample-user turntables only; the celebrity is never in the phone.
"""
import shutil, subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public-glowup"
UI = ROOT / "public/refina-ui/screens_trim"
VID = Path(r"C:\Users\rahul\Downloads\refina-videos-processed\white-masters")


def turn(src, dst):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(VID / src), "-an", "-vf", "fps=30",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", str(dst)], check=True)


def main():
    for r in ("size", "lawrence"):
        (OUT / r / "app").mkdir(parents=True, exist_ok=True)
        shutil.copy2(UI / "select-procedures.png", OUT / r / "app" / "select-procedures.png")
    sel = Image.open(UI / "select-procedures.png")
    print("select-procedures", sel.size)
    turn("rhinoplasty-after.mp4", OUT / "size" / "app" / "turn.mp4")
    for n in ("your-result-before", "your-result-after"):
        shutil.copy2(UI / f"{n}.png", OUT / "lawrence" / "app" / f"{n}.png")
    for n in ("10-cheeks", "17-skin_wrinkles", "11-jaw"):
        shutil.copy2(ROOT / "public/dossier-tour" / f"{n}.png", OUT / "lawrence" / "app" / f"{n}.png")
    turn("facelift-after.mp4", OUT / "lawrence" / "app" / "turn.mp4")
    print("staged")


if __name__ == "__main__":
    main()
