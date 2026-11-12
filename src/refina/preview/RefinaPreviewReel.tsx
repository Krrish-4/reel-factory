import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { fitTextOnNLines } from "@remotion/layout-utils";
import { headlineStack } from "../../fonts";
import { DEVICE_END, DeviceSession } from "./device";
import { Plate, T } from "./plate";
import { SwapScene } from "./swap";
import { PreviewCaptions } from "./captions";
import {
  Drop,
  DrawnCallout,
  ConvergePanels,
  PreviewPill,
  ReasonIndex,
  SectionHeadline,
  SwipeCursor,
  TagStack,
} from "./draw";
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

/**
 * RefinaPreviewReel — fourth composition.
 *
 * Same QOVES sage treatment as `RefinaProtocolReel` (see docs/qoves-reel-spec.md);
 * different script. The spine here is "you are judging by SOMEONE ELSE'S
 * before-and-afters -> see it on yours", then three numbered reasons.
 *
 * Timing is derived, not guessed: `public/voiceover4.mp3` (75.86s, three parts
 * joined) was run through ffmpeg silencedetect, giving 38 speech segments, and
 * the script's words were distributed across them proportionally to segment
 * duration. Every CUE below starts on a real phrase boundary.
 *
 * That derivation was re-verified against the audio by
 * `docs/preview-review/check-sync.py`, `check-rate.py` and `check-words.py`:
 * 26 of 33 cues sit within half a frame of a measured onset. Two groups did
 * not and were corrected:
 *
 *   - The first two cues split a 16-frame slot four ways, so the opening line
 *     never reached full opacity — its last word arrived at f27 while the
 *     fade-out began at f26. They now span the whole measured [0.00, 2.67s]
 *     phrase, split at its proportional boundary.
 *   - Words were metered evenly across 85% of each cue's SLOT, but a slot runs
 *     to the next cue — through the pause after the phrase. Words were therefore
 *     paced slower than the speech and drifted further behind with every word.
 *     This is why correcting cue starts alone barely changed anything: the drift
 *     is inside the caption. Word frames are now measured (`preview/words.ts`).
 *   - "We think you should be able / to see it on yours" is spoken at
 *     [6.40, 8.62s] (a 1.08x-median fit; the alternative reading needs 1.63x,
 *     which no one talks at), but the captions ran from 4.67s. For 1.7s you
 *     heard one sentence and read another. They now start at f188 (leading the phrase by 4 frames).
 *
 * CONSEQUENCE: the `yours` beat starts at f140 and no longer has a cue on that
 * frame. That is deliberate — the flick to her video leads the line rather than
 * landing on it, and moving the beat would shift every beat-local `from={…}`
 * inside it. Beat starts are pinned to the voiceover; cue starts are pinned to
 * the words. Those are usually the same frame, and here they are not.
 *
 * GOTCHA (spec §14): useCurrentFrame() inside a <Sequence> is LOCAL. Every
 * `from`/`at` passed to a primitive inside a beat is sequence-local. Only the
 * WORD_CUES table and <Sfx> use absolute composition frames.
 */

const FPS = 30;
const TOTAL = 2276; // 75.86s — matches voiceover4.mp3 exactly

/* Hero geometry. hero2-before / hero2-after are the originals at their native
   1792x2400 — only the flat backdrop was recoloured to the stage sage, no
   resize and no reposition. Their head tops match within 1px. */
const HERO_FRAC = 0.0308;   // hero2-*: head top y=74 of 2400
/* HERO_W/HERO_H went with FaceCrop — the swap beat no longer crops in source
   pixels, it reuses the composite geometry in preview/swap.tsx. */
const HERO_SIZE = 80;
const HERO_TOP = 500;

/** The reasons, in the words their own section headlines use — this beat is a
    table of contents, so it has to match what follows. */
const REASON_INDEX = [
  "It's your face",
  "You can explore",
  "An easier conversation",
] as const;

/** Accumulating claims, one per reason — they persist once landed. */
const REASON_TAGS = [
  "Your own face",
  "Free to explore",
  "A better consultation",
] as const;

/* The caption script and its per-word timings now live in `words.ts`, generated
   by `docs/preview-review/gen-words.py` from the voiceover. The cue list is the
   generator's CUES table — edit it there and regenerate, so the words and their
   measured frames can never drift apart. Beat bounds below stay literal. */

/* Beat boundaries, all derived from the cue frames above. */
const B_ = {
  hook: [0, 140],
  yours: [140, 289],
  built: [289, 337],
  step1: [337, 389],
  step2: [389, 430],
  step3: [430, 599],
  procedures: [599, 692],
  reasons: [692, 768],
  r1: [768, 1001],
  notyou: [1001, 1097],
  r2: [1097, 1288],
  swap: [1288, 1437],
  nocost: [1437, 1550],
  r3: [1550, 1667],
  folder: [1667, 1855],
  knowing: [1855, 1929],
  disclaimer: [1929, 2100],
  imagine: [2100, 2193],
  cta: [2193, 2276],
} as const;

/**
 * Beat bounds for a transitioning plate. `from` is deliberately unchanged — the
 * start frame is pinned to the voiceover and every beat-local `from={…}` inside
 * depends on it. Only the tail is extended, so the outgoing plate keeps
 * travelling for T frames into the next beat and the two overlap instead of
 * leaving an empty frame between them.
 */
/** Exact bounds, for beats whose plate is mode="cut" and so never travels. */
const atExact = (k: keyof typeof B_) => ({
  from: B_[k][0],
  durationInFrames: B_[k][1] - B_[k][0],
});

const atPlate = (k: keyof typeof B_) => ({
  from: B_[k][0],
  durationInFrames: B_[k][1] - B_[k][0] + T,
});
const len = (k: keyof typeof B_) => B_[k][1] - B_[k][0];

/* ── shared bits ──────────────────────────────────────────────────── */

const Mono: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 19, style }) => (
  <div
    style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: size,
      letterSpacing: 2.4,
      color: "rgba(255,255,255,0.93)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Persistent compliance chip on product beats. */
const Chip: React.FC<{ from?: number }> = ({ from = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - from, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 92,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.5)",
          borderRadius: 30,
          padding: "9px 22px",
        }}
      >
        <Mono size={17}>AI PREVIEW · NOT MEDICAL ADVICE</Mono>
      </div>
    </div>
  );
};

/**
 * The App Store disclaimer, verbatim. `fitTextOnNLines` picks the largest size
 * that still fits the box in the given number of lines, so changing the wording
 * cannot silently overflow — the same class of bug measureText fixed for the
 * callout labels.
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

/* SwapDeck removed. It cross-faded hero2-before against hero2-after with a
   fixed jaw ring, which could never show "try a different procedure" — the
   per-procedure renders were of the previous hero. `preview/swap.tsx` carries
   that line with a procedure rail and a region ring instead, and keeps the
   merged seam continuous from the beat before. */
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
      <div style={{ display: "flex", gap: 4, width: "100%", height: "100%", position: "relative" }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative", background: PANEL }}>
          <Img src={portrait(left)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%" }} />
          {right ? (
            <div style={{ position: "absolute", left: 6, top: 6 }}>
              <Mono size={13} style={{ color: "rgba(255,255,255,0.95)" }}>BEFORE</Mono>
            </div>
          ) : null}
        </div>
        {right ? (
          <div style={{ flex: 1, overflow: "hidden", position: "relative", background: PANEL }}>
            <Img src={portrait(right)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%" }} />
            <div style={{ position: "absolute", right: 6, top: 6 }}>
              <Mono size={13} style={{ color: "rgba(255,255,255,0.95)" }}>AFTER</Mono>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  </Drop>
);

/** Two panels side by side — original vs preview. */
/* ComparePanels removed — replaced by ConvergePanels in draw.tsx. It cropped
   the hero's crown off (image at height 165% with translateY(-16%) showed
   16%-76.6% of a source whose head starts at 3.08%) and it could not hand a
   seam to the next beat. PanelArrow went with it: an arrow between two panels
   stops describing anything once they join into one face. */

const Phone: React.FC<{
  children: React.ReactNode;
  width?: number;
  from?: number;
}> = ({ children, width = 404, from = 0 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <SlideIn from={from} dir="up" distance={110} dur={20}>
      <div
        style={{
          width,
          height: width * 2.318,
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

export const RefinaPreviewVideo: React.FC = () => {
  return (
    <Stage>
      <Audio src={staticFile("voiceover4.mp3")} />

      <Sfx name="riser" at={96} volume={0.45} ext="mp3" dur={130} />
      <Sfx name="thud" at={140} volume={0.45} /> {/* she lands */}
      <Sfx name="whoosh" at={289} volume={0.3} /> {/* phone materialises */}
      <Sfx name="click" at={372} volume={0.5} /> {/* upload tap */}
      <Sfx name="click" at={416} volume={0.5} /> {/* procedure tap */}
      <Sfx name="tick" at={470} volume={0.4} /> {/* slider grabbed */}
      <Sfx name="whoosh" at={599} volume={0.28} /> {/* list scrolls */}
      <Sfx name="thud" at={768} volume={0.4} /> {/* reason 1 */}
      <Sfx name="thud" at={1001} volume={0.42} /> {/* cut back to her */}
      <Sfx name="tick" at={1173} volume={0.35} /> {/* compare */}
      <Sfx name="whoosh" at={1288} volume={0.26} />
      <Sfx name="whoosh" at={1320} volume={0.26} />
      <Sfx name="whoosh" at={1365} volume={0.26} />
      <Sfx name="whoosh" at={1667} volume={0.3} /> {/* folder spills */}
      <Sfx name="thud" at={1929} volume={0.36} /> {/* disclaimer */}
      <Sfx name="click" at={2258} volume={0.55} /> {/* search click */}

      {/* One device for the whole first third. Screens change inside it; the
          beats below keep only their overlays. */}
      <Sequence  durationInFrames={DEVICE_END + T}>
        <Plate len={DEVICE_END} dir="up" noEnter>
          <DeviceSession />
        </Plate>
      </Sequence>

      {/* ── 1. hook — other people's results ───────────────────────── */}
      <Sequence {...atExact("hook")}>
        <Plate len={len("hook")} mode="cut">
          <Exit at={len("hook") - 16} dir="down" distance={70}>
            {/* 300, not 240 — at 240 it lands on the running caption's line */}
            <div style={{ position: "absolute", bottom: 300, left: 0, right: 0, textAlign: "center" }}>
              <Mono size={19}>OTHER PEOPLE'S RESULTS</Mono>
            </div>
          </Exit>
        </Plate>
      </Sequence>

      {/* ── 2. yours — hard cut, she lands alone ───────────────────── */}
      {/* the device carries this beat entirely — see device.tsx */}

      {/* ── 3. built ───────────────────────────────────────────────── */}
      {/* the device carries this beat entirely — see device.tsx */}

      {/* ── 4. step 1 — upload one photo ───────────────────────────── */}
      <Sequence {...atExact("step1")}>
        <Plate len={len("step1")} mode="cut">
          <StepPill n="1" from={4} style={{ left: 150, top: 470 }} />
          <Chip from={6} />
          <SwipeCursor fromX={800} fromY={1450} toX={610} toY={1244} start={10} travel={22} clickAt={35} />
        </Plate>
      </Sequence>

      {/* ── 5. step 2 — choose a procedure ─────────────────────────── */}
      <Sequence {...atExact("step2")}>
        <Plate len={len("step2")} mode="cut">
          <StepPill n="2" from={2} style={{ left: 150, top: 470 }} />
          <Chip from={2} />
          {/* lands on Facelift (Rhytidectomy), the first procedure row, after
              the list has settled */}
          <SwipeCursor fromX={780} fromY={1300} toX={548} toY={812} start={10} travel={18} clickAt={30} />
        </Plate>
      </Sequence>

      {/* ── 6. step 3 — see the preview ────────────────────────────── */}
      <Sequence {...atExact("step3")}>
        <Plate len={len("step3")} mode="cut">
          <StepPill n="3" from={2} style={{ left: 150, top: 470 }} />
          <Chip from={2} />
        </Plate>
      </Sequence>

      {/* ── 7. procedures — the real list ──────────────────────────── */}
      <Sequence {...atExact("procedures")}>
        <Plate len={len("procedures")} mode="cut">
          <Chip from={2} />
        </Plate>
      </Sequence>

      {/* ── 8. reasons — the chapter card for the next 40 seconds ─── */}
      <Sequence {...atPlate("reasons")}>
        <Plate len={len("reasons")} dir="down" >
          {/* <Pips> is gone: three 46px circles, three outlined pills and a pill
              headline were four small objects competing in one empty frame, and
              the index numbers the reasons itself. This was Pips' only use in
              the reel, so the import goes with it — the numbered SectionHeadline
              on each reason beat ("1. It's your face") already carries position. */}
          <ReasonIndex items={REASON_INDEX} from={8} />
        </Plate>
      </Sequence>

      {/* ── 9. reason 1 — a stranger's face, annotated ─────────────── */}
      <Sequence {...atPlate("r1")}>
        <Plate len={len("r1")} dir="down" >
          <Camera dur={len("r1")} move="in" amount={0.15}>
            <Portrait name="sage-stranger" size={78} headTop={520} headFrac={0.0742} from={-14} />
          </Camera>
          {/* Leader lengths are measured, not guessed — see MeasuredCallout.
              "not your …" reinforces the argument the caption is making rather
              than repeating it word for word. */}
          <DrawnCallout label="not your bone structure" x={699} y={930} side="right" from={62} />
          <DrawnCallout label="not your skin" x={356} y={1010} side="left" from={141} />
          <DrawnCallout label="not your starting point" x={680} y={1160} side="right" from={181} />
          {/* VerdictTag renders its own ✗/✓ from `good` — do not repeat it here. */}
          <VerdictTag text="NOT YOUR FACE" good={false} from={200} style={{ left: 92, top: 1486 }} />
        </Plate>
      </Sequence>

      {/* ── 10. none of it tells you — hard cut back to her ────────── */}
      <Sequence {...atExact("notyou")}>
        <Plate len={len("notyou")} mode="cut">
          <Camera dur={len("notyou")} move="in" amount={0.065}>
            <Portrait name="hero2-before" size={HERO_SIZE} headTop={HERO_TOP} headFrac={HERO_FRAC} from={-14} />
          </Camera>
          <VerdictTag text="YOUR FACE" good from={16} style={{ left: 96, top: 1500 }} />
        </Plate>
      </Sequence>

      {/* ── 11. reason 2 — two panels converge into one split face ── */}
      {/* atExact + noExit: the plate travels IN but never out. With atPlate it
          ran 25 frames past the beat and slid the merged face up off the top
          while the swap beat was already drawing its own copy underneath —
          two hero composites on screen at once, and the seam hand-off ruined. */}
      <Sequence {...atExact("r2")}>
        <Plate len={len("r2")} dir="up" noExit>
          {/* The old ComparePanels cropped her badly: the image was set to
              height 165% with translateY(-16%), which showed 16%-76.6% of the
              source while her head starts at 3.08% — the crown was cut off by
              about 310 source px. ConvergePanels frames from the measured
              headFrac instead, so the crop cannot drift off the top again.

              No <Camera> any more. It was there because the panels were static
              and the beat needed some motion; the converge now supplies it, and
              a zoom on top would mean the composite is mid-scale when the next
              beat has to pick it up at exactly this geometry.

              Held apart for 76 frames so the two faces read as two, then joined
              over 40 — the merge lands on "compare ... side by side" (f1173)
              and the split face holds for the rest of the beat. */}
          <ConvergePanels
            before="hero2-before"
            after="hero2-after"
            still={76}
            converge={40}
          />
          <Chip from={16} />
        </Plate>
      </Sequence>

      {/* ── 12. swap — rail, then dock into the phone ─────────────── */}
      {/* mode="cut": this beat picks the merged composite up at exactly the
          geometry beat 11 left it at, so the seam is continuous. A travelling
          plate would slide the face away and break that hand-off. */}
      <Sequence {...atExact("swap")}>
        <Plate len={len("swap")} mode="cut">
          {/* Beat starts f1288. Local frames map to the three spoken lines:
              "Try a different procedure" f1288 -> local 0   (rail in, selection
                  moves to Upper Blepharoplasty at local 12, ring to the eyelids)
              "Change your mind"         f1320 -> local 32  (docks local 30-48,
                  then the seam sweeps right to the ORIGINAL)
              "Change it back"           f1365 -> local 77  (seam sweeps back
                  left to the PREVIEW at local 80) */}
          <SwapScene
            before="hero2-before"
            after="hero2-after"
            switchAt={12}
            dockAt={30}
            dockDur={18}
            revertAt={48}
            restoreAt={80}
          />
          <Chip from={2} />
        </Plate>
      </Sequence>

      {/* ── 13. no cost to looking ─────────────────────────────────── */}
      <Sequence {...atPlate("nocost")}>
        <Plate len={len("nocost")} dir="up" >
          <Camera dur={len("nocost")} move="in" amount={0.075}>
            <Portrait name="hero2-before" size={HERO_SIZE} headTop={HERO_TOP} headFrac={HERO_FRAC} from={-14} />
          </Camera>
          <AbsoluteFill style={{ background: "linear-gradient(to right, rgba(38,54,58,0.62) 0%, rgba(38,54,58,0.12) 62%, transparent 82%)" }} />
          <AnimatedCheckList
            items={["No cost to looking", "Nothing is permanent", "Change it as often as you like"]}
            from={12}
            step={22}
            x={92}
            y={1180}
            size={38}
          />
        </Plate>
      </Sequence>

      {/* ── 14. reason 3 ───────────────────────────────────────────── */}
      <Sequence {...atPlate("r3")}>
        <Plate len={len("r3")} dir="down" >
          {/* Was 3.9s of blank sage — the emptiest beat in the reel (content 4.2)
              and it made the cut into `folder` invisible. Her preview holds here,
              so the clutter that follows lands as a contrast. */}
          <Camera dur={len("r3")} move="in" amount={0.08}>
            <Portrait
              name="hero2-after"
              size={HERO_SIZE}
              headTop={HERO_TOP}
              headFrac={HERO_FRAC}
              from={-14}
            />
          </Camera>
          <Exit at={len("r3") - 18} dir="up" distance={40}>
            <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center" }}>
              <Mono size={20}>WHAT YOU ACTUALLY WANT</Mono>
            </div>
          </Exit>
        </Plate>
      </Sequence>

      {/* ── 15. folder — other people's photos spill in ────────────── */}
      <Sequence {...atPlate("folder")}>
        <Plate len={len("folder")} dir="up" >
          <GalleryCard left="front-before" right="front-after" from={8} x={40} y={640} rot={-11} w={400} h={300} />
          <GalleryCard left="flood-06b" right="flood-06a" from={22} x={470} y={560} rot={8} w={400} h={300} />
          <GalleryCard left="celeb" from={36} x={120} y={980} rot={5} w={360} h={290} />
          <GalleryCard left="front-after" from={50} x={560} y={1020} rot={-7} w={360} h={290} />
          <GalleryCard left="flood-05a" from={64} x={300} y={1290} rot={3} w={360} h={280} />
          <Exit at={len("folder") - 20} dir="down" distance={90}>
            <div style={{ position: "absolute", bottom: 300, left: 0, right: 0, textAlign: "center" }}>
              <Mono size={18}>A FOLDER OF OTHER PEOPLE</Mono>
            </div>
          </Exit>
        </Plate>
      </Sequence>

      {/* ── 16. knowing — one clean answer ─────────────────────────── */}
      <Sequence {...atPlate("knowing")}>
        <Plate len={len("knowing")} dir="down" >
          <Phone from={0} width={392}>
            <Screen name="your-result-after" />
          </Phone>
          <Chip from={6} />
        </Plate>
      </Sequence>

      {/* ── 17. disclaimer ─────────────────────────────────────────── */}
      <Sequence {...atPlate("disclaimer")}>
        <Plate len={len("disclaimer")} dir="up" >
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 96px" }}>
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

      {/* ── 18. imagine ────────────────────────────────────────────── */}
      <Sequence {...atPlate("imagine")}>
        <Plate len={len("imagine")} dir="down" >
          <Camera dur={len("imagine")} move="in" amount={0.075}>
            <Portrait name="hero2-after" size={HERO_SIZE} headTop={HERO_TOP} headFrac={HERO_FRAC} from={-14} />
          </Camera>
        </Plate>
      </Sequence>

      {/* ── 19. CTA ────────────────────────────────────────────────── */}
      <Sequence {...atExact("cta")}>
        <Plate len={len("cta")} mode="cut" noExit>
          <SearchBar query="Refina AI" from={4} typeFrom={16} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ marginTop: 190 }}>
              <SlideIn from={40} dir="up" distance={22} dur={16}>
                <Mono size={22}>ON THE APP STORE</Mono>
              </SlideIn>
            </div>
          </AbsoluteFill>
          <SwipeCursor fromX={760} fromY={1180} toX={706} toY={952} start={40} travel={22} clickAt={65} />
        </Plate>
      </Sequence>

      {/* ── headline track: slow, one per section ──────────────────── */}
      <Sequence  durationInFrames={140}>
        <SectionHeadline lines={["Someone else's", "before-and-afters"]} len={140} from={4} />
      </Sequence>
      <Sequence from={140} durationInFrames={552}>
        <SectionHeadline lines={["See it on", "your face"]} len={552} from={4} />
      </Sequence>
      <Sequence from={692} durationInFrames={76}>
        <PreviewPill text="Three reasons this matters" from={4} />
      </Sequence>
      <Sequence from={768} durationInFrames={329}>
        <SectionHeadline lines={["1. It's your face"]} len={329} from={4} />
        <TagStack labels={REASON_TAGS} active={1} from={18} />
      </Sequence>
      <Sequence from={1097} durationInFrames={453}>
        <SectionHeadline lines={["2. You can explore"]} len={453} from={4} />
        <TagStack labels={REASON_TAGS} active={2} from={18} />
      </Sequence>
      <Sequence from={1550} durationInFrames={379}>
        <SectionHeadline lines={["3. An easier conversation"]} len={379} from={4} />
        <TagStack labels={REASON_TAGS} active={3} from={18} />
      </Sequence>
      <Sequence from={1929} durationInFrames={264}>
        <SectionHeadline lines={["A preview,", "not a promise"]} len={264} from={4} italicSecond />
      </Sequence>

      <PreviewCaptions />
    </Stage>
  );
};

export const RefinaPreviewReel: React.FC = () => (
  <Composition
    id="RefinaPreviewReel"
    component={RefinaPreviewVideo}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{}}
  />
);

export const PREVIEW_TOTAL = TOTAL;
export const PREVIEW_SAGE = SAGE;
