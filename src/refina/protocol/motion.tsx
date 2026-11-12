import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { displayFont, sansFont } from "../../fonts";

/**
 * Animation primitives matching the reference reel's motion vocabulary.
 * Every beat should be composed from these rather than ad-hoc fades.
 * See docs/qoves-reel-spec.md §10.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ── 1. PopIn — scale up from 0 with overshoot/bounce ─────────────── */
export const PopIn: React.FC<{
  from?: number;
  damping?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from = 0, damping = 9, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - from,
    fps,
    config: { damping, stiffness: 190, mass: 0.7 },
  });
  return (
    <div
      style={{
        transform: `scale(${s})`,
        opacity: interpolate(frame - from, [0, 5], [0, 1], clamp),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ── 2. SlideIn — enter from an edge, fading ──────────────────────── */
export const SlideIn: React.FC<{
  from?: number;
  dir?: "up" | "down" | "left" | "right";
  distance?: number;
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from = 0, dir = "up", distance = 90, dur = 18, children, style }) => {
  const frame = useCurrentFrame();
  // Decelerating quintic: arrives fast, settles softly. A linear or p²
  // move reads as a slide transition; this reads as weight.
  const e = interpolate(frame - from, [0, dur], [1, 0], {
    ...clamp,
    easing: Easing.out(Easing.poly(5)),
  });
  const map = {
    up: `translateY(${e * distance}px)`,
    down: `translateY(${-e * distance}px)`,
    left: `translateX(${e * distance}px)`,
    right: `translateX(${-e * distance}px)`,
  };
  return (
    <div
      style={{
        transform: map[dir],
        opacity: interpolate(frame - from, [0, dur * 0.55], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.quad),
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ── 3. CountUp — number ticks up (e.g. 78 → 80) ──────────────────── */
export const CountUp: React.FC<{
  from?: number;
  start: number;
  end: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ from = 0, start, end, dur = 30, style }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame - from, [0, dur], [start, end], clamp);
  return <span style={style}>{Math.round(v)}</span>;
};

/* ── 4. TrimPath — an SVG path draws itself ───────────────────────── */
export const TrimPath: React.FC<{
  d: string;
  from?: number;
  dur?: number;
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  dashed?: boolean;
  length?: number;
  style?: React.CSSProperties;
}> = ({
  d,
  from = 0,
  dur = 22,
  width = 1080,
  height = 1920,
  stroke = "#fff",
  strokeWidth = 2,
  dashed = false,
  length = 2000,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, dur], [1, 0], clamp);
  return (
    <svg width={width} height={height} style={{ position: "absolute", ...style }}>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashed ? "2 7" : length}
        strokeDashoffset={dashed ? 0 : length * p}
        opacity={dashed ? interpolate(frame - from, [0, dur], [0, 1], clamp) : 1}
      />
    </svg>
  );
};

/* ── 5. SliderReveal — masked wipe of "after" over "before" ───────── */
export const SliderReveal: React.FC<{
  before: React.ReactNode;
  after: React.ReactNode;
  from?: number;
  dur?: number;
  width: number;
  height: number;
  handle?: boolean;
  /** Constrain the divider to the photo region (px from the top of the
   *  container). Without this it runs the full height of a phone screen and
   *  cuts across UI chrome, which reads as a glitch. */
  dividerTop?: number;
  dividerBottom?: number;
  /**
   * Which image the wipe finishes on. Defaults to "after" — the divider
   * starts at the right edge with the before filling the panel and sweeps
   * left, growing the after. Set "before" to run it the other way.
   */
  reveal?: "after" | "before";
  /** draw a pointer gripping the handle as it travels */
  cursor?: boolean;
}> = ({
  before,
  after,
  from = 0,
  dur = 55,
  width,
  height,
  handle = true,
  dividerTop = 0,
  dividerBottom = 0,
  reveal = "after",
  cursor = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A hand dragging a slider: eases in off the mark, carries through, and
  // settles — it does not run at constant speed and stop dead.
  const s = spring({
    frame: frame - from,
    fps,
    durationInFrames: dur,
    config: { damping: 26, stiffness: 55, mass: 1.1 },
  });
  // The `after` layer is clipped from the left, so it occupies [pct, 100].
  // Sweeping pct down grows the after; sweeping it up wipes the after away.
  const pct = reveal === "after" ? 96 - s * 92 : 4 + s * 92;
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>{before}</div>
      <div
        style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${pct}%)` }}
      >
        {after}
      </div>
      {handle ? (
        <div
          style={{
            position: "absolute",
            top: dividerTop,
            bottom: dividerBottom,
            left: `${pct}%`,
            width: 2,
            background: "#fff",
            boxShadow: "0 0 10px rgba(0,0,0,0.4)",
          }}
        />
      ) : null}
      {/* A pointer gripping the handle. Without it the divider moves itself,
          which reads as a scripted animation rather than someone using the
          product. It rides `pct`, so it stays locked to the handle. */}
      {cursor ? (
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: dividerTop + (height - dividerTop - dividerBottom) * 0.52,
            transform: "translate(-9px, 0)",
            opacity: interpolate(frame - from, [-8, 2], [0, 1], clamp),
          }}
        >
          <svg width="34" height="38" viewBox="0 0 24 26">
            <path
              d="M3 2 L3 20 L8 15.5 L11.5 23 L14.5 21.5 L11 14.5 L18 14 Z"
              fill="#fff"
              stroke="#1d2224"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : null}
    </div>
  );
};

/* ── 6. PushWipe — incoming slides in and shoves the outgoing out ─── */
export const PushWipe: React.FC<{
  outgoing: React.ReactNode;
  incoming: React.ReactNode;
  at: number;
  dur?: number;
  width: number;
  height: number;
}> = ({ outgoing, incoming, at, dur = 20, width, height }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  const e = 1 - Math.pow(1 - p, 3);
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-e * width}px)` }}>
        {outgoing}
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - e) * width}px)` }}>
        {incoming}
      </div>
    </div>
  );
};

/* ── 7. ScrollReveal — content scrolls up inside a viewport ───────── */
export const ScrollReveal: React.FC<{
  from?: number;
  dur?: number;
  distance: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ from = 0, dur = 90, distance, width, height, children }) => {
  const frame = useCurrentFrame();
  // Thumb-flick inertia: eases off the start, long constant middle, settles.
  const y = interpolate(frame - from, [0, dur], [0, -distance], {
    ...clamp,
    easing: Easing.bezier(0.4, 0, 0.28, 1),
  });
  return (
    <div style={{ width, height, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${y}px)` }}>
        {children}
      </div>
    </div>
  );
};

/* ── 8. ChatThread — bubbles slide up one after another ───────────── */
export type ChatMsg = { text: string; side: "in" | "out"; at: number };

export const ChatThread: React.FC<{
  messages: ChatMsg[];
  width?: number;
  children?: React.ReactNode;
}> = ({ messages, width = 560, children }) => (
  <div style={{ width, display: "flex", flexDirection: "column", gap: 16 }}>
    {messages.map((m, i) => (
      <SlideIn
        key={i}
        from={m.at}
        dir="up"
        distance={40}
        dur={14}
        style={{ alignSelf: m.side === "out" ? "flex-end" : "flex-start" }}
      >
        <div
          style={{
            background: "#fff",
            color: "#1d2224",
            fontFamily: sansFont,
            fontSize: 27,
            lineHeight: 1.3,
            padding: "16px 22px",
            borderRadius: 18,
            maxWidth: width * 0.82,
          }}
        >
          {m.text}
        </div>
      </SlideIn>
    ))}
    {children}
  </div>
);

/* ── 9. Montage — rhythmic hard cuts between children ─────────────── */
export const Montage: React.FC<{
  from?: number;
  hold: number;
  children: React.ReactNode[];
}> = ({ from = 0, hold, children }) => {
  const frame = useCurrentFrame();
  const i = Math.max(0, Math.floor((frame - from) / hold));
  return <>{children[Math.min(i, children.length - 1)]}</>;
};

/* ── 10. Cursor — glides to a target and clicks ───────────────────── */
export const Cursor: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  start: number;
  travel?: number;
  clickAt?: number;
}> = ({ fromX, fromY, toX, toY, start, travel = 26, clickAt }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, travel], [0, 1], clamp);
  const e = 1 - Math.pow(1 - p, 3);
  const x = fromX + (toX - fromX) * e;
  const y = fromY + (toY - fromY) * e;
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

/* ── 11. StepPill — numbered badge pops in ────────────────────────── */
export const StepPill: React.FC<{
  n: number | string;
  from?: number;
  style?: React.CSSProperties;
}> = ({ n, from = 0, style }) => (
  <PopIn from={from} style={{ position: "absolute", ...style }}>
    <div
      style={{
        background: "#fff",
        color: "#1d2224",
        fontFamily: displayFont,
        fontSize: 30,
        minWidth: 62,
        textAlign: "center",
        padding: "9px 20px",
        borderRadius: 34,
        boxShadow: "0 6px 20px rgba(0,0,0,0.14)",
      }}
    >
      {n}
    </div>
  </PopIn>
);

/* ── 12. CheckList — label + checkmark that draws in, staggered ───── */
export const AnimatedCheckList: React.FC<{
  items: string[];
  from?: number;
  step?: number;
  x: number;
  y: number;
  size?: number;
}> = ({ items, from = 0, step = 9, x, y, size = 34 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {items.map((it, i) => {
        const t = from + i * step;
        const o = interpolate(frame - t, [0, 8], [0, 1], clamp);
        const draw = interpolate(frame - t - 4, [0, 10], [1, 0], clamp);
        return (
          <div
            key={it}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: size * 0.6,
              opacity: o,
              fontFamily: displayFont,
              fontWeight: 300,
              fontSize: size,
              color: "#fff",
            }}
          >
            <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24">
              <path
                d="M4 12.5 L9.5 18 L20 6"
                fill="none"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="30"
                strokeDashoffset={30 * draw}
              />
            </svg>
            {it}
          </div>
        );
      })}
    </div>
  );
};

/* ── 13. SlideOver — a panel slides in on top of what's beneath ───── */
export const SlideOver: React.FC<{
  from?: number;
  dir?: "up" | "left" | "right";
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from = 0, dir = "up", dur = 20, children, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, dur], [1, 0], clamp);
  const e = Math.pow(p, 3);
  const map = {
    up: `translateY(${e * 620}px)`,
    left: `translateX(${e * 620}px)`,
    right: `translateX(${-e * 620}px)`,
  };
  return (
    <AbsoluteFill style={{ transform: map[dir], ...style }}>{children}</AbsoluteFill>
  );
};

/* ── 14. Exit — overlays leave instead of vanishing on the cut ────── */

/**
 * Wraps absolutely-positioned overlay content and animates it out over the
 * tail of a beat. Everything in this reel used to disappear the instant its
 * Sequence ended: entrances were eased, departures were a hard stop.
 *
 * Deliberately NOT applied to a beat's main plate. Spec rule 6 locks hard
 * cuts between beats — fading the plate would soften every cut. This is for
 * callouts, cards, tags and chips, which should retract *before* the cut so
 * the last half-second of a beat still has motion in it.
 */
export const Exit: React.FC<{
  /** frame the exit begins, relative to the enclosing Sequence */
  at: number;
  dur?: number;
  dir?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  children: React.ReactNode;
}> = ({ at, dur = 14, dir = "up", distance = 46, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic), // accelerates away — it is leaving
  });
  const d = p * distance;
  const map = {
    up: `translateY(${-d}px)`,
    down: `translateY(${d}px)`,
    left: `translateX(${-d}px)`,
    right: `translateX(${d}px)`,
    none: "none",
  };
  return (
    <AbsoluteFill style={{ opacity: 1 - p, transform: map[dir] }}>
      {children}
    </AbsoluteFill>
  );
};

/* ── 15. Camera — a continuous move under an entire beat ──────────── */

export type CameraMove = "in" | "out";

/**
 * Wraps a beat's *visual plate* (imagery plus anything pinned to imagery,
 * e.g. callouts) in a slow move that runs the full length of the beat.
 *
 * This exists because every beat's entrance animations finish in the first
 * ~2s and the remaining 3-5s were frozen — 53% of the reel measured as
 * literally identical frames. A plate that never stops moving means there is
 * no frozen frame to land on.
 *
 * Two rules:
 *  - `dur` must be the beat's full length. A camera that finishes early
 *    re-creates the exact problem it is here to solve.
 *  - Full-bleed portraits must use `move="in"`. Pulling out on them exposes
 *    the bottom edge of the source photo.
 *
 * The move is deliberately *not* eased out. An ease-out decelerates to a
 * stop, which reads as a freeze; this eases in off the cut and is still
 * travelling when the beat ends.
 */
export const Camera: React.FC<{
  /** the beat's full length in frames */
  dur: number;
  move?: CameraMove;
  /** total scale travel over the beat, e.g. 0.06 = 6% */
  amount?: number;
  /**
   * Explicit scale endpoints, overriding move/amount. Use these when two
   * consecutive beats share the same framing: the second beat must pick up
   * where the first left off, or the cut shows a scale snapping backwards.
   */
  scaleFrom?: number;
  scaleTo?: number;
  /** horizontal drift in px across the whole beat */
  panX?: number;
  /** vertical drift in px across the whole beat */
  panY?: number;
  origin?: string;
  children: React.ReactNode;
}> = ({
  dur,
  move = "in",
  amount = 0.055,
  scaleFrom,
  scaleTo,
  panX = 0,
  panY = 0,
  origin = "50% 42%",
  children,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 0, 1, 1), // ease-in only — never decelerates
  });
  // Pulling out starts wide and closes to 1, so the plate is never smaller
  // than its layout size at the end of the beat.
  const a = scaleFrom ?? (move === "in" ? 1 : 1 + amount);
  const b = scaleTo ?? (move === "in" ? 1 + amount : 1);
  const scale = a + (b - a) * p;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${p * panX}px, ${p * panY}px) scale(${scale})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
