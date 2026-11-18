/**
 * GlowupSize - RefinaSize ("It Isn't the Size", out/refina-size-v5.mp4) rebuilt
 * as a Glow Up pack reel, 2026-11-17. Pack format S4 (two self-tests before lip
 * filler) on Rahul's photos of Sydney Sweeney (he confirmed the hero IS her).
 * Script: docs/scripts/glowup-size.txt. VO: ElevenLabs Sarah x1.12 + atempo 1.1.
 *
 * House sage treatment, own device set (S2 = glide/peel/chip/pixel; S5 = loupe/
 * scanner/crowd/sticker/face map). This one is a TEST KIT:
 *   hook    clean split - her front | her side - with the "shelf" drawn on the side
 *   tests   two 5-second timer dials
 *   E-line  split opens to the side view; a finger-ruler grows nose tip -> chin on
 *           the words; lip-to-line gap; "forward" drawn past the line in red
 *   philtrum  whip to the front inside an oval MIRROR; brackets A (nose-lip) and B (chin)
 *   thinner the mirror FLIPS (3D) to the edited still; A grows, B glows; lips-only flicker
 *   lift    the app's real Lip Lift row slides up
 *   poll    YES / NO buttons tapped on the words
 *   mm      macro push onto her mouth, millimetre ticks, full <-> thin dissolve
 *   plug    phone slides in sideways: Select Procedures (Lip Lift -> Lip Augmentation) -> 3D turn
 *   close   the empty mirror returns; "your own face, first" appears inside it
 * Every cue is a WORD of the read via at(); landmarks via place().
 */
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { headlineItalicStack, sansFont } from "../../../fonts";
import { Stage } from "../../protocol/atoms";
import { AiChip, Tag } from "../../ratio/atoms";
import { Framing, Landmarks, Pt, place } from "../kit";
import { Captions, CommentEnd, Decode, FPS, Flashes, Fx, Head, MARK, Path, TagPop, WARN, arrowPath, cl, draw, ease, inOut, makeAt } from "../house";
import { CUES, PORTRAITS, VO_FRAMES, WORDS } from "./data";

const TAIL = 45;
const W = 1080;
const H = 1920;
export const SIZE_FRAMES = VO_FRAMES + TAIL;

const at = makeAt(WORDS, "GlowupSize");
const T = {
  sydney: at("sydney"), heavy: at("heavy"), shelf: at("shelf"), you: at("you"), two: at("two"), five: at("fivesecond"), yourself: at("yourself"),
  first: at("first"), eline: at("eline"), turn: at("turn"), hold: at("hold"), finger: at("finger"), nose: at("nose"), chin: at("chin"),
  upper: at("upper"), touches: at("touches"), finger2: at("finger", 2), push: at("push"), forward: at("forward"),
  second: at("second"), look: at("look", 2), mirror: at("mirror"), space: at("space"), top: at("top"), half: at("half"), height: at("height"), chin2: at("chin", 2),
  now: at("now"), thinner: at("thinner"), gap: at("gap"), longer: at("longer"), chin3: at("chin", 3), stronger: at("stronger"),
  only: at("only", 2), edited: at("edited"), thats: at("that's"), lip3: at("lip", 4), lift: at("lift"), shorten: at("shorten"), volume2: at("volume", 2),
  did: at("did"), comment: at("comment"), yes: at("yes"), no: at("no"), a: at("a", 4), millimetre: at("millimetre"), difference: at("difference"),
  own: at("own"), changes: at("changes"),
  refina: at("refina"), lip5: at("lip", 6), filler2: at("filler", 2), turn2: at("turn", 2),
  dont: at("don't"), injector: at("injector"), sydney2: at("sydney", 2), preview2: at("preview", 2), own3: at("own", 3), first2: at("first", 2),
  comment2: at("comment", 2), dossier: at("dossier"),
};

/* ── stills & framing ───────────────────────────────────────────────── */

const P = (n: string) => `size/portraits/${n}.png`;
const LM = (n: string): Landmarks => PORTRAITS[n];
// the edit is on the base's pixel grid (lock 3.0), so BOTH front stills are placed by
// the base's landmarks; only the lip points are read per still
const FRONT = LM("front_base");
const lipLm = (img: string) => LM(img);

type Fr = { faceH: number; at: Pt };
const lerpF = (a: Fr, b: Fr, t: number): Fr => ({ faceH: a.faceH + (b.faceH - a.faceH) * t, at: [a.at[0] + (b.at[0] - a.at[0]) * t, a.at[1] + (b.at[1] - a.at[1]) * t] });
const fr = (x: Fr, anchor = "noseTip"): Framing => ({ ...x, anchor });

// hook cards (Rahul 2026-11-17: the full-bleed split was too large) - two framed cards, faces ~0.18
const CARD = { y: 520, h: 820, w: 460, xL: 60, xR: 560, r: 34 };
const SPLIT_FRONT: Fr = { faceH: 0.18, at: [CARD.xL + CARD.w / 2, 1000] };
const SPLIT_SIDE: Fr = { faceH: 0.18, at: [CARD.xR + 90, 1020] };
const SIDE: Fr = { faceH: 0.42, at: [330, 900] };
const MIRROR: Fr = { faceH: 0.4, at: [540, 1120] };
const MACRO: Fr = { faceH: 1.0, at: [540, 560] };

const mirrorP = place(FRONT, fr(MIRROR));
/** a front point (by key, from a given still's own landmarks) in mirror framing */
const mp = (img: string, k: string): Pt => mirrorP.pt(lipLm(img)[k] as Pt);

const Pic: React.FC<{ img: string; f: Framing; lm?: Landmarks; style?: React.CSSProperties }> = ({ img, f, lm, style }) => {
  const p = place(lm ?? (img.startsWith("side") ? LM(img) : FRONT), f);
  return <Img src={staticFile(P(img))} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, maxWidth: "none", ...style }} />;
};

/* ── hook: the clean split, then the side view takes the frame ──────── */

const SplitAndSide: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= T.second + 16) return null;
  const inL = interpolate(f, [0, 14], [-560, 0], { ...cl, easing: ease });
  const inR = interpolate(f, [2, 16], [560, 0], { ...cl, easing: ease });
  // "First,": the seam slides to the left edge and the side panel becomes the frame
  const open = interpolate(f, [T.first, T.first + 22], [0, 1], { ...cl, easing: inOut });
  const k = 1 - open;
  const sideClip = `inset(${CARD.y * k}px ${(W - CARD.xR - CARD.w) * k}px ${(H - CARD.y - CARD.h) * k}px ${CARD.xR * k}px round ${CARD.r * k}px)`;
  const frontClip = `inset(${CARD.y}px ${W - CARD.xL - CARD.w}px ${H - CARD.y - CARD.h}px ${CARD.xL}px round ${CARD.r}px)`;
  const side = place(LM("side_base"), fr(lerpF(SPLIT_SIDE, SIDE, open)));
  // "Second,": a whip out to the left
  const whip = interpolate(f, [T.second, T.second + 14], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const shelfP = draw(f, T.shelf - 2, 12);
  const sl = side.pt("lipTop");
  return (
    <AbsoluteFill style={{ transform: `translateX(${-whip * 1300}px)`, filter: whip > 0 ? `blur(${whip * 18}px)` : undefined }}>
      {/* side panel */}
      {k > 0 && <div style={{ position: "absolute", left: CARD.xR * k, top: CARD.y * k, right: (W - CARD.xR - CARD.w) * k, bottom: (H - CARD.y - CARD.h) * k, borderRadius: CARD.r * k, boxShadow: "0 24px 60px rgba(16,24,28,0.3)", opacity: k, transform: `translateX(${inR}px)` }} />}
      <AbsoluteFill style={{ clipPath: sideClip, transform: `translateX(${inR}px)` }}>
        <AbsoluteFill style={{ background: "#B4C4C8", opacity: k }} />
        <Img src={staticFile(P("side_base"))} style={{ position: "absolute", left: side.x, top: side.y, width: side.w, height: side.h, maxWidth: "none" }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}>
          {f >= T.shelf - 2 && f < T.you + 4 && (
            <g opacity={interpolate(f, [T.you - 4, T.you + 4], [1, 0], cl)}>
              <Path d={`M${sl[0] - 8},${sl[1] - 4} L${sl[0] - 70},${sl[1] - 4}`} p={shelfP} w={4} color={WARN} />
              <Path d={`M${sl[0] - 70},${sl[1] - 22} v36`} p={shelfP} w={4} color={WARN} />
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {f >= T.shelf && f < T.you + 2 && <TagPop at={[sl[0] + 20, sl[1] + 70]} t={T.shelf + 4} out={T.you - 4} text="HEAVY 'SHELF' LOOK" live />}
      {/* front panel */}
      {open < 1 && (
        <AbsoluteFill style={{ transform: `translateX(${inL - open * 600}px)`, opacity: 1 - open }}>
          <div style={{ position: "absolute", left: CARD.xL, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: CARD.r, boxShadow: "0 24px 60px rgba(16,24,28,0.3)" }} />
          <AbsoluteFill style={{ clipPath: frontClip }}>
            <AbsoluteFill style={{ background: "#B4C4C8" }} />
            <Pic img="front_base" f={fr(SPLIT_FRONT)} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {open < 0.2 && (
        <>
          <div style={{ position: "absolute", left: CARD.xL + 6, top: CARD.y + CARD.h + 22, display: "flex", flexDirection: "column", gap: 4 }}>
            <Decode text="SYDNEY SWEENEY" t={10} size={20} />
            <Decode text="PHOTOGRAPH" t={14} size={20} o={0.8} />
          </div>
          <div style={{ position: "absolute", left: CARD.xR + 6, top: CARD.y + CARD.h + 22, display: "flex", flexDirection: "column", gap: 4 }}>
            <Decode text="SIDE VIEW" t={14} size={20} />
            <Decode text="GENERATED" t={18} size={20} o={0.8} />
          </div>
        </>
      )}
      {f >= T.first + 20 && <ELine side={side} />}
    </AbsoluteFill>
  );
};

/* ── the two 5-second timers ────────────────────────────────────────── */

const Dial: React.FC<{ x: number; t: number; label: string; n: string }> = ({ x, t, label, n }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: f - t, fps, config: { damping: 13, stiffness: 150 } });
  const sweep = interpolate(f, [T.five + 4, T.five + 40], [0, 1], { ...cl, easing: inOut });
  const R = 74, C = 2 * Math.PI * R;
  return (
    <div style={{ position: "absolute", left: x - 150, top: 360, width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${sp})`, opacity: Math.min(1, sp * 1.5) }}>
      <div style={{ position: "relative", width: 190, height: 190, borderRadius: 190, background: "rgba(28,38,41,0.55)", backdropFilter: "blur(6px)", boxShadow: "0 20px 50px rgba(16,24,28,0.35)" }}>
        <svg width={190} height={190} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          <circle cx={95} cy={95} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={8} />
          <circle cx={95} cy={95} r={R} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - sweep)} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: 76, color: "#fff" }}>{n}</div>
      </div>
      <Tag size={22}>{label}</Tag>
    </div>
  );
};
const Timers: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.two - 4 || f >= T.first + 10) return null;
  const out = interpolate(f, [T.first - 4, T.first + 8], [1, 0], cl);
  return (
    <AbsoluteFill style={{ opacity: out, zIndex: 6 }}>
      <Dial x={290} t={T.two - 4} label="TEST 01 · E-LINE" n="5s" />
      <Dial x={790} t={T.two + 2} label="TEST 02 · PHILTRUM" n="5s" />
      {f >= T.yourself && <TagPop at={[540, 900]} t={T.yourself} text="TRY BOTH ON YOURSELF" live />}
    </AbsoluteFill>
  );
};

/* ── test 1: the E-line, drawn as a finger-ruler ─────────────────────── */

const ELine: React.FC<{ side: ReturnType<typeof place> }> = ({ side }) => {
  const f = useCurrentFrame();
  if (f < T.hold - 4) return null;
  const n = side.pt("noseTip"), c = side.pt("pogonion"), lip = side.pt("lipTop");
  const ang = Math.atan2(c[1] - n[1], c[0] - n[0]);
  const ux = Math.cos(ang), uy = Math.sin(ang);
  const ext = 70;
  const a: Pt = [n[0] - ux * ext, n[1] - uy * ext];
  // the ruler grows from the nose tip ("nose") to the chin ("chin")
  const grow = interpolate(f, [T.nose, T.chin + 6], [0, 1], { ...cl, easing: inOut });
  const full = Math.hypot(c[0] - n[0], c[1] - n[1]) + 2 * ext;
  const len = interpolate(f, [T.hold, T.nose], [0, ext], cl) + grow * (full - ext);
  const rulerIn = interpolate(f, [T.hold - 4, T.hold + 6], [0, 1], cl);
  // the line at the lip's height, and the gap to it
  const tLip = (lip[1] - n[1]) / uy;
  const onLine: Pt = [n[0] + ux * tLip, lip[1]];
  const fwd = draw(f, T.push, 18);
  return (
    <AbsoluteFill style={{ zIndex: 5 }}>
      {/* the finger: a soft translucent bar with ticks, rotated along the E-line */}
      <div style={{ position: "absolute", left: a[0], top: a[1] - 15, width: len, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.28)", border: "2px solid rgba(255,255,255,0.9)", transformOrigin: "0 50%", transform: `rotate(${ang}rad)`, opacity: rulerIn, backdropFilter: "blur(2px)", boxShadow: "0 8px 22px rgba(16,24,28,0.25)", overflow: "hidden" }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 14 + i * 16, top: 0, width: 2, height: i % 5 === 0 ? 14 : 8, background: "rgba(255,255,255,0.85)" }} />
        ))}
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}>
        {f >= T.nose && <circle cx={n[0]} cy={n[1]} r={interpolate(f, [T.nose, T.nose + 6], [0, 9], cl)} fill="#fff" />}
        {f >= T.chin && <circle cx={c[0]} cy={c[1]} r={interpolate(f, [T.chin, T.chin + 6], [0, 9], cl)} fill="#fff" />}
        {f >= T.upper && (
          <g>
            <circle cx={lip[0]} cy={lip[1]} r={interpolate(f, [T.upper, T.upper + 6], [0, 8], cl)} fill="#fff" />
            <Path d={`M${lip[0]},${lip[1]} L${onLine[0]},${onLine[1]}`} p={draw(f, T.touches, 8)} w={3} dash="4 6" />
          </g>
        )}
        {f >= T.push && (
          <g>
            <Path d={arrowPath([lip[0] + 10, lip[1] + 26], [onLine[0] - 70, lip[1] + 14], -0.25)} p={fwd} w={4} color={WARN} />
            <Path d={`M${onLine[0] - 6},${lip[1] - 40} Q${onLine[0] - 74},${lip[1]} ${onLine[0] - 6},${lip[1] + 46}`} p={draw(f, T.forward, 12)} w={3.5} color={WARN} dash="7 7" />
          </g>
        )}
      </svg>
      {f >= T.nose && <TagPop at={[n[0] + 10, n[1] - 70]} t={T.nose + 2} out={T.upper - 4} text="NOSE TIP" />}
      {f >= T.chin && <TagPop at={[c[0] - 10, c[1] + 70]} t={T.chin + 2} out={T.second - 6} text="CHIN TIP" />}
      {f >= T.finger2 && <TagPop at={[600, n[1] - 190]} t={T.finger2} out={T.push - 4} text="THIS VIEW: LIP BEHIND THE LINE" />}
      {f >= T.forward && <TagPop at={[600, n[1] - 190]} t={T.forward + 4} text="PAST THE LINE = FORWARD" live />}
    </AbsoluteFill>
  );
};

/* ── test 2: the mirror (and the flip, the flicker, the macro) ──────── */

const MIRROR_C: Pt = [540, mirrorP.pt("noseTip")[1] - 30];
const MRX = 360, MRY = 520;

/** which front still the mirror shows */
const mirrorImg = (f: number) => {
  if (f < T.thinner) return "front_base";
  // "Only the lips were edited": base / thin / base / thin
  const flick = [T.only, T.only + 7, T.edited, T.edited + 7];
  const k = flick.filter((t) => f >= t).length;
  if (k > 0 && k < 4) return k % 2 === 1 ? "front_base" : "front_1_thin";
  return "front_1_thin";
};

const Mirror: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.second + 2 || f >= T.refina) return null;
  // whip in from the right
  const inX = interpolate(f, [T.second + 2, T.second + 16], [1300, 0], { ...cl, easing: Easing.out(Easing.cubic) });
  const blur = interpolate(f, [T.second + 2, T.second + 16], [18, 0], cl);
  // the oval closes on "mirror", reopens for the macro
  const oval = interpolate(f, [T.look, T.mirror + 6], [0, 1], { ...cl, easing: inOut }) * interpolate(f, [T.a - 4, T.a + 10], [1, 0], { ...cl, easing: inOut });
  const rx = MRX + (1 - oval) * 700, ry = MRY + (1 - oval) * 900;
  // the flip on "thinner": 0 -> 90deg (base), swap, 90 -> 0 (thin)
  const flip = interpolate(f, [T.thinner - 6, T.thinner, T.thinner + 8], [0, 90, 0], { ...cl, easing: inOut });
  // poll dims it; macro pushes onto the mouth; the end clears it
  const dim = interpolate(f, [T.did - 4, T.did + 8, T.a - 6, T.a + 4], [0, 1, 1, 0], cl);
  const macroK = interpolate(f, [T.a, T.a + 24], [0, 1], { ...cl, easing: inOut }) * interpolate(f, [T.own - 4, T.changes + 10], [1, 0], { ...cl, easing: inOut });
  const gone = interpolate(f, [T.changes, T.refina - 2], [0, 1], cl);
  const framing = fr(lerpF({ faceH: MIRROR.faceH, at: mirrorP.pt("mouth") }, { ...MACRO, at: [540, 820] }, macroK), "mouth");
  // macro: full <-> thin dissolve on "difference"
  const diff = interpolate(f, [T.difference, T.difference + 10, T.difference + 24, T.difference + 34], [0, 1, 1, 0], cl);
  const img = f >= T.a - 4 ? "front_base" : mirrorImg(f);
  const p = place(FRONT, { ...framing, anchor: "mouth" });
  const glare = interpolate(f, [T.mirror, T.mirror + 22], [-0.4, 1.4], cl);
  return (
    <AbsoluteFill style={{ opacity: 1 - gone }}>
      <AbsoluteFill style={{ transform: `translateX(${inX}px)`, filter: blur > 0.1 ? `blur(${blur}px)` : undefined, perspective: 1600 }}>
        <AbsoluteFill style={{ clipPath: `ellipse(${rx}px ${ry}px at ${MIRROR_C[0]}px ${MIRROR_C[1]}px)`, transform: `rotateY(${flip}deg)`, transformOrigin: `${MIRROR_C[0]}px 50%`, filter: `brightness(${1 - 0.45 * dim})` }}>
          <Img src={staticFile(P(img))} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, maxWidth: "none" }} />
          {diff > 0 && <Img src={staticFile(P("front_1_thin"))} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, maxWidth: "none", opacity: diff }} />}
          {oval > 0.05 && (
            <div style={{ position: "absolute", left: MIRROR_C[0] - rx, top: MIRROR_C[1] - ry, width: rx * 2, height: ry * 2, borderRadius: "50%", overflow: "hidden", pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: -200, bottom: -200, width: 160, left: `${glare * 100}%`, transform: "rotate(18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.28), rgba(255,255,255,0))" }} />
            </div>
          )}
        </AbsoluteFill>
        {oval > 0.02 && (
          <div style={{ position: "absolute", left: MIRROR_C[0] - rx - 8, top: MIRROR_C[1] - ry - 8, width: (rx + 8) * 2, height: (ry + 8) * 2, borderRadius: "50%", border: "8px solid #fff", boxShadow: "0 30px 80px rgba(16,24,28,0.35)", opacity: oval, transform: `rotateY(${flip}deg)` }} />
        )}
      </AbsoluteFill>
      {macroK > 0.3 && <MmTicks k={macroK} />}
      {macroK < 0.05 && f >= T.space && f < T.did && <Brackets img={img} />}
      {f >= T.second + 16 && f < T.did - 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1478, display: "flex", justifyContent: "center", zIndex: 6 }}>
          <Tag size={22} tone={img === "front_1_thin" ? "live" : "plain"}>{img === "front_1_thin" ? "EDITED · THINNER LIPS" : "SYDNEY SWEENEY · PHOTOGRAPH"}</Tag>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** A vertical bracket with end caps, drawn on progress p. */
const Bracket: React.FC<{ x: number; y0: number; y1: number; p: number; w?: number; color?: string; glow?: number }> = ({ x, y0, y1, p, w = 3.5, color = MARK, glow = 0 }) => {
  const ym = (y0 + y1) / 2, h = (y1 - y0) / 2;
  return (
    <g style={{ filter: glow > 0 ? `drop-shadow(0 0 ${10 * glow}px rgba(255,255,255,${0.9 * glow}))` : undefined }}>
      <Path d={`M${x},${ym} L${x},${ym - h * p} M${x},${ym} L${x},${ym + h * p}`} p={1} w={w} color={color} />
      {p > 0.95 && <Path d={`M${x - 16},${y0} h32 M${x - 16},${y1} h32`} p={1} w={w} color={color} />}
    </g>
  );
};

const Brackets: React.FC<{ img: string }> = ({ img }) => {
  const f = useCurrentFrame();
  const x = mp("front_base", "mouthB")[0] + 90;
  // A tracks the shown still; on "The gap" it re-measures base -> thin
  const k = img === "front_1_thin" ? interpolate(f, [T.gap - 2, T.longer + 4], [0, 1], { ...cl, easing: inOut }) : 0;
  const thinNow = img === "front_1_thin";
  const A0 = mp("front_base", "subnasale")[1], A1b = mp("front_base", "lipTop")[1];
  const A1t = mp("front_1_thin", "lipTop")[1];
  const A1 = thinNow && f >= T.gap - 2 && f < T.only ? A1b + (A1t - A1b) * k : thinNow && f >= T.only ? A1t : A1b;
  const B0 = mp(img, "lipBot")[1], B1 = mp(img, "menton")[1];
  const glowB = interpolate(f, [T.chin3, T.stronger + 6], [0, 1], cl);
  const hideFlick = f >= T.only - 2 && f < T.edited + 10;
  if (hideFlick) return null;
  const out = interpolate(f, [T.thats - 4, T.thats + 6], [1, 0.0], cl);
  if (out <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: out, zIndex: 5 }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}>
        <Bracket x={x} y0={A0} y1={A1} p={draw(f, T.space, 14)} color={f >= T.longer && thinNow ? WARN : MARK} />
        {f >= T.height - 6 && <Bracket x={x} y0={B0} y1={B1} p={draw(f, T.height - 6, 14)} w={3.5 + 2 * glowB} glow={glowB} />}
      </svg>
      <TagPop at={[x + 120, (A0 + A1) / 2]} t={T.space + 6} text={f >= T.longer && thinNow ? "LONGER" : "A · NOSE TO LIP"} live={f >= T.longer && thinNow} />
      {f >= T.height - 2 && <TagPop at={[x + 100, (B0 + B1) / 2]} t={T.height} text={f >= T.stronger ? "READS STRONGER" : "B · CHIN"} live={f >= T.stronger} />}
      {f >= T.chin2 + 4 && f < T.now && <TagPop at={[540, MIRROR_C[1] - MRY - 70]} t={T.chin2 + 4} text="IS A ROUGHLY HALF OF B?" live />}
    </AbsoluteFill>
  );
};

/** millimetre ticks beside the macro mouth (no numbers - a span never carries a figure) */
const MmTicks: React.FC<{ k: number }> = ({ k }) => {
  const f = useCurrentFrame();
  const p = draw(f, T.millimetre - 4, 20);
  const x = 930, y0 = 560, n = 34;
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, (k - 0.3) * 3), zIndex: 5 }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}>
        <Path d={`M${x},${y0} L${x},${y0 + n * 18}`} p={p} w={3} />
        {Array.from({ length: n + 1 }).map((_, i) => (i / n <= p ? <Path key={i} d={`M${x},${y0 + i * 18} h${i % 5 === 0 ? -34 : -18}`} p={1} w={2.5} /> : null))}
      </svg>
      {f >= T.difference && <TagPop at={[540, 1360]} t={T.difference} out={T.changes + 4} text="THE MILLIMETRE DIFFERENCE" live />}
    </AbsoluteFill>
  );
};

/* ── the app's real Lip Lift row ────────────────────────────────────── */

const SEL = "size/app/select-procedures.png";
const SEL_W = 567;
const ROW: Record<string, number> = { buccal: 1410, lipLift: 1521, lipAug: 1630 }; // row centres, px of the 567-wide screen

const LiftCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.lip3 - 6 || f >= T.did + 4) return null;
  const sp = spring({ frame: f - (T.lip3 - 6), fps, config: { damping: 15, stiffness: 120 } });
  const out = interpolate(f, [T.did - 6, T.did + 4], [1, 0], cl);
  const sc = 880 / (SEL_W - 40);
  const lipY = mp("front_1_thin", "lipTop");
  return (
    <AbsoluteFill style={{ opacity: out, zIndex: 7 }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}>
        {[-70, 0, 70].map((dx, i) => (
          <Path key={i} d={arrowPath([lipY[0] + dx, lipY[1] + 20], [lipY[0] + dx, lipY[1] - 40], 0)} p={draw(f, T.lift + i * 3, 10)} w={3.5} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 100, top: 390, width: 880, height: 104 * sc, borderRadius: 28, overflow: "hidden", transform: `translateY(${(1 - sp) * 500}px)`, boxShadow: "0 30px 70px rgba(16,24,28,0.4)", background: "#FBF9F6" }}>
        <Img src={staticFile(SEL)} style={{ position: "absolute", left: -20 * sc, top: -(ROW.lipLift - 52) * sc, width: SEL_W * sc, maxWidth: "none" }} />
      </div>
      {f >= T.volume2 - 6 && <TagPop at={[540, 610]} t={T.volume2 - 6} text="NO HEAVY VOLUME" />}
    </AbsoluteFill>
  );
};

/* ── poll ───────────────────────────────────────────────────────────── */

const Poll: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.did - 4 || f >= T.a + 6) return null;
  const sp = spring({ frame: f - (T.did - 4), fps, config: { damping: 14, stiffness: 150, mass: 0.8 } });
  const out = interpolate(f, [T.a - 6, T.a + 4], [1, 0], cl);
  const btn = (label: string, t: number) => {
    const press = interpolate(f, [t, t + 3, t + 9], [1, 0.92, 1], cl);
    const ripple = interpolate(f, [t, t + 16], [0, 1], cl);
    const on = f >= t;
    return (
      <div style={{ position: "relative", flex: 1, height: 130, borderRadius: 30, background: on ? "#1C2629" : "#EEF2F3", color: on ? "#fff" : "#1C2629", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sansFont, fontWeight: 700, fontSize: 52, letterSpacing: "0.04em", transform: `scale(${press})`, overflow: "hidden" }}>
        {label}
        {f >= t && ripple < 1 && <div style={{ position: "absolute", left: "50%", top: "50%", width: 400 * ripple, height: 400 * ripple, marginLeft: -200 * ripple, marginTop: -200 * ripple, borderRadius: "50%", background: `rgba(255,255,255,${0.35 * (1 - ripple)})` }} />}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 110, width: 860, top: 640, opacity: out * Math.min(1, sp * 1.5), transform: `scale(${0.75 + 0.25 * sp})`, zIndex: 8 }}>
      <div style={{ background: "#fff", borderRadius: 44, padding: "40px 40px 44px", boxShadow: "0 30px 80px rgba(16,24,28,0.4)" }}>
        <div style={{ fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: 60, color: "#1C2629", textAlign: "center", lineHeight: 1.1, marginBottom: 34 }}>Did your finger touch your top lip?</div>
        <div style={{ display: "flex", gap: 26 }}>
          {btn("YES", T.yes)}
          {btn("NO", T.no)}
        </div>
      </div>
      {f >= T.comment && (
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", transform: `scale(${interpolate(f, [T.comment, T.comment + 6, T.comment + 12], [0.8, 1.06, 1], cl)})` }}>
          <Tag size={26} tone="live">COMMENT YES OR NO</Tag>
        </div>
      )}
    </div>
  );
};

/* ── the product: phone slides in sideways ───────────────────────────── */

const PHONE_W = 540;
const PHONE_H = Math.round((PHONE_W * 1920) / 1080);
const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = T.refina - 6;
  if (f < from || f > T.dont + 8) return null;
  const sp = spring({ frame: f - from, fps, config: { damping: 17, stiffness: 110 } });
  const leave = interpolate(f, [T.dont - 6, T.dont + 8], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  const px = (W - PHONE_W) / 2, py = 440;
  const sc = PHONE_W / SEL_W;
  // scroll to Lip Lift, then the ring steps to Lip Augmentation on "filler"
  const scrollTo = (row: number) => row * sc - PHONE_H * 0.5;
  const scroll = interpolate(f, [from + 6, T.lip5 - 2, T.filler2, T.filler2 + 10], [0, scrollTo(ROW.lipLift), scrollTo(ROW.lipLift), scrollTo(ROW.lipAug)], { ...cl, easing: inOut });
  const ringRow = f < T.filler2 ? ROW.lipLift : ROW.lipAug;
  const ring = interpolate(f, [T.lip5 - 2, T.lip5 + 6], [0, 1], cl);
  const toTurn = interpolate(f, [T.turn2 - 8, T.turn2 + 6], [0, 1], { ...cl, easing: ease });
  return (
    <AbsoluteFill style={{ opacity: 1 - leave }}>
      <div style={{ position: "absolute", left: px, top: py, width: PHONE_W, height: PHONE_H, transform: `translateX(${(1 - sp) * 900 - leave * 900}px) rotate(${(1 - sp) * 9}deg)` }}>
        <div style={{ position: "absolute", left: -14, top: -14, width: PHONE_W + 28, height: PHONE_H + 28, borderRadius: 78, background: "#1C2629", boxShadow: "0 40px 80px rgba(20,32,36,0.32)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, borderRadius: 64, overflow: "hidden", background: "#FBF9F6" }}>
          <div style={{ position: "absolute", left: -toTurn * PHONE_W, top: -scroll, width: PHONE_W }}>
            <Img src={staticFile(SEL)} style={{ width: PHONE_W }} />
            <div style={{ position: "absolute", left: 12, top: (ringRow - 52) * sc, width: PHONE_W - 24, height: 104 * sc, borderRadius: 16, border: `4px solid rgba(198,137,138,${ring})`, boxShadow: `0 0 0 ${8 * ring}px rgba(198,137,138,${0.18 * ring})` }} />
          </div>
          {toTurn > 0 && (
            <Sequence from={T.turn2 - 8} layout="none">
              <div style={{ position: "absolute", left: (1 - toTurn) * PHONE_W, top: 0, width: PHONE_W, height: PHONE_H, background: "#fff" }}>
                <OffthreadVideo src={staticFile("size/app/turn.mp4")} muted playbackRate={1.2} style={{ width: PHONE_W, height: PHONE_H, objectFit: "cover", objectPosition: "50% 30%" }} />
              </div>
            </Sequence>
          )}
        </div>
      </div>
      <div style={{ position: "absolute", top: py + PHONE_H + 40, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Tag size={24}>{f < T.turn2 - 4 ? "REFINA  ·  SELECT PROCEDURES" : "BRING TO LIFE  ·  3D  ·  SAMPLE USER"}</Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ── close: the empty mirror ─────────────────────────────────────────── */

const SwipeTag: React.FC<{ text: string; t: number; away: number; y: number }> = ({ text, t, away, y }) => {
  const f = useCurrentFrame();
  if (f < t) return null;
  const k = interpolate(f, [t, t + 8], [0, 1], { ...cl, easing: ease });
  const a = interpolate(f, [away, away + 10], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: k * (1 - a), transform: `translateX(${(1 - k) * 60 - a * 700}px) rotate(${-a * 8}deg)` }}>
      <Tag size={28}>{text}</Tag>
    </div>
  );
};
const Close: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.dont - 4 || f >= T.comment2 + 4) return null;
  const out = interpolate(f, [T.comment2 - 8, T.comment2 + 2], [1, 0], cl);
  const ov = interpolate(f, [T.dont - 4, T.dont + 12], [0, 1], { ...cl, easing: ease });
  const cy = 1000, rx = 300, ry = 400;
  const glare = interpolate(f, [T.preview2, T.preview2 + 24], [-0.4, 1.4], cl);
  const words = [
    { s: "your own", t: T.own3, size: 92 },
    { s: "face,", t: T.own3 + 6, size: 92 },
    { s: "first.", t: T.first2, size: 112 },
  ];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <SwipeTag text="WHAT AN INJECTOR SAYS" t={T.injector - 4} away={T.sydney2 - 4} y={380} />
      <SwipeTag text="SYDNEY SWEENEY'S LIPS" t={T.sydney2} away={T.preview2} y={380} />
      <div style={{ position: "absolute", left: 540 - rx, top: cy - ry, width: rx * 2, height: ry * 2, borderRadius: "50%", border: "8px solid #fff", boxShadow: "0 30px 80px rgba(16,24,28,0.3), inset 0 0 80px rgba(255,255,255,0.18)", transform: `scale(${0.85 + 0.15 * ov})`, opacity: ov, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, bottom: -200, width: 140, left: `${glare * 100}%`, transform: "rotate(18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0))" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {words.map((w, i) => {
          const k = interpolate(f, [w.t, w.t + 10], [0, 1], cl);
          return <div key={i} style={{ fontFamily: headlineItalicStack, fontStyle: "italic", fontSize: w.size, color: "#fff", lineHeight: 1.0, opacity: k, filter: `blur(${(1 - k) * 10}px)`, transform: `translateY(${(1 - k) * 14}px)` }}>{w.s}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ── sound ──────────────────────────────────────────────────────────── */

const SfxTrack: React.FC = () => (
  <>
    <Sequence durationInFrames={30} layout="none">
      <Audio src={staticFile("sfx/trio/shutter.mp3")} trimBefore={17} volume={0.8} />
    </Sequence>
    <Fx n="swoosh-thin" at={2} v={0.2} dur={30} />
    <Fx n="tap-soft" at={T.shelf} v={0.24} dur={16} />
    <Fx n="pop-minimal" at={T.two - 2} v={0.2} dur={20} />
    <Fx n="pop-minimal" at={T.two + 4} v={0.2} dur={20} />
    <Fx n="light-whoosh" at={T.first} v={0.22} dur={30} />
    <Fx n="tap-soft" at={T.nose} v={0.26} dur={16} />
    <Fx n="click-soft" at={T.chin} v={0.3} dur={14} />
    <Fx n="tap-soft" at={T.upper} v={0.24} dur={16} />
    <Fx n="boom-soft" at={T.push} v={0.16} dur={50} />
    <Fx n="swoosh-fast" at={T.second} v={0.28} dur={30} />
    <Fx n="air-whoosh-5" at={T.mirror} v={0.18} dur={36} />
    <Fx n="tap-soft" at={T.space} v={0.22} dur={16} />
    <Fx n="tap-soft" at={T.height - 6} v={0.22} dur={16} />
    <Fx n="air-whoosh-8" at={T.thinner - 6} v={0.24} dur={36} />
    <Fx n="click-soft" at={T.longer} v={0.26} dur={14} />
    {[T.only, T.only + 7, T.edited, T.edited + 7].map((t) => <Fx key={t} n="click-interface" at={t} v={0.22} dur={12} />)}
    <Fx n="paper-slide.wav" at={T.lip3 - 6} v={0.3} dur={30} />
    <Fx n="notify-soft" at={T.did - 4} v={0.24} dur={36} />
    <Fx n="click-soft" at={T.yes} v={0.36} dur={14} />
    <Fx n="click-soft" at={T.no} v={0.36} dur={14} />
    <Fx n="air-whoosh-8" at={T.a} v={0.2} dur={36} />
    <Fx n="boom-soft" at={T.refina - 6} v={0.22} dur={70} />
    <Fx n="tap-soft" at={T.lip5} v={0.22} dur={16} />
    <Fx n="tap-soft" at={T.filler2} v={0.22} dur={16} />
    <Fx n="swoosh-thin" at={T.turn2 - 8} v={0.2} dur={30} />
    <Fx n="swoosh-thin" at={T.sydney2 - 4} v={0.18} dur={30} />
    <Fx n="swoosh-thin" at={T.preview2} v={0.18} dur={30} />
    <Fx n="notify-soft" at={T.comment2 + 4} v={0.24} dur={40} />
  </>
);

/* ── the reel ────────────────────────────────────────────────────────── */

const Reel: React.FC = () => (
  <Stage>
    <Audio src={staticFile("size/vo.mp3")} />
    <SfxTrack />
    <SplitAndSide />
    <Mirror />
    <Timers />
    <LiftCard />
    <Poll />
    <Phone />
    <Close />
    <CommentEnd from={T.comment2} keyAt={T.dossier} />

    <Head lines={["Would filler suit", "Sydney's face?"]} from={0} until={T.first - 2} />
    <Head lines={["Test 01", "the E-line"]} from={T.first} until={T.second - 2} />
    <Head lines={["Test 02", "the philtrum"]} from={T.second + 4} until={T.now - 2} />
    <Head lines={["Same face,", "thinner lips"]} from={T.now} until={T.did - 4} />
    <Head lines={["Millimetres", "matter"]} from={T.a} until={T.refina - 6} />
    <Head lines={["Preview it", "on your photo"]} from={T.refina} until={T.dont - 4} />
    <Sequence from={T.refina} durationInFrames={T.dont - T.refina} layout="none">
      <AiChip y={262} size={24} />
    </Sequence>

    {/* no line shown twice: the poll card and the close draw their own words */}
    <Captions cues={CUES} skip={(c) => (c.f >= T.did - 2 && c.f < T.a - 2) || c.f >= T.preview2 - 2} />
    <Flashes cues={[0, T.thinner]} peak={0.12} />
  </Stage>
);

export const GlowupSize: React.FC = () => <Composition id="GlowupSize" component={Reel} durationInFrames={SIZE_FRAMES} fps={FPS} width={W} height={H} />;
