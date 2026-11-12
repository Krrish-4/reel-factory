/**
 * Emit a .srt next to the rendered reel, from the same CUES the burned-in
 * captions use.
 *
 *   node docs/preview-review/make-srt.mjs
 *
 * The cue frames are already derived from voiceover silence detection, so the
 * subtitle file inherits that timing rather than being transcribed separately —
 * the two can't drift apart.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { serializeSrt } from "@remotion/captions";

const FPS = 30;
const SRC = "src/refina/preview/RefinaPreviewReel.tsx";
const OUT = "out/refina-preview.srt";

const src = readFileSync(SRC, "utf8");
const block = src.match(/const CUES: Cue\[\] = \[([\s\S]*?)\n\];/);
if (!block) throw new Error(`Could not find the CUES array in ${SRC}`);

const cues = [...block[1].matchAll(/\{\s*f:\s*(\d+),\s*t:\s*(\d+),\s*s:\s*"((?:[^"\\]|\\.)*)"\s*\}/g)]
  .map((m) => ({
    startMs: (Number(m[1]) / FPS) * 1000,
    endMs: (Number(m[2]) / FPS) * 1000,
    text: m[3].replace(/\\"/g, '"'),
    timestampMs: null,
    confidence: null,
  }));

if (cues.length === 0) throw new Error("CUES matched the block but parsed to zero entries");

// one caption per subtitle line
const srt = serializeSrt({ lines: cues.map((c) => [c]) });
writeFileSync(OUT, srt, "utf8");

const last = cues[cues.length - 1];
console.log(`${cues.length} cues -> ${OUT}`);
console.log(`first: ${cues[0].startMs.toFixed(0)}ms  "${cues[0].text}"`);
console.log(`last:  ${last.endMs.toFixed(0)}ms  "${last.text}"`);
