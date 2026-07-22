# Handoff

## Current Truth

- Root: `D:\agent\workspace\vampire_survivors`
- CP-M4-ARCH-01 modularization implemented (hash after commit)
- M1–M3 gameplay behavior unchanged by design
- M4 gameplay **not started**; M5+ **not started**
- Independent architecture audit **pending**
- `AI-Workflow-Library/` ignored; do not modify during milestone work

## Modules

- `core/` game-state + game-loop
- `actors/` character registry + player system
- `weapons/` registry + system + default projectile content
- `combat/` enemies, projectiles, contact
- `progression/` XP, offers, upgrade apply, categories
- `ui/` hud, overlay, world draw, CSS→logical
- `content/` default character/weapon/upgrades
- `game.ts` facade re-exports for tests/main

## Verified

- `npm test` 104 tests
- tsc / build / audit

## Not Yet Verified

- Interactive browser regression
- Independent architecture audit

## Next Task

Architecture independent audit + browser regression. **No M4 gameplay / no new content.**