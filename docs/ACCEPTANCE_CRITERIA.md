# Acceptance Criteria

## M0–M3 history

See `RUN_LOG.md`. M3 implementation `3542f9b`.

## CP-M4-ARCH-01 Modularization

### Structure

- [x] Core game state / loop separated from content definitions.
- [x] Character definition + registry; default character matches M3 baseline.
- [x] Weapon definition + instance + registry; default projectile preserves auto-attack.
- [x] Progression categories stat/weapon/item registered; item category only.
- [x] 迅捷/急速/强击 registered; offer generator not hard-coded by name.
- [x] maxLevel filtering works (fixture).
- [x] Combat systems split; update order preserved.
- [x] UI extracted; UI does not mutate sim state.
- [x] No dual paths; no empty future modules; no ECS/event bus.
- [x] Chinese comments on core modules.

### Regression

- [x] Prior M1/M2/M3 automated tests pass (104 total with architecture tests).
- [x] Pending upgrade freezes sim.
- [x] Architecture boundary tests pass.
- [x] npm test / tsc / build / audit recorded.

### Browser

- [ ] Interactive regression — **UNVERIFIED**

### Process

- [ ] Architecture checkpoint commit — after commit
- [x] Independent architecture audit pending
- [x] M4 gameplay / M5+ not started