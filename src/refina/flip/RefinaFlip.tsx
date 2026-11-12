import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAGE, Stage, portrait } from "../protocol/atoms";
import { SectionHeadline } from "../preview/draw";
import { PhoneShell } from "../preview/flood";
import { Plate } from "../preview/plate";
import { TypewriterInput } from "../kit";
import { headlineStack } from "../../fonts";
import { faceCol, labelOf } from "../anchors";
import {
  AiChip,
  Bottom,
  Face,
  Mono,
  Reveal,
  Sfx,
  Step,
  Tag,
  clamp,
  useSweep,
} from "../ratio/atoms";
import { ASYM, ASYM_LABEL } from "./measured";
import { FlipCaptions } from "./captions";
import { B, TOTAL, bf, len, line } from "./beats";
import { SHOTS } from "./shots";
import type { BeatProps } from "./shots";
import type { BeatName } from "./beats";

/**
 * "You've Never Seen Your Own Face" — educational explainer, RefinaFlip.
 *
 * THE ARGUMENT. A mirror reverses you and a photograph does not, so the face
 * you have rehearsed in front of your whole life is the reverse of the one
 * everyone else has been looking at. Every step is either a physical fact about
 * mirrors or an operation performed on screen.
 *
 * WHY THIS REEL MAY SHOW ITS OWN EVIDENCE. Every second picture in it is a pure
 * geometric operation on ONE registered master — a horizontal flip, one half
 * doubled onto its own mirror, or an absolute difference — all computed by
 * `gen/asym.py`. Nothing is generated, retouched or re-rendered. Unlike the
 * procedure reels there is no question of whether a model did what it was
 * asked: the pair is exact by construction, and that is what buys the right to
 * put a measurement on screen. The figures come from `measured.ts`, written by
 * `gen/emit-asym.py` from the scorer's own output — no digit about a face is
 * typed here (rule E, and invariant B applied to evidence rather than timing).
 *
 * THE MIDLINE IS SOLVED, NOT CHOSEN, and it is deliberately generous: the axis
 * is the one that makes the face as symmetric as it can be, so every number the
 * reel prints is a LOWER BOUND on the disagreement. The seam the chimera beats
 * draw is that same axis, mapped through `faceCol` — the identical cover maths
 * that lays the picture out (invariant S).
 *
 * TWO SUBJECTS, AND THE SECOND IS ANNOUNCED. `bleph1` carries the spine;
 * `everyone` says "another face" in the read AND carries a SECOND SUBJECT tag.
 * `RefinaChanged`'s first cut silently changed who its subject was three times
 * and that was its worst defect.
 *
 * NOTHING CREEPS TO MOVE A METRIC. Where the picture moves it moves because the
 * operation being taught is moving — the card turns over, the seam travels, the
 * halves fold in. Rule P.
 */

const FPS = 30;

const at = (k: BeatName) => ({
  from: B[k][0],
  durationInFrames: B[k][1] - B[k][0],
});

/* ── assets ──────────────────────────────────────────────────────────
   Two women. `bleph1` carries the spine; `demo1` is the announced second
   subject. Every other picture in the reel is one of them, transformed. */
// The only asset named in code, and only as a fallback — every beat takes its
// assets from shots.json, which is what makes changing one a data edit.
const HERO = "bleph1-before";

type Id = Parameters<typeof faceCol>[0];
const asId = (n?: string) => (n ?? HERO) as Id;

/** Props a beat gets: the spec's, plus its own measured length. */
type BeatArgs = BeatProps & { len: number };

const parseFocus = (f?: string): [number, number] => {
  if (!f) return [0.5, 0.32];
  const [x, y] = f.split(" ").map((v) => parseFloat(v) / 100);
  return [x, y];
};

/**
 * The frame column of a subject's SOLVED mirror axis.
 *
 * `measured.ts` reports it as an offset from the face centre in the master's
 * own pixels; this maps it through the same cover maths that draws the picture.
 * Every chimera seam in the reel is this number, so a re-measured subject moves
 * the seam with it and no beat has to be re-eyeballed.
 */
const seamX = (id: Id, subject: string, zoom: number, focus: [number, number]) =>
  faceCol(
    id,
    (ASYM as Record<string, { axisOffsetPx: number } | undefined>)[subject]
      ?.axisOffsetPx ?? 0,
    { width: 1080, height: 1920 },
    zoom,
    focus,
  );

/** subject key from an asset id — "bleph1-left" -> "bleph1" */
const subjectOf = (name: string) => name.split("-")[0];

/* ── pieces ──────────────────────────────────────────────────────────── */

/**
 * A caption band across a picture.
 *
 * TYPE FLOOR: 26px at 1080, about 9px on a phone. `gen/check-legibility.py`
 * warns below it and fails for load-bearing text. These bands ARE load-bearing
 * — "WHAT THE MIRROR SHOWS YOU" is the whole claim of its beat — so they run
 * well over the floor and sit on their own ink, not on the photograph.
 */
const Band: React.FC<{ text: string; from?: number; y?: number }> = ({
  text,
  from = 0,
  y,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 8], [0, 1], clamp);
  const dy = interpolate(frame, [from, from + 10], [14, 0], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${dy}px)`,
      }}
    >
      <Tag>{text}</Tag>
    </div>
  );
};

/** The measured chips. The label names the OPERATION, never a person. */
const MeasureChips: React.FC<{ subject: string; from: number }> = ({
  subject,
  from,
}) => {
  const m = (ASYM as Record<string, (typeof ASYM)[keyof typeof ASYM] | undefined>)[
    subject
  ];
  if (!m) return null;
  const rows: [string, number][] = [
    ["EYES", m.regions.eyes],
    ["NOSE", m.regions.nose],
    ["JAW", m.regions.jaw],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "23%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <Chip from={from}>
        <Mono size={27} o={0.86}>
          {ASYM_LABEL}
        </Mono>
      </Chip>
      <div style={{ display: "flex", gap: 12 }}>
        {rows.map(([k, v], i) => (
          <Chip key={k} from={from + 10 + i * 7}>
            <Mono size={30}>
              {k} {v.toFixed(0)}
            </Mono>
          </Chip>
        ))}
      </div>
    </div>
  );
};

const Chip: React.FC<{ children: React.ReactNode; from: number }> = ({
  children,
  from,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 200 }, durationInFrames: 14 });
  return (
    <div
      style={{
        background: "rgba(18,26,30,0.78)",
        border: "1px solid rgba(255,255,255,0.24)",
        borderRadius: 6,
        padding: "10px 16px",
        opacity: s,
        transform: `translateY(${(1 - s) * 12}px)`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * The picture layer, sized independently of the type over it.
 *
 * WHY THIS EXISTS. At cover scale this subject's face measures ~0.455 of frame
 * height and the corpus close band tops out at 0.453 — 0.453 is not a style
 * rule, it is the LARGEST face height measured anywhere across 1268 corpus
 * frames, so every portrait beat here was framed tighter than any reference
 * reel. A portrait cannot be scaled below cover without the backdrop showing,
 * so the fix is the documented one: composite the picture as a sized element on
 * the stage rather than bleeding it (see the build reference — "that is a
 * re-cut, not a parameter change").
 *
 * Type stays OUTSIDE this wrapper. Scaling the whole beat would have taken the
 * 26px floor down to 24px and quietly broken legibility to fix framing.
 */
const Pic: React.FC<{ fit?: number; children: React.ReactNode }> = ({ fit = 1, children }) =>
  fit >= 1 ? (
    <>{children}</>
  ) : (
    <AbsoluteFill style={{ transform: `scale(${fit})` }}>{children}</AbsoluteFill>
  );

/** A dim scrim, for the beats that carry type over a photograph. */
const Scrim: React.FC<{ amount: number }> = ({ amount }) => (
  <AbsoluteFill style={{ background: `rgba(14,20,24,${amount})` }} />
);

const Burst: React.FC<{
  lines: string[];
  from: number;
  hold: number;
  italicSecond?: boolean;
}> = ({ lines, from, hold, italicSecond }) => (
  <Sequence from={from} durationInFrames={hold} layout="none">
    <SectionHeadline lines={lines} len={hold} from={2} out={14} italicSecond={italicSecond} />
  </Sequence>
);

/* ── the beat library ─────────────────────────────────────────────────
   Every component here is driven ENTIRELY by props from shots.json plus its
   own length. A beat that reads a module constant is a beat the spec cannot
   reconfigure, which defeats the point of having a spec. */

/**
 * hook — the photograph turns over and lands on its own mirror.
 *
 * A card flip is not decoration here, it IS the operation: turning a
 * transparency over is exactly what produces the second picture. The back face
 * is the registered `-flip` asset rather than a CSS `scaleX(-1)`, so what the
 * viewer lands on is a file the registry has measured and labelled.
 */
const FullBleedTurn: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const focus = parseFocus(p.focus);
  const zoom = p.zoom ?? 1;
  const turns = p.turns ?? 2;

  // Anchors, not a constant rate: the turn lands on the flip and HOLDS there
  // through the line that names it, then returns her true face for the next
  // beat. A continuous spin would put the flip on screen at whatever angle the
  // sentence happened to arrive at.
  const L = p.len;
  // ONE CONTINUOUS TURN, NO DEAD HOLD. The first cut turned, held flat for a
  // third of the beat, then turned again -- and measured 60.7% still. The turn
  // IS the beat's content, so it runs its whole length; this is not a creep
  // added to move a number (rule P), it is the operation taking the time the
  // sentence takes.
  /* FAST THROUGH THE CROSSING, HELD EITHER SIDE.
     A continuous turn measured well and looked broken: a plane rotated to 90
     degrees is a LINE, and at ~1.9 deg/frame the card sat near-invisible for
     about ten frames, four times over. The phone sheet showed an all but empty
     frame at f84; the motion check had scored that beat a pass. Nothing
     automated caught it and nothing automated could.
     The turn now holds at 0 and at 180 and crosses in ~20 frames, so the blank
     moment is 3-4 frames -- a flip, not a strobe. The cost is that the beat is
     held for most of its length, which is why the plan calls it `static`. */
  const a = [0, 0.22, 0.30, 0.62, 0.70, 1].map((k) => k * L);
  const deg = interpolate(frame, a, [0, 0, 180, 180, 180 * turns, 180 * turns], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const showBack = ((deg + 90) % 360) >= 180;

  return (
    <AbsoluteFill style={{ perspective: 2600, background: SAGE, overflow: "hidden" }}>
      {/* Oversized by 18%: a plane rotated in perspective is narrower than the
          frame at its edges, and the phone sheet showed a sage wedge in the
          bottom corner mid-turn that reads as a rendering fault rather than as
          a photograph turning over. */}
      <AbsoluteFill
        style={{
          transform: `scale(${p.fit ?? 1.02}) rotateY(${deg}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <AbsoluteFill style={{ backfaceVisibility: "hidden" }}>
          <Face name={p.under ?? HERO} zoom={zoom} focus={focus} />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Face name={p.over ?? HERO} zoom={zoom} focus={focus} />
        </AbsoluteFill>
      </AbsoluteFill>
      {/* The label is read from the asset record, so the claim cannot outrun
          the file: `bleph1-flip` records itself as "SAME FILE, FLIPPED". */}
      {showBack ? <Band text={labelOf(asId(p.over))} y={1418} from={0} /> : null}
      {p.compliance ? <AiChip /> : null}
    </AbsoluteFill>
  );
};

/**
 * claim — two bands slide apart, and the top one becomes the mirror.
 *
 * Full-width bands rather than a split screen: `RefinaChanged` was described by
 * Gemini as "2-column split screen" for six of nine beats, and a horizontal
 * band keeps the face at close scale instead of shrinking it into a column.
 */
const StackedBands: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const focus = parseFocus(p.focus);
  const zoom = p.zoom ?? 1;
  const bands = p.bands ?? [];

  const enter = (i: number) =>
    spring({ frame: frame - 4 - i * 6, fps, config: { damping: 200 }, durationInFrames: 20 });
  // The top band cross-fades to the mirror AFTER both have settled, so the
  // viewer sees two identical pictures diverge rather than two different ones
  // arrive.
  // The top band REVERSES, AND KEEPS REVERSING. A single cross-over left the
  // beat 86% still, and one flip is also weaker as content: "a mirror reverses
  // you" is a thing that keeps being true, so the band keeps doing it. The
  // bottom band never moves, which is the whole comparison.
  /* A TRAVELLING EDGE, NOT A DISSOLVE.
     Cross-fading the band into its mirror measured 5% moving: the two pictures
     are near-identical, so a blend moves each pixel by a couple of units a
     frame and almost no tile crosses the detector's threshold. A hard edge
     sweeping across does move, and it is the better read anyway -- the viewer
     watches the face reverse instead of watching it haze over. */
  const sweep = useSweep(Math.round(p.len * 0.26), 96);

  /* BOTH BANDS WINDOW THE SAME ROWS. The first cut gave each band its own
     offset into the composite, so the top band showed her brow and the bottom
     her mouth — two different parts of a face, captioned as though they were
     the same one seen two ways. The comparison IS the beat, and a comparison
     of different crops is not a comparison. One `WIN` for both; the only
     difference between the bands is the flip. */
  const H = 782;
  const WIN = 470;
  const TOPS = [126, 986];

  const band = (i: number, node: React.ReactNode) => (
    <div
      style={{
        position: "absolute",
        top: TOPS[i],
        left: 0,
        right: 0,
        height: H,
        overflow: "hidden",
        transform: `translateX(${(1 - enter(i)) * (i === 0 ? -1080 : 1080)}px)`,
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: -WIN, height: 1920 }}>
        {node}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: SAGE }}>
      <Pic fit={p.fit}>
      {band(
        0,
        <>
          <Face name={p.under ?? HERO} zoom={zoom} focus={focus} />
          <AbsoluteFill style={{ clipPath: `inset(0 ${100 - sweep}% 0 0)` }}>
            <Face name={p.over ?? HERO} zoom={zoom} focus={focus} />
          </AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: `${sweep}%`,
              top: 0,
              bottom: 0,
              width: 3,
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 0 18px rgba(0,0,0,0.45)",
            }}
          />
        </>,
      )}
      {band(1, <Face name={p.under ?? HERO} zoom={zoom} focus={focus} />)}
      </Pic>
      {bands[0] ? <Band text={bands[0]} y={TOPS[0] + H - 78} from={14} /> : null}
      {bands[1] ? <Band text={bands[1]} y={TOPS[1] + H - 78} from={22} /> : null}
    </AbsoluteFill>
  );
};

/**
 * proof — the difference map builds down over her face, then the figures land.
 *
 * The map keeps the face faintly visible underneath (`gen/asym.py`, same
 * construction as `gen/diffmap.py`) because otherwise it is an abstract blob
 * and the beat proves nothing.
 */
const DifferenceMap: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const focus = parseFocus(p.focus);
  // The map builds over half the beat rather than in 38 frames, then the read
  // head sweeps back across it. Both are the evidence being shown, not a
  // transition: the wipe is literally "lay the photograph over its own mirror".
  const build = interpolate(frame, [8, p.len * 0.5], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const reread = useSweep(Math.round(p.len * 0.5), 84);
  const wipe = frame < p.len * 0.5 ? build : Math.max(reread, 34);
  return (
    <AbsoluteFill style={{ background: SAGE }}>
      <Pic fit={p.fit}>
        <Reveal
          under={p.under ?? HERO}
          over={p.over ?? HERO}
          progress={wipe}
          dir="y"
          zoom={p.zoom ?? 1}
          focus={focus}
        />
      </Pic>
      <MeasureChips subject={subjectOf(p.measure ?? p.under ?? HERO)} from={50} />
      {p.compliance ? <AiChip /> : null}
    </AbsoluteFill>
  );
};

/**
 * halves — each half doubled onto its own mirror, built on screen.
 *
 * The seam sits on the SOLVED midline, mapped through `faceCol`. The overlay is
 * clipped against a frame-sized box rather than the image, because `Face` sizes
 * itself to the zoomed picture and an `inset()` on it would be a percentage of
 * wherever the image happens to be (invariant S, second consequence).
 */
const ChimeraSweep: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const focus = parseFocus(p.focus);
  const zoom = p.zoom ?? 1;
  const under = p.under ?? HERO;
  const x = seamX(asId(under), subjectOf(under), zoom, focus);
  const L = p.len;

  /* THE DOUBLING SWEEPS, CONTINUOUSLY, AND THE SEAM TRAVELS WITH IT.
     The first cut built each half once and measured 98.9% STILL -- the most
     frozen beat in the reel. Two reasons, and both are worth keeping in mind
     for any beat built on a near-symmetric pair: the build was quick and then
     sat, and the change itself is small, because a chimera differs from its
     own source only by the asymmetry (p90 32). So the operation now runs the
     length of the beat and repeats, and the edge doing the work is drawn as a
     travelling seam -- that edge is the only part of the picture guaranteed to
     have real contrast, whoever the subject is.
     This is content, not a creep: the viewer sees the half being doubled,
     repeatedly, which is exactly what the line describes. */
  const half1 = L * 0.46;
  const inFirst = frame < half1;
  const t = inFirst ? frame / half1 : (frame - half1) / (L - half1);
  const side: "left" | "right" = inFirst ? "left" : "right";
  const name = (inFirst ? p.left : p.right) ?? under;
  // out and back, twice, never resting at either end
  const tri = 0.06 + 0.94 * Math.abs(Math.sin(t * Math.PI * 2));

  const w = side === "left" ? (1080 - x) * tri : x * tri;
  const clipPath =
    side === "left"
      ? `inset(0 ${Math.max(0, 1080 - x - w)}px 0 ${x}px)`
      : `inset(0 ${1080 - x}px 0 ${Math.max(0, x - w)}px)`;
  const edge = side === "left" ? x + w : x - w;

  return (
    <AbsoluteFill style={{ background: SAGE }}>
      <Pic fit={p.fit}>
        <Face name={under} zoom={zoom} focus={focus} />
        <AbsoluteFill style={{ clipPath }}>
          <Face name={name} zoom={zoom} focus={focus} />
        </AbsoluteFill>
      {/* The travelling edge. Bounded to the face rows rather than the full
          frame height -- running it over hair and turtleneck made the beat
          read as cluttered at 390px and marked nothing. */}
      <div
        style={{
          position: "absolute",
          left: edge - 1.5,
          top: 250,
          height: 1180,
          width: 3,
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      />
      {/* the solved axis, quieter than the edge that is doing the work */}
      <div
        style={{
          position: "absolute",
          left: x - 0.5,
          top: 250,
          height: 1180,
          width: 1,
          background: "rgba(255,255,255,0.34)",
        }}
      />
      </Pic>
      <Band text={labelOf(asId(name))} y={1430} from={0} />
    </AbsoluteFill>
  );
};

/**
 * everyone — the same operation on the announced second subject.
 *
 * Three panels so the two chimeras can be read against the true face at once;
 * this is the beat that turns one woman's asymmetry into a general claim, and
 * it cannot do that with a single picture.
 */
const TriptychSlide: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const focus = parseFocus(p.focus);
  const zoom = p.zoom ?? 1;
  const panels = [
    { name: p.left ?? HERO, label: labelOf(asId(p.left)) },
    { name: p.under ?? HERO, label: "HER PHOTOGRAPH" },
    { name: p.right ?? HERO, label: labelOf(asId(p.right)) },
  ];
  // Wide enough for the record's own label at the 26px type floor:
  // "LEFT HALF, DOUBLED" in letterspaced mono is ~306px, and the first
  // cut shrank the type to 22px to make it fit. The label says what the
  // panel IS, so it is load-bearing and the panel gives way, not the type.
  const W = 346;
  const H = 780;
  const gap = 10;
  const total = W * 3 + gap * 2;
  const x0 = (1080 - total) / 2;

  return (
    <AbsoluteFill style={{ background: SAGE }}>
      {panels.map((pan, i) => {
        // Spread across the beat. All three used to land inside the first
        // second and then hold for six -- 14% moving, and the two chimeras had
        // nothing to be read against because they arrived together.
        const s = spring({
          frame: frame - 6 - i * Math.round(p.len * 0.26),
          fps,
          config: { damping: 200 },
          durationInFrames: 46,
        });
        return (
          <div
            key={pan.name + i}
            style={{
              position: "absolute",
              left: x0 + i * (W + gap),
              top: 520,
              width: W,
              height: H,
              overflow: "hidden",
              borderRadius: 8,
              transform: `translateX(${(1 - s) * 520}px)`,
              opacity: s,
              boxShadow: "0 18px 44px rgba(12,18,22,0.28)",
            }}
          >
            {/* Plain `cover` is correct HERE and only here: these panels carry
                no anchored mark, so the invariant-S requirement that the layout
                match `anchor()`'s maths does not apply, and the explicit
                layout would need a second set of numbers per panel. All three
                use one objectPosition, so the three faces land at one size —
                a triptych is only a comparison if the framing is shared. */}
            <Img
              src={portrait(pan.name)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`,
                transform: `scale(${zoom})`,
              }}
            />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 92,
              background: "linear-gradient(rgba(14,20,24,0), rgba(14,20,24,0.86))" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center" }}>
              <Mono size={26} o={0.94}>{pan.label}</Mono>
            </div>
          </div>
        );
      })}
      {p.tag ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 372, display: "flex", justifyContent: "center" }}>
          <Tag>{p.tag}</Tag>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * rehearse — the two versions alternate, continuously, under their names.
 *
 * The only beat that never resolves. That is the point: the viewer cannot hold
 * both faces at once, which is the experience the line is describing.
 */
const MirrorToggle: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const focus = parseFocus(p.focus);
  const zoom = p.zoom ?? 1;
  const period = p.period ?? 74;
  const phase = frame % period;
  const showMirror = phase < period / 2;
  /* Same finding as `claim`: the dissolve measured 4% moving because the two
     pictures barely differ. The reversal now sweeps across the face and back,
     never resting, which is both measurable and the honest picture of the line
     -- you cannot hold both versions at once. */
  const sweep = useSweep(0, period);
  /* A CONTINUOUS DISSOLVE, NEVER A HOLD. The first cut cross-faded in seven
     frames and then rested on one face for thirty -- 78.6% still, with 99% of
     its frames showing no local change at all. Resting is also the wrong
     reading: the line is that you cannot hold both versions at once, so the
     picture never settles into either. */
  const bands = p.bands ?? ["MIRROR", "PHOTOGRAPH"];

  return (
    <AbsoluteFill style={{ background: SAGE }}>
      <Pic fit={p.fit}>
        <Face name={p.under ?? HERO} zoom={zoom} focus={focus} />
        <AbsoluteFill style={{ clipPath: `inset(0 ${100 - sweep}% 0 0)` }}>
          <Face name={p.over ?? HERO} zoom={zoom} focus={focus} />
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: `${sweep}%`,
            top: 250,
            height: 1180,
            width: 3,
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 0 18px rgba(0,0,0,0.45)",
          }}
        />
      </Pic>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center" }}>
        <Tag>{showMirror ? bands[0] : bands[1]}</Tag>
      </div>
    </AbsoluteFill>
  );
};

/**
 * nuance — the two chimeras fold away and her own face comes back.
 *
 * The reel has spent forty seconds taking her apart; this is the beat that puts
 * her back together, and the motion has to be the reassembly rather than a
 * fade. Nothing is labelled a flaw anywhere in it.
 */
const ChimeraRecede: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const focus = parseFocus(p.focus);
  const zoom = p.zoom ?? 1;
  const under = p.under ?? HERO;
  const L = p.len;
  const x = seamX(asId(under), subjectOf(under), zoom, focus);

  /* HER OWN FACE, REVEALED FROM THE MIDLINE OUTWARD.
     Two earlier attempts failed for opposite reasons. Half-clipped chimeras
     fading over her face read at 390px as a hard translucent rectangle -- a
     rendering fault, not a design. Whole cards sliding out then measured 7-15%
     "moving": a full-frame picture in motion changes more than 35% of the
     frame's tiles, which the detector classes as a CUT rather than as motion,
     so the largest gesture in the beat scored near zero. Both notes are in
     invariant Z/AA's neighbourhood and worth knowing before animating a
     full-bleed layer again.
     What works is the reel's own recurring device: a travelling seam. Each
     doubled face is clipped to the side where it actually DIFFERS from her --
     the left-doubled face is built from her left, so it is her right side that
     is a lie, and it sits on the right -- and both are pushed outward off the
     midline until only her own photograph is left. Small moving regions, real
     motion, and the picture says the line. */
  const r = interpolate(frame, [L * 0.08, L * 0.52], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const rightEdge = x + (1080 - x) * r;   // left-doubled retreats to the right
  const leftEdge = x * (1 - r);           // right-doubled retreats to the left

  const seam = (left: number) => (
    <div
      style={{
        position: "absolute",
        left: left - 1.5,
        top: 250,
        height: 1180,
        width: 3,
        background: "rgba(255,255,255,0.88)",
        boxShadow: "0 0 18px rgba(0,0,0,0.45)",
        opacity: r < 0.98 ? 1 : 0,
      }}
    />
  );

  return (
    <AbsoluteFill style={{ background: SAGE }}>
      <Pic fit={p.fit}>
        <Face name={under} zoom={zoom} focus={focus} />
        <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${rightEdge}px)` }}>
          <Face name={p.left ?? under} zoom={zoom} focus={focus} />
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: `inset(0 ${1080 - leftEdge}px 0 0)` }}>
          <Face name={p.right ?? under} zoom={zoom} focus={focus} />
        </AbsoluteFill>
        {seam(rightEdge)}
        {seam(leftEdge)}
      </Pic>
      <Bottom y={1470}>
        <Tag dim>{`HER OWN FACE - ${labelOf(asId(p.under)) || "UNRETOUCHED"}`}</Tag>
      </Bottom>
    </AbsoluteFill>
  );
};

/**
 * test — the self-test, inside a phone.
 *
 * Five of the corpus explainers carry something the viewer can do right now,
 * and it is the most saveable moment in the format. Declared `static`: the
 * cards arrive on top of a still, which the shot plan counts as static however
 * many of them there are.
 */
const PhoneRoll: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const focus = parseFocus(p.focus);
  const steps = p.steps ?? [];
  const flip = interpolate(frame, [p.len * 0.56, p.len * 0.72], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ background: SAGE }}>
      <Face name={p.under ?? HERO} zoom={1.3} focus={focus} />
      <Scrim amount={p.dim ?? 0.5} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <PhoneShell width={392}>
          <AbsoluteFill style={{ background: "#0f1418" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - flip }}>
              <Img src={portrait(p.under ?? HERO)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: flip }}>
              <Img src={portrait(p.over ?? HERO)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </AbsoluteFill>
        </PhoneShell>
      </div>
      <div
        style={{
          position: "absolute",
          left: 78,
          right: 78,
          top: 1300,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {steps.map((s, i) => {
          // Spread across the beat, not bunched into its first second: each
          // step lands on the line that says it, and the beat is not a still
          // photograph for its last seven seconds.
          const a0 = 10 + i * Math.round((p.len * 0.62) / Math.max(1, steps.length));
          const o = interpolate(frame, [a0, a0 + 12], [0, 1], clamp);
          const dy = interpolate(frame, [a0, a0 + 14], [16, 0], {
            ...clamp,
            easing: Easing.out(Easing.quad),
          });
          return (
            <div key={s} style={{ opacity: o, transform: `translateY(${dy}px)` }}>
              <Step n={String(i + 1)} text={s} />
            </div>
          );
        })}
      </div>
      {p.tag ? <Bottom y={1690}><Tag>{p.tag}</Tag></Bottom> : null}
    </AbsoluteFill>
  );
};

/**
 * cta — the house ending: the standard, the disclaimer, then a typed search.
 *
 * "The ending is a typing search bar, not a logo lockup or an app-store badge"
 * is a stated non-negotiable across these reels, and it is the one thing here
 * that is about Refina at all. No fact about the product is asserted.
 */
const DisclaimerSearch: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const locked = p.locked ?? [];
  return (
    <AbsoluteFill style={{ background: SAGE }}>
      {p.fit === 0 ? null : (
        <Pic fit={p.fit}>
          <Face name={p.under ?? HERO} zoom={p.zoom ?? 1} focus={[0.5, 0.28]} />
        </Pic>
      )}
      {p.fit === 0 ? null : <Scrim amount={p.dim ?? 0.56} />}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 620,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {locked.map((t, i) => {
          // Same reason as `test`: three lines arriving in the first half
          // second left twelve seconds of frozen frame behind them.
          const s = spring({
            frame: frame - 8 - i * Math.round((p.len * 0.42) / Math.max(1, locked.length)),
            fps,
            config: { damping: 200 },
            durationInFrames: 22,
          });
          return (
            <div
              key={t}
              style={{
                opacity: s,
                transform: `translateY(${(1 - s) * 18}px)`,
                fontFamily: headlineStack,
                fontSize: 62,
                color: "#fff",
                textShadow: "0 2px 18px rgba(16,24,28,0.6)",
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1190, display: "flex", justifyContent: "center" }}>
        <TypewriterInput
          text={p.type ?? "Refina AI"}
          startFrame={Math.round(p.len * 0.52)}
          width={700}
          fontSize={38}
        />
      </div>
      <AiChip y={1560} />
    </AbsoluteFill>
  );
};

/**
 * The beat library. A `composition` in shots.json is a key here, and one named
 * in the spec with no component is a TypeScript error rather than a blank beat.
 */
const COMPOSITIONS: Record<string, React.FC<BeatArgs>> = {
  "full-bleed-turn": FullBleedTurn,
  "stacked-bands": StackedBands,
  "difference-map": DifferenceMap,
  "chimera-sweep": ChimeraSweep,
  "triptych-slide": TriptychSlide,
  "mirror-toggle": MirrorToggle,
  "chimera-recede": ChimeraRecede,
  "phone-roll": PhoneRoll,
  "disclaimer-search": DisclaimerSearch,
};

/** Headline per beat. Copy, so it stays in the composition, not in the spec. */
const HEADLINES: Record<string, { lines: string[]; italicSecond?: boolean }> = {
  hook: { lines: ["You've never seen", "your own face"], italicSecond: true },
  claim: { lines: ["A mirror reverses you"] },
  proof: { lines: ["Where they disagree"] },
  halves: { lines: ["1. Two different faces"] },
  everyone: { lines: ["2. It's everyone"] },
  rehearse: { lines: ["3. You rehearsed", "the wrong one"], italicSecond: true },
  nuance: { lines: ["The asymmetry is yours"] },
  test: { lines: ["Try it now"] },
  cta: { lines: ["Your face.", "Not a stranger's."], italicSecond: true },
};

/**
 * Sound. Every cue is placed off the beat table, so re-running the voiceover
 * moves the effects with the words — no frame is typed here either.
 */
const SfxTrack: React.FC = () => (
  <>
    <Sfx name="transition/woop.mp3" at={bf("hook", 4)} volume={0.24} dur={22} />
    <Sfx name="transition/woosh-1.wav" at={line("hook", 1)} volume={0.26} dur={26} />
    <Sfx name="transition/woosh-1.wav" at={bf("claim", 2)} volume={0.2} dur={22} />
    <Sfx name="ui-tech/digital-loading.wav" at={bf("proof", 6)} volume={0.26} dur={40} fade={14} />
    <Sfx name="ui-tech/toggle.wav" at={line("proof", 2)} volume={0.26} dur={14} />
    <Sfx name="transition/woosh-1.wav" at={line("halves", 1)} volume={0.24} dur={24} />
    <Sfx name="transition/woosh-1.wav" at={line("halves", 2)} volume={0.24} dur={24} />
    <Sfx name="transition/woop.mp3" at={bf("everyone", 4)} volume={0.22} dur={20} />
    <Sfx name="ui-tech/toggle.wav" at={bf("nuance", 4)} volume={0.22} dur={14} />
    <Sfx name="ui-tech/toggle.wav" at={line("test", 1)} volume={0.26} dur={14} />
    <Sfx name="ui-tech/toggle.wav" at={line("test", 2)} volume={0.26} dur={14} />
    <Sfx name="ui-tech/toggle.wav" at={line("test", 3)} volume={0.26} dur={14} />
    <Sfx name="transition/woop.mp3" at={bf("cta", -2)} volume={0.24} dur={20} />
    <Sfx
      name="ui-tech/keyboard-typing.wav"
      at={bf("cta", Math.round(len("cta") * 0.52))}
      volume={0.3}
      dur={46}
      fade={12}
    />
  </>
);

/* ── the reel ────────────────────────────────────────────────────────── */

const Flip: React.FC = () => (
  <Stage>
    {/* The read. Synthesised from docs/scripts/flip.txt and verified word by
        word against the finished mp3 (max drift 11f). */}
    <Audio src={staticFile("voiceover-flip.mp3")} />
    {/* NO MUSIC BED. The bed that used to sit here was built from
        sfx/cinematic/energyfields.wav, which is a TENSION CUE, not music:
        partials clustered under a semitone apart (605.6/608.3 Hz beating at
        ~2.7 Hz), a tritone at the bottom (40.4 -> 56.5 Hz = 5.83 semitones),
        no fundamental, and sub-bass as its loudest band. It gave an
        educational explainer the emotional register of a thriller, and it sat
        on top of the read as well (invariant LL). The `cinematic/` folder is
        for one beat meant to land badly, never for 60 seconds of bed.
        Nothing goes back here until there is a real light-music library. */}
    <SfxTrack />

    {/* THE REEL IS COMPILED FROM shots.json, NOT WRITTEN OUT BEAT BY BEAT.
        Each entry names a `composition`, looked up in COMPOSITIONS above, and
        carries its assets and labels as `props`. `gen/shots.py` validates the
        plan (no two adjacent beats sharing a composition, enough runtime
        declared moving, every beat declaring a shot size), emits the typed
        table, and verifies the finished render against it. */}
    {SHOTS.map((s) => {
      const Beat = COMPOSITIONS[s.composition];
      const name = s.name as BeatName;
      return (
        <React.Fragment key={s.name}>
          <Sequence {...at(name)}>
            <Plate len={len(name)} mode="cut">
              <Beat {...(s.props as BeatProps)} len={len(name)} />
            </Plate>
          </Sequence>
          <Burst
            from={bf(name, 6)}
            hold={Math.min(len(name) - 12, 84)}
            lines={HEADLINES[s.name].lines}
            italicSecond={HEADLINES[s.name].italicSecond}
          />
        </React.Fragment>
      );
    })}

    <FlipCaptions />
  </Stage>
);

export const RefinaFlip: React.FC = () => (
  <Composition
    id="RefinaFlip"
    component={Flip}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
