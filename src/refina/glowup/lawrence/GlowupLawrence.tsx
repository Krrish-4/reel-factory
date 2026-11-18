/**
 * GlowupLawrence - RefinaLawrence ("Her Own List", out/refina-lawrence-v2.mp4)
 * rebuilt as a Glow Up pack reel, 2026-11-17. Pack format S1 (celebrity work
 * read) with a question hook, on Rahul's photos of Jennifer Lawrence (rights
 * stated by him). ONLY what she has said herself (Vogue / The New Yorker /
 * InStyle); no rumour is shown or implied - the old grid's "EYELIDS?" tags are gone.
 * Script: docs/scripts/glowup-lawrence.txt. VO: ElevenLabs Sarah x1.12 + atempo 1.1.
 *
 * House sage treatment; device set distinct from S2, S5 and GlowupSize:
 *   hook     2x3 grid of her photos snaps in; a REDACTED procedure chip; grid collapses into her cutout
 *   open     two rubber STAMPS slam: BOTOX - YES, FILLERS - NO
 *   list     venetian-blind change to her forehead-clear portrait; a numbered list builds on
 *            her shirt; forehead dots + live wave lines (movement), a syringe struck out,
 *            the redaction decodes to BUCCAL FAT REMOVAL, cheek hollows shaded, a quote card
 *   why      push to the illustrative face; a width bar locks on the widest row; the cheek
 *            contour caves in; eyes -> cheeks -> jaw guides cascade
 *   ask      a TELL / KEEP QUIET toggle flips on the words
 *   mistake  her card and your card; her list note tries your card and bounces back
 *   plug     phone rises straight up: Dossier cheeks / skin / jaw -> Your Result wipe -> 3D turn
 *   close    a "doctor says" bubble pops, her list card is tossed, the last line rises
 * Every cue is a WORD of the read via at(); landmarks via place().
 */
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { headlineItalicStack, headlineStack, sansFont } from "../../../fonts";
import { Stage } from "../../protocol/atoms";
import { AiChip, Tag } from "../../ratio/atoms";
import { Framing, Landmarks, Pt, place } from "../kit";
import { Captions, CommentEnd, Decode, FPS, Flashes, Fx, Head, INK, MARK, Path, TagPop, WARN, arrowPath, cl, draw, ease, inOut, makeAt } from "../house";
import { CUES, PORTRAITS, VO_FRAMES, WORDS } from "./data";

const TAIL = 45;
const W = 1080;
const H = 1920;
export const LAWRENCE_FRAMES = VO_FRAMES + TAIL;

const at = makeAt(WORDS, "GlowupLawrence");
const T = {
  jennifer: at("jennifer"), procedure: at("procedure"), wants: at("wants?"), shes: at("she's"), botox: at("botox"), yes: at("yes"), fillers: at("fillers"), no: at("no"),
  one2: at("one", 2), botox2: at("botox", 2), little: at("little"), vogue: at("vogue"), movement: at("movement"), act: at("act"),
  two: at("two"), no2: at("no", 2), fillers2: at("fillers", 2), yorker: at("yorker"),
  three: at("three"), buccal: at("buccal"), removal: at("removal"), cant: at("can't"), everybody: at("everybody"), know: at("know"), right: at("right"),
  your: at("your"), cheeks: at("cheeks"), widest: at("widest"), hollow: at("hollow"), whole: at("whole"), eyes: at("eyes"), jaw: at("jaw"),
  if: at("if"), tell: at("tell"), quiet: at("quiet"), comment: at("comment"),
  her3: at("her", 3), list: at("list"), not: at("not"), yours: at("yours"),
  refinas: at("refina's"), cheeks2: at("cheeks", 2), skin: at("skin"), jaw2: at("jaw", 2), preview: at("preview"), turn: at("turn"),
  dont: at("don't"), doctor: at("doctor"), copy: at("copy"), did: at("did"), preview2: at("preview", 2), own2: at("own", 2), first2: at("first", 2),
  comment2: at("comment", 2), dossier: at("dossier"),
};

/* ── stills ─────────────────────────────────────────────────────────── */

const P = (n: string) => `lawrence/portraits/${n}.png`;
const LM = (n: string): Landmarks => PORTRAITS[n];
const HERO: Framing = { faceH: 0.3, anchor: "noseTip", at: [540, 1150] };
const ILLUS: Framing = { faceH: 0.38, anchor: "noseTip", at: [540, 1120] };
const hpF = place(LM("front_base"), HERO);
const hpA = place(LM("alt_base"), HERO);
const ip = place(LM("illus_base"), ILLUS);

const Pic: React.FC<{ img: string; p: ReturnType<typeof place>; style?: React.CSSProperties }> = ({ img, p, style }) => (
  <Img src={staticFile(P(img))} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, maxWidth: "none", ...style }} />
);

/* geometry derived from the five detected points (no typed coordinates) */
const geo = (p: ReturnType<typeof place>, lm: Landmarks) => {
  const eA = p.pt("eyeA"), eB = p.pt("eyeB"), n = p.pt("noseTip"), m = p.pt("mouth"), mA = p.pt("mouthA"), mB = p.pt("mouthB"), ch = p.pt("chin"), brow = p.pt("brow");
  const box = lm.box as [number, number, number, number];
  const [bx0] = p.pt([box[0], box[1]]), [bx1] = p.pt([box[0] + box[2], box[1]]);
  const eyeD = eB[0] - eA[0];
  const cheekY = (eA[1] + n[1]) / 2 + eyeD * 0.08;
  return {
    eA, eB, n, m, mA, mB, ch, brow, eyeD,
    forehead: [ (eA[0] + eB[0]) / 2, brow[1] - eyeD * 0.42 ] as Pt,
    cheekY, faceL: bx0 + eyeD * 0.06, faceR: bx1 - eyeD * 0.06,
    hollowA: [mA[0] - eyeD * 0.42, (n[1] + m[1]) / 2] as Pt, hollowB: [mB[0] + eyeD * 0.42, (n[1] + m[1]) / 2] as Pt,
  };
};
const GA = geo(hpA, LM("alt_base"));
const GI = geo(ip, LM("illus_base"));

/* ── hook: the grid, the redaction, the collapse ────────────────────── */

const TW = 300, TH = 394, TG = 20;
const GX0 = (W - (TW * 3 + TG * 2)) / 2, GY0 = 480;
const Grid: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= T.shes + 4) return null;
  const col = interpolate(f, [T.wants - 4, T.shes + 2], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      {[1, 2, 3, 4, 5, 6].map((k, i) => {
        const r = Math.floor(i / 3), c = i % 3;
        const t0 = i * 4;
        const sIn = interpolate(f, [t0, t0 + 6, t0 + 10], [1.25, 0.97, 1], cl);
        const o = interpolate(f, [t0, t0 + 3], [0, 1], cl);
        const x = GX0 + c * (TW + TG), y = GY0 + r * (TH + TG);
        const cx = 540 - (x + TW / 2), cy = 980 - (y + TH / 2);
        const rot = ((i * 37) % 11) - 5;
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, width: TW, height: TH, borderRadius: 22, overflow: "hidden", opacity: o * (1 - col), transform: `translate(${cx * col}px, ${cy * col}px) scale(${sIn * (1 - 0.5 * col)}) rotate(${rot * col}deg)`, boxShadow: "0 18px 40px rgba(20,32,36,0.3)" }}>
            <Img src={staticFile(`lawrence/grid/grid${k}.jpg`)} style={{ width: TW, height: TH, objectFit: "cover" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Redacted: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.procedure - 2 || f >= T.shes + 2) return null;
  const sp = spring({ frame: f - (T.procedure - 2), fps, config: { damping: 13, stiffness: 170 } });
  const out = interpolate(f, [T.shes - 6, T.shes + 2], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1350, display: "flex", justifyContent: "center", opacity: out, transform: `scale(${0.8 + 0.2 * sp})`, zIndex: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(28,38,41,0.85)", borderRadius: 18, padding: "18px 28px", boxShadow: "0 20px 50px rgba(16,24,28,0.4)" }}>
        <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 26, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em" }}>THE ONE SHE WANTS:</span>
        <span style={{ display: "inline-block", width: 300 * Math.min(1, sp), height: 34, background: "#fff", borderRadius: 4 }} />
      </div>
    </div>
  );
};

/* ── the hero: front -> (blinds) forehead-clear -> push to the illustrative face ── */

const SLATS = 9;
const Hero: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.wants - 6 || f >= T.her3 + 4) return null;
  const rise = interpolate(f, [T.wants - 6, T.shes + 6], [520, 0], { ...cl, easing: ease });
  const riseO = interpolate(f, [T.wants - 6, T.wants + 4], [0, 1], cl);
  // venetian blinds on "One:": slats of the second portrait close over the first
  const blinds = (i: number) => interpolate(f, [T.one2 - 4 + i * 1.2, T.one2 + 6 + i * 1.2], [0, 1], { ...cl, easing: inOut });
  // push to the illustrative face on "Your"
  const push = interpolate(f, [T.your - 8, T.your + 10], [0, 1], { ...cl, easing: inOut });
  // the toggle dims her; she leaves on "Her list"
  const dim = interpolate(f, [T.if - 4, T.if + 8, T.her3 - 8, T.her3], [0, 1, 1, 1], cl);
  const back = f >= T.if - 8; // after the mechanism, her front portrait returns behind the toggle
  const out = interpolate(f, [T.her3 - 8, T.her3 + 2], [1, 0], cl);
  const slatH = H / SLATS;
  if (back) {
    const k = interpolate(f, [T.if - 8, T.if + 6], [0, 1], { ...cl, easing: ease });
    return (
      <AbsoluteFill style={{ opacity: k * out, filter: `brightness(${1 - 0.5 * dim}) blur(${dim * 3}px)` }}>
        <Pic img="front_base" p={hpF} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${-push * W}px, ${rise}px)`, opacity: riseO }}>
        <Pic img="front_base" p={hpF} />
        {f >= T.one2 - 4 && Array.from({ length: SLATS }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, top: i * slatH, width: W, height: slatH, overflow: "hidden", transform: `scaleY(${blinds(i)})`, transformOrigin: "50% 0" }}>
            <Img src={staticFile(P("alt_base"))} style={{ position: "absolute", left: hpA.x, top: hpA.y - i * slatH, width: hpA.w, height: hpA.h, maxWidth: "none" }} />
          </div>
        ))}
      </AbsoluteFill>
      {push > 0 && (
        <AbsoluteFill style={{ transform: `translateX(${(1 - push) * W}px)` }}>
          <Pic img="illus_base" p={ip} />
        </AbsoluteFill>
      )}
      {f < T.one2 && f >= T.shes && (
        <div style={{ position: "absolute", left: 60, top: 1470, display: "flex", flexDirection: "column", gap: 4 }}>
          <Decode text="JENNIFER LAWRENCE" t={T.shes} size={22} />
          <Decode text="PHOTOGRAPH, EDITED BACKDROP" t={T.shes + 4} size={20} o={0.8} />
        </div>
      )}
      {push > 0.9 && f < T.if - 8 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1478, display: "flex", justifyContent: "center" }}>
          <Tag size={22}>ILLUSTRATIVE FACE · NOT JENNIFER LAWRENCE</Tag>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ── "Botox, yes. Fillers, no." - two rubber stamps ──────────────────── */

const Stamp: React.FC<{ t: number; text: string; ok: boolean; x: number; y: number; rot: number; out: number }> = ({ t, text, ok, x, y, rot, out }) => {
  const f = useCurrentFrame();
  if (f < t - 2 || f >= out + 8) return null;
  const s = interpolate(f, [t - 2, t + 3, t + 7], [2.2, 0.94, 1], { ...cl, easing: Easing.out(Easing.quad) });
  const o = interpolate(f, [t - 2, t + 2], [0, 1], cl) * interpolate(f, [out, out + 8], [1, 0], cl);
  const c = ok ? "#fff" : WARN;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: o, zIndex: 7 }}>
      <div style={{ border: `6px solid ${c}`, borderRadius: 18, padding: "14px 30px", fontFamily: headlineStack, fontSize: 64, letterSpacing: "0.06em", color: c, background: "rgba(28,38,41,0.42)", boxShadow: "0 18px 40px rgba(16,24,28,0.35)", whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
};

/* ── the list on her shirt, and the marks on her face ───────────────── */

const ROWS = [
  { n: "01", s: "BOTOX, A LITTLE", src: "VOGUE, SEP 2026", t: T.one2 },
  { n: "02", s: "NO FILLERS", src: "THE NEW YORKER, OCT 2025", t: T.two },
  { n: "03", s: "BUCCAL FAT REMOVAL", src: "INSTYLE, OCT 2026", t: T.three },
];
const List: React.FC<{ y0?: number; t0?: number; out: number; small?: boolean }> = ({ y0 = 1420, out, small }) => {
  const f = useCurrentFrame();
  if (f >= out + 8) return null;
  const o = interpolate(f, [out, out + 8], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: small ? 0 : 90, top: y0, opacity: o, display: "flex", flexDirection: "column", gap: small ? 10 : 8, zIndex: 6 }}>
      {ROWS.map((r, i) => {
        if (f < r.t) return null;
        const k = interpolate(f, [r.t, r.t + 10], [0, 1], { ...cl, easing: ease });
        const live = !small && (i === ROWS.length - 1 || f < ROWS[i + 1].t);
        const redacted = i === 2 && f < T.buccal;
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 18, opacity: k * (live || small ? 1 : 0.5), transform: `translateX(${(1 - k) * -40}px)` }}>
            <span style={{ fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: small ? 34 : 52, color: "#fff" }}>{r.n}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {redacted ? (
                <span style={{ display: "inline-block", width: 340, height: 36, background: "#fff", borderRadius: 4, marginTop: 6 }} />
              ) : i === 2 && !small ? (
                <Decode text={r.s} t={T.buccal} size={38} o={1} />
              ) : (
                <span style={{ fontFamily: headlineStack, fontSize: small ? 28 : 40, letterSpacing: "0.04em", color: "#fff" }}>{r.s}</span>
              )}
              {!small && live && f >= r.t + 8 && <Decode text={`SOURCE: ${r.src}`} t={i === 0 ? T.vogue : i === 1 ? T.yorker - 6 : T.removal} size={18} o={0.8} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const FaceMarks: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.botox2 || f >= T.your - 6) return null;
  const G = GA;
  const fade = (a: number, b: number) => interpolate(f, [a, a + 6, b - 6, b], [0, 1, 1, 0], cl);
  // Botox: three small dots ("a little"), then live wave lines ("movement")
  const dots: Pt[] = [-0.32, 0, 0.32].map((k) => [G.forehead[0] + k * G.eyeD, G.forehead[1] + Math.abs(k) * 12]);
  const waves = [0, 1, 2].map((r) => {
    const y = G.forehead[1] - 40 + r * 34, x0 = G.forehead[0] - G.eyeD * 0.6, x1 = G.forehead[0] + G.eyeD * 0.6;
    const ph = (f - T.movement) * 0.35 + r;
    const pts = Array.from({ length: 25 }).map((_, i) => {
      const x = x0 + ((x1 - x0) * i) / 24;
      return `${i === 0 ? "M" : "L"}${x},${y + Math.sin(i * 0.7 + ph) * 6}`;
    });
    return pts.join(" ");
  });
  // no fillers: a syringe at the cheek, struck through
  const sy = G.hollowB;
  const syP = draw(f, T.two + 4, 12);
  const strike = draw(f, T.no2, 8);
  // buccal: hollows shaded under the cheekbones
  const hollowO = interpolate(f, [T.removal, T.removal + 12], [0, 1], cl);
  const tri = (h: Pt, side: number) => `M${h[0] - side * G.eyeD * 0.02},${G.cheekY + 20} L${h[0] + side * G.eyeD * 0.16},${G.cheekY + 30} L${h[0] + side * G.eyeD * 0.1},${h[1] + G.eyeD * 0.35} Z`;
  return (
    <AbsoluteFill style={{ zIndex: 5 }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}>
        <g opacity={fade(T.botox2, T.two)}>
          {dots.map((d, i) => <circle key={i} cx={d[0]} cy={d[1]} r={interpolate(f, [T.little - 4 + i * 3, T.little + 2 + i * 3], [0, 8], cl)} fill="#fff" />)}
          {f >= T.movement && waves.map((d, i) => <Path key={i} d={d} p={draw(f, T.movement + i * 2, 10)} w={2.5} o={0.9} />)}
        </g>
        <g opacity={fade(T.two, T.three)} transform={`rotate(-28 ${sy[0]} ${sy[1]})`}>
          <Path d={`M${sy[0] + 40},${sy[1]} h170 M${sy[0] + 40},${sy[1] - 16} h170 M${sy[0] + 40},${sy[1] + 16} h170 M${sy[0] + 40},${sy[1] - 16} v32 M${sy[0] + 210},${sy[1] - 24} v48 M${sy[0] + 210},${sy[1]} h50 M${sy[0] + 260},${sy[1] - 18} v36 M${sy[0] + 40},${sy[1]} L${sy[0] - 10},${sy[1]}`} p={syP} w={3.5} />
        </g>
        {f >= T.no2 && f < T.three && (
          <g opacity={fade(T.no2, T.three)}>
            <circle cx={sy[0] + 120} cy={sy[1] - 60} r={130} fill="none" stroke={WARN} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
            <Path d={`M${sy[0] + 28},${sy[1] + 32} L${sy[0] + 212},${sy[1] - 152}`} p={strike} w={7} color={WARN} />
          </g>
        )}
        {f >= T.removal && (
          <g opacity={fade(T.removal, T.your - 6)}>
            <path d={tri(G.hollowA, -1)} fill={`rgba(232,133,122,${0.32 * hollowO})`} stroke={WARN} strokeWidth={2.5} strokeDasharray="8 7" />
            <path d={tri(G.hollowB, 1)} fill={`rgba(232,133,122,${0.32 * hollowO})`} stroke={WARN} strokeWidth={2.5} strokeDasharray="8 7" />
          </g>
        )}
      </svg>
      {f >= T.movement && f < T.two - 4 && <TagPop at={[G.forehead[0], G.forehead[1] - 110]} t={T.movement + 4} text="MOVEMENT KEPT" />}
      {f >= T.removal && f < T.everybody - 2 && <TagPop at={[G.hollowB[0] + 60, G.hollowB[1] + 190]} t={T.removal + 6} text="CHEEK HOLLOW" live />}
    </AbsoluteFill>
  );
};

const Quote: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.everybody - 4 || f >= T.your - 4) return null;
  const sp = spring({ frame: f - (T.everybody - 4), fps, config: { damping: 12, stiffness: 160 } });
  const out = interpolate(f, [T.your - 12, T.your - 4], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: out * Math.min(1, sp * 1.4), transform: `scale(${0.8 + 0.2 * sp}) rotate(${(1 - sp) * -3}deg)`, zIndex: 8 }}>
      <div style={{ background: "#fff", borderRadius: 28, padding: "26px 46px", fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: 68, color: INK, boxShadow: "0 24px 60px rgba(16,24,28,0.35)" }}>&ldquo;Everybody would know.&rdquo;</div>
      {f >= T.right && <Tag size={24} tone="live">AND SHE&apos;S RIGHT</Tag>}
    </div>
  );
};

/* ── the mechanism, on the illustrative face ───────────────────────── */

const Mechanism: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.your + 4 || f >= T.if - 4) return null;
  const G = GI;
  const out = interpolate(f, [T.if - 14, T.if - 4], [1, 0], cl);
  // a scan line looks for the widest row and locks there on "widest"
  const scanY = interpolate(f, [T.cheeks, T.widest], [G.brow[1] - 40, G.cheekY], { ...cl, easing: inOut });
  const lock = draw(f, T.widest, 10);
  const halfW = (G.faceR - G.faceL) / 2, cx = (G.faceL + G.faceR) / 2;
  // the cheek contour caves in on "Hollow"
  const cave = interpolate(f, [T.hollow, T.hollow + 18], [0, 1], { ...cl, easing: inOut });
  const side = (s: number) => {
    const top: Pt = [cx + s * halfW, G.cheekY];
    const bot: Pt = [G.ch[0] + s * G.eyeD * 0.45, G.ch[1] - G.eyeD * 0.25];
    const ctrl: Pt = [cx + s * (halfW * (1.02 - 0.32 * cave)), (G.cheekY + bot[1]) / 2 + 10];
    return `M${top[0]},${top[1]} Q${ctrl[0]},${ctrl[1]} ${bot[0]},${bot[1]} L${G.ch[0]},${G.ch[1]}`;
  };
  const guides = [
    { y: G.eA[1], t: T.eyes, s: "EYES" },
    { y: G.cheekY, t: T.eyes + 6, s: "CHEEKS" },
    { y: G.ch[1] - G.eyeD * 0.3, t: T.jaw, s: "JAW" },
  ];
  return (
    <AbsoluteFill style={{ opacity: out, zIndex: 5 }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}>
        {f < T.widest + 2 && <Path d={`M60,${scanY} L${W - 60},${scanY}`} p={1} w={2} o={0.6} dash="6 8" />}
        {f >= T.widest && (
          <g>
            <Path d={`M${cx},${G.cheekY} L${cx - halfW * lock},${G.cheekY} M${cx},${G.cheekY} L${cx + halfW * lock},${G.cheekY}`} p={1} w={3.5} />
            {lock > 0.95 && <Path d={`M${cx - halfW},${G.cheekY - 22} v44 M${cx + halfW},${G.cheekY - 22} v44`} p={1} w={3.5} />}
          </g>
        )}
        {f >= T.hollow - 2 && (
          <g>
            <Path d={side(-1)} p={draw(f, T.hollow - 2, 12)} w={3.5} color={cave > 0.3 ? WARN : MARK} />
            <Path d={side(1)} p={draw(f, T.hollow, 12)} w={3.5} color={cave > 0.3 ? WARN : MARK} />
            {[-1, 1].map((s) => (
              <Path key={s} d={arrowPath([cx + s * (halfW + 90), G.cheekY + 90], [cx + s * (halfW - 30), G.cheekY + 110], 0.0)} p={draw(f, T.hollow + 4, 10)} w={3.5} color={WARN} />
            ))}
          </g>
        )}
        {guides.map((g, i) => f >= g.t && <Path key={i} d={`M${G.faceL - 70},${g.y} L${G.faceR + 70},${g.y}`} p={draw(f, g.t, 10)} w={2} dash="3 9" o={0.95} />)}
      </svg>
      {f >= T.widest && <TagPop at={[cx, G.cheekY - 60]} t={T.widest + 6} out={T.hollow - 2} text="WIDEST POINT" />}
      {f >= T.whole && <TagPop at={[cx, G.ch[1] + 110]} t={T.whole} out={T.eyes - 2} text="THE WHOLE FACE RE-READS" live />}
      {guides.map((g, i) => f >= g.t && <TagPop key={i} at={[G.faceR + 130, g.y]} t={g.t + 2} text={g.s} />)}
    </AbsoluteFill>
  );
};

/* ── tell / keep quiet ──────────────────────────────────────────────── */

const Toggle: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.if - 4 || f >= T.her3 + 2) return null;
  const sp = spring({ frame: f - (T.if - 4), fps, config: { damping: 14, stiffness: 140 } });
  const out = interpolate(f, [T.her3 - 8, T.her3 + 2], [1, 0], cl);
  const pos = interpolate(f, [T.tell - 2, T.tell + 6, T.quiet - 2, T.quiet + 6], [0.5, 0, 0, 1], { ...cl, easing: ease });
  const PW = 820, PH = 150, KW = PW / 2 - 12;
  return (
    <div style={{ position: "absolute", left: (W - PW) / 2, top: 820, width: PW, opacity: out * Math.min(1, sp * 1.4), transform: `scale(${0.8 + 0.2 * sp})`, zIndex: 8 }}>
      <div style={{ position: "relative", width: PW, height: PH, borderRadius: PH, background: "rgba(255,255,255,0.22)", border: "3px solid #fff", backdropFilter: "blur(8px)" }}>
        <div style={{ position: "absolute", top: 9, left: 9 + pos * (PW - KW - 24), width: KW, height: PH - 24, borderRadius: PH, background: "#fff", boxShadow: "0 10px 30px rgba(16,24,28,0.3)" }} />
        {["TELL", "KEEP QUIET"].map((s, i) => {
          const on = (i === 0 && pos < 0.5) || (i === 1 && pos >= 0.5);
          return (
            <div key={s} style={{ position: "absolute", top: 0, height: PH, left: i * (PW / 2), width: PW / 2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sansFont, fontWeight: 700, fontSize: 46, letterSpacing: "0.06em", color: on && f >= T.tell - 2 ? INK : "#fff" }}>{s}</div>
          );
        })}
      </div>
      {f >= T.comment && (
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center", transform: `scale(${interpolate(f, [T.comment, T.comment + 6, T.comment + 12], [0.8, 1.06, 1], cl)})` }}>
          <Tag size={26} tone="live">COMMENT BELOW</Tag>
        </div>
      )}
    </div>
  );
};

/* ── her face, not yours ────────────────────────────────────────────── */

const CW = 440, CH = 600;
const Card: React.FC<{ img: string; label: string; x: number; t: number; rot: number }> = ({ img, label, x, t, rot }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - t, fps, config: { damping: 15, stiffness: 120 } });
  const p = place(LM(img), { faceH: 0.19, anchor: "noseTip", at: [CW / 2, CH * 0.5] });
  return (
    <div style={{ position: "absolute", left: x, top: 560, width: CW, transform: `translateY(${(1 - sp) * 700}px) rotate(${rot * sp}deg)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ width: CW, height: CH, borderRadius: 30, overflow: "hidden", position: "relative", background: "#B4C4C8", boxShadow: "0 24px 60px rgba(16,24,28,0.35)", border: "6px solid #fff" }}>
        <Img src={staticFile(P(img))} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, maxWidth: "none" }} />
      </div>
      <Tag size={22}>{label}</Tag>
    </div>
  );
};
const HerVsYou: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.her3 - 4 || f >= T.refinas + 4) return null;
  const out = interpolate(f, [T.refinas - 6, T.refinas + 4], [1, 0], cl);
  // her list note slides toward your card on "not", bounces back on "yours"
  const go = interpolate(f, [T.not - 4, T.not + 8, T.yours + 4, T.yours + 16], [0, 1, 1, 0], { ...cl, easing: inOut });
  const wob = f >= T.yours ? Math.sin((f - T.yours) * 1.3) * 8 * interpolate(f, [T.yours, T.yours + 16], [1, 0], cl) : 0;
  const noteIn = interpolate(f, [T.list - 4, T.list + 6], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Card img="front_base" label="HER FACE" x={70} t={T.her3 - 4} rot={-3} />
      <Card img="you_base" label="YOURS · ILLUSTRATIVE" x={570} t={T.her3 + 2} rot={3} />
      <div style={{ position: "absolute", left: 120 + go * 500, top: 1080 - go * 60, opacity: noteIn, transform: `rotate(${-5 + go * 9 + wob}deg) scale(${0.9 + 0.1 * noteIn})`, zIndex: 9 }}>
        <div style={{ background: "#F3EBD6", borderRadius: 10, padding: "18px 24px", boxShadow: "0 18px 40px rgba(16,24,28,0.35)", width: 340 }}>
          <div style={{ fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: 34, color: INK, marginBottom: 6 }}>Her list</div>
          {ROWS.map((r) => <div key={r.n} style={{ fontFamily: sansFont, fontWeight: 600, fontSize: 21, color: INK, letterSpacing: "0.03em" }}>{r.n}  {r.s}</div>)}
        </div>
      </div>
      {f >= T.yours && (
        <div style={{ position: "absolute", left: 540, top: 860, transform: `translate(-50%,-50%) scale(${interpolate(f, [T.yours, T.yours + 6, T.yours + 10], [0.5, 1.15, 1], cl)})`, fontFamily: headlineStack, fontSize: 150, color: WARN, textShadow: "0 4px 20px rgba(16,24,28,0.35)", zIndex: 10 }}>≠</div>
      )}
    </AbsoluteFill>
  );
};

/* ── the product: phone rises straight up ───────────────────────────── */

const PHONE_W = 540;
const PHONE_H = Math.round((PHONE_W * 1920) / 1080);
const PAGE_W = 621;
const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = T.refinas - 4;
  if (f < from || f > T.dont + 8) return null;
  const sp = spring({ frame: f - from, fps, config: { damping: 12, stiffness: 120, mass: 0.9 } });
  const leave = interpolate(f, [T.dont - 6, T.dont + 8], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const px = (W - PHONE_W) / 2, py = 430;
  const ps = PHONE_W / PAGE_W;
  const pages = ["10-cheeks", "17-skin_wrinkles", "11-jaw"];
  const pageAt = [from, T.skin - 2, T.jaw2 - 2];
  const pi = pageAt.filter((t) => f >= t).length - 1;
  const resAt = T.preview - 4, turnAt = T.turn - 6;
  const wipe = interpolate(f, [resAt + 12, resAt + 34], [0, 1], { ...cl, easing: inOut });
  const xRes = interpolate(f, [resAt - 6, resAt + 6], [PHONE_W, 0], { ...cl, easing: ease });
  const xTurn = interpolate(f, [turnAt - 6, turnAt + 6], [PHONE_W, 0], { ...cl, easing: ease });
  const UI = (n: string) => `lawrence/app/${n}.png`;
  return (
    <AbsoluteFill style={{ opacity: 1 - leave }}>
      <div style={{ position: "absolute", left: px, top: py, width: PHONE_W, height: PHONE_H, transform: `translateY(${(1 - sp) * 1100 + leave * 400}px)` }}>
        <div style={{ position: "absolute", left: -14, top: -14, width: PHONE_W + 28, height: PHONE_H + 28, borderRadius: 78, background: "#1C2629", boxShadow: "0 40px 80px rgba(20,32,36,0.32)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, borderRadius: 64, overflow: "hidden", background: "#FBF9F6" }}>
          {pages.map((pg, i) => {
            if (i !== pi && i !== pi - 1) return null;
            const t0 = pageAt[i];
            const xin = i === 0 ? 0 : interpolate(f, [t0, t0 + 8], [PHONE_W, 0], { ...cl, easing: ease });
            const drift = interpolate(f, [t0, t0 + 60], [0, 160], cl);
            return <Img key={pg} src={staticFile(UI(pg))} style={{ position: "absolute", left: xin, top: -drift, width: PAGE_W * ps, maxWidth: "none" }} />;
          })}
          {f >= resAt - 6 && (
            <div style={{ position: "absolute", left: xRes, top: 0, width: PHONE_W, height: PHONE_H, background: "#FBF9F6" }}>
              <Img src={staticFile(UI("your-result-before"))} style={{ position: "absolute", left: 0, top: 0, width: PHONE_W }} />
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
                <Img src={staticFile(UI("your-result-after"))} style={{ position: "absolute", left: 0, top: 0, width: PHONE_W }} />
              </div>
              {wipe > 0.01 && wipe < 0.99 && <div style={{ position: "absolute", left: PHONE_W * wipe - 1.5, top: 110, width: 3, height: 410, background: MARK }} />}
            </div>
          )}
          {f >= turnAt - 6 && (
            <Sequence from={turnAt - 6} layout="none">
              <div style={{ position: "absolute", left: xTurn, top: 0, width: PHONE_W, height: PHONE_H, background: "#fff" }}>
                <OffthreadVideo src={staticFile("lawrence/app/turn.mp4")} muted playbackRate={1.3} style={{ width: PHONE_W, height: PHONE_H, objectFit: "cover", objectPosition: "50% 30%" }} />
              </div>
            </Sequence>
          )}
        </div>
      </div>
      <div style={{ position: "absolute", top: py + PHONE_H + 40, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Tag size={24}>{f < resAt ? "REFINA  ·  FACIAL DOSSIER" : f < turnAt ? "COSMETIC PREVIEW  ·  SAMPLE USER" : "BRING TO LIFE  ·  3D"}</Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ── close: the bubble pops, her list is tossed, the line rises ─────── */

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.dont - 4 || f >= T.comment2 + 4) return null;
  const out = interpolate(f, [T.comment2 - 8, T.comment2 + 2], [1, 0], cl);
  const bub = spring({ frame: f - (T.doctor - 6), fps, config: { damping: 11, stiffness: 170 } });
  const pop = interpolate(f, [T.copy - 4, T.copy + 4], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const card = spring({ frame: f - (T.copy - 2), fps, config: { damping: 14, stiffness: 140 } });
  const toss = interpolate(f, [T.did + 4, T.did + 18], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const lines = [
    { s: "Preview it", t: T.preview2, size: 84, it: false },
    { s: "on your own face", t: T.own2 - 4, size: 92, it: true },
    { s: "first.", t: T.first2, size: 120, it: true },
  ];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {f >= T.doctor - 6 && pop < 1 && (
        <div style={{ position: "absolute", left: 540, top: 820, transform: `translate(-50%,-50%) scale(${(0.6 + 0.4 * bub) * (1 + 0.3 * pop)})`, opacity: Math.min(1, bub * 1.4) * (1 - pop), zIndex: 7 }}>
          <div style={{ position: "relative", background: "#fff", borderRadius: 50, padding: "30px 50px", fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: 64, color: INK, boxShadow: "0 24px 60px rgba(16,24,28,0.35)", whiteSpace: "nowrap" }}>
            What a doctor says
            <div style={{ position: "absolute", left: 90, bottom: -26, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: "30px solid #fff" }} />
          </div>
        </div>
      )}
      {f >= T.copy - 2 && toss < 1 && f < T.preview2 + 4 && (
        <div style={{ position: "absolute", left: 540, top: 860, transform: `translate(-50%,-50%) translate(${toss * 900}px, ${-toss * 300}px) rotate(${-4 + toss * 40}deg) scale(${0.7 + 0.3 * card})`, opacity: Math.min(1, card * 1.4), zIndex: 7 }}>
          <div style={{ background: "#F3EBD6", borderRadius: 12, padding: "24px 32px", boxShadow: "0 24px 60px rgba(16,24,28,0.35)", width: 520 }}>
            <div style={{ fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: 46, color: INK, marginBottom: 10 }}>Jennifer Lawrence&apos;s list</div>
            {ROWS.map((r) => <div key={r.n} style={{ fontFamily: sansFont, fontWeight: 600, fontSize: 28, color: INK, letterSpacing: "0.03em", lineHeight: 1.5 }}>{r.n}  {r.s}</div>)}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {lines.map((l, i) => {
          const k = interpolate(f, [l.t, l.t + 12], [0, 1], { ...cl, easing: ease });
          return <div key={i} style={{ fontFamily: l.it ? headlineItalicStack : headlineStack, fontStyle: l.it ? "italic" : "normal", fontSize: l.size, color: "#fff", lineHeight: 1.05, opacity: k, filter: `blur(${(1 - k) * 10}px)`, transform: `translateY(${(1 - k) * 40}px)` }}>{l.s}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ── sound ──────────────────────────────────────────────────────────── */

const SfxTrack: React.FC = () => (
  <>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Sequence key={i} from={i * 4} durationInFrames={20} layout="none">
        <Audio src={staticFile("sfx/trio/shutter.mp3")} trimBefore={17} volume={i === 0 ? 0.7 : 0.35} />
      </Sequence>
    ))}
    <Fx n="click-interface" at={T.procedure} v={0.3} dur={14} />
    <Fx n="air-whoosh-8" at={T.wants - 4} v={0.24} dur={36} />
    <Fx n="boom-soft" at={T.botox} v={0.22} dur={40} />
    <Fx n="boom-soft" at={T.fillers} v={0.22} dur={40} />
    <Fx n="swoosh-thin" at={T.one2 - 4} v={0.22} dur={30} />
    <Fx n="tap-soft" at={T.little} v={0.22} dur={16} />
    <Fx n="tap-soft" at={T.two} v={0.22} dur={16} />
    <Fx n="click-soft" at={T.no2} v={0.32} dur={14} />
    <Fx n="tap-soft" at={T.three} v={0.22} dur={16} />
    <Fx n="click-interface" at={T.buccal} v={0.28} dur={14} />
    <Fx n="notify-soft" at={T.everybody - 4} v={0.22} dur={36} />
    <Fx n="swoosh-fast" at={T.your - 8} v={0.26} dur={30} />
    <Fx n="click-soft" at={T.widest} v={0.3} dur={14} />
    <Fx n="boom-soft" at={T.hollow} v={0.16} dur={50} />
    <Fx n="tap-soft" at={T.eyes} v={0.2} dur={16} />
    <Fx n="tap-soft" at={T.jaw} v={0.2} dur={16} />
    <Fx n="light-whoosh" at={T.if - 4} v={0.2} dur={30} />
    <Fx n="click-soft" at={T.tell} v={0.34} dur={14} />
    <Fx n="click-soft" at={T.quiet} v={0.34} dur={14} />
    <Fx n="air-whoosh-5" at={T.her3 - 4} v={0.2} dur={36} />
    <Fx n="pop-minimal" at={T.yours} v={0.22} dur={20} />
    <Fx n="boom-soft" at={T.refinas - 4} v={0.22} dur={70} />
    <Fx n="swoosh-thin" at={T.skin - 2} v={0.16} dur={24} />
    <Fx n="swoosh-thin" at={T.jaw2 - 2} v={0.16} dur={24} />
    <Fx n="swoosh-thin" at={T.preview - 10} v={0.2} dur={30} />
    <Fx n="swoosh-thin" at={T.turn - 12} v={0.2} dur={30} />
    <Fx n="pop-minimal" at={T.doctor - 6} v={0.22} dur={20} />
    <Fx n="pop-minimal" at={T.copy} v={0.26} dur={20} />
    <Fx n="swoosh-fast" at={T.did + 4} v={0.24} dur={30} />
    <Fx n="notify-soft" at={T.comment2 + 4} v={0.24} dur={40} />
  </>
);

/* ── the reel ────────────────────────────────────────────────────────── */

const Reel: React.FC = () => (
  <Stage>
    <Audio src={staticFile("lawrence/vo.mp3")} />
    <SfxTrack />
    <Grid />
    <Hero />
    <Redacted />
    <Stamp t={T.botox} text="BOTOX · YES" ok x={300} y={560} rot={-8} out={T.one2 - 6} />
    <Stamp t={T.fillers} text="FILLERS · NO" ok={false} x={790} y={700} rot={6} out={T.one2 - 6} />
    <FaceMarks />
    <List out={T.your - 8} />
    <Quote />
    <Mechanism />
    <Toggle />
    <HerVsYou />
    <Phone />
    <Close />
    <CommentEnd from={T.comment2} keyAt={T.dossier} />

    <Head lines={["The one procedure", "she won't get"]} from={0} until={T.one2 - 4} />
    <Head lines={["Her own", "list"]} from={T.one2} until={T.your - 8} />
    <Head lines={["Where a face", "is widest"]} from={T.your} until={T.if - 6} />
    <Head lines={["Tell people,", "or keep it quiet?"]} from={T.if} until={T.her3 - 6} />
    <Head lines={["Her face,", "not yours"]} from={T.her3} until={T.refinas - 6} />
    <Head lines={["Read first,", "then preview"]} from={T.refinas} until={T.dont - 4} />
    <Sequence from={T.refinas} durationInFrames={T.dont - T.refinas} layout="none">
      <AiChip y={262} size={24} />
    </Sequence>

    {/* no line shown twice: the toggle headline, the bubble/close and the end draw their own words */}
    <Captions cues={CUES} skip={(c) => (c.f >= T.if - 2 && c.f < T.comment - 2) || c.f >= T.preview2 - 2} />
    <Flashes cues={[0, T.wants]} peak={0.14} />
  </Stage>
);

export const GlowupLawrence: React.FC = () => <Composition id="GlowupLawrence" component={Reel} durationInFrames={LAWRENCE_FRAMES} fps={FPS} width={W} height={H} />;
