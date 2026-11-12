import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Stage } from "../protocol/atoms";
import { SectionHeadline } from "../preview/draw";
import { Plate } from "../preview/plate";
import { FaceMesh, StaggerGrid, TypewriterInput } from "../kit";
import { faceRow, labelOf } from "../anchors";
import { headlineStack } from "../../fonts";
import {
  AiChip,
  Bottom,
  Face,
  Reveal,
  Ring,
  Sfx,
  Span,
  Step,
  Tag,
  anchorBox,
  clamp,
  colOf,
  rowOf,
  useSweep,
} from "./atoms";
import { RatioCaptions } from "./captions";
import { REGION_CHANGE } from "./measured";
import { B, TOTAL, bf, len, line } from "./beats";

/**
 * "Same Nose" — educational explainer.
 *
 * THE ARGUMENT: the eye does not read a face as a list of features, it reads
 * each feature against the ones beside it. So a change to the chin is seen as a
 * change to the nose.
 *
 * WHY THIS REEL CAN MAKE THAT CLAIM HONESTLY. The pair in the hook was
 * generated with the nose explicitly excluded from the edit, and
 * `gen/score.py` then MEASURED how much each anatomical region moved. The proof
 * beat puts that measurement on screen. Nothing here is a claim about surgery,
 * an outcome, or a person — it is a claim about two images we made and can
 * account for pixel by pixel, plus one thing the viewer can reproduce with
 * their own jaw in the next ten seconds.
 *
 * TWO FACES, AND THE SECOND ONE IS ANNOUNCED OUT LOUD. Beat 5 says "another
 * face" in the voiceover and carries a SECOND SUBJECT tag on screen. The first
 * cut of `RefinaChanged` silently changed who its subject was three times, in a
 * film whose whole argument was "same face, one thing moved", and that was its
 * worst defect. A second subject is fine. A silent one is not.
 *
 * SCALE IS THE COMPOSITION VARIABLE. No two consecutive beats are framed alike:
 * full-bleed head, midface, boxed evidence panel, lower-face macro, eye macro,
 * head-with-diagram, head-with-mesh, instruction card, head-with-search. That
 * was the fix for the previous reel reading as "2-column split screen" nine
 * times over, and it is also what keeps occupancy high — rule Q says occupancy
 * is the number to fix first, because frozen/arrivals/cuts all follow it.
 *
 * NOTHING CREEPS TO MOVE A METRIC. Where the picture moves it moves because the
 * thing being taught is moving: the wipe travels because that is the change,
 * the spans grow because that is the measurement being taken.
 */

const FPS = 30;

/** transparent until well below the picture's centre of interest, full only at
 *  the frame edge — dark enough to carry white italic type over a lit cheek */
const CAPTION_SCRIM =
  "linear-gradient(to bottom, rgba(12,19,22,0) 68%, rgba(12,19,22,0.42) 84%, rgba(12,19,22,0.66) 100%)";

/* ── assets ───────────────────────────────────────────────────────────────
   Two subjects, and the reel says so. `ratio1` carries the spine — she was
   cast to visibly need a chin, so there would be something for the edit to
   act on; the first casting was mild and its render measured 12 against a
   threshold of 25, which is the documented failure in gen/README.
   `bleph1` is the second face, and it is the strongest-scoring pair in the
   repo (strength 34.3, concentration 1.27, drift 9.0). */
const A_BEFORE = "ratio1-before";
const A_AFTER = "ratio1-chin";
const E_BEFORE = "bleph1-before";
const E_AFTER = "bleph1-bleph";

const at = (k: keyof typeof B) => ({
  from: B[k][0],
  durationInFrames: B[k][1] - B[k][0],
});

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

/** the running index along the top, where the frame is otherwise dead */
const RELATIONS = ["NOSE-CHIN", "LID-EYE", "THE THIRDS"] as const;

const RelStrip: React.FC<{ filled: number; from?: number }> = ({ filled, from = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div style={{ display: "flex", gap: 9, marginTop: 44 }}>
        {RELATIONS.map((v, i) => {
          const on = i < filled;
          const t = interpolate(frame - from - i * 5, [0, 12], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div
              key={v}
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14,
                letterSpacing: 1.6,
                padding: "8px 13px",
                borderRadius: 4,
                whiteSpace: "nowrap",
                background: on ? "rgba(255,255,255,0.93)" : "rgba(18,26,30,0.5)",
                color: on ? "#162024" : "rgba(255,255,255,0.55)",
                border: `1px solid ${on ? "#fff" : "rgba(255,255,255,0.22)"}`,
                transform: `scale(${0.9 + 0.1 * t})`,
                opacity: t,
              }}
            >
              {i + 1}. {v}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ── the reel ─────────────────────────────────────────────────────────── */

const Ratio: React.FC = () => (
  <Stage>
    {/* The read. 87.5s, Deepgram Aura-2 'vesta', synthesised from
        docs/scripts/ratio.txt and verified word by word against the finished
        mp3 (max drift 5f, mean 0.97f, 0 over tolerance). */}
    <Audio src={staticFile("voiceover-ratio.mp3")} />

    {/* THE BED, NOT MORE ONE-SHOTS. `docs/making-a-reel.md` §1.4: our reels run
        74-85% speech against a corpus median of 96.3%, which is ~17s of dead
        air, and the fix for that is a continuous texture rather than more spot
        effects — sixteen one-shots total about eight seconds and cannot close a
        seventeen-second gap.

        NOT `vortex`, WHICH IS A RISER. Its RMS climbs from silence to -41dB
        across its 26.5s — measured, not assumed — so looping it would have put
        three swells and three near-silences under the reel. `energyfields`
        holds -30dB flat for its whole 14s, which is what a bed is. Measure the
        envelope before choosing one; "long" and "loopable" are not the same
        property.

        AND IT HAS TO CLEAR THE GATE THAT MEASURES IT. `measure-format.speech()`
        calls `silencedetect=noise=-32dB`, so a bed quieter than -32dB is, to
        that measurement and very nearly to a phone speaker, not there at all.
        v1 ran the raw effect at 0.06 — about -54dB — and measured 69.9% speech
        against a corpus median of 96.3. Raising it to 0.16 moved it to 74.7%,
        which is how we learned the level was the problem rather than the idea.
        `energyfields` is itself a -30dB recording, so even at unity it dips
        under the gate and only reaches 81%.

        So the bed is a BUILT ASSET, not an effect played louder: evened out
        with `dynaudnorm` so it does not dip, levelled to -30.8dB mean (about
        8dB under the read), pre-looped to 95s so there is no seam every 14
        seconds, and fading in and out at the ends. Measured on the real mix
        before rendering anything: **92.8% speech**. Rebuild with the command in
        CLAUDE.md if the voiceover changes length. */}
    {/* NO MUSIC BED. The bed that used to sit here was built from
        sfx/cinematic/energyfields.wav, which is a TENSION CUE, not music:
        partials clustered under a semitone apart (605.6/608.3 Hz beating at
        ~2.7 Hz), a tritone at the bottom (40.4 -> 56.5 Hz = 5.83 semitones),
        no fundamental, and sub-bass as its loudest band. It gave an
        educational explainer the emotional register of a thriller, and it sat
        on top of the read as well (invariant LL). The `cinematic/` folder is
        for one beat meant to land badly, never for 60 seconds of bed.
        Nothing goes back here until there is a real light-music library. */}

    {/* Sound. EVERY CUE IS DERIVED, NOT TYPED — `bf(beat, offset)` is a beat's
        first frame plus an offset and `line(beat, n)` is the frame the nth
        phrase of that beat begins on, so re-running gen-voiceover.py moves the
        effects with the words. `transition` on section cuts, `ui-tech` when a
        measurement resolves, `cinematic` once on the turn. */}
    <Sfx name="transition/camera-shutter.wav" at={bf("hook")} volume={0.34} dur={26} />
    <Sfx name="transition/reverse-playback.wav" at={line("hook", 1)} volume={0.2} dur={30} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("hook", 2)} volume={0.2} dur={20} />

    <Sfx name="transition/woop.mp3" at={bf("claim", -2)} volume={0.26} dur={20} />
    <Sfx name="ui-tech/toggle.wav" at={line("claim", 1)} volume={0.3} dur={8} />

    <Sfx name="transition/deep-woosh.wav" at={bf("proof", -2)} volume={0.26} dur={40} />
    <Sfx name="ui-tech/digital-loading.wav" at={line("proof", 1)} volume={0.22} dur={26} />
    <Sfx name="ui-tech/digital-beep.wav" at={line("proof", 2)} volume={0.2} dur={20} />

    <Sfx name="transition/woosh-2.wav" at={bf("one", -2)} volume={0.26} dur={26} />
    <Sfx name="tick.wav" at={line("one", 1)} volume={0.26} dur={14} />
    <Sfx name="tick.wav" at={line("one", 2)} volume={0.26} dur={14} />

    <Sfx name="transition/woosh-1.wav" at={bf("two", -2)} volume={0.3} dur={14} />
    <Sfx name="tick.wav" at={line("two", 2)} volume={0.26} dur={14} />

    <Sfx name="transition/woosh-2.wav" at={bf("three", -2)} volume={0.26} dur={26} />
    <Sfx name="ui-tech/glitchy-counter.mp3" at={line("three", 1)} volume={0.14} dur={56} fade={20} />

    <Sfx name="cinematic/hit.wav" at={bf("nuance", -2)} volume={0.24} dur={66} fade={26} />

    <Sfx name="transition/deep-woosh.wav" at={bf("test", -2)} volume={0.26} dur={40} />
    <Sfx name="tick.wav" at={bf("test", 14)} volume={0.28} dur={14} />
    <Sfx name="tick.wav" at={bf("test", 40)} volume={0.28} dur={14} />
    <Sfx name="tick.wav" at={bf("test", 66)} volume={0.28} dur={14} />

    <Sfx name="transition/woop.mp3" at={bf("close", -2)} volume={0.26} dur={20} />
    <Sfx name="ui-tech/keyboard-typing.wav" at={line("close", 3)} volume={0.3} dur={46} fade={12} />

    {/* 1 — HOOK. Full-bleed. The whole frame is her face and the whole frame
           changes, once, decisively. The ring lands on the NOSE, which is the
           wrong answer — that is the joke the rest of the reel unpacks. */}
    <Sequence {...at("hook")}>
      <Plate len={len("hook")} mode="cut">
        <HookBeat />
      </Plate>
    </Sequence>
    <Burst from={bf("hook", 6)} hold={Math.min(len("hook") - 12, 84)} lines={["Same", "nose."]} italicSecond />

    {/* 2 — CLAIM. In to the midface. Both rings on screen at once: the held one
           says NOT TOUCHED, which is the harder half of the claim and so gets
           its own mark rather than being left unlabelled. */}
    <Sequence {...at("claim")}>
      <Plate len={len("claim")} dir="up" t={12}>
        <ClaimBeat />
      </Plate>
    </Sequence>
    <Burst from={bf("claim", 6)} hold={Math.min(len("claim") - 12, 84)} lines={["Not the nose"]} />

    {/* 3 — PROOF. The measurement, on screen. Boxed rather than full-bleed: it
           is evidence about a picture, so it is shown AS a picture being
           examined. The three region numbers are real output from
           gen/score.py — the one place this reel prints a figure, and it is a
           figure about our own two files, never about a face. */}
    <Sequence {...at("proof")}>
      <Plate len={len("proof")} dir="down" t={16}>
        <ProofBeat />
      </Plate>
    </Sequence>
    <Burst from={bf("proof", 6)} hold={Math.min(len("proof") - 12, 84)} lines={["Every pixel", "that moved"]} italicSecond />

    {/* 4 — ONE. Lower-face macro, the tightest framing so far. Two spans side
           by side: the nose span does not move, the chin span grows as the
           wipe passes. Both ends of both spans come out of the asset records,
           so the "before" and "after" lengths are measured, not drawn. */}
    <Sequence {...at("one")}>
      <Plate len={len("one")} mode="cut">
        <OneBeat />
        <RelStrip filled={1} from={2} />
      </Plate>
    </Sequence>
    <Burst from={bf("one", 6)} hold={Math.min(len("one") - 12, 84)} lines={["1. Nose", "and chin"]} italicSecond />

    {/* 5 — TWO. A different face, announced. Eye macro — the widest scale jump
           in the reel, and the only beat that is not ratio1. */}
    <Sequence {...at("two")}>
      <Plate len={len("two")} mode="cut">
        <TwoBeat />
        <RelStrip filled={2} from={2} />
      </Plate>
    </Sequence>
    <Burst from={bf("two", 6)} hold={Math.min(len("two") - 12, 84)} lines={["2. Lid", "and eye"]} italicSecond />

    {/* 6 — THREE. Back out to the whole head, with the thirds drawn on it and
           a proportion column beside it. The column is the beat: when the chin
           lengthens, one segment grows and the other two shrink as a share of
           the whole, which is exactly what "all three change" means. */}
    <Sequence {...at("three")}>
      <Plate len={len("three")} dir="up" t={14}>
        <ThreeBeat />
        <RelStrip filled={3} from={2} />
      </Plate>
    </Sequence>
    <Burst from={bf("three", 6)} hold={Math.min(len("three") - 12, 84)} lines={["3. The thirds"]} />

    {/* 7 — NUANCE. Every explainer in the corpus has a beat that complicates
           its own claim. Do not cut this one for time. */}
    <Sequence {...at("nuance")}>
      <Plate len={len("nuance")} mode="cut">
        <NuanceBeat />
      </Plate>
    </Sequence>
    <Burst from={bf("nuance", 6)} hold={Math.min(len("nuance") - 12, 84)} lines={["Read whole.", "Not in parts."]} italicSecond />

    {/* 8 — SELF-TEST. Built to be screenshotted, and it is the one claim in the
           reel the viewer can falsify in ten seconds without trusting us. */}
    <Sequence {...at("test")}>
      <Plate len={len("test")} dir="up" t={16}>
        <TestBeat />
      </Plate>
    </Sequence>
    <Burst from={bf("test", 6)} hold={Math.min(len("test") - 12, 84)} lines={["Try it now"]} />

    {/* 9 — CLOSE. Refina is named once, at the very end, in a search bar —
           never called a product, never given a claim. */}
    <Sequence {...at("close")}>
      <Plate len={len("close")} mode="cut">
        <CloseBeat />
      </Plate>
    </Sequence>

    {/* the caption's ground — see the note above `CAPTION_SCRIM` */}
    <AbsoluteFill
      style={{
        background: CAPTION_SCRIM,
        pointerEvents: "none",
      }}
    />

    <RatioCaptions />
  </Stage>
);

/* ── beats ────────────────────────────────────────────────────────────── */

const HookBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const Z = 1.2;
  const F: [number, number] = [0.5, 0.3];
  // One decisive wipe on "One thing on it was changed", and then it keeps
  // moving. The decisive version alone left 45 frames of a dead frame at the
  // end of the beat; the line is "this is the same face twice", so the picture
  // going back and forth IS the sentence rather than a fidget over it.
  const cut = line("hook", 1) - B.hook[0];
  const decisive = interpolate(frame, [cut, cut + 34], [0, 100], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const drift = useSweep(cut + 46, 84);
  const p = frame < cut + 46 ? decisive : drift;
  return (
    <AbsoluteFill>
      <Reveal under={A_BEFORE} over={A_AFTER} progress={p} dir="x" zoom={Z} focus={F} />
      {/* The ring lands on the NOSE, on the line that says everyone points at
          it. It is deliberately the wrong region: the reel spends the next
          eighty seconds explaining why the eye goes there. */}
      <Ring
        id={A_BEFORE}
        region="nose"
        zoom={Z}
        focus={F}
        from={line("hook", 2) - B.hook[0]}
        label="THE NOSE?"
        pad={1.16}
      />
      {/* One label, not two — this is a full-frame wipe, so only one of the
          pair is ever on screen. The after's label is read from the asset
          record and cannot claim a procedure the record does not carry. */}
      <Bottom y={392}>
        <Tag size={16}>{p < 50 ? "BEFORE" : labelOf(A_AFTER)}</Tag>
      </Bottom>
      <AiChip y={330} />
    </AbsoluteFill>
  );
};

const ClaimBeat: React.FC = () => {
  const Z = 1.2;
  const F: [number, number] = [0.5, 0.34];
  const p = useSweep(10, 82);
  return (
    <AbsoluteFill>
      <Reveal under={A_BEFORE} over={A_AFTER} progress={p} dir="x" zoom={Z} focus={F} />
      <Ring
        id={A_BEFORE}
        region="nose"
        zoom={Z}
        focus={F}
        from={4}
        state="held"
        label="NOT TOUCHED"
        labelAt="above"
        pad={1.0}
      />
      <Ring
        id={A_BEFORE}
        region="jaw"
        zoom={Z}
        focus={F}
        from={line("claim", 1) - B.claim[0]}
        label="CHANGED"
        labelAt="above"
        pad={0.92}
      />
      <AiChip y={250} />
    </AbsoluteFill>
  );
};

/**
 * The evidence beat.
 *
 * `ratio-diff.png` is generated by `gen/diffmap.py` from the two aligned
 * masters — it is the actual per-pixel difference of the pair, not an
 * illustration of one. The three figures beside it are `gen/score.py`'s region
 * numbers for this exact pair, printed from `ratio-score.json`, which is why
 * this is the one beat in the reel that carries digits.
 */
const PROOF_CYCLE = [
  { name: A_BEFORE, label: "BEFORE" },
  { name: A_AFTER, label: "AFTER" },
  { name: "ratio-diff", label: "DIFFERENCE" },
] as const;

const ProofBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [4, 22], [0.94, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  // Each card holds 38 frames and cross-fades over 10. Slow enough to read,
  // and it never rests — the beat used to land its panel and then hold it for
  // 81 frames without a pixel moving.
  const HOLD = 38;
  const step = Math.max(0, Math.floor((frame - 26) / HOLD));
  const into = Math.max(0, frame - 26) % HOLD;
  const cur = PROOF_CYCLE[step % 3];
  const nxt = PROOF_CYCLE[(step + 1) % 3];
  const mix = interpolate(into, [HOLD - 10, HOLD - 1], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Face name={A_BEFORE} zoom={1.5} focus={[0.5, 0.3]} style={{ filter: "blur(26px)" }} />
      <AbsoluteFill style={{ background: "rgba(14,21,25,0.62)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
        <div
          style={{
            marginTop: 168,
            width: 972,
            height: 1216,
            position: "relative",
            overflow: "hidden",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.34)",
            transform: `scale(${grow})`,
            background: "#0C1316",
          }}
        >
          <Face name={cur.name} zoom={1.34} focus={[0.5, 0.3]} />
          <AbsoluteFill style={{ opacity: mix }}>
            <Face name={nxt.name} zoom={1.34} focus={[0.5, 0.3]} />
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 18, top: 18 }}>
            <Tag size={15}>{mix > 0.5 ? nxt.label : cur.label}</Tag>
          </div>
        </div>
      </AbsoluteFill>
      {/* Read out of `measured.ts`, which gen/emit-measured.py writes from the
          scorer's own results.json. Nothing here types a number about a face —
          the same reason words-vo.ts is generated, applied to a figure that is
          on screen as evidence rather than as timing. */}
      <Bottom y={402}>
        <div style={{ display: "flex", gap: 10 }}>
          {REGION_CHANGE.map((r, i) => (
            <ScoreChip
              key={r.region}
              region={r.region}
              value={r.value.toFixed(1)}
              lit={r.target}
              from={line("proof", 1) - B.proof[0] + i * 7}
            />
          ))}
        </div>
      </Bottom>
      <Bottom y={340}>
        <Tag size={15} dim>
          PER-REGION PIXEL CHANGE, THIS PAIR
        </Tag>
      </Bottom>
    </AbsoluteFill>
  );
};

const ScoreChip: React.FC<{
  region: string;
  value: string;
  lit: boolean;
  from: number;
}> = ({ region, value, lit, from }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - from, [0, 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (t <= 0) return null;
  return (
    <div
      style={{
        transform: `scale(${0.88 + 0.12 * t})`,
        opacity: t,
        background: lit ? "rgba(255,255,255,0.93)" : "rgba(18,26,30,0.72)",
        border: `1px solid ${lit ? "#fff" : "rgba(255,255,255,0.22)"}`,
        borderRadius: 6,
        padding: "10px 16px",
        textAlign: "center",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        color: lit ? "#162024" : "rgba(255,255,255,0.9)",
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.7 }}>{region}</div>
      <div style={{ fontSize: 30, letterSpacing: 1, marginTop: 2 }}>{value}</div>
    </div>
  );
};

/**
 * One: the nose and the chin, measured side by side.
 *
 * The nose span is drawn from the BEFORE record and never moves. The chin span
 * runs from the base of the nose to the bottom of the jaw, and its lower end is
 * interpolated between the two records as the wipe passes — so the growth on
 * screen is the difference the generator actually produced, not an animation
 * chosen to look convincing.
 */
const OneBeat: React.FC = () => {
  const Z = 1.3;
  const F: [number, number] = [0.5, 0.58];
  const p = useSweep(14, 84);
  const noseTop = rowOf(A_BEFORE, "nose", "top", Z, F);
  const noseBot = rowOf(A_BEFORE, "nose", "bottom", Z, F);
  const jawB = rowOf(A_BEFORE, "jaw", "bottom", Z, F);
  const jawA = rowOf(A_AFTER, "jaw", "bottom", Z, F);
  const chinBot = interpolate(p, [0, 100], [jawB, jawA], clamp);
  const xN = colOf(A_BEFORE, "nose", Z, F) - 232;
  const xC = colOf(A_BEFORE, "nose", Z, F) + 232;
  return (
    <AbsoluteFill>
      <Reveal under={A_BEFORE} over={A_AFTER} progress={p} dir="x" zoom={Z} focus={F} />
      <Span x={xN} y0={noseTop} y1={noseBot} from={12} label="NOSE" side="left" dim />
      <Span x={xC} y0={noseBot} y1={chinBot} from={line("one", 1) - B.one[0]} label="CHIN" />
      <AiChip y={250} />
    </AbsoluteFill>
  );
};

const TwoBeat: React.FC = () => {
  const Z = 1.52;
  const F: [number, number] = [0.5, 0.26];
  const p = useSweep(16, 82);
  return (
    <AbsoluteFill>
      <Reveal under={E_BEFORE} over={E_AFTER} progress={p} dir="x" zoom={Z} focus={F} />
      <Ring
        id={E_BEFORE}
        region="eyes"
        zoom={Z}
        focus={F}
        from={line("two", 1) - B.two[0]}
        label="THE LID"
        pad={1.02}
      />
      {/* Says out loud what the voiceover says: this is not the same woman. */}
      <Bottom y={392}>
        <Tag size={16}>SECOND SUBJECT - {p < 50 ? "BEFORE" : labelOf(E_AFTER)}</Tag>
      </Bottom>
      <AiChip y={330} />
    </AbsoluteFill>
  );
};

/**
 * Three: the thirds, and the column that shows what a boundary move does.
 *
 * Every row comes out of `faceRow()`, so the diagram is derived from the
 * asset's measured face box. There are no numbers on it — a figure printed
 * against a face is a claim about that face, and inventing facial statistics is
 * exactly what invariant E and the protocol reel's content rules forbid. Three
 * segments of visibly different share say the whole thing.
 */
const ThreeBeat: React.FC = () => {
  const Z = 1.18;
  const F: [number, number] = [0.5, 0.34];
  const p = useSweep(line("three", 1) - B.three[0], 86);
  const rows = [
    faceRow(A_BEFORE, 0, undefined, Z, F),
    faceRow(A_BEFORE, 0.2, undefined, Z, F),
    faceRow(A_BEFORE, 0.66, undefined, Z, F),
    interpolate(
      p,
      [0, 100],
      [faceRow(A_BEFORE, 1.02, undefined, Z, F), faceRow(A_AFTER, 1.02, undefined, Z, F)],
      clamp,
    ),
  ];
  const labels = ["HAIRLINE - BROW", "BROW - NOSE", "NOSE - CHIN"];
  const x = 176;
  return (
    <AbsoluteFill>
      <Reveal under={A_BEFORE} over={A_AFTER} progress={p} dir="x" zoom={Z} focus={F} />
      <AbsoluteFill style={{ background: "rgba(14,21,25,0.52)" }} />
      {rows.slice(0, 3).map((r, i) => (
        <Span
          key={labels[i]}
          x={x}
          y0={r}
          y1={rows[i + 1]}
          from={10 + i * 34}
          label={labels[i]}
          dim={i !== 2}
        />
      ))}
      <ProportionColumn rows={rows} from={line("three", 1) - B.three[0]} />
      <AiChip y={250} />
    </AbsoluteFill>
  );
};

/** the three thirds as shares of one column, so a boundary move re-balances all of them */
const ProportionColumn: React.FC<{ rows: number[]; from: number }> = ({ rows, from }) => {
  const f = useCurrentFrame();
  const t = interpolate(f - from, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (t <= 0) return null;
  const total = rows[3] - rows[0];
  const shares = [rows[1] - rows[0], rows[2] - rows[1], rows[3] - rows[2]].map((s) => s / total);
  const H = 760;
  return (
    <div
      style={{
        position: "absolute",
        right: 74,
        top: 600,
        width: 124,
        opacity: t,
        padding: "14px 14px 10px",
        borderRadius: 8,
        background: "rgba(12,19,22,0.72)",
        border: "1px solid rgba(255,255,255,0.26)",
      }}
    >
      <div style={{ height: H }}>
        {shares.map((sh, i) => (
          <div
            key={i}
            style={{
              height: sh * H * t,
              background: i === 2 ? "#F2F5F6" : i === 1 ? "#7E9098" : "#5A6C74",
              border: "1px solid rgba(255,255,255,0.55)",
              borderRadius: 3,
              marginBottom: 5,
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 11,
          letterSpacing: 1.6,
          color: "rgba(255,255,255,0.72)",
          textAlign: "center",
          marginTop: 10,
        }}
      >
        SHARE
      </div>
    </div>
  );
};

const NuanceBeat: React.FC = () => {
  // Derived, not typed. The first cut used (540, 720) and the mesh sat on her
  // forehead — the same class of bug as every mis-placed callout in
  // invariant A, and it would have moved again on the next asset.
  const Z = 1.18;
  const F: [number, number] = [0.5, 0.32];
  const top = faceRow(A_BEFORE, 0.02, undefined, Z, F);
  const bot = faceRow(A_BEFORE, 1.0, undefined, Z, F);
  const jaw = anchorBox(A_BEFORE, "jaw", Z, F);
  const p = useSweep(30, 88);
  return (
  <AbsoluteFill>
    <Reveal under={A_BEFORE} over={A_AFTER} progress={p} dir="x" zoom={Z} focus={F} />
    <AbsoluteFill style={{ background: "rgba(16,24,28,0.34)" }} />
    <FaceMesh
      cx={Math.round(jaw.x + jaw.width / 2)}
      cy={Math.round((top + bot) / 2)}
      rx={Math.round((jaw.width / 2) * 0.94)}
      ry={Math.round((bot - top) / 2)}
      startFrame={8}
      durationInFrames={26}
    />
    <Bottom y={372}>
      <StaggerGrid columns={3} gap={9} startFrame={54} staggerFrames={46} variant="pop">
        <Tag size={16}>NOSE</Tag>
        <Tag size={16}>CHIN</Tag>
        <Tag size={16}>LID</Tag>
      </StaggerGrid>
    </Bottom>
    <AiChip y={300} />
  </AbsoluteFill>
  );
};

const TestBeat: React.FC = () => {
  const p = useSweep(18, 84);
  return (
  <AbsoluteFill>
    <Reveal under={A_BEFORE} over={A_AFTER} progress={p} dir="x" zoom={1.2} focus={[0.5, 0.26]} />
    <AbsoluteFill style={{ background: "rgba(14,21,25,0.66)" }} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 880, marginTop: -60 }}>
        <StaggerGrid columns={1} gap={26} startFrame={12} staggerFrames={62} variant="fade-up">
          <Step n="1" text="Push your lower jaw forward." />
          <Step n="2" text="A few millimetres. Hold it." />
          <Step n="3" text="Now look at your nose." />
        </StaggerGrid>
      </div>
    </AbsoluteFill>
    <Bottom y={372}>
      <Tag size={18}>YOU DIDN&apos;T TOUCH YOUR NOSE</Tag>
    </Bottom>
    <AiChip y={300} />
  </AbsoluteFill>
  );
};

/** a headline that assembles a word at a time, like every other line of type in
 *  this reel — a block of display type appearing whole was the only place the
 *  reel stated something instead of building it */
const WordsIn: React.FC<{ lines: string[]; from: number; per: number }> = ({
  lines,
  from,
  per,
}) => {
  const frame = useCurrentFrame();
  let k = 0;
  return (
    <div
      style={{
        fontFamily: headlineStack,
        fontSize: 66,
        lineHeight: 1.3,
        color: "#fff",
        textAlign: "center",
        width: 860,
        marginTop: -40,
      }}
    >
      {lines.map((ln) => (
        <div key={ln}>
          {ln.split(" ").map((w) => {
            const t0 = from + k * per;
            k += 1;
            const o = interpolate(frame, [t0, t0 + 7], [0, 1], clamp);
            const b = interpolate(frame, [t0, t0 + 8], [8, 0], clamp);
            return (
              <span
                key={w}
                style={{
                  display: "inline-block",
                  opacity: o,
                  filter: `blur(${b}px)`,
                  marginRight: "0.26em",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// 92% still and a 3.1s dead run — the worst beat in the reel. A frozen portrait
// under a block of static type for seven seconds, then a typewriter. The spoken
// line is "it's what the whole face does when it moves", so the face moves.
const CloseBeat: React.FC = () => {
  const l = len("close");
  const split = Math.round(l * 0.58);
  const p = useSweep(14, 96);
  return (
    <AbsoluteFill>
      <Reveal
        under={A_BEFORE}
        over={A_AFTER}
        progress={p}
        dir="x"
        zoom={1.18}
        focus={[0.5, 0.32]}
      />
      <AbsoluteFill style={{ background: "rgba(14,21,25,0.6)" }} />
      <Sequence durationInFrames={split} layout="none">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <WordsIn lines={["A preview,", "not a promise."]} from={10} per={11} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={split} durationInFrames={l - split} layout="none">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ marginTop: 300 }}>
            <TypewriterInput text="Refina AI" startFrame={4} framesPerChar={5} width={640} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <AiChip y={250} />
    </AbsoluteFill>
  );
};

export const RefinaRatio: React.FC = () => (
  <Composition
    id="RefinaRatio"
    component={Ratio}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
