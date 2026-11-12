import { WORD_CUES } from "./words-vo";
import { SHOTS } from "./shots";

/**
 * Beat bounds for "It Wasn't the Nose", derived from the voiceover.
 *
 * `words-vo.ts` is generated from `docs/scripts/nose.txt` and every frame in it
 * is MEASURED off the synthesised read, so this reel contains no typed frame
 * number: edit a line in the script, re-run `gen-voiceover.py`, and the audio,
 * the captions, the beat bounds, every headline burst and every sound effect
 * move together.
 *
 * Beat structure comes from the SHOT PLAN, not from a second list here — one
 * declaration, in `shots.json`, of how many phrases each beat covers. Carrying
 * it twice let the script, the cue table and the plan each say a different
 * thing, silently.
 */
const LINES = SHOTS.map((s) => [s.name, s.lines] as const);

export type BeatName = (typeof SHOTS)[number]["name"];

const declared = LINES.reduce((n, [, c]) => n + c, 0);
if (declared !== WORD_CUES.length) {
  throw new Error(
    `shots.json declares ${declared} script lines but words-vo.ts has ` +
      `${WORD_CUES.length}. Add or remove the line in docs/scripts/nose.txt, ` +
      `re-run gen-voiceover.py, then move the beat's \`lines\` to match.`,
  );
}

const bounds = {} as Record<BeatName, readonly [number, number]>;
let i = 0;
for (const [name, count] of LINES) {
  bounds[name] = [WORD_CUES[i].f, WORD_CUES[i + count - 1].t] as const;
  i += count;
}

export const B = bounds;
export const TOTAL = WORD_CUES[WORD_CUES.length - 1].t;

/** first frame of a beat, plus an offset — how every cue in the reel is placed */
export const bf = (k: BeatName, offset = 0) => B[k][0] + offset;

/** length of a beat in frames */
export const len = (k: BeatName) => B[k][1] - B[k][0];

/** frame of the Nth line within a beat, for cues that follow a specific phrase */
export const line = (k: BeatName, n: number) => {
  let start = 0;
  for (const [name, count] of LINES) {
    if (name === k) return WORD_CUES[start + Math.min(n, count - 1)].f;
    start += count;
  }
  return B[k][0];
};
