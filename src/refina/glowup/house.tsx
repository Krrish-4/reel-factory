/**
 * House pieces shared by the Glow Up reels (S5 on). Everything here is the
 * refina-reel house treatment - SectionHeadline, the Bangs caption track,
 * Tag/Mono/AiChip, trio sfx with ONSET, the typing-bar ending - wrapped once
 * so a reel file only carries its own devices. GlowupS2 predates this module
 * and keeps its own copies (it is a delivered cut; do not churn it).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { headlineItalicStack, headlineStack, serifFont } from "../../fonts";
import { SectionHeadline } from "../preview/draw";
import { AiChip, Mono, Tag } from "../ratio/atoms";
import { TypewriterInput } from "../kit";
import type { Pt } from "./kit";

export const FPS = 30;
export const MARK = "rgba(255,255,255,0.95)";
export const INK = "#1C2629";
export const WARN = "#E8857A";
export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const inOut = Easing.inOut(Easing.cubic);

type Word = { t: string; w: string; f0: number; f1: number };
type Cue = { s: string; f: number; t: number; w: number[] };

/** frame where the nth occurrence of `word` starts (1-based); throws if the read changed */
export const makeAt = (words: Word[], reel: string) => (word: string, nth = 1): number => {
  const k = word.toLowerCase().replace(/[^a-z0-9']/g, "");
  let n = 0;
  for (const w of words) if (w.w === k && ++n === nth) return w.f0;
  throw new Error(`${reel}: word "${word}" #${nth} not in the read`);
};

/** House headline held for an absolute span. */
export const Head: React.FC<{ lines: string[]; from: number; until: number }> = ({ lines, from, until }) => (
  <Sequence from={from} durationInFrames={Math.max(1, until - from)} layout="none">
    <SectionHeadline lines={lines} len={until - from} from={2} out={10} italicSecond={lines.length > 1} />
  </Sequence>
);

/** Mono text decoding in out of scrambled glyphs. */
const GLYPHS = "ABCDEFGHIKLMNOPRSTUVWXYZ0123456789";
export const Decode: React.FC<{ text: string; t: number; size?: number; o?: number }> = ({ text, t, size = 22, o = 0.95 }) => {
  const f = useCurrentFrame();
  const k = f - t;
  if (k < 0) return null;
  const shown = text.split("").map((c, i) => (c === " " || k >= i * 0.9 + 6 ? c : GLYPHS[(i * 7 + Math.floor(k / 2) * 13) % GLYPHS.length])).join("");
  return <Mono size={size} o={o * interpolate(k, [0, 4], [0, 1], cl)}>{shown}</Mono>;
};

/** Italic serif label whose words blur in (house reveal), optional mono line under it. */
export const Label: React.FC<{ text: string; mono?: string; t: number; out?: number; x: number; y: number; align?: "left" | "center"; size?: number }> = ({ text, mono, t, out, x, y, align = "center", size = 62 }) => {
  const f = useCurrentFrame();
  if (f < t - 1 || (out !== undefined && f > out + 10)) return null;
  const o = out === undefined ? 1 : interpolate(f, [out, out + 8], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: align === "center" ? "translateX(-50%)" : undefined, textAlign: align, opacity: o, filter: `blur(${(1 - o) * 8}px)`, whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: size, lineHeight: 1.0, color: "#fff", textShadow: "0 2px 16px rgba(16,24,28,0.35)" }}>
        {text.split(" ").map((w, i) => {
          const k = interpolate(f, [t + i * 2.5, t + 9 + i * 2.5], [0, 1], cl);
          return <span key={i} style={{ display: "inline-block", opacity: k, filter: `blur(${(1 - k) * 10}px)`, marginRight: "0.22em" }}>{w}</span>;
        })}
      </div>
      {mono && <div style={{ marginTop: 10, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}><Decode text={mono} t={t + 8} size={22} /></div>}
    </div>
  );
};

/** A tag that pops at a frame point, centred on it. */
export const TagPop: React.FC<{ at: Pt; t: number; out?: number; text: string; live?: boolean; size?: number }> = ({ at, t, out, text, live, size = 22 }) => {
  const f = useCurrentFrame();
  if (f < t || (out !== undefined && f > out + 8)) return null;
  const o = interpolate(f, [t, t + 5], [0, 1], cl) * (out === undefined ? 1 : interpolate(f, [out, out + 8], [1, 0], cl));
  const s = interpolate(f, [t, t + 5, t + 10], [0.85, 1.05, 1], cl);
  return (
    <div style={{ position: "absolute", left: at[0], top: at[1], transform: `translate(-50%,-50%) scale(${s})`, opacity: o, zIndex: 6 }}>
      <Tag size={size} tone={live ? "live" : "plain"}>{text}</Tag>
    </div>
  );
};

/** A white line drawn on with progress p (house Path). */
export const Path: React.FC<{ d: string; p: number; w?: number; dash?: string; o?: number; color?: string }> = ({ d, p, w = 3, dash, o = 1, color = MARK }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} opacity={o} pathLength={dash ? undefined : 1} strokeDasharray={dash ?? 1}
    strokeDashoffset={dash ? 0 : 1 - Math.max(0, Math.min(1, p))} strokeLinecap="round" strokeLinejoin="round" />
);
export const draw = (f: number, t: number, d = 10) => interpolate(f, [t, t + d], [0, 1], { ...cl, easing: ease });

/** Hand-drawn arrow: a gentle curve with an open head. */
export const arrowPath = (from: Pt, to: Pt, bend = 0.25) => {
  const mx = (from[0] + to[0]) / 2 - (to[1] - from[1]) * bend;
  const my = (from[1] + to[1]) / 2 + (to[0] - from[0]) * bend;
  const ang = Math.atan2(to[1] - my, to[0] - mx);
  const h = 20;
  const a1: Pt = [to[0] - h * Math.cos(ang - 0.5), to[1] - h * Math.sin(ang - 0.5)];
  const a2: Pt = [to[0] - h * Math.cos(ang + 0.5), to[1] - h * Math.sin(ang + 0.5)];
  return `M${from[0]},${from[1]} Q${mx},${my} ${to[0]},${to[1]} M${a1[0]},${a1[1]} L${to[0]},${to[1]} L${a2[0]},${a2[1]}`;
};

/** The house caption track (Bangs), on a reel's phrase cues. `skip` drops cues whose words are drawn elsewhere. */
export const Captions: React.FC<{ cues: Cue[]; skip?: (c: Cue, i: number) => boolean }> = ({ cues, skip }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", bottom: "6.5%", left: 0, right: 0, height: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 70px", zIndex: 30 }}>
      {cues.map((c, i) => {
        if (frame < c.f - 6 || frame > c.t + 6) return null;
        if (skip && skip(c, i)) return null;
        const outO = interpolate(frame, [c.t - 7, c.t], [1, 0], cl);
        return (
          <div key={i} style={{ position: "absolute", left: 70, right: 70, textAlign: "center", fontFamily: serifFont, fontStyle: "italic", fontSize: 42, color: "#fff", lineHeight: 1.3, textShadow: "0 2px 14px rgba(16,24,28,0.72)", opacity: outO }}>
            {c.s.split(" ").map((w, k) => {
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

/** trio sfx, trimmed by each file's measured onset so the hit lands on `at`. */
const ONSET: Record<string, number> = { "swoosh-thin": 0.37, "swoosh-fast": 0.3, "air-whoosh-8": 0.19, "air-whoosh-5": 0.23, "light-whoosh": 0.12, "tap-soft": 0, "click-soft": 0, "click-interface": 0.02, shutter: 0.6, "pop-minimal": 0.14, "notify-soft": 0.12, "boom-soft": 0 };
export const Fx: React.FC<{ n: string; at: number; v?: number; dur?: number }> = ({ n, at: t, v = 0.28, dur = 30 }) => {
  const start = Math.max(0, Math.round(t - (ONSET[n] ?? 0) * FPS));
  return (
    <Sequence from={start} durationInFrames={dur} layout="none">
      <Audio src={staticFile(`sfx/trio/${n.includes(".") ? n : `${n}.mp3`}`)} volume={(fr) => v * interpolate(fr, [dur - 8, dur - 1], [1, 0], cl)} />
    </Sequence>
  );
};

/** House opening flash (plus any extra cue frames). */
export const Flashes: React.FC<{ cues: number[]; first?: number; peak?: number }> = ({ cues, first = 0.26, peak = 0.16 }) => {
  const f = useCurrentFrame();
  const o = Math.max(0, ...cues.map((a, i) => interpolate(f, [a, a + 1, a + 9], [0, i === 0 ? first : peak, 0], { ...cl, easing: Easing.out(Easing.quad) })));
  return o > 0.001 ? <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none", zIndex: 40 }} /> : null;
};

/** The real Cosmetic Preview screen with a sample user's before/after in its photo slot. */
export const CosmeticPreview: React.FC<{ t0: number; before: string; after: string; pos?: string }> = ({ t0, before, after, pos = "50% 40%" }) => {
  const f = useCurrentFrame();
  const R = { x: 14 / 558, y: 314 / 1311, w: 522 / 558, h: 526 / 1311 }; // photo slot, measured on screens_trim/cosmetic-preview.png
  const t = interpolate(f, [t0 + 8, t0 + 36, t0 + 52, t0 + 66], [0.12, 0.88, 0.88, 0.5], { ...cl, easing: inOut });
  const chip = { position: "absolute" as const, top: 10, borderRadius: 99, padding: "3px 10px", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" };
  return (
    <AbsoluteFill>
      <Img src={staticFile("s5/app/ui/cosmetic-preview.png")} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", left: `${R.x * 100}%`, top: `${R.y * 100}%`, width: `${R.w * 100}%`, height: `${R.h * 100}%`, borderRadius: 14, overflow: "hidden", background: "#fff" }}>
        <Img src={staticFile(after)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` }}>
          <Img src={staticFile(before)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
        </div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${t * 100}%`, width: 2, background: "#fff", transform: "translateX(-1px)" }} />
        <div style={{ position: "absolute", top: "52%", left: `${t * 100}%`, width: 34, height: 34, marginLeft: -17, borderRadius: 99, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }} />
        <div style={{ ...chip, left: 10, background: "#fff", color: "#222" }}>BEFORE</div>
        <div style={{ ...chip, right: 10, background: "rgba(255,255,255,0.9)", color: "#C6898A" }}>AFTER</div>
      </div>
    </AbsoluteFill>
  );
};

/** The house ending (typing bar) pointed at the comment keyword. */
export const CommentEnd: React.FC<{ from: number; keyAt: number }> = ({ from, keyAt }) => {
  const f = useCurrentFrame();
  if (f < from - 2) return null;
  const k = f - from;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {["Comment", "DOSSIER"].map((t, i) => {
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
        <TypewriterInput text="DOSSIER" startFrame={keyAt} width={700} fontSize={38} placeholder="Add a comment..." icon={false} framesPerChar={2} />
      </div>
      <AiChip y={430} size={26} />
    </AbsoluteFill>
  );
};
