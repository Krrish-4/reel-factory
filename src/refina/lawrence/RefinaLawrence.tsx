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
import { headlineStack, serifFont } from "../../fonts";
import { Stage } from "../protocol/atoms";
import { SectionHeadline } from "../preview/draw";
import { TypewriterInput } from "../kit";
import { AiChip, Mono, Tag } from "../ratio/atoms";
import { X, Y, frame, lm, rec } from "../bangs/landmarks";
import type { Box, Layout } from "../bangs/landmarks";
import { LawrenceCaptions } from "./captions";
import { B, TOTAL, bf, len, line } from "./beats";
import type { BeatName } from "./beats";
import { SHOTS } from "./shots";
import type { BeatProps } from "./shots";
import { WORD_CUES } from "./words-vo";
import { PHOTOS } from "./photos";

/**
 * "Her Own List" — RefinaLawrence. Script docs/scripts/lawrence-confession.txt
 * (reel-script/PROCESS.md v2). House sage treatment and Bangs' primitives.
 *
 * HONESTY, BY BEAT TYPE:
 * - Jennifer Lawrence appears ONLY through PHOTOS slots, which are empty:
 *   each renders a labelled slate until a licensed photograph is supplied.
 *   Nothing is ever drawn on her, and no preview is ever made of her.
 * - Her three facts are on screen with the outlet each came from.
 * - The rumour chips in `setup` are QUESTIONS, the internet's, never claims.
 * - The face drawn on in `why` and paired in `mistake` is GENERATED (bangs
 *   subjects) and tagged as not her.
 * - The app and the Dossier are real screens.
 * No frame number is typed: every cue is a line or a word of words-vo.ts.
 */

const FPS = 30;
const TAIL = 45;
const MARK = "rgba(255,255,255,0.95)";
const INK = "#1C2629";
const PIC: Box = { w: 1080, h: 1650 };

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const at = (k: BeatName) => {
  const i = SHOTS.findIndex((s) => s.name === k);
  const next = i + 1 < SHOTS.length ? B[SHOTS[i + 1].name as BeatName][0] : B[k][1];
  return { from: B[k][0], durationInFrames: next - B[k][0] };
};
type BeatArgs = BeatProps & { len: number; beat: BeatName };

const ln = (k: BeatName, n: number) => line(k, n) - bf(k);
const cueOf = (k: BeatName, n: number) => {
  let i = 0;
  for (const s of SHOTS) {
    if (s.name === k) return i + Math.min(n, s.lines - 1);
    i += s.lines;
  }
  return 0;
};
const wd = (k: BeatName, n: number, w: number) => {
  const c = WORD_CUES[cueOf(k, n)];
  return (c.w[Math.min(w, c.w.length - 1)] ?? c.f) - bf(k);
};
const wdAbs = (k: BeatName, n: number, w: number) => wd(k, n, w) + bf(k);

/* ── primitives ──────────────────────────────────────────────────────── */

const Head: React.FC<{ lines: string[]; from?: number; until: number; out?: number }> = ({ lines, from = 2, until, out = 10 }) => (
  <SectionHeadline lines={lines} len={until} from={from} out={out} italicSecond={lines.length > 1} />
);

const TagAt: React.FC<{ children: React.ReactNode; y: number; t?: number; size?: number }> = ({ children, y, t = 0, size = 28 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [t, t + 5], [0, 1], cl);
  const s = interpolate(f, [t, t + 5, t + 10], [0.9, 1.04, 1], cl);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${s})` }}>
      <Tag size={size}>{children}</Tag>
    </div>
  );
};

const Chip: React.FC = () => <AiChip size={26} />;

/**
 * A photo slot. Empty -> a slate that says exactly what goes there; filled ->
 * the licensed photograph, cover-fit. `scale` pushes in about the face.
 */
const Slate: React.FC<{ slot: string; x: number; y: number; w: number; h: number; scale?: number; small?: boolean; quiet?: boolean; style?: React.CSSProperties }> = ({
  slot,
  x,
  y,
  w,
  h,
  scale = 1,
  small = false,
  quiet = false,
  style,
}) => {
  const p = PHOTOS[slot];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", ...style }}>
      {p?.src ? (
        <Img
          src={staticFile(p.src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${(p.focusY ?? 0.3) * 100}%`, transform: `scale(${scale})`, transformOrigin: `50% ${(p.focusY ?? 0.3) * 100}%` }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "rgba(28,38,41,0.34)", transform: `scale(${scale})` }}>
          <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
            <line x1={0} y1={0} x2={w} y2={h} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
            <line x1={w} y1={0} x2={0} y2={h} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
            {/* a head-and-shoulders silhouette, so framing can be judged */}
            <ellipse cx={w / 2} cy={h * 0.36} rx={w * 0.17} ry={h * 0.15} fill="rgba(255,255,255,0.12)" />
            <path d={`M${w * 0.18},${h} Q${w * 0.2},${h * 0.6} ${w / 2},${h * 0.57} Q${w * 0.8},${h * 0.6} ${w * 0.82},${h} Z`} fill="rgba(255,255,255,0.12)" />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: quiet ? h * 0.9 : small ? h * 0.42 : h * 0.62, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Mono size={small ? 26 : 30}>{small ? "PHOTO" : "PHOTO · JENNIFER LAWRENCE"}</Mono>
            {!small && !quiet && <Mono size={26}>{p?.note ?? slot}</Mono>}
            {!small && !quiet && <Mono size={26}>LICENSED IMAGE NEEDED</Mono>}
          </div>
        </div>
      )}
    </div>
  );
};

const Pic: React.FC<{ id: string; L: Layout; box?: Box; children?: React.ReactNode }> = ({ id, L, box = PIC, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: box.w, height: box.h, overflow: "hidden" }}>
    <Img src={staticFile(`portraits/${rec(id).file}`)} style={{ position: "absolute", left: L.x, top: L.y, width: L.w, height: L.h, maxWidth: "none" }} />
    {children}
  </div>
);

const Svg: React.FC<{ children: React.ReactNode; box?: Box }> = ({ children, box = PIC }) => (
  <svg style={{ position: "absolute", left: 0, top: 0 }} width={box.w} height={box.h}>
    {children}
  </svg>
);

const Big: React.FC<{ ch: string; t: number; size?: number }> = ({ ch, t, size = 150 }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [t, t + 4, t + 10], [0.5, 1.15, 1], cl);
  return (
    <div style={{ fontFamily: headlineStack, fontSize: size, lineHeight: 1, color: "rgba(250,248,244,0.97)", textShadow: "0 4px 30px rgba(0,0,0,0.5)", opacity: f >= t ? 1 : 0, transform: `scale(${f >= t ? s : 0.4})`, textAlign: "center" }}>
      {ch}
    </div>
  );
};

/* ── beats ───────────────────────────────────────────────────────────── */

/** hook — her portrait full-bleed, a punch on "wants" and on "won't". */
const SlateHook: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const t1 = wd(p.beat, 0, 7);
  const t2 = wd(p.beat, 1, 3);
  const hit = (t: number) => interpolate(f, [t, t + 3, t + 12], [0, 1, 0], cl);
  const s = 1.04 + 0.05 * hit(t1) + 0.07 * hit(t2) + interpolate(f, [0, p.len], [0, 0.04], cl);
  return (
    <AbsoluteFill>
      <Slate slot={p.steps![0]} x={0} y={0} w={PIC.w} h={PIC.h} scale={s} />
      {f < ln(p.beat, 1) ? (
        <Head key="a" lines={["The one", "she wants."]} until={ln(p.beat, 1)} out={4} />
      ) : (
        <Head key="b" lines={["And why", "she won't."]} from={ln(p.beat, 1)} until={p.len} />
      )}
      <TagAt y={1480} t={wd(p.beat, 0, 1)}>
        {p.tag}
      </TagAt>
    </AbsoluteFill>
  );
};

/** bridge — the same portrait, pushing in; it is a beat about reading a face. */
const SlatePush: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, p.len], [1.08, 1.26], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Slate slot={p.steps![0]} x={0} y={0} w={PIC.w} h={PIC.h} scale={s} />
      <Head lines={["How you", "read a face."]} until={p.len} />
    </AbsoluteFill>
  );
};

/** The six-tile grid shared by setup and loop. */
const GRID = { cols: 3, rows: 2, w: 320, h: 420, gap: 14, top: 560 };
const tileXY = (i: number) => {
  const c = i % GRID.cols;
  const r = Math.floor(i / GRID.cols);
  const x0 = (PIC.w - (GRID.cols * GRID.w + (GRID.cols - 1) * GRID.gap)) / 2;
  return { x: x0 + c * (GRID.w + GRID.gap), y: GRID.top + r * (GRID.h + GRID.gap) };
};

/** setup — the photos everyone is sharing land one by one; the internet's questions stamp on top. */
const RumourGrid: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const tiles = p.steps ?? [];
  const chips = p.tags ?? [];
  const l1 = ln(p.beat, 1);
  const n = WORD_CUES[cueOf(p.beat, 1)].w.length;
  return (
    <AbsoluteFill>
      {tiles.map((t, i) => {
        const { x, y } = tileXY(i);
        const t0 = 2 + i * 5;
        const drop = interpolate(f, [t0, t0 + 12], [-220, 0], { ...cl, easing: ease });
        const o = interpolate(f, [t0, t0 + 6], [0, 1], cl);
        const rot = [-3, 2, -1.5, 2.5, -2, 1.5][i % 6];
        return <Slate key={t} slot={t} small x={x} y={y + drop} w={GRID.w} h={GRID.h} style={{ opacity: o, transform: `rotate(${rot}deg)`, boxShadow: "0 18px 40px rgba(20,32,36,0.28)" }} />;
      })}
      {chips.map((c, i) => {
        // a chip per stressed word of "The internet already decided what she's had done."
        const t = l1 + Math.round(((i + 1) / (chips.length + 1)) * (wd(p.beat, 1, n - 1) - l1));
        const { x, y } = tileXY([0, 4, 2, 3][i % 4]);
        const s = interpolate(f, [t, t + 4, t + 9], [1.6, 0.94, 1], cl);
        return (
          <div key={c} style={{ position: "absolute", left: x + 20, top: y + GRID.h - 80, opacity: f >= t ? 1 : 0, transform: `scale(${s}) rotate(${i % 2 ? 4 : -5}deg)` }}>
            <Tag size={30}>{c}</Tag>
          </div>
        );
      })}
      <Head lines={["The internet's", "version."]} until={p.len} />
    </AbsoluteFill>
  );
};

/** loop — the grid is swept away and one clean portrait takes the frame. */
const GridCollapse: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const tiles = p.steps ?? [];
  const k = interpolate(f, [2, 18], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const grow = interpolate(f, [8, 26], [0, 1], { ...cl, easing: ease });
  const w = 320 + (PIC.w - 320) * grow;
  const h = 420 + (PIC.h - 420) * grow;
  return (
    <AbsoluteFill>
      {tiles.map((t, i) => {
        const { x, y } = tileXY(i);
        const dx = (i % 3 - 1) * 900 * k;
        return <Slate key={t} slot={t} small x={x + dx} y={y + (i < 3 ? -400 : 600) * k} w={GRID.w} h={GRID.h} style={{ opacity: 1 - k }} />;
      })}
      <Slate slot={p.under!} x={(PIC.w - w) / 2} y={(PIC.h - h) / 2} w={w} h={h} scale={interpolate(f, [26, p.len], [1, 1.06], cl)} />
      <Head lines={["Her", "version."]} until={p.len} />
    </AbsoluteFill>
  );
};

/** points — her own list: three numbered rows, each with its source, arriving on its line. */
const HerList: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const items = p.steps ?? [];
  const srcs = p.tags ?? [];
  const arrive = [ln(p.beat, 0), ln(p.beat, 2), ln(p.beat, 3)];
  const sub = ["needs movement to act", "", ""];
  const subAt = [ln(p.beat, 1), 0, 0];
  const quoteAt = ln(p.beat, 4);
  // the portrait recedes behind the list; it stays on screen as the subject
  const dim = interpolate(f, [0, 14], [0, 1], { ...cl, easing: ease });
  const active = arrive.filter((a) => f >= a).length - 1;
  return (
    <AbsoluteFill>
      <Slate slot={p.under!} x={0} y={0} w={PIC.w} h={PIC.h} scale={1.06 + 0.04 * dim} quiet />
      <AbsoluteFill style={{ background: `rgba(30,42,46,${0.5 * dim})` }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 520 }}>
        {items.map((it, i) => {
          const t = arrive[i];
          const o = interpolate(f, [t, t + 8], [0, 1], cl);
          const x = interpolate(f, [t, t + 12], [-60, 0], { ...cl, easing: ease });
          const b = interpolate(f, [t, t + 8], [8, 0], cl);
          const lit = i === active ? 1 : 0.55;
          return (
            <div key={it} style={{ opacity: o * lit, transform: `translateX(${x}px)`, filter: `blur(${b}px)`, marginBottom: 54, display: "flex", gap: 34, alignItems: "flex-start" }}>
              <div style={{ fontFamily: headlineStack, fontSize: 96, lineHeight: 0.9, color: "#fff", width: 120 }}>{`0${i + 1}`}</div>
              <div>
                <div style={{ fontFamily: headlineStack, fontSize: 66, lineHeight: 1.05, color: "#fff" }}>{it}</div>
                {sub[i] && (
                  <div style={{ fontFamily: serifFont, fontStyle: "italic", fontSize: 40, color: "rgba(255,255,255,0.9)", marginTop: 8, opacity: interpolate(f, [subAt[i], subAt[i] + 8], [0, 1], cl) }}>{sub[i]}</div>
                )}
                <div style={{ marginTop: 14 }}>
                  <Mono size={26}>{srcs[i]}</Mono>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {f >= quoteAt && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1320, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "rgba(250,248,244,0.96)",
              color: INK,
              fontFamily: serifFont,
              fontStyle: "italic",
              fontSize: 54,
              padding: "22px 40px",
              borderRadius: 14,
              transform: `scale(${interpolate(f, [quoteAt, quoteAt + 5, quoteAt + 10], [0.85, 1.04, 1], cl)})`,
              opacity: interpolate(f, [quoteAt, quoteAt + 5], [0, 1], cl),
            }}
          >
            {p.note}
          </div>
        </div>
      )}
      <Head lines={["Her own", "list."]} until={p.len} />
    </AbsoluteFill>
  );
};

/**
 * why — on a GENERATED stand-in: the widest line across the cheekbones, the
 * taper to the chin; on "Change them" the cheek points move and the whole
 * outline re-draws with them. Lines say WHERE; nothing prints a number.
 */
const CheekTaper: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const id = p.under!;
  const m = lm(id);
  const L = frame(id, PIC, 330, 1330);
  const cheekRow = m.eyes + (m.nose - m.eyes) * 0.4;
  const jawRow = m.mouth + (m.chin - m.mouth) * 0.35;
  const l1 = ln(p.beat, 1);
  const l2 = ln(p.beat, 2);
  const g = (t: number, d = 14) => interpolate(f, [t, t + d], [0, 1], { ...cl, easing: ease });
  // "Change them": the cheek points breathe inward and back, the outline follows
  const pinch = f < l2 ? 0 : 0.5 - 0.5 * Math.cos(((f - l2) / 34) * Math.PI);
  const inset = 46 * pinch;
  const cx0 = X(L, m.cheeks[0]) + inset;
  const cx1 = X(L, m.cheeks[1]) - inset;
  const cy = Y(L, cheekRow);
  const jx0 = X(L, m.cheeks[0] + (m.cx - m.cheeks[0]) * 0.2);
  const jx1 = X(L, m.cheeks[1] - (m.cheeks[1] - m.cx) * 0.2);
  const jy = Y(L, jawRow);
  const chin = { x: X(L, m.cx), y: Y(L, m.chin) };
  const taper = `M${cx0},${cy} L${jx0},${jy} L${chin.x},${chin.y} L${jx1},${jy} L${cx1},${cy}`;
  const wide = g(wd(p.beat, 1, 6));
  const tp = g(l1 + 10, 22);
  return (
    <AbsoluteFill>
      <Pic id={id} L={L}>
        <Svg>
          {/* widest line, drawn on "widest" */}
          <line x1={cx0 - 30} y1={cy} x2={cx0 - 30 + (cx1 - cx0 + 60) * wide} y2={cy} stroke={MARK} strokeWidth={3} strokeDasharray="12 9" />
          <circle cx={cx0} cy={cy} r={9 * wide} fill={MARK} />
          <circle cx={cx1} cy={cy} r={9 * wide} fill={MARK} />
          <path d={taper} fill="none" stroke={MARK} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tp} strokeLinejoin="round" />
        </Svg>
        <div style={{ position: "absolute", left: cx1 + 24, top: cy - 18, opacity: wide }}>
          <Mono size={26}>WIDEST</Mono>
        </div>
      </Pic>
      {f < l2 ? (
        <Head key="a" lines={["The widest", "point."]} until={l2} out={4} />
      ) : (
        <Head key="b" lines={["Move it,", "the face re-reads."]} from={l2} until={p.len} />
      )}
      <TagAt y={1480} t={4} size={26}>
        {p.tag}
      </TagAt>
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** mistake — her face | a stranger's face, side by side; "≠" lands on "not yours". */
const HerVsYou: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const W = PIC.w / 2;
  const [la, lb] = p.labels ?? ["", ""];
  const slide = interpolate(f, [0, 14], [W, 0], { ...cl, easing: ease });
  const neq = wd(p.beat, 2, 7);
  const id = p.right!;
  const L = frame(id, { w: W, h: PIC.h }, 380, 1180, W / 2);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -slide, top: 0, width: W, height: PIC.h, overflow: "hidden" }}>
        <Slate slot={p.left!} x={0} y={0} w={W} h={PIC.h} small />
      </div>
      <div style={{ position: "absolute", left: W + slide, top: 0, width: W, height: PIC.h, overflow: "hidden" }}>
        <Pic id={id} L={L} box={{ w: W, h: PIC.h }} />
      </div>
      <div style={{ position: "absolute", left: W - 1.5, top: 0, width: 3, height: PIC.h, background: MARK }} />
      <div style={{ position: "absolute", left: 0, width: W, top: 1300, display: "flex", justifyContent: "center", opacity: interpolate(f, [10, 18], [0, 1], cl) }}>
        <Tag size={28}>{la}</Tag>
      </div>
      <div style={{ position: "absolute", left: W, width: W, top: 1300, display: "flex", justifyContent: "center", opacity: interpolate(f, [14, 22], [0, 1], cl) }}>
        <Tag size={28}>{lb}</Tag>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820 }}>
        <Big ch="≠" t={neq} size={200} />
      </div>
      <div style={{ position: "absolute", left: W, width: W, top: 1360, display: "flex", justifyContent: "center", opacity: interpolate(f, [14, 22], [0, 1], cl) }}>
        <Mono size={26}>ILLUSTRATIVE FACE</Mono>
      </div>
      {f < ln(p.beat, 1) ? (
        <Head key="a" lines={["The", "mistake."]} until={ln(p.beat, 1)} out={4} />
      ) : f < ln(p.beat, 2) ? (
        <Head key="b" lines={["Copying", "her list."]} from={ln(p.beat, 1)} until={ln(p.beat, 2)} out={4} />
      ) : (
        <Head key="c" lines={["Her face.", "Not yours."]} from={ln(p.beat, 2)} until={p.len} />
      )}
    </AbsoluteFill>
  );
};

/**
 * pivot — real app screens in a phone: the procedure list (blurred while the
 * line says "blind"), scrolled to Buccal Fat Removal; a result wiping from its
 * before to its after; then three real Dossier pages: cheeks, jaw, wrinkles.
 */
const SCREEN = (n: string) => `refina-ui/screens_trim/${n}.png`;
const TOUR = (n: string) => `dossier-tour/${n}.png`;
const AppPhone: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const [sel, before, after, ...pages] = p.steps ?? [];
  const phoneW = 560;
  const phoneH = Math.round((phoneW * 1920) / 1080);
  const px = (PIC.w - phoneW) / 2;
  const py = 440;
  const l1 = ln(p.beat, 1);
  const l2 = ln(p.beat, 2);
  const l3 = ln(p.beat, 3);
  const rise = interpolate(f, [0, 14], [260, 0], { ...cl, easing: ease });
  // line 0: the list, unreadable - deciding blind
  const blur = interpolate(f, [l1 - 6, l1 + 4], [14, 0], cl);
  // line 1: scroll to Buccal Fat Removal (row at ~1405px of the 2527px screen)
  const selScale = phoneW / 567;
  const rowY = 1405 * selScale;
  const scroll = interpolate(f, [l1, l1 + 18], [0, rowY - phoneH * 0.45], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const ring = interpolate(f, [l1 + 18, l1 + 24], [0, 1], cl);
  // then the result: before, wiping to after
  const resAt = wd(p.beat, 1, 7); // "own": the result lands on "your own photo"
  const wipe = interpolate(f, [resAt + 6, resAt + 26], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  // line 2: Dossier pages, one per named section
  const pageAt = [l2, wd(p.beat, 2, 6), wd(p.beat, 2, 7)];
  const pageScale = phoneW / 621;
  const shown = f < resAt ? "sel" : f < l2 ? "res" : "dossier";
  const pageIdx = Math.max(0, pageAt.filter((t) => f >= t).length - 1);
  return (
    <AbsoluteFill>
      {f < l2 ? (
        <Head key="a" lines={["Don't decide", "blind."]} until={l2} out={4} />
      ) : (
        <Head key="b" lines={["Your face,", "mapped."]} from={l2} until={p.len} />
      )}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${rise}px)` }}>
        <div style={{ position: "absolute", left: px - 14, top: py - 14, width: phoneW + 28, height: phoneH + 28, borderRadius: 78, background: INK, boxShadow: "0 40px 80px rgba(20,32,36,0.3)" }} />
        <div style={{ position: "absolute", left: px, top: py, width: phoneW, height: phoneH, borderRadius: 64, overflow: "hidden", background: "#FBF9F6" }}>
          {shown === "sel" && (
            <div style={{ position: "absolute", left: 0, top: -scroll, width: phoneW, filter: `blur(${blur}px)` }}>
              <Img src={staticFile(SCREEN(sel))} style={{ width: phoneW }} />
              <div style={{ position: "absolute", left: 14, top: rowY - 52, width: phoneW - 28, height: 104, borderRadius: 16, border: `4px solid rgba(198,137,138,${ring})`, boxShadow: `0 0 0 ${8 * ring}px rgba(198,137,138,${0.18 * ring})` }} />
            </div>
          )}
          {shown === "res" && (
            <>
              <Img src={staticFile(SCREEN(before))} style={{ position: "absolute", left: 0, top: 0, width: phoneW }} />
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
                <Img src={staticFile(SCREEN(after))} style={{ position: "absolute", left: 0, top: 0, width: phoneW }} />
              </div>
              {wipe > 0.01 && wipe < 0.99 && <div style={{ position: "absolute", left: phoneW * wipe - 1.5, top: 110, width: 3, height: 410, background: MARK }} />}
            </>
          )}
          {shown === "dossier" &&
            pages.map((pg, i) => {
              if (i !== pageIdx && i !== pageIdx - 1) return null;
              const t0 = pageAt[i];
              const xin = i === 0 ? 0 : interpolate(f, [t0 - 6, t0 + 6], [phoneW, 0], { ...cl, easing: ease });
              const drift = interpolate(f, [t0, t0 + 90], [0, 260], cl);
              return (
                <div key={pg} style={{ position: "absolute", left: xin, top: -drift, width: phoneW }}>
                  <Img src={staticFile(TOUR(pg))} style={{ width: 621 * pageScale }} />
                </div>
              );
            })}
        </div>
      </div>
      {f >= l3 && (
        <TagAt y={1500} t={l3} size={26}>
          A PREVIEW, NOT A PROMISE
        </TagAt>
      )}
      {f < l3 && (
        <TagAt y={1500} t={l1} size={26}>
          {p.tag}
        </TagAt>
      )}
      {p.compliance && <Chip />}
    </AbsoluteFill>
  );
};

/** end — the house search bar, then the comment question. */
const SearchBait: React.FC<BeatArgs> = (p) => {
  const f = useCurrentFrame();
  const q = p.steps ?? [];
  const l1 = ln(p.beat, 1);
  const l2 = ln(p.beat, 2);
  const lift = interpolate(f, [l1, l1 + 16], [0, -260], { ...cl, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900 + lift, display: "flex", justifyContent: "center" }}>
        <TypewriterInput text={p.caption ?? ""} startFrame={4} width={700} fontSize={38} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {q.map((t, i) => {
          const t0 = i === 0 ? l1 : l2;
          const o = interpolate(f, [t0, t0 + 12], [0, 1], cl);
          const y = interpolate(f, [t0, t0 + 16], [18, 0], { ...cl, easing: ease });
          const b = interpolate(f, [t0, t0 + 12], [8, 0], cl);
          return (
            <div key={t} style={{ opacity: o, transform: `translateY(${y}px)`, filter: `blur(${b}px)`, fontFamily: headlineStack, fontStyle: i === 1 ? "italic" : "normal", fontSize: 80, color: "#fff", textAlign: "center" }}>
              {t}
            </div>
          );
        })}
      </div>
      {f >= l2 && (
        <TagAt y={1300} t={l2 + 14}>
          {p.tag}
        </TagAt>
      )}
      {f < l1 ? (
        <Head key="a" lines={["See it", "on you first."]} until={l1} out={4} />
      ) : null}
      <AiChip y={430} size={26} />
    </AbsoluteFill>
  );
};

const COMPOSITIONS: Record<string, React.FC<BeatArgs>> = {
  "slate-hook": SlateHook,
  "slate-push": SlatePush,
  "rumour-grid": RumourGrid,
  "grid-collapse": GridCollapse,
  "her-list": HerList,
  "cheek-taper": CheekTaper,
  "her-vs-you": HerVsYou,
  "app-phone": AppPhone,
  "search-bait": SearchBait,
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
    {/* hook — a shutter on each punch */}
    <Fx n="shutter" at={wdAbs("hook", 0, 7)} v={0.8} dur={36} />
    <Fx n="shutter" at={wdAbs("hook", 1, 3)} v={0.8} dur={36} />
    <Fx n="air-whoosh-8" at={bf("bridge", 2)} v={0.24} dur={40} />
    {/* setup — a tap per tile landing, a pop per question chip */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Fx key={i} n="tap-soft" at={bf("setup", 2 + i * 5 + 10)} v={0.2} dur={18} />
    ))}
    {[1, 2, 3, 4].map((i) => {
      const l1 = line("setup", 1);
      const n = WORD_CUES[cueOf("setup", 1)].w.length;
      const end = wdAbs("setup", 1, n - 1);
      return <Fx key={`c${i}`} n="pop-minimal" at={l1 + Math.round((i / 5) * (end - l1))} v={0.28} dur={24} />;
    })}
    {/* loop — the grid swept away */}
    <Fx n="swoosh-fast" at={bf("loop", 4)} v={0.28} dur={34} />
    {/* points — a click per numbered row, a pop for the quote */}
    <Fx n="click-interface" at={line("points", 0)} v={0.24} dur={20} />
    <Fx n="click-interface" at={line("points", 2)} v={0.24} dur={20} />
    <Fx n="click-interface" at={line("points", 3)} v={0.24} dur={20} />
    <Fx n="pop-minimal" at={line("points", 4)} v={0.3} dur={24} />
    {/* why — the widest line, the taper */}
    <Fx n="tap-soft" at={wdAbs("why", 1, 6)} v={0.24} dur={18} />
    <Fx n="light-whoosh" at={line("why", 1) + 10} v={0.22} dur={28} />
    {/* mistake — panels slide in, the ≠ lands */}
    <Fx n="swoosh-thin" at={bf("mistake", 0)} v={0.24} dur={34} />
    <Fx n="pop-minimal" at={wdAbs("mistake", 2, 7)} v={0.32} dur={24} />
    {/* pivot — the product arrives, scroll, result wipe, a slide per page */}
    <Fx n="boom-soft" at={bf("pivot", 2)} v={0.22} dur={70} />
    <Fx n="click-soft" at={line("pivot", 1) + 18} v={0.4} dur={14} />
    <Fx n="swoosh-thin" at={wdAbs("pivot", 1, 4) + 6} v={0.22} dur={34} />
    <Fx n="swoosh-thin" at={line("pivot", 2)} v={0.22} dur={34} />
    <Fx n="swoosh-thin" at={wdAbs("pivot", 2, 6)} v={0.2} dur={34} />
    <Fx n="swoosh-thin" at={wdAbs("pivot", 2, 7)} v={0.2} dur={34} />
    {/* end — a chime as the search bar types */}
    <Fx n="notify-soft" at={bf("end", 6)} v={0.24} dur={40} />
  </>
);

/* ── the reel ────────────────────────────────────────────────────────── */

const Lawrence: React.FC = () => (
  <Stage>
    <Audio src={staticFile("voiceover-lawrence.mp3")} />
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
    <LawrenceCaptions />
  </Stage>
);

export const RefinaLawrence: React.FC = () => (
  <Composition id="RefinaLawrence" component={Lawrence} durationInFrames={TOTAL + TAIL} fps={FPS} width={1080} height={1920} />
);
