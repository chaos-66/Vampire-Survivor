# Plan

## Current Goal

Complete **CP-M2-01**: deterministic enemy pressure and automatic combat loop. Implementation complete; independent audit and interactive browser acceptance still open.

## M0 Checkpoint (history)

| ID | Status |
|---|---|
| CP-M0-01 | Green at `574d0ca` |

## M1 Checkpoint (history)

| ID | Status |
|---|---|
| CP-M1-01 | **Green** — `563f7ee`; audit close `976dfc6` |

## M2 Checkpoint

| ID | Deliverable | Verification | Pass condition | Status |
|---|---|---|---|---|
| CP-M2-01 | Deterministic enemy pressure and automatic combat | Vitest; tsc; build; audit; browser or UNVERIFIED | Spawn, chase, contact cooldown damage, auto projectiles, kills + count; M1 preserved | Implementation complete; automated green; browser UNVERIFIED; independent audit pending |

### Must delivered

- Enemies with id/pos/radius/speed/hp; edge spawn; inject RNG; cap 20.
- Normalized chase; contact damage + cooldown; HP HUD; no M4 loss at 0.
- Auto nearest-target projectiles; defeat count; pure `updateGame`.

### Non-goals (not implemented)

No XP, levels, upgrades, multi-weapon, Boss, win/loss/restart, timer, audio, ECS, M3 scaffolding.

## Later Work

| Milestone | Status |
|---|---|
| M1 | Complete / Green |
| M2 | Implementation done; audit pending |
| M3 | **Not started** |
| M4 | Not started |
