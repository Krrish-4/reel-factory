import React from "react";
import { Img, useCurrentFrame } from "remotion";
import { portrait } from "../protocol/atoms";
import { sansFont } from "../../fonts";

/**
 * The hook: a flood of other people's before-and-afters.
 *
 * The line is "based on someone else's before-and-afters" — plural, endless —
 * so the frame gets flooded rather than shown three polite cards. Each person's
 * before and after sit next to each other in the schedule, so at speed the face
 * visibly *pops* younger; that only works because every pair is framing-locked
 * to itself. `hero-before` / `hero-advisor` is the previous hero, freed up now
 * that she is no longer the subject.
 *
 * Cadence ramps from ~11 frames per image down to 2 (the reference's montage
 * rate). Starting slow lets the viewer register what they are looking at before
 * it becomes a blur — going straight to 2 reads as a glitch, not a flood.
 *
 * The flood plays inside a phone, not on a bare card: the argument of the beat
 * is that you are *scrolling* strangers' results, and the same device comes
 * back two beats later running the app. Chrome (island, status bar, home
 * indicator) is what makes it read as a phone rather than a photo — the app
 * beats get it for free because their screenshots carry a real status bar.
 */

/* The originals, used as supplied — no cropping, rescaling or head alignment.
   Aspects run 0.746-0.800, close enough to sit consistently on their own. */
export const FLOOD_ITEMS = [
  "flood-01b", "flood-01a",
  "alt-before", "hero-advisor",     // the previous hero
  "front-before", "front-after",
  "flood 8 before", "flood8 after",
  "flood 9 before", "flood 9 after",
  "flood10",                        // unpaired — a single flash
] as const;

/** frame -> which item is showing, with the hold shrinking as it accelerates */
const buildSchedule = (total: number, slow: number, fast: number) => {
  const out: number[] = [];
  let i = 0;
  while (out.length < total) {
    const t = out.length / total;
    const hold = Math.max(fast, Math.round(slow - (slow - fast) * t));
    for (let k = 0; k < hold && out.length < total; k++) out.push(i % FLOOD_ITEMS.length);
    i++;
  }
  return out;
};

const SCHEDULE = buildSchedule(112, 11, 2);

/* iOS chrome, in fractions of the screen width so it stays right at any size.
   Measured off a 393pt iPhone screen: island 125x36 at y11, status text 17pt. */
const StatusBar: React.FC<{ w: number; tone?: string }> = ({ w, tone = "#fff" }) => {
  const centre = w * 0.074; // island's vertical centre — the row sits on it
  const icon = w * 0.038;
  return (
    <>
      {/* dynamic island */}
      <div
        style={{
          position: "absolute",
          top: w * 0.028,
          left: "50%",
          transform: "translateX(-50%)",
          width: w * 0.315,
          height: w * 0.092,
          borderRadius: 999,
          background: tone === "#fff" ? "#000" : "#0a0d0e",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: centre - w * 0.03,
          left: w * 0.075,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 600,
          fontSize: w * 0.043,
          lineHeight: 1.4,
          color: tone,
          letterSpacing: "0.01em",
        }}
      >
        9:41
      </div>
      <div
        style={{
          position: "absolute",
          top: centre - icon * 0.5,
          right: w * 0.075,
          display: "flex",
          alignItems: "center",
          gap: w * 0.017,
          height: icon,
        }}
      >
        {/* cellular */}
        <svg width={icon * 1.15} height={icon} viewBox="0 0 18 12" fill={tone}>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wifi */}
        <svg width={icon * 1.15} height={icon} viewBox="0 0 16 12" fill="none" stroke={tone} strokeWidth="1.7" strokeLinecap="round">
          <path d="M1.2 4.2a10 10 0 0 1 13.6 0" />
          <path d="M4 6.9a6.2 6.2 0 0 1 8 0" />
          <circle cx="8" cy="10.2" r="1.1" fill={tone} stroke="none" />
        </svg>
        {/* battery */}
        <svg width={icon * 1.7} height={icon} viewBox="0 0 26 12" fill="none">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3" stroke={tone} strokeOpacity="0.55" strokeWidth="1.2" />
          <rect x="2.2" y="2.2" width="16" height="7.6" rx="1.8" fill={tone} />
          <path d="M23.4 4.3c1.1.3 1.6 1 1.6 1.7s-.5 1.4-1.6 1.7z" fill={tone} fillOpacity="0.55" />
        </svg>
      </div>
    </>
  );
};

/** The device: white edge to match the app phone, iOS chrome over the photo. */
export const PhoneShell: React.FC<{
  width: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  /** "photo" = white chrome over scrims; "light" = dark chrome on an app screen */
  chrome?: "photo" | "light";
}> = ({ width, children, style, chrome = "photo" }) => (
  <div
    style={{
      width,
      height: width * 2.318,
      borderRadius: width * 0.099, // 40 at the app phone's 404
      overflow: "hidden",
      border: "2px solid rgba(255,255,255,0.85)",
      background: chrome === "light" ? "#F7F8F8" : "#B4C4C8",
      boxShadow: "0 26px 60px rgba(30,45,50,0.3)",
      position: "relative",
      ...style,
    }}
  >
    {children}
    {/* Chrome sits in its own layer above every screen. The screen layers
        carry z-indexes to order themselves, and a positioned element with an
        explicit z-index paints above one with `auto` whatever the DOM order —
        so without this the island and status bar were being covered. */}
    <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
    {chrome === "photo" ? (
      <>
    {/* scrims — the photo underneath changes every 2 frames, so the chrome
        needs its own contrast rather than relying on any one image */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: width * 0.24,
        background: "linear-gradient(rgba(0,0,0,0.42), rgba(0,0,0,0))",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: width * 0.13,
        background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.34))",
      }}
        />
      </>
    ) : null}
    <StatusBar w={width} tone={chrome === "light" ? "#1d2224" : "#fff"} />
    {/* home indicator */}
    <div
      style={{
        position: "absolute",
        bottom: width * 0.021,
        left: "50%",
        transform: "translateX(-50%)",
        width: width * 0.34,
        height: Math.max(4, width * 0.0125),
        borderRadius: 999,
        background:
          chrome === "light" ? "rgba(20,26,28,0.55)" : "rgba(255,255,255,0.92)",
      }}
    />
    </div>
  </div>
);

/** Just the post — the device that hosts it lives in device.tsx now. */
export const FloodScreen: React.FC<{ from?: number; w?: number }> = ({
  from = 0,
  w = 440,
}) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0) return null;
  const idx = SCHEDULE[Math.min(t, SCHEDULE.length - 1)];

  // app-post layout: the portrait keeps its true 3:4 shape at full screen
  // width, with generic feed chrome above and below. No crop into the head, no
  // upscaling, and nothing invented to fill the 9:16 — which is what the blur
  // and the replicated turtleneck were both doing.
  const W = w;
  const bar = (w: number, h: number, o: number) => (
    <div style={{ width: w, height: h, borderRadius: 999, background: `rgba(29,34,36,${o})` }} />
  );

  return (
    <div
          style={{
            position: "absolute",
            inset: 0,
            paddingTop: W * 0.2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* header */}
          <div
            style={{
              height: W * 0.14,
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `0 ${W * 0.055}px`,
            }}
          >
            {bar(W * 0.055, W * 0.055, 0.28)}
            <div
              style={{
                fontFamily: sansFont,
                fontWeight: 600,
                fontSize: W * 0.036,
                letterSpacing: "0.14em",
                color: "rgba(29,34,36,0.62)",
              }}
            >
              RESULTS
            </div>
            {bar(W * 0.055, W * 0.012, 0.28)}
          </div>

          {/* the photo exactly as supplied — full width, its own height */}
          <Img
            src={portrait(FLOOD_ITEMS[idx])}
            style={{ width: "100%", height: "auto", display: "block", flex: "0 0 auto" }}
          />

          {/* caption + actions follow the photo, whatever height it came out */}
          <div
            style={{
              flex: "1 1 auto",
              display: "flex",
              flexDirection: "column",
              gap: W * 0.045,
              padding: `${W * 0.05}px ${W * 0.055}px 0`,
            }}
          >
            <div style={{ display: "flex", gap: W * 0.045, alignItems: "center" }}>
              {bar(W * 0.05, W * 0.05, 0.34)}
              {bar(W * 0.05, W * 0.05, 0.34)}
              {bar(W * 0.05, W * 0.05, 0.34)}
            </div>
            {bar(W * 0.62, W * 0.022, 0.22)}
            {bar(W * 0.44, W * 0.022, 0.16)}
          </div>
    </div>
  );
};
