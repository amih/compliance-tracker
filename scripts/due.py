#!/usr/bin/env python3
"""Scan the checklists for recurring tasks and report what's overdue or due soon.

A recurring task line looks like:
    - ⟳ **Review user access rights** — _every quarter_ — last: `2026-07-01` · next: **`2026-10-01`** · by: `@ami`

Usage:
    python3 scripts/due.py [--soon DAYS]   # DAYS default 30
Exit code is 1 if anything is overdue (handy for cron/CI).
"""
import re
import sys
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOON = 30
if "--soon" in sys.argv:
    SOON = int(sys.argv[sys.argv.index("--soon") + 1])

NEXT_RE = re.compile(r"next:\s*\*{0,2}`([^`]+)`")
NAME_RE = re.compile(r"\*\*(.+?)\*\*")
today = datetime.date.today()

overdue, soon, unscheduled = [], [], []
open_once = done_once = 0

for md in sorted(ROOT.glob("checklists/*.md")):
    for line in md.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if s.startswith("- [ ]"):
            open_once += 1
        elif s.startswith("- [x]") or s.startswith("- [X]"):
            done_once += 1
        m = NEXT_RE.search(line)
        if not m:
            continue
        val = m.group(1).strip()
        nm = NAME_RE.search(line)
        name = nm.group(1) if nm else s[:60]
        label = f"{md.stem}: {name}"
        try:
            due = datetime.date.fromisoformat(val)
        except ValueError:
            unscheduled.append(label)   # placeholder like ____
            continue
        delta = (due - today).days
        if delta < 0:
            overdue.append((due, f"{label}  (due {val}, {-delta}d ago)"))
        elif delta <= SOON:
            soon.append((due, f"{label}  (due {val}, in {delta}d)"))

def dump(title, rows):
    print(f"\n{title} ({len(rows)})")
    for _, txt in sorted(rows):
        print(f"  - {txt}")

print(f"Compliance status @ {today}")
print(f"One-time tasks: {done_once} done / {open_once} open")
dump("OVERDUE", overdue)
dump(f"DUE within {SOON}d", soon)
if unscheduled:
    print(f"\nRecurring but not yet scheduled ({len(unscheduled)}) — set a `next:` date:")
    for u in unscheduled:
        print(f"  - {u}")

sys.exit(1 if overdue else 0)
