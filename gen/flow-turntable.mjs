/**
 * One subject, many views: a before/after pair plus a turntable of angles, all
 * generated i2i off the subject's OWN frontal render so identity is anchored to
 * a file rather than re-described.
 *
 *   python gen/flow-prompts.py --subject rhino2 --after rhinoplasty --angles \
 *          --out-dir gen/out/rhino2
 *   FLOW_LOG=gen/out/rhino2/_run.log node gen/flow-turntable.mjs --name rhino2
 *
 *   --project <url>   resume into an existing project instead of creating one,
 *                     so a run interrupted after the before does not pay twice
 *   --dir <path>      prompt/output directory (default gen/out/<name>)
 *   --name <id>       output filename stem
 *
 * WHY IT REOPENS THE BROWSER. Chrome is OOM-killed on this machine (~3 GB free)
 * mid-run, and an eight-image set is long enough that it will happen at least
 * once. Aborting the set on a browser death would throw away every render
 * already paid for, so each step reopens and retries instead. State is written
 * to `_run.json` after every step, and `_run.log` is appended live (Node buffers
 * stdout when piped, so without FLOW_LOG a long run looks dead from outside).
 *
 * THE OPEN QUESTION THIS ANSWERS: whether an attached i2i ingredient survives
 * successive generations or is consumed by the first. The log says, every round,
 * whether the hero came back to the media grid.
 */
import { open, gotoProject, setRatio, submitPrompt, waitForNew, download, fetchOriginal, addToPrompt, images, tileInGrid, log }
  from './flow.mjs';
import { readFileSync, writeFileSync } from 'node:fs';

const A = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const NAME = A('name', 'rhino2');
const DIR = A('dir', `gen/out/${NAME}`);
const PROJECT = A('project', 'new');
const HERO = A('hero', null);          // explicit hero on a resume
const SKIP = (A('skip', '') || '').split(',').filter(Boolean);

const STEPS = [
  ['after', `${DIR}/after.txt`],
  ['three-quarter-left', `${DIR}/angle-three-quarter-left.txt`],
  ['three-quarter-right', `${DIR}/angle-three-quarter-right.txt`],
  ['profile-left', `${DIR}/angle-profile-left.txt`],
  ['profile-right', `${DIR}/angle-profile-right.txt`],
  ['chin-up', `${DIR}/angle-chin-up.txt`],
  ['chin-down', `${DIR}/angle-chin-down.txt`],
];

const state = { project: null, hero: null, made: [], failed: [], notes: [] };
const save = () => writeFileSync(`${DIR}/_run.json`, JSON.stringify(state, null, 1));

let ctx, page;
async function reopen(why) {
  log(`  reopening browser (${why})`);
  try { await ctx?.close(); } catch {}
  ({ ctx, page } = await open());
  await gotoProject(page, state.project);
}
const dead = (e) => /closed|crash|Target page/i.test(String(e));

/** Run one browser step; on a browser death, reopen once and try again. */
async function step(label, fn) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try { return await fn(); }
    catch (e) {
      if (attempt === 0 && dead(e)) { await reopen(label); continue; }
      log(`  ${label} failed: ${String(e).slice(0, 90)}`);
      return null;
    }
  }
}

({ ctx, page } = await open());
try {
  state.project = await gotoProject(page, PROJECT);
  log('project:', state.project); save();

  // ---- the before -------------------------------------------------------
  let cands = await images(page);
  if (PROJECT !== 'new' && cands.length) {
    log(`=== BEFORE (resumed - ${cands.length} image(s) already here) ===`);
  } else {
    await setRatio(page, '3:4');
    log('=== BEFORE ===');
    await submitPrompt(page, readFileSync(`${DIR}/before.txt`, 'utf8').trim());
    cands = await waitForNew(page, [], 1500);
  }
  if (!cands.length) throw new Error('no before render');
  await page.waitForTimeout(6000);
  // On a resume the project holds more than one image, and DOM order is not
  // generation order -- taking cands[0] would silently make the AFTER the hero
  // and every angle would then be a turntable of the wrong face.
  state.hero = HERO || cands[0].slice(-16); save();
  log('  hero:', state.hero);

  // Harvest everything already in the project before touching the prompt:
  // attaching evicts a tile from the grid, and only grid tiles can be
  // downloaded. On a resume that means the after, too.
  const others = cands.map(c => c.slice(-16)).filter(f => f !== state.hero);
  const grab = async (frag, label) => {
    const ok = await step(`${label}-download`, () => download(page, frag, `${DIR}/${NAME}-${label}-2k.jpeg`));
    if (ok) state.made.push(label);
    else {
      const alt = await step(`${label}-fetch`, () => fetchOriginal(page, frag, `${DIR}/${NAME}-${label}-orig.jpeg`));
      if (alt) { state.made.push(label + ' (original size)'); state.notes.push(`${label}: 2K failed, fetched native`); }
      else state.failed.push(`${label} (download)`);
    }
    save();
  };
  await grab(state.hero, 'before');
  for (let i = 0; i < others.length; i++) await grab(others[i], SKIP.includes('after') && i === 0 ? 'after' : `resumed${i}`);

  // ---- attach once, then every edit rides that ingredient ----------------
  const attached = await step('attach', () => addToPrompt(page, state.hero));
  if (!attached) throw new Error('could not attach hero');
  log('hero attached as ingredient');

  for (const [id, file] of STEPS) {
    if (SKIP.includes(id)) { log(`=== ${id.toUpperCase()} (skipped, already generated) ===`); continue; }
    log(`=== ${id.toUpperCase()} ===`);
    const back = await step('grid-check', () => tileInGrid(page, state.hero));
    if (back) {
      log('  hero is back in the grid - re-attaching');
      state.notes.push(`${id}: hero returned to grid, re-attached`);
      await step('reattach', () => addToPrompt(page, state.hero));
    } else {
      log('  hero not in grid (ingredient assumed still attached)');
    }

    const seen = (await step('images', () => images(page))) || [];
    const sent = await step('submit', () => submitPrompt(page, readFileSync(file, 'utf8').trim()));
    if (sent === null) { state.failed.push(`${id} (submit)`); save(); continue; }

    const fresh = (await step('wait', () => waitForNew(page, seen, 1500))) || [];
    if (!fresh.length) { log('  NO RENDER'); state.failed.push(id); save(); continue; }
    await page.waitForTimeout(6000);

    const frag = fresh[0].slice(-16);
    const got = await step('download', () => download(page, frag, `${DIR}/${NAME}-${id}-2k.jpeg`));
    if (got) state.made.push(id);
    else {
      const alt = await step('fetch', () => fetchOriginal(page, frag, `${DIR}/${NAME}-${id}-orig.jpeg`));
      if (alt) { state.made.push(id + ' (original size)'); state.notes.push(`${id}: 2K failed, fetched native`); }
      else state.failed.push(`${id} (download)`);
    }
    save();
  }
} catch (e) {
  log('ABORT:', String(e).slice(0, 140));
} finally {
  save();
  log('made:', state.made.join(', ') || 'none');
  log('failed:', state.failed.join(', ') || 'none');
  if (state.notes.length) log('notes:', state.notes.join(' | '));
  log('project kept:', state.project);
  try { await ctx?.close(); } catch {}
}
