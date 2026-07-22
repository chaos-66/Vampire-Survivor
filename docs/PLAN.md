# Plan

## Current Goal

Complete **CP-M3-01**: experience collection, leveling, and minimal upgrade choice. Implementation complete; independent audit and interactive browser acceptance still open.

## M0 / M1 / M2 (history)

| ID | Status |
|---|---|
| CP-M0-01 | Green at `574d0ca` |
| CP-M1-01 | **Green** — `563f7ee`; audit `976dfc6` |
| CP-M2-01 | **Green** — `6c5afab`; Chinese `0f1bb50`; audit close `5ce3915` |

## M3 Checkpoint

| ID | Deliverable | Verification | Pass condition | Status |
|---|---|---|---|---|
| CP-M3-01 | Experience, leveling, minimal upgrade choice | Vitest; tsc; build; audit; browser or UNVERIFIED | Gems, pickup, freeze upgrade UI, three fixed upgrades, overflow chain; M1/M2 preserved | Implementation complete; automated green; browser UNVERIFIED; independent audit pending |

### Must delivered

- Gems on kill; pickup; level/XP/threshold; pending freeze; 迅捷/急速/强击; keys+click; Chinese HUD.

### Non-goals

No M4 timer/win/loss/restart, Boss, random pool, i18n framework, ECS.

## Later Work

| Milestone | Status |
|---|---|
| M2 | Complete / Green |
| M3 | Implementation done; audit pending |
| M4 | **Not started** |
