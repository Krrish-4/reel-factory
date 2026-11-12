import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { displayFont, sansFont, serifFont } from "../../fonts";

/* ── palette (measured from the reference reel) ───────────────────── */
export const SAGE = "#A3B5BA";
export const PANEL = "#B4C4C8";
export const RED = "#D0342C";
export const GREEN = "#2E7D5B";

export const portrait = (n: string) => staticFile(`portraits/${n}.png`);
export const screen = (n: string) =>
  staticFile(`refina-ui/screens_trim/${n}.png`);

/** Flat sage stage — the background never changes for the whole reel. */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: SAGE }}>{children}</AbsoluteFill>
);

/* ── text ─────────────────────────────────────────────────────────── */

/**
 * The reference reel's signature reveal: text arrives blurred + ghosted
 * and sharpens word by word, left to right.
 */
const BlurWords: React.FC<{
  text: string;
  from: number;
  style: React.CSSProperties;
  stagger?: number;
}> = ({ text, from, style, stagger = 2.5 }) => {
  const frame = useCurrentFrame();
  return (
    <span style={style}>
      {text.split(" ").map((w, i) => {
        const t = frame - from - i * stagger;
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
            key={i}
            style={{
              display: "inline-block",
              opacity: o,
              filter: `blur(${b}px)`,
              marginRight: "0.28em",
            }}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
};

/** Top headline. Holds for a whole section; light geometric sans. */
export const Headline: React.FC<{
  lines: string[];
  from?: number;
  italicSecond?: boolean;
}> = ({ lines, from = 0, italicSecond = false }) => (
  <div
    style={{
      position: "absolute",
      top: "12%",
      left: 0,
      right: 0,
      textAlign: "center",
      padding: "0 70px",
      lineHeight: 1.25,
    }}
  >
    {lines.map((l, i) => (
      <div key={i}>
        <BlurWords
          text={l}
          from={from + i * 5}
          style={{
            // Outfit, per spec rule 9 — a light geometric sans. This was
            // wrongly using Inter, which is why the headline read as generic.
            fontFamily: italicSecond && i === 1 ? serifFont : displayFont,
            fontStyle: italicSecond && i === 1 ? "italic" : "normal",
            fontWeight: italicSecond && i === 1 ? 400 : 300,
            fontSize: 62,
            color: "#fff",
          }}
        />
      </div>
    ))}
  </div>
);

/** Numbered section label — white pill, dark text. */
export const SectionPill: React.FC<{ text: string; from?: number }> = ({
  text,
  from = 0,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
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
          fontFamily: displayFont,
          fontWeight: 400,
          fontSize: 34,
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

/** Bottom running caption, driven by absolute composition frames. */
export type Cue = { f: number; t: number; s: string };

export const Captions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        bottom: "9%",
        left: 0,
        right: 0,
        height: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 70px",
      }}
    >
      {cues.map((c, i) => {
        if (frame < c.f - 6 || frame > c.t + 6) return null;
        const words = c.s.split(" ");
        /* Words land across 85% of the cue so the line is complete before it
           starts leaving. This is an even distribution, not true word-level
           sync — the cue list only carries phrase start/end, so a long word
           and a short one get the same slot. It tracks speech closely enough
           to read as synced; real sync would need forced alignment. */
        const step = ((c.t - c.f) * 0.85) / Math.max(1, words.length);
        const outO = interpolate(frame, [c.t - 7, c.t], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              textAlign: "center",
              fontFamily: serifFont,
              fontStyle: "italic",
              fontSize: 44,
              color: "#fff",
              lineHeight: 1.3,
              opacity: outO,
            }}
          >
            {words.map((w, k) => {
              const t0 = c.f + k * step;
              const ez = {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              } as const;
              const o = interpolate(frame, [t0, t0 + 5], [0, 1], ez);
              const b = interpolate(frame, [t0, t0 + 6], [6, 0], ez);
              const y = interpolate(frame, [t0, t0 + 7], [9, 0], {
                ...ez,
                easing: Easing.out(Easing.quad),
              });
              /* Unshown words stay rendered at opacity 0 rather than being
                 omitted. They still occupy layout, so the centred line keeps
                 its final width and does not reflow as words arrive. */
              return (
                <span
                  key={k}
                  style={{
                    display: "inline-block",
                    opacity: o,
                    filter: `blur(${b}px)`,
                    transform: `translateY(${y}px)`,
                    marginRight: "0.26em",
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/* ── imagery ──────────────────────────────────────────────────────── */

/**
 * Cut-out portrait sitting directly on the sage — no card, no border,
 * exactly like the reference. `scale`/`y` frame the crop.
 */
const HEAD_TOP_FRAC = 0.0489; // top of hair, after the 1.35x bottom padding

export const Portrait: React.FC<{
  name: string;
  from?: number;
  /** image height as % of the 1920px frame */
  size?: number;
  /** where the top of the head should land, in px from the top of frame */
  headTop?: number;
  /** where the top of the head sits within this image, as a fraction of its
   *  height. Measured per source; front-* = 0.049, alt-* ≈ 0.059. */
  headFrac?: number;
  x?: number;
  /**
   * Backdrop colour of the source photograph. Supply this for photos that
   * carry their own studio backdrop; omit it for alpha cutouts.
   *
   * A cutout can sit anywhere on the sage because its background is
   * transparent. A backdrop photo cannot — its top edge is a hard horizontal
   * line where the photo's grey meets the stage. So for those we ramp the
   * area just above the image from sage to the photo's own backdrop, and
   * feather the image's top edge into it. The seam disappears; the rest of
   * the frame stays flat sage.
   */
  bg?: string;
}> = ({
  name,
  from = 0,
  size = 118,
  headTop = 520,
  headFrac = HEAD_TOP_FRAC,
  x = 0,
  bg,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // The old 3%-over-240-frame drift lived here. At 0.22px/frame it was
  // sub-pixel — invisible, and x264 discarded it. Sustained movement is now
  // the <Camera> wrapper's job; this component only handles its entrance.
  const imgH = (1920 * size) / 100;
  const top = headTop - headFrac * imgH;
  // Feather stays inside the backdrop strip above the hairline so it never
  // eats into the hair itself.
  const feather = Math.max(0, Math.min(90, top * 0.3));
  const mask = `linear-gradient(to bottom, transparent 0px, #000 ${feather}px)`;
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>
      {bg ? (
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom, ${SAGE} ${Math.max(0, top - 130)}px, ${bg} ${top + feather}px)`,
          }}
        />
      ) : null}
      <Img
        src={portrait(name)}
        style={{
          position: "absolute",
          left: "50%",
          top,
          height: imgH,
          transform: `translateX(-50%) translateX(${x}px)`,
          ...(bg ? { maskImage: mask, WebkitMaskImage: mask } : {}),
        }}
      />
    </AbsoluteFill>
  );
};

/** YOU NOW │ YOUR POTENTIAL split, with the mono disclaimer beneath. */
export const SplitPanels: React.FC<{
  left: string;
  right: string;
  leftLabel?: string;
  rightLabel?: string;
  from?: number;
  leftZoom?: number;
  rightZoom?: number;
  /** vertical framing inside the panel, % — lower shows more headroom */
  offset?: number;
}> = ({
  left,
  right,
  leftLabel = "YOU NOW",
  rightLabel = "YOUR POTENTIAL",
  from = 0,
  leftZoom = 1,
  rightZoom = 1,
  offset = 36,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // Was 26px linear — under 1.4% of frame height, so it read as a plain fade.
  const rise = interpolate(frame - from, [0, 22], [86, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(5)),
  });

  const Panel: React.FC<{ src: string; label: string; zoom?: number }> = ({
    src,
    label,
    zoom = 1,
  }) => (
    <div
      style={{
        position: "relative",
        width: 452,
        height: 604,
        borderRadius: 10,
        overflow: "hidden",
        background: PANEL,
      }}
    >
      <Img
        src={portrait(src)}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          height: `${142 * zoom}%`,
          transform: `translate(-50%,-${offset}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          background: "rgba(24,28,29,0.72)",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 20,
          letterSpacing: 2,
          padding: "6px 12px",
          borderRadius: 5,
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div style={{ display: "flex", gap: 26 }}>
        <Panel src={left} label={leftLabel} zoom={leftZoom} />
        <Panel src={right} label={rightLabel} zoom={rightZoom} />
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: "monospace",
          fontSize: 19,
          letterSpacing: 3,
          color: "rgba(255,255,255,0.62)",
        }}
      >
        RENDERING · FOR ILLUSTRATIVE PURPOSES ONLY
      </div>
    </AbsoluteFill>
  );
};

/**
 * Hook animation. Two full portraits converge on frame centre; as they travel,
 * each one's inner half crops away until the two remaining half-faces meet as
 * a single continuous head. The seam then sweeps left to reveal the after.
 *
 * Geometry (all traceable to SplitPanels so the two beats stay consistent):
 *   panel 452x604, 26px gap  ->  face centres start at x=301 and x=779
 *   merged: one 452-wide face centred at 540, halves [314,540] and [540,766]
 *
 * `faceDx` is the face centre's offset from the image centre in *source*
 * pixels — measured per asset. Without it the seam lands beside the nose
 * rather than on it.
 */
export const ConvergeReveal: React.FC<{
  before: string;
  after: string;
  /**
   * Face centre's offset from the image centre, as a FRACTION of image width
   * (not source pixels — that would bake in one asset's resolution). Measured
   * per pair; without it the seam lands beside the nose rather than on it.
   */
  beforeFaceDx?: number;
  afterFaceDx?: number;
  /** source aspect ratio (w/h) of both portraits */
  ratio?: number;
  /** top of the head as a fraction of source height — drives vertical framing */
  headFrac?: number;
  /** image scale once docked; must keep imgW >= the phone slot width */
  dockZoom?: number;
  /** static beat before anything moves */
  still?: number;
  converge?: number;
  /** composite shrinks into the phone's photo slot */
  dock?: number;
  /** app chrome fades in around the photo */
  ui?: number;
  slide?: number;
  leftLabel?: string;
  rightLabel?: string;
}> = ({
  before,
  after,
  beforeFaceDx = 0.0124,
  afterFaceDx = 0.002,
  ratio = 1122 / 1402,
  headFrac = 0.0606,
  dockZoom = 0.66,
  still = 72,
  converge = 56,
  dock = 50,
  ui = 50,
  slide = 72,
  leftLabel = "YOU NOW",
  rightLabel = "YOUR POTENTIAL",
}) => {
  const frame = useCurrentFrame();

  const PANEL_W = 452;
  const PANEL_H = 604;
  const GAP = 26;
  const HALF = PANEL_W / 2;
  const CX = 540;
  const TOP = 636;
  const IMG_H = PANEL_H * 1.42;
  const IMG_W = IMG_H * ratio;

  /* Phone shell, centred: 404x936 at [338,492]. Its photo slot sits 125px
     down the screen and is 412 tall — that is what the composite docks into.
     Slot aspect is 0.98 against the composite's 0.748, so docking crops
     height; `dockImgTop` keeps the face rather than the chest. */
  const PH_X = 338;
  const PH_Y = 492;
  const PH_W = 404;
  const PH_H = 936;
  const SLOT_TOP = PH_Y + 125;
  const SLOT_H = 412;
  /* How far the IMAGE shrinks when docking. This is deliberately NOT the
     rect's scale (404/452 = 0.894): the slot is far shorter than the
     composite (412 vs 604), so sizing the image to the slot's *width* left
     the head spanning 448px inside 412px — it overflowed and read as a
     cropped face. Head span is ~0.585 of source height, so at `dockZoom`
     it occupies ~80% of the slot with margin above and below.

     Lower bound: imgW must stay >= the slot width or backdrop gaps open at
     the sides. For this pair that floor is 0.631. */
  const DOCK_IMG_SCALE = dockZoom;

  /* Vertical framing derives from the asset's own headFrac so a pair with a
     different crop lands the head in the same place. */
  const HEAD_Y_PANEL = 45; // head top within the 604 composite
  const HEAD_Y_SLOT = 30; // head top within the 412 phone slot
  const imgTopPanel = HEAD_Y_PANEL - headFrac * IMG_H;
  const dockImgTop = HEAD_Y_SLOT - headFrac * IMG_H * DOCK_IMG_SCALE;

  const cStart = still;
  const dStart = still + converge;
  const uStart = dStart + dock;
  const sStart = uStart + ui;

  const ez = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const pC = interpolate(frame, [cStart, cStart + converge], [0, 1], {
    ...ez,
    easing: Easing.inOut(Easing.cubic),
  });
  const pD = interpolate(frame, [dStart, dStart + dock], [0, 1], {
    ...ez,
    easing: Easing.inOut(Easing.cubic),
  });
  const pU = interpolate(frame, [uStart, uStart + ui], [0, 1], {
    ...ez,
    easing: Easing.out(Easing.quad),
  });
  const pS = interpolate(frame, [sStart, sStart + slide], [0, 1], {
    ...ez,
    easing: Easing.inOut(Easing.cubic),
  });

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const startCxL = CX - (PANEL_W + GAP) / 2;
  const startCxR = CX + (PANEL_W + GAP) / 2;
  const cxL = lerp(startCxL, CX, pC);
  const cxR = lerp(startCxR, CX, pC);
  const inner = lerp(HALF, 0, pC);

  // Composite rect — constant through the converge, then shrinks into the slot.
  const panelW = lerp(PANEL_W, PH_W, pD);
  const panelH = lerp(PANEL_H, SLOT_H, pD);
  const panelTop = lerp(TOP, SLOT_TOP, pD);
  const halfW = panelW / 2;
  const imgScale = lerp(1, DOCK_IMG_SCALE, pD);
  const imgTop = lerp(imgTopPanel, dockImgTop, pD);
  const imgW = IMG_W * imgScale;
  const imgH = IMG_H * imgScale;

  const merged = pC >= 1;
  const seam = lerp(CX, CX - halfW + 2, pS);
  const l0 = merged ? CX - halfW : cxL - HALF;
  const l1 = merged ? seam : cxL + inner;
  const r0 = merged ? seam : cxR - inner;
  const r1 = merged ? CX + halfW : cxR + HALF;

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
          top: panelTop,
          width: Math.max(0, x1 - x0),
          height: panelH,
          overflow: "hidden",
          borderRadius: radius,
          background: PANEL,
        }}
      >
        <Img
          src={portrait(src)}
          style={{
            position: "absolute",
            left: cx - imgW / 2 - faceDx * imgW - x0,
            top: imgTop,
            width: imgW,
            height: imgH,
            maxWidth: "none",
          }}
        />
      </div>
    );
  };

  const labelOp = interpolate(
    frame,
    [0, 12, cStart + converge * 0.34, cStart + converge * 0.58],
    [0, 1, 1, 0],
    ez,
  );
  const r = (v: number) => `${lerp(10, 0, v)}px`;

  return (
    <AbsoluteFill>
      {/* phone shell — materialises around the composite during the dock */}
      <div
        style={{
          position: "absolute",
          left: PH_X,
          top: PH_Y,
          width: PH_W,
          height: PH_H,
          borderRadius: 40,
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.85)",
          background: "#fff",
          boxShadow: "0 26px 60px rgba(30,45,50,0.25)",
          opacity: pD,
          transform: `scale(${lerp(1.12, 1, pD)})`,
        }}
      >
        {/* real app chrome. The composite sits on top of this screenshot's own
            photo region, so the app genuinely reads as showing her photo. */}
        <Img
          src={screen("your-result-after")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 2%",
            opacity: pU,
          }}
        />
      </div>

      <Half
        src={before}
        faceDx={beforeFaceDx}
        x0={l0}
        x1={l1}
        radius={`10px ${r(pC)} ${r(pC)} 10px`}
      />
      <Half
        src={after}
        faceDx={afterFaceDx}
        x0={r0}
        x1={r1}
        radius={`${r(pC)} 10px 10px ${r(pC)}`}
      />

      <div
        style={{
          position: "absolute",
          left: l1 - 1,
          top: panelTop,
          width: 2,
          height: panelH,
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.4)",
          opacity: interpolate(
            frame,
            [cStart + converge * 0.55, cStart + converge],
            [0, 1],
            ez,
          ),
        }}
      />

      {[
        { t: leftLabel, x: l0 + 14 },
        { t: rightLabel, x: r1 - 14, right: true },
      ].map((L) => (
        <div
          key={L.t}
          style={{
            position: "absolute",
            top: panelTop + 14,
            ...(L.right ? { right: 1080 - L.x } : { left: L.x }),
            background: "rgba(24,28,29,0.72)",
            color: "#fff",
            fontFamily: "monospace",
            fontSize: 20,
            letterSpacing: 2,
            padding: "6px 12px",
            borderRadius: 5,
            opacity: labelOp,
          }}
        >
          {L.t}
        </div>
      ))}

      {/* compliance line — rides below the composite, then below the phone */}
      <div
        style={{
          position: "absolute",
          top: lerp(TOP + PANEL_H + 22, PH_Y + PH_H + 26, pD),
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 19,
          letterSpacing: 3,
          color: "rgba(255,255,255,0.62)",
        }}
      >
        RENDERING · FOR ILLUSTRATIVE PURPOSES ONLY
      </div>
    </AbsoluteFill>
  );
};

/* ── overlays ─────────────────────────────────────────────────────── */

/** Dotted leader line from a facial feature out to a small label. */
export const Callout: React.FC<{
  label: string;
  x: number;
  y: number;
  side?: "left" | "right";
  len?: number;
  from?: number;
}> = ({ label, x, y, side = "left", len = 250, from = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // The leader line shoots out and settles rather than growing at a constant
  // rate — a linear grow is the clearest "cheap animation" tell in the reel.
  const grow = interpolate(frame - from, [0, 20], [0, len], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
      <div
        style={{
          position: "absolute",
          top: -4,
          left: -4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#fff",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          [side === "left" ? "right" : "left"]: 0,
          width: grow,
          borderTop: "1.5px dotted rgba(255,255,255,0.9)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -34,
          [side === "left" ? "right" : "left"]: len - 4,
          whiteSpace: "nowrap",
          fontFamily: sansFont,
          fontWeight: 400,
          fontSize: 25,
          color: "#fff",
          textAlign: side === "left" ? "right" : "left",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** ①②③ progress pips. */
export const Pips: React.FC<{ active: number; top?: string }> = ({
  active,
  top = "20.5%",
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      gap: 30,
    }}
  >
    {[1, 2, 3].map((n) => (
      <div
        key={n}
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: `${n === active ? 3 : 1.5}px solid #fff`,
          color: "#fff",
          fontFamily: sansFont,
          fontSize: 22,
          fontWeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: n === active ? 1 : 0.65,
        }}
      >
        {n}
      </div>
    ))}
  </div>
);

/** ✗ / ✓ verdict tag pinned to a panel corner. */
export const VerdictTag: React.FC<{
  text: string;
  good?: boolean;
  style?: React.CSSProperties;
  from?: number;
}> = ({ text, good = true, style, from = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c = good ? GREEN : RED;
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#fff",
        border: `2px solid ${c}`,
        borderRadius: 7,
        padding: "7px 14px",
        opacity: o,
        ...style,
      }}
    >
      <span style={{ color: c, fontSize: 22, fontWeight: 700 }}>
        {good ? "✓" : "✗"}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 21,
          letterSpacing: 1.5,
          color: c,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** White thought cloud that types in, word by word. */
export const ThoughtBubble: React.FC<{
  text: string;
  x: number;
  y: number;
  from?: number;
}> = ({ text, x, y, from = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const words = text.split(" ");
  const shown = Math.max(
    0,
    Math.min(words.length, Math.floor((frame - from - 6) / 4)),
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 60,
          padding: "26px 40px",
          maxWidth: 470,
          fontFamily: sansFont,
          fontSize: 34,
          color: "#1d2224",
          textAlign: "center",
          lineHeight: 1.25,
        }}
      >
        {words.slice(0, shown).join(" ")}
        {shown === 0 ? " " : ""}
      </div>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "#fff",
          marginLeft: 46,
          marginTop: 10,
        }}
      />
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          marginLeft: 26,
          marginTop: 8,
        }}
      />
    </div>
  );
};

/** Small floating white data card. */
export const DataCard: React.FC<{
  title: string;
  value: string;
  sub?: string;
  x: number;
  y: number;
  from?: number;
  w?: number;
}> = ({ title, value, sub, x, y, from = 0, w = 250 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame - from, [0, 14], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        background: "#fff",
        borderRadius: 12,
        padding: "16px 18px",
        opacity: o,
        transform: `translateY(${rise}px)`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.13)",
        fontFamily: sansFont,
      }}
    >
      <div style={{ fontSize: 15, letterSpacing: 1, color: "#8a9296" }}>
        {title}
      </div>
      <div style={{ fontSize: 38, color: "#1d2224", lineHeight: 1.15 }}>
        {value}
      </div>
      {sub ? <div style={{ fontSize: 16, color: "#8a9296" }}>{sub}</div> : null}
    </div>
  );
};

/** Staggered ✓ checklist. */
export const Checklist: React.FC<{
  items: string[];
  x: number;
  y: number;
  from?: number;
  step?: number;
}> = ({ items, x, y, from = 0, step = 7 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {items.map((it, i) => {
        const o = interpolate(frame - from - i * step, [0, 9], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={it}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
              opacity: o,
              fontFamily: sansFont,
              fontSize: 34,
              color: "#fff",
            }}
          >
            <span style={{ fontSize: 26 }}>✓</span>
            {it}
          </div>
        );
      })}
    </div>
  );
};

/** Thin white contour traced over the face. */
export const FaceContour: React.FC<{
  from?: number;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
}> = ({ from = 0, cx = 540, cy = 1121, rx = 210, ry = 275 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 14], [0, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width="1080" height="1920" style={{ position: "absolute" }}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
      </svg>
    </AbsoluteFill>
  );
};

/** App screen in a thin phone frame — used sparingly. */
export const PhoneScreen: React.FC<{
  name: string;
  from?: number;
  width?: number;
  scroll?: boolean;
  dur?: number;
}> = ({ name, from = 0, width = 430, scroll = false, dur = 120 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame - from, [0, 16], [34, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pan = scroll
    ? interpolate(frame - from, [8, dur], [0, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 3;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width,
          height: width * 2.34,
          borderRadius: 42,
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.85)",
          background: "#fff",
          opacity: o,
          transform: `translateY(${rise}px)`,
          boxShadow: "0 26px 60px rgba(30,45,50,0.25)",
        }}
      >
        <Img
          src={screen(name)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `50% ${pan}%`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Outlined search pill whose query types itself out. */
export const SearchBar: React.FC<{
  query: string;
  from?: number;
  /** when the query starts typing — defaults to when the bar appears */
  typeFrom?: number;
}> = ({ query, from = 0, typeFrom }) => {
  const frame = useCurrentFrame();
  const n = Math.max(
    0,
    Math.min(query.length, Math.floor((frame - (typeFrom ?? from)) / 2.2)),
  );
  const o = interpolate(frame - from, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 720,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "2px solid rgba(255,255,255,0.9)",
          borderRadius: 48,
          padding: "22px 34px",
          opacity: o,
        }}
      >
        <span style={{ fontFamily: sansFont, fontSize: 40, color: "#fff" }}>
          {query.slice(0, n)}
        </span>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="1.8" />
          <line
            x1="16.5"
            y1="16.5"
            x2="21"
            y2="21"
            stroke="#fff"
            strokeWidth="1.8"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
