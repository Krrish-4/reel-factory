// Segmented render for the Glow Up reels: bundle once, render frame ranges,
// skip segments already complete, concat with -c copy. Survives the OS
// killing Chrome mid-render (a re-run resumes at the first missing segment).
//   node gen/glowup/render.mjs GlowupS2 out/glowup/s2-raw.mp4 [segFrames=420]
// Delete out/glowup/.seg-<Comp>/ after changing the composition: segments are
// not fingerprinted against the source.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, openBrowser } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [comp, out, segArg] = process.argv.slice(2);
const SEG = Number(segArg ?? 420);
const root = path.resolve('.');
const work = path.join(path.dirname(out), `.seg-${comp}`);
mkdirSync(work, { recursive: true });

const ok = (f) => {
  if (!existsSync(f)) return false;
  try {
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]);
    return true;
  } catch { return false; }
};

const serveUrl = await bundle({ entryPoint: path.join(root, 'src/refina/glowup/entry.ts'), publicDir: path.join(root, 'public-glowup') });
const browser = await openBrowser('chrome');
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser });
const total = composition.durationInFrames;
const segs = [];
for (let s = 0, i = 0; s < total; s += SEG, i++) {
  const e = Math.min(total - 1, s + SEG - 1);
  const f = path.join(work, `seg${String(i).padStart(2, '0')}.mp4`);
  segs.push(f);
  if (ok(f)) { console.log(`seg ${i} ${s}-${e} done already`); continue; }
  const t0 = Date.now();
  await renderMedia({
    serveUrl, composition, codec: 'h264', outputLocation: f, frameRange: [s, e], concurrency: 1,
    imageFormat: 'png', crf: 18, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '192k',
    puppeteerInstance: browser,
    // one line per 30 rendered frames with a clock, so a stall shows WHERE it stalled
    onProgress: ({ renderedFrames }) => { if (renderedFrames % 30 === 0) console.log(`  seg ${i} frame ${s + renderedFrames} ${new Date().toLocaleTimeString()}`); },
    timeoutInMilliseconds: 120000,
  });
  console.log(`seg ${i} ${s}-${e} rendered in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close({ silent: true });
const list = path.join(work, 'list.txt');
writeFileSync(list, segs.map((s) => `file '${path.resolve(s).replace(/\\/g, '/')}'`).join('\n'));
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]);
console.log('wrote', out, `${total} frames`);
