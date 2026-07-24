# Plan

## Current Goal

**CP-M4-WORLD-01 Green.** Automated verification, independent repair audit,
and user-reported browser acceptance all pass. Stop before later M4 gameplay.

## History

| ID | Status |
|---|---|
| CP-M0-01 | Green |
| CP-M1-01 | Green |
| CP-M2-01 | Green |
| CP-M3-01 | Green `3542f9b` |
| CP-M4-ARCH-01 | Green (closeout `00166ee`) |
| CP-M4-WORLD-01 | Green: implementation `ba20893`; spawn repair `008514e`; independent repair audit PASS; user browser acceptance PASS |

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
