import { AbsoluteFill, Composition, Img, Sequence, staticFile } from "remotion";
import { displayFont } from "../fonts";
import { SAGE, Stage } from "../refina/protocol/atoms";

import { BlurOutUp } from "../components/remocn/blur-out-up";
import { CameraLens } from "../components/remocn/camera-lens";
import { Drift } from "../components/remocn/drift";
import { FocusBlurResolve } from "../components/remocn/focus-blur-resolve";
import { InkArrow } from "../components/remocn/ink-arrow";
import { InkUnderline } from "../components/remocn/ink-underline";
import { InlineHighlight } from "../components/remocn/inline-highlight";
import { LineByLineSlide } from "../components/remocn/line-by-line-slide";
import { MicroScaleFade } from "../components/remocn/micro-scale-fade";
import { NumberWheel } from "../components/remocn/number-wheel";
import { PerCharacterRise } from "../components/remocn/per-character-rise";
import { PixelateRegion } from "../components/remocn/pixelate-region";
import { ScribbleCircle } from "../components/remocn/scribble-circle";
import { SharedAxisY } from "../components/remocn/shared-axis-y";
import { ShimmerSweep } from "../components/remocn/shimmer-sweep";
import { StrikethroughReplace } from "../components/remocn/strikethrough-replace";
import { TrackingIn } from "../components/remocn/tracking-in";
import { ValueSwap } from "../components/remocn/value-swap";

/**
 * RemocnCoreLab — the 18 core picks, on the QOVES sage ground.
 *
 * Two rules this lab follows that RemocnLab (v1) did not:
 *
 *   1. Beat length comes from each component's own catalog length, plus hold.
 *      A single flat HOLD clipped the longer components in v1.
 *   2. The five scene-level components (drift, camera-lens, pixelate-region,
 *      scribble-circle, ink-arrow) are shown OVER A REAL PORTRAIT, because
 *      that is the only place they mean anything. Showing an annotation brush
 *      on an empty stage is what made v1 feel like nothing was happening.
 *
 * Sage family only. No white cards — every vendored component was de-chromed
 * by `refs/dechrome-remocn.py`; re-run it after any `shadcn add --overwrite`.
 */

const INK = "#fff";
const W = 1080;
const H = 1920;

const P = (n: string) => staticFile(`portraits/${n}.png`);

const Title: React.FC<{ n: number; text: string; note?: string }> = ({
  n,
  text,
  note,
}) => (
  <div
    style={{
      position: "absolute",
      top: 78,
      left: 60,
      right: 60,
      textAlign: "center",
      zIndex: 20,
    }}
  >
    <div
      style={{
        fontFamily: displayFont,
        fontWeight: 300,
        fontSize: 42,
        color: INK,
      }}
    >
      {n}. {text}
    </div>
    {note ? (
      <div
        style={{
          fontFamily: displayFont,
          fontWeight: 300,
          fontSize: 26,
          color: INK,
          opacity: 0.66,
          marginTop: 8,
        }}
      >
        {note}
      </div>
    ) : null}
  </div>
);

/** Portrait plate — the subject the scene-level components act on. */
const Plate: React.FC<{ n?: string }> = ({ n = "sage-before" }) => (
  <AbsoluteFill
    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
  >
    <div
      style={{
        width: 720,
        height: 960,
        borderRadius: 18,
        overflow: "hidden",
        background: SAGE,
      }}
    >
      <Img
        src={P(n)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  </AbsoluteFill>
);

/* ── beat schedule: [length, title, note] with length >= catalog length ── */
const BEATS = [
  120, // 1 focus-blur-resolve  (90f)
  105, // 2 blur-out-up         (90f)
  120, // 3 inline-highlight    (90f)
  120, // 4 strikethrough-replace (120f) -> +hold
  135, // 5 shimmer-sweep       (120f)
  105, // 6 tracking-in         (90f)
  95, // 7 per-character-rise  (60f)
  95, // 8 micro-scale-fade    (60f)
  120, // 9 line-by-line-slide  (90f)
  115, // 10 shared-axis-y      (90f)
  130, // 11 number-wheel       (112f)
  120, // 12 value-swap         (100f)
  140, // 13 ink-underline      (120f)
  130, // 14 scribble-circle    (30f draw + hold to read)
  175, // 15 ink-arrow          (150f)
  120, // 16 drift              (sustained)
  115, // 17 camera-lens        (sustained)
  115, // 18 pixelate-region    (sustained)
];

export const REMOCN_CORE_DURATION = BEATS.reduce((a, b) => a + b, 0);

export const RemocnCoreLabVideo: React.FC = () => {
  let cursor = 0;
  let i = 0;
  const at = () => {
    const from = cursor;
    const durationInFrames = BEATS[i++];
    cursor += durationInFrames;
    return { from, durationInFrames };
  };

  return (
    <Stage>
      {/* ── typography: the caption capabilities the sage kit lacks ── */}
      <Sequence {...at()}>
        <Title n={1} text="FocusBlurResolve" note="blur in, hold, blur out" />
        <FocusBlurResolve
          text="Refina reads your face"
          fontSize={76}
          fontWeight={500}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={2} text="BlurOutUp" note="the exit BlurWords never had" />
        <BlurOutUp
          text="Clean in, blurred out"
          fontSize={76}
          fontWeight={500}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={3} text="InlineHighlight" note="one word changes colour" />
        <InlineHighlight
          before="A preview, "
          highlight="not a promise"
          after="."
          baseColor={INK}
          highlightColor="#2E7D5B"
          fontSize={70}
          fontWeight={500}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={4} text="StrikethroughReplace" note="strike the myth" />
        <StrikethroughReplace
          from="Guaranteed result"
          to="Simulated preview"
          lineColor="#D0342C"
          fontSize={64}
          fontWeight={500}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={5} text="ShimmerSweep" note="light crosses the type" />
        <ShimmerSweep
          text="See it on yours"
          baseColor="rgba(255,255,255,0.55)"
          shineColor={INK}
          fontSize={80}
          fontWeight={600}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={6} text="TrackingIn" note="letter-spacing collapses" />
        <TrackingIn
          text="REFINA"
          startTracking={26}
          fontSize={96}
          fontWeight={300}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={7} text="PerCharacterRise" note="crisp, zero blur" />
        <PerCharacterRise
          text="Measured"
          fontSize={92}
          fontWeight={500}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={8} text="MicroScaleFade" note="subtle settle for labels" />
        <MicroScaleFade
          text="Facial thirds"
          scaleFrom={0.94}
          fontSize={72}
          fontWeight={400}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={9} text="LineByLineSlide" note="paragraph flows in" />
        <LineByLineSlide
          text={"Three reasons\nthis preview\nholds up"}
          fontSize={68}
          fontWeight={500}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={10} text="SharedAxisY" note="hard editorial swap" />
        <SharedAxisY
          fromText="Someone else's face"
          toText="Your face"
          fontSize={64}
          fontWeight={500}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={11} text="NumberWheel" note="odometer score reveal" />
        <NumberWheel from={72} to={86} fontSize={190} color={INK} />
      </Sequence>

      <Sequence {...at()}>
        <Title n={12} text="ValueSwap" note="value changes in place" />
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ValueSwap
            values={["Skin", "Jawline", "Profile"]}
            at={[30, 70]}
            style={{
              fontFamily: displayFont,
              fontSize: 92,
              fontWeight: 300,
              color: INK,
            }}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...at()}>
        <Title n={13} text="InkUnderline" note="brush drags under a phrase" />
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 78,
              fontWeight: 400,
              color: INK,
            }}
          >
            a preview, not a promise
          </div>
          <InkUnderline width={720} color={INK} thickness={9} delay={18} />
        </AbsoluteFill>
      </Sequence>

      {/* ── scene-level: shown over a real portrait, where they mean something ── */}
      <Sequence {...at()}>
        <Plate />
        <Title n={14} text="ScribbleCircle" note="circles a region of the face" />
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ marginTop: 250, marginLeft: 40 }}>
            <ScribbleCircle
              width={330}
              height={250}
              color="#D0342C"
              strokeWidth={9}
              delay={14}
              laps={2}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence {...at()}>
        <Plate />
        <Title n={15} text="InkArrow" note="points at the feature" />
        <AbsoluteFill>
          <InkArrow
            from={{ x: 250, y: 1500 }}
            to={{ x: 560, y: 1120 }}
            curvature={0.3}
            color={INK}
            strokeWidth={10}
            delay={16}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence {...at()}>
        <Title n={16} text="Drift" note="slow push-in over a static beat" />
        <Drift grow={0.12}>
          <Plate />
        </Drift>
      </Sequence>

      <Sequence {...at()}>
        <Title n={17} text="CameraLens" note="corner falloff + bloom" />
        <CameraLens softness={0.5} bloom={0.4} vignette={0.35} distortion={0.12}>
          <Plate />
        </CameraLens>
      </Sequence>

      <Sequence {...at()}>
        <Title n={18} text="PixelateRegion" note="redacts a face, rest passes" />
        <PixelateRegion
          cellSize={26}
          regions={[{ x: W / 2 - 210, y: H / 2 - 340, width: 420, height: 470 }]}
        >
          <Plate />
        </PixelateRegion>
      </Sequence>
    </Stage>
  );
};

export const RemocnCoreLab: React.FC = () => (
  <Composition
    id="RemocnCoreLab"
    component={RemocnCoreLabVideo}
    durationInFrames={REMOCN_CORE_DURATION}
    fps={30}
    width={W}
    height={H}
    defaultProps={{}}
  />
);
