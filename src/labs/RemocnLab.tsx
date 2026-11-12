import { AbsoluteFill, Composition, Sequence } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { displayFont } from "../fonts";
import { PANEL, SAGE, Stage } from "../refina/protocol/atoms";

import { MaskRevealUp } from "../components/remocn/mask-reveal-up";
import { RollingNumber } from "../components/remocn/rolling-number";
import { StaggeredFadeUp } from "../components/remocn/staggered-fade-up";
import { focusPull } from "../components/remocn/focus-pull";
import { pushThrough } from "../components/remocn/push-through";
import { whipPan } from "../components/remocn/whip-pan";
import { zoomBlur } from "../components/remocn/zoom-blur";

/**
 * RemocnLab — a scratch bench for the seven remocn components, rendered in the
 * QOVES sage treatment. Sage family only: no portraits, no white cards, no
 * second design system. Nothing here ships; it exists to be looked at.
 *
 * Two halves:
 *   1. Standalone cards (frames 0..314) — one component per card.
 *   2. TransitionSeries (frames 315..617) — the four transitions, back to back.
 *
 * The transition half alternates SAGE / PANEL because a transition between two
 * identical backgrounds is invisible. Both values come from the approved
 * palette in `protocol/atoms.tsx`.
 */

const HOLD = 105; // 3.5s per standalone card, matching MotionLab
const SCENE = 75; // 2.5s per transition panel
const TRANS = 18; // 0.6s per transition

const INK = "#fff";

const Title: React.FC<{ n: number; text: string }> = ({ n, text }) => (
  <div
    style={{
      position: "absolute",
      top: 90,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: displayFont,
      fontWeight: 300,
      fontSize: 46,
      color: INK,
      zIndex: 10,
    }}
  >
    {n}. {text}
  </div>
);

/** A flat panel in the sage family, labelled with the move that follows it. */
const Panel: React.FC<{ bg: string; label: string; sub: string }> = ({
  bg,
  label,
  sub,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 18,
    }}
  >
    <div
      style={{
        fontFamily: displayFont,
        fontWeight: 200,
        fontSize: 96,
        color: INK,
        letterSpacing: "-0.02em",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: displayFont,
        fontWeight: 300,
        fontSize: 34,
        color: INK,
        opacity: 0.72,
      }}
    >
      {sub}
    </div>
  </AbsoluteFill>
);

const timing = linearTiming({ durationInFrames: TRANS });

export const RemocnLabVideo: React.FC = () => {
  let i = 0;
  const at = () => ({ from: HOLD * i++, durationInFrames: HOLD });

  return (
    <Stage>
      {/* ── 1. standalone components ─────────────────────────────── */}
      <Sequence {...at()}>
        <Title n={1} text="StaggeredFadeUp — words rise in" />
        <StaggeredFadeUp
          text="Refina reads your face"
          fontSize={78}
          fontWeight={600}
          color={INK}
          staggerDelay={5}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={2} text="MaskRevealUp — lines blur in, then out" />
        <MaskRevealUp
          text={"A preview\nnot a promise"}
          fontSize={92}
          fontWeight={500}
          color={INK}
        />
      </Sequence>

      <Sequence {...at()}>
        <Title n={3} text="RollingNumber — digits roll to value" />
        <RollingNumber from={0} to={24813} fontSize={150} color={INK} />
      </Sequence>

      {/* ── 2. the four transitions, back to back ─────────────────── */}
      <Sequence from={HOLD * 3} durationInFrames={SCENE * 5 - TRANS * 4}>
        <Title n={4} text="Transitions — whip / push / focus / zoom" />
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={SCENE}>
            <Panel bg={SAGE} label="whip-pan" sub="next: a hard lateral throw" />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={whipPan({ direction: "left", blur: 24 })}
            timing={timing}
          />

          <TransitionSeries.Sequence durationInFrames={SCENE}>
            <Panel bg={PANEL} label="push-through" sub="next: incoming shoves out" />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={pushThrough({ zoom: 0.12, blur: 12 })}
            timing={timing}
          />

          <TransitionSeries.Sequence durationInFrames={SCENE}>
            <Panel bg={SAGE} label="focus-pull" sub="next: rack focus between" />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={focusPull({ blur: 26 })}
            timing={timing}
          />

          <TransitionSeries.Sequence durationInFrames={SCENE}>
            <Panel bg={PANEL} label="zoom-blur" sub="next: punch in and dissolve" />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={zoomBlur({ blur: 20, rise: 0.1 })}
            timing={timing}
          />

          <TransitionSeries.Sequence durationInFrames={SCENE}>
            <Panel bg={SAGE} label="end" sub="seven components, sage only" />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </Sequence>
    </Stage>
  );
};

export const REMOCN_LAB_DURATION = HOLD * 3 + (SCENE * 5 - TRANS * 4);

export const RemocnLab: React.FC = () => (
  <Composition
    id="RemocnLab"
    component={RemocnLabVideo}
    durationInFrames={REMOCN_LAB_DURATION}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{}}
  />
);
