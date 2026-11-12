"""Stage every non-portrait asset GlowupS2 reads into public-glowup/.

Re-runnable; overwrites. Portraits are staged separately (Rahul supplies them).

App proof is REAL Refina material on a sample user, never the celebrity
(pack compliance rule 2):
  - dossier.mp4   : Rachel's real Facial Dossier, recorded deterministically
                    (public/dossier-rachel/features.mp4)
  - rhino-before/after.png : frame 0 (profile) of the site's rhinoplasty
                    before/after turntables, after registered onto before
  - turn.mp4      : the rhinoplasty AFTER turntable (Bring to Life 3D turn)
  - ui/*.png      : real app screens cropped from the Figma export
"""
import shutil, subprocess, sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public-glowup"
SRC_VID = Path(r"C:\Users\rahul\Downloads\refina-videos-processed\white-masters")


def ff(*a):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *a], check=True)


def frame(path, n=0):
    cap = cv2.VideoCapture(str(path))
    cap.set(cv2.CAP_PROP_POS_FRAMES, n)
    ok, f = cap.read()
    assert ok, path
    return f


def main():
    app = OUT / "s2" / "app"
    (app / "ui").mkdir(parents=True, exist_ok=True)
    sfx = OUT / "sfx"
    sfx.mkdir(parents=True, exist_ok=True)

    # sound: one palette, all from Rahul's library
    for rel in ["transition/camera-shutter.wav", "trio/shutter.mp3", "trio/pop-minimal.mp3",
                "trio/click-soft.mp3", "trio/light-whoosh.mp3", "trio/swoosh-thin.mp3",
                "trio/tap-soft.mp3", "trio/notify-soft.mp3", "trio/boom-soft.mp3",
                "trio/air-whoosh-5.mp3", "ui-tech/toggle.wav"]:
        shutil.copy2(ROOT / "public/sfx" / rel, sfx / Path(rel).name)

    for n in ["dossier-11", "dossier-12", "dossier-13", "cosmetic-preview", "refina-splash"]:
        shutil.copy2(ROOT / f"public/refina-ui/screens_trim/{n}.png", app / "ui" / f"{n}.png")
    shutil.copy2(ROOT / "public/refina-ui/refina-mark.png", OUT / "s2" / "refina-mark.png")
    shutil.copy2(ROOT / "public/dossier-rachel/features.mp4", app / "dossier.mp4")

    # before/after pair: register the after onto the before (similarity transform;
    # same head and lens, small scale drift between the two renders)
    b = frame(SRC_VID / "rhinoplasty-before.mp4")
    a = frame(SRC_VID / "rhinoplasty-after.mp4")
    # similarity transform from ORB matches on ear/eye/hair -- the nose is
    # masked out because it is the one thing that is SUPPOSED to differ.
    # (phaseCorrelate returned response 0.03 here and was visibly wrong.)
    orb = cv2.ORB_create(5000)
    h, w = b.shape[:2]
    mask = np.full((h, w), 255, np.uint8)
    mask[int(h * 0.30):int(h * 0.80), :int(w * 0.30)] = 0   # nose / lips / chin
    kb, db = orb.detectAndCompute(cv2.cvtColor(b, cv2.COLOR_BGR2GRAY), mask)
    ka, da = orb.detectAndCompute(cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), mask)
    m = sorted(cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(da, db), key=lambda x: x.distance)[:600]
    M, inl = cv2.estimateAffinePartial2D(np.float32([ka[x.queryIdx].pt for x in m]),
                                        np.float32([kb[x.trainIdx].pt for x in m]),
                                        method=cv2.RANSAC, ransacReprojThreshold=3)
    a2 = cv2.warpAffine(a, M, (w, h), borderMode=cv2.BORDER_REPLICATE)
    print(f"after -> before: scale {np.hypot(M[0,0],M[1,0]):.3f} dx {M[0,2]:.1f} dy {M[1,2]:.1f}, {int(inl.sum())}/{len(m)} inliers")
    cv2.imwrite(str(app / "rhino-before.png"), b)
    cv2.imwrite(str(app / "rhino-after.png"), a2)

    # 3D turn: 30fps h264, no audio (turntable audio is a hum)
    ff("-i", str(SRC_VID / "rhinoplasty-after.mp4"), "-an", "-vf", "fps=30",
       "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", str(app / "turn.mp4"))
    print("staged", sorted(p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file()))


if __name__ == "__main__":
    sys.exit(main())
