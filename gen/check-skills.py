"""Preflight: is the `refina-reel` skill actually loadable, and is its router whole?

    python gen/check-skills.py

Exit 1 if the skill cannot be loaded from outside this directory, or if the
router points at a file that does not exist.

WHY THIS EXISTS
---------------
The skill and its eight sub-references were written, and then never activated
once. Across every session in this account the `Skill` tool was invoked six
times and not one of them was `refina-reel`. In the session that built
`RefinaFlip`, none of the eight `REFERENCE.md` files was opened by any tool.

It was not forgetfulness. Skills load from the current working directory's
`.claude/skills`, from `~/.claude/skills`, or from an installed plugin. This
skill lives in the repo, every session ran from the home directory, and
`~/.claude/skills` did not exist — so it was never in the skill list and could
not have been called. See rule GG.

The cost was concrete: `reel-review` holds rule P and was never opened, so rule
P never ran on RefinaFlip through five renders; `reel-compositions` is the beat
library and was never opened, so the reel was built from nine bespoke
compositions reusing nothing.

WHAT IT ASSERTS
---------------
  reachable from anywhere -- `~/.claude/skills/<name>` exists. Being inside the
                             repo is NOT enough, because sessions do not start
                             here. This is the whole failure.
  it is the same files    -- the link resolves to the repo copy, so there is one
                             source of truth and editing the skill in the repo
                             is what a session actually reads. A COPY would pass
                             a naive existence check and then silently go stale.
  the router is whole     -- every `REFERENCE.md` the router links to exists. A
                             router is the one file guaranteed to be read; a
                             dead route in it is a chapter that silently is not
                             there.

WHAT IT CANNOT ASSERT
---------------------
That the routes were FOLLOWED. Nothing here can see whether a session opened
`reel-build/REFERENCE.md` after reading the router — that is exactly the failure
rule GG describes, and it is invisible from inside the repo. This check makes
the skill loadable. It does not make it read.
"""
import argparse
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILL = "refina-reel"
REPO_SKILL = ROOT / ".claude" / "skills" / SKILL
USER_SKILLS = pathlib.Path.home() / ".claude" / "skills"


def resolved(p: pathlib.Path) -> pathlib.Path:
    """Resolve through a junction as well as a symlink.

    On Windows `npx skills add` and `mklink /J` both produce NTFS junctions,
    which `Path.is_symlink()` reports as False — the trap documented in
    docs/remocn-integration.md that `refs/desymlink-skills.py` exists for. So
    resolve() is the test, never is_symlink().
    """
    try:
        return p.resolve()
    except OSError:
        return p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args()

    fails = 0
    linked = USER_SKILLS / SKILL

    if not REPO_SKILL.is_dir():
        print(f"  FAIL  {REPO_SKILL.relative_to(ROOT)} is missing — the skill "
              f"itself is gone.")
        return 1

    if not linked.exists():
        print(f"  FAIL  {SKILL} is not on the skill path.")
        print(f"        It exists at .claude/skills/{SKILL}, but skills load "
              f"from the")
        print(f"        session's working directory — and sessions start in "
              f"{pathlib.Path.home()},")
        print(f"        not here. So it is invisible and cannot be invoked. "
              f"Rule GG.")
        print(f"\n        Fix (once, from any shell):")
        print(f"          cmd /c mklink /J \"{linked}\" \"{REPO_SKILL}\"")
        print(f"\n        Or start every session with:  cd {ROOT}")
        fails += 1
    else:
        tgt, src = resolved(linked), resolved(REPO_SKILL)
        if tgt != src:
            print(f"  FAIL  {linked} does not resolve to the repo copy.")
            print(f"        resolves to: {tgt}")
            print(f"        expected:    {src}")
            print(f"        A copy drifts: the skill you edit here stops being "
                  f"the one a session reads.")
            fails += 1
        elif not a.quiet:
            print(f"{SKILL}: on the skill path, resolves to the repo copy")

    # ---- the router's routes must exist --------------------------------
    router = REPO_SKILL / "SKILL.md"
    if not router.is_file():
        print(f"  FAIL  {SKILL} has no SKILL.md — nothing routes.")
        return 1

    text = router.read_text(encoding="utf-8")
    routes = re.findall(r"\]\(\./([A-Za-z0-9._/-]+\.md)\)", text)
    missing = [r for r in dict.fromkeys(routes) if not (REPO_SKILL / r).is_file()]
    if missing:
        for r in missing:
            print(f"  FAIL  router links to {r}, which does not exist.")
        fails += 1
    elif not a.quiet:
        print(f"  router: {len(set(routes))} routes, all present")

    if fails:
        return 1

    if not a.quiet:
        print("\n  Loadable is not the same as read. The router names the "
              "sub-reference")
        print("  for each stage; opening it is still a choice, and the one "
              "that was")
        print("  skipped on every stage of the last reel built here.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
