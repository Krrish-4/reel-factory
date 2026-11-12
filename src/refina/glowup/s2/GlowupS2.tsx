/**
 * GlowupS2 - "What Nose Shape Do You Actually Have?" (Glow Up pack S2), v2.
 *
 * v1 (out/glowup/s2-v1.mp4) was built in the pack's own blush design and
 * Rahul REJECTED it (2026-11-12): "I want the same background, similar
 * phones, same fonts" - i.e. the refina-reel HOUSE SAGE TREATMENT - laid out
 * like his reference, QOVES "Here's what different forehead shapes look
 * like" (instagram.com/reel/DeaOcQMq3YH). Measured off that reel:
 *
 *   - flat sage ground, never changes (house SAGE)
 *   - ONE hero cutout parked right, bleeding off the bottom, with a two-line
 *     mono name tag beside her chest
 *   - one persistent two-line white headline at the top
 *   - per type, LEFT column: italic serif label, a rounded thumbnail card,
 *     a mono line under it; the hero carries thin hand-drawn white arrows and
 *     a cursor glides to what the line names
 *   - italic serif captions word by word near the bottom
 *   - the comment ask is a grid of every type with mono labels that decode in
 *
 * Everything visual comes from the house: Stage/SAGE, SectionHeadline, the
 * Bangs caption track, Tag/Mono/AiChip, the Bangs Dossier phone, trio's sfx
 * with its ONSET table, the house opening shutter + flash, the typing bar
 * ending. What is new is only what the pack demands: the shutter morph on the
 * nose (one base still per view, nose-only edits, lock-checked by
 * gen/glowup/portraits.py).
 *
 * Script VERBATIM (docs/scripts/glowup-s2.txt). Every cue is a WORD of the
 * measured read, found by text with at(); no frame number is typed.
 */
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { headlineItalicStack, headlineStack, serifFont } from "../../../fonts";
import { Stage } from "../../protocol/atoms";
import { SectionHeadline } from "../../preview/draw";
import { AiChip, Mono, Tag } from "../../ratio/atoms";
import { TypewriterInput } from "../../kit";
import { Framing, Landmarks, Pt, ShutterPortrait, Shot, lerpPt, place } from "../kit";
import { CUES, PORTRAITS, VO_FRAMES, WORDS } from "./data";

const FPS = 30;
const TAIL = 45;
const W = 1080;
const H = 1920;
export const S2_FRAMES = VO_FRAMES + TAIL;

const MARK = "rgba(255,255,255,0.95)";
const INK = "#1C2629";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

/* ── cues: words of the read ─────────────────────────────────────────── */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
const at = (word: string, nth = 1): number => {
  let n = 0;
  for (const w of WORDS) if (w.w === norm(word) && ++n === nth) return w.f0;
  throw new Error(`GlowupS2: word "${word}" #${nth} not in the read`);
};
const T = {
  first: at("first"), button: at("button"), short: at("short"), upturned: at("upturned"),
  second: at("second"), greek: at("greek"), flat: at("flat"),
  third: at("third"), dorsal: at("dorsal"), ridge: at("ridge"), balances: at("balances"),
  fourth: at("fourth"), rounded: at("rounded"), fuller: at("fuller"), cheekbones: at("cheekbones"),
  fifth: at("fifth"), narrow: at("narrow"), delicate: at("delicate"),
  sixth: at("sixth"), downward: at("downward"), dips: at("dips"),
  comment1: at("comment"), number: at("number"), realizing: at("realizing"), upper: at("upper"), long: at("long"),
  ideal: at("ideal"), chin2: at("chin", 2), midface2: at("midface", 2), philtrum: at("philtrum"), not: at("not"), photo: at("photo"),
  refina: at("refina"), preview1: at("preview"), actually2: at("actually", 2),
  instead: at("instead"), doctor: at("doctor"), madison: at("madison"), sydney: at("sydney"), sadie: at("sadie"),
  preview2: at("preview", 2), comment2: at("comment", 2), dossier: at("dossier"),
};

/* ── stills ──────────────────────────────────────────────────────────── */

const P = (n: string) => `s2/portraits/${n}.png`;
const LM = (n: string): Landmarks => PORTRAITS[n];
const Q = { base: "3q_base", greek: "3q_2_greek", dorsal: "3q_3_dorsal", round: "3q_4_round", narrow: "3q_5_narrow", downward: "3q_6_downward", philtrum: "3q_philtrum" };
const F = { base: "front_base", button: "front_1_button" };

/* ── small house-style pieces ────────────────────────────────────────── */

/** House headline, held for a span; `from`/`until` are absolute frames. */
const Head: React.FC<{ lines: string[]; from: number; until: number }> = ({ lines, from, until }) => (
  <Sequence from={from} durationInFrames={Math.max(1, until - from)} layout="none">
    <SectionHeadline lines={lines} len={until - from} from={2} out={10} italicSecond={lines.length > 1} />
  </Sequence>
);

/** Mono text that decodes in out of scrambled glyphs, the way the reference's grid labels arrive. */
const GLYPHS = "ABCDEFGHIKLMNOPRSTUVWXYZ0123456789";
const Decode: React.FC<{ text: string; t: number; size?: number; o?: number }> = ({ text, t, size = 22, o = 0.95 }) => {
  const f = useCurrentFrame();
  const k = f - t;
  if (k < 0) return null;
  const shown = text
    .split("")
    .map((c, i) => (c === " " || k >= i * 0.9 + 6 ? c : GLYPHS[(i * 7 + Math.floor(k / 2) * 13) % GLYPHS.length]))
    .join("");
  return <Mono size={size} o={o * interpolate(k, [0, 4], [0, 1], cl)}>{shown}</Mono>;
};

/** A white line drawn on with progress p (house Path). */
const Path: React.FC<{ d: string; p: number; w?: number; dash?: string; o?: number }> = ({ d, p, w = 3, dash, o = 1 }) => (
  <path d={d} fill="none" stroke={MARK} strokeWidth={w} opacity={o} pathLength={dash ? undefined : 1} strokeDasharray={dash ?? 1}
    strokeDashoffset={dash ? 0 : 1 - Math.max(0, Math.min(1, p))} strokeLinecap="round" strokeLinejoin="round" />
);
const draw = (f: number, t: number, d = 10) => interpolate(f, [t, t + d], [0, 1], { ...cl, easing: ease });

/** The reference's hand-drawn arrow: a gentle curve with an open head. */
const arrowPath = (from: Pt, to: Pt, bend = 0.25) => {
  const mx = (from[0] + to[0]) / 2 - (to[1] - from[1]) * bend;
  const my = (from[1] + to[1]) / 2 + (to[0] - from[0]) * bend;
  const ang = Math.atan2(to[1] - my, to[0] - mx);
  const h = 22;
  const a1: Pt = [to[0] - h * Math.cos(ang - 0.5), to[1] - h * Math.sin(ang - 0.5)];
  const a2: Pt = [to[0] - h * Math.cos(ang + 0.5), to[1] - h * Math.sin(ang + 0.5)];
  return `M${from[0]},${from[1]} Q${mx},${my} ${to[0]},${to[1]} M${a1[0]},${a1[1]} L${to[0]},${to[1]} L${a2[0]},${a2[1]}`;
};

/** A square crop on the nose of one still, through place() - same maths as the hero. */
const NoseCard: React.FC<{ img: string; size: number; zoom?: number; radius?: number }> = ({ img, size, zoom = 1.05, radius = 26 }) => {
  const p = place(LM(img), { faceH: zoom, anchor: "noseTip", at: [W / 2, H / 2] });
  const k = size / W;
  return (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: "hidden", position: "relative", background: "#B4C4C8", boxShadow: "0 18px 40px rgba(20,32,36,0.28)" }}>
      <Img src={staticFile(P(img))} style={{ position: "absolute", left: p.x * k, top: (p.y - (H - W) / 2) * k, width: p.w * k, height: p.h * k, maxWidth: "none" }} />
    </div>
  );
};

/* ── the reference's per-type mechanic (QOVES DeaOcQMq3YH, measured at 10fps) ──
 *
 *   1. the left card PAGE-PEELS from its bottom-right corner (~0.3s) and the
 *      next type's card is underneath; label + mono swap with it
 *   2. the cursor grabs a small chip off the new card and drags it onto the
 *      hero (~0.5s)
 *   3. on the drop the feature PIXELATES and resolves into the new shape
 *      (~0.4s) while the hero pushes in a touch
 *   4. then the white hand-drawn marks draw on
 *
 * The drop lands on the word that NAMES the type ("button", "greek"...), the
 * peel on its ordinal ("Second,"), so the picture follows the read.
 */

/**
 * "First," -> "button" is only ~18 frames, too short for a card to arrive AND
 * a chip to be carried off it. So the first card, and her glide right, start
 * on the tail of the hook ("...a whole face") - the reference also brings its
 * first card in before the first type is named.
 */
const FIRST_IN = T.first - 22;
type TypeDef = { label: string; img: string; mono: string[]; ord: number; drop: number; view: "3q" | "front" };
const TYPES: TypeDef[] = [
  { label: "Button nose", img: F.button, mono: ["01  SHORT BRIDGE", "UPTURNED TIP"], ord: FIRST_IN, drop: T.button, view: "front" },
  { label: "Greek straight", img: Q.greek, mono: ["02  FLAT BRIDGE", "BROW TO TIP"], ord: T.second, drop: T.greek, view: "3q" },
  { label: "Dorsal curve", img: Q.dorsal, mono: ["03  BRIDGE RIDGE", "BONE CHARACTER"], ord: T.third, drop: T.dorsal, view: "3q" },
  { label: "Rounded tip", img: Q.round, mono: ["04  FULLER CARTILAGE", "SOFTER FRONT VIEW"], ord: T.fourth, drop: T.rounded, view: "3q" },
  { label: "Narrow sloped", img: Q.narrow, mono: ["05  DELICATE FRONT", "CURVED SIDE"], ord: T.fifth, drop: T.narrow, view: "3q" },
  { label: "Downward tip", img: Q.downward, mono: ["06  TIP DIPS", "WHEN YOU SMILE"], ord: T.sixth, drop: T.downward, view: "3q" },
];
const TRAP: TypeDef = { label: "The philtrum trap", img: Q.philtrum, mono: ["OVER-ROTATED TIP", "LONGER UPPER LIP"], ord: T.realizing + 6, drop: T.upper, view: "3q" };
const PEEL = 12; // frames the page peel takes
const PICK = 14; // frames from pickup to drop
const peelAt = (t: TypeDef) => Math.min(t.ord - 4, t.drop - PICK - PEEL + 2);
const pickAt = (t: TypeDef) => t.drop - PICK;

/* card column geometry (the reference's left column) */
const COL_X = 64;
const COL_Y = 640;
const LABEL_H = 140; // two lines of the 64px italic label
const CARD = 300;
const CARD_Y = COL_Y + LABEL_H + 18;
const CARD_C: Pt = [COL_X + CARD / 2, CARD_Y + CARD / 2];
const CARD_CORNER: Pt = [COL_X + CARD - 22, CARD_Y + CARD - 22];

/** Words of a label blurring in (house reveal). */
const LabelWords: React.FC<{ text: string; t: number; out?: number }> = ({ text, t, out }) => {
  const f = useCurrentFrame();
  const o = out === undefined ? 1 : interpolate(f, [out, out + 6], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 330, height: LABEL_H, display: "flex", alignItems: "flex-end", opacity: o, filter: `blur(${(1 - o) * 8}px)` }}>
      <div style={{ fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: 64, lineHeight: 1.0, color: "#fff", textShadow: "0 2px 16px rgba(16,24,28,0.25)" }}>
        {text.split(" ").map((w, i) => {
          const k = interpolate(f, [t + i * 2.5, t + 9 + i * 2.5], [0, 1], cl);
          return <span key={i} style={{ display: "inline-block", opacity: k, filter: `blur(${(1 - k) * 10}px)`, marginRight: "0.22em" }}>{w}</span>;
        })}
      </div>
    </div>
  );
};

/**
 * The left column for a run of types: the first card slides in from the
 * left, every later one is revealed by the previous card peeling away.
 */
const CardColumn: React.FC<{ types: TypeDef[]; until: number }> = ({ types, until }) => {
  const f = useCurrentFrame();
  const start = types[0].ord;
  if (f < start - 1 || f > until + 10) return null;
  let ci = 0;
  for (let i = 1; i < types.length; i++) if (f >= peelAt(types[i])) ci = i;
  const cur = types[ci];
  const prev = ci > 0 ? types[ci - 1] : null;
  const t0 = ci === 0 ? start : peelAt(cur);
  const slide = interpolate(f, [start, start + 16], [-460, 0], { ...cl, easing: ease });
  const p = prev ? interpolate(f, [t0, t0 + PEEL], [0, 1], { ...cl, easing: Easing.in(Easing.quad) }) : 1;
  const tout = interpolate(f, [until, until + 9], [0, 1], cl);
  return (
    <div style={{ position: "absolute", left: COL_X, top: COL_Y, width: 330, opacity: 1 - tout, filter: `blur(${tout * 10}px)`, transform: `translateX(${slide}px)` }}>
      {prev && p < 1 && <LabelWords key={`l${ci - 1}`} text={prev.label} t={-99} out={t0} />}
      <LabelWords key={`l${ci}`} text={cur.label} t={t0 + (prev ? 4 : 3)} />
      <div style={{ position: "absolute", left: 0, top: LABEL_H + 18, width: CARD, height: CARD }}>
        <NoseCard img={cur.img} size={CARD} />
        {prev && p < 1 && (
          // the old card peels off its bottom-right corner toward the top-left;
          // past half-way its pale back shows, as in the reference
          <div style={{ position: "absolute", inset: 0, transformOrigin: "0% 0%", transform: `perspective(1100px) rotate3d(1,-1,0,${-170 * p}deg) translate(${-30 * p}px,${-30 * p}px)`, opacity: 1 - p * p }}>
            <NoseCard img={prev.img} size={CARD} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "#D9E6EA", opacity: interpolate(p, [0.35, 0.5], [0, 1], cl) }} />
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, top: LABEL_H + 18 + CARD + 14, width: CARD, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        {cur.mono.map((m, i) => <Decode key={`${ci}-${i}`} text={m} t={t0 + 8 + i * 4} />)}
      </div>
    </div>
  );
};

/** The cursor: glides key to key, arriving exactly on each key's frame. */
type Key = { t: number; p: Pt };
const Cursor: React.FC<{ keys: Key[]; from: number; until: number }> = ({ keys, from, until }) => {
  const f = useCurrentFrame();
  if (f < from || f > until) return null;
  let i = 0;
  while (i + 1 < keys.length && f >= keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1] ?? keys[i];
  const k = b === a ? 0 : interpolate(f, [a.t, b.t], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const p = lerpPt(a.p, b.p, k);
  const o = interpolate(f, [from, from + 6, until - 6, until], [0, 1, 1, 0], cl);
  return (
    <svg width={46} height={46} viewBox="0 0 24 24" style={{ position: "absolute", left: p[0] - 4, top: p[1] - 2, opacity: o * 0.95, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.28))", zIndex: 20 }}>
      <path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.4 L17.5 13.4 Z" fill="#E9F0F2" stroke="#9FB2B8" strokeWidth={1} />
    </svg>
  );
};
/** where the cursor is at frame f (same maths as <Cursor>), so the chip can ride it */
const cursorAt = (keys: Key[], f: number): Pt => {
  let i = 0;
  while (i + 1 < keys.length && f >= keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1] ?? keys[i];
  const k = b === a ? 0 : interpolate(f, [a.t, b.t], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return lerpPt(a.p, b.p, k);
};

/** The chip the cursor carries from the card to the face. */
const Chips: React.FC<{ types: TypeDef[]; keys: Key[] }> = ({ types, keys }) => {
  const f = useCurrentFrame();
  return (
    <>
      {types.map((t, i) => {
        const a = pickAt(t), b = t.drop;
        if (f < a || f > b + 5) return null;
        const pop = interpolate(f, [a, a + 5], [0.4, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
        const land = interpolate(f, [b, b + 5], [1, 0.3], cl);
        const p = cursorAt(keys, Math.min(f, b));
        return (
          <div key={i} style={{ position: "absolute", left: p[0] - 52, top: p[1] - 52, transform: `scale(${pop * land}) rotate(-6deg)`, opacity: f > b ? 1 - (f - b) / 5 : 0.94, zIndex: 19 }}>
            <div style={{ borderRadius: 16, outline: "2px solid rgba(255,255,255,0.9)" }}>
              <NoseCard img={t.img} size={96} zoom={1.6} radius={16} />
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ── the hero ────────────────────────────────────────────────────────── */

const HOOK_MORPHS = [14, 28, 42, 56];
const DROPS = [...TYPES.map((t) => t.drop), TRAP.drop];
/** after each drop she pushes in a touch, and eases back before the next peel */
const pushAt = (f: number) => {
  let v = 0;
  const ends = [...TYPES.slice(1).map(peelAt), T.comment1, T.ideal];
  DROPS.forEach((d, i) => {
    const e = i < TYPES.length ? ends[i] : T.ideal;
    if (e - d > 50) v = Math.max(v, interpolate(f, [d, d + 26, e - 22, e], [0, 1, 1, 0], { ...cl, easing: Easing.inOut(Easing.cubic) }));
  });
  return 1 + 0.035 * v;
};
/**
 * Centred through the hook; on "First" she glides right. Measured on the
 * reference: ~140px of travel in the first 0.9s, settled by ~2s - a hard
 * ease-out, not a linear slide.
 */
const GLIDE = 60;
const CENTER_DX = -200;
const heroDX = (f: number) => interpolate(f, [FIRST_IN, FIRST_IN + GLIDE], [CENTER_DX, 0], { ...cl, easing: Easing.bezier(0.16, 1, 0.3, 1) });
const hero3q = (f: number): Framing => ({ faceH: 0.25, anchor: "noseTip", at: [800 + heroDX(f), 1125], push: pushAt(f) });
const heroFr = (f: number): Framing => ({ faceH: 0.25, anchor: "noseTip", at: [770 + heroDX(f), 1070], push: pushAt(f) });
const FADE_W = 200;

/**
 * The drop's pixel resolve: the NEW still, drawn through a canvas at a block
 * size that falls from coarse to 1px, over the feature (or the whole hero on
 * a view change). The real still has already swapped underneath, so when the
 * blocks reach 1px the mosaic is the picture and simply goes.
 */
const Mosaic: React.FC<{ img: string; framing: (f: number) => Framing; at: number; box: "nose" | "all"; dur?: number }> = ({ img, framing, at, box, dur = 14 }) => {
  const f = useCurrentFrame();
  const ref = React.useRef<HTMLCanvasElement>(null);
  const [handle] = React.useState(() => delayRender(`mosaic ${img}`));
  const [bmp, setBmp] = React.useState<HTMLImageElement | null>(null);
  React.useEffect(() => {
    const im = new Image();
    im.onload = () => { setBmp(im); continueRender(handle); };
    im.onerror = () => continueRender(handle);
    im.src = staticFile(P(img));
  }, [handle, img]);
  const lm = LM(img);
  const fr = framing(f);
  const p = place(lm, fr);
  let bx = 0, by = 0, bw = W, bh = H;
  if (box === "nose") {
    const c = lerpPt(p.pt("bridgeTop"), p.pt("noseTip"), 0.62);
    const len = Math.hypot(p.pt("noseTip")[0] - p.pt("bridgeTop")[0], p.pt("noseTip")[1] - p.pt("bridgeTop")[1]);
    bw = Math.max(240, len * 1.5);
    bh = Math.max(280, len * 1.9);
    bx = c[0] - bw / 2;
    by = c[1] - bh / 2;
  }
  const k = (f - at) / dur;
  const live = k >= 0 && k < 1;
  const block = Math.max(1, Math.round(interpolate(k, [0, 1], [box === "all" ? 46 : 26, 1], { ...cl, easing: Easing.in(Easing.quad) })));
  React.useEffect(() => {
    const cv = ref.current;
    if (!cv || !bmp || !live) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const sw = Math.max(1, Math.round(bw / block)), sh = Math.max(1, Math.round(bh / block));
    const small = document.createElement("canvas");
    small.width = sw;
    small.height = sh;
    const sctx = small.getContext("2d");
    if (!sctx) return;
    // the box, in the still's own pixels
    sctx.drawImage(bmp, (bx - p.x) / p.s, (by - p.y) / p.s, bw / p.s, bh / p.s, 0, 0, sw, sh);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, sw, sh, 0, 0, cv.width, cv.height);
  });
  if (!live) return null;
  const o = interpolate(k, [0, 0.12, 0.8, 1], [0, 1, 1, 0], cl);
  const feather = box === "nose" ? "radial-gradient(ellipse at center, #000 52%, transparent 72%)" : undefined;
  return (
    <canvas ref={ref} width={Math.round(bw)} height={Math.round(bh)} style={{ position: "absolute", left: bx, top: by, width: bw, height: bh, opacity: o, WebkitMaskImage: feather, maskImage: feather }} />
  );
};

const Hero: React.FC = () => {
  const f = useCurrentFrame();
  // 3/4 everywhere except the button (it came back front-facing)
  const frontOn = f >= T.button && f < T.greek;
  const shots3q: Shot[] = [
    { from: 0, src: P(Q.base) },
    { from: HOOK_MORPHS[0], src: P(Q.greek) },
    { from: HOOK_MORPHS[1], src: P(Q.dorsal) },
    { from: HOOK_MORPHS[2], src: P(Q.round) },
    { from: HOOK_MORPHS[3], src: P(Q.base) },
    { from: T.greek, src: P(Q.greek) },
    { from: T.dorsal, src: P(Q.dorsal) },
    { from: T.rounded, src: P(Q.round) },
    { from: T.narrow, src: P(Q.narrow) },
    { from: T.downward, src: P(Q.downward) },
    { from: T.realizing, src: P(Q.base) },
    { from: T.upper, src: P(Q.philtrum) },
    { from: T.ideal, src: P(Q.base) },
  ];
  const shotsFr: Shot[] = [{ from: 0, src: P(F.button) }];

  // the hero steps aside for the comment grid, and leaves for the phone
  const grid = interpolate(f, [T.comment1 - 4, T.comment1 + 10, T.realizing - 8, T.realizing + 8], [0, 1, 1, 0], { ...cl, easing: ease });
  const gone = interpolate(f, [T.refina - 10, T.refina + 8], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  if (gone >= 1) return null;
  // "not a celebrity reference photo": she desaturates and recedes
  const recede = interpolate(f, [T.not, T.not + 16], [0, 1], { ...cl, easing: ease });
  const tx = grid * 520 + gone * 700;
  const left = place(LM(frontOn ? F.base : Q.base), frontOn ? heroFr(f) : hero3q(f)).x;
  const mask = `linear-gradient(to right, transparent ${left + 4}px, #000 ${left + FADE_W}px)`;
  return (
    <AbsoluteFill style={{ transform: `translateX(${tx}px) scale(${1 - 0.06 * recede})`, transformOrigin: "75% 100%", opacity: 1 - grid, filter: `grayscale(${recede * 0.85}) blur(${grid * 8}px)`, WebkitMaskImage: mask, maskImage: mask }}>
      {frontOn ? <ShutterPortrait shots={shotsFr} lm={LM(F.base)} framing={heroFr(f)} /> : <ShutterPortrait shots={shots3q} lm={LM(Q.base)} framing={hero3q(f)} />}
      {/* the drops: a whole-hero resolve where the view changes, a nose resolve elsewhere */}
      <Mosaic img={F.button} framing={heroFr} at={T.button} box="all" dur={16} />
      <Mosaic img={Q.greek} framing={hero3q} at={T.greek} box="all" dur={16} />
      {[TYPES[2], TYPES[3], TYPES[4], TYPES[5], TRAP].map((t) => (
        <Mosaic key={t.img} img={t.img} framing={hero3q} at={t.drop} box="nose" />
      ))}
    </AbsoluteFill>
  );
};

/** The reference's mono name tag beside her chest; struck through on "not a celebrity reference photo". */
const NameTag: React.FC = () => {
  const f = useCurrentFrame();
  const vis = f < T.comment1 - 4 || (f >= T.realizing + 4 && f < T.refina - 8);
  if (!vis) return null;
  const o = interpolate(f, [8, 20], [0, 1], cl);
  const strike = interpolate(f, [T.photo - 4, T.photo + 8], [0, 1], { ...cl, easing: ease });
  return (
    <div style={{ position: "absolute", left: 620, top: 1420, opacity: o, display: "flex", flexDirection: "column", gap: 4 }}>
      <Decode text="MADISON BEER, AMERICAN" t={8} size={22} />
      <Decode text="SINGER · AI-PAINTED" t={12} size={22} o={0.8} />
      <div style={{ position: "absolute", left: -6, right: -6, top: "48%", height: 3, background: MARK, transformOrigin: "left", transform: `scaleX(${strike})` }} />
    </div>
  );
};

/** Every mark on her face, through place() with the hero's own framing. */
const Marks: React.FC = () => {
  const f = useCurrentFrame();
  const q = place(LM(Q.base), hero3q(f));
  const fr = place(LM(F.base), heroFr(f));
  const fb = place(LM(F.button), heroFr(f));
  const ph = place(LM(Q.philtrum), hero3q(f));
  const nose = q.pt("noseTip"), top = q.pt("bridgeTop"), brow = q.pt("brow"), sub = q.pt("subnasale"), lip = q.pt("lipTop"), chin = q.pt("chin"), eyes = q.pt("eyes");
  const nw = LM(Q.base).noseW * LM(Q.base).size[0] * q.s;
  const show = (a: number, b: number) => f >= a && f < b - 2;
  const fadeOut = (b: number) => interpolate(f, [b - 8, b - 2], [1, 0], cl);
  const tagAt = (p: Pt, t: number, text: string, until: number) =>
    f >= t && f < until ? (
      <div key={text} style={{ position: "absolute", left: p[0], top: p[1], transform: "translate(-50%,-50%)", opacity: interpolate(f, [t, t + 5], [0, 1], cl) * fadeOut(until) }}>
        <Tag size={20}>{text}</Tag>
      </div>
    ) : null;
  const mid = lerpPt(sub, lip, 0.5);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))" }}>
        {/* 1 button (front): arrows onto the lifted tip, a bracket on the short bridge */}
        {show(T.upturned, T.second) && (() => {
          const tip = fb.pt("noseTip");
          return (
            <g opacity={fadeOut(T.second)}>
              <Path d={arrowPath([tip[0] - 150, tip[1] - 130], [tip[0] - 22, tip[1] - 12], 0.3)} p={draw(f, T.upturned, 12)} />
              <Path d={arrowPath([tip[0] + 150, tip[1] - 130], [tip[0] + 22, tip[1] - 12], -0.3)} p={draw(f, T.upturned + 4, 12)} />
            </g>
          );
        })()}
        {show(T.short, T.second) && (() => {
          const t0 = fr.pt("bridgeTop"), tip = fb.pt("noseTip");
          const x = tip[0] + 95;
          return <g opacity={fadeOut(T.second)}><Path d={`M${x - 16},${t0[1]} H${x} V${tip[1]} H${x - 16}`} p={draw(f, T.short, 12)} /></g>;
        })()}
        {/* 2 greek: one straight line brow -> tip */}
        {show(T.flat, T.third) && <g opacity={fadeOut(T.third)}><Path d={`M${brow[0]},${brow[1]} L${nose[0]},${nose[1]}`} p={draw(f, T.flat, 14)} w={3.5} /></g>}
        {/* 3 dorsal: arrow onto the ridge, dashed tip -> chin */}
        {show(T.ridge, T.fourth) && (() => {
          const ridge = lerpPt(top, nose, 0.5);
          const r: Pt = [ridge[0] + nw * 0.25, ridge[1]];
          return <g opacity={fadeOut(T.fourth)}><Path d={arrowPath([r[0] + 170, r[1] - 120], [r[0] + 14, r[1] - 6], -0.3)} p={draw(f, T.ridge, 12)} /></g>;
        })()}
        {show(T.balances, T.fourth) && <g opacity={fadeOut(T.fourth)}><Path d={`M${nose[0]},${nose[1]} L${chin[0]},${chin[1]}`} p={1} dash="12 10" o={draw(f, T.balances, 8)} /></g>}
        {/* 4 rounded: a ring round the tip dome */}
        {show(T.fuller, T.fifth) && (() => {
          const c: Pt = [nose[0] - nw * 0.12, nose[1] + 4];
          const r = nw * 0.5;
          return <g opacity={fadeOut(T.fifth)}><Path d={`M${c[0] - r},${c[1]} a${r},${r * 0.9} 0 1,0 ${2 * r},0 a${r},${r * 0.9} 0 1,0 ${-2 * r},0`} p={draw(f, T.fuller, 14)} /></g>;
        })()}
        {/* 5 narrow sloped: the concave line of the bridge */}
        {show(T.delicate, T.sixth) && (() => {
          const m = lerpPt(top, nose, 0.5);
          return <g opacity={fadeOut(T.sixth)}><Path d={`M${top[0]},${top[1]} Q${m[0] - nw * 0.3},${m[1]} ${nose[0]},${nose[1]}`} p={draw(f, T.delicate, 12)} /></g>;
        })()}
        {/* 6 downward: an arrow down past the tip */}
        {show(T.dips, T.comment1) && <g opacity={fadeOut(T.comment1)}><Path d={arrowPath([nose[0] + 70, nose[1] - 60], [nose[0] + 34, nose[1] + 70], -0.25)} p={draw(f, T.dips, 12)} /></g>}
        {/* philtrum trap: bracket nose-base -> upper lip on the over-rotated still */}
        {show(T.upper, T.ideal) && (() => {
          const s = ph.pt("subnasale"), l = ph.pt("lipTop");
          const x = s[0] + 70;
          return <g opacity={fadeOut(T.ideal)}><Path d={`M${x - 16},${s[1]} H${x} V${l[1]} H${x - 16}`} p={draw(f, T.upper, 12)} w={3.5} /></g>;
        })()}
        {/* depends: chin, midface, philtrum - dashed from the nose as each is named */}
        {f >= T.chin2 && f < T.not && <Path d={`M${nose[0]},${nose[1]} L${chin[0]},${chin[1]}`} p={1} dash="10 9" o={draw(f, T.chin2, 8) * fadeOut(T.not)} />}
        {f >= T.midface2 && f < T.not && <Path d={`M${nose[0]},${nose[1]} L${eyes[0]},${eyes[1]}`} p={1} dash="10 9" o={draw(f, T.midface2, 8) * fadeOut(T.not)} />}
        {f >= T.philtrum && f < T.not && <Path d={`M${nose[0]},${nose[1]} L${mid[0]},${mid[1]}`} p={1} dash="10 9" o={draw(f, T.philtrum, 8) * fadeOut(T.not)} />}
      </svg>
      {tagAt([chin[0] + 90, chin[1] + 10], T.chin2, "CHIN", T.not)}
      {tagAt([eyes[0] + 40, eyes[1] - 70], T.midface2, "MIDFACE", T.not)}
      {tagAt([lip[0] + 180, lip[1] - 10], T.philtrum, "PHILTRUM", T.not)}
    </AbsoluteFill>
  );
};

/* ── the comment grid (the reference's ending device, where the script asks) ── */

const GRID = [
  { img: F.button, l: "01  BUTTON" },
  { img: Q.greek, l: "02  GREEK STRAIGHT" },
  { img: Q.dorsal, l: "03  DORSAL CURVE" },
  { img: Q.round, l: "04  ROUNDED TIP" },
  { img: Q.narrow, l: "05  NARROW SLOPED" },
  { img: Q.downward, l: "06  DOWNWARD TIP" },
];
const CommentGrid: React.FC = () => {
  const f = useCurrentFrame();
  const from = T.comment1, until = T.realizing;
  if (f < from - 2 || f > until + 12) return null;
  const tout = interpolate(f, [until - 4, until + 8], [0, 1], { ...cl, easing: ease });
  const pick = interpolate(f, [T.number - 4, T.number + 8], [0, 1], { ...cl, easing: ease });
  const size = 300, gapX = 22, gapY = 96;
  const x0 = (W - (size * 3 + gapX * 2)) / 2, y0 = 520;
  return (
    <AbsoluteFill style={{ opacity: 1 - tout, filter: `blur(${tout * 10}px)` }}>
      {GRID.map((g, i) => {
        const t0 = from + i * 3;
        const s = interpolate(f, [t0, t0 + 6, t0 + 12], [0.85, 1.03, 1], cl);
        const o = interpolate(f, [t0, t0 + 6], [0, 1], cl);
        const me = i === 0;
        const dim = me ? 1 : 1 - 0.55 * pick;
        return (
          <div key={i} style={{ position: "absolute", left: x0 + (i % 3) * (size + gapX), top: y0 + Math.floor(i / 3) * (size + gapY), opacity: o * dim, transform: `scale(${s * (me ? 1 + 0.06 * pick : 1)})` }}>
            <div style={{ borderRadius: 28, boxShadow: me && pick > 0 ? `0 0 0 ${5 * pick}px #fff` : undefined }}>
              <NoseCard img={g.img} size={size} zoom={0.95} radius={28} />
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}><Decode text={g.l} t={t0 + 6} size={21} /></div>
          </div>
        );
      })}
      {f >= T.number && (
        <div style={{ position: "absolute", left: x0, top: y0 - 62, opacity: interpolate(f, [T.number, T.number + 6], [0, 1], cl) }}>
          <Tag size={20} tone="live">MOST REQUESTED</Tag>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ── the product: the Bangs Dossier phone, a screen per line ────────── */

/** The real Cosmetic Preview screen with the sample user's pair in its photo slot. */
const CosmeticPreview: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useCurrentFrame();
  const R = { x: 14 / 558, y: 314 / 1311, w: 522 / 558, h: 526 / 1311 }; // photo slot, measured on screens_trim/cosmetic-preview.png
  const t = interpolate(f, [t0 + 8, t0 + 36, t0 + 54, t0 + 70], [0.12, 0.88, 0.88, 0.5], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Img src={staticFile("s2/app/ui/cosmetic-preview.png")} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", left: `${R.x * 100}%`, top: `${R.y * 100}%`, width: `${R.w * 100}%`, height: `${R.h * 100}%`, borderRadius: 14, overflow: "hidden", background: "#fff" }}>
        <Img src={staticFile("s2/app/rhino-after.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "35% 40%" }} />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` }}>
          <Img src={staticFile("s2/app/rhino-before.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "35% 40%" }} />
        </div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${t * 100}%`, width: 2, background: "#fff", transform: "translateX(-1px)" }} />
        <div style={{ position: "absolute", top: "52%", left: `${t * 100}%`, width: 34, height: 34, marginLeft: -17, borderRadius: 99, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", left: 10, top: 10, background: "#fff", borderRadius: 99, padding: "3px 10px", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", color: "#222" }}>BEFORE</div>
        <div style={{ position: "absolute", right: 10, top: 10, background: "rgba(255,255,255,0.9)", borderRadius: 99, padding: "3px 10px", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", color: "#C6898A" }}>AFTER</div>
      </div>
    </AbsoluteFill>
  );
};

const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const from = T.refina - 6;
  if (f < from || f > T.comment2 + 10) return null;
  const phoneW = 560, phoneH = Math.round((phoneW * 1920) / 1080);
  const rise = interpolate(f, [from, from + 14], [260, 0], { ...cl, easing: ease });
  // close: the phone steps right so the "instead of" list can sit beside it
  const side = interpolate(f, [T.instead - 4, T.instead + 12], [0, 1], { ...cl, easing: ease });
  const sc = 1 - 0.22 * side;
  const px = (W - phoneW) / 2 + 190 * side;
  const py = 440 + 60 * side;
  const leave = interpolate(f, [T.comment2 - 6, T.comment2 + 8], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const cuts = [from, T.preview1 - 6, T.actually2 - 6];
  const screens: React.ReactNode[] = [
    <OffthreadVideo key="m" src={staticFile("s2/app/mesh.mp4")} muted playbackRate={0.9} style={{ width: phoneW, height: phoneH, objectFit: "cover" }} />,
    <CosmeticPreview key="c" t0={cuts[1]} />,
    <AbsoluteFill key="t" style={{ background: "#fff" }}>
      <OffthreadVideo src={staticFile("s2/app/turn.mp4")} muted playbackRate={Math.min(1.2, 290 / (T.comment2 + 16 - (T.actually2 - 15)))} style={{ width: phoneW, height: phoneH, objectFit: "cover", objectPosition: "45% 30%" }} />
    </AbsoluteFill>,
  ];
  return (
    <AbsoluteFill style={{ opacity: 1 - leave, transform: `translateY(${rise + leave * 120}px)` }}>
      <div style={{ position: "absolute", left: px, top: py, width: phoneW, height: phoneH, transform: `scale(${sc})`, transformOrigin: "center top" }}>
        <div style={{ position: "absolute", left: -14, top: -14, width: phoneW + 28, height: phoneH + 28, borderRadius: 78, background: INK, boxShadow: "0 40px 80px rgba(20,32,36,0.3)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: phoneW, height: phoneH, borderRadius: 64, overflow: "hidden", background: "#FBF9F6" }}>
          {screens.map((s, i) => {
            const t0 = cuts[i];
            const t1 = i + 1 < cuts.length ? cuts[i + 1] : T.comment2 + 10;
            if (f < t0 - 9 || f > t1 + 6) return null;
            const xin = i === 0 ? 0 : interpolate(f, [t0 - 9, t0 + 5], [phoneW, 0], { ...cl, easing: ease });
            const xout = interpolate(f, [t1 - 9, t1 + 5], [0, -phoneW * 0.35], { ...cl, easing: ease });
            return (
              <Sequence key={i} from={i === 0 ? t0 : t0 - 9} layout="none">
                <div style={{ position: "absolute", left: 0, top: 0, width: phoneW, height: phoneH, transform: `translateX(${xin + xout}px)` }}>{s}</div>
              </Sequence>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** One mono tag at a time under the phone, naming the screen; only while the phone is centred. */
const PhoneTags: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.refina || f >= T.instead - 4) return null;
  const items = [
    { t: T.refina + 4, s: "REFINA  ·  FACIAL DOSSIER" },
    { t: T.preview1 - 2, s: "COSMETIC PREVIEW" },
    { t: T.actually2 - 2, s: "BRING TO LIFE  ·  3D" },
  ];
  let cur = items[0];
  for (const it of items) if (f >= it.t) cur = it;
  const o = interpolate(f, [cur.t, cur.t + 6], [0, 1], cl);
  return (
    <div style={{ position: "absolute", top: 1490, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <Tag size={24}>{cur.s}</Tag>
    </div>
  );
};

/** "Instead of just trusting what a doctor says or taking what ... has" - each on its word, struck on "preview". */
const NotThese: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.doctor - 2 || f > T.comment2 + 6) return null;
  const items = [
    { t: T.doctor, s: "WHAT A DOCTOR SAYS" },
    { t: T.madison, s: "MADISON BEER" },
    { t: T.sydney, s: "SYDNEY SWEENEY" },
    { t: T.sadie, s: "SADIE SINK" },
  ];
  const leave = interpolate(f, [T.comment2 - 6, T.comment2 + 4], [0, 1], cl);
  return (
    <AbsoluteFill style={{ opacity: 1 - leave }}>
      {items.map((it, i) => {
        if (f < it.t) return null;
        const o = interpolate(f, [it.t, it.t + 5], [0, 1], cl);
        const s = interpolate(f, [it.t, it.t + 5, it.t + 10], [0.9, 1.04, 1], cl);
        const strike = interpolate(f, [T.preview2 + i * 3, T.preview2 + i * 3 + 8], [0, 1], { ...cl, easing: ease });
        return (
          <div key={i} style={{ position: "absolute", left: 70, top: 640 + i * 110, opacity: o * (1 - 0.4 * strike), transform: `scale(${s})`, transformOrigin: "left center" }}>
            <div style={{ position: "relative" }}>
              <Tag size={24} tone={i === 0 ? "live" : "plain"}>{it.s}</Tag>
              <div style={{ position: "absolute", left: -4, right: -4, top: "50%", height: 3, background: MARK, transformOrigin: "left", transform: `scaleX(${strike})` }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** The house ending (typing bar), pointed at the script's comment keyword. */
const End: React.FC = () => {
  const f = useCurrentFrame();
  const from = T.comment2;
  if (f < from - 2) return null;
  const k = f - from;
  const lines = ["Comment", "DOSSIER"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {lines.map((t, i) => {
          const t0 = i * 8;
          const o = interpolate(k, [t0, t0 + 12], [0, 1], cl);
          const y = interpolate(k, [t0, t0 + 16], [18, 0], { ...cl, easing: ease });
          const b = interpolate(k, [t0, t0 + 12], [8, 0], cl);
          return (
            <div key={t} style={{ opacity: o, transform: `translateY(${y}px)`, filter: `blur(${b}px)`, fontFamily: i === 1 ? headlineStack : headlineItalicStack, fontStyle: i === 0 ? "italic" : "normal", fontSize: i === 1 ? 128 : 84, letterSpacing: i === 1 ? "0.06em" : 0, color: "#fff", lineHeight: 1 }}>
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center", opacity: interpolate(k, [10, 20], [0, 1], cl) }}>
        <Tag size={26}>AND I&apos;LL SEND YOU THE APP</Tag>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center" }}>
        <TypewriterInput text="DOSSIER" startFrame={T.dossier} width={700} fontSize={38} placeholder="Add a comment..." icon={false} framesPerChar={2} />
      </div>
      <AiChip y={430} size={26} />
    </AbsoluteFill>
  );
};

/* ── captions: the house track (Bangs/size), on this read's cues ─────── */

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", bottom: "6.5%", left: 0, right: 0, height: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 70px" }}>
      {CUES.map((c, i) => {
        if (frame < c.f - 6 || frame > c.t + 6) return null;
        // no line shown twice: the opening question is the headline, and the
        // ending draws "Comment DOSSIER" itself
        if (i === 0 || c.f >= T.comment2 - 2) return null;
        const words = c.s.split(" ");
        const outO = interpolate(frame, [c.t - 7, c.t], [1, 0], cl);
        return (
          <div key={i} style={{ position: "absolute", left: 70, right: 70, textAlign: "center", fontFamily: serifFont, fontStyle: "italic", fontSize: 42, color: "#fff", lineHeight: 1.3, textShadow: "0 2px 14px rgba(16,24,28,0.72)", opacity: outO }}>
            {words.map((w, k) => {
              const t0 = c.w[k] ?? c.f;
              const o = interpolate(frame, [t0, t0 + 5], [0, 1], cl);
              const b = interpolate(frame, [t0, t0 + 6], [6, 0], cl);
              const y = interpolate(frame, [t0, t0 + 7], [9, 0], { ...cl, easing: Easing.out(Easing.quad) });
              return <span key={k} style={{ display: "inline-block", opacity: o, filter: `blur(${b}px)`, transform: `translateY(${y}px)`, marginRight: "0.26em" }}>{w}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

/* ── sound: trio's set and ONSET table, cues off the same words ──────── */

const ONSET: Record<string, number> = { "swoosh-thin": 0.37, "light-whoosh": 0.12, "tap-soft": 0, "click-soft": 0, shutter: 0.6, "pop-minimal": 0.14, "notify-soft": 0.12, "boom-soft": 0 };
const Fx: React.FC<{ n: string; at: number; v?: number; dur?: number }> = ({ n, at: t, v = 0.28, dur = 30 }) => {
  const start = Math.max(0, Math.round(t - (ONSET[n] ?? 0) * FPS));
  return (
    <Sequence from={start} durationInFrames={dur} layout="none">
      <Audio src={staticFile(`sfx/trio/${n.includes(".") ? n : `${n}.mp3`}`)} volume={(fr) => v * interpolate(fr, [dur - 8, dur - 1], [1, 0], cl)} />
    </Sequence>
  );
};
const SfxTrack: React.FC = () => (
  <>
    {HOOK_MORPHS.slice(0, 3).map((m) => <Fx key={m} n="shutter" at={m} v={0.55} dur={30} />)}
    <Fx n="light-whoosh" at={FIRST_IN} v={0.2} dur={28} />
    {TYPES.slice(1).map((t) => <Fx key={`pe${t.drop}`} n="paper-slide.wav" at={peelAt(t)} v={0.3} dur={18} />)}
    {[...TYPES, TRAP].map((t) => <Fx key={`pk${t.drop}`} n="tap-soft" at={pickAt(t)} v={0.18} dur={14} />)}
    {[...TYPES, TRAP].map((t) => <Fx key={`dr${t.drop}`} n="click-soft" at={t.drop} v={0.42} dur={14} />)}
    {[...TYPES, TRAP].map((t) => <Fx key={`dp${t.drop}`} n="pop-minimal" at={t.drop + 2} v={0.16} dur={18} />)}
    {[T.upturned, T.flat, T.ridge, T.fuller, T.delicate, T.dips].map((t) => <Fx key={`t${t}`} n="tap-soft" at={t} v={0.22} dur={18} />)}
    <Fx n="swoosh-thin" at={T.comment1 - 4} v={0.24} dur={34} />
    {[0, 3].map((i) => <Fx key={`p${i}`} n="pop-minimal" at={T.comment1 + i * 3} v={0.22} dur={20} />)}
    <Fx n="click-soft" at={T.number} v={0.4} dur={14} />
    <Fx n="swoosh-thin" at={T.realizing - 4} v={0.22} dur={34} />
    {[T.chin2, T.midface2, T.philtrum].map((t) => <Fx key={`d${t}`} n="tap-soft" at={t} v={0.22} dur={18} />)}
    <Fx n="click-soft" at={T.photo} v={0.4} dur={14} />
    <Fx n="boom-soft" at={T.refina - 4} v={0.22} dur={70} />
    <Fx n="swoosh-thin" at={T.preview1 - 6} v={0.2} dur={34} />
    <Fx n="swoosh-thin" at={T.actually2 - 6} v={0.2} dur={34} />
    <Fx n="light-whoosh" at={T.instead - 4} v={0.2} dur={28} />
    <Fx n="click-soft" at={T.preview2} v={0.35} dur={14} />
    <Fx n="notify-soft" at={T.comment2 + 4} v={0.24} dur={40} />
  </>
);

/** House opening flash, plus a subtler one under every shutter morph. */
const FLASH_PEAK = 0.26;
const Flashes: React.FC = () => {
  const f = useCurrentFrame();
  const cues = [0, ...HOOK_MORPHS.slice(0, 3)];
  const o = Math.max(0, ...cues.map((a) => interpolate(f, [a, a + 1, a + 9], [0, a === 0 ? FLASH_PEAK : 0.16, 0], { ...cl, easing: Easing.out(Easing.quad) })));
  return o > 0.001 ? <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} /> : null;
};

/* ── the reel ────────────────────────────────────────────────────────── */

/** The cursor's path: card corner (peel) -> card (pickup) -> her nose (drop) -> what the line names. */
const ptAt = (view: "3q" | "front", key: string, t: number): Pt =>
  place(LM(view === "front" ? F.button : Q.base), view === "front" ? heroFr(t) : hero3q(t)).pt(key);
const KEYS: Key[] = (() => {
  const k: Key[] = [{ t: FIRST_IN + 4, p: [940, 1560] }];
  const nw = (t: number) => LM(Q.base).noseW * LM(Q.base).size[0] * place(LM(Q.base), hero3q(t)).s;
  const feats: Record<string, Key[]> = {
    [F.button]: [
      { t: T.short, p: lerpPt(ptAt("front", "bridgeTop", T.short), ptAt("front", "noseTip", T.short), 0.5) },
      { t: T.upturned, p: ptAt("front", "noseTip", T.upturned) },
    ],
    [Q.greek]: [{ t: T.flat, p: lerpPt(ptAt("3q", "brow", T.flat), ptAt("3q", "noseTip", T.flat), 0.5) }],
    [Q.dorsal]: [
      { t: T.ridge, p: ((m: Pt): Pt => [m[0] + nw(T.ridge) * 0.25, m[1]])(lerpPt(ptAt("3q", "bridgeTop", T.ridge), ptAt("3q", "noseTip", T.ridge), 0.5)) },
      { t: T.balances, p: ptAt("3q", "chin", T.balances) },
    ],
    [Q.round]: [
      { t: T.fuller, p: ptAt("3q", "noseTip", T.fuller) },
      { t: T.cheekbones, p: [ptAt("3q", "eyes", T.cheekbones)[0] - 70, ptAt("3q", "noseTip", T.cheekbones)[1] - 20] },
    ],
    [Q.narrow]: [{ t: T.delicate, p: lerpPt(ptAt("3q", "bridgeTop", T.delicate), ptAt("3q", "noseTip", T.delicate), 0.5) }],
    [Q.downward]: [{ t: T.dips, p: ((n: Pt): Pt => [n[0] + 30, n[1] + 60])(ptAt("3q", "noseTip", T.dips)) }],
    [Q.philtrum]: [{ t: T.long, p: lerpPt(ptAt("3q", "subnasale", T.long), ptAt("3q", "lipTop", T.long), 0.5) }],
  };
  [...TYPES, TRAP].forEach((ty, i) => {
    if (ty === TRAP) k.push({ t: TRAP.ord + 6, p: [940, 1560] });
    else if (i > 0) {
      k.push({ t: peelAt(ty) - 1, p: CARD_CORNER });
      k.push({ t: peelAt(ty) + PEEL, p: [COL_X + 60, CARD_Y + 50] });
    }
    k.push({ t: pickAt(ty), p: CARD_C });
    k.push({ t: ty.drop, p: ptAt(ty.view, "noseTip", ty.drop) });
    k.push(...(feats[ty.img] ?? []));
  });
  return k.sort((a, b) => a.t - b.t).filter((x, i, arr) => i === 0 || x.t > arr[i - 1].t);
})();

const Reel: React.FC = () => {
  return (
    <Stage>
      <Audio src={staticFile("s2/vo.mp3")} />
      <SfxTrack />
      <Hero />
      <Marks />
      <NameTag />

      <Head lines={["What nose shape do you", "actually have?"]} from={0} until={T.comment1 - 2} />
      <Head lines={["Comment which nose", "shape you have."]} from={T.comment1} until={T.realizing - 2} />
      <Head lines={["What actually", "decides it"]} from={T.realizing} until={T.refina - 6} />
      <Head lines={["See it on", "your own face."]} from={T.refina} until={T.preview2 - 2} />
      <Head lines={["Preview it on", "your face first."]} from={T.preview2} until={T.comment2 - 4} />

      <CardColumn types={TYPES} until={T.comment1 - 8} />
      <CardColumn types={[TRAP]} until={T.ideal - 8} />
      <Chips types={[...TYPES, TRAP]} keys={KEYS} />
      <Cursor from={FIRST_IN + 4} until={T.comment1 - 6} keys={KEYS} />
      <Cursor from={TRAP.ord + 6} until={T.ideal - 4} keys={KEYS} />

      <CommentGrid />
      <Phone />
      <PhoneTags />
      <NotThese />
      <End />
      {/* the product beats carry the house compliance chip */}
      <Sequence from={T.refina} durationInFrames={T.comment2 - T.refina} layout="none">
        <AiChip y={262} size={24} />
      </Sequence>

      <Captions />
      <Flashes />
    </Stage>
  );
};

export const GlowupS2: React.FC = () => <Composition id="GlowupS2" component={Reel} durationInFrames={S2_FRAMES} fps={FPS} width={W} height={H} />;
