import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  staticFile,
} from "remotion";
import { fitTextOnNLines } from "@remotion/layout-utils";
import { headlineStack } from "../../fonts";
import {
  SAGE,
  PANEL,
  Stage,
  Portrait,
  VerdictTag,
  SearchBar,
  portrait,
  screen,
} from "../protocol/atoms";
import {
  SlideIn,
  StepPill,
  AnimatedCheckList,
  Exit,
  Camera,
} from "../protocol/motion";
import { Plate, T } from "../preview/plate";
import {
  Drop,
  DrawnCallout,
  ConvergePanels,
  PreviewPill,
  ReasonIndex,
  SectionHeadline,
  SwipeCursor,
  TagStack,
} from "../preview/draw";
import { SwapScene } from "../preview/swap";
import { MirrorCaptions } from "./captions";
import { MirrorClip, MIRROR_END } from "./mirror";
import { MirrorDevice, DEVICE_START, DEVICE_END } from "./device";
import { GhostDouble } from "./ghost";
import { PriceDesk } from "./desk";
import { Diagram } from "./diagram";
import { Chip, Mono } from "./atoms";
import {
  BEATS,
  HEADLINES,
  REASON_INDEX,
  REASON_TAGS,
  TOTAL,
  WORD_CUES,
} from "./words";

/**
 * RefinaMirrorReel — fifth composition.
 *
 * Same QOVES sage treatment as `RefinaProtocolReel` and `RefinaPreviewReel`
 * (docs/qoves-reel-spec.md); a different script, and a different opening.
 *
 * THE SPINE. You have already made this decision with your hands in a mirror —
 * so see it properly -> upload / choose / see it rendered -> three things
 * change (you stop guessing, you find out what you don't want, you decide
 * before anyone is selling) -> a preview, not a promise -> search Refina AI.
 *
 * WHAT IS NEW HERE, and why it is worth having a fifth composition rather than
 * re-cutting the fourth:
 *
 *  1. The opening is REAL FOOTAGE, not stills. `public/hero-clip.mp4` is a 10s
 *     bathroom-mirror selfie in which the hero performs the script's first five
 *     lines exactly — pulls at her temple, lifts her cheek with two fingers,
 *     holds it, lets go. The section is one continuous take, retimed so each
 *     action lands on the line that names it, with a dead freeze on "Held it
 *     there." See `mirror.tsx`.
 *  2. `athome` cuts back to the same take, settled, forty seconds later. The
 *     reel begins and ends in the same bathroom.
 *  3. The unstable double exposure (`ghost.tsx`) carries "your imagination" and
 *     then "hope / dread", and `photograph` kills it with one hard cut to a
 *     single sharp still. That edit is the argument of the whole section.
 *
 * TIMING IS GENERATED, AND IS CURRENTLY AN ESTIMATE. There is no voiceover for
 * this script yet. `docs/preview-review/gen-words-mirror.py` holds the script
 * as text and derives every cue frame, every word frame, every beat bound and
 * `TOTAL` from it — at a characters-per-second rate measured off the same
 * narrator's previous read. Nothing below is a hand-typed frame number: beats
 * are named, and the names resolve through `BEATS`.
 *
 * WHEN THE VOICEOVER ARRIVES: save it as `public/voiceover5.mp3`, re-run the
 * generator, and uncomment the <Audio> line below. The generator switches to
 * measured mode on its own, every cue moves to where the voice actually is, and
 * because the beat table and the gesture anchors both read from it, the
 * pictures move with the words. Re-render; nothing here needs editing.
 *
 * GOTCHA (spec §14): useCurrentFrame() inside a <Sequence> is LOCAL. Every
 * `from`/`at` passed to a primitive inside a beat is sequence-local. Only
 * WORD_CUES, <Sfx> and the beat table itself use absolute composition frames.
 */

const FPS = 30;

/* Hero geometry. hero2-before / hero2-after are the originals at their native
   1792x2400 — only the flat backdrop was recoloured to the stage sage, no
   resize and no reposition. Their head tops match within 1px. Every placement
   is derived from headFrac, never from a typed percentage (invariant A). */
const HERO_FRAC = 0.0308; // hero2-*: head top y=74 of 2400
const HERO_SIZE = 80;
const HERO_TOP = 500;

type Beat = keyof typeof BEATS;

const len = (k: Beat) => BEATS[k][1] - BEATS[k][0];

/** Exact bounds, for beats whose plate is mode="cut" and so never travels. */
const atExact = (k: Beat) => ({
  from: BEATS[k][0],
  durationInFrames: len(k),
});

/**
 * Bounds for a transitioning plate. `from` is deliberately unchanged — the
 * start frame is pinned to the voiceover and every beat-local `from={…}` inside
 * depends on it. Only the tail is extended, so the outgoing plate keeps
 * travelling for T frames into the next beat and the two overlap instead of
 * leaving an empty frame between them.
 */
const atPlate = (k: Beat) => ({
  from: BEATS[k][0],
  durationInFrames: len(k) + T,
});

/**
 * The floor below which x264 discards a camera move: a push has to clear about
 * 0.3px/frame at the frame edge, which is `beatFrames / 1500`. A 5% push over
 * 200 frames is invisible and has been shipped by mistake twice. Asking for the
 * floor in code rather than in a comment means a beat cannot get longer without
 * its push growing to match.
 */
const push = (k: Beat, want: number) => Math.max(want, len(k) / 1500 + 0.02);

/* ── shared bits ──────────────────────────────────────────────────── */

/**
 * The App Store disclaimer, verbatim. `fitTextOnNLines` picks the largest size
 * that still fits the box in the given number of lines, so changing the wording
 * cannot silently overflow.
 */
const DISCLAIMER =
  "Refina provides educational visualizations only and does not constitute " +
  "medical advice. Outcomes vary by individual; consult a qualified " +
  "healthcare professional before any procedure.";

const FittedDisclaimer: React.FC = () => {
  const { fontSize, lines } = fitTextOnNLines({
    text: DISCLAIMER,
    maxLines: 5,
    maxBoxWidth: 812,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    letterSpacing: "1.1px",
    maxFontSize: 27,
  });
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize,
        letterSpacing: 1.1,
        lineHeight: 1.8,
        color: "rgba(255,255,255,0.97)",
        textAlign: "center",
      }}
    >
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
};

/** One of the surgeon's before/afters, dropped on the pile. */
const GalleryCard: React.FC<{
  left: string;
  right?: string;
  from: number;
  x: number;
  y: number;
  rot: number;
  w?: number;
  h?: number;
}> = ({ left, right, from, x, y, rot, w = 430, h = 330 }) => (
  <Drop from={from} damping={12} style={{ position: "absolute", left: x, top: y }}>
    <div
      style={{
        transform: `rotate(${rot}deg)`,
        width: w,
        height: h,
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
        padding: 8,
        boxShadow: "0 20px 46px rgba(24,38,42,0.34)",
      }}
    >
      <div style={{ display: "flex", gap: 4, width: "100%", height: "100%" }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative", background: PANEL }}>
          <Img
            src={portrait(left)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%" }}
          />
        </div>
        {right ? (
          <div style={{ flex: 1, overflow: "hidden", position: "relative", background: PANEL }}>
            <Img
              src={portrait(right)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%" }}
            />
          </div>
        ) : null}
      </div>
    </div>
  </Drop>
);

const PHONE_W = 404;

const Phone: React.FC<{ children: React.ReactNode; from?: number }> = ({
  children,
  from = 0,
}) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <SlideIn from={from} dir="up" distance={110} dur={20}>
      <div
        style={{
          width: PHONE_W,
          height: PHONE_W * 2.318,
          borderRadius: 40,
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.85)",
          background: "#fff",
          boxShadow: "0 26px 60px rgba(30,45,50,0.25)",
        }}
      >
        {children}
      </div>
    </SlideIn>
  </AbsoluteFill>
);

const Screen: React.FC<{ name: string; pos?: string }> = ({ name, pos = "50% 2%" }) => (
  <Img
    src={screen(name)}
    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }}
  />
);

/** A centred verdict tag. VerdictTag positions itself absolutely from `style`,
    and its width depends on its text, so centring is done by a wrapper that
    can use flex rather than by guessing a left offset — the callout labels
    running off frame were exactly this bug measured instead of estimated. */
const CentredVerdict: React.FC<{
  text: string;
  good?: boolean;
  from?: number;
  top: number;
}> = ({ text, good = true, from = 0, top }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
    }}
  >
    {/* VerdictTag sets 21px mono, which is a detail label on a 1080-wide
        frame — too quiet to carry a one-second beat on its own. Scaled here
        rather than in the atom, which the approved cuts share. */}
    <div style={{ position: "relative", transform: "scale(1.5)" }}>
      <VerdictTag text={text} good={good} from={from} style={{ position: "relative" }} />
    </div>
  </div>
);

const Sfx: React.FC<{
  name: string;
  at: number;
  volume?: number;
  ext?: string;
  dur?: number;
}> = ({ name, at: a, volume = 0.2, ext = "wav", dur = 40 }) => (
  <Sequence from={a} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${name}.${ext}`)} volume={volume} />
  </Sequence>
);

/* ── the reel ─────────────────────────────────────────────────────── */

export const RefinaMirrorVideo: React.FC = () => {
  return (
    <Stage>
      {/* NO VOICEOVER YET. Record the script in
          docs/preview-review/gen-words-mirror.py, save it as
          public/voiceover5.mp3, re-run the generator, and uncomment:

          <Audio src={staticFile("voiceover5.mp3")} />                        */}

      <Sfx name="riser" at={BEATS.held[0]} volume={0.4} ext="mp3" dur={110} />
      <Sfx name="thud" at={BEATS.decision[0]} volume={0.45} /> {/* hard cut */}
      <Sfx name="whoosh" at={BEATS.built[0]} volume={0.3} /> {/* phone arrives */}
      <Sfx name="click" at={BEATS.step1[0] + 30} volume={0.5} /> {/* upload tap */}
      <Sfx name="click" at={BEATS.step2[0] + 28} volume={0.5} /> {/* procedure tap */}
      <Sfx name="tick" at={BEATS.step3[0] + 20} volume={0.4} /> {/* slider grabbed */}
      <Sfx name="whoosh" at={BEATS.notdiagram[0]} volume={0.26} />
      <Sfx name="whoosh" at={BEATS.notgallery[0]} volume={0.26} />
      <Sfx name="thud" at={BEATS.yourface[0]} volume={0.42} />
      <Sfx name="thud" at={BEATS.three[0]} volume={0.36} />
      <Sfx name="thud" at={BEATS.photograph[0]} volume={0.45} /> {/* it settles */}
      <Sfx name="tick" at={BEATS.r2[0] + 20} volume={0.35} />
      <Sfx name="whoosh" at={BEATS.rulingout[0] + 20} volume={0.28} /> {/* ruled out */}
      <Sfx name="whoosh" at={BEATS.desk[0]} volume={0.32} /> {/* the price list */}
      <Sfx name="thud" at={BEATS.disclaimer[0]} volume={0.34} />
      <Sfx name="click" at={BEATS.cta[1] - 8} volume={0.55} />

      {/* ── 1-5. the mirror — ONE take, retimed, frozen on "Held it there" ─
          Mounted at composition frame 0, so this Sequence's local clock and
          the reel's absolute clock are the same — which is what lets
          mirror.tsx address its anchors by beat name. */}
      <Sequence durationInFrames={MIRROR_END}>
        <Plate len={MIRROR_END} mode="cut">
          <MirrorClip />
        </Plate>
      </Sequence>

      {/* ── 6. that is the whole decision — hard cut out of the footage ─── */}
      <Sequence {...atExact("decision")}>
        <Plate len={len("decision")} mode="cut">
          <Camera dur={len("decision")} move="in" amount={push("decision", 0.07)}>
            <Portrait
              name="hero2-before"
              size={HERO_SIZE}
              headTop={HERO_TOP}
              headFrac={HERO_FRAC}
              from={-14}
            />
          </Camera>
        </Plate>
      </Sequence>

      {/* ── 7. …and finish in your imagination ───────────────────────────
          The guess: two true exposures of her that will not resolve. */}
      <Sequence {...atPlate("imagination")}>
        <Plate len={len("imagination")} dir="down">
          <GhostDouble
            base="hero2-before"
            ghost="hero2-after"
            size={HERO_SIZE}
            headTop={HERO_TOP}
            headFrac={HERO_FRAC}
            drift={34}
            period={104}
          />
        </Plate>
      </Sequence>

      {/* ── 8-11. the product — one phone, screens change inside it ────── */}
      <Sequence
        from={DEVICE_START}
        durationInFrames={DEVICE_END - DEVICE_START + T}
      >
        {/* t={9}, not the default 25: `notdiagram` is only 30 frames long and
            a 25-frame exit left the phone covering the diagram for 5/6 of it.
            Measured in the v1 render. */}
        <Plate len={DEVICE_END - DEVICE_START} dir="up" t={9}>
          <MirrorDevice />
        </Plate>
      </Sequence>

      {/* 9 — upload one photo. Cursor coordinates are the preview reel's,
             which land on the same capture in a device of the same width at
             the same offset; nothing about the screen has moved. */}
      <Sequence {...atExact("step1")}>
        <Plate len={len("step1")} mode="cut">
          <StepPill n="1" from={4} style={{ left: 150, top: 470 }} />
          <Chip from={6} />
          <SwipeCursor fromX={800} fromY={1450} toX={610} toY={1244} start={8} travel={20} clickAt={30} />
        </Plate>
      </Sequence>

      {/* 10 — choose the procedure you're considering */}
      <Sequence {...atExact("step2")}>
        <Plate len={len("step2")} mode="cut">
          <StepPill n="2" from={2} style={{ left: 150, top: 470 }} />
          <Chip from={2} />
          {/* lands on Facelift (Rhytidectomy), the first row, once the list
              has settled */}
          <SwipeCursor fromX={780} fromY={1300} toX={548} toY={812} start={8} travel={18} clickAt={28} />
        </Plate>
      </Sequence>

      {/* 11 — and see it rendered on your own face */}
      <Sequence {...atExact("step3")}>
        <Plate len={len("step3")} mode="cut">
          <StepPill n="3" from={2} style={{ left: 150, top: 470 }} />
          <Chip from={2} />
        </Plate>
      </Sequence>

      {/* ── 12. not a diagram ───────────────────────────────────────────── */}
      <Sequence {...atExact("notdiagram")}>
        <Plate len={len("notdiagram")} mode="cut">
          <Diagram from={0} />
          <CentredVerdict text="NOT A DIAGRAM" good={false} from={13} top={1430} />
        </Plate>
      </Sequence>

      {/* ── 13. not a gallery ───────────────────────────────────────────── */}
      <Sequence {...atExact("notgallery")}>
        <Plate len={len("notgallery")} mode="cut">
          {/* strangers only — the hero's face never appears in a gallery card.

              The first two start BEFORE the beat does. Drop falls 240px from
              a spring, so at local 0 a card is still off the top of frame with
              zero opacity: measured, f733 (this beat's own first frame) was
              near-empty sage and the cut into it was invisible. Negative `from`
              means the cards are already arriving when the cut lands. */}
          <GalleryCard left="front-before" right="front-after" from={-6} x={44} y={600} rot={-10} w={400} h={300} />
          <GalleryCard left="flood-06b" right="flood-06a" from={-2} x={470} y={548} rot={8} w={400} h={300} />
          <GalleryCard left="celeb" from={3} x={128} y={960} rot={5} w={360} h={290} />
          <GalleryCard left="flood-05a" from={8} x={556} y={1000} rot={-7} w={360} h={290} />
          <CentredVerdict text="NOT A GALLERY" good={false} from={17} top={1430} />
        </Plate>
      </Sequence>

      {/* ── 14. your face ───────────────────────────────────────────────── */}
      <Sequence {...atExact("yourface")}>
        <Plate len={len("yourface")} mode="cut">
          <Portrait
            name="hero2-after"
            size={HERO_SIZE}
            headTop={HERO_TOP}
            headFrac={HERO_FRAC}
            from={0}
          />
          <Chip from={6} />
          <CentredVerdict text="YOUR FACE" good from={14} top={1440} />
        </Plate>
      </Sequence>

      {/* ── 15. three things change — the chapter card ──────────────────── */}
      <Sequence {...atPlate("three")}>
        <Plate len={len("three")} dir="down">
          <ReasonIndex items={REASON_INDEX} from={8} />
        </Plate>
      </Sequence>

      {/* ── 16. 1. you stop guessing ────────────────────────────────────── */}
      <Sequence {...atPlate("r1")}>
        <Plate len={len("r1")} dir="down">
          <Camera dur={len("r1")} move="in" amount={push("r1", 0.12)}>
            <Portrait
              name="hero2-before"
              size={HERO_SIZE}
              headTop={HERO_TOP}
              headFrac={HERO_FRAC}
              from={-14}
            />
          </Camera>
          {/* The questions the guess is actually made of. DrawnCallout measures
              its own label and picks the side that fits, so a longer question
              cannot run off frame. */}
          {/* Anchors sit ON her face, labels land OFF it. At x=706 the first
              label had only 42px of room to its right — under DrawnCallout's
              80px minimum — so it flipped left and printed across her eye.
              Pulled in to 640, which leaves 108px and lets it go right. */}
          <DrawnCallout label="still look like me?" x={640} y={890} side="right" from={34} />
          <DrawnCallout label="too much?" x={420} y={1050} side="left" from={72} />
          <DrawnCallout label="worth it?" x={660} y={1180} side="right" from={104} />
        </Plate>
      </Sequence>

      {/* ── 17. hope on a good day / dread on a bad one ─────────────────── */}
      <Sequence {...atExact("hopedread")}>
        <Plate len={len("hopedread")} mode="cut">
          <GhostDouble
            base="hero2-before"
            ghost="hero2-after"
            size={HERO_SIZE}
            headTop={HERO_TOP}
            headFrac={HERO_FRAC}
            drift={42}
            period={88}
            polariseAt={40}
            marks={[
              { text: "HOPE", side: "left", from: 6, y: 520 },
              { text: "DREAD", side: "right", from: 49, y: 1286 },
            ]}
          />
        </Plate>
      </Sequence>

      {/* ── 18. now it is just a photograph ─────────────────────────────── */}
      {/* Deliberately the stillest beat in the reel. It follows 3.4s of a face
          that would not hold still, and the whole point of the line is that
          this one does — so there is no <Camera> here and there should not be.
          motion.py will read it as frozen; that is the intended result, not a
          defect (see the skill's note on judging a cut). */}
      <Sequence {...atExact("photograph")}>
        <Plate len={len("photograph")} mode="cut">
          <Portrait
            name="hero2-after"
            size={HERO_SIZE}
            headTop={HERO_TOP}
            headFrac={HERO_FRAC}
            from={0}
          />
          <Chip from={8} />
          <Exit at={len("photograph") - 16} dir="down" distance={60}>
            <div style={{ position: "absolute", bottom: 300, left: 0, right: 0, textAlign: "center" }}>
              <Mono size={20}>JUST A PHOTOGRAPH</Mono>
            </div>
          </Exit>
        </Plate>
      </Sequence>

      {/* ── 19. 2. you find out what you don't want ─────────────────────── */}
      {/* atExact + noExit: the plate travels IN but never out, so the merged
          composite is still at exactly this geometry when `rulingout` redraws
          it. With atPlate it would slide away mid-hand-off and the seam would
          jump. */}
      <Sequence {...atExact("r2")}>
        <Plate len={len("r2")} dir="up" noExit>
          <ConvergePanels
            before="hero2-before"
            after="hero2-after"
            still={20}
            converge={40}
          />
          <Chip from={16} />
        </Plate>
      </Sequence>

      {/* ── 20. ruling a procedure out is an answer too ─────────────────── */}
      {/* mode="cut": picks the composite up at exactly the geometry beat 19
          left it, so the seam is continuous across the cut. The seam then
          sweeps right to ALL ORIGINAL — the preview taken back off her face,
          which is what ruling a procedure out looks like.

          No dock and no restore: `dockAt`/`restoreAt` are pushed past the end
          of the beat. The preview reel docks into a phone here because its
          line is "change your mind / change it back" — two opposite moves.
          This line is one move that stays made. */}
      <Sequence {...atExact("rulingout")}>
        <Plate len={len("rulingout")} mode="cut">
          <SwapScene
            before="hero2-before"
            after="hero2-after"
            switchAt={10}
            dockAt={9999}
            revertAt={18}
            restoreAt={9999}
            sweepDur={22}
          />
          <Chip from={2} />
          <CentredVerdict text="NOT FOR ME" good={false} from={46} top={1200} />
        </Plate>
      </Sequence>

      {/* ── 21. and it costs you nothing here ───────────────────────────── */}
      <Sequence {...atPlate("nocost")}>
        <Plate len={len("nocost")} dir="up">
          <Camera dur={len("nocost")} move="in" amount={push("nocost", 0.075)}>
            <Portrait
              name="hero2-before"
              size={HERO_SIZE}
              headTop={HERO_TOP}
              headFrac={HERO_FRAC}
              from={-14}
            />
          </Camera>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(to right, rgba(38,54,58,0.62) 0%, rgba(38,54,58,0.12) 62%, transparent 82%)",
            }}
          />
          <AnimatedCheckList
            items={[
              "No cost to looking",
              "Nothing here is permanent",
              "Rule out as many as you like",
            ]}
            from={10}
            step={20}
            x={92}
            y={1180}
            size={38}
          />
        </Plate>
      </Sequence>

      {/* ── 22. 3. you decide before anyone is selling to you ───────────── */}
      <Sequence {...atPlate("r3")}>
        <Plate len={len("r3")} dir="down">
          <Phone from={0}>
            <Screen name="your-result-after" />
          </Phone>
          <Chip from={6} />
          <Exit at={len("r3") - 18} dir="up" distance={40}>
            <div style={{ position: "absolute", top: 1476, left: 0, right: 0, textAlign: "center" }}>
              <Mono size={20}>NO ONE ELSE IN THE ROOM</Mono>
            </div>
          </Exit>
        </Plate>
      </Sequence>

      {/* ── 23. at home. on your own time. ──────────────────────────────── */}
      {/* Back to the bathroom, forty seconds later, released — the same take
          that opened the reel. Anchors are beat-local here, not absolute:
          this instance is mounted at BEATS.athome[0]. */}
      <Sequence {...atExact("athome")}>
        <Plate len={len("athome")} mode="cut">
          <MirrorClip
            /* Source 198 -> 214, which is exactly where the opening stopped:
               the reel returns to the mirror and picks the same take up where
               it left it. Not further — from about f216 she looks down and
               away, and on the line "At home. On your own time." that reads as
               defeated rather than unhurried. The v1 cut ran to f234 and did
               exactly that. 16 source frames over 56 makes this nearly a
               still, which is the point; the push supplies the movement. */
            anchors={[
              [0, 198],
              [len("athome"), 214],
            ]}
            push={[
              [0, 1.06],
              [len("athome"), 1],
            ]}
          />
        </Plate>
      </Sequence>

      {/* ── 24. …a price list and a waiting room ────────────────────────── */}
      {/* The only drawn beat, and the only cold white object, cutting straight
          out of her bathroom. Every figure on the card is redacted. */}
      <Sequence {...atPlate("desk")}>
        <Plate len={len("desk")} dir="up">
          <PriceDesk from={4} />
        </Plate>
      </Sequence>

      {/* ── 25. a preview, not a promise ────────────────────────────────── */}
      <Sequence {...atPlate("disclaimer")}>
        <Plate len={len("disclaimer")} dir="up">
          <AbsoluteFill
            style={{ alignItems: "center", justifyContent: "center", padding: "0 96px" }}
          >
            <SlideIn from={8} dir="up" distance={38} dur={20}>
              <div
                style={{
                  fontFamily: headlineStack,
                  fontWeight: 400,
                  fontSize: 64,
                  lineHeight: 1.3,
                  color: "#fff",
                  textAlign: "center",
                  maxWidth: 840,
                }}
              >
                Your surgeon determines your result.
              </div>
            </SlideIn>
            <div style={{ marginTop: 54 }}>
              <SlideIn from={40} dir="up" distance={26} dur={18}>
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.55)",
                    borderRadius: 18,
                    padding: "30px 36px",
                    maxWidth: 820,
                  }}
                >
                  <FittedDisclaimer />
                </div>
              </SlideIn>
            </div>
          </AbsoluteFill>
        </Plate>
      </Sequence>

      {/* ── 26. before you spend another year imagining it ──────────────── */}
      <Sequence {...atPlate("imagine")}>
        <Plate len={len("imagine")} dir="down">
          <Camera dur={len("imagine")} move="in" amount={push("imagine", 0.13)}>
            <Portrait
              name="hero2-after"
              size={HERO_SIZE}
              headTop={HERO_TOP}
              headFrac={HERO_FRAC}
              from={-14}
            />
          </Camera>
        </Plate>
      </Sequence>

      {/* ── 27. search Refina AI on the App Store ───────────────────────── */}
      <Sequence {...atExact("cta")}>
        <Plate len={len("cta")} mode="cut" noExit>
          <SearchBar query="Refina AI" from={4} typeFrom={14} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ marginTop: 190 }}>
              <SlideIn from={34} dir="up" distance={22} dur={16}>
                <Mono size={22}>ON THE APP STORE</Mono>
              </SlideIn>
            </div>
          </AbsoluteFill>
          <SwipeCursor fromX={760} fromY={1180} toX={706} toY={952} start={34} travel={22} clickAt={56} />
        </Plate>
      </Sequence>

      {/* ── headline track: slow, one per section, generated with the script ─ */}
      {HEADLINES.map((h) => (
        <Sequence key={h.f} from={h.f} durationInFrames={h.t - h.f}>
          <SectionHeadline
            lines={[...h.lines]}
            len={h.t - h.f}
            from={4}
            italicSecond={h.italicSecond}
          />
        </Sequence>
      ))}

      {/* the chapter card's own pill sits in the gap the headline track leaves */}
      <Sequence {...atExact("three")}>
        <PreviewPill text="Three things change" from={4} />
      </Sequence>

      {/* accumulating claims, one per reason, held across each section */}
      <Sequence from={BEATS.r1[0]} durationInFrames={BEATS.photograph[1] - BEATS.r1[0]}>
        <TagStack labels={REASON_TAGS} active={1} from={18} top={352} />
      </Sequence>
      <Sequence from={BEATS.r2[0]} durationInFrames={BEATS.nocost[1] - BEATS.r2[0]}>
        <TagStack labels={REASON_TAGS} active={2} from={18} top={352} />
      </Sequence>
      <Sequence from={BEATS.r3[0]} durationInFrames={BEATS.desk[1] - BEATS.r3[0]}>
        <TagStack labels={REASON_TAGS} active={3} from={18} top={352} />
      </Sequence>

      <MirrorCaptions cues={WORD_CUES} />
    </Stage>
  );
};

export const RefinaMirrorReel: React.FC = () => (
  <Composition
    id="RefinaMirrorReel"
    component={RefinaMirrorVideo}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{}}
  />
);

export const MIRROR_TOTAL = TOTAL;
export const MIRROR_SAGE = SAGE;
