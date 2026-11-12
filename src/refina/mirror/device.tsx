import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { screen } from "../protocol/atoms";
import { ScrollReveal, SliderReveal } from "../protocol/motion";
import { PhoneShell } from "../preview/flood";
import { BEATS } from "./words";

/**
 * One phone for the product section (`built` -> `step3`), drawn once.
 *
 * Same fixture idea as `preview/device.tsx`: the device is persistent and only
 * its SCREEN changes, so the app stages read as one session rather than as four
 * unrelated beats each sliding a fresh phone in. Everything here is the real
 * app — `public/refina-ui/screens_trim/`, captured from the Figma flow.
 *
 * The difference from the preview reel's version is that every stage frame is
 * read from `BEATS`, which is generated from the script, instead of being a
 * local constant. When the voiceover lands and the cues move, the screens move
 * with the words on their own.
 */

export const DEVICE_W = 440;
export const DEVICE_H = DEVICE_W * 2.318;
/** pushed down so the two-line headline clears the device's top edge */
export const DEVICE_DY = 44;

export const DEVICE_START = BEATS.built[0];
export const DEVICE_END = BEATS.step3[1];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* Every capture already has an iOS status bar burnt into it and the shell draws
   its own, so the captured one has to be hidden — but simply shifting the image
   up drags the app's header into the island. The screen content is seated BELOW
   the chrome in its own box, over-scaled inside it, and pulled up by exactly its
   own status bar. */
const CHROME_H = 60;
const CROP_TOP = 0.06;

const Screen: React.FC<{ name: string }> = ({ name }) => {
  const boxH = DEVICE_H - CHROME_H;
  const imgH = boxH / (1 - CROP_TOP);
  return (
    <div
      style={{
        position: "absolute",
        top: CHROME_H,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      <Img
        src={screen(name)}
        style={{
          position: "absolute",
          top: -CROP_TOP * imgH,
          left: 0,
          width: "100%",
          height: imgH,
          objectFit: "cover",
          objectPosition: "50% 0%",
        }}
      />
    </div>
  );
};

export const MirrorDevice: React.FC = () => {
  // Absolute composition frames — this component is mounted inside a Sequence
  // starting at DEVICE_START, so shift back into the reel's own clock.
  const f = useCurrentFrame() + DEVICE_START;

  const F_SPLASH = BEATS.built[0];
  const F_UPLOAD = BEATS.step1[0];
  const F_PROCS = BEATS.step2[0];
  const F_RESULT = BEATS.step3[0];

  // the device breathes across the session so it is never dead, and takes a
  // small "press" dip as the app launches
  const drift = interpolate(f, [DEVICE_START, DEVICE_END], [1, 1.045], clamp);
  const press = interpolate(
    f,
    [F_SPLASH + 2, F_SPLASH + 9, F_SPLASH + 20],
    [1, 0.978, 1],
    { ...clamp, easing: Easing.out(Easing.quad) },
  );

  const launch = interpolate(f, [F_SPLASH, F_SPLASH + 14], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const splashOut = interpolate(f, [F_UPLOAD - 8, F_UPLOAD], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  const stage = f >= F_RESULT ? "result" : f >= F_PROCS ? "procs" : "upload";

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <PhoneShell
        width={DEVICE_W}
        chrome="light"
        style={{ transform: `translateY(${DEVICE_DY}px) scale(${drift * press})` }}
      >
        {/* status-bar ground: every captured screen is #FFFDFB beneath its own
            status bar. Above the screens, below the chrome. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: CHROME_H,
            background: "#FFFDFB",
            zIndex: 5,
          }}
        />

        {/* Refina launching */}
        {f < F_UPLOAD ? (
          <AbsoluteFill
            style={{
              zIndex: 2,
              opacity: launch * (1 - splashOut),
              transform: `scale(${0.86 + 0.14 * launch})`,
            }}
          >
            <Screen name="refina-splash" />
          </AbsoluteFill>
        ) : null}

        {/* the app itself. The reference cuts between UI stages rather than
            dissolving them, so these are hard swaps. */}
        <AbsoluteFill style={{ zIndex: 0, background: "#fff" }}>
          {stage === "upload" ? <Screen name="reference-photos" /> : null}
          {stage === "procs" ? (
            <ScrollReveal
              from={F_PROCS - DEVICE_START}
              dur={22}
              distance={180}
              width={DEVICE_W}
              height={DEVICE_H}
            >
              <Img
                src={screen("select-procedures")}
                style={{ width: DEVICE_W, display: "block" }}
              />
            </ScrollReveal>
          ) : null}
          {stage === "result" ? (
            <SliderReveal
              before={<Screen name="your-result-before" />}
              after={<Screen name="your-result-after" />}
              from={F_RESULT - DEVICE_START + 20}
              dur={48}
              width={DEVICE_W}
              height={DEVICE_H}
              dividerTop={74}
              dividerBottom={360}
              cursor
            />
          ) : null}
        </AbsoluteFill>
      </PhoneShell>
    </AbsoluteFill>
  );
};
