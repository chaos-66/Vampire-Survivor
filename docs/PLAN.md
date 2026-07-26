# Plan

## Current Goal

**CP-M4-OUTCOME-01** implementation complete; independent audit and browser acceptance open.

## History

| ID | Status |
|---|---|
| CP-M0..DIFFICULTY | Green (see prior) |
| CP-M4-OUTCOME-01 | Implementation done; audit pending |

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