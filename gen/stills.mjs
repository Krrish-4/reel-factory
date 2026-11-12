/**
 * Stills before render (reel-render skill): bundle ONCE, then shoot any number
 * of frames. `npx remotion still` re-bundles per frame, which made a per-beat
 * sweep cost minutes.
 *
 *   node gen/stills.mjs <CompositionId> <outDir> <frame> [<frame> ...]
 */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { enableTailwind } from '@remotion/tailwind-v4';

// Same override remotion.config.ts applies (the Node API does not read it):
// tailwind, plus the `@/` alias the vendored remocn components resolve through.
const webpackOverride = (c) => {
  const t = enableTailwind(c);
  return { ...t, resolve: { ...t.resolve, alias: { ...(t.resolve?.alias ?? {}), '@': path.join(process.cwd(), 'src') } } };
};

const [id, out, ...frames] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), webpackOverride });
const composition = await selectComposition({ serveUrl, id });
for (const f of frames.map(Number)) {
  const output = path.join(out, `${id}-${String(f).padStart(5, '0')}.png`);
  await renderStill({ serveUrl, composition, frame: f, output });
  console.log('wrote', output);
}
