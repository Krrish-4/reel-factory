/**
 * GlowupS5 - "Why Sadie Sink's Face Works (And Why 'Instagram Face' Work
 * Would Ruin It)" (Glow Up pack S5). Script VERBATIM: docs/scripts/glowup-s5.txt.
 * VO: ElevenLabs Sarah x1.12 + atempo 1.1 -> 62.4s, 203 wpm.
 *
 * Same house treatment and quality bar as GlowupS2 v3, but Rahul asked for
 * DIFFERENT animations (2026-11-14). S2's language was: hero glides right, a
 * left card page-peels, the cursor drags a chip, the nose pixel-resolves.
 * S5's argument is "her face works as a WHOLE", so she stays centred and
 * front-on the whole time and every device INSPECTS her instead of swapping
 * her:
 *   hook    focus-pull on her name; a seam previews the "Instagram face" on half her face
 *   1 eyes  a pill-shaped loupe magnifies her eyes 2x; spacing + tilt draw in it;
 *           "a flaw to lift" scrubs the fox-eye edit INSIDE the loupe only, then back
 *   2 mouth the loupe glides down; arrows at both downturned corners
 *   3 jaw   loupe closes; contour + cheek ovals draw; a light scan runs down her
 *   proof   three edits stack, each laid down by a scanner bar on its spoken word
 *   crowd   her edited face shrinks into a drifting grid of near-identical faces
 *   ask     shutter back to natural; an IG question sticker with her real features
 *   bridge  a face map links her features; one node is pulled and the map strains
 *   plug    house phone tilts in (3D) - Dossier, Cosmetic Preview (bleph pair), 3D turn
 *   close   "Sadie Sink's face" / "Sydney Sweeney's face" typed, struck, retyped "your own face."
 *   end     house typing bar, DOSSIER
 *
 * App proof is real Refina material on a sample user only (pack rule 2).
 * Every cue is a WORD of the measured read via at(); no frame number is typed.
 * Render: node gen/glowup/render.mjs GlowupS5 out/glowup/s5-raw.mp4
 */
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { headlineItalicStack, headlineStack, sansFont } from "../../../fonts";
import { Stage } from "../../protocol/atoms";
import { AiChip, Tag } from "../../ratio/atoms";
import { Framing, Landmarks, Pt, lerpPt, place } from "../kit";
import {
  Captions, CommentEnd, CosmeticPreview, Decode, FPS, Flashes, Fx, Head, Label, MARK, Path, TagPop, WARN, arrowPath, cl, draw, ease, inOut, makeAt,
} from "../house";
import { CUES, PORTRAITS, VO_FRAMES, WORDS } from "./data";

const TAIL = 45;
const W = 1080;
const H = 1920;
export const S5_FRAMES = VO_FRAMES + TAIL;

const at = makeAt(WORDS, "GlowupS5");
const T = {
  sink: at("sink's"), instagram: at("'instagram"), ruin: at("ruin"), it: at("it?"),
  first: at("first"), eyes: at("eyes"), wide: at("wide"), downward: at("downward"),
  trends: at("trends"), lift: at("lift"), but: at("but"), open: at("open"), warm: at("warm"),
  second: at("second"), corners1: at("corners"), corners2: at("corners", 2), thoughtful: at("thoughtful"), frozen: at("frozen"),
  third: at("third"), defined: at("defined"), cheek: at("cheek"), carved: at("carved"), trend: at("trend"),
  watch: at("watch"), fox: at("fox"), hollow: at("hollow"), corner: at("corner"), she: at("she"), everyone: at("everyone"),
  which: at("which", 2), natural2: at("natural", 2), feature: at("feature"), favorite: at("favorite"), comment1: at("comment"),
  your1: at("your", 2), balance: at("balance"), changing: at("changing"), lose: at("lose"), striking: at("striking"),
  refinas: at("refina's"), preview1: at("preview"), touch: at("touch"),
  dont: at("don't"), doctor: at("doctor"), sadie: at("sadie", 2), sydney: at("sydney"), preview2: at("preview", 2), actually: at("actually"), firstLast: at("first", 2),
  comment2: at("comment", 2), dossier: at("dossier"),
};

/* ── stills & the hero frame ─────────────────────────────────────────── */

const P = (n: string) => `s5/portraits/${n}.png`;
const LM = (n: string): Landmarks => PORTRAITS[n];
const BASE = "front_base";
const EDITS = ["front_1_fox", "front_2_hollow", "front_3_ig"];
const CROWD = ["crowd_1", "crowd_2", "crowd_3", "crowd_4"];
/** centred, front-on, bleeding off the bottom (image bottom lands ~y1940) */
const HERO: Framing = { faceH: 0.36, anchor: "noseTip", at: [540, 1072] };
const hp = place(LM(BASE), HERO);
const pt = (k: string): Pt => hp.pt(k);

/** The hero picture of one still, laid out by place(); optional clip. */
const Pic: React.FC<{ img: string; clip?: string; style?: React.CSSProperties }> = ({ img, clip, style }) => (
  <Img src={staticFile(P(img))} style={{ position: "absolute", left: hp.x, top: hp.y, width: hp.w, height: hp.h, maxWidth: "none", clipPath: clip, ...style }} />
);

/* ── the hero: focus pull, IG half-seam, scanner edits, crowd hand-off ── */

const SCAN = 16; // frames a scanner pass takes
const scanTop = pt("brow")[1] - 260;
const scanBot = pt("chin")[1] + 120;
const scanY = (f: number, t: number) => interpolate(f, [t, t + SCAN], [scanTop, scanBot], { ...cl, easing: inOut });

const Hero: React.FC = () => {
  const f = useCurrentFrame();
  // hook: soft -> sharp on her name
  const focus = interpolate(f, [0, T.sink + 6], [14, 0], { ...cl, easing: ease });
  const zoomIn = interpolate(f, [0, T.sink + 10], [1.06, 1], { ...cl, easing: ease });
  // the edits stack on their words; she is natural again on "Which"
  const edits = [T.fox, T.hollow, T.corner];
  const back = f >= T.which;
  let shown = BASE;
  edits.forEach((t, i) => { if (!back && f >= t + SCAN) shown = EDITS[i]; });
  const scanning = !back ? edits.findIndex((t) => f >= t && f < t + SCAN) : -1;
  // crowd: on "she looks like everyone else" the edited hero shrinks into the grid's centre tile
  const toGrid = interpolate(f, [T.she - 2, T.she + 16], [0, 1], { ...cl, easing: inOut });
  const gridOn = f >= T.she - 2 && !back;
  // ask: dims behind the sticker; bridge: back to full
  const dim = interpolate(f, [T.which + 4, T.which + 14, T.your1 - 6, T.your1 + 6], [0, 1, 1, 0], cl);
  // plug: she leaves upward as the phone arrives
  const gone = interpolate(f, [T.refinas - 8, T.refinas + 10], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  if (gone >= 1) return null;
  // IG half-seam in the hook: in from the left to her midline, held, out to the right
  const mid = pt("noseTip")[0];
  const seamX = interpolate(f, [T.instagram - 2, T.instagram + 12, T.ruin, T.it + 10], [-20, mid, mid, W + 20], { ...cl, easing: inOut });
  const seamOn = f >= T.instagram - 2 && f < T.it + 12;
  const tile = TILE_FACE / HERO.faceH; // her shrink lands at exactly the tile's face size
  // after the snap back ("Which") she is full size again
  const g = back ? 0 : toGrid;
  const gS = 1 - (1 - tile) * g;
  const gY = (GRID_C[1] - pt("noseTip")[1]) * g;
  return (
    <AbsoluteFill style={{ transform: `translateY(${-gone * 500}px)`, opacity: 1 - gone }}>
      <AbsoluteFill style={{ transform: `translateY(${gY}px) scale(${zoomIn * gS})`, transformOrigin: `${pt("noseTip")[0]}px ${pt("noseTip")[1]}px`, filter: `blur(${focus}px) brightness(${1 - 0.35 * dim})`, opacity: gridOn ? 1 - toGrid : 1 }}>
        <Pic img={shown} />
        {scanning >= 0 && <Pic img={EDITS[scanning]} clip={`inset(0 0 ${Math.max(0, hp.y + hp.h - scanY(f, edits[scanning]))}px 0)`} />}
        {seamOn && <Pic img="front_3_ig" clip={`inset(0 0 0 ${seamX - hp.x}px)`} />}
      </AbsoluteFill>
      {seamOn && f < T.it + 10 && <div style={{ position: "absolute", left: seamX - 1.5, top: 0, width: 3, height: H, background: MARK }} />}
      {scanning >= 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: scanY(f, edits[scanning]) - 3, height: 6, background: "linear-gradient(90deg, rgba(255,255,255,0), #fff 20%, #fff 80%, rgba(255,255,255,0))", boxShadow: "0 0 24px 8px rgba(255,255,255,0.55)" }} />
      )}
    </AbsoluteFill>
  );
};

/* ── the loupe ───────────────────────────────────────────────────────── */

const ZOOM = 2;
const LENS_W = 820;
const LENS_H = 330;
const eyesC = lerpPt(pt("eyeInA"), pt("eyeInB"), 0.5);
const mouthC = lerpPt(pt("mouthA"), pt("mouthB"), 0.5);
/** where the loupe looks, frame by frame (eyes -> mouth on "Second,") */
const lensFocus = (f: number): Pt => lerpPt(eyesC, [mouthC[0], mouthC[1] + 10], interpolate(f, [T.second, T.second + 20], [0, 1], { ...cl, easing: inOut }));
/** a frame point, as it appears magnified inside the loupe (frame coords) */
const mag = (p: Pt, c: Pt): Pt => [c[0] + (p[0] - c[0]) * ZOOM, c[1] + (p[1] - c[1]) * ZOOM];

const Loupe: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const open = spring({ frame: f - (T.eyes - 6), fps, config: { damping: 15, stiffness: 140 } });
  const close = interpolate(f, [T.third - 2, T.third + 10], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  if (f < T.eyes - 6 || close >= 1) return null;
  const c = lensFocus(f);
  const sc = (0.6 + 0.4 * open) * (1 - 0.6 * close);
  const left = c[0] - LENS_W / 2, top = c[1] - LENS_H / 2;
  const L = (p: Pt): Pt => { const m = mag(p, c); return [m[0] - left, m[1] - top]; };
  // fox-eye scrub, inside the loupe only: on "trends" -> fox, on "but" -> back
  const scrub = interpolate(f, [T.trends - 2, T.trends + 14, T.but, T.but + 14], [0, 1, 1, 0], { ...cl, easing: inOut });
  const imgStyle = (img: string, clip?: string): React.CSSProperties => ({
    position: "absolute", left: c[0] + (hp.x - c[0]) * ZOOM - left, top: c[1] + (hp.y - c[1]) * ZOOM - top, width: hp.w * ZOOM, height: hp.h * ZOOM, maxWidth: "none", clipPath: clip,
  });
  const eyesPhase = f < T.second + 10;
  // eye geometry, magnified
  const iA = L(pt("eyeInA")), iB = L(pt("eyeInB")), oA = L(pt("eyeOutA")), oB = L(pt("eyeOutB"));
  const ext = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const mA = L(pt("mouthA")), mB = L(pt("mouthB"));
  return (
    <div style={{ position: "absolute", left, top, width: LENS_W, height: LENS_H, transform: `scale(${sc})`, opacity: Math.min(1, open * 1.4) * (1 - close), zIndex: 5 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: LENS_H / 2, overflow: "hidden", boxShadow: "0 30px 70px rgba(16,24,28,0.45), 0 0 0 4px #fff", background: "#A3B5BA" }}>
        <Img src={staticFile(P(BASE))} style={imgStyle(BASE)} />
        {scrub > 0 && <Img src={staticFile(P("front_1_fox"))} style={imgStyle("front_1_fox", `inset(0 ${(1 - scrub) * 100}% 0 0)`)} />}
        {scrub > 0.01 && scrub < 0.99 && <div style={{ position: "absolute", top: 0, bottom: 0, left: scrub * LENS_W - 1.5, width: 3, background: "#fff" }} />}
        <svg width={LENS_W} height={LENS_H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}>
          {eyesPhase && f >= T.wide && f < T.trends && (
            <g>
              <Path d={`M${iA[0]},${(iA[1] + iB[1]) / 2} L${iB[0]},${(iA[1] + iB[1]) / 2}`} p={1} dash="3 9" w={4} o={draw(f, T.wide, 8)} />
              <Path d={`M${iA[0]},${(iA[1] + iB[1]) / 2 - 18} v36 M${iB[0]},${(iA[1] + iB[1]) / 2 - 18} v36`} p={draw(f, T.wide, 8)} />
            </g>
          )}
          {eyesPhase && f >= T.downward && f < T.trends && (
            <g>
              <Path d={`M${ext(oA, iA, -0.25)[0]},${ext(oA, iA, -0.25)[1]} L${ext(oA, iA, 1.05)[0]},${ext(oA, iA, 1.05)[1]}`} p={draw(f, T.downward, 12)} w={2.5} />
              <Path d={`M${ext(oB, iB, -0.25)[0]},${ext(oB, iB, -0.25)[1]} L${ext(oB, iB, 1.05)[0]},${ext(oB, iB, 1.05)[1]}`} p={draw(f, T.downward + 3, 12)} w={2.5} />
            </g>
          )}
          {!eyesPhase && f >= T.corners2 && (
            <g>
              <Path d={arrowPath([mA[0] - 60, mA[1] - 70], [mA[0] - 8, mA[1] + 10], 0.35)} p={draw(f, T.corners2, 12)} w={3.5} />
              <Path d={arrowPath([mB[0] + 60, mB[1] - 70], [mB[0] + 8, mB[1] + 10], -0.35)} p={draw(f, T.corners2 + 4, 12)} w={3.5} />
            </g>
          )}
        </svg>
      </div>
      {/* tags ride the loupe */}
      {f >= T.wide && f < T.trends - 2 && <TagPop at={[LENS_W / 2, -34]} t={T.wide} text="WIDE-SET" />}
      {f >= T.downward && f < T.trends - 2 && <TagPop at={[LENS_W / 2, LENS_H + 34]} t={T.downward} text="SOFT DOWNWARD TILT" />}
      {f >= T.trends && f < T.but + 4 && <TagPop at={[LENS_W / 2, -34]} t={T.trends + 4} text="TREND: LIFT IT" live />}
      {f >= T.open && f < T.second - 2 && <TagPop at={[LENS_W / 2, LENS_H + 34]} t={T.open} text="OPEN, WARM GAZE" />}
      {f >= T.thoughtful && f < T.third - 2 && <TagPop at={[LENS_W * 0.28, LENS_H + 34]} t={T.thoughtful} text="THOUGHTFUL" />}
      {f >= T.frozen && f < T.third - 2 && <TagPop at={[LENS_W * 0.72, LENS_H + 34]} t={T.frozen - 4} text="NOT FROZEN" />}
    </div>
  );
};

/* ── jaw & cheeks (no loupe) ─────────────────────────────────────────── */

const JawMarks: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.defined || f >= T.watch + 6) return null;
  const o = interpolate(f, [T.watch - 6, T.watch + 4], [1, 0], cl);
  const jA = pt("jawA"), jB = pt("jawB"), ch = pt("chin");
  const ctrlA: Pt = [jA[0] + 10, ch[1] - 20], ctrlB: Pt = [jB[0] - 10, ch[1] - 20];
  const cA = pt("cheekA"), cB = pt("cheekB");
  const rx = (pt("eyeInA")[0] - pt("eyeOutA")[0]) * 0.75, ry = rx * 0.7;
  const scan = interpolate(f, [T.carved, T.carved + 24], [pt("eyeInA")[1] - 80, ch[1] + 60], { ...cl, easing: inOut });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}>
        <Path d={`M${jA[0] - 10},${jA[1] - 60} Q${ctrlA[0]},${ctrlA[1]} ${ch[0]},${ch[1] + 8} Q${ctrlB[0]},${ctrlB[1]} ${jB[0] + 10},${jB[1] - 60}`} p={draw(f, T.defined, 20)} w={3.5} />
        {f >= T.cheek && (
          <g>
            <ellipse cx={cA[0]} cy={cA[1]} rx={rx} ry={ry} fill="none" stroke={MARK} strokeWidth={2.5} strokeDasharray="10 9" opacity={draw(f, T.cheek, 8)} />
            <ellipse cx={cB[0]} cy={cB[1]} rx={rx} ry={ry} fill="none" stroke={MARK} strokeWidth={2.5} strokeDasharray="10 9" opacity={draw(f, T.cheek + 3, 8)} />
          </g>
        )}
      </svg>
      {f >= T.carved && f < T.carved + 26 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: scan - 2, height: 4, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.85) 75%, rgba(255,255,255,0))", boxShadow: "0 0 18px 6px rgba(255,255,255,0.35)" }} />
      )}
      <TagPop at={[ch[0], ch[1] + 70]} t={T.defined + 10} text="SOFT, DEFINED JAW" />
      {f >= T.cheek && <TagPop at={[cB[0] + 40, cB[1] - ry - 34]} t={T.cheek + 4} text="NATURAL FULLNESS" />}
      {f >= T.carved && <TagPop at={[cA[0] - 20, cA[1] - ry - 34]} t={T.carved + 6} text="NOTHING CARVED" live />}
    </AbsoluteFill>
  );
};

/** Mono edit counter during the proof. */
const EditCounter: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.fox - 4 || f >= T.she) return null;
  const steps = [
    { t: T.fox, s: "EDIT 1/3  ·  LIFTED FOX EYES" },
    { t: T.hollow, s: "EDIT 2/3  ·  HOLLOW CHEEKS" },
    { t: T.corner, s: "EDIT 3/3  ·  CORNER LIP FILLER" },
  ];
  let cur = steps[0];
  for (const s of steps) if (f >= s.t) cur = s;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", zIndex: 6 }}>
      <Tag size={24} tone="live">{cur.s}</Tag>
    </div>
  );
};

/* ── "she looks like everyone else" ──────────────────────────────────── */

const TILE_W = 300, TILE_H = 380, GAP = 22;
const TILE_FACE = 0.17;
const GRID_X0 = (W - (TILE_W * 3 + GAP * 2)) / 2;
const GRID_Y0 = 560;
const GRID_C: Pt = [W / 2, GRID_Y0 + TILE_H + GAP + TILE_H * 0.52];
const FaceTile: React.FC<{ img: string; me?: boolean }> = ({ img, me }) => {
  // whole face in the tile: face box ~0.85 of tile height (faceH is a fraction of 1920)
  const p = place(LM(img), { faceH: TILE_FACE, anchor: "noseTip", at: [TILE_W / 2, TILE_H * 0.52] });
  return (
    <div style={{ width: TILE_W, height: TILE_H, borderRadius: 26, overflow: "hidden", position: "relative", background: "#B4C4C8", boxShadow: me ? "0 0 0 5px #fff, 0 18px 40px rgba(20,32,36,0.35)" : "0 14px 34px rgba(20,32,36,0.28)" }}>
      <Img src={staticFile(P(img))} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, maxWidth: "none" }} />
    </div>
  );
};
const Crowd: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.she || f >= T.which + 8) return null;
  const out = interpolate(f, [T.which - 2, T.which + 6], [1, 0], cl);
  const order = [CROWD[0], CROWD[1], CROWD[2], CROWD[3], "front_3_ig", CROWD[0], CROWD[2], CROWD[3], CROWD[1]];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {order.map((img, i) => {
        const r = Math.floor(i / 3), c = i % 3;
        const me = i === 4;
        const t0 = T.she + (me ? 12 : 4 + ((i * 3) % 9));
        const o = interpolate(f, [t0, t0 + 8], [0, 1], cl);
        const s = interpolate(f, [t0, t0 + 8, t0 + 14], [0.85, 1.03, 1], cl);
        const drift = r === 1 ? 0 : (r === 0 ? -1 : 1) * interpolate(f, [T.she, T.which], [0, 28]);
        return (
          <div key={i} style={{ position: "absolute", left: GRID_X0 + c * (TILE_W + GAP) + (me ? 0 : drift), top: GRID_Y0 + r * (TILE_H + GAP), opacity: o, transform: `scale(${s})` }}>
            <FaceTile img={img} me={me} />
          </div>
        );
      })}
      <TagPop at={[GRID_C[0], GRID_Y0 + 3 * (TILE_H + GAP) + 20]} t={T.everyone} text="ONE TEMPLATE, EVERY FACE" />
    </AbsoluteFill>
  );
};

/* ── the question sticker ────────────────────────────────────────────── */

/** a round crop of her REAL feature, through place() */
const FeatureDot: React.FC<{ c: Pt; size: number; zoom?: number }> = ({ c, size, zoom = 2.4 }) => (
  <div style={{ width: size, height: size, borderRadius: size, overflow: "hidden", position: "relative", flexShrink: 0, boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.06)" }}>
    <Img src={staticFile(P(BASE))} style={{ position: "absolute", left: size / 2 + (hp.x - c[0]) * zoom, top: size / 2 + (hp.y - c[1]) * zoom, width: hp.w * zoom, height: hp.h * zoom, maxWidth: "none" }} />
  </div>
);
const Sticker: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.natural2 - 4 || f >= T.your1 + 8) return null;
  const sp = spring({ frame: f - (T.natural2 - 4), fps, config: { damping: 13, stiffness: 160, mass: 0.8 } });
  const out = interpolate(f, [T.your1 - 6, T.your1 + 6], [1, 0], cl);
  const opts = [
    { s: "Her eyes", c: eyesC, t: T.feature },
    { s: "Her mouth corners", c: mouthC, t: T.favorite - 4 },
    { s: "Her jaw", c: [pt("chin")[0], pt("chin")[1] - 30] as Pt, t: T.favorite + 4 },
  ];
  return (
    <div style={{ position: "absolute", left: 140, width: 800, top: 640, opacity: out * Math.min(1, sp * 1.5), transform: `scale(${0.7 + 0.3 * sp}) rotate(${(1 - sp) * -4}deg)`, zIndex: 8 }}>
      <div style={{ background: "#fff", borderRadius: 40, overflow: "hidden", boxShadow: "0 30px 80px rgba(16,24,28,0.4)" }}>
        <div style={{ padding: "26px 36px 18px", fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: 54, color: "#1C2629", textAlign: "center" }}>Your favourite?</div>
        {opts.map((o, i) => {
          const k = interpolate(f, [o.t, o.t + 8], [0, 1], { ...cl, easing: ease });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, padding: "16px 36px", borderTop: "1px solid #E7ECEE", opacity: k, transform: `translateX(${(1 - k) * 40}px)` }}>
              <FeatureDot c={o.c} size={104} />
              <div style={{ flex: 1, fontFamily: sansFont, fontSize: 40, color: "#1C2629", fontWeight: 500 }}>{o.s}</div>
              <div style={{ width: 38, height: 38, borderRadius: 38, border: "3px solid #C9D3D6" }} />
            </div>
          );
        })}
      </div>
      {f >= T.comment1 && (
        <div style={{ marginTop: 26, display: "flex", justifyContent: "center", transform: `scale(${interpolate(f, [T.comment1, T.comment1 + 6, T.comment1 + 12], [0.8, 1.06, 1], cl)})` }}>
          <Tag size={26} tone="live">COMMENT BELOW</Tag>
        </div>
      )}
    </div>
  );
};

/* ── the face map ────────────────────────────────────────────────────── */

const NODES = ["eyeOutA", "eyeInA", "eyeInB", "eyeOutB", "noseTip", "mouthA", "mouthB", "chin", "cheekA", "cheekB", "jawA", "jawB"];
const EDGES: [string, string][] = [
  ["eyeOutA", "eyeInA"], ["eyeInA", "eyeInB"], ["eyeInB", "eyeOutB"], ["eyeInA", "noseTip"], ["eyeInB", "noseTip"],
  ["noseTip", "mouthA"], ["noseTip", "mouthB"], ["mouthA", "mouthB"], ["mouthA", "chin"], ["mouthB", "chin"],
  ["eyeOutA", "cheekA"], ["cheekA", "jawA"], ["jawA", "chin"], ["eyeOutB", "cheekB"], ["cheekB", "jawB"], ["jawB", "chin"],
  ["cheekA", "mouthA"], ["cheekB", "mouthB"], ["cheekA", "noseTip"], ["cheekB", "noseTip"],
];
const FaceMap: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.your1 || f >= T.refinas) return null;
  const o = interpolate(f, [T.striking, T.refinas - 4], [1, 0], cl);
  const pull = spring({ frame: f - T.changing, fps, config: { damping: 9, stiffness: 90 } });
  const settle = interpolate(f, [T.lose, T.lose + 20], [1, 0.35], cl);
  const k = f >= T.changing ? pull * settle : 0;
  const PULLED = "mouthB";
  const shake = (i: number) => (f >= T.changing ? Math.sin((f - T.changing) * 0.9 + i * 1.7) * 3 * k : 0);
  const pos = (n: string, i: number): Pt => {
    const p = pt(n);
    if (n === PULLED) return [p[0] + 70 * k, p[1] + 38 * k];
    return [p[0] + shake(i), p[1] + shake(i + 3)];
  };
  return (
    <AbsoluteFill style={{ opacity: o, zIndex: 4 }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}>
        {EDGES.map(([a, b], i) => {
          const pa = pos(a, NODES.indexOf(a)), pb = pos(b, NODES.indexOf(b));
          const strained = k > 0.05 && (a === PULLED || b === PULLED);
          return <Path key={i} d={`M${pa[0]},${pa[1]} L${pb[0]},${pb[1]}`} p={draw(f, T.balance - 6 + i * 1.6, 8)} w={strained ? 3 : 2} color={strained ? WARN : MARK} o={strained ? 1 : 0.85} />;
        })}
        {NODES.map((n, i) => {
          const p = pos(n, i);
          const r = interpolate(f, [T.balance - 8 + i, T.balance - 2 + i], [0, n === PULLED && k > 0.05 ? 9 : 6], cl);
          return <circle key={n} cx={p[0]} cy={p[1]} r={r} fill={n === PULLED && k > 0.05 ? WARN : "#fff"} />;
        })}
      </svg>
      {f >= T.changing && <TagPop at={[pos(PULLED, 6)[0] + 40, pos(PULLED, 6)[1] + 70]} t={T.changing + 6} text="ONE FEATURE CHANGED" live />}
    </AbsoluteFill>
  );
};

/* ── the product: house phone, tilting in ────────────────────────────── */

const PHONE_W = 540;
const PHONE_H = Math.round((PHONE_W * 1920) / 1080);
const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = T.refinas - 4;
  if (f < from || f > T.doctor + 4) return null;
  const sp = spring({ frame: f - from, fps, config: { damping: 16, stiffness: 95, mass: 1 } });
  // it holds through "Don't just trust" and leaves as the doctor tag lands - no empty frame between
  const leave = interpolate(f, [T.doctor - 12, T.doctor + 2], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const px = (W - PHONE_W) / 2, py = 430;
  const cuts = [from, T.preview1 - 6, T.touch - 8];
  const screens: React.ReactNode[] = [
    <OffthreadVideo key="d" src={staticFile("s5/app/dossier.mp4")} muted playbackRate={1.1} style={{ width: PHONE_W, height: PHONE_H, objectFit: "cover" }} />,
    <CosmeticPreview key="c" t0={cuts[1]} before="s5/app/bleph-before.png" after="s5/app/bleph-after.png" pos="50% 35%" />,
    <AbsoluteFill key="t" style={{ background: "#fff" }}>
      <OffthreadVideo src={staticFile("s5/app/turn.mp4")} muted playbackRate={1.4} style={{ width: PHONE_W, height: PHONE_H, objectFit: "cover", objectPosition: "50% 30%" }} />
    </AbsoluteFill>,
  ];
  return (
    <AbsoluteFill style={{ perspective: 1800, opacity: 1 - leave }}>
      <div style={{ position: "absolute", left: px, top: py, width: PHONE_W, height: PHONE_H, transformOrigin: "50% 100%", transform: `translateY(${(1 - sp) * 520 + leave * 300}px) rotateX(${(1 - sp) * 38}deg) rotateY(${(1 - sp) * -22}deg) rotateZ(${(1 - sp) * 4}deg)` }}>
        <div style={{ position: "absolute", left: -14, top: -14, width: PHONE_W + 28, height: PHONE_H + 28, borderRadius: 78, background: "#1C2629", boxShadow: "0 40px 80px rgba(20,32,36,0.32)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, borderRadius: 64, overflow: "hidden", background: "#FBF9F6" }}>
          {screens.map((s, i) => {
            const t0 = cuts[i];
            const t1 = i + 1 < cuts.length ? cuts[i + 1] : T.doctor + 4;
            if (f < t0 - 9 || f > t1 + 6) return null;
            // screens change by a vertical push (S2's phone pushed sideways)
            const yin = i === 0 ? 0 : interpolate(f, [t0 - 9, t0 + 5], [PHONE_H, 0], { ...cl, easing: ease });
            const yout = interpolate(f, [t1 - 9, t1 + 5], [0, -PHONE_H * 0.3], { ...cl, easing: ease });
            return (
              <Sequence key={i} from={i === 0 ? t0 : t0 - 9} layout="none">
                <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, transform: `translateY(${yin + yout}px)` }}>{s}</div>
              </Sequence>
            );
          })}
        </div>
      </div>
      {f < T.dont - 4 && (
        <div style={{ position: "absolute", top: py + PHONE_H + 40, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Tag size={24}>{f < cuts[1] ? "REFINA  ·  FACIAL DOSSIER" : f < cuts[2] ? "COSMETIC PREVIEW" : "BRING TO LIFE  ·  3D"}</Tag>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ── close: struck and retyped ───────────────────────────────────────── */

const Typed: React.FC<{ text: string; t: number; dur: number; y: number; size: number; italic?: boolean; strikeAt?: number; underlineAt?: number }> = ({ text, t, dur, y, size, italic, strikeAt, underlineAt }) => {
  const f = useCurrentFrame();
  if (f < t) return null;
  const n = Math.round(interpolate(f, [t, t + dur], [0, text.length], cl));
  const strike = strikeAt === undefined ? 0 : interpolate(f, [strikeAt, strikeAt + 8], [0, 1], { ...cl, easing: ease });
  const under = underlineAt === undefined ? 0 : interpolate(f, [underlineAt, underlineAt + 12], [0, 1], { ...cl, easing: ease });
  const caret = n < text.length && Math.floor(f / 6) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", fontFamily: italic ? headlineItalicStack : headlineStack, fontStyle: italic ? "italic" : "normal", fontSize: size, color: "#fff", opacity: 1 - 0.45 * strike, lineHeight: 1.1, whiteSpace: "nowrap" }}>
        {text.slice(0, n)}
        <span style={{ opacity: caret ? 1 : 0 }}>|</span>
        <div style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 5, background: WARN, transformOrigin: "left", transform: `scaleX(${strike})` }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -10, height: 4, background: "#fff", transformOrigin: "left", transform: `scaleX(${under})` }} />
      </div>
    </div>
  );
};
const Close: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.doctor - 8 || f >= T.comment2 + 4) return null;
  const out = interpolate(f, [T.comment2 - 8, T.comment2 + 2], [1, 0], cl);
  const docStrike = interpolate(f, [T.preview2, T.preview2 + 8], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", opacity: interpolate(f, [T.doctor - 8, T.doctor - 2], [0, 1], cl) * (1 - 0.45 * docStrike) }}>
        <div style={{ position: "relative" }}>
          <Tag size={26}>WHAT A DOCTOR SAYS</Tag>
          <div style={{ position: "absolute", left: -6, right: -6, top: "50%", height: 4, background: WARN, transformOrigin: "left", transform: `scaleX(${docStrike})` }} />
        </div>
      </div>
      <Typed text="Sadie Sink's face" t={T.sadie} dur={14} y={760} size={82} strikeAt={T.preview2 + 3} />
      <Typed text="Sydney Sweeney's face" t={T.sydney} dur={16} y={880} size={82} strikeAt={T.preview2 + 6} />
      <Typed text="your own face." t={T.actually} dur={18} y={1040} size={112} italic underlineAt={T.firstLast} />
    </AbsoluteFill>
  );
};

/** Her mono name tag; struck through when the close names her. */
const NameTag: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= T.watch - 4 && f < T.which + 6) return null;
  if (f >= T.refinas - 8) return null;
  const o = interpolate(f, [10, 22], [0, 1], cl);
  return (
    <div style={{ position: "absolute", left: 680, top: 1470, opacity: o, display: "flex", flexDirection: "column", gap: 4, zIndex: 6 }}>
      <Decode text="SADIE SINK, AMERICAN" t={10} size={22} />
      <Decode text="ACTRESS · AI-PAINTED" t={14} size={22} o={0.8} />
    </div>
  );
};

/* ── sound (trio set, cues off the same words) ───────────────────────── */

const SfxTrack: React.FC = () => (
  <>
    <Sequence durationInFrames={30} layout="none">
      <Audio src={staticFile("sfx/trio/shutter.mp3")} trimBefore={17} volume={0.8} />
    </Sequence>
    <Fx n="swoosh-thin" at={T.instagram} v={0.24} dur={30} />
    <Fx n="light-whoosh" at={T.eyes - 6} v={0.22} dur={28} />
    <Fx n="tap-soft" at={T.wide} v={0.24} dur={16} />
    <Fx n="tap-soft" at={T.downward} v={0.24} dur={16} />
    <Fx n="swoosh-thin" at={T.trends} v={0.22} dur={30} />
    <Fx n="swoosh-thin" at={T.but} v={0.18} dur={30} />
    <Fx n="air-whoosh-8" at={T.second} v={0.22} dur={36} />
    <Fx n="tap-soft" at={T.corners2} v={0.24} dur={16} />
    <Fx n="click-soft" at={T.third} v={0.3} dur={14} />
    <Fx n="tap-soft" at={T.defined} v={0.22} dur={16} />
    <Fx n="tap-soft" at={T.cheek} v={0.22} dur={16} />
    <Fx n="air-whoosh-5" at={T.carved} v={0.2} dur={36} />
    {[T.fox, T.hollow, T.corner].map((t) => <Fx key={t} n="swoosh-fast" at={t} v={0.26} dur={30} />)}
    {[T.fox, T.hollow, T.corner].map((t) => <Fx key={`c${t}`} n="click-interface" at={t + 16} v={0.3} dur={16} />)}
    <Fx n="air-whoosh-8" at={T.she} v={0.24} dur={36} />
    {[0, 1, 2].map((i) => <Fx key={`p${i}`} n="pop-minimal" at={T.she + 6 + i * 4} v={0.18} dur={20} />)}
    <Fx n="shutter" at={T.which} v={0.7} dur={30} />
    <Fx n="notify-soft" at={T.natural2} v={0.24} dur={36} />
    <Fx n="tap-soft" at={T.balance} v={0.22} dur={16} />
    <Fx n="boom-soft" at={T.changing} v={0.18} dur={50} />
    <Fx n="boom-soft" at={T.refinas - 4} v={0.22} dur={70} />
    <Fx n="swoosh-thin" at={T.preview1 - 6} v={0.2} dur={30} />
    <Fx n="swoosh-thin" at={T.touch - 8} v={0.2} dur={30} />
    <Fx n="click-soft" at={T.preview2} v={0.4} dur={14} />
    <Fx n="notify-soft" at={T.comment2 + 4} v={0.24} dur={40} />
  </>
);

/* ── the reel ────────────────────────────────────────────────────────── */

const Reel: React.FC = () => (
  <Stage>
    <Audio src={staticFile("s5/vo.mp3")} />
    <SfxTrack />
    <Hero />
    <Loupe />
    <JawMarks />
    <EditCounter />
    <Crowd />
    <Sticker />
    <FaceMap />
    <NameTag />
    <Phone />
    <Close />
    <CommentEnd from={T.comment2} keyAt={T.dossier} />

    <Head lines={["Why Sadie Sink's", "face works"]} from={0} until={T.watch - 2} />
    <Label text="Wide-set eyes" mono="01  ·  SOFT DOWNWARD TILT" t={T.first} out={T.second - 8} x={540} y={560} />
    <Label text="Downturned corners" mono="02  ·  THOUGHTFUL, NOT FROZEN" t={T.second + 6} out={T.third - 8} x={540} y={760} />
    <Label text="Soft, defined jaw" mono="03  ·  NATURAL CHEEK FULLNESS" t={T.third + 4} out={T.watch - 6} x={540} y={560} />
    <Head lines={["The 'Instagram", "face' edit"]} from={T.watch} until={T.which - 2} />
    <Head lines={["Read the", "whole picture"]} from={T.your1} until={T.refinas - 4} />
    <Head lines={["Read together,", "previewed first"]} from={T.refinas} until={T.dont - 2} />
    <Sequence from={T.refinas} durationInFrames={T.dont - T.refinas} layout="none">
      <AiChip y={262} size={24} />
    </Sequence>

    {/* no line shown twice: the close and the end card draw their own words */}
    <Captions cues={CUES} skip={(c) => c.f >= T.sadie - 2} />
    <Flashes cues={[0, T.which]} />
  </Stage>
);

export const GlowupS5: React.FC = () => <Composition id="GlowupS5" component={Reel} durationInFrames={S5_FRAMES} fps={FPS} width={W} height={H} />;
