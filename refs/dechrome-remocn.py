#!/usr/bin/env python3
"""Strip the opaque full-frame ground out of vendored remocn components.

Why this exists
---------------
Several remocn text components paint their own full-bleed background:

    position: "absolute", inset: 0, background: "white",

Dropped into a sage reel unchanged, that paints a white card over the whole
1080x1920 frame and the `Stage` behind it never shows. The components are
otherwise fine, so the fix is one property per file -- but `shadcn add
--overwrite` restores the vendored original every time, silently undoing it.

So this is a script, not a hand-edit. Re-run it after any `shadcn add` that
touches src/components/remocn/ and the grounds go transparent again.

    python refs/dechrome-remocn.py           # apply
    python refs/dechrome-remocn.py --check   # exit 1 if any ground is still opaque

Only `background: "white"` on a full-frame wrapper is rewritten. Component-
internal grounds that are part of the artwork -- the polaroid frame, the
pixelate mosaic fill -- are deliberately left alone; they are not the reel's
background and removing them would break the component.
"""

from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TARGET_DIR = ROOT / "src" / "components" / "remocn"

# A full-frame wrapper painting an opaque ground: `inset: 0` and `background:
# "white"` inside one style block. Layout properties commonly sit between the
# two (display / alignItems / justifyContent), so allow any run of plain
# `key: value,` lines in between -- but nothing containing a brace, which keeps
# the match from crossing out of the style block into a sibling.
PATTERN = re.compile(
    r'(inset:\s*0,'
    r'(?:\n\s*[A-Za-z][A-Za-z0-9]*:\s*[^\n{}]*,)*?'
    r'\n\s*)background:\s*"white",'
)

# Grounds that belong to the artwork, never rewritten.
KEEP = {"polaroid.tsx", "pixelate-region.tsx"}


def main() -> int:
    check = "--check" in sys.argv
    if not TARGET_DIR.is_dir():
        print(f"no such directory: {TARGET_DIR}")
        return 1

    changed, offenders = [], []
    for path in sorted(TARGET_DIR.glob("*.tsx")):
        if path.name in KEEP:
            continue
        src = path.read_text(encoding="utf-8")
        new, n = PATTERN.subn(r'\1background: "transparent",', src)
        if not n:
            continue
        if check:
            offenders.append(f"{path.name} ({n})")
        else:
            path.write_text(new, encoding="utf-8")
            changed.append(f"{path.name} ({n})")

    if check:
        if offenders:
            print("opaque ground still present in:")
            for o in offenders:
                print(f"  {o}")
            return 1
        print("clean: no opaque full-frame grounds in src/components/remocn/")
        return 0

    if changed:
        print(f"de-chromed {len(changed)} file(s):")
        for c in changed:
            print(f"  {c}")
    else:
        print("nothing to do: all grounds already transparent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
