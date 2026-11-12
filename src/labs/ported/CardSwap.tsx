import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * CardSwap — ported from React Bits (Components/CardSwap, David Haz).
 * License: MIT + Commons Clause. Fine inside our own videos; never redistribute
 * the component itself. Source: C:\Users\rahul\motion-refs\3-commons-clause\react-bits
 *
 * The original drives a GSAP timeline from setInterval and mutates the DOM.
 * Here the same timeline is evaluated as a pure function of time, so any frame
 * renders on its own. Every number is the original's, for easing="elastic":
 *
 *   front card   drops y += 500 over 2s                     from T
 *   the rest     each move up one slot over 2s              from T + 0.2 + 0.15i
 *   front card   flies to the back slot over 2s             from T + 0.3
 *                (this tween starts later, so it wins y from the drop tween,
 *                 exactly as GSAP renders overlapping tweens in start order)
 *   z-order      rest promoted at T + 0.2, front sent back at T + 0.3
 *
 * `elastic.out(0.6, 0.9)` is GSAP's own formula, reproduced below.
 */

// GSAP _configElastic("out", 0.6, 0.9): amplitude < 1 folds into the period.
const P1 = 1;
const P2_RAW = 0.9 / 0.6;
const P3 = (P2_RAW / (2 * Math.PI)) * Math.asin(1 / P1);
const P2 = (2 * Math.PI) / P2_RAW;
const elasticOut = (p: number) =>
  p <= 0 ? 0 : p >= 1 ? 1 : P1 * 2 ** (-10 * p) * Math.sin((p - P3) * P2) + 1;

const DUR = 2;
const PROMOTE = DUR - DUR * 0.9; // durDrop * (1 - promoteOverlap)
const RETURN = PROMOTE + DUR * 0.05; // promote + durMove * returnDelay
const STAGGER = 0.15;

type Slot = { x: number; y: number; z: number; zIndex: number };
const slot = (i: number, dx: number, dy: number, n: number): Slot => ({
  x: i * dx,
  y: -i * dy,
  z: -i * dx * 1.5,
  zIndex: n - i,
});

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const prog = (t: number, start: number) =>
  elasticOut(Math.min(1, Math.max(0, (t - start) / DUR)));

/** Where every card is at time `t`, given swaps starting at `first` every `every` s. */
const layout = (
  t: number,
  n: number,
  dx: number,
  dy: number,
  first: number,
  every: number,
): Slot[] => {
  const k = t < first ? -1 : Math.floor((t - first) / every);
  // Order before swap k: rotated k times from [0..n-1].
  const order = Array.from({ length: n }, (_, i) => (i + Math.max(0, k)) % n);
  const out: Slot[] = [];
  order.forEach((card, i) => {
    out[card] = slot(i, dx, dy, n);
  });
  if (k < 0) return out;

  const T = first + k * every;
  const lt = t - T;
  const [front, ...rest] = order;

  rest.forEach((card, i) => {
    const from = slot(i + 1, dx, dy, n);
    const to = slot(i, dx, dy, n);
    const p = prog(lt, PROMOTE + i * STAGGER);
    out[card] = {
      x: lerp(from.x, to.x, p),
      y: lerp(from.y, to.y, p),
      z: lerp(from.z, to.z, p),
      zIndex: lt >= PROMOTE ? to.zIndex : from.zIndex,
    };
  });

  const s0 = slot(0, dx, dy, n);
  const back = slot(n - 1, dx, dy, n);
  if (lt < RETURN) {
    out[front] = { ...s0, y: s0.y + 500 * prog(lt, 0) };
  } else {
    const yAtReturn = s0.y + 500 * prog(RETURN, 0);
    const p = prog(lt, RETURN);
    out[front] = {
      x: lerp(s0.x, back.x, p),
      y: lerp(yAtReturn, back.y, p),
      z: lerp(s0.z, back.z, p),
      zIndex: back.zIndex,
    };
  }
  return out;
};

export const CardSwap: React.FC<{
  width: number;
  height: number;
  cardDistance?: number;
  verticalDistance?: number;
  skewAmount?: number;
  /** Seconds before the first swap (the original swaps immediately). */
  first?: number;
  /** Seconds between swaps (the original's `delay`, 5000ms). */
  every?: number;
  perspective?: number;
  cardStyle?: React.CSSProperties;
  children: React.ReactNode[];
}> = ({
  width,
  height,
  cardDistance = 60,
  verticalDistance = 70,
  skewAmount = 6,
  first = 0,
  every = 5,
  perspective = 900,
  cardStyle,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slots = layout(
    frame / fps,
    children.length,
    cardDistance,
    verticalDistance,
    first,
    every,
  );

  return (
    <div style={{ position: "relative", width, height, perspective }}>
      {children.map((child, i) => {
        const s = slots[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width,
              height,
              borderRadius: 12,
              border: "1px solid #fff",
              background: "#000",
              overflow: "hidden",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              zIndex: s.zIndex,
              transform: `translate(-50%, -50%) translate3d(${s.x}px, ${s.y}px, ${s.z}px) skewY(${skewAmount}deg)`,
              ...cardStyle,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
