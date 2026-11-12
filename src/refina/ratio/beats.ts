import { WORD_CUES } from "./words-vo";

/**
 * Beat bounds for "Same Nose", derived from the voiceover.
 *
 * `words-vo.ts` is generated from `docs/scripts/ratio.txt` and every frame in
 * it is MEASURED off the synthesised read. This file is the only place that
 * says which phrases belong to which beat, and it says it by LINE COUNT — the
 * one structural fact about the script that is not timing.
 *
 * So the reel contains no typed frame number. Edit a line in the script,
 * re-run `gen-voiceover.py`, and the audio, the captions, the beat bounds,
 * every headline burst and every sound cue move together. Add or remove a LINE
 * and the counts below have to change with it — that is the one edit this file
 * needs, and the sum is checked against the cue table at module load so a
 * mismatch fails immediately rather than silently reassigning half the reel to
 * the wrong beat.
 *
 * Same structure as `changed/beats.ts`, deliberately: that reel proved the
 * shape and this one is the second instance of it, not a new idea.
 */
const LINES = [
  ["hook", 3],
  ["claim", 3],
  ["proof", 3],
  ["one", 4],
  ["two", 4],
  ["three", 3],
  ["nuance", 3],
  ["test", 3],
  ["close", 4],
] as const;

export type BeatName = (typeof LINES)[number][0];

const declared = LINES.reduce((n, [, c]) => n + c, 0);
if (declared !== WORD_CUES.length) {
  throw new Error(
    `beats.ts declares ${declared} script lines but words-vo.ts has ` +
      `${WORD_CUES.length}. Re-run gen-voiceover.py, then update LINES to match ` +
      `docs/scripts/ratio.txt.`,
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
