#!/usr/bin/env python3
"""Replace symlinked agent skills with real directory copies.

Why this exists
---------------
`npx skills add <repo>` writes each skill to `.agents/skills/<name>` and then
**symlinks** it into `.claude/skills/<name>`. Any symlink under the project root
crashes the Remotion bundler's webpack file hasher:

    TypeError: Cannot read properties of undefined (reading 'length')
        at WasmHash._updateWithBuffer (webpack/lib/util/hash/wasm-hash.js:151)
        at ... FileSystemInfo.js:3993

It takes down every composition in the project, not just new code -- and it is
easy to misread as a bug in whatever you were editing at the time. It has
happened twice here: once installing `Remocn/remocn`, once installing
`remotion-dev/skills`.

Copying the directory works; only the symlink is fatal. So after any
`npx skills add`, run:

    python refs/desymlink-skills.py           # convert symlinks to real copies
    python refs/desymlink-skills.py --check   # exit 1 if any symlink remains

`--check` scans the whole project root, not just `.claude/skills`, because any
symlink anywhere under it triggers the same crash.
"""

from __future__ import annotations

import os
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILLS = ROOT / ".claude" / "skills"
SKIP_DIRS = {"node_modules", ".git", "out"}


def is_link(path: pathlib.Path) -> bool:
    """True for a POSIX symlink OR an NTFS junction.

    On Windows `npx skills add` creates **junctions**, not symlinks, and
    `Path.is_symlink()` returns False for a junction -- so a naive symlink scan
    reports a clean tree while the bundler is still crashing. Both kinds are
    reparse points and both break webpack's hasher, so both count here.
    """
    if path.is_symlink():
        return True
    isjunction = getattr(os.path, "isjunction", None)  # Python 3.12+
    if isjunction is not None:
        try:
            return bool(isjunction(path))
        except OSError:
            return False
    return False


def link_target(path: pathlib.Path) -> str:
    try:
        return str(path.readlink())
    except OSError:
        return str(path.resolve())


def all_links() -> list[pathlib.Path]:
    found = []
    for path in ROOT.rglob("*"):
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        if is_link(path):
            found.append(path)
    return found


def main() -> int:
    if "--check" in sys.argv:
        links = all_links()
        if links:
            print("links found under project root (these break the bundler):")
            for p in links:
                print(f"  {p.relative_to(ROOT)} -> {link_target(p)}")
            return 1
        print("clean: no symlinks or junctions under project root")
        return 0

    if not SKILLS.is_dir():
        print(f"no skills directory at {SKILLS}")
        return 0

    converted, broken = [], []
    for entry in sorted(SKILLS.iterdir()):
        if not is_link(entry):
            continue
        target = entry.resolve()
        if not target.is_dir():
            broken.append(entry.name)
            continue
        # A junction is removed with rmdir, a file symlink with unlink; try both
        # so this works for either kind of reparse point.
        try:
            entry.unlink()
        except (OSError, PermissionError):
            os.rmdir(entry)
        shutil.copytree(target, entry)
        converted.append(entry.name)

    if converted:
        print(f"converted {len(converted)} link(s) to real directories:")
        for c in converted:
            print(f"  {c}")
    else:
        print("nothing to do: no symlinked or junctioned skills")

    if broken:
        print("\nWARNING -- links whose target is missing, removed nothing:")
        for b in broken:
            print(f"  {b}")

    leftover = all_links()
    if leftover:
        print("\nWARNING -- links still present elsewhere under the root:")
        for p in leftover:
            print(f"  {p.relative_to(ROOT)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
