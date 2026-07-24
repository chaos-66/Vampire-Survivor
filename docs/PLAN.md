# Plan

## Current Goal

**CP-M4-WORLD-01** repair checkpoint `008514e` independently audited PASS.
Browser acceptance remains open.

## History

| ID | Status |
|---|---|
| CP-M0-01 | Green |
| CP-M1-01 | Green |
| CP-M2-01 | Green |
| CP-M3-01 | Green `3542f9b` |
| CP-M4-ARCH-01 | Green (closeout `00166ee`) |
| CP-M4-WORLD-01 | `ba20893` audit found distant spawning; repair `008514e` independently audited PASS at 138 tests; browser UNVERIFIED |

## WORLD rules (delivered)

- Viewport = window CSS size; DPR capped at 2
- World = max(12000, vw*10) x max(7000, vh*10); fixed per run
- Camera follows player, clamped; screen helpers only for draw
- Off-view spawn in bounded bands around the current view; HUD/upgrade screen-space

## Later

| Item | Status |
|---|---|
| Dynamic difficulty | **Not started** |
| Win/loss/restart | **Not started** |
| M5+ content | **Not started** |
