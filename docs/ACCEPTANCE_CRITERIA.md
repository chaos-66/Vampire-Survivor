# Acceptance Criteria

## M0-M3 history

See `RUN_LOG.md`. M3 implementation `3542f9b`.

## CP-M4-ARCH-01 Modularization (round-2)

### Structure

- [x] Modules and registries established (`ba8b276` + repairs).
- [x] Pending options bind keyboard/mouse.
- [x] Per-weapon instance cooldown only.
- [x] Registry bootstrap/reset lifecycle.
- [x] categoryId validated.
- [x] maxLevel null unlimited.
- [x] **duplicate behavior definitions rejected** (object identity).
- [x] **weapon acquire path works** (fixture).
- [x] **weapon level-up path works** (fixture).
- [x] **weapon maxLevel eligibility works** (fixture).
- [x] **no duplicate weapon instance** for same definitionId on growth.
- [x] **no core-loop content ID branch** for weapon growth.
- [x] Thin game.ts facade.

### Regression

- [x] Automated tests 115 pass (x2).
- [x] tsc / build / audit recorded.

### Browser

- [ ] Interactive regression — **UNVERIFIED**

### Process

- [x] Architecture checkpoint `ba8b276`
- [x] Round-1 repair `58c6620`
- [x] Independent re-audit after round-1: **FAIL**
- [ ] Independent re-audit after round-2: **pending**
- [x] M4 gameplay / M5+ not started