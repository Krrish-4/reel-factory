"""Typeset the celebrity-feature scripts as a PDF, from the script files.

    python docs/scripts/make-pdf.py                       # the three celeb scripts
    python docs/scripts/make-pdf.py docs/scripts/lips.txt # or any script(s)
    python docs/scripts/make-pdf.py --out out/x.pdf

GENERATED, NOT TYPED. The PDF is built by parsing the same .txt files
gen-voiceover.py reads, so a line edited in a script is a line changed in the
PDF on the next run and the two cannot drift. Nothing here restates a script;
if this file and a script disagree, this file is broken.

The duration figures come from wordcount.py rather than being recomputed, so
there is one calibrated rate in the repo and not two.

Rendering is Chrome headless --print-to-pdf. Playfair Display and Inter are
the brand faces (src/fonts.ts) and are pulled from Google Fonts at build time;
if the machine is offline the stacks fall back to a system serif and sans and
the document still sets correctly, only off-brand.
"""
import argparse
import html
import pathlib
import re
import shutil
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from wordcount import parse, MID_WPM, LO_WPM, HI_WPM  # one calibrated rate

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
SCRIPTS = ROOT / "docs" / "scripts"
DEFAULT = ["celeb-sweeney-lips.txt", "celeb-zendaya-midface.txt", "celeb-elordi-jaw.txt"]

TITLE = re.compile(r'^#\s*"(?P<title>[^"]+)"\s*[\u2014-]\s*(?P<sub>.+?)\.?\s*$')
BEAT = re.compile(r"^#\s*--\s*(?P<n>\d+)\.\s*(?P<name>.+?)\s*-{3,}\s*$")
SLOTS = re.compile(r"^#\s*SLOTS:\s*(?P<rest>.+)$")

CHROMES = [
    pathlib.Path.home() / "AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe",
    pathlib.Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
    pathlib.Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
]


def read(path):
    """A script -> its title, subtitle, slot string and beats of spoken lines."""
    title, sub, slots, beats = path.stem, "", [], []
    in_slots = False
    for raw in path.read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        m = TITLE.match(s)
        if m and not beats and title == path.stem:
            title, sub = m.group("title"), m.group("sub")
            continue
        m = SLOTS.match(s)
        if m:
            slots.append(m.group("rest"))
            in_slots = True
            continue
        if in_slots:
            # The SLOTS block wraps over following comment lines until a break.
            if s.startswith("#") and s.strip("# ") and not BEAT.match(s):
                slots.append(s.lstrip("# ").rstrip())
                continue
            in_slots = False
        m = BEAT.match(s)
        if m:
            beats.append({"n": m.group("n"), "name": m.group("name"), "lines": []})
            continue
        if not s or s.startswith("#") or s == "---":
            continue
        text, _, pause = s.partition("|")
        if beats:
            beats[-1]["lines"].append((text.strip(), pause.strip() or "0.45"))
    slot_text = " ".join(slots)
    slot_text = re.sub(r"\s+", " ", slot_text).strip()
    return title, sub, slot_text, beats


def stats(path):
    lines = parse(path)
    words = sum(len(re.findall(r"[\w'-]+", t)) for t, _ in lines)
    pause = sum(p for _, p in lines)
    return (len(lines), words,
            words / MID_WPM * 60 + pause,
            words / HI_WPM * 60 + pause,
            words / LO_WPM * 60 + pause)


CSS = """
@page { size: A4; margin: 0; }
:root {
  --paper:#F3EEE7; --ink:#241F1B; --mauve:#C6898A;
  --mute:rgba(36,31,27,.52); --rule:rgba(36,31,27,.16);
}
* { box-sizing: border-box; }
html, body { background:var(--paper); }
body { margin:0; color:var(--ink);
       font-family:Inter,'Segoe UI',system-ui,sans-serif;
       -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.sheet { padding:0; }
section { break-after:page; page-break-after:always;
          padding:14mm 15mm 12mm; background:var(--paper); }
section:last-of-type { break-after:auto; page-break-after:auto; }

.kicker { font-size:8.5pt; letter-spacing:.20em; text-transform:uppercase;
          color:var(--mauve); font-weight:600; }
h1 { font-family:'Playfair Display',Georgia,serif; font-weight:500;
     font-size:25pt; line-height:1.05; margin:.16em 0 .08em; letter-spacing:-.01em; }
.sub { font-size:9.5pt; color:var(--mute); margin:0 0 .85em; }
.meta { font-size:8pt; letter-spacing:.06em; text-transform:uppercase;
        color:var(--mute); border-top:1px solid var(--rule);
        border-bottom:1px solid var(--rule); padding:.45em 0; margin-bottom:.8em; }
.meta b { color:var(--ink); font-weight:600; }
.slots { font-size:7.8pt; line-height:1.45; color:var(--mute);
         margin:0 0 .9em; padding-left:.8em; border-left:2px solid var(--mauve); }

.beat { margin:0 0 .62em; break-inside:avoid; page-break-inside:avoid; }
.beatname { display:flex; align-items:baseline; gap:.55em; margin:0 0 .22em; }
.beatname .num { font-size:8pt; font-weight:700; color:var(--mauve);
                 font-variant-numeric:tabular-nums; }
.beatname .nm { font-size:8pt; letter-spacing:.17em; text-transform:uppercase;
                color:var(--mute); font-weight:600; }
.beatname .bar { flex:1; height:1px; background:var(--rule); }

.line { display:flex; align-items:baseline; gap:.7em; padding:.055em 0; }
.say { font-family:'Playfair Display',Georgia,serif; font-size:11.8pt;
       line-height:1.26; flex:0 1 auto; }
.dots { flex:1 1 auto; border-bottom:1px dotted var(--rule); min-width:1.2em;
        transform:translateY(-.22em); }
.pause { font-size:7.6pt; color:var(--mute); font-variant-numeric:tabular-nums;
         letter-spacing:.04em; white-space:nowrap; }

.front h1 { font-size:34pt; }
.front p { font-size:10pt; line-height:1.55; max-width:44em; }
.front h2 { font-size:8.5pt; letter-spacing:.18em; text-transform:uppercase;
            color:var(--mauve); margin:1.6em 0 .5em; font-weight:700; }
table { border-collapse:collapse; width:100%; font-size:9pt; }
td,th { text-align:left; padding:.34em .6em .34em 0; vertical-align:top;
        border-bottom:1px solid var(--rule); }
th { font-size:7.8pt; letter-spacing:.13em; text-transform:uppercase;
     color:var(--mute); font-weight:600; }
td.n { width:2.2em; color:var(--mauve); font-weight:700;
       font-variant-numeric:tabular-nums; }
td.w { width:9em; color:var(--mute); }
.warn { font-size:9pt; line-height:1.5; background:rgba(198,137,138,.12);
        border-left:2px solid var(--mauve); padding:.7em .9em; margin:.7em 0 0; }
.foot { margin-top:1.4em; font-size:8pt; color:var(--mute);
        border-top:1px solid var(--rule); padding-top:.6em; }
"""

FRONT = """
<section class="front">
  <div class="kicker">Refina AI &middot; reel scripts</div>
  <h1>The celebrity&#8209;feature format</h1>
  <p class="sub">Three plug-and-play explainers, and the shape they share.</p>
  <p>Swap the person, swap the feature, the reel is the same. All three scripts
  run one rule, and it is the rule both finished Refina explainers already run:
  <b>a feature is never read on its own &mdash; it is read against the two
  features next to it.</b> Change the feature and the neighbours re-read without
  moving. Filling the template is really just answering <i>which two
  neighbours</i>.</p>

  <h2>The beat map &mdash; ten beats, 27 lines</h2>
  <table>
    <tr><th>#</th><th>beat</th><th>does</th></tr>
    <tr><td class="n">01</td><td class="w">hook</td><td>a question about the viewer&rsquo;s own face, then the celebrity as the standard they measure against</td></tr>
    <tr><td class="n">02</td><td class="w">claim</td><td>flat, and about the viewer too</td></tr>
    <tr><td class="n">03</td><td class="w">mechanism</td><td>the reproducible geometric reason &mdash; or a cited source, if one has been read</td></tr>
    <tr><td class="n">04</td><td class="w">one</td><td>the first neighbour re-reads, with its own visual proof</td></tr>
    <tr><td class="n">05</td><td class="w">two</td><td>the second neighbour re-reads</td></tr>
    <tr><td class="n">06</td><td class="w">demo</td><td>the Refina range, dialled</td></tr>
    <tr><td class="n">07</td><td class="w">the turn</td><td>3D &mdash; the angle a front photograph hides</td></tr>
    <tr><td class="n">08</td><td class="w">nuance</td><td>complicate your own claim. <b>Not optional</b></td></tr>
    <tr><td class="n">09</td><td class="w">self-test</td><td>something to do right now. The most saveable moment</td></tr>
    <tr><td class="n">10</td><td class="w">CTA</td><td>the standard, then Search Refina AI</td></tr>
  </table>

  <h2>Reading these pages</h2>
  <p>Each line is one spoken phrase. The figure on the right is the silence
  <i>after</i> it, in seconds &mdash; it is part of the script, not a note about
  it, and it is what makes the writing land as punches rather than paragraphs.
  Beat numbers group the lines and are what the shot plan counts.</p>

  <div class="warn"><b>Three things are not decided in these pages.</b>
  Whether the demo beats dial the celebrity&rsquo;s face or a stand-in (the lines
  are written to read correctly either way); where the 3D turn&rsquo;s footage
  comes from, since no such asset exists yet; and whether beat 3 stays as
  mechanism or takes a cited source. A citation is allowed &mdash; it just has to
  be real, recorded with its DOI, and actually read.</div>

  <div class="foot">Generated from the script files by
  <b>docs/scripts/make-pdf.py</b> &mdash; each page is parsed from the same
  <b>docs/scripts/celeb-*.txt</b> that <b>gen-voiceover.py</b> reads, so editing
  a line there changes it here on the next run. Nothing in this PDF is typed
  twice. Durations come from <b>docs/scripts/wordcount.py</b>, calibrated
  against both finished voiceovers.</div>
</section>
"""


def build_html(paths):
    out = [f"<meta charset='utf-8'><title>Refina celebrity-feature scripts</title>",
           "<link rel='preconnect' href='https://fonts.googleapis.com'>",
           "<link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>",
           "<link href='https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600"
           "&family=Inter:wght@300;400;600;700&display=swap' rel='stylesheet'>",
           f"<style>{CSS}</style><div class='sheet'>", FRONT]
    for i, p in enumerate(paths, 1):
        title, sub, slots, beats = read(p)
        n, words, est, lo, hi = stats(p)
        out.append("<section>")
        out.append(f"<div class='kicker'>Script {i} of {len(paths)}</div>")
        out.append(f"<h1>{html.escape(title)}</h1>")
        if sub:
            out.append(f"<p class='sub'>{html.escape(sub)}</p>")
        out.append(
            f"<div class='meta'><b>{n}</b> lines &nbsp;&middot;&nbsp; <b>{words}</b> words "
            f"&nbsp;&middot;&nbsp; est <b>{est:.0f}s</b> ({lo:.0f}&ndash;{hi:.0f}s) "
            f"&nbsp;&middot;&nbsp; {html.escape(p.name)}</div>")
        if slots:
            out.append(f"<div class='slots'>{html.escape(slots)}</div>")
        for b in beats:
            out.append("<div class='beat'><div class='beatname'>"
                       f"<span class='num'>{int(b['n']):02d}</span>"
                       f"<span class='nm'>{html.escape(b['name'])}</span>"
                       "<span class='bar'></span></div>")
            for text, pause in b["lines"]:
                out.append("<div class='line'>"
                           f"<span class='say'>{html.escape(text)}</span>"
                           "<span class='dots'></span>"
                           f"<span class='pause'>{html.escape(pause)}s</span></div>")
            out.append("</div>")
        out.append("</section>")
    out.append("</div>")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scripts", nargs="*", help="script .txt files (default: the three celeb ones)")
    ap.add_argument("--out", default="out/refina-celeb-scripts.pdf")
    a = ap.parse_args()

    paths = [pathlib.Path(s) for s in a.scripts] or [SCRIPTS / f for f in DEFAULT]
    missing = [p for p in paths if not p.is_file()]
    if missing:
        print("missing:", *missing, sep="\n  ")
        return 1

    out = ROOT / a.out
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".html")
    tmp.write_text(build_html(paths), encoding="utf-8")

    chrome = next((c for c in CHROMES if c.is_file()), None) or shutil.which("chrome")
    if not chrome:
        print(f"no Chrome found; HTML written to {tmp} — print it to PDF by hand")
        return 1

    r = subprocess.run([str(chrome), "--headless", "--disable-gpu",
                        "--no-pdf-header-footer", "--virtual-time-budget=8000",
                        f"--print-to-pdf={out}", tmp.as_uri()],
                       capture_output=True, text=True)
    if not out.is_file():
        print(r.stderr[-2000:] or "chrome produced no pdf")
        return 1
    tmp.unlink(missing_ok=True)
    print(f"wrote {out.relative_to(ROOT)}  ({out.stat().st_size/1024:.0f} KB, "
          f"{len(paths)} scripts + cover)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
