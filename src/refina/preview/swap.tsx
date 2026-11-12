import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ConvergePanels } from "./draw";
import { PhoneShell } from "./flood";
import { sansFont } from "../../fonts";

/**
 * "Try a different procedure / Change your mind / Change it back."
 *
 * This beat used to be a placeholder: it toggled hero2-before against
 * hero2-after with a fixed jaw ring, and its own comment admitted it could not
 * show "try a different procedure" because the per-procedure renders were of
 * the PREVIOUS hero. There is still no render of a second procedure on this
 * hero's face, so the beat carries the idea three other ways instead:
 *
 *   1. It inherits the merged split face from the previous beat at exactly the
 *      same geometry, so the seam is continuous across the cut. The seam is the
 *      whole point — it is what "change your mind" then moves.
 *   2. A procedure rail slides in and the selection moves. That is the literal
 *      "different procedure", carried by the control rather than the face.
 *   3. A ring marks the region each procedure works on, so the eye is sent to
 *      the eyelids for a blepharoplasty and the jaw for a facelift.
 *
 * Then it docks into the phone and the reverts happen there, which is where a
 * user would really do them.
 *
 * WHEN THE BLEPHAROPLASTY RENDER LANDS: pass it as `afterAlt` and the right
 * half genuinely changes on selection. Nothing else here has to move.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeInOut = Easing.inOut(Easing.cubic);

/* Composite geometry, matching ConvergePanels so the cut is invisible. */
const CX = 540;
const PANEL_W = 452;
const PANEL_H = 604;
const CENTRE_Y = 938;

/* Docked: the composite shrinks to the phone's screen width and sits under the
   chrome, with the details card beneath — the same layout as ProcedureSlide. */
const PHONE_W = 404;
const PHONE_H = PHONE_W * 2.318; // 936
const PHONE_TOP = 470;
const CHROME_H = 56;
const DOCK_SCALE = PHONE_W / PANEL_W; // 0.894
const DOCK_CENTRE_Y = PHONE_TOP + CHROME_H + (PANEL_H * DOCK_SCALE) / 2;

export type Procedure = { label: string; region: "jaw" | "eyes" };

export const PROCEDURES: Procedure[] = [
  { label: "Facelift (Rhytidectomy)", region: "jaw" },
  { label: "Upper Blepharoplasty", region: "eyes" },
];

/* Region rings, in unscaled composite frame coordinates. Derived from the
   measured face box in the source (x 382-1426, y 307-1351 of 1792x2400) mapped
   through the composite's own image transform, not eyeballed. */
const REGION = {
  eyes: { cx: CX, cy: 914, rx: 124, ry: 42 },
  jaw: { cx: CX, cy: 1126, rx: 152, ry: 76 },
} as const;

const Ring: React.FC<{ region: "jaw" | "eyes"; from: number }> = ({
  region,
  from,
}) => {
  const frame = useCurrentFrame();
  const r = REGION[region];
  const p = interpolate(frame - from, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (p <= 0) return null;
  const c = 2 * Math.PI * ((r.rx + r.ry) / 2);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <ellipse
        cx={r.cx}
        cy={r.cy}
        rx={r.rx}
        ry={r.ry}
        fill="none"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth={2.2}
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={c * (1 - p)}
      />
    </svg>
  );
};

/** The control that makes "a different procedure" visible. */
const Rail: React.FC<{ selected: number; from: number; y: number }> = ({
  selected,
  from,
  y,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 14,
        opacity: p,
        transform: `translateY(${(1 - p) * 22}px)`,
      }}
    >
      {PROCEDURES.map((proc, i) => {
        const on = i === selected;
        return (
          <div
            key={proc.label}
            style={{
              fontFamily: sansFont,
              fontSize: 26,
              padding: "13px 26px",
              borderRadius: 40,
              whiteSpace: "nowrap",
              background: on ? "#fff" : "rgba(255,255,255,0.10)",
              color: on ? "#1d2224" : "rgba(255,255,255,0.82)",
              border: on
                ? "1px solid #fff"
                : "1px solid rgba(255,255,255,0.34)",
            }}
          >
            {proc.label}
          </div>
        );
      })}
    </div>
  );
};

/** The app's Enhancement Details card, once docked. */
const DetailCard: React.FC<{ label: string; from: number }> = ({ label, from }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, 14], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        top: DOCK_CENTRE_Y + (PANEL_H * DOCK_SCALE) / 2 + 26,
        left: CX - PHONE_W / 2 + 20,
        width: PHONE_W - 40,
        background: "#fff",
        borderRadius: 16,
        padding: "17px 19px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
        boxShadow: "0 6px 18px rgba(30,30,32,0.06)",
      }}
    >
      <div
        style={{
          width: 23,
          height: 23,
          borderRadius: "50%",
          background: "#C89A9A",
          color: "#fff",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        ✓
      </div>
      <div style={{ fontFamily: sansFont, fontSize: 20, color: "#1a1a1c" }}>
        {label}
      </div>
    </div>
  );
};

export const SwapScene: React.FC<{
  before: string;
  after: string;
  /**
   * The SECOND procedure's render on the same face. Until this exists the
   * selection does not move: `after` is a facelift, so highlighting "Upper
   * Blepharoplasty" while showing it would label a facelift as an eyelid
   * surgery. The rail still appears — "try a different procedure" is carried by
   * showing that other procedures are on offer — but nothing claims a result
   * that has not been rendered.
   */
  afterAlt?: string;
  /** beat-local frames */
  switchAt?: number;
  dockAt?: number;
  dockDur?: number;
  revertAt?: number;
  restoreAt?: number;
  sweepDur?: number;
}> = ({
  before,
  after,
  afterAlt,
  switchAt = 12,
  dockAt = 30,
  dockDur = 18,
  revertAt = 48,
  restoreAt = 80,
  sweepDur = 20,
}) => {
  const frame = useCurrentFrame();

  const selected = afterAlt && frame >= switchAt ? 1 : 0;
  const proc = PROCEDURES[selected];
  const rightHalf = selected === 1 && afterAlt ? afterAlt : after;

  const dock = interpolate(frame, [dockAt, dockAt + dockDur], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });

  /* The seam: 0.5 is the centred split it inherits. It sweeps right to 1
     (all ORIGINAL) on "change your mind", then back left to 0 (all PREVIEW)
     on "change it back" — the two lines are literally opposite moves. */
  const toOriginal = interpolate(frame, [revertAt, revertAt + sweepDur], [0.5, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const seamValue =
    frame < revertAt
      ? 0.5
      : frame < restoreAt
        ? toOriginal
        : interpolate(frame, [restoreAt, restoreAt + sweepDur], [1, 0], {
            ...clamp,
            easing: easeInOut,
          });

  const scale = 1 + (DOCK_SCALE - 1) * dock;
  const centreY = CENTRE_Y + (DOCK_CENTRE_Y - CENTRE_Y) * dock;

  return (
    <AbsoluteFill>
      {/* the phone grows in behind the face as it docks */}
      {dock > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: CX - PHONE_W / 2,
            top: PHONE_TOP,
            width: PHONE_W,
            height: PHONE_H,
            opacity: dock,
            transform: `scale(${0.94 + 0.06 * dock})`,
            transformOrigin: "50% 30%",
          }}
        >
          <PhoneShell width={PHONE_W} chrome="light">
            <AbsoluteFill style={{ background: "#FFFDFB" }} />
          </PhoneShell>
        </div>
      ) : null}

      {/* the composite, inherited from the previous beat and then docked */}
      <ConvergePanels
        before={before}
        after={rightHalf}
        still={0}
        converge={0}
        seam={seamValue}
        scale={scale}
        centreY={centreY}
      />

      {/* region ring — rides the composite's own transform so it stays on the
          face through the dock */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${scale})`,
          transformOrigin: `${CX}px ${centreY}px`,
          opacity: 1 - dock,
        }}
      >
        <Ring region={proc.region} from={selected === 0 ? 0 : switchAt} />
      </div>

      {dock < 0.5 ? (
        <div style={{ opacity: 1 - dock * 2 }}>
          <Rail selected={selected} from={2} y={1330} />
        </div>
      ) : null}

      {dock > 0.5 ? <DetailCard label={proc.label} from={dockAt + dockDur} /> : null}
    </AbsoluteFill>
  );
};
