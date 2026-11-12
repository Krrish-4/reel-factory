import type React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { displayFont, sansFont, serifUprightFont } from "../fonts";
import { SAGE } from "../refina/protocol/atoms";
import { CardSwap } from "./ported/CardSwap";
import { Orb } from "./ported/Orb";
import { Silk } from "./ported/Silk";

/**
 * PortedLab — three React Bits components, ported from the web versions in
 * C:\Users\rahul\motion-refs and set into Refina scenes.
 *
 *   1. Silk      (Backgrounds)  WebGL shader, verbatim, frame-driven
 *   2. Orb       (Backgrounds)  WebGL shader, verbatim, frame-driven
 *   3. CardSwap  (Components)   GSAP elastic timeline, evaluated per frame
 *
 * React Bits is MIT + Commons Clause: use in our videos, never redistribute.
 */

const SILK = 180;
const ORB = 180;
const SWAP = 330;
export const PORTED_TOTAL = SILK + ORB + SWAP;

const ez = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Blur-and-rise arrival for overlay type. */
const Arrive: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 22], [0, 1], {
    ...ez,
    easing: Easing.bezier(0.23, 1, 0.32, 1),
  });
  return (
    <div
      style={{
        opacity: p,
        filter: `blur(${(1 - p) * 10}px)`,
        transform: `translateY(${(1 - p) * 24}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const SilkScene: React.FC = () => (
  <AbsoluteFill>
    <Silk color="#7B7481" speed={5} scale={1} noiseIntensity={1.5} />
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#fff",
      }}
    >
      <Arrive at={12}>
        <div
          style={{
            fontFamily: sansFont,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.32em",
            opacity: 0.8,
            marginBottom: 36,
          }}
        >
          REFINA AI
        </div>
      </Arrive>
      <Arrive at={24}>
        <div
          style={{
            fontFamily: serifUprightFont,
            fontWeight: 400,
            fontSize: 110,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          See it on your
          <br />
          own face first.
        </div>
      </Arrive>
    </AbsoluteFill>
  </AbsoluteFill>
);

const ORB_SIZE = 1040;

const OrbScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#060608" }}>
    <Orb
      size={ORB_SIZE}
      hue={0}
      hover={1}
      hoverIntensity={0.3}
      backgroundColor="#060608"
      style={{ left: (1080 - ORB_SIZE) / 2, top: (1920 - ORB_SIZE) / 2 }}
    />
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#fff",
      }}
    >
      <Arrive at={18}>
        <div style={{ fontFamily: displayFont, fontWeight: 300, fontSize: 76 }}>
          Refina AI
        </div>
      </Arrive>
      <Arrive at={30}>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 300,
            fontSize: 34,
            opacity: 0.6,
            marginTop: 14,
          }}
        >
          reading your proportions
        </div>
      </Arrive>
    </AbsoluteFill>
  </AbsoluteFill>
);

const SCREENS = [
  "creating-preview",
  "your-result",
  "cosmetic-preview-ours",
  "dossier-1",
];

const SwapScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: SAGE }}>
    <Arrive at={6} style={{ position: "absolute", top: 150, left: 0, right: 0 }}>
      <div
        style={{
          textAlign: "center",
          color: "#fff",
          fontFamily: displayFont,
          fontWeight: 300,
          fontSize: 72,
          lineHeight: 1.15,
        }}
      >
        Your face.
        <br />
        Your preview.
      </div>
    </Arrive>
    <div style={{ position: "absolute", left: 220, top: 660 }}>
      <CardSwap
        width={480}
        height={1040}
        cardDistance={80}
        verticalDistance={80}
        first={0.8}
        every={3}
        cardStyle={{ borderRadius: 28, border: "2px solid #fff" }}
      >
        {SCREENS.map((s) => (
          <Img
            key={s}
            src={staticFile(`refina-ui/screens_trim/${s}.png`)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        ))}
      </CardSwap>
    </div>
  </AbsoluteFill>
);

const PortedLabBody: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence durationInFrames={SILK}>
      <SilkScene />
    </Sequence>
    <Sequence from={SILK} durationInFrames={ORB}>
      <OrbScene />
    </Sequence>
    <Sequence from={SILK + ORB} durationInFrames={SWAP}>
      <SwapScene />
    </Sequence>
  </AbsoluteFill>
);

export const PortedLab: React.FC = () => (
  <Composition
    id="PortedLab"
    component={PortedLabBody}
    durationInFrames={PORTED_TOTAL}
    fps={30}
    width={1080}
    height={1920}
  />
);
