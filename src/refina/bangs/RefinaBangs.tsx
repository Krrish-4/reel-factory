import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { headlineStack } from "../../fonts";
import { Stage } from "../protocol/atoms";
import { SectionHeadline } from "../preview/draw";
import { TypewriterInput } from "../kit";
import { AiChip, Mono, Tag } from "../ratio/atoms";
import { labelOf } from "../anchors";
import { BangsCaptions } from "./captions";
import { B, TOTAL, bf, len, line } from "./beats";
import type { BeatName } from "./beats";
import { SHOTS } from "./shots";
import type { BeatProps } from "./shots";
import { WORD_CUES } from "./words-vo";
import { X, Y, frame, lm, mix, place, rec } from "./landmarks";
import type { Box, Layout } from "./landmarks";

/**
 * "Why Anne Hathaway Looks So Different With Bangs" — RefinaBangs.
 *
 * Rahul's brief of 2026-10-29, dialogue VERBATIM (his call), in the house sage
 * treatment (memory: "QOVES" means the size/nose look, never a brief's own
 * palette). The argument is one variable on one face: a fringe hides part of
 * the upper third, so the proportions you perceive change while the structure
 * under it does not.
 *
 * BUILT FROM WHAT THIS REPO ALREADY HAS, on Rahul's instruction: RefinaTrio's
 * frame (head-and-shoulders, hair top y400, chin y1280, picture cut flat at
 * y1650), its seams, wipes, shuttles and punch-on-cut, size's push onto the
 * feature a line names, the house headline / captions / tags / chip, the
 * typing search bar as the ending (non-negotiable 6), and trio's sfx set.
 * No music bed (Rahul, 2026-10-29).
 *
 * HONESTY, BY BEAT TYPE:
 * - Anne's two pictures are the client's photographs, restaged (registered
 *   `photo:edited`). They carry that record label and NO AI-preview chip -
 *   a chip there would call a photograph a preview.
 * - bangs2 / bangs3 are generated and carry the chip.
 * - Every bracket and guide is drawn between rows READ off the file
 *   (landmarks.ts) through the same Layout that placed the picture, and none
 *   of them carries a number.
 *
 * No frame number is typed: every cue is a line or a word of words-vo.ts.
 */

const FPS = 30;
const TAIL = 45;

const MARK = "rgba(255,255,255,0.95)";
const INK = "#1C2629";

const PIC: Box = { w: 1080, h: 1650 };
const HEAD_TOP = 400;
const CHIN_Y = 1280;

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
/**
 * A beat runs until the NEXT beat starts, not until its last word ends: the cue
 * table leaves 1-3 frame gaps between beats, and v1 showed bare stage there
 * (check-frames f700-702, f1304-1306).
 */
const at = (k: BeatName) => {
  const i = SHOTS.findIndex((s) => s.name === k);
  const next = i + 1 < SHOTS.length ? B[SHOTS[i + 1].name as BeatName][0] : B[k][1];
  return { from: B[k][0], durationInFrames: next - B[k][0] };
};
type BeatArgs = BeatProps & { len: number; beat: BeatName };

/** frame of line n within the beat, LOCAL to its Sequence */
const ln = (k: BeatName, n: number) => line(k, n) - bf(k);

/** index into WORD_CUES of line n of beat k */
const cueOf = (k: BeatName, n: number) => {
  let i = 0;
  for (const s of SHOTS) {
    if (s.name === k) return i + Math.min(n, s.lines - 1);
    i += s.lines;
  }
  return 0;
};
/** onset of word w of line n of beat k, LOCAL to the beat */
const wd = (k: BeatName, n: number, w: number) => {
  const c = WORD_CUES[cueOf(k, n)];
  return (c.w[Math.min(w, c.w.length - 1)] ?? c.f) - bf(k);
};
/** the same, ABSOLUTE - for the sound track */
const wdAbs = (k: BeatName, n: number, w: number) => wd(k, n, w) + bf(k);

const std = (id: string, box: Box = PIC) => frame(id, box, HEAD_TOP, CHIN_Y);
const label = (id: string) => labelOf(id as Parameters<typeof labelOf>[0]);

/* ── primitives ──────────────────────────────────────────────────────── */

const Pic: React.FC<{
  id: string;
  L: Layout;
  box?: Box;
  clip?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ id, L, box = PIC, clip, style, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: box.w, height: box.h, overflow: "hidden", clipPath: clip, ...style }}>
    <Img
      src={staticFile(`portraits/${rec(id).file}`)}
      style={{ position: "absolute", left: L.x, top: L.y, width: L.w, height: L.h, maxWidth: "none" }}
    />
    {children}
  </div>
);

const Head: React.FC<{ lines: string[]; from?: number; until: number; out?: number }> = ({ lines, from = 2, until, out = 10 }) => (
  <SectionHeadline lines={lines} len={until} from={from} out={out} italicSecond={lines.length > 1} />
);

const TagAt: React.FC<{ children: React.ReactNode; y: number; t?: number }> = ({ children, y, t = 0 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [t, t + 5], [0, 1], cl);
  const s = interpolate(f, [t, t + 5, t + 10], [0.9, 1.04, 1], cl);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${s})` }}>
      <Tag size={28}>{children}</Tag>
    </div>
  );
};

const Chip: React.FC = () => <AiChip size={26} />;

const Svg: React.FC<{ children: React.ReactNode; box?: Box }> = ({ children, box = PIC }) => (
  <svg style={{ position: "absolute", left: 0, top: 0 }} width={box.w} height={box.h}>
    {children}
  </svg>
);

/** A white line drawn on with progress p (0..1). */
const Path: React.FC<{ d: string; p: number; w?: number; o?: number; dash?: string }> = ({ d, p, w = 3, o = 1, dash }) => (
  <path
    d={d}
    fill="none"
    stroke={MARK}
    strokeWidth={w}
    opacity={o}
    pathLength={dash ? undefined : 1}
    strokeDasharray={dash ?? 1}
    strokeDashoffset={dash ? 0 : 1 - Math.max(0, Math.min(1, p))}
    strokeLinecap="round"
  />
);

/** A horizontal guide across [x0,x1] at y, growing from the left. */
const Guide: React.FC<{ x0: number; x1: number; y: number; p: number; o?: number; dash?: boolean }> = ({ x0, x1, y, p, o = 0.9, dash = true }) =>
  p <= 0 ? null : (
    <line x1={x0} y1={y} x2={x0 + (x1 - x0) * Math.min(1, p)} y2={y} stroke={MARK} strokeWidth={2.5} strokeDasharray={dash ? "12 9" : undefined} opacity={o} />
  );

/** A vertical bracket at x between y0 and y1, ticks pointing left. */
const Bracket: React.FC<{ x: number; y0: number; y1: number; p: number; o?: number; tick?: number }> = ({ x, y0, y1, p, o = 1, tick = 18 }) => (
  <Path d={`M${x - tick},${y0} H${x} V${y1} H${x - tick}`} p={p} o={o} />
);

/** corner ticks around a rect */
const cornersPath = (r: { x: number; y: number; w: number; h: number }) => {
  const k = Math.min(r.w, r.h) * 0.22;
  return [
    `M${r.x},${r.y + k}V${r.y}H${r.x + k}`,
    `M${r.x + r.w - k},${r.y}H${r.x + r.w}V${r.y + k}`,
    `M${r.x + r.w},${r.y + r.h - k}V${r.y + r.h}H${r.x + r.w - k}`,
    `M${r.x + k},${r.y + r.h}H${r.x}V${r.y + r.h - k}`,
  ].join("");
};

/** A seam that travels and dwells at each end (trio). */
const shuttle = (f: number, start: number, period: number, lo: number, hi: number) => {
  if (f < start) return hi;
  const t = ((f - start) % period) / period;
  const e = (x: number) => Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, x)));
  const k = t < 0.5 ? e((t - 0.08) / 0.34) : 1 - e((t - 0.58) / 0.34);
  return hi + (lo - hi) * k;
};

const Seam: React.FC<{ x?: number; y?: number; h?: number; w?: number }> = ({ x, y, h = PIC.h, w = PIC.w }) =>
  x !== undefined ? (
    <div style={{ position: "absolute", left: x - 1.5, top: 0, width: 3, height: h, background: MARK }} />
  ) : (
    <div style={{ position: "absolute", left: 0, top: (y ?? 0) - 1.5, width: w, height: 3, background: MARK }} />
  );

/** A big headline-face letter, the way trio's triptych sets its numerals. */
const Letter: React.FC<{ ch: string; t: number; size?: number }> = ({ ch, t, size = 150 }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [t, t + 4, t + 10], [0.5, 1.15, 1], cl);
  return (
    <div
      style={{
        fontFamily: headlineStack,
        fontSize: size,
        lineHeight: 1,
        color: "rgba(250,248,244,0.97)",
        textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        opacity: f >= t ? 1 : 0,
        transform: `scale(${f >= t ? s : 0.4})`,
        textAlign: "center",
      }}
    >
      {ch}
    </div>
  );
};

/** The record's label for a picture, under it. Empty label -> nothing. */
const RecordLabel: React.FC<{ id: string; y?: number; t?: number }> = ({ id, y = 1480, t = 6 }) => {
  const l = label(id);
  return l ? (
    <TagAt y={y} t={t}>
      {l}
    </TagAt>
  ) : null;
};

/* ── beats ───────────────────────────────────────────────────────────── */

/**
 * hook — A and B as hard cuts on the read's own stresses, then one face split
 * down its midline: fringe on the left, none on the right. The pair is
 * registered, so the seam joins one face rather than two pictures.
 */
const AbCuts: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const a = p.left!;
  const b = p.right!;
  const [la, lb] = p.labels ?? ["A", "B"];
  const c1 = wd(p.beat, 0, 3); // "look"
  const c2 = wd(p.beat, 0, 6); // "prefer"
  const split = ln(p.beat, 1);
  const solo = f < c1 ? a : f < c2 ? b : a;
  const cutAt = f < c1 ? 0 : f < c2 ? c1 : c2;
  const punch = interpolate(f, [cutAt, cutAt + 8], [1, 0], { ...cl, easing: ease });
  const Ls = frame(solo, PIC, HEAD_TOP - 60 * punch, CHIN_Y + 30 * punch);
  const L = std(a);
  const mid = X(L, lm(a).cx);
  const sx = interpolate(f, [split, split + 12], [PIC.w, mid], { ...cl, easing: ease });
  // the seam then sweeps across the face - a travelling edge, invariant BB -
  // so each half is seen as the whole face in turn
  const x = f > split + 12 ? mid + Math.sin((f - split - 12) / 7) * 200 : sx;
  return (
    <AbsoluteFill>
      {f < split ? (
        <Pic id={solo} L={Ls} />
      ) : (
        <>
          <Pic id={b} L={L} />
          <Pic id={a} L={L} clip={`inset(0 ${PIC.w - x}px 0 0)`} />
          <Seam x={x} />
          <div style={{ position: "absolute", left: 0, width: x, top: 1270 }}>
            <Letter ch={la} t={wd(p.beat, 1, 1)} />
          </div>
          <div style={{ position: "absolute", left: x, right: 0, top: 1270 }}>
            <Letter ch={lb} t={wd(p.beat, 1, 3)} />
          </div>
        </>
      )}
      <Head lines={["Which look", "do you prefer?"]} until={p.len} />
      <RecordLabel id={a} y={1500} t={split + 14} />
    </AbsoluteFill>
  );
};

/**
 * insight — the camera travels to the forehead on the line that names it, a
 * guide lands on the hairline and on the brow as each is SAID, and the bracket
 * between them is the upper third.
 */
const ForeheadSpan: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const id = p.under!;
  const m = lm(id);
  const L0 = std(id);
  // v1 pushed to 640/1060 and the face measured 0.494, past the largest face
  // in 1268 corpus frames (0.453); v2 at 660/1020 still read 0.460
  const L1 = place(id, m.hairline, 680, m.brow, 1000, PIC.w / 2);
  const tHair = wd(p.beat, 0, 6);
  const tBrow = wd(p.beat, 0, 9);
  const push = interpolate(f, [4, tHair - 4], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const L = mix(L0, L1, push);
  const x0 = Math.max(40, X(L, m.cheeks[0]) - 10);
  const x1 = Math.min(PIC.w - 150, X(L, m.cheeks[1]) + 10);
  const g = (t: number) => interpolate(f, [t, t + 14], [0, 1], { ...cl, easing: ease });
  const br = interpolate(f, [ln(p.beat, 1), ln(p.beat, 1) + 16], [0, 1], cl);
  const bx = x1 + 70;
  return (
    <AbsoluteFill>
      <Pic id={id} L={L}>
        <Svg>
          <Guide x0={x0} x1={x1} y={Y(L, m.hairline)} p={g(tHair)} />
          <Guide x0={x0} x1={x1} y={Y(L, m.brow)} p={g(tBrow)} />
          <Bracket x={bx} y0={Y(L, m.hairline)} y1={Y(L, m.brow)} p={br} />
        </Svg>
        <div style={{ position: "absolute", left: 48, top: Y(L, m.hairline) - 52, opacity: g(tHair) }}>
          <Mono size={26}>HAIRLINE</Mono>
        </div>
        <div style={{ position: "absolute", left: 48, top: Y(L, m.brow) + 14, opacity: g(tBrow) }}>
          <Mono size={26}>BROW</Mono>
        </div>
      </Pic>
      <Head lines={["Hairline", "to brow."]} until={p.len} />
      {f >= ln(p.beat, 1) && (
        <TagAt y={1480} t={wd(p.beat, 1, 6)}>
          {p.tag}
        </TagAt>
      )}
    </AbsoluteFill>
  );
};

/**
 * geometry — all four thirds guides, three brackets; the fringe falls on
 * "fringe" and the upper bracket shrinks to the forehead you can still see.
 * Then the seam shuttles: the structure brackets never move, the perceived one
 * does.
 */
const ThirdsFall: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const a = p.under!;
  const b = p.over!;
  const m = lm(a);
  const L = std(a);
  const tags = p.tags ?? [];
  const tF = wd(p.beat, 0, 2);
  const l1 = ln(p.beat, 1);
  const l2 = ln(p.beat, 2);
  const yH = Y(L, m.hairline);
  const yFr = Y(L, m.fringe);
  const rows = [m.brow, m.nose, m.chin].map((r) => Y(L, r));
  // the fringe falls from the top of frame on "fringe", then on the third line
  // the seam shuttles between bare forehead and fringe
  const fall = interpolate(f, [tF, tF + 26], [0, PIC.h], { ...cl, easing: Easing.inOut(Easing.cubic) });
  // from "Her actual bone structure hasn't changed" the fringe rises and falls:
  // the structure brackets hold still while the forehead bracket changes, which
  // is that line, drawn
  const y = f < l1 ? fall : shuttle(f, l1, 64, yH - 120, PIC.h);
  // the forehead you can SEE starts at whichever is lower: the hairline, or
  // the fringe's edge once the seam has carried the fringe past it
  const k = Math.max(0, Math.min(1, (y - yH) / Math.max(1, yFr - yH)));
  const top = yH + (yFr - yH) * k;
  const x0 = X(L, m.cheeks[0]) - 20;
  const x1 = X(L, m.cheeks[1]) + 20;
  const bx = x1 + 60;
  const g = (i: number) => interpolate(f, [2 + i * 4, 14 + i * 4], [0, 1], { ...cl, easing: ease });
  const pulse = f >= l1 && f < l2 ? 0.55 + 0.45 * Math.abs(Math.cos((f - l1) / 9)) : 1;
  const names = ["UPPER", "MIDDLE", "LOWER"];
  const spans: [number, number][] = [
    [top, rows[0]],
    [rows[0], rows[1]],
    [rows[1], rows[2]],
  ];
  return (
    <AbsoluteFill>
      <Pic id={a} L={L} />
      <Pic id={b} L={L} clip={`inset(0 0 ${PIC.h - y}px 0)`} />
      {y > 2 && y < PIC.h - 2 && <Seam y={y} />}
      <Svg>
        <Guide x0={x0} x1={x1} y={top} p={g(0)} />
        {/* the hairline the fringe hid stays as a ghost, so the loss is visible */}
        {k > 0.05 && <Guide x0={x0} x1={x1} y={yH} p={1} o={0.35 * k} />}
        {rows.map((r, i) => (
          <Guide key={i} x0={x0} x1={x1} y={r} p={g(i + 1)} />
        ))}
        {spans.map(([y0, y1], i) => (
          <Bracket key={i} x={bx} y0={y0 + 4} y1={y1 - 4} p={g(i + 1)} o={i === 0 ? 1 : pulse} />
        ))}
      </Svg>
      {spans.map(([y0, y1], i) => (
        <div key={i} style={{ position: "absolute", left: bx + 14, top: (y0 + y1) / 2 - 16, opacity: g(i + 1) * (y1 - y0 > 40 ? 1 : 0) }}>
          <Mono size={26}>{names[i]}</Mono>
        </div>
      ))}
      {f < l2 ? (
        <Head key="a" lines={["Add a", "fringe."]} until={l2} out={6} />
      ) : (
        <Head key="b" lines={["What you", "perceive."]} from={l2} until={p.len} />
      )}
      {f >= l1 && f < l2 && (
        <TagAt y={1480} t={l1}>
          {tags[0]}
        </TagAt>
      )}
      {f >= l2 && (
        <TagAt key="t2" y={1480} t={l2}>
          {tags[1]}
        </TagAt>
      )}
    </AbsoluteFill>
  );
};

/**
 * eyes — tight on the eyes, without | with, one layout for both halves. On
 * "frames" each half draws the frame its own hair gives the eyes: from the
 * hairline on the bare side, from the fringe's edge on the other.
 */
const EyeFrame: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const a = p.left!;
  const b = p.right!;
  const m = lm(a);
  // v1 at 240px/100 rows measured 0.479, v2 at 215 still 0.471 (the detector
  // does not scale linearly this tight); 190
  const L = place(a, m.eyes, 1040, m.eyes + 100, 1230, PIC.w / 2);
  const intro = interpolate(f, [0, 14], [PIC.w, PIC.w / 2], { ...cl, easing: ease });
  const x = f < 14 ? intro : shuttle(f, 14, 84, PIC.w * 0.36, PIC.w * 0.64);
  const tFr = wd(p.beat, 1, 2);
  const tAt = wd(p.beat, 1, 8);
  const draw = interpolate(f, [tFr, tFr + 16], [0, 1], { ...cl, easing: ease });
  const fx0 = X(L, m.pupils[0]) - 180;
  const fx1 = X(L, m.pupils[1]) + 180;
  const bot = Y(L, m.eyes + (m.nose - m.eyes) * 0.45);
  const bare = { x: fx0, y: Y(L, m.hairline), w: fx1 - fx0, h: bot - Y(L, m.hairline) };
  const framed = { x: fx0, y: Y(L, m.fringe), w: fx1 - fx0, h: bot - Y(L, m.fringe) };
  const ring = interpolate(f, [tAt, tAt + 10], [0, 1], cl);
  const [la, lb] = p.labels ?? ["", ""];
  const rings = (
    <>
      {m.pupils.map((px, i) => (
        <circle key={i} cx={X(L, px)} cy={Y(L, m.eyes)} r={46 + 20 * (1 - ring)} fill="none" stroke={MARK} strokeWidth={2.5} opacity={ring} />
      ))}
    </>
  );
  return (
    <AbsoluteFill>
      <Pic id={a} L={L}>
        <Svg>
          <Path d={cornersPath(bare)} p={draw} />
          {rings}
        </Svg>
      </Pic>
      <Pic id={b} L={L} clip={`inset(0 0 0 ${x}px)`}>
        <Svg>
          <Path d={cornersPath(framed)} p={draw} />
          {rings}
        </Svg>
      </Pic>
      <Seam x={x} />
      <Head lines={["Same eyes.", "Different frame."]} until={p.len} />
      <div style={{ position: "absolute", left: 40, top: 1420, opacity: x > 300 ? 1 : 0 }}>
        <Tag size={28}>{la}</Tag>
      </div>
      <div style={{ position: "absolute", right: 40, top: 1420, opacity: x < PIC.w - 300 ? 1 : 0 }}>
        <Tag size={28}>{lb}</Tag>
      </div>
    </AbsoluteFill>
  );
};

/** Two columns, face-and-shoulders, cut at the column edges. */
const COL_W = 524;
const COL_GAP = 8;
const COLS_X = (PIC.w - (2 * COL_W + COL_GAP)) / 2;
const COL: Box = { w: COL_W, h: 900 };
const COL_TOP = 440;
const colLayout = (id: string) => frame(id, COL, 70, 640, COL_W / 2);

/**
 * lesson — the same fringe on two faces cast as opposite upper thirds. On
 * "not just the hair" the fringe lifts off both; on the relationship line each
 * named part is drawn on both faces AS IT IS SAID, so the two upper thirds sit
 * side by side and visibly disagree.
 */
const TwoFaces: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const fr = p.steps ?? [];
  const bare = p.tags ?? [];
  const l1 = ln(p.beat, 1);
  const l2 = ln(p.beat, 2);
  const tFore = wd(p.beat, 2, 5);
  const tEyes = wd(p.beat, 2, 6);
  const tBrow = wd(p.beat, 2, 7);
  const tRest = wd(p.beat, 2, 10);
  const g = (t: number) => interpolate(f, [t, t + 12], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill>
      {f < l2 ? (
        <Head key="a" lines={["Same haircut.", "Two faces."]} until={l2} out={6} />
      ) : (
        <Head key="b" lines={["Facial harmony", "is personal."]} from={l2} until={p.len} />
      )}
      {fr.map((fid, i) => {
        const bid = bare[i];
        const m = lm(bid);
        const L = colLayout(bid);
        const t0 = 2 + i * 4;
        const rise = interpolate(f, [t0, t0 + 14], [140, 0], { ...cl, easing: ease });
        // starts visible: v1 faded in from 0 and its first frames were bare stage
        const o = interpolate(f, [t0 - 6, t0 + 4], [0.6, 1], cl);
        // the fringe lifts: bare face shows ABOVE the seam. Once each part has
        // been drawn, the same fringe drops back over both foreheads and lifts
        // again, so one cut is seen landing on a tall and a short upper third.
        const lift = interpolate(f, [l1 + 4 + i * 5, l1 + 26 + i * 5], [0, COL.h], { ...cl, easing: Easing.inOut(Easing.cubic) });
        // v2 started this after the LAST part was named, ~15 frames before the
        // cut, and the beat measured 9% moving. It now starts as soon as the
        // lift has finished, so the parts are drawn while the fringe comes and goes.
        const back = l1 + 32 + i * 5;
        const y = f < back ? lift : shuttle(f, back + i * 6, 58, 0, COL.h);
        const x0 = X(L, m.cheeks[0]) - 6;
        const x1 = X(L, m.cheeks[1]) + 6;
        const bx = Math.max(24, X(L, m.cheeks[0]) - 34);
        return (
          <div key={fid} style={{ position: "absolute", left: COLS_X + i * (COL_W + COL_GAP), top: COL_TOP, width: COL_W, height: COL.h, opacity: o, transform: `translateY(${rise}px)` }}>
            <Pic id={fid} L={L} box={COL} />
            <Pic id={bid} L={L} box={COL} clip={`inset(0 0 ${COL.h - y}px 0)`} />
            {y > 2 && y < COL.h - 2 && <Seam y={y} w={COL_W} />}
            <Svg box={COL}>
              {/* forehead: the upper third, bracketed down the face's left edge */}
              <Bracket x={bx + 18} y0={Y(L, m.hairline)} y1={Y(L, m.brow)} p={g(tFore)} tick={-18} />
              <Guide x0={x0} x1={x1} y={Y(L, m.hairline)} p={g(tFore)} />
              {/* eyes: the pupils and the span between them */}
              <g opacity={g(tEyes)}>
                {m.pupils.map((px, k) => (
                  <circle key={k} cx={X(L, px)} cy={Y(L, m.eyes)} r={6} fill={MARK} />
                ))}
                <line x1={X(L, m.pupils[0])} y1={Y(L, m.eyes)} x2={X(L, m.pupils[0]) + (X(L, m.pupils[1]) - X(L, m.pupils[0])) * g(tEyes)} y2={Y(L, m.eyes)} stroke={MARK} strokeWidth={2} />
              </g>
              {/* brows */}
              <Guide x0={x0} x1={x1} y={Y(L, m.brow)} p={g(tBrow)} dash={false} o={0.95} />
              {/* the rest of the face: nose base and chin */}
              <Guide x0={x0} x1={x1} y={Y(L, m.nose)} p={g(tRest)} />
              <Guide x0={x0} x1={x1} y={Y(L, m.chin)} p={g(tRest + 4)} />
            </Svg>
            {f < l1 && (
              <div style={{ position: "absolute", top: COL.h + 22, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <Mono size={26}>{label(fid)}</Mono>
              </div>
            )}
            {f >= tFore && (
              <div style={{ position: "absolute", top: COL.h + 22, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: g(tFore) }}>
                <Mono size={26}>{i === 0 ? "TALL UPPER THIRD" : "SHORT UPPER THIRD"}</Mono>
              </div>
            )}
          </div>
        );
      })}
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/**
 * back — Anne again. A on "Bangs", B on "no bangs", then the split holds through
 * the read's own 1.4s pause so the viewer can choose.
 */
const VoteAB: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const [a, b] = p.steps ?? [];
  const [la, lb] = p.labels ?? ["A", "B"];
  const tA = wd(p.beat, 1, 0);
  const tB = wd(p.beat, 1, 3);
  const split = tB + 16;
  const solo = f < tA ? b : f < tB ? a : b;
  const cutAt = f < tA ? 0 : f < tB ? tA : tB;
  const punch = interpolate(f, [cutAt, cutAt + 8], [1, 0], { ...cl, easing: ease });
  const Ls = frame(solo, PIC, HEAD_TOP - 50 * punch, CHIN_Y + 25 * punch);
  // two halves, each its own whole face side by side, not the hook's one-face seam
  const W = PIC.w / 2;
  const half = (id: string) => frame(id, { w: W, h: PIC.h }, 520, 1150, W / 2);
  const slide = interpolate(f, [split, split + 12], [W, 0], { ...cl, easing: ease });
  return (
    <AbsoluteFill>
      {f < split ? (
        <>
          <Pic id={solo} L={Ls} />
          {f >= tA && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 1270 }}>
              <Letter key={solo} ch={solo === a ? la : lb} t={cutAt} size={170} />
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: -slide, top: 0, width: W, height: PIC.h, overflow: "hidden" }}>
            <Pic id={a} L={half(a)} box={{ w: W, h: PIC.h }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 1240 }}>
              <Letter ch={la} t={split} />
            </div>
          </div>
          <div style={{ position: "absolute", left: W + slide, top: 0, width: W, height: PIC.h, overflow: "hidden" }}>
            <Pic id={b} L={half(b)} box={{ w: W, h: PIC.h }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 1240 }}>
              <Letter ch={lb} t={split + 4} />
            </div>
          </div>
          <Seam x={W} />
          <TagAt y={1500} t={split + 10}>
            COMMENT A OR B
          </TagAt>
        </>
      )}
      {f < ln(p.beat, 1) ? (
        <Head key="a" lines={["Now look", "again."]} until={ln(p.beat, 1)} out={4} />
      ) : (
        <Head key="b" lines={["A or B?"]} from={ln(p.beat, 1)} until={p.len + 4} />
      )}
    </AbsoluteFill>
  );
};

/** reveal — Rachel's real Dossier, recorded, in a phone; a screen per line. */
const CLIP_FRAMES: Record<string, number> = { mesh: 84, features: 141, hair: 81, hair_color: 78 };
const DossierPhone: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const clips = p.steps ?? [];
  // mesh on line 0, the features on line 1, hairstyles on line 2, hair colour on "previews"
  const cuts = [0, ln(p.beat, 1), ln(p.beat, 2), wd(p.beat, 2, 6)];
  const phoneW = 560;
  const phoneH = Math.round((phoneW * 1920) / 1080);
  const px = (PIC.w - phoneW) / 2;
  const py = 440;
  const rise = interpolate(f, [0, 14], [260, 0], { ...cl, easing: ease });
  return (
    <AbsoluteFill>
      <Head lines={["Your face,", "mapped."]} until={p.len} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${rise}px)` }}>
        <div style={{ position: "absolute", left: px - 14, top: py - 14, width: phoneW + 28, height: phoneH + 28, borderRadius: 78, background: INK, boxShadow: "0 40px 80px rgba(20,32,36,0.3)" }} />
        <div style={{ position: "absolute", left: px, top: py, width: phoneW, height: phoneH, borderRadius: 64, overflow: "hidden", background: "#FBF9F6" }}>
          {clips.map((c, i) => {
            const t0 = cuts[i];
            const t1 = i + 1 < cuts.length ? cuts[i + 1] : p.len + TAIL;
            const from = i === 0 ? 0 : t0 - 9;
            const need = t1 + 6 - from;
            const rate = Math.min(1, CLIP_FRAMES[c] / need);
            const xin = i === 0 ? 0 : interpolate(f, [t0 - 9, t0 + 5], [phoneW, 0], { ...cl, easing: ease });
            const xout = interpolate(f, [t1 - 9, t1 + 5], [0, -phoneW * 0.35], { ...cl, easing: ease });
            return (
              <Sequence key={c} from={from} durationInFrames={Math.max(1, need)} layout="none">
                <div style={{ position: "absolute", left: 0, top: 0, width: phoneW, height: phoneH, transform: `translateX(${xin + xout}px)` }}>
                  <OffthreadVideo src={staticFile(`dossier-rachel/${c}.mp4`)} muted playbackRate={rate} style={{ width: phoneW, height: phoneH }} />
                </div>
              </Sequence>
            );
          })}
        </div>
      </div>
      <TagAt y={1500} t={8}>
        {p.tag}
      </TagAt>
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** end — the house ending: type over the stage into a typing search bar. */
const SearchEnd: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const locked = p.steps ?? [];
  const start = 10;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {locked.map((t, i) => {
          const t0 = i * 10;
          const lo = interpolate(f, [t0, t0 + 12], [0, 1], cl);
          const y = interpolate(f, [t0, t0 + 16], [18, 0], { ...cl, easing: ease });
          const b = interpolate(f, [t0, t0 + 12], [8, 0], cl);
          return (
            <div key={t} style={{ opacity: lo, transform: `translateY(${y}px)`, filter: `blur(${b}px)`, fontFamily: headlineStack, fontStyle: i === 1 ? "italic" : "normal", fontSize: 76, color: "#fff", textAlign: "center" }}>
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center", opacity: interpolate(f, [start, start + 10], [0, 1], cl) }}>
        <Tag size={26}>GET YOUR FACIAL DOSSIER</Tag>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center" }}>
        <TypewriterInput text={p.caption ?? ""} startFrame={start + 6} width={700} fontSize={38} />
      </div>
      <AiChip y={430} size={26} />
    </AbsoluteFill>
  );
};

const COMPOSITIONS: Record<string, React.FC<BeatArgs>> = {
  "ab-cuts": AbCuts,
  "forehead-span": ForeheadSpan,
  "thirds-fall": ThirdsFall,
  "eye-frame": EyeFrame,
  "two-faces": TwoFaces,
  "vote-ab": VoteAB,
  "dossier-phone": DossierPhone,
  "search-end": SearchEnd,
};

/* ── sound: trio's set, cues off the same word table ─────────────────── */

const ONSET: Record<string, number> = {
  "swoosh-thin": 0.37,
  "air-whoosh-8": 0.19,
  "air-whoosh-5": 0.23,
  "light-whoosh": 0.12,
  "swoosh-fast": 0.3,
  "tap-soft": 0,
  "click-soft": 0,
  "click-interface": 0.02,
  shutter: 0.6,
  "pop-minimal": 0.14,
  "notify-soft": 0.12,
  "boom-soft": 0,
};
const Fx: React.FC<{ n: string; at: number; v?: number; dur?: number }> = ({ n, at: t, v = 0.28, dur = 30 }) => {
  const start = Math.max(0, Math.round(t - (ONSET[n] ?? 0) * FPS));
  return (
    <Sequence from={start} durationInFrames={dur} layout="none">
      <Audio src={staticFile(`sfx/trio/${n}.mp3`)} volume={(fr) => v * interpolate(fr, [dur - 8, dur - 1], [1, 0], cl)} />
    </Sequence>
  );
};

const SfxTrack: React.FC = () => (
  <>
    {/* hook — (the opening shutter is in <Opening>), a shutter on each A/B
        cut, the seam slides in, a pop per letter */}
    <Fx n="shutter" at={wdAbs("hook", 0, 3)} v={0.9} dur={36} />
    <Fx n="shutter" at={wdAbs("hook", 0, 6)} v={0.9} dur={36} />
    <Fx n="swoosh-thin" at={line("hook", 1) + 6} v={0.24} dur={34} />
    <Fx n="pop-minimal" at={wdAbs("hook", 1, 1)} v={0.3} dur={24} />
    <Fx n="pop-minimal" at={wdAbs("hook", 1, 3)} v={0.3} dur={24} />
    {/* insight — the push, a tap per guide, a click for the bracket */}
    <Fx n="air-whoosh-8" at={bf("insight", 6)} v={0.26} dur={40} />
    <Fx n="tap-soft" at={wdAbs("insight", 0, 6)} v={0.24} dur={18} />
    <Fx n="tap-soft" at={wdAbs("insight", 0, 9)} v={0.24} dur={18} />
    <Fx n="click-interface" at={line("insight", 1)} v={0.22} dur={20} />
    <Fx n="click-soft" at={wdAbs("insight", 1, 6)} v={0.45} dur={14} />
    {/* geometry — four guides, the fringe falls, the shuttle */}
    {[0, 1, 2, 3].map((i) => (
      <Fx key={i} n="tap-soft" at={bf("geometry", 2 + i * 4)} v={0.2} dur={18} />
    ))}
    <Fx n="swoosh-fast" at={wdAbs("geometry", 0, 2) + 8} v={0.28} dur={34} />
    <Fx n="click-interface" at={line("geometry", 1)} v={0.2} dur={20} />
    <Fx n="air-whoosh-5" at={line("geometry", 2) + 6} v={0.26} dur={40} />
    {/* eyes — the seam, the frames, the rings */}
    <Fx n="light-whoosh" at={bf("eyes", 2)} v={0.22} dur={28} />
    <Fx n="click-soft" at={wdAbs("eyes", 1, 2)} v={0.45} dur={14} />
    <Fx n="pop-minimal" at={wdAbs("eyes", 1, 8)} v={0.26} dur={24} />
    {/* lesson — columns rise, the fringe lifts, a tap per part as it is named */}
    <Fx n="swoosh-thin" at={bf("lesson", 4)} v={0.24} dur={34} />
    <Fx n="swoosh-fast" at={line("lesson", 1) + 12} v={0.26} dur={34} />
    {[5, 6, 7, 10].map((w) => (
      <Fx key={w} n="tap-soft" at={wdAbs("lesson", 2, w)} v={0.24} dur={18} />
    ))}
    {/* back — a shutter per cut, the split */}
    <Fx n="shutter" at={wdAbs("back", 1, 0)} v={0.9} dur={36} />
    <Fx n="shutter" at={wdAbs("back", 1, 3)} v={0.9} dur={36} />
    <Fx n="swoosh-thin" at={wdAbs("back", 1, 3) + 16} v={0.24} dur={34} />
    {/* reveal — the gentle accent as the product arrives, a slide per screen */}
    <Fx n="boom-soft" at={bf("reveal", 2)} v={0.22} dur={70} />
    <Fx n="swoosh-thin" at={line("reveal", 1)} v={0.22} dur={34} />
    <Fx n="swoosh-thin" at={line("reveal", 2)} v={0.22} dur={34} />
    <Fx n="swoosh-thin" at={wdAbs("reveal", 2, 6)} v={0.22} dur={34} />
    {/* end — a chime as the search bar starts typing */}
    <Fx n="notify-soft" at={bf("end", 16)} v={0.24} dur={40} />
  </>
);

/* ── the opening ─────────────────────────────────────────────────────── */

/**
 * The reel opens on a camera shutter and a very subtle flash (Rahul,
 * 2026-10-29). adopt-vo-bangs.py puts a 0.4s lead in front of the read so the
 * shutter lands BEFORE the first word; this fills those frames with the hook's
 * own first picture, already punched in, so the hook Sequence picks it up with
 * no jump.
 *
 * The shutter file's hit sits 0.6s in (ONSET), so it is TRIMMED, not delayed:
 * delaying would push the hit 18 frames past the flash.
 */
const FLASH_PEAK = 0.26;
const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const first = bf("hook");
  const a = SHOTS[0].props.left as string;
  const flash = interpolate(f, [0, 1, 10], [0, FLASH_PEAK, 0], { ...cl, easing: Easing.out(Easing.quad) });
  return (
    <>
      {f < first && <Pic id={a} L={frame(a, PIC, HEAD_TOP - 60, CHIN_Y + 30)} />}
      <Sequence durationInFrames={30} layout="none">
        <Audio src={staticFile("sfx/trio/shutter.mp3")} trimBefore={Math.round(ONSET.shutter * FPS) - 1} volume={0.9} />
      </Sequence>
      {flash > 0.001 && <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />}
    </>
  );
};

/* ── the reel ────────────────────────────────────────────────────────── */

const Bangs: React.FC = () => (
  <Stage>
    <Audio src={staticFile("voiceover-bangs.mp3")} />
    <SfxTrack />
    {SHOTS.map((s) => {
      const Beat = COMPOSITIONS[s.composition];
      const name = s.name as BeatName;
      const last = s.name === SHOTS[SHOTS.length - 1].name;
      const span = at(name);
      return (
        <Sequence key={s.name} from={span.from} durationInFrames={span.durationInFrames + (last ? TAIL : 0)}>
          <Beat {...(s.props as BeatProps)} len={len(name)} beat={name} />
        </Sequence>
      );
    })}
    <BangsCaptions />
    <Opening />
  </Stage>
);

export const RefinaBangs: React.FC = () => (
  <Composition id="RefinaBangs" component={Bangs} durationInFrames={TOTAL + TAIL} fps={FPS} width={1080} height={1920} />
);
