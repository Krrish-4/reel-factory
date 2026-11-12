import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAGE, Stage, portrait } from "../protocol/atoms";
import { SectionHeadline } from "../preview/draw";
import { Plate } from "../preview/plate";
import {
  FaceMesh,
  RadialFan,
  StaggerGrid,
  TargetReticle,
  TypewriterInput,
} from "../kit";
import { ScribbleCircle } from "../../components/remocn/scribble-circle";
import { headlineStack, sansFont } from "../../fonts";
import { anchor, labelOf } from "../anchors";
import { ChangedCaptions } from "./captions";
import { B, TOTAL, bf, len, line } from "./beats";
import { SHOTS } from "./shots";
import type { BeatProps } from "./shots";
import type { BeatName } from "./beats";

/**
 * "What Else Changed" — educational explainer, second visual language.
 *
 * THE FIRST CUT WAS ONE COMPOSITION, NINE TIMES. Two heads side by side, same
 * size, same position, dead centre, for sixty-one seconds. Gemini described six
 * of nine shots as "2-column split screen" and the other three as "centered X
 * on solid background", returned an EMPTY `notable_techniques`, and mapped every
 * animation in it back to a component we already owned. It also listed two
 * separate human subjects — the hook used a gallery pair and the teaching beats
 * used a generated woman, so the reel changed who the face was, three times, in
 * a film whose whole argument is "same face, one thing moved".
 *
 * So: ONE subject throughout, and a different composition AND a different SCALE
 * in every beat — full-bleed, radial, boxed diagram, two extreme close-ups,
 * mesh, instruction card, checklist. No split screen anywhere.
 *
 * Nothing here creeps or zooms to move a metric. Where the picture moves, it
 * moves because the thing being taught is moving: the lamp travels and the
 * light wipes down after it; the camera runs in along its track and her head
 * grows as it comes.
 *
 * NO STUDY IS CITED HERE, and that is a choice rather than a prohibition:
 * citing real, recorded research is allowed (see reel-script/REFERENCE.md and
 * gen/check-citations.py). This reel does not need one - it earns its authority
 * from photographic facts the viewer can reproduce with a phone and one lamp.
 * Nothing is medical advice; the subject is photography.
 */

const FPS = 30;

const at = (k: keyof typeof B) => ({
  from: B[k][0],
  durationInFrames: B[k][1] - B[k][0],
});
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ── assets ──────────────────────────────────────────────────────────
   One woman, cast once in `gen/conditions.toml`, re-photographed for each
   variable and given one procedure preview for the hook (`gen/hook.toml`).
   NO FILE HERE MAY BE A DIFFERENT PERSON — that was the last cut's worst bug
   and it is the one thing this reel cannot survive. */
// The only asset named in code, and only as a fallback: every beat gets its
// assets from shots.json. That is the point of the spec — changing which
// portrait a beat shows is a data edit, and the registry check verifies the
// claim on it.
const BEFORE = "demo1-before";

/* ── pieces ──────────────────────────────────────────────────────────── */

/**
 * TYPE FLOOR: 26px at 1080, which is about 9px on a phone.
 *
 * Judged at 390px — the width a viewer actually gets — every mono chip in this
 * reel was an unreadable smudge: the running index, "SAME FACE - NOTHING
 * TOUCHED", the reticle labels, and the compliance chip. They were 12-18px.
 * What DID read at that size was the serif caption, the 44px step numerals and
 * the 29px white chips, so the floor sits just under 29 and nowhere near 18.
 * Mono is the worst case because letterspacing thins it further.
 *
 * Anything below this is decoration. If it has to be read, it does not get to
 * be small.
 */
const Mono: React.FC<{ children: React.ReactNode; size?: number; o?: number }> = ({
  children,
  size = 26,
  o = 0.95,
}) => (
  <div
    style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: size,
      letterSpacing: 1.4,
      color: `rgba(255,255,255,${o})`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Tag: React.FC<{ children: React.ReactNode; size?: number; dim?: boolean }> = ({
  children,
  size = 26,
  dim,
}) => (
  <div
    style={{
      background: dim ? "rgba(18,26,30,0.5)" : "rgba(18,26,30,0.78)",
      border: `1px solid rgba(255,255,255,${dim ? 0.14 : 0.24})`,
      borderRadius: 6,
      padding: "11px 18px",
    }}
  >
    <Mono size={size} o={dim ? 0.62 : 0.95}>
      {children}
    </Mono>
  </div>
);

/**
 * A face filling its container, croppable.
 *
 * `zoom` and `focus` are what buy this reel its scale variety: the same
 * portrait is a full-bleed head in one beat and a crop of a jawline in the
 * next, so no two consecutive beats share a composition.
 */
const Face: React.FC<{
  name: string;
  zoom?: number;
  focus?: string;
  style?: React.CSSProperties;
}> = ({ name, zoom = 1, focus = "50% 32%", style }) => (
  <Img
    src={portrait(name)}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: focus,
      transform: `scale(${zoom})`,
      ...style,
    }}
  />
);

/**
 * One picture becoming another, across whatever box it is given.
 *
 * The seam direction carries meaning: a left/right wipe for a change that
 * happens in front of the camera, a top/bottom wipe for the light beat, because
 * that is the direction the lamp travelled. Small thing, but it makes the move
 * read as the lesson rather than as a transition effect.
 */
const Reveal: React.FC<{
  under: string;
  over: string;
  progress: number;
  dir?: "x" | "y";
  zoom?: number;
  focus?: string;
}> = ({ under, over, progress, dir = "x", zoom, focus }) => {
  const p = Math.max(0, Math.min(100, progress));
  const clip = dir === "x" ? `inset(0 ${100 - p}% 0 0)` : `inset(0 0 ${100 - p}% 0)`;
  return (
    <>
      <Face name={under} zoom={zoom} focus={focus} />
      <Face name={over} zoom={zoom} focus={focus} style={{ clipPath: clip }} />
      {p > 0.5 && p < 99.5 ? (
        <div
          style={{
            position: "absolute",
            ...(dir === "x"
              ? { left: `${p}%`, top: 0, bottom: 0, width: 2 }
              : { top: `${p}%`, left: 0, right: 0, height: 2 }),
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 0 16px rgba(0,0,0,0.4)",
          }}
        />
      ) : null}
    </>
  );
};

/** back and forth 0..100, never resting at either end */
const useSweep = (startFrame: number, period: number) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - startFrame);
  const c = (t % period) / period;
  const tri = c < 0.5 ? c * 2 : (1 - c) * 2;
  return interpolate(tri, [0, 1], [3, 97], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
};

/**
 * A reticle placed from the asset record rather than from frame pixels.
 *
 * `zoom` and `focus` must match what the beat hands `Face`/`Reveal`, because
 * the anchor replicates that composite. Passing the wrong zoom is now the only
 * way to misplace a callout, and it is a visible one-line mismatch rather than
 * four numbers that looked plausible.
 */
const Reticle: React.FC<{
  id: Parameters<typeof anchor>[0];
  region: Parameters<typeof anchor>[1];
  zoom?: number;
  focus?: [number, number];
  startFrame: number;
  label: string;
}> = ({ id, region, zoom = 1, focus = [0.5, 0.32], startFrame, label }) => {
  const r = anchor(id, region, { width: 1080, height: 1920 }, zoom, focus);
  return (
    <TargetReticle
      x={Math.round(r.x)}
      y={Math.round(r.y)}
      width={Math.round(r.width)}
      height={Math.round(r.height)}
      startFrame={startFrame}
      durationInFrames={18}
      label={label}
      crosshair
    />
  );
};

const Burst: React.FC<{
  lines: string[];
  from: number;
  hold: number;
  italicSecond?: boolean;
}> = ({ lines, from, hold, italicSecond }) => (
  <Sequence from={from} durationInFrames={hold} layout="none">
    <SectionHeadline lines={lines} len={hold} from={2} out={14} italicSecond={italicSecond} />
  </Sequence>
);

const VARS = ["LIGHT", "DISTANCE", "TILT", "EXPRESSION"] as const;

/** the running index, along the top where the frame is otherwise dead */
const VarStrip: React.FC<{ filled: number; startFrame?: number }> = ({
  filled,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div style={{ display: "flex", gap: 8, marginTop: 40 }}>
        {VARS.map((v, i) => {
          const on = i < filled;
          const s = spring({
            frame: frame - startFrame - i * 5,
            fps,
            durationInFrames: 13,
            config: { damping: 16, stiffness: 130, mass: 0.7 },
          });
          return (
            <div
              key={v}
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 22,
                letterSpacing: 1.2,
                padding: "9px 14px",
                borderRadius: 4,
                whiteSpace: "nowrap",
                background: on ? "rgba(255,255,255,0.93)" : "rgba(18,26,30,0.5)",
                color: on ? "#162024" : "rgba(255,255,255,0.55)",
                border: `1px solid ${on ? "#fff" : "rgba(255,255,255,0.22)"}`,
                transform: `scale(${interpolate(s, [0, 1], [0.9, 1], clamp)})`,
                opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
              }}
            >
              {v}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Bottom: React.FC<{ children: React.ReactNode; y?: number }> = ({
  children,
  y = 360,
}) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end" }}>
    <div style={{ marginBottom: y }}>{children}</div>
  </AbsoluteFill>
);

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
        volume * interpolate(f, [Math.max(0, dur - fade), dur - 1], [1, 0], clamp)
      }
    />
  </Sequence>
);

/** a drawn lamp travelling from in front of her to directly overhead */
const LightArc: React.FC<{ startFrame: number; dur: number }> = ({ startFrame, dur }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - startFrame, [0, dur], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const a = interpolate(p, [0, 1], [Math.PI / 2, 0]);
  const cx = 540;
  const cy = 810;
  const rx = 300;
  const ry = 470;
  const lx = cx - Math.sin(a) * rx;
  const ly = cy - Math.cos(a) * 0 - Math.sin(Math.PI / 2 - a) * ry;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path
          d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx} ${cy - ry}`}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={2}
          strokeDasharray="7 9"
        />
        <circle cx={lx} cy={ly} r={15} fill="#F4E7BE" />
        <circle cx={lx} cy={ly} r={29} fill="none" stroke="rgba(244,231,190,0.5)" strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: lx - 70, top: ly - 62, width: 140, textAlign: "center" }}>
        <Mono size={22} o={0.9}>KEY LIGHT</Mono>
      </div>
    </AbsoluteFill>
  );
};

/** a drawn camera running in along a track, for the distance beat */
const CameraTrack: React.FC<{ startFrame: number; dur: number }> = ({ startFrame, dur }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - startFrame);
  const c = (t % dur) / dur;
  const tri = c < 0.5 ? c * 2 : (1 - c) * 2;
  const p = interpolate(tri, [0, 1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const x = interpolate(p, [0, 1], [206, 812]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <line x1={186} y1={1150} x2={834} y2={1150} stroke="rgba(255,255,255,0.36)" strokeWidth={2} strokeDasharray="6 8" />
        <rect x={x - 25} y={1131} width={50} height={38} rx={5} fill="rgba(18,26,30,0.88)" stroke="rgba(255,255,255,0.85)" strokeWidth={2} />
        <circle cx={x} cy={1150} r={10} fill="none" stroke="#fff" strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: 160, top: 1178 }}>
        <Mono size={22} o={0.85}>2 M</Mono>
      </div>
      <div style={{ position: "absolute", left: 790, top: 1178 }}>
        <Mono size={22} o={0.85}>30 CM</Mono>
      </div>
    </AbsoluteFill>
  );
};

/* ── the compiler's tables ───────────────────────────────────────────── */

/** Sound, derived from the beat table — no absolute frame is typed. */
const SfxTrack: React.FC = () => (
  <>
    <Sfx name="transition/camera-shutter.wav" at={bf("hook")} volume={0.34} dur={26} />
    <Sfx name="transition/reverse-playback.wav" at={line("hook", 1)} volume={0.2} dur={30} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("hook", 2)} volume={0.2} dur={20} />
    <Sfx name="transition/woop.mp3" at={bf("claim", -2)} volume={0.26} dur={20} />
    <Sfx name="ui-tech/digital-loading.wav" at={line("claim", 1)} volume={0.2} dur={24} />
    <Sfx name="transition/deep-woosh.wav" at={bf("light", -2)} volume={0.26} dur={40} />
    <Sfx name="ui-tech/toggle.wav" at={line("light", 1)} volume={0.32} dur={8} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("light", 3)} volume={0.2} dur={20} />
    <Sfx name="transition/woosh-2.wav" at={bf("distance", -2)} volume={0.26} dur={26} />
    <Sfx name="ui-tech/glitchy-counter.mp3" at={line("distance", 1)} volume={0.15} dur={60} fade={22} />
    <Sfx name="transition/woosh-1.wav" at={bf("tilt", -2)} volume={0.26} dur={14} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("tilt", 1)} volume={0.2} dur={20} />
    <Sfx name="transition/woosh-1.wav" at={bf("express", -2)} volume={0.26} dur={14} />
    <Sfx name="action/paper-swipe.mp3" at={line("express", 1)} volume={0.18} dur={26} />
    <Sfx name="cinematic/hit.wav" at={bf("nuance", -2)} volume={0.24} dur={66} fade={26} />
    <Sfx name="ui-tech/digital-loading.wav" at={line("nuance", 1)} volume={0.2} dur={24} />
    <Sfx name="transition/deep-woosh.wav" at={bf("test", -2)} volume={0.26} dur={40} />
    <Sfx name="tick.wav" at={line("test", 1)} volume={0.28} dur={14} />
    <Sfx name="tick.wav" at={line("test", 2)} volume={0.28} dur={14} />
    <Sfx name="tick.wav" at={line("test", 3)} volume={0.28} dur={14} />
    <Sfx name="transition/woop.mp3" at={bf("standard", -2)} volume={0.26} dur={20} />
    <Sfx name="ui-tech/keyboard-typing.wav" at={line("standard", 2)} volume={0.3} dur={46} fade={12} />
  </>
);

/** Headline per beat. Copy, so it stays in the composition rather than the spec. */
const HEADLINES: Record<string, { lines: string[]; italicSecond?: boolean }> = {
  hook: { lines: ["What else", "changed?"], italicSecond: true },
  claim: { lines: ["Four things move"] },
  light: { lines: ["1. The light"] },
  distance: { lines: ["2. The distance"] },
  tilt: { lines: ["3. The tilt"] },
  express: { lines: ["4. The face", "you're making"], italicSecond: true },
  nuance: { lines: ["Both are true"] },
  test: { lines: ["Try it tonight"] },
  standard: { lines: ["Same light.", "Same lens."], italicSecond: true },
};

/** Which beats carry the running index, and how many are lit by then. */
const INDEX_AT: Record<string, number> = {
  light: 1, distance: 2, tilt: 3, express: 4,
};
const SHOW_INDEX = new Set(Object.keys(INDEX_AT));

/**
 * The beat library. A `composition` in shots.json is a key here.
 *
 * This is what makes the reel data rather than code: adding a beat is an entry
 * in the spec plus, if it needs a new look, one component here. Nothing else
 * moves. A composition named in the spec with no component is a TypeScript
 * error, not a blank beat.
 */

/* ── the reel ────────────────────────────────────────────────────────── */

const Changed: React.FC = () => (
  <Stage>
    {/* The read. Synthesised from docs/scripts/changed.txt and verified word by
        word against the finished mp3. */}
    <Audio src={staticFile("voiceover-changed.mp3")} />
    <SfxTrack />

    {/* THE REEL IS COMPILED FROM shots.json, NOT WRITTEN OUT BEAT BY BEAT.
        Each entry names a `composition`, which is looked up in COMPOSITIONS
        below, and carries its assets and labels as `props`. Nine hand-written
        <Sequence> blocks used to live here; changing which asset a beat showed
        meant editing TSX, and the plan and the code could disagree silently.

        Now the plan is the source: `gen/shots.py` validates it (no two adjacent
        beats sharing a composition, enough motion declared, every beat declaring
        a shot size), emits the typed table, and verifies the render against it.
        A composition named here that has no component is a compile error. */}
    {SHOTS.map((s) => {
      const Beat = COMPOSITIONS[s.composition];
      const name = s.name as BeatName;
      return (
        <React.Fragment key={s.name}>
          <Sequence {...at(name)}>
            <Plate len={len(name)} mode="cut">
              <Beat {...(s.props as BeatProps)} />
              {s.props.chips === "vars" ? null : null}
            </Plate>
            {SHOW_INDEX.has(s.name) ? (
              <VarStrip filled={INDEX_AT[s.name]} startFrame={2} />
            ) : null}
          </Sequence>
          <Burst
            from={bf(name, 6)}
            hold={Math.min(len(name) - 12, 84)}
            lines={HEADLINES[s.name].lines}
            italicSecond={HEADLINES[s.name].italicSecond}
          />
        </React.Fragment>
      );
    })}

    <ChangedCaptions />
  </Stage>
);

/* ── beats ───────────────────────────────────────────────────────────── */

/**
 * Rings the nasolabial fold: position from the record, SHAPE fixed.
 *
 * Deriving the size from the nose box as well produced an ellipse nearly twice
 * as wide as tall, and `ScribbleCircle` at that aspect draws a wandering line
 * across the face rather than a ring. The record is authoritative about WHERE a
 * feature is; it says nothing about what a good annotation looks like.
 */
/* ── the beat library ─────────────────────────────────────────────────
   Every component here is driven ENTIRELY by props from shots.json. That is
   what lets one composition serve two beats: `hook` and `tilt` both compile to
   FullBleedWipe and differ only in the assets and labels the spec hands them.
   A beat that reads a module constant instead of a prop is a beat the spec
   cannot reconfigure, which defeats the point. */

const asId = (n?: string) => (n ?? BEFORE) as Parameters<typeof anchor>[0];
const asRegion = (r?: string) => (r ?? "jaw") as Parameters<typeof anchor>[1];

/** Full-frame wipe from one asset to another. hook, tilt. */
const FullBleedWipe: React.FC<BeatProps> = (p) => {
  const frame = useCurrentFrame();
  const sweep = useSweep(20, p.period ?? 120);
  // "once" is a single decisive reveal paced across the beat; "sweep" travels
  // back and forth so the viewer watches the variable arrive rather than
  // comparing two stills
  const prog =
    p.wipe === "sweep"
      ? sweep
      : interpolate(frame, [16, 150], [0, 100], {
          ...clamp,
          easing: Easing.inOut(Easing.cubic),
        });
  return (
    <AbsoluteFill>
      <Reveal
        under={p.under ?? BEFORE}
        over={p.over ?? BEFORE}
        progress={prog}
        dir={p.dir === "y" ? "y" : "x"}
        zoom={p.zoom ?? 1}
        focus={p.focus}
      />
      {p.reticle ? (
        <Reticle
          id={asId(p.under)}
          region={asRegion(p.reticle)}
          zoom={p.zoom ?? 1}
          startFrame={64}
          label={p.reticleLabel ?? ""}
        />
      ) : null}
      {p.tag ? (
        <Bottom>
          <Tag size={26}>{p.tag}</Tag>
        </Bottom>
      ) : null}
      {p.over && !p.tag ? (
        <Bottom y={392}>
          <Tag size={26}>{prog < 50 ? "BEFORE" : labelOf(asId(p.over))}</Tag>
        </Bottom>
      ) : null}
      {p.compliance ? (
        <Bottom y={330}>
          <Tag size={26}>AI PREVIEW - NOT MEDICAL ADVICE</Tag>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/** Full-frame wipe downward, following a drawn lamp. light. */
const FullBleedWipeDown: React.FC<BeatProps> = (p) => {
  const prog = useSweep(28, p.period ?? 134);
  return (
    <AbsoluteFill>
      <Reveal
        under={p.under ?? BEFORE}
        over={p.over ?? BEFORE}
        progress={prog}
        dir="y"
        zoom={p.zoom ?? 1}
      />
      {p.lamp ? <LightArc startFrame={18} dur={112} /> : null}
      {p.reticle ? (
        <Reticle
          id={asId(p.under)}
          region={asRegion(p.reticle)}
          zoom={p.zoom ?? 1}
          startFrame={152}
          label={p.reticleLabel ?? ""}
        />
      ) : null}
      {p.tag ? (
        <Bottom>
          <Tag size={26}>{p.tag}</Tag>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/** The four variables on a fan around a dimmed face. claim. */
const RadialFanBeat: React.FC<BeatProps> = (p) => (
  <AbsoluteFill>
    <Face name={p.under ?? BEFORE} zoom={p.zoom ?? 1} />
    <AbsoluteFill style={{ background: `rgba(16,24,28,${p.dim ?? 0.44})` }} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginTop: 60 }}>
        <RadialFan
          radius={348}
          startFrame={12}
          staggerFrames={9}
          arcSpread={250}
          startAngle={-215}
          spokes
          spokeColor="rgba(255,255,255,0.32)"
          items={VARS.map((v) => (
            <Tag key={v} size={22}>
              {v}
            </Tag>
          ))}
        />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** A boxed panel with a camera running in along a track. distance. */
const BoxedDiagram: React.FC<BeatProps> = (p) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - 20);
  const c = (t % 152) / 152;
  const tri = c < 0.5 ? c * 2 : (1 - c) * 2;
  const grow = interpolate(tri, [0, 1], [1, 1.17], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const wipe = interpolate(tri, [0, 1], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
        <div
          style={{
            marginTop: 96,
            width: 880,
            height: 1130,
            position: "relative",
            overflow: "hidden",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <Reveal
            under={p.under ?? BEFORE}
            over={p.over ?? BEFORE}
            progress={wipe}
            dir="x"
            zoom={grow * 1.32}
            focus="50% 34%"
          />
        </div>
      </AbsoluteFill>
      {p.track ? <CameraTrack startFrame={20} dur={152} /> : null}
      {p.tags ? (
        <Bottom y={372}>
          <div style={{ display: "flex", gap: 10 }}>
            {p.tags.map((x) => (
              <Tag key={x} size={24}>
                {x}
              </Tag>
            ))}
          </div>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/** Tight on the midface, ringing the fold. express. */
const ExtremeCloseWipe: React.FC<BeatProps> = (p) => {
  const prog = useSweep(20, p.period ?? 120);
  return (
    <AbsoluteFill>
      <Reveal
        under={p.under ?? BEFORE}
        over={p.over ?? BEFORE}
        progress={prog}
        dir="x"
        zoom={p.zoom ?? 1.42}
        focus={p.focus}
      />
      {p.fold ? <Fold /> : null}
      {p.tag ? (
        <Bottom>
          <Tag size={26}>{p.tag}</Tag>
        </Bottom>
      ) : null}
    </AbsoluteFill>
  );
};

/** Mesh over the face, the four variables collapsing onto it. nuance. */
const FullBleedMesh: React.FC<BeatProps> = (p) => (
  <AbsoluteFill>
    <Face name={p.under ?? BEFORE} zoom={p.zoom ?? 1} />
    <AbsoluteFill style={{ background: `rgba(16,24,28,${p.dim ?? 0.32})` }} />
    <FaceMesh cx={540} cy={760} rx={272} ry={356} startFrame={10} durationInFrames={26} />
    {p.chips === "vars" ? (
      <Bottom y={372}>
        <StaggerGrid columns={4} gap={9} startFrame={54} staggerFrames={9} variant="pop">
          {VARS.map((v) => (
            <Tag key={v} size={22}>
              {v}
            </Tag>
          ))}
        </StaggerGrid>
      </Bottom>
    ) : null}
  </AbsoluteFill>
);

/** Numbered instructions over a dimmed face. test. */
const InstructionCard: React.FC<BeatProps> = (p) => (
  <AbsoluteFill>
    <Face name={p.under ?? BEFORE} zoom={p.zoom ?? 1.16} focus={p.focus} />
    <AbsoluteFill style={{ background: `rgba(14,21,25,${p.dim ?? 0.55})` }} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 880, marginTop: -70 }}>
        <StaggerGrid columns={1} gap={22} startFrame={12} staggerFrames={24} variant="fade-up">
          {(p.steps ?? []).map((txt, i) => (
            <Step key={txt} n={String(i + 1)} text={txt} />
          ))}
        </StaggerGrid>
      </div>
    </AbsoluteFill>
    {p.tag ? (
      <Bottom y={372}>
        <Tag size={26}>{p.tag}</Tag>
      </Bottom>
    ) : null}
  </AbsoluteFill>
);

/** The locked checklist, then the search bar. standard. */
const ChecklistSearch: React.FC<BeatProps> = (p) => {
  const split = Math.round(len("standard") * 0.62);
  return (
    <AbsoluteFill>
      <Face name={p.under ?? BEFORE} zoom={p.zoom ?? 1.08} />
      <AbsoluteFill style={{ background: `rgba(14,21,25,${p.dim ?? 0.5})` }} />
      <Sequence durationInFrames={split} layout="none">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 800, marginTop: -50 }}>
            <StaggerGrid columns={2} gap={16} startFrame={14} staggerFrames={13} variant="pop">
              {(p.locked ?? []).map((x) => (
                <Locked key={x} text={x} />
              ))}
            </StaggerGrid>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={split} durationInFrames={len("standard") - split} layout="none">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <TypewriterInput text={p.type ?? ""} startFrame={4} framesPerChar={5} width={640} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const Fold: React.FC = () => {
  const r = anchor(BEFORE, "nose", { width: 1080, height: 1920 }, 1.42, [0.5, 0.58]);
  const w = 250;
  const h = 215;
  // The fold runs from the outer nostril down past the mouth corner: measured
  // OUT from the nose box's centre line, not in from its left edge. Working
  // from the edge put the ring out on her cheek — the nose box is a third of
  // the face wide, so an offset expressed against its width compounds fast.
  const cx = r.x + r.width * 0.5 - r.width * 0.45;
  const cy = r.y + r.height * 1.05;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h }}>
        <ScribbleCircle
          width={w}
          height={h}
          color="rgba(255,255,255,0.92)"
          strokeWidth={6}
          delay={52}
          laps={2}
        />
      </div>
    </AbsoluteFill>
  );
};

const Step: React.FC<{ n: string; text: string }> = ({ n, text }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
    <div
      style={{
        fontFamily: headlineStack,
        fontWeight: 400,
        fontSize: 44,
        color: "rgba(255,255,255,0.5)",
        minWidth: 44,
      }}
    >
      {n}
    </div>
    <div
      style={{
        fontFamily: headlineStack,
        fontWeight: 400,
        fontSize: 48,
        lineHeight: 1.22,
        color: "#fff",
      }}
    >
      {text}
    </div>
  </div>
);

const Locked: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      fontFamily: sansFont,
      fontSize: 29,
      padding: "17px 20px",
      borderRadius: 8,
      textAlign: "center",
      background: "rgba(255,255,255,0.94)",
      color: "#162024",
      border: "1px solid #fff",
    }}
  >
    {text}
  </div>
);

/**
 * The beat library. A `composition` in shots.json is a key here.
 *
 * Declared after the components so the const initialises in order. This is what
 * makes the reel data rather than code: adding a beat is an entry in the spec
 * plus, if it needs a new look, one component above. A composition named in the
 * spec with no component here is a TypeScript error, not a blank beat.
 */
const COMPOSITIONS: Record<string, React.FC<BeatProps>> = {
  "full-bleed-wipe": FullBleedWipe,
  "full-bleed-wipe-down": FullBleedWipeDown,
  "radial-fan": RadialFanBeat,
  "boxed-diagram": BoxedDiagram,
  "extreme-close-wipe": ExtremeCloseWipe,
  "full-bleed-mesh": FullBleedMesh,
  "instruction-card": InstructionCard,
  "checklist-search": ChecklistSearch,
};

export const RefinaChanged: React.FC = () => (
  <Composition
    id="RefinaChanged"
    component={Changed}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

export { SAGE };
