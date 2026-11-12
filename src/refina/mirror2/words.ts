/* Caption cues for "The Mirror".
 *
 * ESTIMATED, NOT MEASURED — and that is a real difference from every other reel
 * in this repo. There is no voiceover yet, so these frames come from word count
 * at 158 wpm, which is the pace measured from voiceover4.mp3 (median phrase
 * 1.27s). Every other reel derives cues from `silencedetect` on the real audio,
 * and `docs/reel-invariants.md` rule B says timing is generated, never typed.
 *
 * WHEN THE VOICEOVER ARRIVES: drop it in `public/`, add this table to
 * `docs/preview-review/gen-words.py`, run it, and replace this file. Beat
 * boundaries in the composition are all derived from these `f` values, so they
 * move with it. Do not hand-nudge these numbers in the meantime.
 */
export type WordCue = { f: number; t: number; s: string };

export const CUES: WordCue[] = [
  { f: 6, t: 71, s: "You've done it in the mirror." },
  { f: 83, t: 160, s: "Pulled the skin back at your temples." },
  { f: 172, t: 237, s: "Lifted your cheek with two fingers." },
  { f: 249, t: 303, s: "Held it there. Let go." },
  { f: 315, t: 369, s: "That is the whole decision." },
  { f: 381, t: 458, s: "A guess you make with your hands" },
  { f: 470, t: 524, s: "and finish in your imagination." },
  { f: 536, t: 579, s: "So we built Refina." },
  { f: 591, t: 622, s: "Upload one photo." },
  { f: 634, t: 688, s: "Choose the procedure you're considering." },
  { f: 700, t: 788, s: "And see it rendered on your own face." },
  { f: 800, t: 888, s: "Not a diagram. Not a gallery. Your face." },
  { f: 900, t: 988, s: "Three things change once you can see it." },
  { f: 1000, t: 1043, s: "First, you stop guessing." },
  { f: 1055, t: 1143, s: "The picture in your head was never accurate." },
  { f: 1155, t: 1232, s: "It was hope on a good day" },
  { f: 1244, t: 1309, s: "and dread on a bad one." },
  { f: 1321, t: 1386, s: "Now it is just a photograph." },
  { f: 1398, t: 1486, s: "Second, you find out what you don't want." },
  { f: 1498, t: 1586, s: "Ruling a procedure out is an answer too," },
  { f: 1598, t: 1663, s: "and it costs you nothing here." },
  { f: 1675, t: 1786, s: "And third, you decide before anyone is selling to you." },
  { f: 1798, t: 1863, s: "At home. On your own time." },
  { f: 1875, t: 1940, s: "Not across a desk from someone" },
  { f: 1952, t: 2040, s: "with a price list and a waiting room." },
  { f: 2052, t: 2129, s: "Refina is a preview, not a promise." },
  { f: 2141, t: 2195, s: "Your surgeon determines your result." },
  { f: 2207, t: 2284, s: "But you should get to see it" },
  { f: 2296, t: 2373, s: "before you spend another year imagining it." },
  { f: 2385, t: 2462, s: "Search Refina AI on the App Store." },
];

/** Beat bounds, derived from the cue frames above. */
export const B = {
  hook:  [6, 315],
  guess: [315, 536],
  built: [536, 900],
  three: [900, 1000],
  r1:    [1000, 1398],
  r2:    [1398, 1675],
  r3:    [1675, 2052],
  close: [2052, 2385],
  cta:   [2385, 2474],
} as const;

export const TOTAL = 2474;
