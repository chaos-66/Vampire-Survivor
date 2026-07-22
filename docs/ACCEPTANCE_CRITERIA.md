# Acceptance Criteria

## M0-M3 history

See `RUN_LOG.md`. M3 implementation `3542f9b`.

## CP-M4-ARCH-01 Modularization

### Structure (post architecture-repair)

- [x] Core game state / loop separated from content definitions.
- [x] Character definition + registry; default character matches M3 baseline.
- [x] Weapon definition + instance + registry; default projectile preserves auto-attack.
- [x] Progression categories stat/weapon/item registered; item category only.
- [x] 迅捷/急速/强击 registered; offer generator not hard-coded by name.
- [x] maxLevel filtering works (`null` = unlimited; finite filter).
- [x] Upgrade keyboard/mouse bind **current pending options only**.
- [x] Each weapon instance owns its cooldown only (no global attackCooldownRemaining).
- [x] Registry bootstrap/reset lifecycle consistent and tested.
- [x] categoryId validated on progression register.
- [x] No unused traitIds fake extension; no dual upgrade/attack paths.
- [x] Combat systems split; update order preserved.
- [x] UI extracted; UI does not mutate sim state.
- [x] `game.ts` thin re-export facade.
- [x] Chinese comments on core modules.

### Regression

- [x] M1/M2/M3 automated tests pass (115 tests after repair).
- [x] Pending upgrade freezes sim.
- [x] Architecture boundary + audit-repair tests pass.
- [x] npm test (twice) / tsc / build / audit recorded.

### Browser

- [ ] Interactive regression — **UNVERIFIED**

### Process

- [x] Architecture checkpoint `ba8b276` exists.
- [x] Architecture status `bb9ad82` exists.
- [x] Independent architecture audit: **FAIL** (extensibility defects); repair commit pending/recorded.
- [x] Independent architecture re-audit: **pending** (implementer does not self-PASS).
- [x] M4 gameplay / M5+ not started.