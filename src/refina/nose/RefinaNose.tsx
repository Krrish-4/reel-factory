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
import { anchor, faceCol, faceRow, labelOf } from "../anchors";
import { ASSETS } from "../assets";
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
import { SCORES } from "./measured";
import { NoseCaptions } from "./captions";
import { B, TOTAL, bf, len, line } from "./beats";
import { SHOTS } from "./shots";
import type { BeatProps } from "./shots";
import type { BeatName } from "./beats";

/**
 * "It Wasn't the Nose" — educational explainer, RefinaNose.
 *
 * THE ARGUMENT. The eye does not size a feature, it compares one to the ones
 * around it. So a nose that reads as too big can be a lower third that reads as
 * too small — and the pair this reel is built on proves it, because the change
 * is measurably nowhere near the nose. Measured on ratio1: nose 9.7, lips 17.3,
 * eyes 18.7, jaw 44.0, concentration 2.36, drift 4.7.
 *
 * HOW THIS DIFFERS FROM "Same Nose", WHICH MAKES THE SAME ARGUMENT. RefinaRatio
 * runs 92.3s because it spends six of its nine beats on three numbered
 * relationships (nose/chin, lid/eye, thirds). flip-v6 was then rejected at 88.1s
 * as "long and thin" against a corpus median of 55.5s. This is the
 * single-argument cut — one relationship, developed — and its read comes back at
 * 52.3s with the tightest VO gate result in the repo (max drift 6f, nothing over
 * tolerance).
 *
 * NO DIGIT ABOUT A FACE IS TYPED HERE. `measured.ts` is written by
 * `gen/emit-nose.py` and the proof beat maps over it — invariant B applied to
 * evidence rather than to timing. Every figure on screen describes two IMAGE
 * FILES, which is the only kind of measurement this repo prints (rule E). That
 * emitter also refuses to write the file at all if the nose stops being the
 * quietest region, because the script says "almost none of it is on her nose"
 * and a printed number that has drifted from its own pair is a false claim.
 *
 * THIS REEL DRAWS NO SPANS, AND THAT IS A MEASUREMENT RATHER THAN A STYLE
 * CHOICE. RefinaLips brackets a philtrum because its claim is that a vertical
 * distance shortens. Measured on this pair the lower third does NOT change
 * height — face height 1070 -> 1059px, nose-base-to-chin 375 -> 375px — while
 * lower-face WIDTH goes 572 -> 628. A bracket across the lower third would have
 * drawn a difference that is not there and passed every check in the repo,
 * which is invariant HH exactly. The width figure is real but its own
 * instrument reports the untouched EYE LINE moving 739 -> 788px, so its edges
 * are contaminated and it cannot carry a printed claim either. The face is
 * annotated with rings only: a ring says WHERE, and never HOW MUCH.
 *
 * EVERY MOVING BEAT IS A TRAVELLING HARD EDGE. Invariant BB: a dissolve between
 * two near-identical pictures crosses no threshold at all, and a whole-frame
 * transform scores as a CUT rather than as motion. The seam RECURS across hook,
 * claim and resolve — Gemini counted 17 devices with none used twice in
 * `ours-changed-v2` against a corpus median of 11 with at least one repeated.
 *
 * NOTHING CREEPS TO MOVE A METRIC. Where the picture moves it moves because the
 * comparison being taught is moving. Rule P.
 */

const FPS = 30;

const at = (k: BeatName) => ({
  from: B[k][0],
  durationInFrames: B[k][1] - B[k][0],
});

/* ── assets ──────────────────────────────────────────────────────────
   ONE subject. The two-subject rule exists because RefinaChanged silently
   changed who its subject was three times; it does not require a second face.
   This script says "the same woman" and "same nose, both photographs", and
   keeping that literally true for the whole runtime is worth more here than an
   announced second casting. */
const HERO = "ratio1-before";

type Id = Parameters<typeof anchor>[0];
type Region = Parameters<typeof anchor>[1];
const asId = (n?: string) => (n ?? HERO) as Id;

/**
 * Props a beat gets: the spec's, plus its own measured length and the frame each
 * of its script phrases starts on, relative to the beat.
 *
 * `lineAt` is what lets an element land ON the words that describe it without a
 * frame being typed anywhere — it is derived in the compiler from the same cue
 * table the captions read. Before it, the self-test's three cards all arrived in
 * the first two seconds and the beat then held for four more with nothing
 * happening, which is most of where this reel's frozen share came from. Cards
 * that land on their own sentence are better synced AND spread the arrivals
 * across the beat; the metric moves because the edit got better, which is the
 * distinction rule P is about.
 */
type BeatArgs = BeatProps & { len: number; lineAt: number[] };


/**
 * `fit` sizes the PICTURE, never the type.
 *
 * ratio1's face is 1028px in a 1920px master, so at cover scale it lands at
 * 0.535 of frame height — against a corpus close band that tops out at 0.453,
 * which is not a preference but the largest face height measured anywhere in
 * 1268 corpus frames. A portrait cannot go below cover without its backdrop
 * showing, so it is composited as a sized element on the stage instead.
 *
 * Type stays OUTSIDE this wrapper. Scaling whole beats would have taken 26px
 * captions under the legibility floor in order to fix framing.
 */
/**
 * THE PICTURE COVERS THE FRAME. THERE IS NO `fit` IN THIS REEL.
 *
 * RefinaFlip and RefinaLips both composite their portrait as a sized element on
 * the stage, because ratio1's face at cover scale is 0.535 of frame height
 * against a corpus close band topping out at 0.453. That works and it is why
 * `fit` exists — but it makes the picture SMALLER than the frame, so it has
 * edges. While the studio backdrop was a different colour from the stage those
 * edges read as a deliberate card. `gen/sage.py` repaints the backdrop to the
 * exact stage colour so the top and side edges vanish, and then the bottom one
 * does not: the subject's black turtleneck runs to it and stops in mid-air.
 *
 * So the masters are PADDED instead (`gen/extend-frame.py`): sage above and
 * beside, the clamped bottom row extended below, until the face is 0.208 of a
 * frame the picture now covers completely. 2764x4900, nothing resampled.
 *
 * WHAT THAT BUYS IS NOT JUST THE EDGE. Framing is now expressed purely as
 * `zoom` + `focus`, which `anchors.ts` ALREADY models in `anchor()`, `faceRow()`
 * and `faceCol()` — so every ring, seam and band follows the camera for free.
 * The `fit` version needed a second transform applied outside the picture and
 * kept in step with it by hand, which is invariant S: the same calculation done
 * twice, out by up to 240px the first time this repo tried it.
 */
const FRAME = { width: 1080, height: 1920 } as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** The chin, as a fraction of the measured `jaw` box — see `rectOf`. */
const CHIN_OF_JAW: [number, number, number, number] = [0.3, 0.5, 0.7, 1.0];

/** Named targets a beat may point the camera at, resolved to a box. */
const TARGETS: Record<
  string,
  [Region, [number, number, number, number] | undefined]
> = {
  nose: ["nose", undefined],
  eyes: ["eyes", undefined],
  lips: ["lips", undefined],
  jaw: ["jaw", undefined],
  chin: ["jaw", CHIN_OF_JAW],
};

/**
 * A region's rectangle in frame space at this camera.
 *
 * An `inset` carves a sub-region out of a measured box as FRACTIONS of that box
 * — which is what `REGIONS` already is, one level down. `jaw` runs x +-0.50 and
 * y 0.72-1.02 of face height, i.e. the whole mandible, so a ring on it circles
 * the entire lower face; `chin` is the part of it the script actually names.
 * Still derived from the record, so it follows the asset if one is swapped.
 */
const rectOf = (
  id: Id,
  target: string,
  zoom: number,
  focus: [number, number],
) => {
  const [region, inset] = TARGETS[target] ?? ["jaw", undefined];
  const r = anchor(id, region, FRAME, zoom, focus);
  const [ix0, iy0, ix1, iy1] = inset ?? [0, 0, 1, 1];
  return {
    x: r.x + r.width * ix0,
    y: r.y + r.height * iy0,
    w: r.width * (ix1 - ix0),
    h: r.height * (iy1 - iy0),
  };
};

/**
 * The `focus` that parks a point at a given place in frame — SOLVED, not derived
 * a second time.
 *
 * `focus` enters the cover maths linearly, so evaluating the mark at focus 0 and
 * at focus 1 and interpolating between them inverts it exactly. That matters
 * more than the arithmetic it saves: it means this function has no model of the
 * layout of its own. `anchor()` stays the single source of truth for where
 * things are, and a camera aimed with it cannot drift from the marks drawn with
 * it — which is the entire content of invariant S.
 */
const solveFocus = (
  at: (f: [number, number]) => [number, number],
  targetX: number,
  targetY: number,
): [number, number] => {
  const [x0, y0] = at([0, 0]);
  const [x1, y1] = at([1, 1]);
  const fx = x1 === x0 ? 0.5 : (targetX - x0) / (x1 - x0);
  const fy = y1 === y0 ? 0.5 : (targetY - y0) / (y1 - y0);
  return [clamp01(fx), clamp01(fy)];
};

/** Focus that centres the whole FACE box horizontally and parks it at `y`. */
const focusOnFace = (id: Id, zoom: number, y: number): [number, number] =>
  solveFocus(
    (f) => [faceCol(id, 0, FRAME, zoom, f), faceRow(id, 0.5, FRAME, zoom, f)],
    540,
    y,
  );

/** Focus that centres a named REGION horizontally and parks it at `y`. */
const focusOnTarget = (
  id: Id,
  target: string,
  zoom: number,
  y: number,
): [number, number] =>
  solveFocus(
    (f) => {
      const r = rectOf(id, target, zoom, f);
      return [r.x + r.w / 2, r.y + r.h / 2];
    },
    540,
    y,
  );

/**
 * The camera for this frame of this beat: land, then push in on the feature.
 *
 * THIS IS NOT THE ZOOM RULE P FORBIDS, and the difference is worth stating
 * because the two look identical in a diff. Rule P came from mirror2, where a
 * slow zoom was added to every held beat — beats with nothing in them — purely
 * to move a frozen-frame number, and it neither worked nor would have been a
 * fix. This push starts on the SCRIPT LINE that names a feature and travels to
 * that feature's measured box, so it is the reel pointing at what it is talking
 * about. It is done for the edit. If the motion figures do not move, or move the
 * wrong way, the push stays and the numbers get reported as they are.
 *
 * No frame is typed: the push starts at `lineAt[line]`, which comes from the
 * same measured cue table the captions read.
 */
const useCamera = (p: BeatArgs, id: Id) => {
  const frame = useCurrentFrame();
  const z0 = p.zoom ?? 1;
  const base = focusOnFace(id, z0, p.faceY ?? 1010);
  const push = p.push;
  if (!push) return { zoom: z0, focus: base };
  const start = p.lineAt[push.line] ?? 0;
  const t = interpolate(frame, [start, start + (push.dur ?? 48)], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const aim = focusOnTarget(id, push.target, push.zoom, push.y ?? 980);
  return {
    zoom: z0 + (push.zoom - z0) * t,
    focus: [
      base[0] + (aim[0] - base[0]) * t,
      base[1] + (aim[1] - base[1]) * t,
    ] as [number, number],
  };
};

/**
 * An anatomical region, circled — the reel's only mark on a face.
 *
 * It says WHERE and never HOW MUCH, which is the whole reason this reel can
 * annotate a pair whose difference is not a distance. `state="held"` is the
 * rhetoric: the region that did NOT change is the harder half of the claim, so
 * it gets a ring of its own rather than being left unmarked.
 *
 * It takes the LIVE camera, so it rides the push instead of sliding off the
 * anatomy as the picture moves.
 */
const MarkRing: React.FC<{
  id: string;
  target: string;
  zoom: number;
  focus: [number, number];
  from: number;
  label?: string;
  state?: "changed" | "held";
  pad?: number;
  labelAt?: "above" | "below" | "left" | "right";
}> = ({
  id,
  target,
  zoom,
  focus,
  from,
  label,
  state = "changed",
  pad = 1.16,
  labelAt = "below",
}) => {
  const frame = useCurrentFrame();
  const r = rectOf(asId(id), target, zoom, focus);
  const p = interpolate(frame - from, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (p <= 0) return null;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const rx = (r.w / 2) * pad;
  const ry = (r.h / 2) * pad;
  const held = state === "held";
  const col = held ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.98)";
  const circ = 2 * Math.PI * Math.max(rx, ry);
  const o = interpolate(p, [0.6, 1], [0, 1], clamp);
  const side = labelAt === "left" || labelAt === "right";
  const lead = 30;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* The held ring is DASHED and the changed ring solid, so the two are
            told apart by line quality rather than by opacity alone — at 390px
            a 0.82 and a 0.98 white read as the same mark. The changed ring also
            DRAWS ON; the held one simply arrives, because a ring that draws
            itself reads as "something happened here" and the held ring's whole
            job is to say that nothing did. */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={col}
          strokeWidth={held ? 2.6 : 3.4}
          opacity={held ? p : 1}
          strokeDasharray={held ? "13 11" : circ}
          strokeDashoffset={held ? 0 : circ * (1 - p)}
        />
        {side && label && p > 0.6 ? (
          <line
            x1={labelAt === "left" ? cx - rx : cx + rx}
            y1={cy}
            x2={labelAt === "left" ? cx - rx - lead : cx + rx + lead}
            y2={cy}
            stroke={col}
            strokeWidth={2}
            opacity={o}
          />
        ) : null}
      </svg>
      {/* THE LABEL GOES BESIDE THE RING, NOT OVER THE FACE. The first cut put
          the held ring's tag above the nose, which at that framing landed square
          on her eyes — a chip sitting on the subject's eye in two of eight beats
          on the contact sheet. */}
      {label && p > 0.6 ? (
        <div
          style={{
            position: "absolute",
            opacity: o,
            display: "flex",
            ...(side
              ? {
                  top: cy - 20,
                  ...(labelAt === "left"
                    ? {
                        right: 1080 - (cx - rx - lead - 12),
                        justifyContent: "flex-end",
                      }
                    : { left: cx + rx + lead + 12 }),
                }
              : {
                  top: labelAt === "above" ? cy - ry - 66 : cy + ry + 22,
                  left: 0,
                  right: 0,
                  justifyContent: "center",
                }),
          }}
        >
          <Tag size={26} dim={held}>
            {label}
          </Tag>
        </div>
      ) : null}
    </>
  );
};

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
 * Which side of the seam the viewer is looking at, from the record's `role`.
 *
 * A slider comparison with nothing naming its two states asks the viewer to
 * work out which face is which while the seam is already moving. The words are
 * NOT typed: `control` and `after` are what the asset registry recorded at
 * ingest, so this cannot come to disagree with the pair it labels — the same
 * argument as `labelOf` (rule R), one field over. An asset with no role prints
 * nothing rather than a guess.
 */
const ROLE_WORD: Record<string, string> = { control: "BEFORE", after: "AFTER" };

const StateFlag: React.FC<{ under: string; over: string; progress: number }> = ({
  under,
  over,
  progress,
}) => {
  const showing = progress >= 50 ? over : under;
  const rec = (ASSETS as Record<string, { role?: string } | undefined>)[showing];
  const word = ROLE_WORD[rec?.role ?? ""];
  if (!word) return null;
  return (
    <div
      style={{
        position: "absolute",
        // Below the headline, not through it. `SectionHeadline` sits at 12% of
        // frame height and a two-line burst runs to about y=405, which is where
        // this flag landed on the contact sheet — printed across the word
        // "nose" in "Same face. Same nose."
        top: 448,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Tag size={26} tone={progress >= 50 ? "live" : "plain"}>
        {word}
      </Tag>
    </div>
  );
};

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
 * The measured evidence for the proof beat, as four columns.
 *
 * COLUMNS RATHER THAN FOUR NUMBERS, because the line under them is "almost none
 * of it is on her nose" and that is a COMPARISON. Four numerals make the viewer
 * do the arithmetic in the ~2s the phrase is on screen; four bars of visibly
 * different height say it before the sentence finishes. The numeral stays on
 * each bar so the figure is still readable, and the bars are ordered loudest
 * first so the nose is the last and shortest thing that arrives.
 *
 * The palette is the reel's, not a chart palette: this treatment is white type
 * on flat sage with two type faces (spec rules 1, 2 and 8), so the bars are
 * separated by fill weight and border rather than by hue.
 *
 * RULE Z. These are per-region pixel change between two registered files,
 * computed over facial skin by `align_core.region_score` — the same pixel set
 * the difference map beside them is masked to. The caption says exactly that,
 * because "her jaw is 44% different" would be a facial statistic.
 */
const MeasureBars: React.FC<{ subject: string; from: number; top: number }> = ({
  subject,
  from,
  top,
}) => {
  const frame = useCurrentFrame();
  const s = SCORES[subject];
  if (!s) return null;
  const rows: [string, number][] = [
    ["JAW", s.jaw],
    ["EYES", s.eyes],
    ["LIPS", s.lips],
    ["NOSE", s.nose],
  ];
  const max = Math.max(...rows.map(([, v]) => v));
  // The ground arrives with the first bar. Held on for the whole beat it was a
  // grey band lying across her hair with nothing in it — which is what the
  // contact sheet showed at the frame the phone sheet happened to pick.
  const groundO = interpolate(frame - from, [0, 12], [0, 1], clamp);
  // 240px of bar and 140px of column. The first cut ran 186/122 and the whole
  // block read as a row of postage stamps at 390px — the numerals were legible
  // and the COMPARISON, which is the actual content, was not.
  const H = 240;
  return (
    <>
      {/* The readout sits over a photograph for part of its life and a
          false-colour map for the rest. It carries its own soft ground so it
          is legible on both, rather than a full-frame scrim that would dim the
          evidence it is reporting on. */}
      <div
        style={{
          position: "absolute",
          top: top - 34,
          left: 118,
          right: 118,
          height: 400,
          borderRadius: 18,
          opacity: groundO,
          background:
            "linear-gradient(180deg, rgba(14,20,24,0.46) 0%, rgba(14,20,24,0.34) 68%, rgba(14,20,24,0) 100%)",
        }}
      />
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 22,
      }}
    >
      {rows.map(([k, v], i) => {
        const t0 = from + i * 9;
        const g = interpolate(frame - t0, [0, 14], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        const o = interpolate(frame - t0, [0, 8], [0, 1], clamp);
        // The nose is the reel's claim, so it is the emphasised column even
        // though it is the shortest — the point is that it is short.
        const lead = k === "NOSE";
        return (
          <div
            key={k}
            style={{ width: 140, opacity: o, textAlign: "center" }}
          >
            <div
              style={{
                fontFamily: headlineStack,
                fontSize: 46,
                color: `rgba(255,255,255,${lead ? 1 : 0.8})`,
                marginBottom: 8,
              }}
            >
              {(v * g).toFixed(1)}
            </div>
            <div
              style={{
                height: (H * v * g) / max,
                // The non-lead fill was 0.34 and read as pale grey-on-charcoal
                // over the difference map — the numerals were legible and the
                // bars, which carry the comparison, were not.
                background: `rgba(255,255,255,${lead ? 0.94 : 0.5})`,
                border: `${lead ? 3 : 1.5}px solid rgba(255,255,255,${lead ? 1 : 0.72})`,
                borderRadius: 4,
              }}
            />
            <div style={{ marginTop: 10 }}>
              <Mono size={26} o={lead ? 1 : 0.7}>
                {k}
              </Mono>
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};

/* ── the beat library ─────────────────────────────────────────────────
   Every component here is driven ENTIRELY by props from shots.json plus its
   own length. A beat that reads a module constant is a beat the spec cannot
   reconfigure, which defeats the point of having a spec. */

/**
 * hook / resolve — a hard edge sweeps across the face and the lower third
 * changes under it.
 *
 * The sweep IS the comparison: the same pixels, one region redrawn. A
 * cross-fade between two pictures this similar crosses no motion threshold at
 * all and reads as a smudge (invariant BB), which is why the edge is hard.
 *
 * IT CROSSES REPEATEDLY, THEN SETTLES ON THE AFTER. Invariant KK: a wipe moves
 * only where the two pictures DIFFER, so a single traverse spends most of its
 * travel over identical pixels and scores far below the share it appears to
 * have. The settle matters for a different reason: the payoff of a hook is the
 * change, so the change has to be what is on screen when the beat ends.
 *
 * The seam range is derived from the FACE, not the frame. At a fixed camera the
 * two are interchangeable; under a push they are not, and a seam pinned to frame
 * percentages would drift off the face exactly when the camera moves.
 */
const PairSweep: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const id = asId(p.under);
  const { zoom, focus } = useCamera(p, id);
  const settle = Math.round(p.len * 0.72);
  const period = Math.max(26, Math.round(settle / (p.sweeps ?? 2)));
  // THE SEAM STAYS ON THE FACE. `useSweep` runs 3..97, and at 3 the edge is out
  // past her ear where the two pictures are identical — it reads as a scratch on
  // the print rather than as a comparison. Remapped to the measured face box so
  // every position of it is dividing two versions of a face, which is also what
  // invariant KK asks for: the travel that counts is travel across the region
  // where the pictures actually differ.
  const l = faceCol(id, -520, FRAME, zoom, focus) / 10.8;
  const r = faceCol(id, 520, FRAME, zoom, focus) / 10.8;
  const lo = Math.max(2, Math.min(l, r));
  const hi = Math.min(98, Math.max(l, r));
  const osc = lo + ((useSweep(Math.round(p.len * 0.12), period) - 3) * (hi - lo)) / 94;
  const progress =
    frame < settle
      ? osc
      : interpolate(frame, [settle, settle + 22], [osc, 100], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
  return (
    <AbsoluteFill>
      <Reveal
        under={p.under ?? HERO}
        over={p.over ?? HERO}
        progress={progress}
        zoom={zoom}
        focus={focus}
      />
      {/* The held ring is anchored on `under`, but the two halves of a
          registered pair share one frame by construction, so it lands on the
          same anatomy whichever side of the seam is showing. That is the whole
          point of the beat: the viewer watches this ring NOT move while
          everything below it does. */}
      {p.ringHeld ? (
        <MarkRing
          id={p.under ?? HERO}
          target={p.ringHeld}
          zoom={zoom}
          focus={focus}
          from={14}
          label={p.ringHeldLabel}
          state="held"
          labelAt="right"
        />
      ) : null}
      {/* The record's label describes `over`. Showing it while the seam is
          still left of centre would caption the BEFORE as an augmentation,
          which is rule E with the asset record doing the lying for us. The
          hook suppresses it entirely (`assetTag: false`) because that beat is
          still posing the question this label answers. */}
      {p.assetTag !== false && progress >= 55 ? (
        <AssetTag id={p.over ?? HERO} from={0} y={486} />
      ) : null}
      {p.assetTag === false ? (
        <StateFlag
          under={p.under ?? HERO}
          over={p.over ?? HERO}
          progress={progress}
        />
      ) : null}
      {p.compliance ? <AiChip size={26} /> : null}
    </AbsoluteFill>
  );
};

/**
 * claim — the same device on the other axis, with the region named.
 *
 * A HORIZONTAL seam here, where hook and resolve use a vertical one: the device
 * recurs but the beat is not mistakable for either of them. It oscillates
 * rather than cutting, because a hard cut between two full-frame pictures
 * scores as a CUT and not as motion (invariant BB).
 *
 * ITS RANGE IS THE LOWER THIRD OF THE FACE, MEASURED. Swept over the whole
 * frame this edge spends most of its travel across the forehead and eyes, where
 * the two pictures are identical, so it reads as a white hairline drawn over one
 * unchanging face rather than as a comparison — which is how it looked on the
 * contact sheet. `faceRow` puts it between the measured nose base and the chin,
 * so it rides the push instead of sliding off the face.
 */
const PairToggle: React.FC<BeatArgs> = (p) => {
  const id = asId(p.under);
  const { zoom, focus } = useCamera(p, id);
  const top = faceRow(id, 0.62, FRAME, zoom, focus) / 19.2;
  const bot = faceRow(id, 1.04, FRAME, zoom, focus) / 19.2;
  const lo = Math.max(2, Math.min(top, bot));
  const hi = Math.min(98, Math.max(top, bot));
  const progress = lo + ((useSweep(0, p.period ?? 38) - 3) * (hi - lo)) / 94;
  return (
    <AbsoluteFill>
      <Reveal
        under={p.under ?? HERO}
        over={p.over ?? HERO}
        progress={progress}
        dir="y"
        zoom={zoom}
        focus={focus}
      />
      {p.ringChanged ? (
        <MarkRing
          id={p.under ?? HERO}
          target={p.ringChanged}
          zoom={zoom}
          focus={focus}
          from={16}
          label={p.ringChangedLabel}
          state="changed"
        />
      ) : null}
      {p.assetTag !== false ? (
        <AssetTag id={p.over ?? HERO} from={26} y={486} />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * proof — the difference map, with the numbers it was computed from.
 *
 * RULE Z. The map is masked to the same facial-skin pixels `region_score`
 * measures over, so the picture and the figures beside it describe one pixel
 * set. RefinaFlip shipped a version where they did not, and its map lit the
 * hairline while its chips reported skin.
 *
 * BOTH ARE COMPUTED FROM THE UNPADDED PAIR. `gen/sage.py` and
 * `gen/extend-frame.py` change the background and grow the canvas; measured on
 * the face mask, the repaint moves 0.4% of skin pixels by a mean of 0.012
 * levels. So the scores and the map are derived from ratio1 as generated, and
 * the display assets are that same pair with a background transform applied —
 * which keeps the picture and the numbers over one pixel set rather than two
 * that merely ought to agree.
 *
 * The wipe here is between a photograph and a false-colour map, which differ
 * EVERYWHERE, so unlike the portrait beats it passes on length alone.
 */
const DifferenceMap: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const id = asId(p.under);
  const { zoom, focus } = useCamera(p, id);
  // The wipe finishes at 40% so the bars have the rest of the beat to arrive
  // over a map that is fully on screen. Numbers landing while the photograph is
  // still half the frame would attach them to the wrong picture.
  const progress = interpolate(frame, [8, Math.round(p.len * 0.4)], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <Reveal
        under={p.under ?? HERO}
        over={p.over ?? HERO}
        progress={progress}
        zoom={zoom}
        focus={focus}
      />
      <MeasureBars
        subject={p.measure ?? "ratio1"}
        from={Math.round(p.len * 0.46)}
        top={360}
      />
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
 * mechanism — the teaching beat: two regions, named, on one face.
 *
 * This is the only beat that annotates a SINGLE picture, and it is the before,
 * because what it describes is that face's own anatomy rather than a change.
 * The two rings plus the line between them are the argument in one frame: the
 * eye is comparing these two things, not measuring either.
 *
 * It is also the reel's WIDE shot, and that is the same decision twice — the
 * line is about the whole face, and a beat that has to hold two regions at once
 * cannot be tight on either.
 *
 * `ringChanged` / `ringHeld` are STYLING ROLES, not claims — here they carry
 * "SITS BACK" on the chin and "STANDS OUT" on the nose, both statements about
 * the before.
 */
const RingPair: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const id = asId(p.under);
  const { zoom, focus } = useCamera(p, id);
  const a = p.ringHeld ? rectOf(id, p.ringHeld, zoom, focus) : null;
  const b = p.ringChanged ? rectOf(id, p.ringChanged, zoom, focus) : null;
  const t = interpolate(frame - 40, [0, 18], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <Face name={p.under ?? HERO} zoom={zoom} focus={focus} />
      {/* The connector is drawn between the two ring centres, so it is derived
          from the same anchors the rings are and cannot drift from them. It is
          the "compares them" of the line being spoken over it. */}
      {a && b && t > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <line
            x1={a.x + a.w / 2}
            y1={a.y + a.h}
            x2={a.x + a.w / 2}
            y2={a.y + a.h + (b.y - a.y - a.h) * t}
            stroke="rgba(255,255,255,0.72)"
            strokeWidth={2.4}
            strokeDasharray="8 9"
          />
        </svg>
      ) : null}
      {/* THE EYE GOING BACK AND FORTH, DRAWN.
          The line spoken over this beat is "your eye doesn't measure features,
          it compares them" — so once both rings are down, a soft band travels
          between them, repeatedly, for the rest of the beat. This is the beat's
          own claim rendered as motion rather than a creep added to move a
          number. It is bounded by the two measured ring edges, so it travels
          exactly the distance being compared and follows the asset if one is
          swapped. */}
      {a && b && t >= 1 ? (
        (() => {
          const top = a.y + a.h * 0.5;
          const bot = b.y + b.h * 0.5;
          const period = 46;
          const c = ((frame - 58) % period) / period;
          const tri = c < 0.5 ? c * 2 : (1 - c) * 2;
          const y = top + (bot - top) * tri;
          return (
            <AbsoluteFill
              style={{
                top: y - 62,
                height: 124,
                bottom: "auto",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.26) 50%, rgba(255,255,255,0) 100%)",
              }}
            />
          );
        })()
      ) : null}
      {p.ringHeld ? (
        <MarkRing
          id={id}
          target={p.ringHeld}
          zoom={zoom}
          focus={focus}
          from={8}
          label={p.ringHeldLabel}
          state="held"
          labelAt="left"
        />
      ) : null}
      {p.ringChanged ? (
        <MarkRing
          id={id}
          target={p.ringChanged}
          zoom={zoom}
          focus={focus}
          from={30}
          label={p.ringChangedLabel}
          state="changed"
        />
      ) : null}
      <AiChip size={26} />
    </AbsoluteFill>
  );
};

/**
 * test — the self-test. The most saveable moment in the format, and five of the
 * fourteen corpus explainers carry one.
 *
 * FULL-WIDTH ROWS, NOT A COLUMN OF TEXT. The first cut set three `Step`s in the
 * middle of the frame and the contact sheet showed three short lines adrift in
 * an empty field — spec rule 5 exactly, and rule Q's argument that occupancy is
 * the number to fix first because frozen, cuts and arrivals all follow it. Each
 * step is now a banded row that reaches both margins, so the beat fills the
 * frame with the one thing the viewer is meant to act on.
 */
const InstructionCards: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const steps = p.steps ?? [];
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 64px" }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {steps.map((s, i) => {
          // On the phrase that describes it, falling back to a stagger if the
          // beat covers fewer lines than it has cards.
          const t0 = p.lineAt[i] ?? 10 + i * 16;
          const o = interpolate(frame - t0, [0, 10], [0, 1], clamp);
          const x = interpolate(frame - t0, [0, 14], [-70, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div
              key={s}
              style={{
                opacity: o,
                transform: `translateX(${x}px)`,
                background: "rgba(255,255,255,0.11)",
                border: "1.5px solid rgba(255,255,255,0.30)",
                borderRadius: 14,
                padding: "34px 38px",
              }}
            >
              <Step n={String(i + 1)} text={s} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * nuance — the two pictures separate, and the note lands between them.
 *
 * The format's nuance beat is what makes an explainer read as teaching rather
 * than selling, and every corpus explainer has one — the script reference says
 * in as many words not to cut it for time.
 *
 * TWO FULL-HEIGHT PANELS, NOT TWO SCALED COPIES. A scaled-down copy of the
 * whole picture would put a hard horizontal line across each card where the
 * subject's turtleneck stops, which is precisely the edge the padded masters
 * exist to remove. Each panel is a WINDOW: a clipped box, with the picture
 * covering that box at its own zoom. The box reaches the top and bottom of the
 * frame, so the only edges in the beat are the two vertical ones, and those are
 * the composition.
 *
 * Both panels take ONE framing declaration and differ only in which file they
 * show — invariant AA, which RefinaFlip broke by windowing two bands at their
 * own offsets and captioning two different parts of a face as one comparison.
 *
 * It is also the second WIDE beat, and it carries the reel's shot travel with
 * `mechanism`: the panel crops horizontally, so the face sits at the master's
 * own 0.208 while the close beats push past 0.40.
 */
const PairSplit: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  // They start touching at centre and part. An easeInOut across the whole beat
  // spends its middle third with the two half over each other; the hold-then-part
  // reads as one picture becoming two. This is a different curve, not a shorter
  // gesture, which is the trap rule FF records.
  // They start EXACTLY STACKED and part, so the beat opens on one picture and
  // becomes two. The first cut of this component only opened a 34px gap between
  // two already-separate panels, which measured 0% of frames moving — a real
  // travel of half a panel width is what makes it a gesture rather than a
  // nudge. Hold, then part: an easeInOut across the whole beat spends its middle
  // third half-overlapped, which reads as one mis-layered picture.
  const w0 = p.panel ?? 486;
  const gap = interpolate(frame, [10, Math.max(40, p.len - 16)], [-w0, 34], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const w = p.panel ?? 486;
  const h = p.panelH ?? 1180;
  const zoom = p.zoom ?? 1;
  // The panel needs its own scale, DERIVED not typed. `Face` always covers the
  // 1080x1920 frame — that is what makes `anchor()` agree with it — so dropped
  // into a smaller window it renders at full size and the panel is just a
  // crop, which would put the face at the same 0.257 as the medium beats. The
  // picture is scaled about the panel centre until it only just covers the
  // panel, which is the widest this composition can go without showing an edge.
  const rec = (ASSETS as Record<string, { w: number; h: number } | undefined>)[
    p.under ?? HERO
  ];
  const cover = rec ? Math.max(1080 / rec.w, 1920 / rec.h) * zoom : 1;
  const dw = rec ? rec.w * cover : 1080;
  const dh = rec ? rec.h * cover : 1920;
  const s = Math.max(w / dw, h / dh) * 1.01;
  const panel = (name: string, side: -1 | 1) => (
    <div
      style={{
        position: "absolute",
        top: (1920 - h) / 2,
        height: h,
        width: w,
        left: side < 0 ? 540 - w - gap / 2 : 540 + gap / 2,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ transform: `scale(${s})` }}>
        <Face
          name={name}
          zoom={zoom}
          focus={[0.5, 0.5]}
          style={{ left: (w - 1080) / 2, top: (h - 1920) / 2 }}
        />
      </AbsoluteFill>
    </div>
  );
  return (
    <AbsoluteFill>
      {panel(p.under ?? HERO, -1)}
      {panel(p.over ?? HERO, 1)}
      {p.note ? (
        <Bottom y={356}>
          <Tag size={26}>{p.note}</Tag>
        </Bottom>
      ) : null}
      <AiChip size={26} />
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
          const t0 = p.lineAt[i + 1] ?? 8 + i * Math.round((p.len * 0.34) / Math.max(1, locked.length));
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
          startFrame={p.lineAt[p.lineAt.length - 1] ?? Math.round(p.len * 0.42)}
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
  "pair-toggle": PairToggle,
  "difference-map": DifferenceMap,
  "ring-pair": RingPair,
  "instruction-cards": InstructionCards,
  "pair-split": PairSplit,
  "disclaimer-search": DisclaimerSearch,
};

/** Headline per beat. Copy, so it stays in the composition, not in the spec. */
const HEADLINES: Record<string, { lines: string[]; italicSecond?: boolean }> = {
  hook: { lines: ["Same face.", "Same nose."], italicSecond: true },
  claim: { lines: ["One thing moved"] },
  proof: { lines: ["Where it moved"] },
  mechanism: { lines: ["Read against", "each other"], italicSecond: true },
  resolve: { lines: ["It didn't shrink"] },
  test: { lines: ["Try it now"] },
  nuance: { lines: ["Not one feature.", "The whole face."], italicSecond: true },
  cta: { lines: ["Your face.", "Not hers."], italicSecond: true },
};

/**
 * Sound. Every cue is placed off the beat table, so re-running the voiceover
 * moves the effects with the words — no frame is typed here either.
 */
const SfxTrack: React.FC = () => (
  <>
    {/* hook - the shutter lands on the pair, then the seam travels */}
    <Sfx name="transition/camera-shutter.wav" at={bf("hook")} volume={0.34} dur={26} />
    <Sfx name="transition/woosh-1.wav" at={line("hook", 1)} volume={0.26} dur={26} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("hook", 2)} volume={0.2} dur={20} />

    {/* claim - the axis flips and the region is named */}
    <Sfx name="transition/woop.mp3" at={bf("claim", -2)} volume={0.26} dur={20} />
    <Sfx name="ui-tech/toggle.wav" at={line("claim", 1)} volume={0.3} dur={8} />

    {/* proof - the map arrives, then the bars count on */}
    <Sfx name="transition/deep-woosh.wav" at={bf("proof", -2)} volume={0.26} dur={40} />
    <Sfx name="ui-tech/digital-loading.wav" at={line("proof", 1)} volume={0.22} dur={26} />

    {/* mechanism - each ring lands */}
    <Sfx name="tick.wav" at={bf("mechanism", 8)} volume={0.26} dur={14} />
    <Sfx name="tick.wav" at={line("mechanism", 2)} volume={0.24} dur={14} />

    {/* resolve - same device as the hook, same sound: the recurrence is the point */}
    <Sfx name="transition/woosh-2.wav" at={bf("resolve", -2)} volume={0.26} dur={26} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("resolve", 2)} volume={0.2} dur={20} />

    {/* test - the instruction cards land */}
    <Sfx name="ui-tech/mouse-click.wav" at={bf("test", 8)} volume={0.26} dur={10} />
    <Sfx name="ui-tech/mouse-click.wav" at={line("test", 1)} volume={0.24} dur={10} />
    <Sfx name="ui-tech/mouse-click.wav" at={line("test", 2)} volume={0.22} dur={10} />

    {/* nuance - the two pictures part */}
    <Sfx name="cinematic/remembering-woosh.wav" at={bf("nuance", -2)} volume={0.24} dur={40} />

    {/* cta - typing */}
    <Sfx name="ui-tech/keyboard-typing.wav" at={bf("cta", 26)} volume={0.22} dur={40} />
  </>
);

/* ── the reel ────────────────────────────────────────────────────────── */

const Nose: React.FC = () => (
  <Stage>
    {/* The read. Synthesised from docs/scripts/nose.txt and verified word by
        word against the finished mp3 — max drift 6f, nothing over tolerance,
        which is the cleanest gate result in the repo. */}
    <Audio src={staticFile("voiceover-nose.mp3")} />
    {/* NO MUSIC BED. Every bed in this repo was built from
        sfx/cinematic/energyfields.wav, which is a TENSION CUE rather than
        music, and every one of them measured LOUDER than the voice on 13-21%
        of speech windows while passing `silencedetect` — a metric that cannot
        see masking and scores a louder bed better (invariant LL). Nothing goes
        back here until there is a real light-music library. */}
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
              <Beat
                {...(s.props as BeatProps)}
                len={len(name)}
                lineAt={Array.from({ length: s.lines }, (_, i) => line(name, i) - bf(name))}
              />
            </Plate>
          </Sequence>
          <Burst
            from={bf(name, 6)}
            hold={Math.min(len(name) - 12, 78)}
            lines={HEADLINES[s.name].lines}
            italicSecond={HEADLINES[s.name].italicSecond}
          />
        </React.Fragment>
      );
    })}

    <NoseCaptions />
  </Stage>
);

export const RefinaNose: React.FC = () => (
  <Composition
    id="RefinaNose"
    component={Nose}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
