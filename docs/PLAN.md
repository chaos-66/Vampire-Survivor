# Plan

## Current Goal

**CP-M4-DIFFICULTY-01 checkpoint `60bd1dc` independently audited PASS.**
Browser acceptance remains open.

## History

| ID | Status |
|---|---|
| CP-M0-01 | Green |
| CP-M1-01 | Green |
| CP-M2-01 | Green |
| CP-M3-01 | Green `3542f9b` |
| CP-M4-ARCH-01 | Green (closeout `00166ee`) |
| CP-M4-WORLD-01 | Green: implementation `ba20893`; spawn repair `008514e`; independent repair audit PASS; user browser acceptance PASS |
| CP-M4-DIFFICULTY-01 | Checkpoint `60bd1dc`; final independent audit PASS after two repair rounds; 169 tests; browser pending |

## WORLD rules (delivered)

- Viewport = window CSS size; DPR capped at 2
- World = max(12000, vw*10) x max(7000, vh*10); fixed per run
- Camera follows player, clamped; screen helpers only for draw
- Off-view spawn in bounded bands around the current view; HUD/upgrade screen-space

## CP-M4-DIFFICULTY-01

- Add `elapsedActiveSeconds` to run state; it advances only while simulation runs
- Use a pure four-tier difficulty profile at 0s, 15s, 30s, and 45s
- Spawn intervals: 1.00s, 0.80s, 0.65s, 0.50s
- Enemy caps: 20, 24, 28, 32
- Show elapsed time and current difficulty tier in the Chinese HUD
- Preserve view-edge spawning and all M1-M3/WORLD behavior
- Do not scale enemy health, speed, contact damage, or rewards
- Do not implement win/loss, restart, new enemies, weapons, items, or map content

## Sequence

| Item | Status |
|---|---|
| Dynamic difficulty | **Implemented; audit/browser pending** |
| Win/loss/restart | **Next after difficulty is Green** |
| M5+ content | **Not started** |
