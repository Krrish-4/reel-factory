import type React from "react";
import { Audio, Composition, Sequence, staticFile } from "remotion";
import { displayFont, serifFont } from "../fonts";
import { SAGE, Stage } from "../refina/protocol/atoms";
import { WORD_CUES } from "../refina/changed/words-vo";

import { MarkerHighlight } from "../components/remocn/marker-highlight";
import { PerCharacterRise } from "../components/remocn/per-character-rise";
import { SoftBlurIn } from "../components/remocn/soft-blur-in";
import {
  type CaptionLine,
  KaraokeCaptions,
} from "../components/snap-cn/karaoke-captions";

/**
 * MotionRefsLab — four third-party components on the QOVES sage ground,
 * pulled from the open-source clones in C:\Users\rahul\motion-refs.
 *
 *   1. remocn SoftBlurIn        (already vendored)
 *   2. remocn PerCharacterRise  (already vendored)
 *   3. remocn MarkerHighlight   (new — copied from the remocn clone, de-chromed)
 *   4. snapcn KaraokeCaptions   (new — copied from the snapcn clone, with its
 *                                snap-cn-ui core in src/lib/snap-cn-ui)
 *
 * Fonts. remocn hardcodes `var(--font-geist-sans), -apple-system, ...` as an
 * inline style (docs/remocn-integration.md, D). An inline `var()` still
 * resolves against the cascade, so defining `--font-geist-sans` on a parent
 * reskins every remocn text component without touching the vendored file.
 * KaraokeCaptions takes a `fontFamily` prop, and it never sets fontStyle, so
 * the italic is inherited from its wrapper.
 *
 * Beat 4 plays the real "What Else Changed" read with its MEASURED word onsets
 * (src/refina/changed/words-vo.ts), so the fill is judged against speech, not
 * against an even spread.
 */

const INK = "#fff";
const TYPE_BEAT = 105;

// "One. The light." ... "Same face. Nothing touched." — cues 5-8 of the read.
const VO_FROM = 350;
const VO_TO = 703;
const KARAOKE_BEAT = VO_TO - VO_FROM + 12;

const KARAOKE_LINES: CaptionLine[] = WORD_CUES.filter(
  (c) => c.f >= VO_FROM && c.t <= VO_TO,
).map((c) => ({
  text: c.s,
  startFrame: c.f - VO_FROM,
  endFrame: c.t - VO_FROM,
  wordTimings: c.w.map((w) => w - VO_FROM),
}));

export const MOTION_REFS_TOTAL = TYPE_BEAT * 3 + KARAOKE_BEAT;

const Label: React.FC<{ n: number; text: string; note: string }> = ({
  n,
  text,
  note,
}) => (
  <div
    style={{
      position: "absolute",
      top: 78,
      left: 60,
      right: 60,
      textAlign: "center",
      zIndex: 20,
      fontFamily: displayFont,
      fontWeight: 300,
      color: INK,
    }}
  >
    <div style={{ fontSize: 42 }}>
      {n}. {text}
    </div>
    <div style={{ fontSize: 26, opacity: 0.66, marginTop: 8 }}>{note}</div>
  </div>
);

/** Points remocn's hardcoded `var(--font-geist-sans)` at one of our faces. */
const Face: React.FC<{ family: string; children: React.ReactNode }> = ({
  family,
  children,
}) => (
  <div
    style={
      {
        position: "absolute",
        inset: 0,
        "--font-geist-sans": family,
      } as React.CSSProperties
    }
  >
    {children}
  </div>
);

const MotionRefsLabBody: React.FC = () => (
  <Stage>
    <Sequence durationInFrames={TYPE_BEAT}>
      <Label n={1} text="SoftBlurIn" note="remocn · headline face" />
      <Face family={displayFont}>
        <SoftBlurIn
          text="See it on your face first."
          fontSize={84}
          fontWeight={300}
          color={INK}
        />
      </Face>
    </Sequence>

    <Sequence from={TYPE_BEAT} durationInFrames={TYPE_BEAT}>
      <Label n={2} text="PerCharacterRise" note="remocn · headline face" />
      <Face family={displayFont}>
        <PerCharacterRise
          text="Same face. Nothing touched."
          fontSize={84}
          fontWeight={300}
          color={INK}
        />
      </Face>
    </Sequence>

    <Sequence from={TYPE_BEAT * 2} durationInFrames={TYPE_BEAT}>
      <Label n={3} text="MarkerHighlight" note="remocn · new" />
      <Face family={displayFont}>
        <MarkerHighlight
          before="A "
          highlight="preview"
          after=", not a promise."
          fontSize={84}
          fontWeight={300}
          markerColor={INK}
          baseColor={INK}
          highlightedTextColor={SAGE}
        />
      </Face>
    </Sequence>

    <Sequence from={TYPE_BEAT * 3} durationInFrames={KARAOKE_BEAT}>
      <Audio
        src={staticFile("voiceover-changed.mp3")}
        trimBefore={VO_FROM}
        trimAfter={VO_TO + 12}
      />
      <Label n={4} text="KaraokeCaptions" note="snapcn · real read, measured words" />
      <div style={{ position: "absolute", inset: 0, fontStyle: "italic" }}>
        <KaraokeCaptions
          lines={KARAOKE_LINES}
          preset="clean"
          pill={false}
          uppercase={false}
          strokeRatio={0}
          fontFamily={serifFont}
          fontSize={60}
          fontWeight={400}
          baseColor="rgba(255,255,255,0.45)"
          fillColor={INK}
          aspect="portrait"
        />
      </div>
    </Sequence>
  </Stage>
);

export const MotionRefsLab: React.FC = () => (
  <Composition
    id="MotionRefsLab"
    component={MotionRefsLabBody}
    durationInFrames={MOTION_REFS_TOTAL}
    fps={30}
    width={1080}
    height={1920}
  />
);
