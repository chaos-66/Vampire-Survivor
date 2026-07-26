# Plan

## Current Goal

**CP-M4-OUTCOME-01** at `dfbe925`. Independent audit and browser acceptance open. Not Green yet.

## History

| ID | Status |
|---|---|
| Prior M0-DIFFICULTY | Green |
| CP-M4-OUTCOME-01 | Checkpoint `dfbe925`; automated green; browser UNVERIFIED; independent audit pending |

## OUTCOME rules

- lost: health <= 0 (beats win same frame)
- won: elapsedActiveSeconds >= 60 with health > 0
- dt clamped so elapsed never overshoots 60 during sim
- terminal freezes all systems; clears pendingUpgrade
- restart only when terminal: R or button; full new run + world from current viewport

## Later

| Item | Status |
|---|---|
| Independent OUTCOME audit | Pending |
| M5+ content | **Not started** |