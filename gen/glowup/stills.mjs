// Bundle the Glow Up entry ONCE and render many stills in one process.
//   node gen/glowup/stills.mjs GlowupS2 out/glowup/stills 100 250 400 ...
//   node gen/glowup/stills.mjs GlowupS2 out/glowup/stills --words    (one still per word cue in WORDS list below)
// Each `remotion still` call re-bundles the project; on this machine that is
// minutes per frame. This is seconds per frame after one bundle.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, openBrowser } from '@remotion/renderer';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const [comp, outDir, ...frames] = process.argv.slice(2);
const root = path.resolve('.');
mkdirSync(outDir, { recursive: true });
const t0 = Date.now();
const serveUrl = await bundle({
  entryPoint: path.join(root, 'src/refina/glowup/entry.ts'),
  publicDir: path.join(root, 'public-glowup'),
  webpackOverride: (c) => c,
  onProgress: (p) => { if (p % 25 === 0) process.stdout.write(`bundle ${p}%\n`); },
});
console.log(`bundled in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
const browser = await openBrowser('chrome');
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser });
for (const f of frames.map(Number)) {
  const out = path.join(outDir, `${comp}-f${String(f).padStart(4, '0')}.png`);
  await renderStill({ serveUrl, composition, frame: f, output: out, puppeteerInstance: browser, scale: 0.5 });
  console.log('still', out);
}
await browser.close({ silent: true });
