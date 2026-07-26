# Plan

## Current Goal

**CP-M4-OUTCOME-01** audit repair independently re-audited PASS. Repair
checkpoint and browser acceptance remain open. Not Green yet.

## History

| ID | Status |
|---|---|
| Prior M0-DIFFICULTY | Green |
| CP-M4-OUTCOME-01 | `dfbe925`; first audit FAIL; repair independently re-audited PASS at 203 tests; checkpoint/browser pending |

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
