import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { portrait } from "../protocol/atoms";
import { anchor } from "../anchors";
import { ASSETS } from "../assets";
import { headlineStack } from "../../fonts";

/**
 * Local pieces for "Same Nose".
 *
 * These are deliberately reel-local copies rather than imports out of
 * `changed/RefinaChanged.tsx`, which does not export them. The skill's one hard
 * rule is that `protocol/atoms.tsx`, `protocol/motion.tsx` and the `preview/*`
 * files are SHARED with cuts that are already signed off — editing one to add
 * an export here would silently change three other reels. A forty-line copy is
 * cheaper than that risk, and it is what `changed/captions.tsx` did for the
 * same reason.
 *
 * THE VISUAL LANGUAGE OF THIS REEL IS TWO DEVICES, USED REPEATEDLY:
 *
 *   1. `Ring` — an anatomical region, circled. Says WHERE.
 *   2. `Span` — a measured bracket between two anatomical rows. Says HOW BIG,
 *      and it is the whole argument: every teaching beat puts two of them side
 *      by side, one whose length changes and one whose length does not.
 *
 * That repetition is on purpose. Gemini's read of `ours-changed-v2` counted 17
 * devices with none used twice, against a corpus median of 11 with at least one
 * recurring — the signature of a reel assembled by walking the component kit
 * instead of designing a language. Both devices here are anchored off the asset
 * record, never off typed frame pixels (invariant A, rule R).
 */

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const FRAME_W = 1080;
export const FRAME_H = 1920;

export const INK = "rgba(18,26,30,0.78)";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export const Mono: React.FC<{
  children: React.ReactNode;
  size?: number;
  o?: number;
}> = ({ children, size = 18, o = 0.95 }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: size,
      letterSpacing: 2.2,
      color: `rgba(255,255,255,${o})`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

export const Tag: React.FC<{
  children: React.ReactNode;
  size?: number;
  dim?: boolean;
  tone?: "plain" | "live";
}> = ({ children, size = 17, dim, tone = "plain" }) => {
  const live = tone === "live";
  return (
    <div
      style={{
        background: live ? "rgba(255,255,255,0.93)" : dim ? "rgba(18,26,30,0.5)" : INK,
        border: `1px solid ${live ? "#fff" : `rgba(255,255,255,${dim ? 0.14 : 0.24})`}`,
        borderRadius: 5,
        padding: "8px 14px",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: size,
          letterSpacing: 2.2,
          color: live ? "#162024" : `rgba(255,255,255,${dim ? 0.62 : 0.95})`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Bottom: React.FC<{ children: React.ReactNode; y?: number }> = ({
  children,
  y = 360,
}) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end" }}>
    <div style={{ marginBottom: y }}>{children}</div>
  </AbsoluteFill>
);

/**
 * Nothing in this reel is a photograph of a patient, and every face in it was
 * generated. Say so, on every beat that shows one.
 */
/**
 * `size` defaults to 12 so no existing cut moves, but 12px at 1080 is 4.3px on
 * a 390px phone and the chip is a smudge there — visible the moment the first
 * RefinaNose contact sheet was looked at. The repo's own rule is that an
 * unreadable disclaimer is not a disclaimer, so new reels pass a size that
 * clears the 26px legibility floor. This stays opt-in rather than becoming the
 * default because RefinaProtocolReel and RefinaPreviewReel are signed-off cuts
 * and a shared component may not change them silently.
 */
export const AiChip: React.FC<{ y?: number; size?: number }> = ({
  y = 262,
  size = 12,
}) => (
  <Bottom y={y}>
    <Tag size={size} dim>
      AI PREVIEW - NOT MEDICAL ADVICE
    </Tag>
  </Bottom>
);

export const Sfx: React.FC<{
  name: string;
  at: number;
  volume?: number;
  dur?: number;
  fade?: number;
}> = ({ name, at: a, volume = 0.28, dur = 34, fade = 9 }) => (
  <Sequence from={a} durationInFrames={dur} layout="none">
    <Audio
      src={staticFile(`sfx/${name}`)}
      volume={(f) =>
        volume * interpolate(f, [Math.max(0, dur - fade), dur - 1], [1, 0], clamp)
      }
    />
  </Sequence>
);

/**
 * A face filling its container, croppable.
 *
 * `zoom` and `focus` are what buy the reel its scale variety — the same
 * portrait is a full-bleed head in one beat and a crop of a brow in the next.
 * Anything anchored on top of it must be handed the SAME two values.
 *
 * IT LAYS ITSELF OUT INSTEAD OF USING object-fit, AND THAT IS THE POINT.
 * `changed`'s version used `object-fit: cover` + `object-position` + a CSS
 * `transform: scale()`. Those are not the same maths `anchor()` does: CSS fits
 * the image at zoom 1, applies object-position to the leftover space, and THEN
 * scales about the element's centre, so the vertical offset a zoomed image ends
 * up with is the one for focus 0.5 — not the one it was given. `anchor()`
 * folds the zoom into the fit and applies focus afterwards.
 *
 * They agree only when focus[1] is 0.5 or zoom is 1. Everywhere else every
 * anchored mark is wrong, by (frameH - frameH*zoom) * (focus[1] - 0.5):
 * 21px on the hook, 92px on the nose-and-chin beat, 240px on the lid beat.
 * That is invariant A exactly — a mark placed by one model of a composite that
 * another model actually drew.
 *
 * So this component now performs `anchor()`'s cover maths literally. The fix
 * lives here rather than in `anchors.ts` because that module is shared with
 * `RefinaChanged`, whose callouts were placed by eye against the old
 * behaviour; correcting the shared side would silently move them.
 */
export const Face: React.FC<{
  name: string;
  zoom?: number;
  focus?: [number, number];
  style?: React.CSSProperties;
}> = ({ name, zoom = 1, focus = [0.5, 0.32], style }) => {
  const a = (ASSETS as Record<string, { w: number; h: number } | undefined>)[name];
  // An unregistered image (the difference map) has no face geometry and never
  // carries an anchored mark, so the plain CSS path is fine for it.
  if (!a) {
    return (
      <Img
        src={portrait(name)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`,
          transform: `scale(${zoom})`,
          ...style,
        }}
      />
    );
  }
  const s = Math.max(FRAME_W / a.w, FRAME_H / a.h) * zoom;
  const dw = a.w * s;
  const dh = a.h * s;
  return (
    <Img
      src={portrait(name)}
      style={{
        position: "absolute",
        left: (FRAME_W - dw) * focus[0],
        top: (FRAME_H - dh) * focus[1],
        width: dw,
        height: dh,
        maxWidth: "none",
        ...style,
      }}
    />
  );
};

/** One picture becoming another across whatever box it is given. */
export const Reveal: React.FC<{
  under: string;
  over: string;
  progress: number;
  dir?: "x" | "y";
  zoom?: number;
  focus?: [number, number];
  seam?: boolean;
}> = ({ under, over, progress, dir = "x", zoom, focus, seam = true }) => {
  const p = Math.max(0, Math.min(100, progress));
  const clip = dir === "x" ? `inset(0 ${100 - p}% 0 0)` : `inset(0 0 ${100 - p}% 0)`;
  return (
    <>
      <Face name={under} zoom={zoom} focus={focus} />
      {/* The clip is applied to a FRAME-SIZED box, not to the image. Now that
          `Face` sizes itself to the zoomed image and offsets it, an `inset()`
          on the image itself would be a percentage of the image's own box —
          so a "50%" wipe would land wherever the image happened to be, not
          down the middle of the picture. */}
      <AbsoluteFill style={{ clipPath: clip }}>
        <Face name={over} zoom={zoom} focus={focus} />
      </AbsoluteFill>
      {seam && p > 0.5 && p < 99.5 ? (
        <div
          style={{
            position: "absolute",
            ...(dir === "x"
              ? { left: `${p}%`, top: 0, bottom: 0, width: 2 }
              : { top: `${p}%`, left: 0, right: 0, height: 2 }),
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 0 16px rgba(0,0,0,0.4)",
          }}
        />
      ) : null}
    </>
  );
};

/** back and forth 0..100, never resting at either end */
export const useSweep = (startFrame: number, period: number) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - startFrame);
  const c = (t % period) / period;
  const tri = c < 0.5 ? c * 2 : (1 - c) * 2;
  return interpolate(tri, [0, 1], [3, 97], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
};

/* ── device 1: the ring ─────────────────────────────────────────────────── */

/**
 * An anatomical region, circled, positioned from the asset record.
 *
 * An ellipse rather than the kit's `TargetReticle` box, because this reel puts
 * two of them on one face at once: two rectangles read as a UI, two ellipses
 * read as an anatomist's marks. `state="held"` is the rhetoric — the region
 * that did NOT move is the harder half of the claim, so it gets a ring of its
 * own rather than being left unmarked.
 */
export const Ring: React.FC<{
  id: Parameters<typeof anchor>[0];
  region: Parameters<typeof anchor>[1];
  zoom?: number;
  focus?: [number, number];
  from: number;
  dur?: number;
  label?: string;
  state?: "changed" | "held";
  pad?: number;
  /** which side of the ring the label sits on; "auto" keeps it inside frame */
  labelAt?: "above" | "below" | "auto";
}> = ({
  id,
  region,
  zoom = 1,
  focus = [0.5, 0.32],
  from,
  dur = 16,
  label,
  state = "changed",
  pad = 1.18,
  labelAt = "auto",
}) => {
  const frame = useCurrentFrame();
  const r = anchor(id, region, { width: 1080, height: 1920 }, zoom, focus);
  const p = interpolate(frame - from, [0, dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (p <= 0) return null;

  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;
  // FIT THE FRAME. `REGIONS.jaw` spans the full face width, so at any zoom
  // above ~1.1 an ellipse around it runs off both sides and stops reading as a
  // ring at all — it reads as two unexplained arcs, which is what the first
  // stills of the claim and lid beats showed. Clamping here rather than by
  // hand-tuning `pad` per beat keeps the device derived: the ring still sits on
  // the measured region, it just cannot leave the picture.
  const rx = Math.min((r.width / 2) * pad, 1080 / 2 - 46);
  const ry = Math.min((r.height / 2) * pad, 1920 / 2 - 46);
  const held = state === "held";
  // Ellipse circumference, Ramanujan. The dash reveal has to know the real
  // length or the ring finishes early on a wide region and late on a tall one,
  // which reads as two different animations rather than one device.
  const h = ((rx - ry) * (rx - ry)) / ((rx + ry) * (rx + ry));
  const c = Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={held ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.95)"}
          strokeWidth={held ? 2 : 3}
          strokeDasharray={held ? "6 10" : `${c} ${c}`}
          strokeDashoffset={held ? 0 : c * (1 - p)}
          opacity={held ? p : 1}
        />
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: cx - 200,
            // Two rings share this frame on the claim beat, and left to
            // themselves both resolved to the same row and printed on top of
            // each other. `labelAt` lets the beat separate them; "auto" still
            // keeps a lone ring's label out of the caption band.
            top:
              labelAt === "above"
                ? cy - ry - 58
                : labelAt === "below"
                  ? cy + ry + 14
                  : cy + ry + 14 > 1560
                    ? cy - ry - 58
                    : cy + ry + 14,
            width: 400,
            display: "flex",
            justifyContent: "center",
            opacity: interpolate(frame - from, [dur * 0.6, dur * 0.6 + 8], [0, 1], clamp),
          }}
        >
          <Tag size={14} dim={held}>
            {label}
          </Tag>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ── device 2: the span ─────────────────────────────────────────────────── */

/**
 * A measured bracket between two frame rows.
 *
 * THIS IS THE ARGUMENT, DRAWN. Every teaching beat puts two of these side by
 * side: one whose length is changing and one whose length is not.
 *
 * It never prints a figure. A measurement with a number on it is a claim about
 * a face, and both invariant E and the protocol reel's content rules forbid
 * inventing one. Two brackets of visibly different length say the whole thing
 * and need no units.
 *
 * `y0`/`y1` are frame rows, which callers derive through `rowOf()` — never
 * typed.
 */
export const Span: React.FC<{
  x: number;
  y0: number;
  y1: number;
  from: number;
  dur?: number;
  label?: string;
  side?: "left" | "right";
  dim?: boolean;
}> = ({ x, y0, y1, from, dur = 14, label, side = "right", dim = false }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (p <= 0) return null;
  const top = Math.min(y0, y1);
  const bot = Math.max(y0, y1);
  const mid = top + (bot - top) * p;
  const arm = 22;
  const col = dim ? "rgba(255,255,255,0.76)" : "rgba(255,255,255,0.97)";
  const w = dim ? 2.2 : 3;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <line x1={x - arm} y1={top} x2={x + arm} y2={top} stroke={col} strokeWidth={w} />
        <line x1={x} y1={top} x2={x} y2={mid} stroke={col} strokeWidth={w} />
        {p > 0.98 ? (
          <line x1={x - arm} y1={bot} x2={x + arm} y2={bot} stroke={col} strokeWidth={w} />
        ) : null}
      </svg>
      {label && p > 0.75 ? (
        <div
          style={{
            position: "absolute",
            top: (top + bot) / 2 - 16,
            ...(side === "right"
              ? { left: x + arm + 12 }
              : { right: 1080 - x + arm + 12 }),
            opacity: interpolate(p, [0.75, 1], [0, 1], clamp),
          }}
        >
          <Tag size={13} dim={dim}>
            {label}
          </Tag>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** The frame row a region's top or bottom edge sits on. */
export const rowOf = (
  id: Parameters<typeof anchor>[0],
  region: Parameters<typeof anchor>[1],
  edge: "top" | "bottom",
  zoom = 1,
  focus: [number, number] = [0.5, 0.32],
) => {
  const r = anchor(id, region, { width: 1080, height: 1920 }, zoom, focus);
  return edge === "top" ? r.y : r.y + r.height;
};

/** The whole frame-space rect of a region, for callers that need width too. */
export const anchorBox = (
  id: Parameters<typeof anchor>[0],
  region: Parameters<typeof anchor>[1],
  zoom = 1,
  focus: [number, number] = [0.5, 0.32],
) => anchor(id, region, { width: 1080, height: 1920 }, zoom, focus);

/** The frame column a region's centre sits on. */
export const colOf = (
  id: Parameters<typeof anchor>[0],
  region: Parameters<typeof anchor>[1],
  zoom = 1,
  focus: [number, number] = [0.5, 0.32],
) => {
  const r = anchor(id, region, { width: 1080, height: 1920 }, zoom, focus);
  return r.x + r.width / 2;
};

export const Step: React.FC<{ n: string; text: string }> = ({ n, text }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
    <div
      style={{
        fontFamily: headlineStack,
        fontSize: 34,
        color: "rgba(255,255,255,0.5)",
        minWidth: 44,
      }}
    >
      {n}
    </div>
    <div
      style={{
        fontFamily: headlineStack,
        fontSize: 48,
        lineHeight: 1.25,
        color: "#fff",
      }}
    >
      {text}
    </div>
  </div>
);
