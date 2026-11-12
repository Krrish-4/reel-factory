import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { sansFont } from "../../fonts";
import { MONO, Mono } from "./atoms";

/**
 * "Not across a desk from someone with a price list and a waiting room."
 *
 * The consultation, as furniture: a price list and an empty row of chairs.
 *
 * NOTHING ON THE CARD IS A CLAIM. The figures are redacted blocks, not numbers
 * — inventing a price would put a made-up cost for real surgery on screen, and
 * this repo does not invent facts (CLAUDE.md, content rules). The procedure
 * names are real, and are the ones the app itself lists, because a card of
 * nothing but grey bars reads as an abstraction rather than as a price list.
 * The card is headed CLINIC, carries no Refina mark, and is deliberately the
 * only white, cold object in the reel: everywhere else white means the app.
 *
 * It is also the only beat drawn rather than photographed, which is why it
 * cuts so hard against `athome` immediately before it.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The app's own procedure list. Names only — every figure is redacted. */
const ROWS = [
  "Rhinoplasty",
  "Facelift (Rhytidectomy)",
  "Upper Blepharoplasty",
] as const;

/** A redacted figure: the shape of a price, with no price in it. */
const Redacted: React.FC<{ blocks: number; from: number }> = ({ blocks, from }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ fontFamily: MONO, fontSize: 31, color: "#2a3033", marginRight: 3 }}>
        $
      </div>
      {Array.from({ length: blocks }).map((_, i) => {
        const o = interpolate(frame - from - i * 2, [0, 6], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              width: 26,
              height: 31,
              borderRadius: 3,
              background: "#2a3033",
              opacity: 0.82 * o,
            }}
          />
        );
      })}
    </div>
  );
};

const PriceCard: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        top: 442,
        width: 888,
        background: "#FFFFFF",
        borderRadius: 12,
        padding: "38px 46px 34px",
        opacity: p,
        transform: `translateY(${(1 - p) * 34}px)`,
        boxShadow: "0 26px 60px rgba(24,38,42,0.32)",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 21,
          letterSpacing: 4.5,
          color: "#78868b",
          paddingBottom: 22,
          borderBottom: "1px solid #E3E8E9",
        }}
      >
        CLINIC · PRICE LIST
      </div>

      {ROWS.map((r, i) => {
        const t = from + 12 + i * 9;
        const o = interpolate(frame - t, [0, 9], [0, 1], clamp);
        return (
          <div
            key={r}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "26px 0",
              borderBottom: "1px solid #EEF1F2",
              opacity: o,
            }}
          >
            <div style={{ fontFamily: sansFont, fontSize: 35, color: "#1d2224" }}>
              {r}
            </div>
            <Redacted blocks={4} from={t + 4} />
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 24,
          opacity: interpolate(frame - from - 42, [0, 9], [0, 1], clamp),
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            letterSpacing: 2.6,
            color: "#78868b",
          }}
        >
          FINANCING FROM
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Redacted blocks={3} from={from + 46} />
          <div style={{ fontFamily: MONO, fontSize: 26, color: "#2a3033" }}>/MO</div>
        </div>
      </div>
    </div>
  );
};

const Chair: React.FC<{ o: number; y: number }> = ({ o, y }) => (
  <svg
    width={148}
    height={174}
    viewBox="0 0 80 100"
    style={{ opacity: o, transform: `translateY(${y}px)` }}
  >
    <g
      fill="none"
      stroke="rgba(255,255,255,0.82)"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={15} y={10} width={50} height={42} rx={8} />
      <rect x={8} y={52} width={64} height={13} rx={5} />
      <path d="M16 65 L16 92 M64 65 L64 92" />
      <path d="M8 58 L2 58 M72 58 L78 58" />
    </g>
  </svg>
);

const ChairRow: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1104,
        display: "flex",
        justifyContent: "center",
        gap: 30,
      }}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const t = from + i * 6;
        const o = interpolate(frame - t, [0, 10], [0, 1], clamp);
        const y = interpolate(frame - t, [0, 14], [26, 0], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        return <Chair key={i} o={o} y={y} />;
      })}
    </div>
  );
};

export const PriceDesk: React.FC<{ from?: number }> = ({ from = 0 }) => (
  <AbsoluteFill>
    <PriceCard from={from} />
    <ChairRow from={from + 54} />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1318,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Mono size={21} style={{ opacity: 0.88 }}>
        AND A WAITING ROOM
      </Mono>
    </div>
  </AbsoluteFill>
);
