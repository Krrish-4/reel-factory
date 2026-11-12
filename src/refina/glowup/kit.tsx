/**
 * Glow Up pack kit (Refina x Glow Up, S1-S10). One design for the whole
 * series, taken from refina-glowup-production-pack.pdf section 1:
 *
 *   flat solid ground, painted cutout, single-variable SHUTTER MORPH
 *   (120ms cross-dissolve + 40ms white flash + shutter click), 1.00->1.04
 *   linear push per hold, white 2.5px vector overlays drawn over ~10 frames,
 *   dark translucent callout cards with a 2px pointer and 6px dot, charcoal
 *   64px number badge + serif header at y210, word-by-word lower-third
 *   captions (active word white, the rest at 45%).
 *
 * THE ONE RULE THAT MAKES OVERLAYS LAND ON ANATOMY (repo invariant S):
 * a portrait and every mark on it go through ONE function, `place()`. Points
 * are stored as fractions of the source image (gen/glowup/portraits.py) and
 * mapped to frame pixels by the same scale/offset that positions the <Img>,
 * push-in included. Never position a mark with a typed frame coordinate.
 *
 * Nothing in here is reel-specific; a reel is a spec handed to these parts.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

const interItalic = loadInter("italic", { weights: ["300", "400", "500"], subsets: ["latin"] });
const interUp = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const playfair = loadPlayfair("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });

export const FONT = {
  serif: `${playfair.fontFamily}, Georgia, serif`,
  sans: `${interUp.fontFamily}, Helvetica, Arial, sans-serif`,
  italic: `${interItalic.fontFamily}, Helvetica, Arial, sans-serif`,
};

export const C = {
  blush: "#D8C7C2", // warm blush-stone ground (S2, S3, S5, S7, S9)
  slate: "#8E7B82", // muted rose-slate ground (S1, S4, S6, S8, S10)
  ink: "#241F1B",
  charcoal: "#2A2426",
  card: "rgba(24,20,22,0.78)",
  white: "#FFFFFF",
  warn: "#E0675A",
};

export const W = 1080;
export const H = 1920;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1); // expo-ish out: fast arrival, long settle
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/* ------------------------------------------------------------------ data */

export type Pt = [number, number];
export type Landmarks = {
  size: [number, number];
  box: [number, number, number, number];
  noseW: number;
} & Record<string, Pt | number | [number, number, number, number]>;

/* --------------------------------------------------------------- placing */

/**
 * Where a portrait sits in the frame. `faceH` is the face-box height as a
 * fraction of frame height (shot size); `at` is where the anchor landmark
 * lands in the frame; `push` is the current push-in factor about the anchor.
 */
export type Framing = { faceH: number; anchor: string; at: Pt; push?: number };

export const place = (lm: Landmarks, fr: Framing) => {
  const [iw, ih] = lm.size;
  const bh = lm.box[3] * ih;
  const s0 = (fr.faceH * H) / bh;
  const s = s0 * (fr.push ?? 1);
  const a = lm[fr.anchor] as Pt;
  const x = fr.at[0] - a[0] * iw * s;
  const y = fr.at[1] - a[1] * ih * s;
  const pt = (p: Pt | string): Pt => {
    const q = typeof p === "string" ? (lm[p] as Pt) : p;
    return [x + q[0] * iw * s, y + q[1] * ih * s];
  };
  return { x, y, w: iw * s, h: ih * s, s, pt };
};

/** Mix two points: `lerpPt(a, b, 0.5)` is the midpoint. */
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/* ---------------------------------------------------------------- ground */

export const Ground: React.FC<{ color?: string }> = ({ color = C.blush }) => (
  <AbsoluteFill style={{ background: color }} />
);

/* ------------------------------------------------------- shutter portrait */

export type Shot = { from: number; src: string; flash?: boolean };

/**
 * A locked portrait whose SOURCE changes on cue. Each change is a 4-frame
 * cross-dissolve with a 2-frame 15% white flash (the pack's shutter morph).
 * Every source must share one pixel grid -- that is what makes only the
 * feature move. All shots are mounted at once so a switch never waits on
 * decode.
 */
export const ShutterPortrait: React.FC<{
  shots: Shot[];
  lm: Landmarks;
  framing: Framing;
  style?: React.CSSProperties;
}> = ({ shots, lm, framing, style }) => {
  const f = useCurrentFrame();
  const p = place(lm, framing);
  const srcs = Array.from(new Set(shots.map((s) => s.src)));
  let cur = 0;
  for (let i = 0; i < shots.length; i++) if (f >= shots[i].from) cur = i;
  const prev = cur > 0 ? shots[cur - 1].src : shots[0].src;
  const k = interpolate(f, [shots[cur].from, shots[cur].from + 4], [0, 1], clamp);
  const now = shots[cur].src;
  // prev sits underneath at full opacity, the new source dissolves in on top;
  // every other source stays mounted at 0 so a later switch never waits on decode
  return (
    <AbsoluteFill style={style}>
      {srcs.map((src) => {
        const o = src === now ? (cur === 0 || prev === now ? 1 : k) : src === prev ? 1 : 0;
        return (
          <Img
            key={src}
            src={staticFile(src)}
            style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, opacity: o, zIndex: src === now ? 2 : src === prev ? 1 : 0 }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** The pack's white flash: a 15% white veil for two frames on each cue. */
export const Flash: React.FC<{ at: number[]; peak?: number; len?: number }> = ({ at, peak = 0.15, len = 3 }) => {
  const f = useCurrentFrame();
  const o = Math.max(0, ...at.map((a) => interpolate(f, [a, a + 1, a + len], [0, peak, 0], clamp)));
  return o <= 0 ? null : <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/* --------------------------------------------------------------- header */

/** Charcoal rounded-square number badge, flips in. */
export const Badge: React.FC<{ n: number | string; from: number; size?: number }> = ({ n, from, size = 72 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - from, fps, config: { damping: 14, stiffness: 180, mass: 0.7 } });
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.22, background: C.charcoal, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT.serif, fontWeight: 700, fontSize: size * 0.56, lineHeight: 1,
        transform: `perspective(400px) rotateX(${(1 - sp) * -90}deg) scale(${0.6 + 0.4 * sp})`,
        opacity: Math.min(1, sp * 2), boxShadow: "0 10px 28px rgba(36,31,27,0.28)", flexShrink: 0,
      }}
    >
      {n}
    </div>
  );
};

/**
 * Top beat header at y210: optional badge + serif line. Words rise out of a
 * blur one after another; the whole header lifts away on `out`.
 */
export const Header: React.FC<{
  text: string;
  from: number;
  out?: number;
  n?: number | string;
  size?: number;
  y?: number;
  color?: string;
  caps?: boolean;
  maxW?: number;
}> = ({ text, from, out, n, size = 58, y = 210, color = C.ink, caps = false, maxW = 900 }) => {
  const f = useCurrentFrame();
  if (f < from - 1 || (out !== undefined && f > out + 10)) return null;
  const words = text.split(" ");
  const exit = out === undefined ? 0 : interpolate(f, [out, out + 9], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center",
        transform: `translateY(${-40 * exit}px)`, opacity: 1 - exit, filter: `blur(${exit * 8}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 26, maxWidth: maxW }}>
        {n !== undefined && <Badge n={n} from={from} />}
        <div
          style={{
            fontFamily: FONT.serif, fontWeight: 700, fontSize: size, lineHeight: 1.08, color,
            letterSpacing: caps ? "0.02em" : "-0.01em", textTransform: caps ? "uppercase" : "none",
            textAlign: n === undefined ? "center" : "left",
          }}
        >
          {words.map((w, i) => {
            const t = interpolate(f, [from + 3 + i * 2.2, from + 13 + i * 2.2], [0, 1], { ...clamp, easing: ease });
            return (
              <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: t, filter: `blur(${(1 - t) * 10}px)`, transform: `translateY(${(1 - t) * 26}px)` }}>
                {w + (i < words.length - 1 ? " " : "")}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- captions */

type Word = { t: string; w: string; f0: number; f1: number };

/**
 * Word-by-word lower-third captions: 3-5 word chunks, broken at punctuation,
 * active word solid white, the rest 45%. Timing is the voice's own (ElevenLabs
 * alignment), never spread across a slot. `hide` lists frame ranges where the
 * same words are already drawn as a header (no line shown twice).
 */
export const Captions: React.FC<{ words: Word[]; y?: number; hide?: [number, number][]; dark?: [number, number][]; size?: number }> = ({ words, y = 1420, hide = [], dark = [], size = 40 }) => {
  const f = useCurrentFrame();
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const end = /[.,?!;:]$/.test(w.t) || i === words.length - 1;
    const gap = i < words.length - 1 ? words[i + 1].f0 - w.f1 : 99;
    if (cur.length >= 4 || (end && cur.length >= 2) || gap > 9) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  const idx = chunks.findIndex((c, i) => f >= c[0].f0 && f < (chunks[i + 1]?.[0].f0 ?? c[c.length - 1].f1 + 18));
  if (idx < 0) return null;
  const ch = chunks[idx];
  if (hide.some(([a, b]) => ch[0].f0 >= a && ch[0].f0 < b)) return null;
  const tin = interpolate(f, [ch[0].f0 - 1, ch[0].f0 + 4], [0, 1], { ...clamp, easing: ease });
  // on a bare light ground white type disappears: ink instead (no portrait behind)
  const ink = dark.some(([a, b]) => f >= a && f < b);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: y, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 14px", transform: `translateY(${(1 - tin) * 14}px)`, opacity: tin }}>
      {ch.map((w, i) => {
        const on = f >= w.f0;
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT.italic, fontStyle: "italic", fontWeight: 500, fontSize: size, lineHeight: 1.25,
              color: ink ? (on ? C.ink : "rgba(36,31,27,0.38)") : on ? "#fff" : "rgba(255,255,255,0.45)",
              textShadow: ink ? "none" : "0 2px 3px rgba(20,14,16,0.55), 0 0 18px rgba(20,14,16,0.45)",
            }}
          >
            {w.t.replace(/[-–—]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------- vector overlays */

const stroke = { stroke: "#fff", strokeWidth: 3, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const glow = { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.55)) drop-shadow(0 1px 2px rgba(0,0,0,0.35))" };

/** 0 -> 1 over `dur` frames from `from`, eased; 1 -> 0 over 8 frames from `out`. */
export const draw = (f: number, from: number, dur = 10) => interpolate(f, [from, from + dur], [0, 1], { ...clamp, easing: ease });
export const fade = (f: number, out?: number) => (out === undefined ? 1 : interpolate(f, [out, out + 8], [1, 0], clamp));

/** A path that draws itself (strokeDashoffset), with optional dash pattern and end nodes. */
export const DrawPath: React.FC<{ d: string; from: number; out?: number; dur?: number; dash?: string; len?: number; nodes?: Pt[]; width?: number }> = ({ d, from, out, dur = 10, dash, len = 1400, nodes = [], width = 3 }) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const t = draw(f, from, dur);
  const o = fade(f, out);
  if (o <= 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o, ...glow }}>
      {dash ? (
        <>
          <mask id={`m${from}${d.length}`}>
            <path d={d} {...stroke} stroke="#fff" strokeWidth={width + 4} strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
          </mask>
          <path d={d} {...stroke} strokeWidth={width} strokeDasharray={dash} mask={`url(#m${from}${d.length})`} />
        </>
      ) : (
        <path d={d} {...stroke} strokeWidth={width} strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
      )}
      {nodes.map((n, i) => {
        const nt = interpolate(f, [from + dur * (i === 0 ? 0 : 0.8), from + dur * (i === 0 ? 0 : 0.8) + 6], [0, 1], clamp);
        return <circle key={i} cx={n[0]} cy={n[1]} r={9 * nt} fill="#fff" stroke="rgba(36,31,27,0.5)" strokeWidth={1} />;
      })}
    </svg>
  );
};

export const line = (a: Pt, b: Pt) => `M${a[0]},${a[1]} L${b[0]},${b[1]}`;
export const quad = (a: Pt, c: Pt, b: Pt) => `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`;

/** Angle arc at `at` between two directions (degrees, 0 = right, clockwise +), with a label. */
export const AngleArc: React.FC<{ at: Pt; a0: number; a1: number; r?: number; from: number; out?: number; label: string; labelAt?: Pt }> = ({ at, a0, a1, r = 70, from, out, label, labelAt }) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const t = draw(f, from, 12);
  const o = fade(f, out);
  const a = a0 + (a1 - a0) * t;
  const rad = (d: number) => (d * Math.PI) / 180;
  const p0: Pt = [at[0] + r * Math.cos(rad(a0)), at[1] + r * Math.sin(rad(a0))];
  const p1: Pt = [at[0] + r * Math.cos(rad(a)), at[1] + r * Math.sin(rad(a))];
  const large = Math.abs(a - a0) > 180 ? 1 : 0;
  const sweep = a > a0 ? 1 : 0;
  const ray = (d: number, k: number): Pt => [at[0] + r * 1.7 * k * Math.cos(rad(d)), at[1] + r * 1.7 * k * Math.sin(rad(d))];
  const lp = labelAt ?? [at[0] + (r + 60) * Math.cos(rad((a0 + a1) / 2)), at[1] + (r + 60) * Math.sin(rad((a0 + a1) / 2))];
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o, ...glow }}>
        <path d={line(at, ray(a0, Math.min(1, t * 2)))} {...stroke} strokeWidth={2.5} strokeDasharray="8 8" />
        <path d={line(at, ray(a1, t))} {...stroke} strokeWidth={2.5} strokeDasharray="8 8" />
        <path d={`M${p0[0]},${p0[1]} A${r},${r} 0 ${large} ${sweep} ${p1[0]},${p1[1]}`} {...stroke} strokeWidth={3.5} />
        <circle cx={at[0]} cy={at[1]} r={7} fill="#fff" />
      </svg>
      <Tag text={label} at={lp} from={from + 8} out={out} />
    </>
  );
};

/** Small white label pill (dark text) - for measurement read-outs. */
export const Tag: React.FC<{ text: string; at: Pt; from: number; out?: number; align?: "center" | "left" | "right"; size?: number }> = ({ text, at, from, out, align = "center", size = 30 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from) return null;
  const sp = spring({ frame: f - from, fps, config: { damping: 15, stiffness: 220 } });
  const o = fade(f, out);
  // keep the pill inside the safe zone (x 90..990): estimate its width from the text
  const estW = text.length * size * 0.56 + 40;
  const left = align === "center" ? at[0] - estW / 2 : align === "right" ? at[0] - estW : at[0];
  const shift = Math.min(0, 990 - (left + estW)) + Math.max(0, 90 - left);
  const tx = `calc(${align === "center" ? "-50%" : align === "right" ? "-100%" : "0%"} + ${shift}px)`;
  return (
    <div
      style={{
        position: "absolute", left: at[0], top: at[1], transform: `translate(${tx}, -50%) scale(${0.7 + 0.3 * sp})`, opacity: o * Math.min(1, sp * 1.6),
        background: "#fff", color: C.ink, fontFamily: FONT.sans, fontWeight: 600, fontSize: size, padding: "8px 18px", borderRadius: 999,
        whiteSpace: "nowrap", boxShadow: "0 8px 22px rgba(36,31,27,0.25)", letterSpacing: "0.01em",
      }}
    >
      {text}
    </div>
  );
};

/**
 * Dark translucent callout card with a 2px pointer line and a 6px dot on the
 * feature (pack spec). The line draws from the dot to the card, then the card
 * pops. `tone="warn"` gives the red warning variant.
 */
export const Callout: React.FC<{ title: string; sub?: string; dot: Pt; card: Pt; from: number; out?: number; tone?: "dark" | "warn"; align?: "left" | "right" }> = ({ title, sub, dot, card, from, out, tone = "dark", align = "left" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from) return null;
  const t = draw(f, from, 9);
  const o = fade(f, out);
  const sp = spring({ frame: f - from - 6, fps, config: { damping: 16, stiffness: 200 } });
  const end: Pt = lerpPt(dot, card, t);
  const dotR = interpolate(f, [from, from + 5], [0, 7], clamp);
  const ring = interpolate((f - from) % 40, [0, 40], [0, 1]);
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
        <circle cx={dot[0]} cy={dot[1]} r={dotR + 18 * ring} fill="none" stroke="#fff" strokeOpacity={0.6 * (1 - ring)} strokeWidth={2} />
        <path d={line(dot, end)} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" style={glow} />
        <circle cx={dot[0]} cy={dot[1]} r={dotR} fill={tone === "warn" ? C.warn : "#fff"} stroke="#fff" strokeWidth={2} />
      </svg>
      <div
        style={{
          position: "absolute", left: card[0], top: card[1], opacity: o * Math.min(1, sp * 1.5),
          transform: `translate(${align === "left" ? "0%" : "-100%"}, -50%) scale(${0.82 + 0.18 * sp})`,
          transformOrigin: align === "left" ? "left center" : "right center",
          background: tone === "warn" ? "rgba(120,28,24,0.82)" : C.card, border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: 18, padding: "18px 26px", color: "#fff", backdropFilter: "blur(10px)",
          boxShadow: "0 16px 40px rgba(20,14,16,0.35)", maxWidth: 440,
        }}
      >
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, lineHeight: 1.15, whiteSpace: "nowrap" }}>{title}</div>
        {sub && <div style={{ fontFamily: FONT.sans, fontWeight: 400, fontSize: 26, opacity: 0.78, marginTop: 6, whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ pill */

/** Rounded white-outlined comment prompt with a speech-bubble glyph. */
export const CommentPill: React.FC<{ text: string; strong?: string; from: number; out?: number; y?: number; dark?: boolean }> = ({ text, strong, from, out, y = 1180, dark = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from) return null;
  const sp = spring({ frame: f - from, fps, config: { damping: 12, stiffness: 170, mass: 0.8 } });
  const o = fade(f, out);
  const wob = Math.sin((f - from) / 6) * Math.max(0, 1 - (f - from) / 30) * 3;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 18, padding: "22px 38px", borderRadius: 999,
          background: dark ? C.charcoal : "rgba(255,255,255,0.96)", color: dark ? "#fff" : C.ink, border: "3px solid #fff",
          fontFamily: FONT.sans, fontWeight: 600, fontSize: 40, transform: `scale(${0.5 + 0.5 * sp}) rotate(${wob}deg)`,
          boxShadow: "0 18px 44px rgba(36,31,27,0.30)",
        }}
      >
        <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
        </svg>
        <span>
          {text}
          {strong && <b style={{ fontWeight: 800 }}> {strong}</b>}
        </span>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------- phone */

/**
 * iPhone mockup. Children render into the 9:19.5 screen. Scales in on a
 * spring with a lifting shadow; `exitTo` slides/scales it to a new spot.
 */
export const Phone: React.FC<{ from: number; cx?: number; cy?: number; w?: number; children: React.ReactNode; move?: { at: number; cx: number; cy: number; w: number } }> = ({ from, cx = 540, cy = 860, w = 560, children, move }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from) return null;
  const sp = spring({ frame: f - from, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  const mv = move ? spring({ frame: f - move.at, fps, config: { damping: 18, stiffness: 110 } }) : 0;
  const X = cx + (move ? (move.cx - cx) * mv : 0);
  const Y = cy + (move ? (move.cy - cy) * mv : 0) + (1 - sp) * 900;
  const PW = w + (move ? (move.w - w) * mv : 0);
  const PH = PW * 2.06;
  const bez = PW * 0.035;
  const tilt = (1 - sp) * 14;
  return (
    <div
      style={{
        position: "absolute", left: X - PW / 2, top: Y - PH / 2, width: PW, height: PH, borderRadius: PW * 0.15,
        background: "#121012", padding: bez, transform: `perspective(1600px) rotateX(${tilt}deg) scale(${0.85 + 0.15 * sp})`,
        boxShadow: `0 ${40 + 30 * sp}px ${90 + 30 * sp}px rgba(36,31,27,${0.25 + 0.15 * sp}), inset 0 0 0 2px #3a3436`,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: PW * 0.12, overflow: "hidden", background: "#FBF8F5" }}>
        {children}
        <div style={{ position: "absolute", top: PW * 0.03, left: "50%", width: PW * 0.3, height: PW * 0.085, marginLeft: -PW * 0.15, borderRadius: 999, background: "#000" }} />
        <div style={{ position: "absolute", bottom: PW * 0.025, left: "50%", width: PW * 0.34, height: 6, marginLeft: -PW * 0.17, borderRadius: 999, background: "rgba(0,0,0,0.45)" }} />
      </div>
    </div>
  );
};

/** Screen-local push transition: content slides in from the right over `dur` frames. */
export const ScreenPush: React.FC<{ from: number; to?: number; children: React.ReactNode; dur?: number }> = ({ from, to, children, dur = 12 }) => {
  const f = useCurrentFrame();
  if (f < from || (to !== undefined && f >= to + dur)) return null;
  const tin = from === 0 ? 1 : interpolate(f, [from, from + dur], [0, 1], { ...clamp, easing: easeInOut });
  const tout = to === undefined ? 0 : interpolate(f, [to, to + dur], [0, 1], { ...clamp, easing: easeInOut });
  return <AbsoluteFill style={{ transform: `translateX(${(1 - tin) * 100 - tout * 30}%)`, filter: `brightness(${1 - tout * 0.35})`, zIndex: from }}>{children}</AbsoluteFill>;
};

/** "AI preview, illustrative" - the label the pack requires under every app shot. */
export const AiLabel: React.FC<{ from: number; out?: number; y?: number; x?: number }> = ({ from, out, y = 1515, x = 540 }) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const o = interpolate(f, [from, from + 8], [0, 1], clamp) * fade(f, out);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", opacity: o, fontFamily: FONT.sans, fontWeight: 600, fontSize: 28, letterSpacing: "0.14em", color: C.ink, textTransform: "uppercase", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 10, height: 10, borderRadius: 99, background: C.ink, opacity: 0.6 }} />
      AI preview, illustrative
    </div>
  );
};

/* ----------------------------------------------------------------- sound */

/** A spot effect with a tail ramp (every cue is truncated, so every cue needs one). */
export const Sfx: React.FC<{ name: string; at: number; volume?: number; dur?: number; fadeLen?: number }> = ({ name, at, volume = 0.25, dur = 30, fadeLen = 8 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${name}`)} volume={(fr) => volume * interpolate(fr, [Math.max(0, dur - fadeLen), dur - 1], [1, 0], clamp)} />
  </Sequence>
);

export { ease, easeInOut };
