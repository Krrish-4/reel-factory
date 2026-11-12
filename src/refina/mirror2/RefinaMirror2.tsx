import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { SAGE, Stage, portrait, screen } from "../protocol/atoms";
import { Camera } from "../protocol/motion";
import { MirrorClip } from "../mirror/mirror";
import { ConvergePanels, SectionHeadline } from "../preview/draw";
import { Plate } from "../preview/plate";
import { MirrorCaptions } from "./captions";
import {
  CardCarousel,
  Collage,
  DimensionCallout,
  FaceMesh,
  MetricSlider,
  ScanOverlay,
  StaggerGrid,
  TypewriterInput,
} from "../kit";
import { sansFont } from "../../fonts";
import { B, TOTAL } from "./words";

/**
 * "The Mirror" — second cut, rebuilt against the measured corpus.
 *
 * The first cut of this script measured as a near-copy of RefinaPreviewReel,
 * and the numbers say why. Against the 21-reel corpus median it ran 70.2%
 * frozen (corpus 50.5%), 10.0% continuous motion (27.3%), and held a headline
 * on screen for 92.1% of frames against the corpus's 46.3%.
 *
 * That last figure is the copy signature: nine frames in ten opened with the
 * same persistent object in the same place. The treatment is unchanged here —
 * same sage stage, same faces — so the difference comes from construction:
 *
 *   1. HEADLINES IN BURSTS. Each section states itself and clears. Nothing is
 *      pinned to the top of the frame for a whole beat.
 *   2. DENSITY. The corpus lands ~89 elements a minute against our 65. Every
 *      beat here assembles rather than holds.
 *   3. CONTINUOUS MOTION. ~27% of corpus runtime is under sustained movement
 *      and ours was 10%. A carousel, a video and a collage run under held beats.
 *
 * PAN, NOT SCALE, ON A LONG HOLD. The first cut of THIS file measured WORSE
 * than v1 - 85.0% frozen - with a `Camera move="in" amount={0.06}` sitting on
 * a 398-frame beat that read as completely dead. The push was real; it was
 * just 0.1px/frame at the image edge, under the ~0.3px/frame floor where x264
 * discards the movement outright, and under the eye's floor too. Scale only
 * moves the edges - the centre of the picture barely travels - so a slow push
 * is the most expensive way to buy motion. A pan moves EVERY pixel by the same
 * amount. Every hold below is therefore a pan of roughly 0.45px/frame, sized
 * from the beat's own length, with scale as a secondary.
 *
 * AND THAT DID NOT WORK EITHER — recorded here so it is not tried a third
 * time. Adding those pans moved frozen from 85.0% to 85.4%, i.e. not at all.
 * `measure-format.py` analyses at 160x284, so a 0.45px/frame pan at 1080 is
 * 0.067px/frame to the tool and vanishes under its threshold; it is close to
 * invisible to the eye at that rate too. The conclusion is the useful part:
 * a slow drift cannot buy a reel out of "frozen", because the corpus's 50.5%
 * is earned by things genuinely crossing the frame — footage, carousels,
 * collages — not by Ken Burns. The beats that measure well here are exactly
 * those: hook 47.7% (real footage), r2 67.8% (stepping carousel).
 *
 * THE GAP IS OCCUPANCY. Measured across the whole reel, only 22% of the average
 * frame is anything other than flat sage — `three` is 2.8%, `cta` 3.3%. A cut
 * needs 28% of pixels to change, so on this treatment a section boundary is
 * arithmetically incapable of registering as one, and "frozen" is capped by the
 * same ceiling. See rule Q in `docs/reel-invariants.md`. Fill the frame and
 * frozen, cuts and arrivals all move together; nothing else moves any of them.
*/

const FPS = 30;

const at = (k: keyof typeof B) => ({
  from: B[k][0],
  durationInFrames: B[k][1] - B[k][0],
});
const len = (k: keyof typeof B) => B[k][1] - B[k][0];

/* ── shared pieces ───────────────────────────────────────────────── */

const Mono: React.FC<{ children: React.ReactNode; size?: number; o?: number }> = ({
  children,
  size = 18,
  o = 0.72,
}) => (
  <div
    style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: size,
      letterSpacing: 2.2,
      color: `rgba(255,255,255,${o})`,
    }}
  >
    {children}
  </div>
);

/**
 * A spot effect, with a tail ramp.
 *
 * `name` carries the folder and extension because the library is split across
 * seven category folders with mixed extensions — the older reels' `ext` prop
 * cannot address `ui-tech/digital-beep.wav` at all.
 *
 * The ramp is not decoration. Half this library is longer than the moment it
 * scores — `cinematic/hit.wav` runs 4.9s, `digital-beep` 1.7s — and a Sequence
 * that simply ends mid-waveform cuts the sample at whatever amplitude it had
 * reached, which is an audible click. Every cue below is truncated, so every
 * cue needs this.
 */
const Sfx: React.FC<{
  name: string;
  at: number;
  volume?: number;
  dur?: number;
  fade?: number;
}> = ({ name, at: a, volume = 0.28, dur = 34, fade = 9 }) => (
  <Sequence from={a} durationInFrames={dur} layout="none">
    <Audio
      src={staticFile(`sfx/${name}`)}
      volume={(f) =>
        volume *
        interpolate(f, [Math.max(0, dur - fade), dur - 1], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  </Sequence>
);

/**
 * A headline that says its piece and clears.
 *
 * The whole reason this is a Sequence with its own short life rather than a
 * beat-length element: holding one for a whole beat is what put a headline on
 * 92% of the previous cut's frames. The corpus figure is 46%.
 */
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

const Card: React.FC<{ name: string; label?: string }> = ({ name, label }) => (
  <div
    style={{
      borderRadius: 10,
      overflow: "hidden",
      background: "rgba(255,255,255,0.06)",
      position: "relative",
    }}
  >
    <Img src={portrait(name)} style={{ width: "100%", display: "block" }} />
    {label ? (
      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          background: "rgba(20,30,34,0.66)",
          borderRadius: 5,
          padding: "5px 10px",
        }}
      >
        <Mono size={14}>{label}</Mono>
      </div>
    ) : null}
  </div>
);

const Chip: React.FC<{
  text: string;
  on?: boolean;
  struck?: boolean;
  /** dark ground — the only variant that reads over sage or over a portrait */
  dark?: boolean;
}> = ({ text, on, struck, dark }) => (
  <div
    style={{
      fontFamily: sansFont,
      fontSize: 25,
      padding: "12px 24px",
      borderRadius: 40,
      whiteSpace: "nowrap",
      textAlign: "center",
      background: on
        ? "#fff"
        : dark
          ? "rgba(20,30,34,0.72)"
          : "rgba(255,255,255,0.10)",
      color: on ? "#1d2224" : "#fff",
      border: `1px solid ${
        on ? "#fff" : dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.32)"
      }`,
      textDecoration: struck ? "line-through" : undefined,
      opacity: struck ? 0.55 : 1,
    }}
  >
    {text}
  </div>
);

/**
 * A portrait whose bottom edge dissolves into the stage.
 *
 * `hero2-*` is cropped mid-torso, and she is wearing a black turtleneck, so the
 * crop ends in a hard horizontal black edge sitting in the middle of the sage —
 * a pasted rectangle, on screen for eleven seconds in the close. The image's own
 * backdrop is already the exact stage sage (measured: 163,181,186 inside and
 * outside), so ONLY the bottom needs to go; masking it to transparent leaves
 * the stage showing through with no seam at all.
 *
 * The mask starts at 62% so it eats the sweater and not her jaw. Anything above
 * ~70% starts to thin her chin on the tighter crops.
 *
 * THE SIDES NEED IT TOO, and that only became visible once the bottom was
 * fixed: `hero2-after` carries compositing artefacts in its backdrop out by the
 * shoulders — mottled grey that is not the stage sage — and they sat in plain
 * view. The two gradients are applied as NESTED elements rather than as two
 * mask layers with `mask-composite`, because one mask per element needs no
 * compositing mode and behaves the same in every renderer.
 *
 * On a portrait whose backdrop already matches the stage this is invisible:
 * fading sage into sage changes nothing. It only ever removes a bad edge.
 */
const SoftPortrait: React.FC<{ name: string; width: number }> = ({
  name,
  width,
}) => (
  <div
    style={{
      WebkitMaskImage:
        "linear-gradient(to right, transparent 0%, #000 11%, #000 89%, transparent 100%)",
      maskImage:
        "linear-gradient(to right, transparent 0%, #000 11%, #000 89%, transparent 100%)",
    }}
  >
    <Img
      src={portrait(name)}
      style={{
        width,
        display: "block",
        WebkitMaskImage:
          "linear-gradient(to bottom, #000 56%, rgba(0,0,0,0.5) 80%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, #000 56%, rgba(0,0,0,0.5) 80%, transparent 100%)",
      }}
    />
  </div>
);

const Phone: React.FC<{ name: string }> = ({ name }) => (
  <div
    style={{
      width: 452,
      borderRadius: 34,
      overflow: "hidden",
      border: "2px solid rgba(255,255,255,0.8)",
      boxShadow: "0 26px 60px rgba(30,45,50,0.32)",
    }}
  >
    <Img src={screen(name)} style={{ width: "100%", display: "block" }} />
  </div>
);

/**
 * The compliance chip, from CLAUDE.md's content rules verbatim.
 *
 * This replaces three gold dots that used to sit on her eyes and her mouth
 * during the disclaimer. Gemini read that beat back as "close-up preview of
 * specific eye and lip procedures on the user's face" — the one shot whose
 * whole job is to disclaim was the shot making a procedure claim. Nothing in
 * this reel points at a feature again except the hook, where she is pointing at
 * her own.
 */
const Compliance: React.FC = () => (
  <div
    style={{
      background: "rgba(20,30,34,0.72)",
      border: "1px solid rgba(255,255,255,0.22)",
      borderRadius: 6,
      padding: "10px 18px",
    }}
  >
    <Mono size={17} o={0.92}>AI PREVIEW - NOT MEDICAL ADVICE</Mono>
  </div>
);

/**
 * Lowest an overlay may sit before it fouls the caption track.
 *
 * `MirrorCaptions` is a 150px band at `bottom: 9%`, so its top edge is at
 * y=1597 and an element anchored at `bottom={N}` has its own bottom at
 * y=1920-N. Anything under ~323 overlaps the captions. Several did: the DREAD
 * and HOPE labels on the r1 slider were printing on the same line as the
 * spoken caption, and so were TODAY / NEXT YEAR in the close.
 */
const OVER_CAPTIONS = 380;

/**
 * Dissolves the bottom crop of `ConvergePanels` into the stage.
 *
 * The composite is a photo crop, so it ends in a hard horizontal edge across
 * her black turtleneck — the same defect `SoftPortrait` fixes, but this one
 * cannot be fixed the same way: `ConvergePanels` lives in `preview/draw.tsx`
 * and is shared with RefinaPreviewReel, which is an approved cut. Nothing under
 * that path may change for this reel's benefit.
 *
 * So the fade is drawn OVER it in frame coordinates instead. It has to be a
 * band rather than a line because the `Camera` on the r1 beat moves the
 * composite while it plays: the edge was measured travelling y=1294 to y=1390
 * across the two beats that use it, and her jaw is well clear at ~1150.
 */
const StageFade: React.FC<{ from?: number; to?: number }> = ({
  from = 1230,
  to = 1400,
}) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: from,
        height: to - from,
        background: `linear-gradient(to bottom, ${SAGE}00, ${SAGE})`,
      }}
    />
    <div
      style={{ position: "absolute", left: 0, right: 0, top: to, height: 110, background: SAGE }}
    />
  </AbsoluteFill>
);

const Centre: React.FC<{ children: React.ReactNode; bottom?: number }> = ({
  children,
  bottom,
}) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: bottom === undefined ? "center" : "flex-end",
    }}
  >
    {bottom === undefined ? children : <div style={{ marginBottom: bottom }}>{children}</div>}
  </AbsoluteFill>
);

/* ── the reel ────────────────────────────────────────────────────── */

const Mirror2: React.FC = () => (
  <Stage>

    {/* ── sound ───────────────────────────────────────────────────────
        Three palettes, assigned by what the beat IS rather than by taste:
        `ui-tech` wherever the app is doing something, `transition` on every
        plate move, `cinematic` once — the consultation desk, the only beat
        that is supposed to land badly. `meme-comedy`, `gaming` and
        `cartoon-retro` are in the library and are wrong for all of it.

        Cue frames are derived from the beat table and each element's own
        `startFrame`, so they follow `words.ts` if the beats are re-timed —
        but they are ABSOLUTE numbers here and will NOT move on their own.
        Re-derive them when the voiceover lands. There is still no music bed;
        with no voiceover this reel is 82 seconds of spot effects over silence.
    */}

    {/* hook — measurement beeps over a real gesture */}
    <Sfx name="ui-tech/digital-beep.wav" at={86} volume={0.16} dur={20} />
    <Sfx name="ui-tech/digital-beep.wav" at={98} volume={0.16} dur={20} />
    <Sfx name="ui-tech/digital-beep.wav" at={176} volume={0.2} dur={22} />
    <Sfx name="tick.wav" at={250} volume={0.34} dur={18} />

    {/* guess — the mesh builds, then the guess scatters */}
    <Sfx name="transition/deep-woosh.wav" at={313} volume={0.26} dur={40} />
    <Sfx name="ui-tech/digital-loading.wav" at={323} volume={0.22} dur={24} />
    <Sfx name="transition/paper-slide.wav" at={385} volume={0.2} dur={30} />

    {/* built — app beats, so every cue is a UI cue */}
    <Sfx name="transition/woosh-1.wav" at={534} volume={0.26} dur={14} />
    <Sfx name="ui-tech/mouse-click.wav" at={552} volume={0.4} dur={8} />
    <Sfx name="ui-tech/toggle.wav" at={634} volume={0.4} dur={8} />
    <Sfx name="transition/deep-woosh.wav" at={704} volume={0.24} dur={38} />
    <Sfx name="ui-tech/digital-loading.wav" at={710} volume={0.2} dur={24} />
    <Sfx name="tick.wav" at={740} volume={0.34} dur={16} /> {/* halves meet */}

    {/* three — a count, so it is three of the same sound going up */}
    <Sfx name="transition/woop.mp3" at={898} volume={0.24} dur={20} />
    <Sfx name="tick.wav" at={906} volume={0.28} dur={14} />
    <Sfx name="tick.wav" at={915} volume={0.34} dur={14} />
    <Sfx name="tick.wav" at={924} volume={0.42} dur={14} />

    {/* r1 — the slider is grabbed, swings, settles */}
    <Sfx name="transition/woosh-2.wav" at={998} volume={0.24} dur={26} />
    <Sfx name="ui-tech/toggle.wav" at={1160} volume={0.36} dur={8} />
    <Sfx name="tick.wav" at={1202} volume={0.3} dur={14} />

    {/* r2 — the carousel steps every 30 frames, chips strike through */}
    <Sfx name="transition/woosh-1.wav" at={1396} volume={0.24} dur={14} />
    <Sfx name="transition/paper-slide.wav" at={1402} volume={0.15} dur={24} />
    <Sfx name="transition/paper-slide.wav" at={1432} volume={0.15} dur={24} />
    <Sfx name="transition/paper-slide.wav" at={1462} volume={0.15} dur={24} />
    <Sfx name="transition/paper-slide.wav" at={1492} volume={0.15} dur={24} />
    <Sfx name="click.wav" at={1508} volume={0.3} dur={12} />
    <Sfx name="click.wav" at={1524} volume={0.3} dur={12} />
    <Sfx name="click.wav" at={1540} volume={0.3} dur={12} />
    {/* the fourth chip is the one that survives, so it does not sound struck */}
    <Sfx name="ui-tech/digital-beep.wav" at={1556} volume={0.3} dur={22} />

    {/* r3 — cards, then the pile, then the desk */}
    <Sfx name="transition/woosh-2.wav" at={1673} volume={0.24} dur={26} />
    <Sfx name="transition/paper-slide.wav" at={1681} volume={0.24} dur={26} />
    <Sfx name="transition/paper-slide.wav" at={1715} volume={0.24} dur={26} />
    <Sfx name="action/paper-swipe.mp3" at={1787} volume={0.26} dur={30} />
    <Sfx name="action/paper-swipe.mp3" at={1808} volume={0.2} dur={30} />
    <Sfx name="cinematic/hit.wav" at={1947} volume={0.3} dur={70} fade={26} />
    <Sfx name="tick.wav" at={1951} volume={0.24} dur={12} />
    <Sfx name="tick.wav" at={1961} volume={0.24} dur={12} />
    <Sfx name="tick.wav" at={1971} volume={0.24} dur={12} />

    {/* close — a cut, the compliance chip, three denials, then the year */}
    <Sfx name="transition/deep-woosh.wav" at={2050} volume={0.26} dur={40} />
    <Sfx name="tick.wav" at={2062} volume={0.3} dur={16} /> {/* halves meet */}
    <Sfx name="ui-tech/digital-beep.wav" at={2096} volume={0.24} dur={22} />
    <Sfx name="click.wav" at={2145} volume={0.28} dur={12} />
    <Sfx name="click.wav" at={2159} volume={0.28} dur={12} />
    <Sfx name="click.wav" at={2173} volume={0.28} dur={12} />
    <Sfx name="transition/paper-slide.wav" at={2207} volume={0.24} dur={26} />
    {/* twelve blocks at five frames apart is 2s of ticking; four marks the
        rhythm without turning into a machine-gun */}
    <Sfx name="tick.wav" at={2298} volume={0.2} dur={10} />
    <Sfx name="tick.wav" at={2313} volume={0.2} dur={10} />
    <Sfx name="tick.wav" at={2328} volume={0.2} dur={10} />
    <Sfx name="tick.wav" at={2343} volume={0.24} dur={12} />

    {/* cta */}
    <Sfx name="transition/woop.mp3" at={2383} volume={0.26} dur={20} />
    <Sfx name="ui-tech/keyboard-typing.wav" at={2399} volume={0.3} dur={46} fade={12} />
    <Sfx name="click.wav" at={2443} volume={0.45} dur={14} />

    {/* 1 — HOOK. Her own hands on her own face. The clip runs the whole beat,
           which is where this reel's continuous motion starts; the callouts
           land on "temples", "cheek", "held it there". */}
    <Sequence {...at("hook")}>
      <Plate len={len("hook")} mode="cut">
        {/* `trimBefore={96}` was wrong twice over. It ran the take to source
            f240, and from ~f216 she looks down and away - the shot the
            invariants file says never to use, because it reads as defeated.
            It also ran out of footage at local f180 and then held one frozen
            picture for the remaining 129 frames, which is where a third of
            this beat's dead air came from.

            `MirrorClip` already solves this: it maps source position per frame
            through <Freeze>, so the take can be slowed to fill the beat
            without ever passing f198 and without cutting inside one unbroken
            gesture. The anchors below are in THIS beat's local clock, spaced
            to put each gesture under the callout that names it. */}
        {/* Windowed, not full-bleed. MirrorClip is an AbsoluteFill, so it
            fills whatever positioned box it is dropped into rather than the
            frame. */}
        <Centre>
          <div
            style={{
              width: 760,
              height: 1120,
              position: "relative",
              overflow: "hidden",
              borderRadius: 14,
            }}
          >
        <MirrorClip
          anchors={[
            [0, 26],    // neutral, hands down
            [70, 56],   // the hand starts to rise
            [155, 102], // temple pull done, moving to the cheek
            [240, 150], // cheek lifted - the hold starts
            [300, 150], // same source frame: "Held it there." is a freeze
            [309, 198], // released, and we cut away on the release
          ]}
          push={[
            [240, 1],
            [309, 1.06],
          ]}
          // captions sit on sage BELOW the box now, not over the footage
          scrim={0}
        />
          </div>
        </Centre>
        <DimensionCallout from={[371, 662]} to={[371, 592]} startFrame={80} label="TEMPLE" />
        <DimensionCallout from={[727, 662]} to={[727, 592]} startFrame={92} label="TEMPLE" />
        <DimensionCallout
          from={[454, 828]}
          to={[454, 758]}
          startFrame={170}
          label="CHEEK"
          style="solid"
        />
        <Sequence from={244} durationInFrames={64} layout="none">
          <Centre bottom={OVER_CAPTIONS}>
            <div
              style={{
                background: "rgba(20,30,34,0.66)",
                borderRadius: 6,
                padding: "9px 16px",
              }}
            >
              <Mono size={20} o={0.95}>HELD - 4 SECONDS</Mono>
            </div>
          </Centre>
        </Sequence>
      </Plate>
    </Sequence>

    <Burst from={30} hold={100} lines={["The mirror test"]} />

    {/* 2 — GUESS. The imagination is a construct, so it is drawn as one: a mesh
           settles onto her face, then the guess scatters into candidate words
           that never resolve into anything. */}
    <Sequence {...at("guess")}>
      <Plate len={len("guess")} dir="up" t={16}>
        <Camera dur={len("guess")} amount={0.06} panY={-96} origin="50% 46%">
          <Centre>
            <SoftPortrait name="hero2-before" width={700} />
          </Centre>
        </Camera>
        <FaceMesh cx={540} cy={840} rx={196} ry={258} startFrame={8} durationInFrames={22} />
        <Sequence from={70} durationInFrames={151} layout="none">
          <Centre bottom={OVER_CAPTIONS}>
            <div style={{ width: 900 }}>
              <StaggerGrid
                columns={3}
                gap={14}
                startFrame={0}
                staggerFrames={7}
                variant="fade-up"
                order="centre-out"
              >
                <Chip text="a little" />
                <Chip text="not too much" />
                <Chip text="natural" />
                <Chip text="still me" />
                <Chip text="but better" />
                <Chip text="?" />
              </StaggerGrid>
            </div>
          </Centre>
        </Sequence>
      </Plate>
    </Sequence>
    <Burst from={318} hold={125} lines={["A guess,", "not a picture"]} />

    {/* 3 — BUILT. Three concrete acts, one screen each, then her own face
           actually rendering. */}
    <Sequence {...at("built")}>
      <Plate len={len("built")} dir="up" t={18}>
        <Camera dur={98} amount={0.05} panY={-44}>
          <Centre>
            <Phone name="reference-photos" />
          </Centre>
        </Camera>
        <Sequence from={98} durationInFrames={70} layout="none">
          <Camera dur={70} amount={0.05} panY={-32}>
            <Centre>
              <Phone name="select-procedures" />
            </Centre>
          </Camera>
        </Sequence>
        <Sequence from={168} durationInFrames={196} layout="none">
          <Camera dur={196} amount={0.05} panY={-86} origin="50% 46%">
            <Centre>
              <ConvergePanels before="hero2-before" after="hero2-after" still={0} converge={34} />
            </Centre>
          </Camera>
          <ScanOverlay
            x={314}
            y={640}
            width={452}
            height={560}
            startFrame={6}
            durationInFrames={44}
            label="RENDERING"
            loop
          />
        </Sequence>
      </Plate>
    </Sequence>
    {/* was "So we built Refina", which is the caption, word for word, at the
        same moment. The headline track states the section; it does not read
        the line out a second time. */}
    <Burst from={538} hold={108} lines={["Three taps"]} />
    <Burst from={806} hold={118} lines={["Rendered,", "not drawn"]} italicSecond />

    {/* 4 — THREE. A count, stated and gone. */}
    <Sequence {...at("three")}>
      {/* Section boundaries are CUTS. The reel measured 1.5 cuts/min against
          a corpus median of 4.0, with a 21-second median shot, and only 1 of
          9 described scene changes landed on anything a viewer could see. */}
      <Plate len={len("three")} mode="cut">
        <Centre>
          <div style={{ width: 900 }}>
            <StaggerGrid columns={3} gap={20} startFrame={6} staggerFrames={9} variant="pop">
              <Chip text="stop guessing" on />
              <Chip text="rule things out" on />
              <Chip text="decide alone" on />
            </StaggerGrid>
          </div>
        </Centre>
      </Plate>
    </Sequence>

    {/* 5 — R1. Hope and dread as a value that swings and settles. The slider is
           the argument, not decoration. */}
    <Sequence {...at("r1")}>
      <Plate len={len("r1")} dir="up" t={18}>
        {/* This exact element, at amount={0.06} with no pan, measured 89.9%
            frozen across 398 frames. See the note at the top of the file. */}
        <Camera dur={len("r1")} amount={0.10} panY={-150} origin="50% 46%">
          <Centre>
            <ConvergePanels
              before="hero2-before"
              after="hero2-after"
              still={150}
              converge={40}
              scale={1.5}
            />
          </Centre>
          <StageFade />
        </Camera>
        <StageFade />
        {/* "The picture in your head was never accurate." The mesh is the
            guess being measured against the photograph — the same device the
            `guess` beat uses, deliberately repeated rather than replaced with
            a new one. This span used to be 100 empty frames. */}
        <Sequence from={50} durationInFrames={98} layout="none">
          <FaceMesh cx={540} cy={800} rx={188} ry={248} startFrame={4} durationInFrames={20} />
          <Centre bottom={OVER_CAPTIONS}>
            <div
              style={{
                background: "rgba(20,30,34,0.66)",
                borderRadius: 6,
                padding: "9px 16px",
              }}
            >
              <Mono size={18} o={0.92}>GUESSED</Mono>
            </div>
          </Centre>
        </Sequence>
        <Sequence from={150} durationInFrames={140} layout="none">
          <Centre bottom={OVER_CAPTIONS}>
            <div style={{ width: 820 }}>
              <MetricSlider
                from={0.86}
                to={0.14}
                startFrame={10}
                durationInFrames={54}
                width={820}
                leftLabel="DREAD"
                rightLabel="HOPE"
                ticks={5}
              />
            </div>
          </Centre>
        </Sequence>
        {/* "Now it is just a photograph." - the swinging value resolves into a
            fixed reading. Without this the beat's last 214 frames were empty. */}
        <Sequence from={306} durationInFrames={92} layout="none">
          <Centre bottom={OVER_CAPTIONS}>
            <div style={{ width: 820 }}>
              <MetricSlider
                from={0.14}
                to={0.5}
                startFrame={6}
                durationInFrames={40}
                width={820}
                leftLabel="DREAD"
                rightLabel="HOPE"
                handleLabel="MEASURED"
                ticks={5}
                mode="split"
              />
            </div>
          </Centre>
        </Sequence>
      </Plate>
    </Sequence>
    <Burst from={1002} hold={116} lines={["1. Stop guessing"]} />

    {/* 6 — R2. Ruling out IS the point, so options strike through one by one
           while the carousel keeps travelling underneath. */}
    <Sequence {...at("r2")}>
      <Plate len={len("r2")} mode="cut">
        <Centre bottom={620}>
          <CardCarousel
            width={980}
            height={400}
            itemSize={290}
            axis="x"
            mode="stepped"
            startFrame={4}
            framesPerItem={30}
            feather={70}
          >
            <Card name="flood-06a" label="RHINOPLASTY" />
            <Card name="flood-04a" label="FACELIFT" />
            <Card name="flood-05a" label="UPPER BLEPH" />
            <Card name="flood-01a" label="LIP FILLER" />
          </CardCarousel>
        </Centre>
        <Sequence from={110} durationInFrames={167} layout="none">
          <Centre bottom={OVER_CAPTIONS}>
            <div style={{ width: 880 }}>
              <StaggerGrid columns={2} gap={16} startFrame={0} staggerFrames={16} variant="fade-up">
                <Chip text="Rhinoplasty" struck />
                <Chip text="Lip filler" struck />
                <Chip text="Brow lift" struck />
                <Chip text="Facelift" on />
              </StaggerGrid>
            </div>
          </Centre>
        </Sequence>
      </Plate>
    </Sequence>
    <Burst from={1400} hold={116} lines={["2. Rule it out"]} />

    {/* 7 — R3. The desk you are NOT sitting at. Other people's results pile up
           because the count is the argument, then the price list lands. */}
    <Sequence {...at("r3")}>
      <Plate len={len("r3")} mode="cut">
        {/* Was a CardStack, immediately followed by a Collage — two devices
            for "a pile of pictures" inside one beat, and the CardStack's only
            appearance in the reel. Same information, existing vocabulary. */}
        <Sequence  durationInFrames={112} layout="none">
          <Centre>
            <div style={{ width: 880 }}>
              <StaggerGrid columns={2} gap={18} startFrame={6} staggerFrames={18} variant="fade-up">
                <Card name="hero2-after" label="AT HOME" />
                <Card name="hero2-before" label="ON YOUR OWN TIME" />
              </StaggerGrid>
            </div>
          </Centre>
        </Sequence>
        <Sequence from={112} durationInFrames={160} layout="none">
          <Camera dur={160} amount={0.06} panY={-70}>
            <Centre>
            <Collage
              width={940}
              height={760}
              itemWidth={250}
              itemHeight={330}
              startFrame={0}
              staggerFrames={7}
              spread={13}
            >
              <Card name="flood-02a" />
              <Card name="flood-03a" />
              <Card name="flood-07a" />
              <Card name="flood-08a" />
              <Card name="flood-09a" />
              <Card name="front-after" />
            </Collage>
            </Centre>
          </Camera>
        </Sequence>
        <Sequence from={272} durationInFrames={105} layout="none">
          <Centre>
            <div
              style={{
                background: "rgba(20,30,34,0.72)",
                borderRadius: 12,
                padding: "26px 34px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Mono size={17} o={0.55}>CONSULTATION</Mono>
              <div style={{ marginTop: 16 }}>
                <StaggerGrid columns={1} gap={12} startFrame={4} staggerFrames={10} variant="fade-up">
                  <Mono size={22} o={0.9}>Rhinoplasty .......... 6,500</Mono>
                  <Mono size={22} o={0.9}>Facelift ................ 11,000</Mono>
                  <Mono size={22} o={0.9}>Deposit today ...... 500</Mono>
                </StaggerGrid>
              </div>
            </div>
          </Centre>
        </Sequence>
      </Plate>
    </Sequence>
    <Burst from={1677} hold={126} lines={["3. Decide", "before the desk"]} />

    {/* 8 — CLOSE. Four lines, four things to show. This beat used to be 333
           frames carrying three dots and one sentence, 97% frozen with a
           10.5-second dead run in the middle of it — the single worst stretch
           in the reel, and the one the disclaimer lives in. */}
    <Sequence {...at("close")}>
      <Plate len={len("close")} mode="cut">
        {/* "Refina is a preview, not a promise." */}
        <Sequence  durationInFrames={88} layout="none">
          <Centre>
            <ConvergePanels
              before="hero2-before"
              after="hero2-after"
              still={10}
              converge={38}
              scale={1.5}
            />
          </Centre>
          <Sequence from={44} durationInFrames={44} layout="none">
            <Centre bottom={OVER_CAPTIONS}>
              <Compliance />
            </Centre>
          </Sequence>
        </Sequence>

        {/* Her face carries the rest of the beat unbroken. The first cut of
            this rebuild put each of these overlays alone on bare sage, and
            every one of them read as an empty frame with a widget in it — the
            exact failure spec rule 5 names. They are overlays; they need
            something to be on. */}
        <Sequence from={89} durationInFrames={244} layout="none">
          <Camera dur={244} amount={0.05} panY={-60} origin="50% 44%">
            <Centre>
              <SoftPortrait name="hero2-after" width={720} />
            </Centre>
          </Camera>
        </Sequence>

        {/* "Your surgeon determines your result." Stated as the three things
            the app is NOT, which is the honest form of that line and needs no
            picture of a surgeon we do not have. */}
        <Sequence from={89} durationInFrames={64} layout="none">
          <Centre bottom={OVER_CAPTIONS}>
            <div style={{ width: 760 }}>
              <StaggerGrid columns={1} gap={14} startFrame={4} staggerFrames={14} variant="fade-up">
                <Chip text="Not a diagnosis" dark />
                <Chip text="Not a quote" dark />
                <Chip text="Not a surgical plan" dark />
              </StaggerGrid>
            </div>
          </Centre>
        </Sequence>

        {/* "But you should get to see it" */}
        <Sequence from={155} durationInFrames={86} layout="none">
          <Centre bottom={OVER_CAPTIONS}>
            <div
              style={{
                background: "rgba(20,30,34,0.66)",
                borderRadius: 6,
                padding: "9px 16px",
              }}
            >
              <Mono size={18} o={0.92}>PREVIEW</Mono>
            </div>
          </Centre>
        </Sequence>

        {/* "before you spend another year imagining it." A year is a value
            moving, and this reel already has a device for that. */}
        <Sequence from={244} durationInFrames={89} layout="none">
          <Centre bottom={OVER_CAPTIONS}>
            <div style={{ width: 820 }}>
              <MetricSlider
                from={0}
                to={1}
                startFrame={6}
                durationInFrames={62}
                width={820}
                leftLabel="TODAY"
                rightLabel="NEXT YEAR"
                handleLabel="STILL IMAGINING"
                ticks={12}
              />
            </div>
          </Centre>
        </Sequence>
      </Plate>
    </Sequence>
    <Burst from={2054} hold={110} lines={["What it is,", "and what it isn't"]} italicSecond />

    {/* 9 — CTA. */}
    <Sequence {...at("cta")}>
      <Plate len={len("cta")} mode="cut">
        <Centre>
          <TypewriterInput text="Refina AI" startFrame={14} framesPerChar={5} width={640} />
        </Centre>
        <Sequence from={58} durationInFrames={31} layout="none">
          <Centre bottom={700}>
            <Mono size={20}>ON THE APP STORE</Mono>
          </Centre>
        </Sequence>
      </Plate>
    </Sequence>

    <MirrorCaptions />
  </Stage>
);

export const RefinaMirror2: React.FC = () => (
  <Composition
    id="RefinaMirror2"
    component={Mirror2}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{}}
  />
);

export const MIRROR2_SAGE = SAGE;
