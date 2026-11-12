"""Prepare the painted portraits for a Glow Up reel: cut out, measure, lock.

  python gen/glowup/portraits.py --reel s2

For every PNG in public-glowup/<reel>/portraits/src/ (Rahul's supplied stills):
  1. CUT OUT: the source sits on a flat studio ground (any colour). The ground
     colour is sampled from the border, alpha is a soft colour-distance key,
     and edge pixels are un-mixed from the ground so hair carries no halo.
     Output: portraits/<name>.png (RGBA). The composition paints its own
     ground (#D8C7C2) under it, so a cutout never fringes at any zoom.
  2. MEASURE: YuNet (gen/models/yunet.onnx) gives eyes, nose tip and mouth
     corners. Everything the overlays need (brow line, bridge top, subnasale,
     upper lip, chin) is DERIVED from those five points and written to
     landmarks.json, so no overlay coordinate is typed in TSX.
     Derived points are approximations -- draw them (--sheet) and look before
     a beat relies on one. Per-image corrections go in landmarks-fix.json and
     are applied on top, never edited into the output.
  3. LOCK CHECK: images in one family (same prefix before the first '_' after
     the view, e.g. 3q_*) must keep everything except the nose still. Reports
     the median pixel change outside a nose box; > 6 levels = the generator
     drifted, and the shutter morph will show the whole face jumping.
"""
import argparse, json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]


def cutout(bgr):
    h, w = bgr.shape[:2]
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    border = np.concatenate([lab[:8].reshape(-1, 3), lab[:, :8].reshape(-1, 3), lab[:, -8:].reshape(-1, 3)])
    g = np.median(border, 0)
    d = np.linalg.norm(lab - g, axis=2)
    a = np.clip((d - 6.0) / (22.0 - 6.0), 0, 1)          # soft key
    # keep only what is connected to the subject: fill holes, drop specks
    hard = (a > 0.5).astype(np.uint8)
    n, lbl, st, _ = cv2.connectedComponentsWithStats(hard)
    if n > 1:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
        keep = (lbl == big).astype(np.uint8)
        keep = cv2.dilate(keep, np.ones((9, 9), np.uint8))
        a = a * keep
    a = cv2.GaussianBlur(a, (3, 3), 0)
    # un-mix the ground from edge pixels: C = a*F + (1-a)*G  ->  F
    gb = cv2.cvtColor(np.uint8([[g]]), cv2.COLOR_LAB2BGR)[0, 0].astype(np.float32)
    f = bgr.astype(np.float32)
    aa = np.maximum(a, 0.05)[..., None]
    fg = np.clip((f - (1 - aa) * gb) / aa, 0, 255)
    fg = np.where(a[..., None] > 0.98, f, fg)
    return np.dstack([fg, a * 255]).astype(np.uint8)


def detect(bgr, det):
    h, w = bgr.shape[:2]
    det.setInputSize((w, h))
    _, faces = det.detect(bgr)
    if faces is None or len(faces) == 0:
        return None
    f = max(faces, key=lambda r: r[2] * r[3])
    x, y, bw, bh = f[:4]
    p = f[4:14].reshape(5, 2)          # right eye, left eye, nose, mouth R, mouth L (image coords)
    eyeA, eyeB, nose, mA, mB = p
    eyes = (eyeA + eyeB) / 2
    mouth = (mA + mB) / 2
    en = nose[1] - eyes[1]                       # eye-line to nose tip
    pts = {
        "eyeA": eyeA, "eyeB": eyeB, "eyes": eyes, "noseTip": nose,
        "mouthA": mA, "mouthB": mB, "mouth": mouth,
        "brow": eyes + [0, -0.42 * en],          # between the brows
        "bridgeTop": eyes + (nose - eyes) * [0.25, 0.0] + [0, -0.05 * en],
        "subnasale": nose + (mouth - nose) * 0.35,
        "lipTop": nose + (mouth - nose) * 0.72,
        # lower third: stomion -> menton is ~2x subnasale -> stomion (the face
        # box bottom ran ~20px low on the 3/4 stills)
        "chin": mouth + (mouth - (nose + (mouth - nose) * 0.35)) * 2.0 * np.array([0.6, 1.0]),
    }
    out = {k: [round(float(v[0]) / w, 4), round(float(v[1]) / h, 4)] for k, v in pts.items()}
    out["box"] = [round(float(x) / w, 4), round(float(y) / h, 4), round(float(bw) / w, 4), round(float(bh) / h, 4)]
    out["noseW"] = round(float(np.linalg.norm(eyeA - eyeB)) * 0.42 / w, 4)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reel", default="s2")
    ap.add_argument("--sheet", action="store_true", help="write a landmark check sheet")
    a = ap.parse_args()
    base = ROOT / "public-glowup" / a.reel / "portraits"
    src = base / "src"
    det = cv2.FaceDetectorYN.create(str(ROOT / "gen/models/yunet.onnx"), "", (320, 320), 0.6)
    fix = json.loads((base / "landmarks-fix.json").read_text()) if (base / "landmarks-fix.json").exists() else {}
    marks, tiles = {}, []
    for p in sorted(src.glob("*.png")):
        bgr = cv2.imread(str(p))
        rgba = cutout(bgr)
        cv2.imwrite(str(base / p.name), rgba)
        lm = detect(bgr, det)
        if lm is None:
            print(f"  !! {p.name}: no face found")
            continue
        lm.update(fix.get(p.stem, {}))
        lm["size"] = [bgr.shape[1], bgr.shape[0]]
        marks[p.stem] = lm
        print(f"  {p.stem}: {bgr.shape[1]}x{bgr.shape[0]}  nose {lm['noseTip']}")
        if a.sheet:
            v = bgr.copy()
            h, w = v.shape[:2]
            for k, xy in lm.items():
                if k in ("box", "noseW", "size"):
                    continue
                c = (int(xy[0] * w), int(xy[1] * h))
                cv2.circle(v, c, max(4, w // 150), (0, 0, 255), -1)
                cv2.putText(v, k, (c[0] + 8, c[1]), cv2.FONT_HERSHEY_SIMPLEX, w / 1500, (0, 0, 255), 2)
            tiles.append(cv2.resize(v, (480, int(480 * h / w))))
    (base / "landmarks.json").write_text(json.dumps(marks, indent=1))

    # lock check within each family (3q_*, front_*)
    fams = {}
    for k in marks:
        fams.setdefault(k.split("_")[0], []).append(k)
    for fam, ks in fams.items():
        b = next((k for k in ks if k.endswith("base")), None)
        if not b:
            continue
        B = cv2.imread(str(src / f"{b}.png")).astype(np.int16)
        for k in ks:
            if k == b:
                continue
            I = cv2.imread(str(src / f"{k}.png")).astype(np.int16)
            if I.shape != B.shape:
                print(f"  LOCK {k}: size {I.shape[1]}x{I.shape[0]} != base -- will be resized onto base grid")
                I = cv2.resize(I.astype(np.uint8), (B.shape[1], B.shape[0])).astype(np.int16)
            m = np.ones(B.shape[:2], bool)
            lm = marks[b]; h, w = B.shape[:2]
            nx, ny = lm["noseTip"]; ey = lm["eyes"][1]; my = lm["mouth"][1]
            x0, x1 = int((nx - 0.16) * w), int((nx + 0.16) * w)
            m[int((ey - 0.02) * h):int((my + 0.03) * h), max(0, x0):x1] = False
            diff = np.abs(I - B).mean(2)[m]
            med = float(np.median(diff))
            print(f"  LOCK {k} vs {b}: median change outside nose {med:.1f}  {'OK' if med <= 6 else 'DRIFTED'}")
    if tiles:
        hh = max(t.shape[0] for t in tiles)
        sheet = np.hstack([cv2.copyMakeBorder(t, 0, hh - t.shape[0], 0, 0, cv2.BORDER_CONSTANT) for t in tiles])
        cv2.imwrite(str(base / "_landmarks-sheet.jpg"), sheet)
        print("  sheet ->", base / "_landmarks-sheet.jpg")


if __name__ == "__main__":
    main()
