import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cutPath, evolvePath, getLength } from "@remotion/paths";
import { Arrow } from "@remotion/shapes";
import { measureText } from "@remotion/layout-utils";
import { SAGE, portrait } from "../protocol/atoms";
import { headlineItalicStack, headlineStack, sansFont } from "../../fonts";

/**
 * Drawing helpers for RefinaPreviewReel.
 *
 * These exist because the reference reel *draws* its annotation lines and
 * contours (spec §4, §10) while our callouts were faking it by animating a CSS
 * `border-top` width — which reads as a bar growing, not a line being drawn.
 *
 * Everything here is preview-local. `src/refina/protocol/` is shared with the
 * approved protocol cut and must not change.
 */

const FRAME_W = 1080;
const FRAME_H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ── a dotted line that genuinely draws itself ────────────────────── */

/**
 * `strokeDasharray` is already spoken for by the dots, so the usual
 * dashoffset trick cannot also drive the reveal — which is why the original
 * TrimPath falls back to a plain fade for its `dashed` variant.
 *
 * `cutPath` sidesteps it: shorten the *path* to `progress * totalLength` and
 * the dots live on a line that is really growing.
 */
export const DottedDraw: React.FC<{
  d: string;
  from?: number;
  dur?: number;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
}> = ({
  d,
  from = 0,
  dur = 20,
  stroke = "rgba(255,255,255,0.92)",
  strokeWidth = 1.6,
  dash = "2 7",
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (p <= 0) return null;
  const total = getLength(d);
  const shown = cutPath(d, Math.max(0.01, total * p));
  return (
    <svg
      width={FRAME_W}
      height={FRAME_H}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <path
        d={shown}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
};

/* ── a solid contour that draws, with a soft glow ─────────────────── */

/**
 * `evolvePath` derives the dasharray/dashoffset from the path's true length,
 * so a curve of any shape draws at an even rate. The reference traces a
 * "glowing contour around the jaw and hairline" (spec §10) — the blurred
 * under-stroke is that glow.
 */
export const ContourDraw: React.FC<{
  d: string;
  from?: number;
  dur?: number;
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  glow?: boolean;
}> = ({
  d,
  from = 0,
  dur = 26,
  width = FRAME_W,
  height = FRAME_H,
  stroke = "#fff",
  strokeWidth = 2.4,
  glow = true,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const evolution = evolvePath(p, d);
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      {glow ? (
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth * 3.4}
          strokeLinecap="round"
          opacity={0.22}
          style={{ filter: "blur(7px)" }}
          {...evolution}
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        {...evolution}
      />
    </svg>
  );
};

/* ── callout: measured label + a leader that actually draws ───────── */

// 25px on a 1080-wide frame is ~9px on a phone. Bigger, heavier, and sat on a
// dark chip so it survives a mid-tone portrait behind it.
const CALLOUT_FONT = { fontFamily: sansFont, fontSize: 30, fontWeight: 500 };
const CHIP_PAD_X = 15;
const EDGE = 42;
const MIN_LEN = 80;

export const DrawnCallout: React.FC<{
  label: string;
  x: number;
  y: number;
  side?: "left" | "right";
  from?: number;
  preferredLen?: number;
}> = ({ label, x, y, side = "right", from = 0, preferredLen = 210 }) => {
  const frame = useCurrentFrame();
  const { width } = measureText({ text: label, ...CALLOUT_FONT });

  // Room for the leader before the label would cross the frame edge. `side`
  // is a preference: if it does not fit, take the side that does.
  // the chip is wider than its text — measure the chip, not the glyphs
  const chipW = width + CHIP_PAD_X * 2;
  const room = {
    right: FRAME_W - EDGE - chipW - x,
    left: x - chipW - EDGE,
  };
  const chosen =
    room[side] >= MIN_LEN ? side : room.right >= room.left ? "right" : "left";
  const len = Math.max(MIN_LEN, Math.min(preferredLen, room[chosen]));

  const endX = chosen === "right" ? x + len : x - len;
  const d = `M ${x} ${y} L ${endX} ${y}`;

  // The label lands only once its leader has arrived — the reference has text
  // boxes fade in *after* the line reaches them (spec §10).
  const labelIn = interpolate(frame - from - 14, [0, 9], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const dot = interpolate(frame - from, [0, 6], [0, 1], clamp);

  return (
    <>
      <svg
        width={FRAME_W}
        height={FRAME_H}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        <circle cx={x} cy={y} r={4.5 * dot} fill="#fff" />
      </svg>
      <DottedDraw d={d} from={from + 2} dur={18} />
      <div
        style={{
          position: "absolute",
          left: chosen === "right" ? endX + 10 : endX - 10 - chipW,
          top: y - 42,
          whiteSpace: "nowrap",
          fontFamily: sansFont,
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.25,
          color: "#fff",
          opacity: labelIn,
          background: "rgba(20,32,36,0.62)",
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 9,
          padding: `6px ${CHIP_PAD_X}px`,
        }}
      >
        {label}
      </div>
    </>
  );
};

/* ── the arrow the split-panel device is supposed to have ─────────── */

/**
 * Spec §4: "Thin white → arrow between panels." ComparePanels shipped without
 * it. Drawn with @remotion/shapes rather than hand-rolled so the head and
 * shaft stay proportional if the size changes.
 */
export const PanelArrow: React.FC<{ from?: number; size?: number }> = ({
  from = 0,
  size = 46,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${(1 - p) * -14}px)`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Arrow
        direction="right"
        length={size}
        headWidth={20}
        headLength={16}
        shaftWidth={4}
        fill="rgba(255,255,255,0.95)"
      />
    </div>
  );
};

/* ── contours traced per procedure on the swap deck ───────────────── */

/**
 * Paths in SwapDeck display coordinates (920x920 plate). Each traces the line
 * the procedure actually changes, which is what makes a subtle render legible
 * — the viewer is told where to look.
 */
export const PROCEDURE_CONTOUR = {
  // dorsal profile — between the brows down to the tip
  nose: "M 463 380 C 455 446, 455 510, 462 556 C 468 578, 470 588, 460 596",
  // mandibular border — gonion to chin to gonion
  jaw: "M 205 606 C 234 714, 342 802, 465 824 C 588 802, 696 714, 725 606",
  // upper lid creases, both eyes
  eyes: "M 266 350 C 292 322, 372 320, 400 346 M 540 346 C 568 320, 648 322, 675 350",
} as const;

/* ── accumulating reason tags ─────────────────────────────────────── */

/**
 * The reference builds a persistent checklist: a tag pops in per beat and
 * *stays*, so the argument visibly stacks up (`Angularity ✓`, `Structure ✓`,
 * `Sexual dimorphism ✓`). Ours previously only highlighted a pip, which is why
 * the `reasons` beat measured near-blank (content 8.7).
 *
 * `active` counts how many tags have landed. Each keeps its own entrance so
 * they arrive with a stagger rather than together.
 */
export const TagStack: React.FC<{
  labels: readonly string[];
  active: number;
  from?: number;
  step?: number;
  top?: number;
}> = ({ labels, active, from = 0, step = 11, top = 300 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        padding: "0 90px",
      }}
    >
      {labels.slice(0, Math.max(0, active)).map((l, i) => {
        const t = from + i * step;
        const o = interpolate(frame - t, [0, 9], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rise = interpolate(frame - t, [0, 13], [14, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={l}
            style={{
              opacity: o,
              transform: `translateY(${rise}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(28,42,46,0.42)",
              border: "1px solid rgba(255,255,255,0.34)",
              borderRadius: 30,
              padding: "10px 20px",
              fontFamily: sansFont,
              fontSize: 24,
              color: "#fff",
            }}
          >
            {l}
            <span style={{ fontSize: 19, opacity: 0.9 }}>✓</span>
          </div>
        );
      })}
    </div>
  );
};

/* ── headline that blurs out as well as in ────────────────────────── */

/**
 * `Headline` in protocol/atoms.tsx only blurs *in*; its `BlurWords` helper is
 * not exported and that file is shared with the approved protocol cut, so this
 * reimplements the reveal locally and adds the departure the reference has
 * (f874-878: the outgoing line blurs while its plate travels).
 */
export const SectionHeadline: React.FC<{
  lines: string[];
  len: number;
  from?: number;
  out?: number;
  italicSecond?: boolean;
}> = ({ lines, len, from = 0, out = 16, italicSecond = false }) => {
  const frame = useCurrentFrame();
  const leaving = interpolate(frame, [len - out, len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        left: 0,
        right: 0,
        textAlign: "center",
        padding: "0 70px",
        lineHeight: 1.25,
        opacity: 1 - leaving,
        filter: `blur(${leaving * 11}px)`,
      }}
    >
      {lines.map((l, i) => (
        <div key={l}>
          {l.split(" ").map((w, k) => {
            const t = frame - from - i * 5 - k * 2.5;
            const o = interpolate(t, [0, 9], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const b = interpolate(t, [0, 9], [10, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span
                key={k}
                style={{
                  display: "inline-block",
                  opacity: o,
                  filter: `blur(${b}px)`,
                  marginRight: "0.28em",
                  // the family's own italic, not Playfair — two different
                  // serifs inside one headline reads as a mistake
                  fontFamily:
                    italicSecond && i === 1 ? headlineItalicStack : headlineStack,
                  fontStyle: italicSecond && i === 1 ? "italic" : "normal",
                  // Instrument Serif has a single 400; emphasis has to come
                  // from size, never weight
                  fontWeight: 400,
                  fontSize: 70,
                  color: "#fff",
                  /* A beat-to-beat push travels a full 1920px by design, so
                     every outgoing plate sweeps through this band. Against a
                     light plate — the folder cards and the result screenshot
                     around f1862-1880 — white-on-near-white erased whole words
                     of the headline. The type layer is already on top; what it
                     lacked was contrast. This shadow is invisible over flat
                     sage and only does work when something pale passes behind. */
                  textShadow:
                    "0 1px 3px rgba(28,42,46,0.34), 0 2px 12px rgba(28,42,46,0.22)",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ── a cursor that swipes on an arc, not a ruler line ─────────────── */

/**
 * `Cursor` in protocol/motion.tsx drives x and y off the same eased scalar, so
 * its path is geometrically straight — eased in time, but a ruler line in
 * space. A thumb never does that. This bends the path along a quadratic bezier
 * whose control point is offset perpendicular to the travel.
 *
 * Preview-local: protocol/motion.tsx is shared with the approved cut.
 */
export const SwipeCursor: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  start: number;
  travel?: number;
  clickAt?: number;
  /** how far the arc bows, px. Negative bows the other way. */
  arc?: number;
}> = ({ fromX, fromY, toX, toY, start, travel = 26, clickAt, arc = 90 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, travel], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const dx = toX - fromX;
  const dy = toY - fromY;
  const l = Math.max(1, Math.hypot(dx, dy));
  // control point: midway along the travel, pushed out perpendicular to it
  const cx = (fromX + toX) / 2 + (-dy / l) * arc;
  const cy = (fromY + toY) / 2 + (dx / l) * arc;
  const q = (a: number, b: number, c: number) =>
    (1 - p) * (1 - p) * a + 2 * (1 - p) * p * b + p * p * c;
  const x = q(fromX, cx, toX);
  const y = q(fromY, cy, toY);

  const c = clickAt ?? start + travel + 4;
  const click = interpolate(frame, [c, c + 3, c + 8], [1, 0.82, 1], clamp);
  const op = interpolate(frame - start, [0, 6], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${click})`,
        opacity: op,
      }}
    >
      <svg width="38" height="42" viewBox="0 0 24 26">
        <path
          d="M3 2 L3 20 L8 15.5 L11.5 23 L14.5 21.5 L11 14.5 L18 14 Z"
          fill="#fff"
          stroke="#1d2224"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/* ── cards that fall rather than pop into existence ───────────────── */

/**
 * `PopIn` is a genuine spring (damping 11, ratio ~0.48, it does overshoot) but
 * it scales from ZERO with no vertical travel, which reads as materialising
 * rather than dropping. A photo landing on a table falls, and settles slightly
 * *larger-to-smaller* as it meets the surface.
 */
export const Drop: React.FC<{
  from?: number;
  damping?: number;
  fall?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from = 0, damping = 12, fall = 240, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - from,
    fps,
    config: { damping, stiffness: 170, mass: 0.8 },
  });
  const y = (1 - s) * -fall;
  const scale = 1.14 - 0.14 * s;
  const o = interpolate(frame - from, [0, 6], [0, 1], clamp);
  return (
    <div
      style={{
        transform: `translateY(${y}px) scale(${scale})`,
        opacity: o,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ── the "three reasons" index ────────────────────────────────────── */

/**
 * The chapter card for the reasons section.
 *
 * What was here before: three hairline-outlined pills holding 24px letterspaced
 * MONOSPACE at 42% opacity, stacked in the middle of the frame. Two problems,
 * and neither was really the font on its own.
 *
 * 1. Mono at 24px with 2.4px tracking is the only place in the reel that type
 *    is neither of the two sanctioned tracks (Outfit headline / Playfair italic
 *    caption). It reads as a systems label, not as an argument, and at 42%
 *    white on sage it is barely legible on a phone.
 * 2. It broke the "visuals are large" rule (spec, non-negotiable #5): three
 *    small objects floating with ~85% of the frame empty sage around them.
 *
 * So this is not a font swap — it is the beat re-set as an editorial index.
 * The three reasons are the section headlines that follow, so this is literally
 * a table of contents for the next 40 seconds: numeral, rule, reason, at a size
 * that fills the frame. Type is Outfit, the sanctioned headline face, and the
 * rows enter blurred and sharpen (non-negotiable #4) one after another.
 */
export const ReasonIndex: React.FC<{
  items: readonly string[];
  from?: number;
  stagger?: number;
}> = ({ items, from = 0, stagger = 11 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        // centred in the band between the section pill (~7%) and the caption
        // track (~90%), so the list sits in the frame rather than on top of it
        top: "29%",
        left: 0,
        right: 0,
        padding: "0 92px",
      }}
    >
      {items.map((t, i) => {
        const local = frame - from - i * stagger;
        const ez = {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        } as const;
        const o = interpolate(local, [0, 12], [0, 1], ez);
        const b = interpolate(local, [0, 14], [12, 0], ez);
        const y = interpolate(local, [0, 16], [26, 0], {
          ...ez,
          easing: Easing.out(Easing.cubic),
        });
        // the rule draws out from the left rather than fading in place
        const rule = interpolate(local, [0, 20], [0, 1], {
          ...ez,
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div key={t} style={{ marginBottom: 132 }}>
            <div
              style={{
                height: 1,
                width: `${rule * 100}%`,
                background: "rgba(255,255,255,0.28)",
                marginBottom: 22,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 30,
                opacity: o,
                filter: `blur(${b}px)`,
                transform: `translateY(${y}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: headlineStack,
                  fontWeight: 400,
                  fontSize: 38,
                  color: "rgba(255,255,255,0.62)",
                  letterSpacing: "0.16em",
                  width: 74,
                  flex: "0 0 auto",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: headlineStack,
                  fontWeight: 400,
                  fontSize: 74,
                  lineHeight: 1.1,
                  color: "#fff",
                }}
              >
                {t}
              </div>
            </div>
          </div>
        );
      })}
      {/* closing rule: each row draws one above itself, so without this the
          list is bracketed at the top but runs off the bottom */}
      <div
        style={{
          height: 1,
          width: `${interpolate(
            frame - from - (items.length - 1) * stagger,
            [0, 20],
            [0, 100],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          )}%`,
          background: "rgba(255,255,255,0.28)",
          marginTop: -110,
        }}
      />
    </div>
  );
};

/**
 * The white section pill, preview-local.
 *
 * A copy of `SectionPill` from protocol/atoms.tsx for one reason: that one is
 * shared with RefinaProtocolReel, which is the approved cut and must keep
 * Outfit. This reel's headline face is Helvetica, and the pill is part of the
 * headline track — leaving it on Outfit would have put two sans faces in the
 * same frame, one of them on the only dark-text element in the reel.
 */
export const PreviewPill: React.FC<{ text: string; from?: number }> = ({
  text,
  from = 0,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 10], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          background: "#fff",
          color: "#1d2224",
          fontFamily: headlineStack,
          fontWeight: 400,
          fontSize: 37,
          padding: "16px 34px",
          borderRadius: 44,
          boxShadow: "0 8px 26px rgba(0,0,0,0.12)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ── two panels that converge into one split face ─────────────────── */

/**
 * The protocol reel's hook move, rebuilt preview-local.
 *
 * Two portraits sit apart, then travel to frame centre; as they travel each
 * one's INNER half crops away, so the two surviving half-faces meet as a single
 * continuous head with a seam down the nose.
 *
 * Why not import `ConvergeReveal` from protocol/atoms.tsx, which already does
 * this: that component runs still -> converge -> dock into a phone -> app UI ->
 * slide as one fixed sequence. Here the converge has to stop at the merge and
 * hold, because the seam is the hand-off into the next beat. The geometry below
 * is deliberately identical to it so the two reels stay consistent.
 *
 * `seam` is exposed as a 0..1 fraction of the composite width: 0.5 is the
 * centre split, 1 shows only the BEFORE, 0 only the AFTER. That is what lets a
 * later beat sweep the seam for "change your mind / change it back" without
 * rebuilding the composite.
 *
 * `faceDx` is the face centre's offset from the image centre as a fraction of
 * image width, measured per asset. Without it the seam lands beside the nose
 * rather than on it.
 */
export const ConvergePanels: React.FC<{
  before: string;
  after: string;
  beforeFaceDx?: number;
  afterFaceDx?: number;
  /** source aspect (w/h) of both portraits */
  ratio?: number;
  /** head top as a fraction of source height */
  headFrac?: number;
  /** frames held apart before the travel starts */
  still?: number;
  converge?: number;
  /** 0..1 across the composite; 0.5 = centred split */
  seam?: number;
  leftLabel?: string;
  rightLabel?: string;
  /** uniform scale about the composite centre — used when docking */
  scale?: number;
  /** vertical centre of the composite in frame px */
  centreY?: number;
}> = ({
  before,
  after,
  beforeFaceDx = 0.00446,
  afterFaceDx = 0.00446,
  ratio = 1792 / 2400,
  headFrac = 0.0308,
  still = 0,
  converge = 40,
  seam = 0.5,
  leftLabel = "ORIGINAL",
  rightLabel = "PREVIEW",
  scale = 1,
  centreY = 938,
}) => {
  const frame = useCurrentFrame();

  const PANEL_W = 452;
  const PANEL_H = 604;
  const GAP = 26;
  const HALF = PANEL_W / 2;
  const CX = 540;
  const HEAD_Y_PANEL = 45;

  const IMG_H = PANEL_H * 1.42;
  const IMG_W = IMG_H * ratio;
  const imgTopPanel = HEAD_Y_PANEL - headFrac * IMG_H;

  /* converge={0} means "start already merged" — the next beat picks the
     composite up mid-story. interpolate rejects a zero-width input range, so
     that case is handled before it is ever called. */
  const pC =
    converge <= 0
      ? 1
      : interpolate(frame, [still, still + converge], [0, 1], {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        });
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const cxL = lerp(CX - (PANEL_W + GAP) / 2, CX, pC);
  const cxR = lerp(CX + (PANEL_W + GAP) / 2, CX, pC);
  const inner = lerp(HALF, 0, pC);
  const merged = pC >= 1;

  const seamX = CX - HALF + seam * PANEL_W;
  const l0 = merged ? CX - HALF : cxL - HALF;
  const l1 = merged ? seamX : cxL + inner;
  const r0 = merged ? seamX : cxR - inner;
  const r1 = merged ? CX + HALF : cxR + HALF;

  const top = centreY - PANEL_H / 2;

  const Half: React.FC<{
    src: string;
    faceDx: number;
    x0: number;
    x1: number;
    radius: string;
  }> = ({ src, faceDx, x0, x1, radius }) => {
    const cx = src === before ? cxL : cxR;
    return (
      <div
        style={{
          position: "absolute",
          left: x0,
          top,
          width: Math.max(0, x1 - x0),
          height: PANEL_H,
          overflow: "hidden",
          borderRadius: radius,
          /* Stage sage, not a tint. This hero has only 3% headroom above her
             hair, so seating her head at HEAD_Y_PANEL leaves ~19px of panel
             uncovered at the top. The portraits' own backdrop was repainted to
             this exact sage, so that band is invisible rather than a light bar. */
          background: SAGE,
        }}
      >
        <Img
          src={portrait(src)}
          style={{
            position: "absolute",
            left: cx - IMG_W / 2 - faceDx * IMG_W - x0,
            top: imgTopPanel,
            width: IMG_W,
            height: IMG_H,
            maxWidth: "none",
          }}
        />
      </div>
    );
  };

  // labels ride the panels while they are apart, then clear as they join
  const labelOp =
    converge <= 0
      ? 0
      : interpolate(
          frame,
          // Monotonic by construction. With a short `still` the fade-out
          // points can land BEFORE the 12-frame fade-in and interpolate throws:
          // still=0, converge=34 gives [0, 12, 11.56, 19.72]. Latent until a
          // beat asked for panels that were already merged on arrival.
          (() => {
            const inEnd = Math.min(12, still + converge * 0.3);
            const outStart = Math.max(inEnd + 1, still + converge * 0.34);
            const outEnd = Math.max(outStart + 1, still + converge * 0.58);
            return [0, inEnd, outStart, outEnd];
          })(),
          [0, 1, 1, 0],
          clamp,
        );
  const radius = `${lerp(10, 0, pC)}px`;

  const Label: React.FC<{ text: string; cx: number; align: "left" | "right" }> = ({
    text,
    cx,
    align,
  }) => (
    <div
      style={{
        position: "absolute",
        top: top + 14,
        [align === "left" ? "left" : "right"]:
          align === "left" ? cx - HALF + 14 : 1080 - (cx + HALF) + 14,
        background: "rgba(20,30,34,0.55)",
        borderRadius: 6,
        padding: "6px 12px",
        opacity: labelOp,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 15,
        letterSpacing: 2.4,
        color: "rgba(255,255,255,0.93)",
      }}
    >
      {text}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: `${CX}px ${centreY}px`,
      }}
    >
      <Half src={before} faceDx={beforeFaceDx} x0={l0} x1={l1}
        radius={merged ? `${radius} 0 0 ${radius}` : radius} />
      <Half src={after} faceDx={afterFaceDx} x0={r0} x1={r1}
        radius={merged ? `0 ${radius} ${radius} 0` : radius} />
      {/* The seam fades up over the last few frames of the travel. Drawing it
          only once `merged` flips true popped a hard white line into the frame
          in one frame, right at the moment the two halves met. */}
      <div
        style={{
          position: "absolute",
          left: (merged ? seamX : cxL + inner) - 1,
          top,
          width: 2,
          height: PANEL_H,
          background: "rgba(255,255,255,0.85)",
          /* Fades out as the seam reaches either edge: at seam 0 or 1 there is
             no split to mark, and the line just sat on the composite's edge
             looking like a stray border. */
          opacity:
            (converge <= 0
              ? 1
              : interpolate(
                  frame,
                  [still + converge * 0.8, still + converge],
                  [0, 1],
                  clamp,
                )) *
            interpolate(seam, [0, 0.06, 0.94, 1], [0, 1, 1, 0], clamp),
        }}
      />
      {labelOp > 0.01 ? (
        <>
          <Label text={leftLabel} cx={cxL} align="left" />
          <Label text={rightLabel} cx={cxR} align="right" />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
