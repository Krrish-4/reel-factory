/**
 * Drive Google Flow's MIGRATED frontend (flow.google.com) directly.
 *
 * WHY THIS EXISTS. Google moved this account off labs.google between 2026-08-31
 * and 2026-09-04. Both gflow CLIs died on it and neither has been ported:
 *   - ffroliva/gflow-cli (python) anchors every selector on Material Symbols
 *     ligatures. The new frontend renders 0 of them, so it cannot see the page
 *     at all -- it exits 36 FlowHostMigratedError and upstream says image
 *     generation is "still pending" (issue #639).
 *   - @swissmarley/gflow-cli (npm) uses role/text selectors, which mostly
 *     survived, but it was published before the migration and broke in five
 *     separate places (see git history of this file's introduction).
 * Both were removed. This file is what replaced them, and it only depends on
 * playwright-core + the real Chrome already on the machine.
 *
 * THE SEVEN THINGS THAT COST A SESSION TO LEARN -- do not rediscover them:
 *
 * 1. THE PROMPT BOX IS A contenteditable DIV WITH NO role="textbox".
 *    The npm CLI looked for [role="textbox"][contenteditable="true"] and
 *    reported "login required" when it missed -- a selector miss wearing an
 *    auth error's clothes. The session was fine the whole time.
 *
 * 2. EVERY IMAGE APPEARS TWICE: once in the media grid (x < 900) and once in
 *    the session panel on the right. ONLY THE GRID COPY HAS A ⋮ MENU. Picking
 *    a tile by size selects the session copy and every menu action silently
 *    does nothing. Always filter on x < 900.  -> tileInGrid()
 *
 * 3. DOWNLOAD THE `before` AT 2K BEFORE ATTACHING IT AS AN INGREDIENT.
 *    "Add to prompt" moves the hero OUT of the media grid into the session
 *    panel, where (see 2) it can no longer be downloaded. Order is load-bearing;
 *    it is why pair() downloads before it edits.
 *
 * 4. 2K IS AN ASYNC SERVER-SIDE UPSCALE. The menu toast says "Upscaling your
 *    image, download will start automatically". A fresh upscale can take minutes;
 *    an already-upscaled one returns in ~3s. Hence the 10 minute download wait.
 *
 * 5. SAVE VIA dl.path() + copyFileSync, NOT dl.saveAs(). Chrome gets OOM-killed
 *    on this machine (16 GB, ~3 GB free) and saveAs() then fails with "Target
 *    page, context or browser has been closed" AFTER the bytes already arrived.
 *
 * 6. THE SETTINGS POPOVER IS NOT A RADIX LAYER AND IGNORES Escape. It commits
 *    on its own "Save" button, and until it closes it covers the submit button.
 *    Its ratio options render as "crop_portrait3:4" -- ligature AND text -- so
 *    matching on the visible ratio text works.
 *
 * 7. A RENDER THAT HAS NOT ARRIVED IS NOT A FAILED RENDER. Flow is frequently
 *    slower than a 10-15 minute poll (its own banner says "experiencing high
 *    demand"). Every apparent failure in testing turned out to be a render that
 *    landed later. Re-run `list` before regenerating and spending credits.
 *
 * WATERMARKS: an i2i `after` carries TWO sparkles -- its parent's, re-rendered
 * as image content, plus a fresh one Flow stamps higher up. Measured on a
 * 1792x2400 render they span rows 2153-2305 (89.7%-96.0% of height), so
 * generate.py's strip_watermark() bottom-6% crop (starts at 94.0%) removes the
 * before's mark and LEAVES most of the after's. Crop ~11% for an i2i after.
 *
 * USAGE
 *   node gen/flow.mjs list     --project <url>
 *   node gen/flow.mjs generate --project <url|new> --prompt-file f.txt [--ratio 3:4]
 *   node gen/flow.mjs edit     --project <url> --hero <frag> --prompt-file f.txt
 *   node gen/flow.mjs download --project <url> --frag <frag> --dest out.jpeg [--size 2K|1K]
 *   node gen/flow.mjs pair     --before-file b.txt --after-file a.txt --out DIR --name ID
 *
 * `pair` is the whole subject workflow and the one to use: new project -> 3:4 ->
 * before -> 2K download -> attach -> after -> 2K download. Prompts come from
 * gen/subjects.toml via `python gen/flow-prompts.py`, never typed by hand.
 *
 * Requires a logged-in profile at .gflow/profiles/default (inherited from the
 * npm CLI's `gflow auth login`; a plain Chrome run against flow.google.com on
 * that user-data-dir re-establishes it).
 */
import { chromium } from 'playwright-core';
import { copyFileSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PROFILE = path.resolve('.gflow/profiles/default');
const DL_DIR = path.resolve('gen/out/_downloads');   // survives a browser crash
const HOME = 'https://flow.google.com/';

// Node buffers stdout when piped, so a long run looks dead from outside until
// it exits. Set FLOW_LOG=<path> and every line is also appended, unbuffered, so
// progress can be tailed while the run is still going.
const LOG_FILE = process.env.FLOW_LOG;
export const log = (...a) => {
  const line = new Date().toISOString().slice(11, 19) + ' ' + a.join(' ');
  console.log(line);
  if (LOG_FILE) { try { appendFileSync(LOG_FILE, line + '\n'); } catch {} }
};

/** Chrome refuses a second instance on a locked profile, and a force-killed
 *  profile then boots with a crash-restore bubble that changes what loads. */
function freeProfile() {
  // Only Chromes bound to OUR profile dir -- never the user's everyday Chrome.
  const ps = `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | ` +
    `Where-Object { $_.CommandLine -like '*\\.gflow\\profiles*' } | ` +
    `ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch {} }`;
  try { execFileSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'ignore' }); } catch {}
  try {
    const prefs = path.join(PROFILE, 'Default', 'Preferences');
    const j = JSON.parse(readFileSync(prefs, 'utf8'));
    j.profile = j.profile || {};
    j.profile.exit_type = 'Normal';
    j.profile.exited_cleanly = true;
    writeFileSync(prefs, JSON.stringify(j));
  } catch {}
}

export async function open() {
  freeProfile();
  mkdirSync(DL_DIR, { recursive: true });
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome',
    headless: false,           // Google's sign-in surface distrusts headless
    acceptDownloads: true,
    // Without downloadsPath Playwright stages downloads in a temp dir it DELETES
    // when the browser closes -- so an OOM kill between "bytes arrived" and
    // dl.path() loses the file. Here they land on disk and survive the crash,
    // which is what harvestNewest() then recovers.
    downloadsPath: DL_DIR,
    // This machine runs at ~3 GB free and Chrome is killed mid-run without
    // these. Flow is a heavy SPA; the GPU/rasteriser processes are pure cost
    // here because nothing needs to composite fast, only to be clickable.
    args: [
      '--no-first-run', '--no-default-browser-check', '--hide-crash-restore-bubble',
      '--renderer-process-limit=2',
      '--disable-extensions',
      '--disable-gpu', '--disable-software-rasterizer',
      '--disable-dev-shm-usage', '--disable-background-networking',
      '--window-size=1280,900',
    ],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.setDefaultTimeout(60000);
  // Chrome gets OOM-killed on this machine mid-run. Without these, the symptom
  // surfaces later as "Target page, context or browser has been closed" from
  // whatever call happened to be next, which reads like a bug in that call.
  ctx.on('close', () => log('!! browser context closed'));
  page.on('crash', () => log('!! page crashed (out of memory?)'));
  return { ctx, page };
}

/** Editor is ready when the prompt box exists. The migrated app boots slowly;
 *  judging readiness instantly is what made the npm CLI report a healthy
 *  session as logged out. */
async function ready(page) {
  await page.locator('[contenteditable="true"]').first()
    .waitFor({ state: 'visible', timeout: 150000 });
  await page.waitForTimeout(9000);
}

export async function gotoProject(page, url) {
  if (url === 'new') {
    await page.goto(HOME, { waitUntil: 'domcontentloaded' });
    const np = page.getByRole('button', { name: /new project/i }).first();
    await np.waitFor({ state: 'visible', timeout: 150000 });
    await np.click();
  } else {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  }
  await ready(page);
  return page.url();
}

/** Unique image ids currently in the project (grid + panel). */
export async function images(page) {
  return page.evaluate(() => [...new Set(
    [...document.querySelectorAll('img[src*="/asb/"]')].map(i => i.src.replace(/=s\d+.*$/, ''))
  )]);
}

/** The MEDIA GRID copy of a tile -- see note 2. Session-panel copies (x >= 900)
 *  look identical and expose no controls. */
export async function tileInGrid(page, frag) {
  const t = page.locator(`img[src*="${frag}"]`);
  let tile = null, box = null;
  for (let i = 0; i < await t.count(); i++) {
    const b = await t.nth(i).boundingBox().catch(() => null);
    if (b && b.x < 900 && b.y > 60 && (!box || b.x < box.x)) { tile = t.nth(i); box = b; }
  }
  return tile ? { tile, box } : null;
}

/** Open a tile's ⋮ menu. The buttons only exist while hovering, and the
 *  project-level "More options" in the top bar has the SAME accessible name --
 *  so the tile's own is found by geometry, not by name. */
async function tileMenu(page, frag) {
  const found = await tileInGrid(page, frag);
  if (!found) return false;
  const { tile, box } = found;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await tile.hover({ force: true });
  await page.waitForTimeout(1400);
  const inside = await page.evaluate(r => [...document.querySelectorAll('button')].map(b => {
    const q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    return {
      label: (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 24),
      cx: Math.round(cx), cy: Math.round(cy),
      inside: cx >= r.x && cx <= r.x + r.width && cy >= r.y && cy <= r.y + r.height,
    };
  }).filter(o => o.inside), { x: box.x, y: box.y, width: box.width, height: box.height });
  const dots = inside.find(o => /more option/i.test(o.label));
  if (!dots) return false;
  await page.mouse.click(dots.cx, dots.cy);
  await page.waitForTimeout(2200);
  return true;
}

export async function setRatio(page, ratio) {
  await page.getByRole('button', { name: /^settings$/i }).first().click({ force: true });
  await page.waitForTimeout(2500);
  const opt = page.locator('button,[role=button],[role=radio],[role=option]')
    .filter({ hasText: new RegExp(`${ratio.replace(':', ':')}$`) }).first();
  if (await opt.count()) { await opt.click({ force: true }); log('  ratio', ratio); }
  else log('  WARN ratio option not found:', ratio);
  await page.waitForTimeout(700);
  const save = page.getByRole('button', { name: /^save$/i }).first();   // note 6
  if (await save.count()) await save.click({ force: true });
  await page.waitForTimeout(2000);
}

/** insertText, not pressSequentially: a ~1000 char prompt typed key-by-key
 *  blows past any reasonable timeout and is what killed the npm CLI's run. */
export async function submitPrompt(page, prompt) {
  const box = page.locator('[contenteditable="true"]').first();
  await box.click();
  await page.keyboard.insertText(prompt);
  await page.waitForTimeout(1500);
  const got = (await box.innerText().catch(() => '')).length;
  log('  prompt in box:', got, 'chars');
  await page.getByRole('button', { name: /start generation/i }).first().click();
}

export async function waitForNew(page, before, maxSec = 1200) {
  for (let i = 0; i < maxSec / 15; i++) {
    await page.waitForTimeout(15000);
    const now = await images(page).catch(() => null);
    if (!now) continue;
    const fresh = now.filter(s => !before.includes(s));
    if (fresh.length) { log('  arrived after', (i + 1) * 15, 's'); return fresh; }
  }
  log('  nothing new within', maxSec, 's -- re-run `list`, it may still land (note 7)');
  return [];
}

/** Chrome dies at the download often enough on this machine that one silent
 *  retry is worth more than a clean stack trace. The generation is already paid
 *  for by then -- only the fetch is being retried. */
export async function downloadWithRetry(ctxRef, projectUrl, frag, dest, size = '2K') {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) {
      log('  retrying download in a fresh browser');
      await ctxRef.ctx.close().catch(() => {});
      Object.assign(ctxRef, await open());
      await gotoProject(ctxRef.page, projectUrl);
    }
    if (await download(ctxRef.page, frag, dest, size)) return true;
  }
  return false;
}

/** Newest completed file written under DL_DIR after `since`, moved to dest.
 *  Chrome writes a .crdownload while transferring; those are skipped. */
function harvestNewest(dest, since) {
  let best = null;
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (p.endsWith('.crdownload')) continue;
      const st = statSync(p);
      if (st.mtimeMs >= since && st.size > 10000 && (!best || st.mtimeMs > best.m)) best = { p, m: st.mtimeMs };
    }
  };
  try { walk(DL_DIR); } catch { return false; }
  if (!best) return false;
  copyFileSync(best.p, dest);
  return true;
}

export async function download(page, frag, dest, size = '2K') {
  const since = Date.now() - 1000;
  if (!await tileMenu(page, frag)) { log('  no grid tile/menu for', frag.slice(-12)); return false; }
  await page.locator('[role=menuitem],button').filter({ hasText: /download/i }).first().click({ force: true });
  await page.waitForTimeout(2500);
  const opt = page.locator('[role=menuitem],button,[role=option]').filter({ hasText: new RegExp(size, 'i') }).first();
  if (!await opt.count()) { log('  no', size, 'entry'); return false; }
  const dlP = page.waitForEvent('download', { timeout: 600000 }).catch(() => null);   // note 4
  await opt.click({ force: true });
  const dl = await dlP;
  if (!dl) {
    if (harvestNewest(dest, since)) { log('  SAVED', path.basename(dest), '(recovered; no download event)'); return true; }
    log('  no download event');
    return false;
  }
  try {                                                                                // note 5
    copyFileSync(await dl.path(), dest);
  } catch (e1) {
    log('  path-copy failed:', String(e1).slice(0, 70));
    try {
      await dl.saveAs(dest);
    } catch {
      // Browser died after the bytes landed. downloadsPath means they are still
      // on disk -- go and get them rather than paying for the render again.
      if (!harvestNewest(dest, since)) { log('  lost the download entirely'); return false; }
      log('  recovered from', path.basename(DL_DIR), 'after browser death');
    }
  }
  log('  SAVED', path.basename(dest));
  return true;
}

/** Fetch a render straight off its /asb/ URL at original size.
 *
 *  The menu download is the ONLY way to get Flow's 2K upscale, but it routes
 *  through Chrome's download machinery, which is exactly where this machine
 *  OOM-kills the browser. This path is a plain in-page fetch of bytes already
 *  served to the tab: far cheaper, and it never fails for memory. The trade is
 *  resolution -- you get the native render (896x1200), not the 2K upscale.
 *
 *  Use it as a fallback so a render is never lost, and re-pull the 2K later.
 */
export async function fetchOriginal(page, frag, dest) {
  const find = () => page.evaluate((f) => {
    const el = [...document.querySelectorAll('img')].find(i => i.src.includes(f));
    return el ? el.src.replace(/=s\d+.*$/, '') : null;
  }, frag).catch(() => null);
  let base = await find();
  // An image consumed as an i2i ingredient is removed from the media grid AND
  // from the ingredient picker; it survives only in the session-history panel,
  // which virtualises -- scrolled far enough out of view its <img> is not in the
  // DOM at all. Scroll the panel back before concluding the image is gone.
  for (let i = 0; !base && i < 8; i++) {
    await page.mouse.move(1050, 350);
    await page.mouse.wheel(0, -700);
    await page.waitForTimeout(900);
    base = await find();
  }
  if (!base) { log('  no img for', frag.slice(-12)); return false; }
  const bytes = await page.evaluate(async (u) => {
    const r = await fetch(u + '=s0', { credentials: 'include' });
    if (!r.ok) return null;
    return Array.from(new Uint8Array(await r.arrayBuffer()));
  }, base).catch(() => null);
  if (!bytes || bytes.length < 20000) { log('  fetch failed for', frag.slice(-12)); return false; }
  writeFileSync(dest, Buffer.from(bytes));
  log('  FETCHED', path.basename(dest), `(${bytes.length} bytes, original size)`);
  return true;
}

/** Attach a LOCAL FILE as the i2i ingredient, via the prompt bar's ingredient
 *  picker and its "Upload media" entry.
 *
 *  WHY THIS EXISTS RATHER THAN addToPrompt(). An ingredient taken from the
 *  project is CONSUMED: after the generation it is gone from the media grid AND
 *  from the picker (All / Images / Uploads all stop listing it), surviving only
 *  as a thumbnail in the session history. So a turntable of N views off one hero
 *  cannot re-attach that hero N times -- the second attach has nothing to find.
 *  Uploading our own copy each round sidesteps it entirely, and anchors identity
 *  to a file we control rather than to Flow's library state.
 */
export async function uploadIngredient(page, filePath) {
  const picker = page.getByRole('button', { name: /add ingredients to the prompt/i }).first();
  if (!await picker.count()) { log('  no ingredient picker'); return false; }
  await picker.click({ force: true });
  await page.waitForTimeout(2500);

  const chooser = page.waitForEvent('filechooser', { timeout: 30000 }).catch(() => null);
  let up = page.locator('button,[role=menuitem],[role=option]').filter({ hasText: /upload media/i }).first();
  // The FIRST upload in a fresh project can open the picker before its entries
  // render (trio1, 2026-10-23: "no Upload media entry", then the second round
  // in the same project found it). Close, wait, reopen once before giving up.
  if (!await up.count()) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(5000);
    await picker.click({ force: true });
    await page.waitForTimeout(4000);
    up = page.locator('button,[role=menuitem],[role=option]').filter({ hasText: /upload media/i }).first();
  }
  if (!await up.count()) { log('  no "Upload media" entry'); return false; }
  await up.click({ force: true });
  const fc = await chooser;
  if (fc) await fc.setFiles(filePath);
  else {                                   // some builds expose the input directly
    const input = page.locator('input[type=file]').first();
    if (!await input.count()) { log('  no file chooser and no file input'); return false; }
    await input.setInputFiles(filePath);
  }
  await page.waitForTimeout(9000);         // the upload has to land before it can be picked

  const add = page.locator('button,[role=menuitem]').filter({ hasText: /^add to prompt$/i }).first();
  if (await add.count()) { await add.click({ force: true }); }
  await page.waitForTimeout(3000);

  // The picker stays open over the prompt bar and covers "Start generation", so
  // the next submit times out clicking a button it can see but cannot reach.
  // Same shape as the settings popover (note 6): close it explicitly and verify.
  for (let i = 0; i < 4; i++) {
    const submit = page.getByRole('button', { name: /start generation/i }).first();
    if (await submit.count() && await submit.isVisible().catch(() => false)) {
      const box = await submit.boundingBox().catch(() => null);
      if (box) {
        // clickable means nothing is layered on top of its centre
        const clear = await page.evaluate(([x, y]) => {
          const el = document.elementFromPoint(x, y);
          return !!el && !!el.closest('button');
        }, [box.x + box.width / 2, box.y + box.height / 2]).catch(() => false);
        if (clear) break;
      }
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(1200);
  }
  log('  uploaded ingredient:', path.basename(filePath));
  return true;
}

/** Attach an existing render as an i2i ingredient. THIS DISPLACES IT OUT OF THE
 *  MEDIA GRID -- download anything you need from it first (note 3). */
export async function addToPrompt(page, frag) {
  if (!await tileMenu(page, frag)) return false;
  const add = page.locator('[role=menuitem],button').filter({ hasText: /add to prompt/i }).first();
  if (!await add.count()) return false;
  await add.click({ force: true });
  await page.waitForTimeout(3000);
  return true;
}

/** before -> 2K -> attach -> after -> 2K, in the only order that works. */
export async function pair({ beforePrompt, afterPrompt, out, name, ratio = '3:4' }) {
  mkdirSync(out, { recursive: true });
  const { ctx, page } = await open();
  try {
    const proj = await gotoProject(page, 'new');
    log('project:', proj);
    await setRatio(page, ratio);

    log('BEFORE');
    await submitPrompt(page, beforePrompt);
    const cands = await waitForNew(page, []);
    if (!cands.length) { log('no before render; project kept:', proj); return { project: proj }; }
    await page.waitForTimeout(6000);

    // 2K FIRST -- attaching later evicts these tiles from the grid (note 3)
    const befores = [];
    for (let i = 0; i < cands.length; i++) {
      const dest = path.join(out, `${name}-before${cands.length > 1 ? i : ''}-2k.jpeg`);
      if (await download(page, cands[i].slice(-16), dest)) befores.push({ frag: cands[i].slice(-16), dest });
      await page.waitForTimeout(1500);
    }
    if (!befores.length) { log('could not download a before; project kept:', proj); return { project: proj }; }

    const hero = befores[0];   // caller picks by regenerating or by editing this
    log('AFTER (i2i off', hero.frag.slice(-8) + ')');
    const seen = await images(page);
    if (!await addToPrompt(page, hero.frag)) { log('could not attach hero'); return { project: proj, befores }; }
    await submitPrompt(page, afterPrompt);
    const fresh = await waitForNew(page, seen);
    if (!fresh.length) { log('no after render; project kept:', proj); return { project: proj, befores }; }
    await page.waitForTimeout(6000);

    const afters = [];
    for (let i = 0; i < fresh.length; i++) {
      const dest = path.join(out, `${name}-after${fresh.length > 1 ? i : ''}-2k.jpeg`);
      if (await download(page, fresh[i].slice(-16), dest)) afters.push(dest);
      await page.waitForTimeout(1500);
    }
    log('done. project:', proj);
    return { project: proj, befores, afters };
  } finally {
    await ctx.close().catch(() => {});
  }
}

// ---------------------------------------------------------------- CLI
// Only when run directly. Importing this file must not execute a command --
// other tools (gen/flow-turntable.mjs) import these functions as a library.

/** i2i off a LOCAL file, once per prompt, into one project.
 *
 *  WHY THIS EXISTS BESIDE pair(). pair() generates its own `before` and then
 *  attaches it, which is right when both halves are ours. RefinaSize's hero is
 *  a consented PHOTOGRAPH, so there is no before to generate -- the identity
 *  anchor is a file on disk. Every round re-uploads that same file rather than
 *  reusing the previous upload: an ingredient taken from the picker is evicted
 *  from it (see uploadIngredient's note), and re-uploading also means round N
 *  is derived from the hero and never from round N-1, so three variants cannot
 *  drift down a chain.
 *
 *  Downloads are 2K, matching pair(). A 2K variant against a 1K hero is not a
 *  pair -- the same trap note 3 records for the other direction.
 */
export async function derive({ heroFile, prompts, out, name, ratio = '3:4' }) {
  mkdirSync(out, { recursive: true });
  const { ctx, page } = await open();
  const made = [];
  try {
    const proj = await gotoProject(page, 'new');
    log('project:', proj);
    await setRatio(page, ratio);

    for (const { id, prompt } of prompts) {
      log('DERIVE', id);
      const seen = await images(page);
      if (!await uploadIngredient(page, heroFile)) { log('  could not upload hero; skipping', id); continue; }
      await submitPrompt(page, prompt);
      const fresh = await waitForNew(page, seen);
      if (!fresh.length) { log('  no render for', id, '-- project kept:', proj); continue; }
      await page.waitForTimeout(6000);
      for (let i = 0; i < fresh.length; i++) {
        const dest = path.join(out, `${name}-${id}${fresh.length > 1 ? i : ''}-2k.jpeg`);
        if (await download(page, fresh[i].slice(-16), dest)) made.push({ id, dest });
        await page.waitForTimeout(1500);
      }
    }
    log('done. project:', proj, '--', made.length, 'file(s)');
    return { project: proj, made };
  } finally {
    await ctx.close().catch(() => {});
  }
}

const RUN_DIRECTLY = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
function arg(k, d) { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; }
const cmd = RUN_DIRECTLY ? process.argv[2] : null;

if (cmd === 'derive') {
  const specs = arg('prompt-files', '').split(',').filter(Boolean).map((f) => ({
    id: path.basename(f).replace(/\.txt$/, ''),
    prompt: readFileSync(f, 'utf8').trim(),
  }));
  await derive({
    heroFile: arg('hero-file'), prompts: specs,
    out: arg('out', 'gen/out'), name: arg('name', 'subject'), ratio: arg('ratio', '3:4'),
  });
} else if (cmd === 'pair') {
  await pair({
    beforePrompt: readFileSync(arg('before-file'), 'utf8').trim(),
    afterPrompt: readFileSync(arg('after-file'), 'utf8').trim(),
    out: arg('out', 'gen/out'), name: arg('name', 'subject'), ratio: arg('ratio', '3:4'),
  });
} else if (cmd) {
  let { ctx, page } = await open();
  try {
    const proj = await gotoProject(page, arg('project', 'new'));
    if (cmd === 'list') {
      const grid = await page.evaluate(() => [...document.querySelectorAll('img[src*="/asb/"]')]
        .map(i => ({ x: Math.round(i.getBoundingClientRect().x), src: i.src.replace(/=s\d+.*$/, '') }))
        .filter(o => o.x < 900));
      log('project:', proj);
      [...new Set(grid.map(o => o.src))].forEach(s => log('  grid:', s.slice(-16)));
    } else if (cmd === 'generate') {
      if (arg('ratio')) await setRatio(page, arg('ratio'));
      const seen = await images(page);
      await submitPrompt(page, readFileSync(arg('prompt-file'), 'utf8').trim());
      (await waitForNew(page, seen)).forEach(s => log('  new:', s.slice(-16)));
      log('project:', proj);
    } else if (cmd === 'edit') {
      const seen = await images(page);
      if (!await addToPrompt(page, arg('hero'))) log('could not attach', arg('hero'));
      else {
        await submitPrompt(page, readFileSync(arg('prompt-file'), 'utf8').trim());
        (await waitForNew(page, seen)).forEach(s => log('  new:', s.slice(-16)));
      }
    } else if (cmd === 'download') {
      const ref = { ctx, page };
      const ok = await downloadWithRetry(ref, proj, arg('frag'), arg('dest'), arg('size', '2K'));
      ctx = ref.ctx;                      // retry may have replaced the context
      if (!ok) process.exitCode = 2;
    } else {
      log('unknown command:', cmd);
    }
  } finally {
    await ctx.close().catch(() => {});
  }
} else if (RUN_DIRECTLY) {
  console.log(readFileSync(new URL(import.meta.url)).toString().split('*/')[0]);
}
