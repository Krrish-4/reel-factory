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
import { faceRow, labelOf } from "../anchors";
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
import { LANDMARKS, SCORES } from "./measured";
import { LipsCaptions } from "./captions";
import { B, TOTAL, bf, len, line } from "./beats";
import { SHOTS } from "./shots";
import type { BeatProps } from "./shots";
import type { BeatName } from "./beats";

/**
 * "Load-Bearing" — educational explainer, RefinaLips.
 *
 * THE ARGUMENT. The lips are not a part you can change in isolation. The
 * philtrum above them and the chin below them are both READ against them, so
 * moving the lips alone changes how long the gap under the nose looks and how
 * strong the chin looks — with neither the nose nor the chin moving.
 *
 * HOW THIS DIFFERS FROM "Same Nose". Ratio's argument is MISATTRIBUTION: the
 * change was nowhere near the feature the viewer named (nose 9.7, jaw 44.0).
 * This one is the inverse and needed the opposite measurement — the change had
 * to be provably CONFINED to the lips while the rest of the face re-reads. One
 * instrument, pointed two ways. Measured on lips1: lips 51.7, eyes 16.3,
 * nose 9.7, jaw 8.3, concentration 3.88, drift 3.3.
 *
 * NO DIGIT ABOUT A FACE IS TYPED HERE. `measured.ts` is written by
 * `gen/emit-lips.py` from the scorer's own machinery, and the beats map over
 * it — invariant B applied to evidence rather than to timing. Every figure on
 * screen describes two IMAGE FILES, which is the only kind of measurement this
 * repo prints (rule E).
 *
 * THE SPANS COME FROM MEASURED LANDMARKS, NOT FROM `anchor()`. anchor()'s boxes
 * are fixed anatomical fractions, so they are the SAME BOX on a before and its
 * after: a philtrum span drawn from them would be identical either side of the
 * edit, on the one beat whose whole claim is that the gap shortens. That would
 * not have failed a check — it would have drawn a difference that is not there,
 * which is worse. `LANDMARKS` measures each asset instead. lips1 noseBase
 * 0.620/0.617 and lips2 0.650/0.650 — the nose did not move on either — while
 * philtrum goes 0.077 -> 0.052 and 0.108 -> 0.083.
 *
 * EVERY MOVING BEAT USES A TRAVELLING HARD EDGE. Invariant BB: a dissolve
 * between two near-identical pictures crosses no threshold at all, and a
 * whole-frame transform scores as a CUT rather than as motion. The seam is
 * deliberately RECURRING across hook, gap, another and chin — Gemini counted 17
 * devices with none used twice in `ours-changed-v2` against a corpus median of
 * 11 with at least one repeated.
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
   Two women. `lips1` carries the spine; `lips2` is the announced second
   subject, deliberately a different age and ethnicity — the line is "another
   face, same edit", which two near-identical subjects would not carry. */
const HERO = "lips1-before";

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
 * lips1's face is 1039px in a 1920px master, so at cover scale it lands at
 * 0.541 of frame height — against a corpus close band that tops out at 0.453,
 * which is not a preference but the largest face height measured anywhere in
 * 1268 corpus frames. A portrait cannot go below cover without its backdrop
 * showing, so it is composited as a sized element on the stage instead.
 *
 * Type stays OUTSIDE this wrapper. Scaling whole beats would have taken 26px
 * captions under the legibility floor in order to fix framing.
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
 * the picture WOULD have been at cover scale — up to 240px out, which is
 * exactly what invariant S records against "Same Nose".
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
 * The measured chips for the proof beat.
 *
 * These are per-region pixel change between two registered files, computed over
 * facial skin by `align_core.region_score`. The caption under them says exactly
 * that, because "her lips are N% different" would be a facial statistic and this
 * repo does not print those.
 */
const MeasureChips: React.FC<{ subject: string; from: number }> = ({
  subject,
  from,
}) => {
  const frame = useCurrentFrame();
  const s = SCORES[subject];
  if (!s) return null;
  const rows: [string, number][] = [
    ["LIPS", s.lips],
    ["EYES", s.eyes],
    ["NOSE", s.nose],
    ["JAW", s.jaw],
  ];
  return (
    <div
      style={{
        position: "absolute",
        top: 286,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 16,
      }}
    >
      {rows.map(([k, v], i) => {
        const t0 = from + i * 7;
        const o = interpolate(frame - t0, [0, 9], [0, 1], clamp);
        const y = interpolate(frame - t0, [0, 11], [16, 0], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        const lead = k === "LIPS";
        return (
          <div
            key={k}
            style={{
              opacity: o,
              transform: `translateY(${y}px)`,
              padding: "12px 18px",
              borderRadius: 10,
              // The lead chip is emphasised by BORDER and weight, not by
              // inverting to a white ground: `Mono` renders white and only
              // white, so dark-on-white would have been invisible type.
              background: `rgba(255,255,255,${lead ? 0.24 : 0.1})`,
              border: `${lead ? 3 : 1.5}px solid rgba(255,255,255,${lead ? 0.96 : 0.34})`,
              textAlign: "center",
              minWidth: 118,
            }}
          >
            <Mono size={26} o={lead ? 1 : 0.72}>
              {k}
            </Mono>
            <div
              style={{
                fontFamily: headlineStack,
                fontSize: lead ? 52 : 44,
                lineHeight: 1.05,
                color: `rgba(255,255,255,${lead ? 1 : 0.78})`,
              }}
            >
              {v.toFixed(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
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
 */
const PairSweep: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  // ONE traverse, held at both ends — NOT `useSweep`.
  //
  // An oscillating seam put the beat at 3% on its own last frame, so the hook
  // opened on the before, showed the after twice, and then handed a picture of
  // the UNCHANGED face to the cut. The payoff of a hook is the change; it has
  // to be what is on screen when the beat ends. The hold at the head also lets
  // "One photo. One region edited." land on the before it describes.
  //
  // It crosses the mouth REPEATEDLY and then settles. A single traverse moved
  // for 52% of the beat and measured 18%: the two pictures are identical
  // everywhere except the mouth, so a seam out on the cheek changes no pixels
  // at all. Only the crossings count, so the beat needs several of them.
  const settle = Math.round(p.len * 0.70);
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
          still left of centre would caption the BEFORE as an augmentation,
          which is rule E with the asset record doing the lying for us. */}
      {progress >= 55 ? <AssetTag id={p.over ?? HERO} from={0} y={486} /> : null}
      {p.compliance ? <AiChip /> : null}
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
  const keys = (p.rules ?? []) as (keyof typeof g)[];
  const NAMES: Record<string, string> = {
    noseBase: "NOSE BASE",
    lipTop: "LIP EDGE",
    mouthLine: "MOUTH LINE",
    chin: "CHIN",
  };
  // `chin` is the bottom of the measured face box rather than a landmark of its
  // own. lipTop and mouthLine are 0.02 of face height apart -- about 13px on
  // screen -- so they cannot both carry a label; the claim beat brackets the
  // lower third instead, which is what the line actually says.
  const frac = (k: string) => (k === "chin" ? 1.0 : (g[k as keyof typeof g] as number));
  if (!g) return null;
  return (
    <AbsoluteFill>
      <Pic fit={fit}>
        <Face name={p.under ?? HERO} zoom={zoom} focus={focus} />
      </Pic>
      <Scrim amount={0.16} />
      {/* The band is the beat's motion AND its content: it sweeps the region
          the line is about, and each rule lands as it passes. Three hairlines
          drawing on their own measured 0% of frames moving — invariant L, a
          small element inside a large frame. */}
      {(() => {
        const y0 = fitRow(id, frac("noseBase"), fit, zoom, focus);
        const y1 = fitRow(id, 1.0, fit, zoom, focus);
        const t = interpolate(frame, [6, Math.round(p.len * 0.72)], [0, 1], {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        });
        return (
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.30) 45%, rgba(255,255,255,0) 100%)",
              top: y0 - 150 + (y1 - y0 + 150) * t,
              height: 190,
              bottom: "auto",
            }}
          />
        );
      })()}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {keys.map((k, i) => {
          const t0 = 8 + i * 12;
          const w = interpolate(frame - t0, [0, 16], [0, 424], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          if (w <= 0) return null;
          const y = fitRow(id, frac(k as string), fit, zoom, focus);
          return (
            <line
              key={k as string}
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
        const y = fitRow(id, frac(k as string), fit, zoom, focus);
        return (
          <div
            key={k as string}
            style={{ position: "absolute", top: y - 36, left: 92, opacity: o }}
          >
            <Tag size={26}>{NAMES[k as string] ?? String(k)}</Tag>
          </div>
        );
      })}
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
 */
const DifferenceMap: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [8, Math.round(p.len * 0.78)], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
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
      <MeasureChips subject={p.measure ?? "lips1"} from={40} />
      <Bottom y={356}>
        <Tag size={26}>
          {labelOf(asId(p.over)) || "PER-REGION PIXEL CHANGE, THIS PAIR"}
        </Tag>
      </Bottom>
      {p.compliance ? <AiChip /> : null}
    </AbsoluteFill>
  );
};

/**
 * gap / chin — one face, split at a travelling seam, with a bracket either side.
 *
 * The two halves are the same subject's before and after on the identical
 * registered frame, so this is ONE continuous face whose left mouth is thin and
 * whose right mouth is full. That matters for invariant AA: two separately
 * cropped panels would not be a comparison at all, because the viewer could not
 * tell a difference in anatomy from a difference in framing.
 *
 * `band="philtrum"` brackets noseBase -> lipTop, which CHANGES. `band="chin"`
 * brackets mouthLine -> chin, which does NOT, and `held` says so on both
 * labels. Two brackets of visibly different length say the whole thing; a Span
 * never carries a figure, because a number printed against a face is a facial
 * statistic and this repo does not print those.
 */
const SpanCompare: React.FC<BeatArgs> = (p) => {
  const frame = useCurrentFrame();
  const L = p.left ?? HERO;
  const R = p.right ?? HERO;
  const zoom = p.zoom ?? 1;
  const focus = parseFocus(p.focus);
  const fit = p.fit ?? 1;
  const gl = LANDMARKS[L];
  const gr = LANDMARKS[R];
  if (!gl || !gr) return null;

  // The seam travels in from the right and settles at centre. Its ARRIVAL is
  // the comparison, so it is a real traverse rather than a cut.
  const seam = interpolate(frame, [4, 32], [100, 50], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const pair = (g: typeof gl, id: string): [number, number] =>
    p.band === "chin"
      ? [fitRow(asId(id), g.mouthLine, fit, zoom, focus), fitRow(asId(id), 1.0, fit, zoom, focus)]
      : [fitRow(asId(id), g.noseBase, fit, zoom, focus), fitRow(asId(id), g.lipTop, fit, zoom, focus)];

  // Both brackets are drawn solid even on the `held` beat. `dim` is ratio's
  // convention for "this one did not change", but here BOTH are held and two
  // faint marks at phone scale say nothing at all -- the point of that beat is
  // that the viewer can see they are the same length.
  const [l0, l1] = pair(gl, L);
  const [r0, r1] = pair(gr, R);
  const labels = p.labels ?? [];

  return (
    <AbsoluteFill>
      <Pic fit={fit}>
        <Reveal under={L} over={R} progress={seam} zoom={zoom} focus={focus} />
      </Pic>
      <Span x={430} y0={l0} y1={l1} from={32} label={labels[0]} side="left" dim={false} />
      <Span x={650} y0={r0} y1={r1} from={40} label={labels[1]} side="right" dim={false} />
      {p.caption ? (
        <Bottom y={356}>
          <Tag size={26}>{p.caption}</Tag>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * another — the second subject, announced.
 *
 * A VERTICAL seam here, where the spine beats use a horizontal one: the device
 * recurs but the beat is not mistakable for the hook. The seam oscillates
 * rather than cutting, because a hard cut between two full-frame pictures
 * scores as a CUT and not as motion (invariant BB).
 */
const PairToggle: React.FC<BeatArgs> = (p) => {
  const progress = useSweep(0, p.period ?? 34);
  return (
    <AbsoluteFill>
      <Pic fit={p.fit}>
        <Reveal
          under={p.under ?? HERO}
          over={p.over ?? HERO}
          progress={progress}
          dir="y"
          zoom={p.zoom}
          focus={parseFocus(p.focus)}
        />
      </Pic>
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
      <AssetTag id={p.over ?? HERO} from={14} y={556} />
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
  const d = interpolate(frame, [0, Math.max(30, p.len - 8)], [0, 262], {
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
          becomes two. Travel is +-272 because each card is 1080*fit wide and
          anything less leaves them overlapping, which reads as a mistake. */}
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
          // three lines that arrive at once leave the rest of the beat frozen.
          const t0 = 8 + i * Math.round((p.len * 0.34) / Math.max(1, locked.length));
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
      <AiChip y={430} />
    </AbsoluteFill>
  );
};

const COMPOSITIONS: Record<string, React.FC<BeatArgs>> = {
  "pair-sweep": PairSweep,
  "lower-third-rules": LowerThirdRules,
  "difference-map": DifferenceMap,
  "span-compare": SpanCompare,
  "pair-toggle": PairToggle,
  "pair-split": PairSplit,
  "instruction-cards": InstructionCards,
  "disclaimer-search": DisclaimerSearch,
};

/** Headline per beat. Copy, so it stays in the composition, not in the spec. */
const HEADLINES: Record<string, { lines: string[]; italicSecond?: boolean }> = {
  hook: { lines: ["One region", "changed"], italicSecond: true },
  claim: { lines: ["The lower third", "is read from here"], italicSecond: true },
  proof: { lines: ["Where the pixels moved"] },
  gap: { lines: ["1. The gap shortens"] },
  another: { lines: ["2. Her too"] },
  chin: { lines: ["3. The same chin"] },
  nuance: { lines: ["Not better.", "Load-bearing."], italicSecond: true },
  test: { lines: ["Try it now"] },
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

    {/* claim - each measure rule ticks in */}
    <Sfx name="transition/woop.mp3" at={bf("claim", -2)} volume={0.26} dur={20} />
    <Sfx name="ui-tech/toggle.wav" at={line("claim", 1)} volume={0.3} dur={8} />

    {/* proof - the map arrives, then the chips count on */}
    <Sfx name="transition/deep-woosh.wav" at={bf("proof", -2)} volume={0.26} dur={40} />
    <Sfx name="ui-tech/digital-loading.wav" at={line("proof", 1)} volume={0.22} dur={26} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("proof", 2)} volume={0.2} dur={20} />

    {/* gap - the seam travels in, the brackets snap */}
    <Sfx name="transition/woosh-2.wav" at={bf("gap", -2)} volume={0.26} dur={26} />
    <Sfx name="tick.wav" at={line("gap", 1)} volume={0.26} dur={14} />
    <Sfx name="tick.wav" at={line("gap", 2)} volume={0.24} dur={14} />

    {/* another - the second subject */}
    <Sfx name="transition/paper-slide.wav" at={bf("another", -2)} volume={0.28} dur={24} />
    <Sfx name="ui-tech/toggle.wav" at={line("another", 1)} volume={0.28} dur={8} />

    {/* chin - same device, same sound: the recurrence is the point */}
    <Sfx name="transition/woosh-2.wav" at={bf("chin", -2)} volume={0.26} dur={26} />
    <Sfx name="tick.wav" at={line("chin", 1)} volume={0.26} dur={14} />
    <Sfx name="tick.wav" at={line("chin", 2)} volume={0.24} dur={14} />

    {/* nuance - the two pictures part */}
    <Sfx name="cinematic/remembering-woosh.wav" at={bf("nuance", -2)} volume={0.24} dur={40} />

    {/* test - the instruction cards land */}
    <Sfx name="ui-tech/mouse-click.wav" at={bf("test", 6)} volume={0.26} dur={10} />
    <Sfx name="ui-tech/mouse-click.wav" at={line("test", 1)} volume={0.24} dur={10} />
    <Sfx name="ui-tech/mouse-click.wav" at={line("test", 2)} volume={0.22} dur={10} />

    {/* cta - typing */}
    <Sfx name="ui-tech/keyboard-typing.wav" at={bf("cta", 26)} volume={0.22} dur={40} />
  </>
);

/* ── the reel ────────────────────────────────────────────────────────── */

const Lips: React.FC = () => (
  <Stage>
    {/* The read. Synthesised from docs/scripts/lips.txt and verified word by
        word against the finished mp3 (max drift 10f). */}
    <Audio src={staticFile("voiceover-lips.mp3")} />
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

    <LipsCaptions />
  </Stage>
);

export const RefinaLips: React.FC = () => (
  <Composition
    id="RefinaLips"
    component={Lips}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
