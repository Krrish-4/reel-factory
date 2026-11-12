import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { refina } from "../theme";
import { headlineItalicStack } from "../../fonts";
import {
  APP,
  ChromeI,
  I_WIN,
  MAUVE_DEEP,
  SAFE,
  Sparkle,
  captionType,
} from "../rec01/RefinaRec01";

/**
 * ugc-02 - "flip" UGC format, 2026-11-06. Rahul's brief:
 *
 *   mum reacts on the FRONT camera  ->  flips to the REAR camera  ->  a
 *   second-person shot of her daughter's hands opening Refina and tapping
 *   Cosmetic Preview (3s, the same clip in every reel of this format)  ->
 *   screen recording of the real app  ->  the 3D preview card.
 *
 * Hook (Rahul's words): "my daughter just showed me what I would look like
 * after a nose job". The daughter is making the preview FOR her mum, so the
 * recording taps "Someone Else", not "Myself".
 *
 * THE HANDS CLIP IS GENERATED, ITS SCREEN IS NOT. Omni Flash drew a garbled
 * Refina (two "Cosmetic Preview" cards, a made-up nav bar). work-ugc02/
 * track.py fits the screen quad per frame (RANSAC lines on the bright screen
 * blob's sides, so thumbs on the corners do not pull them in), and
 * composite.py warps the REAL splash + home screens onto it. Her finger is
 * kept by differencing each stabilised frame against a clean plate of the
 * home screen; the notch is kept from the footage. The home layout is pushed
 * down 150px (empty-state "Get started" dropped) so her tap, measured at 59%
 * of screen height, lands on the Cosmetic Preview card.
 *
 * The card is ugc01's (rec01 variant I, one procedure). Its turntable woman
 * is NOT the reaction woman - open, same as ugc01.
 */

const FPS = 30;
const f = (p: string) => staticFile(p);
const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// ── timeline (frames) ──────────────────────────────────────────────────
const REACT_END = 114; // 3.8s: past her gasp at 3.45-3.75s
const FLIP = 6; // frames each side of the camera flip
const HANDS_END = REACT_END + 91; // hands.mp4 is 3.04s; her tap lands ~f199
const WHO_END = HANDS_END + 30;
const TAP_SOMEONE = HANDS_END + 18;
const PHOTOS_END = WHO_END + 32;
const TAP_CONTINUE = WHO_END + 22;
const S = PHOTOS_END; // select screen starts
const SCROLL_1 = [S + 10, S + 30] as const;
const TAP_RHINO = S + 40;
const SCROLL_2 = [S + 54, S + 76] as const;
const TAP_GEN = S + 86;
const CREATING_2 = S + 94;
const CREATING_3 = S + 112;
const READY = S + 130;
const TAP_REVEAL = S + 142;
const CARD_AT = S + 150;
const TURN_LEN = 170; // of the 6.0s turntable
export const UGC02_TOTAL = CARD_AT + TURN_LEN;

// who.png / photos.png, measured (601-wide screen px)
const SOMEONE = { x: 38, y: 776, w: 525, h: 137, r: 24 };
const CONTINUE = { x: 36, y: 1167, w: 530, h: 72, r: 36 };

// ── the app screens, in screen pixels (601 wide) ──────────────────────
const SCREEN_W = 601;
const SCREEN_H = 1311; // one phone viewport
const K = 1920 / SCREEN_H; // screen px -> frame px
const SX = (1080 - SCREEN_W * K) / 2;
const SELECT_H = 2723;
const MAX_SCROLL = SELECT_H - SCREEN_H;
const STATUS_H = 72; // the status bar stays put while the page scrolls

// Measured off select.png / ready.png.
const RHINO = { x: 39, y: 1038, w: 525, h: 95, r: 16 };
const GEN = { x: 43, y: 2547, w: 517, h: 76, r: 38 };
const REVEAL = { x: 39, y: 1101, w: 524, h: 85, r: 42 };
const SCROLL_STOP = 640; // puts Rhinoplasty mid-screen

const scrollAt = (fr: number) =>
  fr < SCROLL_2[0]
    ? interpolate(fr, [...SCROLL_1], [0, SCROLL_STOP], {
        ...clamp,
        easing: Easing.out(Easing.cubic),
      })
    : interpolate(fr, [...SCROLL_2], [SCROLL_STOP, MAX_SCROLL], {
        ...clamp,
        easing: Easing.out(Easing.cubic),
      });

/** iOS screen-recording touch: a grey disc. x/y in screen px. */
const Touch: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) =>
  o <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: SX + x * K - 36,
        top: y * K - 36,
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "rgba(120,120,120,0.40)",
        border: "3px solid rgba(255,255,255,0.75)",
        opacity: o,
        zIndex: 10,
      }}
    />
  );

/** A tap: in for 3 frames, held, out for 4. */
const tapO = (fr: number, at: number) =>
  interpolate(fr, [at - 4, at - 1, at + 4, at + 8], [0, 1, 1, 0], clamp);

/** A swipe: the finger lands, drags with the page, lifts. */
const Swipe: React.FC<{ fr: number; span: readonly [number, number]; x: number; y0: number; dy: number }> = ({
  fr,
  span,
  x,
  y0,
  dy,
}) => {
  const [a, b] = span;
  const o = interpolate(fr, [a - 3, a, b - 6, b - 1], [0, 1, 1, 0], clamp);
  const t = interpolate(fr, [a, b - 4], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  return <Touch x={x} y={y0 - dy * t} o={o} />;
};

const Screen: React.FC<{ name: string }> = ({ name }) => (
  <Img
    src={f(`ui/${name}.png`)}
    style={{
      position: "absolute",
      left: SX,
      top: 0,
      width: SCREEN_W * K,
      height: SCREEN_H * K,
    }}
  />
);

const box = (b: { x: number; y: number; w: number; h: number; r: number }) =>
  ({
    position: "absolute",
    left: b.x * K,
    top: b.y * K,
    width: b.w * K,
    height: b.h * K,
    borderRadius: b.r * K,
  }) as const;

const SelectScreen: React.FC = () => {
  const fr = useCurrentFrame(); // absolute: not inside a Sequence
  const scroll = scrollAt(fr);
  const sel = interpolate(fr, [TAP_RHINO, TAP_RHINO + 5], [0, 1], clamp);
  const check = interpolate(fr, [TAP_RHINO + 1, TAP_RHINO + 9], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(2.2)),
  });
  const press = interpolate(
    fr,
    [TAP_GEN - 2, TAP_GEN + 1, TAP_GEN + 6],
    [1, 0.97, 1],
    clamp,
  );
  return (
    <AbsoluteFill style={{ background: "#FFFDFB" }}>
      <div
        style={{
          position: "absolute",
          left: SX,
          top: 0,
          width: SCREEN_W * K,
          height: 1920,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -scroll * K,
            width: SCREEN_W * K,
            height: SELECT_H * K,
          }}
        >
          <Img
            src={f("ui/select.png")}
            style={{ width: SCREEN_W * K, height: SELECT_H * K }}
          />
          {/* Rhinoplasty, selected: the reference-photo pill's pink, a mauve
              rule and the details check from Your Result. */}
          <div
            style={{
              ...box(RHINO),
              background: "rgb(250,232,229)",
              mixBlendMode: "multiply",
              opacity: sel,
            }}
          />
          <div
            style={{
              ...box(RHINO),
              border: `${2 * K}px solid ${APP.mauve}`,
              boxSizing: "border-box",
              opacity: sel,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: (RHINO.x + RHINO.w - 46) * K,
              top: (RHINO.y + RHINO.h / 2 - 15) * K,
              width: 30 * K,
              height: 30 * K,
              borderRadius: "50%",
              background: APP.check,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${check})`,
            }}
          >
            <svg width={18 * K} height={18 * K} viewBox="0 0 14 14">
              <path
                d="M3 7.4l2.6 2.6L11 4.4"
                stroke="#fff"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Generate Preview: disabled until a procedure is picked */}
          <div
            style={{
              ...box(GEN),
              background: "rgb(232,198,195)",
              mixBlendMode: "multiply",
              opacity: sel,
              transform: `scale(${press})`,
            }}
          />
        </div>
        {/* status bar, fixed */}
        <div
          style={{
            position: "absolute",
            top: 0,
            width: SCREEN_W * K,
            height: STATUS_H * K,
            overflow: "hidden",
            background: "#FFFDFB",
          }}
        >
          <Img
            src={f("ui/select.png")}
            style={{ width: SCREEN_W * K, height: SELECT_H * K }}
          />
        </div>
      </div>
      <Swipe fr={fr} span={SCROLL_1} x={330} y0={1000} dy={SCROLL_STOP} />
      <Touch
        x={300}
        y={RHINO.y + RHINO.h / 2 - SCROLL_STOP}
        o={tapO(fr, TAP_RHINO)}
      />
      <Swipe
        fr={fr}
        span={SCROLL_2}
        x={330}
        y0={1050}
        dy={MAX_SCROLL - SCROLL_STOP}
      />
      <Touch
        x={300}
        y={GEN.y + GEN.h / 2 - MAX_SCROLL}
        o={tapO(fr, TAP_GEN)}
      />
    </AbsoluteFill>
  );
};

const ReadyScreen: React.FC = () => {
  const fr = useCurrentFrame();
  const press = interpolate(
    fr,
    [TAP_REVEAL - 2, TAP_REVEAL + 1, TAP_REVEAL + 6],
    [0, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill style={{ background: "#FFFDFB" }}>
      <Screen name="ready" />
      <div
        style={{
          ...box(REVEAL),
          left: SX + REVEAL.x * K,
          background: "rgb(225,205,203)",
          mixBlendMode: "multiply",
          opacity: press,
        }}
      />
      <Touch
        x={300}
        y={REVEAL.y + REVEAL.h / 2}
        o={tapO(fr, TAP_REVEAL)}
      />
    </AbsoluteFill>
  );
};

// ── the reaction ───────────────────────────────────────────────────────

/** Snapchat's caption: a full-width translucent black bar, plain white
 *  system sans, regular weight, no corners (Rahul's reference, 2026-11-06).
 *  The bar grows to two lines rather than shrinking the type. */
const Caption: React.FC<{ text: string; top?: number; dark?: boolean }> = ({
  text,
  top = 1100,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      zIndex: 20,
      background: "rgba(0,0,0,0.55)",
      color: "#FFFFFF",
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 400,
      fontSize: 42,
      lineHeight: 1.3,
      padding: "16px 56px",
      textAlign: "center",
      textWrap: "balance",
    }}
  >
    {text}
  </div>
);

/** The iOS camera flip: the outgoing view turns away on Y and smears, the
 *  incoming one turns in from the other side. `dir` -1 = out, +1 = in. */
const flipStyle = (fr: number, at: number, dir: -1 | 1): React.CSSProperties => {
  const t =
    dir < 0
      ? interpolate(fr, [at - FLIP, at], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) })
      : interpolate(fr, [at, at + FLIP], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  return {
    transform: `perspective(1800px) rotateY(${dir * -90 * t}deg) scale(${1 - 0.08 * t})`,
    filter: `blur(${28 * t}px) brightness(${1 - 0.35 * t})`,
  };
};

// Flow's sparkle sits at ~x900 y1740 in both clips; scaling 1.13 about the
// top edge pushes it below frame (same fix as rec01 / ugc01).
const footage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: "scale(1.13)",
  transformOrigin: "50% 0%",
};

const Reaction: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={flipStyle(fr, REACT_END, -1)}>
        <OffthreadVideo
          src={f("reaction.mp4")}
          volume={(v) => interpolate(v, [REACT_END - 4, REACT_END], [1, 0], clamp)}
          style={footage}
        />
      </AbsoluteFill>
      <Caption text="my daughter just showed me what I would look like after a nose job" />
    </AbsoluteFill>
  );
};

const Hands: React.FC = () => {
  const fr = useCurrentFrame(); // absolute
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={flipStyle(fr, REACT_END, 1)}>
        <Sequence from={REACT_END} layout="none">
          <OffthreadVideo src={f("hands.mp4")} muted style={footage} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const WhoScreen: React.FC = () => {
  const fr = useCurrentFrame();
  const press = interpolate(fr, [TAP_SOMEONE - 2, TAP_SOMEONE + 1, TAP_SOMEONE + 8], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#FFFDFB" }}>
      <Screen name="who" />
      <div
        style={{
          ...box(SOMEONE),
          left: SX + SOMEONE.x * K,
          background: "rgb(228,214,212)",
          mixBlendMode: "multiply",
          opacity: press,
        }}
      />
      <Touch x={300} y={SOMEONE.y + SOMEONE.h / 2} o={tapO(fr, TAP_SOMEONE)} />
    </AbsoluteFill>
  );
};

const PhotosScreen: React.FC = () => {
  const fr = useCurrentFrame();
  const press = interpolate(fr, [TAP_CONTINUE - 2, TAP_CONTINUE + 1, TAP_CONTINUE + 6], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#FFFDFB" }}>
      <Screen name="photos" />
      <div
        style={{
          ...box(CONTINUE),
          left: SX + CONTINUE.x * K,
          background: "rgb(225,205,203)",
          mixBlendMode: "multiply",
          opacity: press,
        }}
      />
      <Touch x={300} y={CONTINUE.y + CONTINUE.h / 2} o={tapO(fr, TAP_CONTINUE)} />
    </AbsoluteFill>
  );
};

// ── the card: rec01 variant I, one procedure ───────────────────────────

// Where her head sits in the turntable's source pixels: hair top ~y210,
// chin ~y1120 (measured). v4's 720px window at 0.86 cut her off at the
// mouth; this one is 100px taller and zoomed out so the whole face, chin
// and a little neck show, with the caption still inside SAFE.bottom.
const WIN = { ...I_WIN, h: 820 };
const TURN_Z = 0.78;
const TURN_TOP = 150;
// The framing FOLLOWS the turn. In the opening profile her nose tip is at
// source x124, and a fixed centre put it 90px from the window edge, on the
// one reel whose subject is the nose. The centre eases from 470 (nose ~150px
// in) to the front-facing 565. Source x<0 is filled with the backdrop,
// sampled flat #EFEFEF on both edges, so the gap has no seam.
const TURN_CX_KEYS: [number[], number[]] = [
  [0, 2, 3, 4.5, 6].map((t) => t * FPS),
  [470, 540, 565, 525, 515],
];
const TURN_BG = "#EFEFEF"; // the backdrop as rendered (sampled at 0.78)

const Card: React.FC = () => {
  const fr = useCurrentFrame();
  // A dip, not a cross-dissolve: the cream ground covers the Ready screen
  // first, then the content rises onto it, so two screens' type never
  // overlap (v2 showed "Your Preview is Ready" through "Rhinoplasty").
  const ground = interpolate(fr - CARD_AT, [0, 4], [0, 1], clamp);
  const enter = interpolate(fr - CARD_AT, [3, 13], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const nameY = WIN.y + WIN.h + 30;
  const capY = nameY + 142 + 30;
  return (
    <AbsoluteFill
      style={{
        opacity: ground,
        background: [
          "radial-gradient(ellipse 70% 32% at 50% 36%, rgba(216,169,164,0.22), rgba(216,169,164,0) 75%)",
          "linear-gradient(180deg, #FCFAF7 0%, #F3ECE5 100%)",
        ].join(", "),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: SAFE.top,
          width: "100%",
          height: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          opacity: enter,
        }}
      >
        <Sparkle size={30} color={APP.check} />
        <span
          style={{
            fontFamily: refina.sans,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: 6,
            color: MAUVE_DEEP,
          }}
        >
          GENERATED BY
        </span>
        <span
          style={{
            fontFamily: refina.serifUpright,
            fontWeight: 600,
            fontSize: 40,
            color: APP.ink,
          }}
        >
          Refina AI
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: WIN.x,
          top: WIN.y,
          width: WIN.w,
          height: WIN.h,
          borderRadius: WIN.r,
          overflow: "hidden",
          background: TURN_BG,
          boxShadow:
            "0 2px 0 rgba(255,255,255,0.6), 0 36px 90px rgba(120,80,70,0.20)",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 50}px)`,
        }}
      >
        <Sequence from={CARD_AT} durationInFrames={TURN_LEN} layout="none">
          <OffthreadVideo
            src={f("turntable.mp4")}
            muted
            style={{
              position: "absolute",
              width: 1080 * TURN_Z,
              height: 1920 * TURN_Z,
              left:
                WIN.w / 2 -
                interpolate(fr - CARD_AT, TURN_CX_KEYS[0], TURN_CX_KEYS[1], {
                  ...clamp,
                  easing: Easing.inOut(Easing.sin),
                }) *
                  TURN_Z,
              top: -TURN_TOP * TURN_Z,
              maxWidth: "none",
            }}
          />
        </Sequence>
        <ChromeI />
      </div>

      <div
        style={{
          position: "absolute",
          top: nameY,
          width: "100%",
          textAlign: "center",
          opacity: enter,
        }}
      >
        <div
          style={{
            fontFamily: refina.sans,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: 5,
            color: MAUVE_DEEP,
          }}
        >
          YOUR PREVIEW
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: refina.serifUpright,
            fontWeight: 600,
            fontSize: 62,
            lineHeight: "72px",
            color: APP.ink,
          }}
        >
          Rhinoplasty
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: refina.sans,
            fontWeight: 500,
            fontSize: 26,
            letterSpacing: 4,
            color: APP.muted,
          }}
        >
          NOSE RESHAPING
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: capY,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: enter,
        }}
      >
        <div
          style={{ ...captionType(headlineItalicStack, 56), maxWidth: 820 }}
        >
          preview it on your own face in Refina, link in bio
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── the reel ───────────────────────────────────────────────────────────

const Ugc02: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence durationInFrames={REACT_END} name="reaction">
      <Reaction />
    </Sequence>
    {/* Screens and card read absolute frames, so they are shown with Gate,
        not a Sequence (which would restart useCurrentFrame at 0). */}
    <Gate from={REACT_END} to={HANDS_END}>
      <Hands />
    </Gate>
    <Gate from={HANDS_END} to={WHO_END}>
      <WhoScreen />
    </Gate>
    <Gate from={WHO_END} to={PHOTOS_END}>
      <PhotosScreen />
    </Gate>
    <Gate from={PHOTOS_END} to={CREATING_2}>
      <SelectScreen />
    </Gate>
    <Gate from={HANDS_END} to={PHOTOS_END}>
      <Caption text="she put in my photos" top={1420} dark />
    </Gate>
    <Gate from={PHOTOS_END} to={CREATING_2}>
      <Caption text="picked rhinoplasty" top={1420} dark />
    </Gate>
    <Gate from={CREATING_2} to={CARD_AT}>
      <Caption text="and then this came up" top={1270} dark />
    </Gate>
    <Gate from={CREATING_2} to={CREATING_3}>
      <AbsoluteFill style={{ background: "#FFFDFB" }}>
        <Screen name="creating2" />
      </AbsoluteFill>
    </Gate>
    <Gate from={CREATING_3} to={READY}>
      <AbsoluteFill style={{ background: "#FFFDFB" }}>
        <Screen name="creating3" />
      </AbsoluteFill>
    </Gate>
    <Gate from={READY} to={CARD_AT + 4}>
      <ReadyScreen />
    </Gate>
    <Gate from={CARD_AT} to={UGC02_TOTAL}>
      <Card />
    </Gate>

    <Sequence from={REACT_END - 5}>
      <Audio src={f("sfx/woosh-1.wav")} volume={0.35} />
    </Sequence>
    <Sequence from={TAP_SOMEONE}>
      <Audio src={f("sfx/mouse-click.wav")} volume={0.7} />
    </Sequence>
    <Sequence from={TAP_CONTINUE}>
      <Audio src={f("sfx/mouse-click.wav")} volume={0.7} />
    </Sequence>
    <Sequence from={TAP_RHINO}>
      <Audio src={f("sfx/toggle.wav")} volume={0.35} />
    </Sequence>
    <Sequence from={TAP_GEN}>
      <Audio src={f("sfx/mouse-click.wav")} volume={0.9} />
    </Sequence>
    <Sequence from={CREATING_2}>
      <Audio src={f("sfx/digital-loading.wav")} volume={0.25} />
    </Sequence>
    <Sequence from={TAP_REVEAL}>
      <Audio src={f("sfx/mouse-click.wav")} volume={0.9} />
    </Sequence>
    <Sequence from={CARD_AT - 4}>
      <Audio src={f("sfx/woosh-1.wav")} volume={0.45} />
    </Sequence>
  </AbsoluteFill>
);

/** Shows children between two absolute frames WITHOUT re-basing
 *  useCurrentFrame() - a nested Sequence would restart it at 0. */
const Gate: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({
  from,
  to,
  children,
}) => {
  const fr = useCurrentFrame();
  return fr >= from && fr < to ? <>{children}</> : null;
};

export const RefinaUgc02: React.FC = () => (
  <Composition
    id="RefinaUgc02"
    component={Ugc02}
    durationInFrames={UGC02_TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
