import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Stage } from "../protocol/atoms";
import { SectionHeadline } from "../preview/draw";
import { Plate } from "../preview/plate";
import { TypewriterInput } from "../kit";
import { headlineStack } from "../../fonts";
import { anchor, faceRow, labelOf } from "../anchors";
import {
  AiChip,
  Bottom,
  Face,
  Mono,
  Reveal,
  Sfx,
  Span,
  Step,
  Tag,
  clamp,
  useSweep,
} from "../ratio/atoms";
import { LANDMARKS } from "./measured";
import { SizeCaptions } from "./captions";
import { B, TOTAL, bf, len, line } from "./beats";
import { SHOTS } from "./shots";
import type { BeatProps } from "./shots";
import type { BeatName } from "./beats";

/**
 * "It Isn't the Size" — educational explainer, RefinaSize.
 *
 * THE ARGUMENT. The same instrument "Load-Bearing" uses, pointed at VOLUME
 * rather than at localisation. The lip line is what the philtrum above and the
 * chin below are both measured FROM, so moving it alone moves both readings
 * with neither neighbour moving. Where RefinaLips proves the edit is CONFINED
 * to the mouth, this reel shows the RANGE — one face at two lip volumes — and
 * adds the profile, because a frontal photograph is the view that hides
 * projection.
 *
 * THE HERO IS A PHOTOGRAPH, WHICH IS BACKWARDS FOR THIS REPO. `size1-before` is
 * a consented photograph of a real woman, restaged to the house portrait and
 * repainted to stage sage by `gen/sage.py`. Only `size1-lipred` and
 * `size1-profile` are generated, both i2i off that one file. Two consequences
 * are load-bearing:
 *
 *   1. The pair's floor is camera noise plus ONE model pass, not two, so its
 *      drift figure is not comparable to lips1's and this reel must not claim
 *      it is. That is why there is no proof beat and no MeasureChips here —
 *      the script's third beat teaches the mechanism instead of printing a
 *      number, and every figure this reel would have printed belonged to a
 *      pair whose provenance is asymmetric.
 *   2. NO ONE IS NAMED. The draft this was cut from opened on a celebrity's
 *      name over this face. Naming a real private person as someone else is a
 *      false claim about the face in frame — the same class of error rule E
 *      exists for — so the hook opens on a question about the viewer, which is
 *      what 14 of the 21 corpus explainers do anyway.
 *
 * THE SPANS COME FROM MEASURED LANDMARKS, NOT FROM `anchor()`. anchor()'s boxes
 * are fixed anatomical fractions, so they are the SAME BOX on a before and its
 * after: a philtrum span drawn from them would be identical either side of the
 * edit, on the beats whose whole claim is that the gap changes. Invariant HH.
 *
 * EVERY MOVING BEAT USES A TRAVELLING HARD EDGE. Invariant BB: a dissolve
 * between two near-identical pictures crosses no threshold at all, and a
 * whole-frame transform scores as a CUT rather than as motion. The seam recurs
 * across hook, chin, demo and turn — Gemini counted 17 devices with none used
 * twice in `ours-changed-v2` against a corpus median of 11 with at least one
 * repeated.
 *
 * NOTHING CREEPS TO MOVE A METRIC. Rule P.
 */

const FPS = 30;

const at = (k: BeatName) => ({
  from: B[k][0],
  durationInFrames: B[k][1] - B[k][0],
});

/* ── assets ──────────────────────────────────────────────────────────
   ONE subject, unlike lips and ratio. This script has no "another face" line,
   so there is no second subject to announce — and an unannounced one is the
   worst defect RefinaChanged shipped. */
const HERO = "size1-before";

type Id = Parameters<typeof faceRow>[0];
const asId = (n?: string) => (n ?? HERO) as Id;

/** Props a beat gets: the spec's, plus its own measured length. */
type BeatArgs = BeatProps & { len: number };

const parseFocus = (f?: string): [number, number] => {
  if (!f) return [0.5, 0.32];
  const [x, y] = f.split(" ").map((v) => parseFloat(v) / 100);
  return [x, y];
};

/**
 * `fit` sizes the PICTURE, never the type.
 *
 * A portrait cannot go below cover scale without its backdrop showing, so it is
 * composited as a sized element on the stage instead. Type stays OUTSIDE this
 * wrapper: scaling whole beats would take 26px captions under the legibility
 * floor in order to fix framing.
 */
const Pic: React.FC<{ fit?: number; children: React.ReactNode }> = ({
  fit = 1,
  children,
}) =>
  fit >= 1 ? (
    <>{children}</>
  ) : (
    <AbsoluteFill style={{ transform: `scale(${fit})` }}>{children}</AbsoluteFill>
  );

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
    <SectionHeadline
      lines={lines}
      len={hold}
      from={2}
      out={14}
      italicSecond={italicSecond}
    />
  </Sequence>
);

/**
 * A row of the picture, in frame space, after `fit`.
 *
 * `faceRow` maps a fraction of face height through the identical cover maths
 * that lays the picture out (invariant S). `Pic` then scales that picture about
 * the frame centre, so a mark has to take the same scaling or it lands where
 * the picture WOULD have been at cover scale — up to 240px out.
 */
const fitRow = (
  id: Id,
  frac: number,
  fit: number,
  zoom: number,
  focus: [number, number],
) => 960 + (faceRow(id, frac, undefined, zoom, focus) - 960) * fit;

/** The label a beat prints over an asset always comes FROM THE RECORD. */
const AssetTag: React.FC<{ id: string; from: number; y: number }> = ({
  id,
  from,
  y,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 8], [0, 1], clamp);
  const label = labelOf(asId(id));
  if (!label || o <= 0) return null;
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
      }}
    >
      <Tag size={26}>{label}</Tag>
    </div>
  );
};

/**
 * A REGION of the picture, in frame space, after `fit` — the rectangle sibling
 * of `fitRow`.
 *
 * `anchor()` maps a region through the cover maths that lays the picture out,
 * which is correct at cover scale and wrong the moment `Pic` scales the picture
 * about frame centre. The alternative — drawing the ring INSIDE `Pic` so it
 * inherits the transform — also scales its LABEL, and a 26px tag at fit 0.72 is
 * 18.7px, under the legibility floor. So the geometry takes the scaling and the
 * type does not. Invariant S.
 */
const fitRect = (
  id: Id,
  region: Parameters<typeof anchor>[1],
  fit: number,
  zoom: number,
  focus: [number, number],
) => {
  const r = anchor(id, region, undefined, zoom, focus);
  return {
    x: 540 + (r.x - 540) * fit,
    y: 960 + (r.y - 960) * fit,
    width: r.width * fit,
    height: r.height * fit,
  };
};

/** The two gaps this reel is about, in face-height fractions, per asset. */
const gapRows = (
  id: string,
  band: string | undefined,
  fit: number,
  zoom: number,
  focus: [number, number],
): [number, number] | null => {
  const g = LANDMARKS[id];
  if (!g) return null;
  return band === "chin"
    ? [
        fitRow(asId(id), g.mouthLine, fit, zoom, focus),
        fitRow(asId(id), 1.0, fit, zoom, focus),
      ]
    : [
        fitRow(asId(id), g.noseBase, fit, zoom, focus),
        fitRow(asId(id), g.lipTop, fit, zoom, focus),
      ];
};

/* ── the beat library ─────────────────────────────────────────────────
   Every component here is driven ENTIRELY by props from shots.json plus its
   own length. A beat that reads a module constant is a beat the spec cannot
   reconfigure, which defeats the point of having a spec. */

/**
 * hook — a hard edge sweeps across the face and the mouth changes under it.
 *
 * The sweep IS the comparison: the same pixels, one region redrawn. A
 * cross-fade between two pictures this similar crosses no motion threshold at
 * all and reads as a smudge (invariant BB), which is why the edge is hard.
 *
 * It crosses the mouth REPEATEDLY and then settles on `over` — the full mouth
 * the hook calls "the mouth you're picturing". The payoff of a hook has to be
 * what is on screen when the beat ends.
 */
const PairSweep: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const settle = Math.round(p.len * 0.7);
  const period = Math.max(26, Math.round(settle / 2));
  const osc = useSweep(Math.round(p.len * 0.14), period);
  const progress =
    frame < settle
      ? osc
      : interpolate(frame, [settle, settle + 22], [osc, 100], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
  return (
    <AbsoluteFill>
      <Pic fit={p.fit}>
        <Reveal
          under={p.under ?? HERO}
          over={p.over ?? HERO}
          progress={progress}
          zoom={p.zoom}
          focus={parseFocus(p.focus)}
        />
      </Pic>
      {/* The record's label describes `over`. Showing it while the seam is
          still left of centre would caption the other volume, which is rule E
          with the asset record doing the lying for us. */}
      {progress >= 55 ? <AssetTag id={p.over ?? HERO} from={0} y={486} /> : null}
      {/* size 26, never the default 12: that is 4.3px on a 390px phone and was
          an unreadable smudge across an entire contact sheet. An unreadable
          disclaimer is not a disclaimer, which is why check-legibility.py
          FAILS rather than warns on it. */}
      {p.compliance ? <AiChip size={26} /> : null}
    </AbsoluteFill>
  );
};

/**
 * claim — the three landmarks the lower third is actually read between.
 *
 * The rules draw outward from the centre and land on MEASURED rows, so they sit
 * on this subject's anatomy rather than on an assumed proportion.
 */
const LowerThirdRules: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const id = asId(p.under);
  const zoom = p.zoom ?? 1;
  const focus = parseFocus(p.focus);
  const fit = p.fit ?? 1;
  const g = LANDMARKS[p.subject ?? p.under ?? HERO];
  const keys = (p.rules ?? []) as string[];
  const NAMES: Record<string, string> = {
    noseBase: "NOSE BASE",
    lipTop: "LIP EDGE",
    mouthLine: "MOUTH LINE",
    chin: "CHIN",
  };
  if (!g) return null;
  // `chin` is the bottom of the measured face box rather than a landmark of its
  // own. lipTop and mouthLine are ~0.02 of face height apart — about 13px on
  // screen — so they cannot both carry a label.
  const frac = (k: string) =>
    k === "chin" ? 1.0 : (g[k as keyof typeof g] as number);
  return (
    <AbsoluteFill>
      <Pic fit={fit}>
        <Face name={p.under ?? HERO} zoom={zoom} focus={focus} />
      </Pic>
      <Scrim amount={0.16} />
      {/* NO SWEEPING BAND. `lips` runs a 30%-white gradient down the lower
          third here, and on the phone sheet it read as a HAZE across her mouth
          — a bad exposure rather than a device, because a soft white wash over
          skin is exactly what a blown highlight looks like at 390px. It was
          there to earn the beat its `moving` declaration, and the render scored
          it at 10% against a 30% floor anyway (invariant L). The beat is
          declared static and the band is gone: what is left is a clean portrait
          with three MEASURED rules drawing onto it, which is what the line
          actually says. Removing it is not rule P in reverse — the band was not
          motion the viewer could see, so nothing was lost but the smear. */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {keys.map((k, i) => {
          const t0 = 8 + i * 12;
          const w = interpolate(frame - t0, [0, 16], [0, 424], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          if (w <= 0) return null;
          const y = fitRow(id, frac(k), fit, zoom, focus);
          return (
            <line
              key={k}
              x1={540 - w}
              y1={y}
              x2={540 + w}
              y2={y}
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={3}
            />
          );
        })}
      </svg>
      {keys.map((k, i) => {
        const t0 = 8 + i * 12;
        const o = interpolate(frame - t0, [10, 20], [0, 1], clamp);
        if (o <= 0) return null;
        const y = fitRow(id, frac(k), fit, zoom, focus);
        return (
          <div
            key={k}
            style={{ position: "absolute", top: y - 36, left: 92, opacity: o }}
          >
            <Tag size={26}>{NAMES[k] ?? k}</Tag>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * mechanism — "your eye never measures a feature alone; it measures the gaps".
 *
 * A solid highlight SHUTTLES between the two gaps the rest of the reel is about
 * — nose base to lip edge, then mouth line to chin — with a bracket riding it.
 * The beat draws the sentence rather than illustrating it: the thing moving is
 * the unit of measurement, not the face.
 *
 * IT IS A HARD-EDGED, FILLED BAND, NOT A GRADIENT. RefinaNose's equivalent beat
 * used a 26%-opacity gradient and `--verify` scored it at 1% — it moved, three
 * stills 26 frames apart proved it, but a soft band does not clear the tile
 * threshold at 270x480 (invariant L). If this one still scores under band the
 * DECLARATION changes to static; it does not acquire a creep (rule P).
 */
const GapShuttle: React.FC<BeatArgs> = (p) => {
  const zoom = p.zoom ?? 1;
  const focus = parseFocus(p.focus);
  const fit = p.fit ?? 1;
  const subj = p.subject ?? p.under ?? HERO;
  // Two full shuttles across the beat, held briefly at each end so each gap is
  // legible when the band arrives rather than only swept through.
  //
  // ABOVE THE EARLY RETURN, DELIBERATELY. A hook after `if (!top) return null`
  // runs on some renders and not others, which is the one thing React forbids.
  //
  // IT DWELLS AT BOTH ENDS. A plain oscillation spends most of its frames in
  // TRANSIT, and the still at the midpoint showed the band lying across the
  // mouth — on a beat whose caption is THE GAP, NOT THE PART. Remapping the
  // sweep so the outer 22% of each half-cycle is clamped parks the band on a
  // real gap for most of the beat and keeps the travel between them.
  const raw = useSweep(6, Math.max(30, Math.round((p.len - 12) / 2))) / 100;
  const ramp = Math.min(1, Math.max(0, (raw - 0.22) / 0.56));
  const t = ramp * ramp * (3 - 2 * ramp);

  const top = gapRows(subj, "philtrum", fit, zoom, focus);
  const low = gapRows(subj, "chin", fit, zoom, focus);
  if (!top || !low) return null;
  const y0 = top[0] + (low[0] - top[0]) * t;
  const y1 = top[1] + (low[1] - top[1]) * t;

  return (
    <AbsoluteFill>
      <Pic fit={fit}>
        <Face name={p.under ?? HERO} zoom={zoom} focus={focus} />
      </Pic>
      <Scrim amount={0.2} />
      {/* TWO RULES AND FOUR TICKS — AN OUTLINE, NOT A FILL. The filled version
          of this band covered the mouth and chin with a 34%-white slab and read
          on the phone sheet as a CENSOR BAR over her face. A measurement marks
          its two ends; it does not paint over what lies between them, and the
          thing being measured here is precisely the skin the fill was hiding. */}
      {(() => {
        const L = 250;
        const R = 830;
        const rule = (y: number) => (
          <div
            key={y}
            style={{
              position: "absolute",
              left: L,
              width: R - L,
              top: y - 2,
              height: 4,
              background: "rgba(255,255,255,0.98)",
            }}
          />
        );
        const tick = (x: number) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: x - 2,
              top: y0,
              height: Math.max(6, y1 - y0),
              width: 4,
              background: "rgba(255,255,255,0.98)",
            }}
          />
        );
        return (
          <>
            {rule(y0)}
            {rule(y1)}
            {tick(L)}
            {tick(R)}
          </>
        );
      })()}
      {/* No `Span` here. It sat at x=686, INSIDE the outline, and read as a
          line dividing the box rather than as a bracket measuring it — two
          notations for one quantity, competing. The outline is the
          measurement. */}
      {p.caption ? (
        <Bottom y={356}>
          <Tag size={26}>{p.caption}</Tag>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * philtrum — one face, split at a travelling seam, with a bracket either side.
 *
 * The two halves are the same subject's two volumes on the identical registered
 * frame, so this is ONE continuous face whose left mouth is thin and whose
 * right mouth is full. That matters for invariant AA: two separately cropped
 * panels would not be a comparison at all, because the viewer could not tell a
 * difference in anatomy from a difference in framing.
 *
 * A Span never carries a figure. Two brackets of visibly different length say
 * the whole thing, and a number printed against a face is a facial statistic.
 */
const SpanCompare: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const L = p.left ?? HERO;
  const R = p.right ?? HERO;
  const zoom = p.zoom ?? 1;
  const focus = parseFocus(p.focus);
  const fit = p.fit ?? 1;

  // The seam travels in from the right and settles at centre. Its ARRIVAL is
  // the comparison, so it is a real traverse rather than a cut.
  const seam = interpolate(frame, [4, 32], [100, 50], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const l = gapRows(L, p.band, fit, zoom, focus);
  const r = gapRows(R, p.band, fit, zoom, focus);
  if (!l || !r) return null;
  const labels = p.labels ?? [];

  return (
    <AbsoluteFill>
      <Pic fit={fit}>
        <Reveal under={L} over={R} progress={seam} zoom={zoom} focus={focus} />
      </Pic>
      <Span x={430} y0={l[0]} y1={l[1]} from={32} label={labels[0]} side="left" dim={false} />
      <Span x={650} y0={r[0]} y1={r[1]} from={40} label={labels[1]} side="right" dim={false} />
      {p.caption ? (
        <Bottom y={356}>
          <Tag size={26}>{p.caption}</Tag>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * chin — the two volumes toggle under a VERTICAL seam, with the jaw ringed.
 *
 * The device recurs but the beat is not mistakable for the hook: the seam runs
 * the other way. It oscillates rather than cutting, because a hard cut between
 * two full-frame pictures scores as a CUT and not as motion (invariant BB).
 * The ring says WHERE and never HOW MUCH — the chin is the region that did not
 * change, and the line over it is "same chin, both photographs".
 */
const PairToggle: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const progress = useSweep(0, p.period ?? 34);
  const zoom = p.zoom ?? 1;
  const focus = parseFocus(p.focus);
  const fit = p.fit ?? 1;

  // THE RING IS DRAWN, NOT JUST DECLARED. `reticle: "jaw"` sat in the spec as a
  // dead prop for a whole render: the component never read it, so the beat put
  // the words THE CHIN at the top of the frame with nothing underneath them
  // pointing at a chin. Every check passed — a label is legible whether or not
  // it is attached to anything, and the spec named a region the composition was
  // free to ignore. The phone sheet is what caught it.
  const ring = p.reticle
    ? fitRect(asId(p.over), p.reticle as Parameters<typeof anchor>[1], fit, zoom, focus)
    : null;
  const draw = interpolate(frame, [10, 28], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <Pic fit={fit}>
        <Reveal
          under={p.under ?? HERO}
          over={p.over ?? HERO}
          progress={progress}
          dir="y"
          zoom={zoom}
          focus={focus}
        />
      </Pic>
      {ring ? (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <ellipse
            cx={ring.x + ring.width / 2}
            cy={ring.y + ring.height / 2}
            rx={(ring.width / 2 + 26) * draw}
            ry={(ring.height / 2 + 18) * draw}
            fill="none"
            stroke="rgba(255,255,255,0.94)"
            strokeWidth={3}
            strokeDasharray="12 9"
          />
        </svg>
      ) : null}
      {/* The label sits UNDER its own ring rather than at a typed y, so it
          moves with the region it names. A ring says WHERE and never HOW MUCH,
          which is why it reads THE CHIN and not SAME CHIN: measured, the jaw
          moved 11.3 against a 5.3 floor, so "same" is a quantity this pair
          cannot keep. */}
      {p.reticleLabel && ring ? (
        <div
          style={{
            position: "absolute",
            top: ring.y + ring.height + 34,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: draw,
          }}
        >
          <Tag size={26}>{p.reticleLabel}</Tag>
        </div>
      ) : null}
      <AssetTag id={p.over ?? HERO} from={14} y={486} />
    </AbsoluteFill>
  );
};

/**
 * demo — the range, as a slider the viewer can read.
 *
 * The seam sweeps the whole width continuously, so the mouth is crossed over
 * and over: this pair is identical everywhere except the mouth, and a seam out
 * on the cheek changes no pixels at all, so only the crossings score.
 *
 * THE BRACKET REPORTS WHAT IS ACTUALLY UNDER IT. `Reveal` shows `over` to the
 * left of the seam, so the bracket at x=430 is sitting on `over` once the seam
 * passes 430/1080 of the width. Its rows cross over that boundary rather than
 * jumping, which is what makes the line "watch the gap, not the lips" literal —
 * the gap on screen is the gap of the picture the viewer is looking at.
 */
const RangeSlider: React.FC<BeatArgs> = (p) => {
  const zoom = p.zoom ?? 1;
  const focus = parseFocus(p.focus);
  const fit = p.fit ?? 1;
  const U = p.under ?? HERO;
  const O = p.over ?? HERO;
  // SWEEPS 8..92, NOT 0..100. `Reveal` draws its seam whenever progress is
  // between 0.5 and 99.5, so at the extremes the line lands on the very edge of
  // the picture and reads as a stray full-height rule down the side of the
  // frame rather than as an edge between two pictures. Holding it inside the
  // picture also stops the slider thumb pinning to the ends of its own track.
  const progress = 8 + useSweep(4, Math.max(28, Math.round((p.len - 8) / 2))) * 0.84;

  const u = gapRows(U, p.band, fit, zoom, focus);
  const o = gapRows(O, p.band, fit, zoom, focus);
  if (!u || !o) return null;

  // WHERE THE SEAM CROSSES THE BRACKET, IN THE SEAM'S OWN UNITS.
  //
  // `Reveal` clips a FRAME-SIZED box, so `progress` is a percentage of the
  // unscaled frame — but `Pic` then scales that whole box about frame centre,
  // while the bracket is drawn OUTSIDE it in frame coordinates. Taking
  // BRACKET_X/1080 as the crossing point ignores the scale and puts the
  // hand-off in the wrong place: at fit 0.72 the seam reaches x=430 at 35.9%,
  // not 39.8%, so the bracket would report the wrong picture for 4% of every
  // traverse. Invariant S, in miniature — a mark and a picture have to go
  // through the identical transform.
  const BRACKET_X = 430;
  const edge = (((BRACKET_X - 540) / fit + 540) / 1080) * 100;
  // 0 -> the bracket sits on `under`, 1 -> on `over`. Crossfaded over 7% of the
  // width so the rows travel rather than snap.
  const k = interpolate(progress, [edge - 3.5, edge + 3.5], [0, 1], clamp);
  const y0 = u[0] + (o[0] - u[0]) * k;
  const y1 = u[1] + (o[1] - u[1]) * k;
  const labels = p.labels ?? [];

  return (
    <AbsoluteFill>
      <Pic fit={fit}>
        <Reveal under={U} over={O} progress={progress} zoom={zoom} focus={focus} />
      </Pic>
      {/* LABELLED, because an unlabelled bracket this short reads as a stray
          mark. The philtrum is 0.045-0.061 of face height on this subject, so
          the span is ~36px at the picture's scale however it is drawn — the
          label is what tells the viewer it is a measurement and not an
          artefact. It never carries a FIGURE: a number printed against a face
          is a facial statistic, and two lengths say the whole thing. */}
      <Span
        x={BRACKET_X}
        y0={y0}
        y1={y1}
        from={6}
        label="THE GAP"
        side="left"
        dim={false}
      />
      {/* the control, so the beat reads as a RANGE rather than as a flicker */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 1452 }}>
        <div
          style={{
            position: "relative",
            height: 8,
            background: "rgba(255,255,255,0.3)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `calc(${progress}% - 15px)`,
              top: -11,
              width: 30,
              height: 30,
              borderRadius: 15,
              background: "#fff",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 22,
          }}
        >
          <Mono size={26} o={0.82}>
            {labels[0] ?? ""}
          </Mono>
          <Mono size={26} o={0.82}>
            {labels[1] ?? ""}
          </Mono>
        </div>
      </div>
      {p.caption ? (
        <Bottom y={356}>
          <Tag size={26}>{p.caption}</Tag>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * turn — the front photograph is replaced by the profile, under a hard edge.
 *
 * "A front photograph hides it" is a claim about a VIEW, so the beat has to
 * actually change the view. The seam here travels between two pictures that
 * differ everywhere rather than in one region, which is why this beat needs no
 * repeated crossings to register motion — unlike the hook, where the two
 * pictures are identical outside the mouth.
 */
const ProfileTurn: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [Math.round(p.len * 0.16), Math.round(p.len * 0.78)],
    [0, 100],
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );
  return (
    <AbsoluteFill>
      <Pic fit={p.fit}>
        <Reveal
          under={p.under ?? HERO}
          over={p.over ?? HERO}
          progress={progress}
          zoom={p.zoom}
          focus={parseFocus(p.focus)}
        />
      </Pic>
      {/* THE RECORD'S LABEL IS NOT OPTIONAL ON THIS BEAT. The side view is a
          RENDER — generated i2i off the frontal photograph — so it is a
          model's account of a face it has only seen from the front, never
          evidence of what this person's profile is. `view:profile-generated`
          prints SIDE VIEW, GENERATED, and the compliance chip rides with it.
          Every other picture in this reel is either the photograph itself or
          one region of it edited; this is the only beat where the whole head
          is invented, and the viewer is told so. */}
      {/* LOW, over the turtleneck. y486 put it across her forehead and y300
          collided with the headline burst, which on this beat runs two lines
          deep. The dark knit is the one large quiet area in the frame. */}
      <AssetTag id={p.over ?? HERO} from={20} y={1380} />
      {p.caption ? (
        <Bottom y={356}>
          <Tag size={26}>{p.caption}</Tag>
        </Bottom>
      ) : null}
      {p.compliance ? <AiChip size={26} /> : null}
    </AbsoluteFill>
  );
};

/**
 * nuance — the two pictures separate, and the note lands between them.
 *
 * The format's nuance beat is what makes an explainer read as teaching rather
 * than selling, and every corpus explainer has one. flip-v6's regressed to 19%
 * moving because its gesture was made FASTER rather than longer (rule FF:
 * motion share counts frames, so accelerating a gesture always trades window
 * for speed and loses). This one travels for the whole beat.
 */
const PairSplit: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  // THE PART COMPLETES AT 60% OF THE BEAT, NOT AT ITS END.
  //
  // Each card is 1080*fit wide — 410px here — so the two are still overlapping
  // until travel passes ~205, and `lips` spreads that travel across the whole
  // beat. On the phone sheet the midpoint of this beat was therefore ONE small
  // face in a large empty sage field, which is the thing spec rule 5 forbids,
  // with the second card showing as a sliver of hair at the edge. Finishing the
  // move earlier and holding the pair apart means the beat READS as two
  // pictures for most of its length, which is what the nuance line needs.
  const d = interpolate(frame, [0, Math.max(30, Math.round(p.len * 0.6))], [0, 262], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const fit = p.fit ?? 0.46;
  const card = (name: string, dx: number) => (
    <AbsoluteFill style={{ transform: `translateX(${dx}px) scale(${fit})` }}>
      <Face name={name} zoom={1} focus={[0.5, 0.36]} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      {/* They start exactly stacked, so the beat opens on ONE picture and
          becomes two. */}
      {card(p.under ?? HERO, -d)}
      {card(p.over ?? HERO, d)}
      {p.note ? (
        <Bottom y={356}>
          <Tag size={26}>{p.note}</Tag>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/** test — the self-test, as cards that land. The most saveable moment. */
const InstructionCards: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const steps = p.steps ?? [];
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 96px" }}>
      {p.tag ? (
        <div
          style={{
            position: "absolute",
            top: 486,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Tag size={26}>{p.tag}</Tag>
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 52 }}>
        {steps.map((s, i) => {
          const t0 = 8 + i * 14;
          const o = interpolate(frame - t0, [0, 10], [0, 1], clamp);
          const x = interpolate(frame - t0, [0, 14], [-70, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div key={s} style={{ opacity: o, transform: `translateX(${x}px)` }}>
              <Step n={String(i + 1)} text={s} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * cta — the house ending: type over the stage into a search bar.
 *
 * No portrait. At the sizes this reel's faces need, a headline over a small
 * floating card overran at 390px, and "a small element floating in a large
 * empty field" is the thing spec rule 5 forbids.
 */
const DisclaimerSearch: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const locked = p.locked ?? [];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 660,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {locked.map((t, i) => {
          // Staggered across the beat rather than all in the first half second:
          // lines that arrive at once leave the rest of the beat frozen.
          const t0 =
            8 + i * Math.round((p.len * 0.34) / Math.max(1, locked.length));
          const o = interpolate(frame - t0, [0, 12], [0, 1], clamp);
          const y = interpolate(frame - t0, [0, 16], [18, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div
              key={t}
              style={{
                opacity: o,
                transform: `translateY(${y}px)`,
                fontFamily: headlineStack,
                // The compliance line is load-bearing text and gets headline
                // scale, not a chip. gen/check-legibility.py FAILS (rather than
                // warns) on anything matching PREVIEW below the 26px floor,
                // because an unreadable disclaimer is not a disclaimer.
                fontSize: 62,
                color: "#fff",
                textAlign: "center",
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1180,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TypewriterInput
          text={p.type ?? "Refina AI"}
          startFrame={Math.round(p.len * 0.5)}
          width={700}
          fontSize={38}
        />
      </div>
      <AiChip y={430} size={26} />
    </AbsoluteFill>
  );
};

const COMPOSITIONS: Record<string, React.FC<BeatArgs>> = {
  "pair-sweep": PairSweep,
  "lower-third-rules": LowerThirdRules,
  "gap-shuttle": GapShuttle,
  "span-compare": SpanCompare,
  "pair-toggle": PairToggle,
  "range-slider": RangeSlider,
  "profile-turn": ProfileTurn,
  "pair-split": PairSplit,
  "instruction-cards": InstructionCards,
  "disclaimer-search": DisclaimerSearch,
};

/** Headline per beat. Copy, so it stays in the composition, not in the spec. */
const HEADLINES: Record<string, { lines: string[]; italicSecond?: boolean }> = {
  hook: { lines: ["It was never", "about size"], italicSecond: true },
  claim: { lines: ["The lower third", "is read from here"], italicSecond: true },
  mechanism: { lines: ["Your eye reads gaps"] },
  philtrum: { lines: ["1. The gap above"] },
  chin: { lines: ["2. The chin below"] },
  demo: { lines: ["One face,", "two volumes"], italicSecond: true },
  turn: { lines: ["The view that hides it"] },
  nuance: { lines: ["Not better.", "Load-bearing."], italicSecond: true },
  test: { lines: ["Try it now"] },
  cta: { lines: ["Your face.", "Not that one."], italicSecond: true },
};

/**
 * Sound. Every cue is placed off the beat table, so re-running the voiceover
 * moves the effects with the words — no frame is typed here either.
 */
const SfxTrack: React.FC = () => (
  <>
    {/* hook — the shutter lands on the pair, then the seam travels */}
    <Sfx name="transition/camera-shutter.wav" at={bf("hook")} volume={0.34} dur={26} />
    <Sfx name="transition/woosh-1.wav" at={line("hook", 1)} volume={0.26} dur={26} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("hook", 2)} volume={0.2} dur={20} />

    {/* claim — each measure rule ticks in */}
    <Sfx name="transition/woop.mp3" at={bf("claim", -2)} volume={0.26} dur={20} />
    <Sfx name="ui-tech/toggle.wav" at={line("claim", 1)} volume={0.3} dur={8} />

    {/* mechanism — the band shuttles between the two gaps */}
    <Sfx name="transition/deep-woosh.wav" at={bf("mechanism", -2)} volume={0.26} dur={40} />
    <Sfx name="tick.wav" at={line("mechanism", 1)} volume={0.26} dur={14} />
    <Sfx name="tick.wav" at={line("mechanism", 2)} volume={0.24} dur={14} />

    {/* philtrum — the seam travels in, the brackets snap */}
    <Sfx name="transition/woosh-2.wav" at={bf("philtrum", -2)} volume={0.26} dur={26} />
    <Sfx name="tick.wav" at={line("philtrum", 1)} volume={0.26} dur={14} />
    <Sfx name="tick.wav" at={line("philtrum", 2)} volume={0.24} dur={14} />

    {/* chin — same device, same sound: the recurrence is the point */}
    <Sfx name="transition/woosh-2.wav" at={bf("chin", -2)} volume={0.26} dur={26} />
    <Sfx name="ui-tech/toggle.wav" at={line("chin", 1)} volume={0.28} dur={8} />

    {/* demo — the slider runs the range */}
    <Sfx name="ui-tech/digital-loading.wav" at={bf("demo", -2)} volume={0.22} dur={30} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("demo", 1)} volume={0.2} dur={20} />

    {/* turn — the view changes */}
    <Sfx name="transition/paper-slide.wav" at={bf("turn", -2)} volume={0.28} dur={24} />

    {/* nuance — the two pictures part */}
    <Sfx name="cinematic/remembering-woosh.wav" at={bf("nuance", -2)} volume={0.24} dur={40} />

    {/* test — the instruction cards land */}
    <Sfx name="ui-tech/mouse-click.wav" at={bf("test", 6)} volume={0.26} dur={10} />
    <Sfx name="ui-tech/mouse-click.wav" at={line("test", 1)} volume={0.24} dur={10} />
    <Sfx name="ui-tech/mouse-click.wav" at={line("test", 2)} volume={0.22} dur={10} />

    {/* cta — typing */}
    <Sfx name="ui-tech/keyboard-typing.wav" at={bf("cta", 26)} volume={0.22} dur={40} />
  </>
);

/* ── the reel ────────────────────────────────────────────────────────── */

const Size: React.FC = () => (
  <Stage>
    {/* The read. Synthesised from docs/scripts/size.txt and verified word by
        word against the finished mp3 (max drift 11f, under the 12f gate). */}
    <Audio src={staticFile("voiceover-size.mp3")} />
    {/* NO MUSIC BED. Nothing goes back here until there is a real light-music
        library — see the Sound section of CLAUDE.md and gen/check-audio.py,
        which measures a bed against the READ rather than against silence. */}
    <SfxTrack />

    {/* THE REEL IS COMPILED FROM shots.json, NOT WRITTEN OUT BEAT BY BEAT.
        Each entry names a `composition`, looked up in COMPOSITIONS above, and
        carries its assets and labels as `props`. `gen/shots.py` validates the
        plan, emits the typed table, and verifies the render against it. */}
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

    <SizeCaptions />
  </Stage>
);

export const RefinaSize: React.FC = () => (
  <Composition
    id="RefinaSize"
    component={Size}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
