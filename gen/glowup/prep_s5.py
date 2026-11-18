"""Stage every non-portrait asset GlowupS5 reads into public-glowup/s5/.

Re-runnable; overwrites. Portraits are staged by Rahul + gen/glowup/portraits.py.

App proof is REAL Refina material on a SAMPLE user, never the celebrity:
  - dossier.mp4   : Rachel's real Facial Dossier "Your strongest features"
                    scroll (public/dossier-rachel/features.mp4) - the screen
                    that literally "reads what makes your features work together"
  - bleph-before/after.png : the FRONTAL frame (f120, 5.0s - measured on a
                    1fps sheet) of the site's blepharoplasty turntables, after
                    registered onto before by ORB similarity on hair/jaw/ears
                    with the EYES masked (they are what is supposed to differ)
  - turn.mp4      : the blepharoplasty AFTER turntable (Bring to Life 3D turn)
  - ui/cosmetic-preview.png : the real Cosmetic Preview screen (photo slot
                    measured at x14..536 y314..840 of 558x1311)
"""
import shutil, subprocess
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public-glowup"
SRC_VID = Path(r"C:\Users\rahul\Downloads\refina-videos-processed\white-masters")
FRONT = 120


def frame(path, n):
    cap = cv2.VideoCapture(str(path))
    cap.set(cv2.CAP_PROP_POS_FRAMES, n)
    ok, f = cap.read()
    assert ok, path
    return f


def main():
    app = OUT / "s5" / "app"
    (app / "ui").mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / "public/refina-ui/screens_trim/cosmetic-preview.png", app / "ui" / "cosmetic-preview.png")
    shutil.copy2(ROOT / "public/dossier-rachel/features.mp4", app / "dossier.mp4")

    b = frame(SRC_VID / "blepharoplasty-before.mp4", FRONT)
    a = frame(SRC_VID / "blepharoplasty-after.mp4", FRONT)
    h, w = b.shape[:2]
    mask = np.full((h, w), 255, np.uint8)
    mask[int(h * 0.22):int(h * 0.42), int(w * 0.25):int(w * 0.75)] = 0  # eyes
    orb = cv2.ORB_create(5000)
    kb, db = orb.detectAndCompute(cv2.cvtColor(b, cv2.COLOR_BGR2GRAY), mask)
    ka, da = orb.detectAndCompute(cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), mask)
    m = sorted(cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(da, db), key=lambda x: x.distance)[:600]
    M, inl = cv2.estimateAffinePartial2D(np.float32([ka[x.queryIdx].pt for x in m]), np.float32([kb[x.trainIdx].pt for x in m]),
                                        method=cv2.RANSAC, ransacReprojThreshold=3)
    a2 = cv2.warpAffine(a, M, (w, h), borderMode=cv2.BORDER_REPLICATE)
    print(f"after -> before: scale {np.hypot(M[0,0],M[1,0]):.3f} dx {M[0,2]:.1f} dy {M[1,2]:.1f}, {int(inl.sum())}/{len(m)} inliers")
    cv2.imwrite(str(app / "bleph-before.png"), b)
    cv2.imwrite(str(app / "bleph-after.png"), a2)

    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(SRC_VID / "blepharoplasty-after.mp4"), "-an", "-vf", "fps=30",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", str(app / "turn.mp4")], check=True)
    shutil.copy2(ROOT / "public/refina-ui/refina-mark.png", OUT / "s5" / "refina-mark.png")
    print("staged", sorted(p.relative_to(OUT).as_posix() for p in (OUT / "s5" / "app").rglob("*") if p.is_file()))


if __name__ == "__main__":
    main()
