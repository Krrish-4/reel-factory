/**
 * When does a SliderReveal actually SHOW the after image?
 *
 *   node docs/preview-review/check-reveal.mjs
 *
 * `SliderReveal` drives its divider with a spring, not a linear ramp, so `dur`
 * is the spring's duration and NOT the time the wipe takes to read. A spring
 * with these constants eases in off the mark: for the first handful of frames
 * the divider barely moves, so the after image is still essentially hidden.
 *
 * That matters for the procedure beat. The slide cuts in on the frame its name
 * is spoken, which is easy to verify and looks correct in a frame grab -- but
 * what is on screen at that moment is the BEFORE photo. The procedure itself
 * only becomes visible as the divider travels, and the ease-in pushes that well
 * past the word. This prints the frame at which the after image reaches 25/50/
 * 75% of the panel so the reveal can be aimed at the spoken word instead.
 */
import { spring } from "remotion";

const FPS = 30;

// mirrors SliderReveal in protocol/motion.tsx
const config = { damping: 26, stiffness: 55, mass: 1.1 };
const pctAt = (frame, from, dur) => {
  const s = spring({ frame: frame - from, fps: FPS, durationInFrames: dur, config });
  return 96 - s * 92; // after occupies [pct, 100]
};

const cases = [
  { name: "Rhinoplasty", at: 599, lead: 4, dur: 20, word: [601, 617] },
  { name: "Facelift", at: 633, lead: 1, dur: 12, word: [637, 663] },
  { name: "Upper Bleph", at: 648, lead: 4, dur: 20, word: [645, 663] },
  { name: "hero (step3)", at: 430 + 26, lead: 0, dur: 54, word: [484, 596] },
];

const firstFrameWhere = (from, dur, test, limit = 200) => {
  for (let f = from; f < from + limit; f++) {
    if (test(100 - pctAt(f, from, dur))) return f;
  }
  return null;
};

console.log(
  "reveal timing — 'shown' = % of the panel showing the AFTER image\n",
);
for (const c of cases) {
  const from = c.at + c.lead;
  const f25 = firstFrameWhere(from, c.dur, (v) => v >= 25);
  const f50 = firstFrameWhere(from, c.dur, (v) => v >= 50);
  const f90 = firstFrameWhere(from, c.dur, (v) => v >= 90);
  const [w0, w1] = c.word;
  console.log(
    `${c.name.padEnd(13)} slide f${String(c.at).padStart(4)}  wipe f${String(from).padStart(4)}` +
      `  25%@f${f25}  50%@f${f50}  90%@f${f90}`,
  );
  console.log(
    `${"".padEnd(13)} word spoken f${w0}-${w1}` +
      `   -> half-revealed ${((f50 - w0) / FPS).toFixed(2)}s after the word starts,` +
      ` ${((f50 - w1) / FPS).toFixed(2)}s after it ends`,
  );
}
