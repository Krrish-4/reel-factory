import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { portrait, screen } from "../protocol/atoms";
import { ScrollReveal, SliderReveal } from "../protocol/motion";
import { FloodScreen, PhoneShell } from "./flood";
import { sansFont } from "../../fonts";

/**
 * One phone, drawn once, for the reel's whole first third (f0-f692).
 *
 * Previously each beat drew its own device — the flood used a 440px PhoneShell,
 * the app beats a separate 404px Phone — and every beat slid a fresh one in.
 * That is why nothing could "arrive" anywhere: there was no persistent object
 * to arrive into, and the size changed under you at f337.
 *
 * Now the device is a fixture and only its SCREEN changes. That is also the
 * story: you scroll strangers' results, you stop on your own face, you open
 * Refina, you use it.
 *
 * Screen changes use the reference's measured vocabulary (see
 * docs/qoves-motion-reference.md): 7-14 frame scale/reveals with easeOut cubic
 * for arrivals, easeIn cubic for departures, and abrupt cuts between app stages
 * — the reference cuts its UI rather than dissolving it.
 */

export const DEVICE_W = 440;
export const DEVICE_H = DEVICE_W * 2.318; // 1020
/** pushed down so the two-line headline clears the device's top edge */
export const DEVICE_DY = 44;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* Beat frames this device spans. Kept here so screen changes land exactly on
   the voiceover boundaries the cue map already fixed. */
const F_VIDEO = 140;
const F_SPLASH = 289;
const F_UPLOAD = 337;
const F_PROCS = 389;
const F_RESULT = 430;
const F_LIST = 539;
export const DEVICE_END = 692;

/* Every capture already has an iOS status bar burnt into it, and the shell
   draws its own — so the captured one has to be hidden or two clocks overlap.
   Hiding it is not enough on its own either: simply shifting the image up drags
   the app's header into the island. So the screen content is seated BELOW the
   chrome in its own box, and the image is over-scaled inside that box and
   pulled up by exactly its own status bar. */
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

/* The naming beat: one before/after per procedure, in the app, each labelled
   the way the result screen labels its own.

   These were three equal 31-frame slides, which assumed the narrator names the
   procedures at an even rate. He does not. Measured bursts (silencedetect at
   noise=-30dB:d=0.06) are:

     f599-615   "rhinoplasty,"
     f635-662   "facelift, eyelid surgery,"
     f672-685   "and more"

   so "facelift" lands at f635 and "eyelid surgery" at ~f645 — only ten frames
   apart, while the slides were changing at 630 and 661. The eyelid slide was
   arriving 16 frames after its name. Spans now follow the read: a long first
   slide while he leans on "rhinoplasty", a quick second, then the third holds
   through "and more". Each label is on screen while its own name is spoken.

   That per-word derivation was wrong, and it is worth saying why because it
   looked rigorous. The measured gaps between the names are 36 / 8 / 28 frames:
   the narrator says "facelift, eyelid surgery," as one fast 0.87s burst, so
   aligning each slide to its own name gave facelift 15 frames — shorter than
   its own 12-frame wipe. It never had time to read. Three visuals cannot each
   land on a name that is 8 frames from the next one; this beat is a montage
   illustrating a list, not three synced hits, so the window is simply split
   evenly and every procedure gets the same 51 frames.

   RHINOPLASTY LEADS ITS NAME BY 2s, ON PURPOSE — do not "correct" it back.
   Measurement says the old f599 start already landed on the spoken word (the
   cut sat on the frame the burst starts, verified against the render's own
   audio) and it still played as late on screen, so the cut as heard in the room
   wins over the metric. The reveal has settled before the word arrives instead
   of the viewer waiting on it. F_LIST moves with the first span, which also
   shortens the dead hold on the hero's result from 89 frames to 29.

   These are BOUNDARIES, not start+length pairs — editing one number moves two
   clips. Changing only the first entry once stretched rhinoplasty from 34 to 94
   frames instead of shifting it. */
const PROC_SPANS = [539, 590, 641, 692];

const PROC_SLIDES = [
  { b: "flood-06b", a: "flood-06a", label: "Rhinoplasty", wipe: 20 },
  /* was 12 only because this slide had 15 frames to live in; it has 51 now */
  { b: "flood-04b", a: "flood-04a", label: "Facelift (Rhytidectomy)", wipe: 20 },
  { b: "flood-05b", a: "flood-05a", label: "Upper Blepharoplasty", wipe: 20 },
];

const PHOTO_H = Math.round(DEVICE_W / 0.757); // the pairs are all 760x1004

const ProcedureSlide: React.FC<{
  before: string;
  after: string;
  label: string;
  from: number;
  wipe: number;
}> = ({ before, after, label, from, wipe }) => (
  <AbsoluteFill style={{ background: "#FFFDFB" }}>
    <div style={{ position: "absolute", top: CHROME_H, left: 0, width: DEVICE_W, height: PHOTO_H }}>
      <SliderReveal
        before={<Img src={portrait(before)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        after={<Img src={portrait(after)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        from={from}
        dur={wipe}
        width={DEVICE_W}
        height={PHOTO_H}
        cursor
      />
    </div>
    {/* mirrors the result screen's Enhancement Details card */}
    <div
      style={{
        position: "absolute",
        top: CHROME_H + PHOTO_H + 26,
        left: 22,
        right: 22,
        background: "#fff",
        borderRadius: 18,
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 6px 18px rgba(30,30,32,0.06)",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "#C89A9A",
          color: "#fff",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✓
      </div>
      <div style={{ fontFamily: sansFont, fontSize: 23, color: "#1a1a1c" }}>{label}</div>
    </div>
  </AbsoluteFill>
);

export const DeviceSession: React.FC = () => {
  const f = useCurrentFrame();

  // the device breathes across the whole session so it is never dead, and
  // takes a small "press" dip when the app is launched
  const drift = interpolate(f, [0, DEVICE_END], [1, 1.045], clamp);
  const press = interpolate(
    f,
    [F_SPLASH - 4, F_SPLASH + 3, F_SPLASH + 14],
    [1, 0.978, 1],
    { ...clamp, easing: Easing.out(Easing.quad) },
  );

  /* ── the flood, flicked away like a feed ─────────────────────────── */
  // scrolls up and out fast, decelerating hard: the literal "stop scrolling"
  const flick = interpolate(f, [F_VIDEO, F_VIDEO + 16], [0, -1], {
    ...clamp,
    easing: Easing.out(Easing.poly(5)),
  });

  /* ── app launch: the splash scales up over the video ─────────────── */
  const launch = interpolate(f, [F_SPLASH, F_SPLASH + 14], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  // then the splash clears to reveal the app itself
  const splashOut = interpolate(f, [F_UPLOAD - 8, F_UPLOAD], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  const appStage =
    f >= F_LIST ? "list" : f >= F_RESULT ? "result" : f >= F_PROCS ? "procs" : "upload";

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <PhoneShell
        width={DEVICE_W}
        chrome={f >= F_VIDEO && f < F_SPLASH ? "photo" : "light"}
        style={{ transform: `translateY(${DEVICE_DY}px) scale(${drift * press})` }}
      >
        {/* 1 — the flood, on top until it is flicked away */}
        {f < F_VIDEO + 17 ? (
          <AbsoluteFill
            style={{
              background: "#F7F8F8",
              transform: `translateY(${flick * DEVICE_H}px)`,
              zIndex: 3,
            }}
          >
            <FloodScreen from={6} w={DEVICE_W} />
          </AbsoluteFill>
        ) : null}

        {/* 2 — her, underneath the flood the whole time */}
        {/* Its own Sequence: OffthreadVideo plays against the enclosing
            sequence's clock, and this device starts at frame 0. Without this
            the clip was already 4s in at composition frame 0, ran off the end
            of the 10s source around f180 and froze there for the rest of the
            beat. Mounting it conditionally does not reset its timeline. */}
        <Sequence from={F_VIDEO} durationInFrames={F_UPLOAD - F_VIDEO} layout="none">
          <AbsoluteFill style={{ zIndex: 1 }}>
            <OffthreadVideo
              src={staticFile("hero-clip.mp4")}
              trimBefore={120}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
        </Sequence>

        {/* 3 — Refina launches over her */}
        {f >= F_SPLASH && f < F_UPLOAD ? (
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

        {/* status-bar ground: every captured screen is #FFFDFB beneath its own
            status bar. Above the screens, below the chrome. Not over the video,
            which should reach the top edge. */}
        {f < F_VIDEO || f >= F_SPLASH ? (
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
        ) : null}

        {/* 4 — the app itself. The reference cuts between UI stages rather
               than dissolving, so these are hard swaps. */}
        {f >= F_UPLOAD - 10 ? (
          <AbsoluteFill style={{ zIndex: 0, background: "#fff" }}>
            {appStage === "upload" ? <Screen name="reference-photos" /> : null}
            {appStage === "procs" ? (
              <ScrollReveal from={F_PROCS} dur={22} distance={180} width={DEVICE_W} height={DEVICE_H}>
                <Img src={screen("select-procedures")} style={{ width: DEVICE_W, display: "block" }} />
              </ScrollReveal>
            ) : null}
            {appStage === "result" ? (
              <SliderReveal
                before={<Screen name="your-result-before" />}
                after={<Screen name="your-result-after" />}
                from={F_RESULT + 26}
                dur={54}
                width={DEVICE_W}
                height={DEVICE_H}
                dividerTop={74}
                dividerBottom={360}
                cursor
              />
            ) : null}
            {appStage === "list"
              ? PROC_SLIDES.map((p, i) => {
                  const at = PROC_SPANS[i];
                  // The device is mounted for DEVICE_END + T so its plate can
                  // travel off screen. Past the final boundary every slide used
                  // to return null and the white background showed through —
                  // the phone went blank white for the whole 25-frame exit,
                  // right as the reasons card came in behind it. The last slide
                  // holds instead, so the device leaves with a picture on it.
                  const last = i === PROC_SLIDES.length - 1;
                  const end = last ? Infinity : PROC_SPANS[i + 1];
                  // a short slide has no room for a 4-frame lead-in
                  const lead = PROC_SPANS[i + 1] - at >= 24 ? 4 : 1;
                  return f >= at && f < end ? (
                    <ProcedureSlide
                      key={p.label}
                      before={p.b}
                      after={p.a}
                      label={p.label}
                      from={at + lead}
                      wipe={p.wipe}
                    />
                  ) : null;
                })
              : null}
          </AbsoluteFill>
        ) : null}
      </PhoneShell>
    </AbsoluteFill>
  );
};
