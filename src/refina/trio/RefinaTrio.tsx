import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Img,
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
import { TrioCaptions } from "./captions";
import { B, TOTAL, bf, len, line } from "./beats";
import type { BeatName } from "./beats";
import { SHOTS } from "./shots";
import type { BeatProps } from "./shots";
import { WORD_CUES } from "./words-vo";
import { FEATURE, JAW_LINE, THIRDS, fit, frame, pt, rec, toBox } from "./geometry";
import type { Box, Layout } from "./geometry";

/**
 * "One Face, Three Impressions" — RefinaTrio.
 *
 * Rahul's QOVES-style brief of 2026-10-23 (text_to_pdf_Imagetotext.pdf): one
 * woman, three versions — the original, a structural change (facelift) and a
 * feature refinement — walked through feature by feature, then side by side
 * for the viewer to vote on, then the Dossier as the payoff.
 *
 * FRAMED LIKE refina-size-v5, ON RAHUL'S CALL. v1 drew its own editorial
 * layout (dark gradients, a caption band, panels) and he rejected it for not
 * looking like the reel the skill exists to reproduce. So: ONE head-and-
 * shoulders frame (hair top y340, chin y1235, picture cut flat at y1650),
 * blended into a stage that IS the portraits' repainted backdrop; a small
 * centred serif headline in the air above the head; dark mono tags; italic
 * captions straight on the stage. Wide only comes from compositions that are
 * not one portrait — the triptych, the vote, the phone — as in size-v5.
 * v1 is kept at gen/out/trio1/RefinaTrio-v1.tsx.txt.
 *
 * v3: THE HOUSE TREATMENT, NOT THE PDF'S PALETTE. v2 kept the brief's muted
 * ivory / charcoal / soft grey and drew its own headline, caption and logo end
 * card, and Rahul rejected it outright: "that wasn't what we have been
 * building". A brief's palette note does not override the treatment every
 * Refina reel shares. So, as RefinaSize and RefinaNose: flat stage sage
 * (`Stage`), the three portraits repainted to that exact sage by gen/sage.py
 * (plus a pass on the generator's blue-grey sweep trapped inside the refined
 * version's loose hair), white `SectionHeadline` that blurs in word by word
 * with an italic second line, the house white italic captions, `AiChip` at
 * 26, and the typing search bar as the ending — never a logo lockup
 * (non-negotiable 6). v2 is kept at gen/out/trio1/RefinaTrio-v2.tsx.txt.
 *
 * FAST, BUT NOTHING CREEPS (rule P). Something arrives on every line — a cut, a
 * seam, a mark, a tag — and every arrival has a sound. No slow zoom was added
 * to move a frozen number; the one push-in is the brief's own, on the peak.
 *
 * EVERY MARK ON A FACE IS COMPUTED BY THE SAME LAYOUT THAT PLACED THE PICTURE
 * (geometry.ts, invariant S). No frame number is typed.
 */

const FPS = 30;
const TAIL = 45;

/* ── palette: the house one ──────────────────────────────────────────── */
/** marks on a photograph are white, as every sage reel draws them */
const MARK = "rgba(255,255,255,0.95)";
/** dark ink only for the phone bezel */
const INK = "#1C2629";

/** the picture is cut flat here, as in size-v5; captions live below it */
const PIC: Box = { w: 1080, h: 1650 };
/**
 * size-v5's head-and-shoulders frame, set 60px lower than v2's: the house
 * headline is two lines at 70px from 12% of frame, and at 340 its italic line
 * sat on her grey hair, white on near-white.
 */
const HEAD_TOP = 400;
const CHIN_Y = 1280;

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const at = (k: BeatName) => ({ from: B[k][0], durationInFrames: B[k][1] - B[k][0] });
type BeatArgs = BeatProps & { len: number; beat: BeatName };
/** frame of line n within the beat, LOCAL to its Sequence */
const ln = (k: BeatName, n: number) => line(k, n) - bf(k);

const std = (id: string) => frame(id, PIC, HEAD_TOP, CHIN_Y);

/* ── primitives ──────────────────────────────────────────────────────── */

const Pic: React.FC<{
  id: string;
  L: Layout;
  box?: Box;
  left?: number;
  top?: number;
  clip?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ id, L, box = PIC, left = 0, top = 0, clip, style, children }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width: box.w,
      height: box.h,
      overflow: "hidden",
      clipPath: clip,
      ...style,
    }}
  >
    <Img
      src={staticFile(`portraits/${rec(id).file}`)}
      style={{ position: "absolute", left: L.x, top: L.y, width: L.w, height: L.h, maxWidth: "none" }}
    />
    {children}
  </div>
);

/**
 * The house headline — `SectionHeadline`, the one RefinaSize and RefinaNose
 * carry: white Instrument Serif at 70, blurred in word by word, a second line
 * in the family's own italic, blurred out at `until`. Beat-local frames.
 */
const Head: React.FC<{ lines: string[]; from?: number; until: number; out?: number }> = ({
  lines,
  from = 2,
  until,
  out = 10,
}) => <SectionHeadline lines={lines} len={until} from={from} out={out} italicSecond={lines.length > 1} />;

/** A dark mono tag centred at `y`, popping in at `t`. */
const TagAt: React.FC<{ children: React.ReactNode; y: number; t?: number }> = ({ children, y, t = 0 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [t, t + 5], [0, 1], cl);
  const s = interpolate(f, [t, t + 5, t + 10], [0.9, 1.04, 1], cl);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `scale(${s})`,
      }}
    >
      <Tag size={28}>{children}</Tag>
    </div>
  );
};

/** the house compliance chip, at 26 — 12 is a smudge on a phone */
const Chip: React.FC = () => <AiChip size={26} />;

/** An ivory line drawn on over the layout of its picture. */
const Path: React.FC<{ d: string; p: number; w?: number; o?: number; dash?: string }> = ({
  d,
  p,
  w = 3,
  o = 1,
  dash,
}) => (
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

const Svg: React.FC<{ children: React.ReactNode; box?: Box }> = ({ children, box = PIC }) => (
  <svg style={{ position: "absolute", left: 0, top: 0 }} width={box.w} height={box.h}>
    {children}
  </svg>
);

const jawPath = (id: string, L: Layout) => {
  const p = JAW_LINE.map(([x, y]) => pt(id, x, y, L));
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2;
    const my = (p[i][1] + p[i + 1][1]) / 2;
    d += ` Q${p[i][0]},${p[i][1]} ${mx},${my}`;
  }
  const z = p[p.length - 1];
  return d + ` L${z[0]},${z[1]}`;
};

/** corner ticks around a rect */
const cornersPath = (r: { x: number; y: number; w: number; h: number }) => {
  const k = Math.min(r.w, r.h) * 0.24;
  return [
    `M${r.x},${r.y + k}V${r.y}H${r.x + k}`,
    `M${r.x + r.w - k},${r.y}H${r.x + r.w}V${r.y + k}`,
    `M${r.x + r.w},${r.y + r.h - k}V${r.y + r.h}H${r.x + r.w - k}`,
    `M${r.x + k},${r.y + r.h}H${r.x}V${r.y + r.h - k}`,
  ].join("");
};

/** A seam that travels and dwells at each end. */
const shuttle = (f: number, start: number, period: number, lo: number, hi: number) => {
  if (f < start) return hi;
  const t = ((f - start) % period) / period;
  const e = (x: number) => Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, x)));
  const k = t < 0.5 ? e((t - 0.08) / 0.34) : 1 - e((t - 0.58) / 0.34);
  return hi + (lo - hi) * k;
};

const Seam: React.FC<{ x?: number; y?: number }> = ({ x, y }) =>
  x !== undefined ? (
    <div style={{ position: "absolute", left: x - 1.5, top: 0, width: 3, height: PIC.h, background: MARK }} />
  ) : (
    <div style={{ position: "absolute", left: 0, top: (y ?? 0) - 1.5, width: PIC.w, height: 3, background: MARK }} />
  );

/* ── beats ───────────────────────────────────────────────────────────── */

/** hook — hard cuts between the versions, then one face in three slices. */
const TriSplit: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const ids = p.steps ?? [];
  const l1 = ln(p.beat, 1);
  const l2 = ln(p.beat, 2);
  // "Same face." — two hard cuts inside the line
  const mid = l1 + Math.round((l2 - l1) / 2);
  const solo = f < l1 ? 0 : f < mid ? 1 : 2;
  // a short punch-in on every cut, settling in 8 frames
  const cutAt = f < l1 ? 0 : f < mid ? l1 : mid;
  const punch = interpolate(f, [cutAt, cutAt + 8], [1, 0], { ...cl, easing: ease });
  const Ls = frame(ids[solo], PIC, HEAD_TOP - 60 * punch, CHIN_Y + 30 * punch);
  // "So why do these three versions…" — two seams slide in, then breathe
  const a = interpolate(f, [l2, l2 + 12], [PIC.w, PIC.w / 3], { ...cl, easing: ease });
  const b = interpolate(f, [l2 + 5, l2 + 17], [PIC.w, (2 * PIC.w) / 3], { ...cl, easing: ease });
  const wob = f > l2 + 17 ? Math.sin((f - l2 - 17) / 9) * 26 : 0;
  const s1 = a - wob;
  const s2 = b + wob;
  return (
    <AbsoluteFill>
      {f < l2 ? (
        <Pic id={ids[solo]} L={Ls} />
      ) : (
        <>
          <Pic id={ids[0]} L={std(ids[0])} />
          <Pic id={ids[1]} L={std(ids[1])} clip={`inset(0 0 0 ${s1}px)`} />
          <Pic id={ids[2]} L={std(ids[2])} clip={`inset(0 0 0 ${s2}px)`} />
          <Seam x={s1} />
          <Seam x={s2} />
          {[0, 1, 2].map((i) => {
            const x0 = i === 0 ? 0 : i === 1 ? s1 : s2;
            const x1 = i === 0 ? s1 : i === 1 ? s2 : PIC.w;
            return (
              <div
                key={i}
                style={{ position: "absolute", left: x0, width: x1 - x0, top: 1440, display: "flex", justifyContent: "center", opacity: x1 - x0 > 160 ? 1 : 0 }}
              >
                <Tag size={28}>{`0${i + 1}`}</Tag>
              </div>
            );
          })}
        </>
      )}
      {f < l1 && <Head lines={["Same woman."]} until={l1} out={4} />}
      {f >= l1 && f < l2 && <Head lines={["Same face."]} from={l1} until={l2} out={4} />}
      {f >= l2 && <Head lines={["One face,", "three impressions."]} from={l2} until={p.len} />}
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** setup — the same face, with structure, proportions and details marked in. */
const LandmarkTrace: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const id = p.under!;
  const L = std(id);
  const tags = p.tags ?? [];
  const on = [0, 1, 2, 3].map((n) => ln(p.beat, n));
  const pr = (k: number) => interpolate(f, [on[k], on[k] + 14], [0, 1], { ...cl, easing: ease });
  const rows = THIRDS.map((fy) => pt(id, 0, fy, L)[1]);
  const [mx] = pt(id, 0, 0, L);
  const fx0 = pt(id, -0.5, 0, L)[0];
  const fx1 = pt(id, 0.5, 0, L)[0];
  const dots = (["BROWS", "EYES", "NOSE", "LIPS"] as const).map((k) => toBox(id, FEATURE[k], L));
  const k = on.filter((t) => f >= t - 2).length - 1;
  return (
    <AbsoluteFill>
      <Pic id={id} L={L}>
        <Svg>
          {/* line 0: the midline — one face */}
          <Path d={`M${mx},${rows[0]} L${mx},${rows[3]}`} p={pr(0)} w={2} o={0.8} />
          {/* line 1: structure — the outline of the lower face */}
          <Path d={jawPath(id, L)} p={pr(1)} />
          {/* line 2: proportions — the thirds */}
          {rows.map((y, i) => (
            <Path key={i} d={`M${fx0},${y} L${fx0 + (fx1 - fx0) * pr(2)},${y}`} p={1} w={2} dash="10 8" />
          ))}
          {/* line 3: details — one ring per feature */}
          {dots.map((r, i) => {
            const o = interpolate(f, [on[3] + i * 3, on[3] + i * 3 + 6], [0, 1], cl);
            const cx = r.x + r.w / 2;
            const cy = r.y + r.h / 2;
            return (
              <g key={i} opacity={o}>
                <circle cx={cx} cy={cy} r={7} fill={MARK} />
                <circle cx={cx} cy={cy} r={20 + 8 * (1 - o)} fill="none" stroke={MARK} strokeWidth={2} />
              </g>
            );
          })}
        </Svg>
      </Pic>
      <Head lines={["What actually", "changes?"]} until={p.len} />
      {k >= 0 && (
        <TagAt key={k} y={1480} t={on[k]}>
          {tags[k]}
        </TagAt>
      )}
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** structure — close on the lower face, original | facelift, the seam travels. */
const JawSeam: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const a = p.under!;
  const b = p.over!;
  // closer than the house frame: the brief's subject is the jawline
  const La = frame(a, PIC, -260, 1400);
  const Lb = frame(b, PIC, -260, 1400);
  const intro = interpolate(f, [0, 14], [PIC.w, PIC.w / 2], { ...cl, easing: ease });
  const x = f < 14 ? intro : shuttle(f, 14, 72, PIC.w * 0.2, PIC.w * 0.8);
  const draw = interpolate(f, [ln(p.beat, 1), ln(p.beat, 1) + 18], [0, 1], cl);
  const [l0, l1] = p.labels ?? ["", ""];
  return (
    <AbsoluteFill>
      <Pic id={a} L={La}>
        <Svg>
          <Path d={jawPath(a, La)} p={draw} o={0.75} />
        </Svg>
      </Pic>
      <Pic id={b} L={Lb} clip={`inset(0 ${PIC.w - x}px 0 0)`}>
        <Svg>
          <Path d={jawPath(b, Lb)} p={draw} />
        </Svg>
      </Pic>
      <Seam x={x} />
      {f < ln(p.beat, 2) ? (
        <Head key="a" lines={["Version two,", "the facelift."]} until={ln(p.beat, 2)} out={6} />
      ) : (
        <Head key="b" lines={["The change", "is structural."]} from={ln(p.beat, 2)} until={p.len} />
      )}
      <TagAt y={1400} t={6}>
        {p.tag}
      </TagAt>
      <div style={{ position: "absolute", left: 40, top: 1490, opacity: x > 300 ? 1 : 0 }}>
        <Tag size={28}>{l1}</Tag>
      </div>
      <div style={{ position: "absolute", right: 40, top: 1490, opacity: x < PIC.w - 300 ? 1 : 0 }}>
        <Tag size={28}>{l0}</Tag>
      </div>
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** pivot — the original wipes down into the refined version. */
const WipeDown: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const a = p.under!;
  const b = p.over!;
  const y = interpolate(f, [4, Math.max(20, p.len - 10)], [0, PIC.h], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Pic id={a} L={std(a)} />
      <Pic id={b} L={std(b)} clip={`inset(0 0 ${PIC.h - y}px 0)`} />
      <Seam y={y} />
      <Head lines={["Now,", "the features."]} until={p.len} />
      <TagAt y={1480} t={6}>
        {p.tag}
      </TagAt>
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** features — six close-ups, original | refined on one crop, a cut per line. */
const FeatureSplit: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const steps = p.steps ?? [];
  const a = p.left!;
  const b = p.right!;
  const starts = steps.map((_, i) => ln(p.beat, i));
  let k = 0;
  for (let i = 0; i < starts.length; i++) if (f >= starts[i] - 2) k = i;
  const s0 = starts[k] - 2;
  const s1 = k + 1 < starts.length ? starts[k + 1] - 2 : p.len;
  const name = steps[k];
  const fr = FEATURE[name];
  const fill = ({ BROWS: 0.84, EYES: 0.84, NOSE: 0.5, LIPS: 0.62, SKIN: 0.56, HAIR: 0.98 } as Record<string, number>)[name] ?? 0.8;
  // one layout for both halves — the crop is matched by construction
  const z = interpolate(f, [s0, s0 + 10], [1.08, 1], { ...cl, easing: ease });
  const L = fit(a, fr, PIC, fill, z);
  const r = toBox(a, fr, L);
  // the seam sweeps in from the right on each cut, then drifts either side of centre
  const sweep = interpolate(f, [s0, s0 + 9], [PIC.w, PIC.w / 2], { ...cl, easing: ease });
  const x = f < s0 + 9 ? sweep : PIC.w / 2 + Math.sin(((f - s0 - 9) / Math.max(12, s1 - s0)) * Math.PI) * 120;
  const pin = interpolate(f, [s0 + 2, s0 + 10], [0, 1], cl);
  const [la, lb] = p.labels ?? ["", ""];
  return (
    <AbsoluteFill>
      <Pic id={a} L={L} />
      <Pic id={b} L={L} clip={`inset(0 0 0 ${x}px)`} />
      <Seam x={x} />
      <Svg>
        <Path d={cornersPath(r)} p={1} o={pin} />
      </Svg>
      {/* the walk: BROWS → EYES → … with the current step lit */}
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 10 }}>
        {steps.map((s, i) => (
          <Tag key={s} size={26} tone={i === k ? "live" : "plain"} dim={i !== k}>
            {s}
          </Tag>
        ))}
      </div>
      <TagAt key={k} y={1480} t={s0 + 2}>{`0${k + 1} · ${name}`}</TagAt>
      <div style={{ position: "absolute", left: 40, top: 1390, opacity: x > 280 ? 1 : 0 }}>
        <Tag size={26} dim>
          {la}
        </Tag>
      </div>
      <div style={{ position: "absolute", right: 40, top: 1390, opacity: x < PIC.w - 280 ? 1 : 0 }}>
        <Tag size={26} dim>
          {lb}
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

/** together — every region marked at once on the refined face. */
const FeatureMap: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const id = p.under!;
  const L = std(id);
  const steps = p.steps ?? [];
  const link = interpolate(f, [ln(p.beat, 1), ln(p.beat, 1) + 16], [0, 1], cl);
  const rs = steps.map((s) => toBox(id, FEATURE[s], L));
  const c = (r: { x: number; y: number; w: number; h: number }) => [r.x + r.w / 2, r.y + r.h / 2];
  return (
    <AbsoluteFill>
      <Pic id={id} L={L}>
        <Svg>
          {rs.map((r, i) => {
            const o = interpolate(f, [3 + i * 3, 8 + i * 3], [0, 1], cl);
            return <Path key={i} d={cornersPath(r)} p={1} o={o} />;
          })}
          {rs.slice(1).map((r, i) => {
            const [x0, y0] = c(rs[i]);
            const [x1, y1] = c(r);
            return (
              <line key={i} x1={x0} y1={y0} x2={x0 + (x1 - x0) * link} y2={y0 + (y1 - y0) * link} stroke={MARK} strokeWidth={2} strokeDasharray="6 6" />
            );
          })}
        </Svg>
      </Pic>
      <Head lines={["None of them", "in isolation."]} until={p.len} />
      {f >= ln(p.beat, 1) && (
        <TagAt y={1480} t={ln(p.beat, 1)}>
          HOW THEY WORK TOGETHER
        </TagAt>
      )}
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** Three whole portraits side by side, blended into the stage. */
const COL_W = 350;
const COL_GAP = 4;
const COLS_X = (PIC.w - (3 * COL_W + 2 * COL_GAP)) / 2;
/**
 * 1000 deep, not v2's 820: at 820 the columns ended at y1240 and left 400px of
 * empty stage under three small faces on the beat meant to be the reel's peak.
 */
const COL: Box = { w: COL_W, h: 1000 };
const COL_TOP = 420;
/** face-and-shoulders, cropped at the column edges like size-v5's pair split */
const colLayout = (id: string) => frame(id, COL, 80, 610);

/** reveal — the three side by side; the reel's peak. */
const Triptych: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const ids = p.steps ?? [];
  const labels = p.labels ?? [];
  const lines = [0, 1, 2, 3, 4, 5].map((n) => ln(p.beat, n));
  const push = interpolate(f, [0, p.len], [1, 1.06], cl);
  const sel = f < lines[1] || f >= lines[4] ? -1 : f < lines[2] ? 0 : f < lines[3] ? 1 : 2;
  const late = f >= lines[4];
  return (
    <AbsoluteFill>
      {late ? (
        <Head key="b" lines={["Same woman.", "Three impressions."]} from={lines[4]} until={p.len} />
      ) : (
        <Head key="a" lines={["Compare", "all three."]} until={lines[4]} out={6} />
      )}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: `50% ${COL_TOP + 500}px` }}>
        {ids.map((id, i) => {
          const t0 = 2 + i * 4;
          const y = interpolate(f, [t0, t0 + 14], [140, 0], { ...cl, easing: ease });
          const o = interpolate(f, [t0, t0 + 8], [0, 1], cl);
          const on = sel === -1 || sel === i;
          const lift = sel === i ? interpolate(f, [lines[i + 1], lines[i + 1] + 8], [1, 1.06], { ...cl, easing: ease }) : 1;
          const [num, ...rest] = (labels[i] ?? "").split(" — ");
          return (
            <div
              key={id}
              style={{
                position: "absolute",
                left: COLS_X + i * (COL_W + COL_GAP),
                top: COL_TOP,
                width: COL_W,
                opacity: o * (on ? 1 : 0.32),
                transform: `translateY(${y}px) scale(${lift})`,
                transformOrigin: "50% 40%",
              }}
            >
              <Pic id={id} L={colLayout(id)} box={COL} style={{ position: "relative" }} />
              <div
                style={{
                  position: "absolute",
                  top: COL.h - 120,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontFamily: headlineStack,
                  fontSize: 72,
                  color: "rgba(250,248,244,0.96)",
                  lineHeight: 1,
                  textShadow: "0 2px 14px rgba(0,0,0,0.5)",
                }}
              >
                {num}
              </div>
              <div style={{ position: "absolute", top: COL.h + 22, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                {rest
                  .join(" ")
                  .split(" ")
                  .map((w) => (
                    <Mono key={w} size={26}>
                      {w}
                    </Mono>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** nuance — structure above, features below, the seam travels down the face. */
const SeamShuttle: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const a = p.left!;
  const b = p.right!;
  const y =
    f < 12
      ? interpolate(f, [0, 12], [PIC.h * 0.95, PIC.h * 0.55], { ...cl, easing: ease })
      : shuttle(f, 12, 60, PIC.h * 0.34, PIC.h * 0.78);
  const [la, lb] = p.labels ?? ["", ""];
  return (
    <AbsoluteFill>
      <Pic id={a} L={std(a)} />
      <Pic id={b} L={std(b)} clip={`inset(0 0 ${PIC.h - y}px 0)`} />
      <Seam y={y} />
      <div style={{ position: "absolute", right: 36, top: y - 62 }}>
        <Tag size={26}>{`↑ ${lb}`}</Tag>
      </div>
      <div style={{ position: "absolute", right: 36, top: y + 16 }}>
        <Tag size={26}>{`↓ ${la}`}</Tag>
      </div>
      <Head lines={["Not always", "the whole face."]} until={p.len} />
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** question — three portraits; each number lands on its spoken word. */
const VoteNumbers: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const ids = p.steps ?? [];
  const qi = WORD_CUES.findIndex((c) => /one, two/i.test(c.s));
  const w = qi >= 0 ? WORD_CUES[qi].w : [];
  const pops = [w[0], w[1], w[3] ?? w[2]].map((x) => (x ?? bf(p.beat)) - bf(p.beat));
  return (
    <AbsoluteFill>
      <Head lines={["Which would", "you choose?"]} until={p.len} />
      {ids.map((id, i) => {
        const hit = f >= pops[i];
        const s = interpolate(f, [pops[i], pops[i] + 4, pops[i] + 10], [0.5, 1.2, 1], cl);
        const o = interpolate(f, [2 + i * 3, 10 + i * 3], [0, 1], cl);
        return (
          <div key={id} style={{ position: "absolute", left: COLS_X + i * (COL_W + COL_GAP), top: COL_TOP, width: COL_W, opacity: o }}>
            <Pic id={id} L={colLayout(id)} box={COL} style={{ position: "relative", filter: hit ? undefined : "grayscale(0.6) brightness(0.92)" }} />
            <div
              style={{
                position: "absolute",
                top: 300,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: headlineStack,
                fontSize: 240,
                color: "rgba(250,248,244,0.97)",
                textShadow: "0 4px 30px rgba(0,0,0,0.5)",
                opacity: hit ? 1 : 0,
                transform: `scale(${hit ? s : 0.4})`,
              }}
            >
              {i + 1}
            </div>
          </div>
        );
      })}
      <TagAt y={1470} t={ln(p.beat, 2)}>
        COMMENT 1, 2 OR 3
      </TagAt>
    </AbsoluteFill>
  );
};

/** cta — real Dossier screens in a phone, then the end card. */
const ReportPhone: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const screens = p.steps ?? [];
  const cuts = [0, ln(p.beat, 1), ln(p.beat, 2)];
  const zoomAt = ln(p.beat, 3);
  const end = ln(p.beat, 4);
  // under the two-line house headline (12% of frame, ~175px deep)
  const phoneW = 540;
  const phoneH = Math.round((phoneW * 1311) / 603);
  const px = (PIC.w - phoneW) / 2;
  const py = 450;
  const rise = interpolate(f, [0, 14], [260, 0], { ...cl, easing: ease });
  // "and what you may want to refine" — push into the strengths panel
  const zoom = interpolate(f, [zoomAt, zoomAt + 18], [1, 1.32], { ...cl, easing: ease });
  const toEnd = interpolate(f, [end - 3, end + 12], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - toEnd }}>
        <Head lines={["Your face.", "Understood in detail."]} until={zoomAt + 8} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${rise}px) scale(${zoom})`,
            transformOrigin: `50% ${py + phoneH * 0.85}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: px - 14,
              top: py - 14,
              width: phoneW + 28,
              height: phoneH + 28,
              borderRadius: 78,
              background: INK,
              boxShadow: "0 40px 80px rgba(20,32,36,0.3)",
            }}
          />
          <div style={{ position: "absolute", left: px, top: py, width: phoneW, height: phoneH, borderRadius: 64, overflow: "hidden", background: "#FBF9F6" }}>
            {screens.map((s, i) => {
              const t0 = cuts[i];
              const t1 = i + 1 < cuts.length ? cuts[i + 1] : 1e9;
              if (i > 0 && f < t0 - 9) return null;
              const xin = i === 0 ? 0 : interpolate(f, [t0 - 9, t0 + 5], [phoneW, 0], { ...cl, easing: ease });
              const xout = interpolate(f, [t1 - 9, t1 + 5], [0, -phoneW * 0.35], { ...cl, easing: ease });
              return (
                <Img
                  key={s}
                  src={staticFile(`refina-ui/screens_trim/${s}.png`)}
                  style={{ position: "absolute", left: 0, top: 0, width: phoneW, height: phoneH, transform: `translateX(${xin + xout}px)` }}
                />
              );
            })}
          </div>
        </div>
        <TagAt y={1500} t={6}>
          THE FACIAL DOSSIER · 22 PAGES
        </TagAt>
      </div>
      <SearchEnd o={toEnd} start={end + 14} />
    </AbsoluteFill>
  );
};

/**
 * The house ending: type over the stage into a typing search bar — RefinaSize's
 * `DisclaimerSearch`, carrying the brief's final-screen copy. Not a logo
 * lockup; non-negotiable 6. Beat-local frames.
 */
const SearchEnd: React.FC<{ o: number; start: number }> = ({ o, start }) => {
  const f = useCurrentFrame();
  const locked = ["Your face.", "Understood in detail."];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {locked.map((t, i) => {
          const t0 = start - 14 + i * 10;
          const lo = interpolate(f, [t0, t0 + 12], [0, 1], cl);
          const y = interpolate(f, [t0, t0 + 16], [18, 0], { ...cl, easing: ease });
          return (
            <div
              key={t}
              style={{
                opacity: lo,
                transform: `translateY(${y}px)`,
                fontFamily: headlineStack,
                fontStyle: i === 1 ? "italic" : "normal",
                fontSize: 70,
                color: "#fff",
                textAlign: "center",
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center", opacity: interpolate(f, [start, start + 10], [0, 1], cl) }}>
        <Tag size={26}>GET YOUR PERSONALISED FACIAL ANALYSIS</Tag>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center" }}>
        <TypewriterInput text="Refina AI" startFrame={start + 6} width={700} fontSize={38} />
      </div>
      <AiChip y={430} size={26} />
    </AbsoluteFill>
  );
};

const COMPOSITIONS: Record<string, React.FC<BeatArgs>> = {
  "tri-split": TriSplit,
  "landmark-trace": LandmarkTrace,
  "jaw-seam": JawSeam,
  "wipe-down": WipeDown,
  "feature-split": FeatureSplit,
  "feature-map": FeatureMap,
  triptych: Triptych,
  "seam-shuttle": SeamShuttle,
  "vote-numbers": VoteNumbers,
  "report-phone": ReportPhone,
};

/* ── sound ───────────────────────────────────────────────────────────── */

/**
 * public/sfx/trio (Pixabay, provenance in SOURCE.md). ONSET is where the hit
 * sits inside each file, so a cue starts that much early and the hit lands on
 * the frame it scores. Spot levels 0.15-0.35 (reel-sound), except the shutter,
 * which is mastered ~18dB quieter than the rest.
 */
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

const SfxTrack: React.FC = () => {
  const hookMid = line("hook", 1) + Math.round((line("hook", 2) - line("hook", 1)) / 2);
  const q = WORD_CUES.findIndex((c) => /one, two/i.test(c.s));
  const pops = q >= 0 ? [WORD_CUES[q].w[0], WORD_CUES[q].w[1], WORD_CUES[q].w[3] ?? WORD_CUES[q].w[2]] : [];
  return (
    <>
      {/* hook — a shutter on every version cut, two swooshes as the seams land */}
      <Fx n="shutter" at={bf("hook")} v={0.9} dur={36} />
      <Fx n="shutter" at={line("hook", 1)} v={0.9} dur={36} />
      <Fx n="shutter" at={hookMid} v={0.9} dur={36} />
      <Fx n="swoosh-thin" at={line("hook", 2) + 6} v={0.24} dur={34} />
      <Fx n="swoosh-thin" at={line("hook", 2) + 12} v={0.2} dur={34} />
      {/* setup — a soft tap per layer */}
      {[0, 1, 2, 3].map((n) => (
        <Fx key={n} n="tap-soft" at={line("setup", n)} v={0.22} dur={18} />
      ))}
      {/* structure — the seam crosses the jaw */}
      <Fx n="air-whoosh-8" at={bf("structure", 4)} v={0.3} dur={40} />
      <Fx n="click-interface" at={line("structure", 1)} v={0.2} dur={20} />
      <Fx n="click-interface" at={line("structure", 2)} v={0.2} dur={20} />
      {/* pivot — the wipe */}
      <Fx n="swoosh-fast" at={bf("pivot", 10)} v={0.28} dur={34} />
      {/* features — a light whoosh for each seam and a tick for each label (the brief's "soft ticks") */}
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <React.Fragment key={n}>
          <Fx n="light-whoosh" at={line("features", n) - 2} v={0.2} dur={28} />
          <Fx n="tap-soft" at={line("features", n) + 2} v={0.24} dur={18} />
        </React.Fragment>
      ))}
      {/* together — six marks, six taps */}
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <Fx key={n} n="click-soft" at={bf("together", 3 + n * 3)} v={0.5} dur={14} />
      ))}
      {/* reveal — the gentle accent on the peak, a click per version */}
      <Fx n="boom-soft" at={bf("reveal", 2)} v={0.22} dur={70} />
      {[1, 2, 3].map((n) => (
        <Fx key={n} n="click-interface" at={line("reveal", n)} v={0.22} dur={20} />
      ))}
      <Fx n="notify-soft" at={line("reveal", 4)} v={0.2} dur={36} />
      {/* nuance */}
      <Fx n="air-whoosh-5" at={bf("nuance", 2)} v={0.28} dur={40} />
      {/* question — one pop per number, on the word */}
      {pops.map((t, i) => (
        <Fx key={i} n="pop-minimal" at={t} v={0.3} dur={24} />
      ))}
      {/* cta — a clean slide per screen, and a chime on the end card */}
      <Fx n="swoosh-thin" at={bf("cta", 2)} v={0.24} dur={34} />
      <Fx n="swoosh-thin" at={line("cta", 1)} v={0.22} dur={34} />
      <Fx n="swoosh-thin" at={line("cta", 2)} v={0.22} dur={34} />
      <Fx n="light-whoosh" at={line("cta", 3)} v={0.2} dur={28} />
      <Fx n="notify-soft" at={line("cta", 4) + 4} v={0.24} dur={40} />
    </>
  );
};

/* ── the reel ────────────────────────────────────────────────────────── */

const Trio: React.FC = () => (
  <Stage>
    <Audio src={staticFile("voiceover-trio.mp3")} />
    {/* The bed: "Ambient Soft" by AtlasAudio (Pixabay Content License; see
        gen/out/music/SOURCE.md). Sidechain-ducked against the read and passed
        gen/check-audio.py at 0.3x: louder than the voice in 1.6% of speech. */}
    <Audio src={staticFile("bed-trio.mp3")} />
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
    <TrioCaptions />
  </Stage>
);

export const RefinaTrio: React.FC = () => (
  <Composition id="RefinaTrio" component={Trio} durationInFrames={TOTAL + TAIL} fps={FPS} width={1080} height={1920} />
);
