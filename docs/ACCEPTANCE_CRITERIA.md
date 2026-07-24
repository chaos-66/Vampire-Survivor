# Acceptance Criteria

## M0 / M1 / M2 — Green (history)

See `RUN_LOG.md`. M2 final audit PASS at `5ce3915`.

## M3 (CP-M3-01) — Green

### Automated / pure logic

- [x] Experience gems on kill; pickup; thresholds; pending freeze; 迅捷/急速/强击; overflow chain; M1/M2 regression — evidence in `RUN_LOG.md` and Vitest.

### Browser / manual

Evidence: **User-reported M3 browser acceptance: PASS; browser/version not supplied.**

- [x] Full M3 interactive progression checklist as reported by user (gems, freeze UI, keys/click, upgrades, Chinese HUD, no M4 win/loss).

### Process

- [x] M3 checkpoint `3542f9b`
- [x] M3 status `1fbbaa6`
- [x] Independent M3 audit **PASS**
- [x] User M3 browser acceptance **PASS**
- [x] M3 may formally exit

## CP-M4-ARCH-01 Modularization — Green

### Structure

- [x] Modules and registries (`ba8b276` + repairs).
- [x] Pending options bind keyboard/mouse.
- [x] Per-weapon instance cooldown only.
- [x] Registry bootstrap/reset lifecycle.
- [x] categoryId validated.
- [x] maxLevel null unlimited.
- [x] Duplicate behavior definitions rejected (object identity).
- [x] Weapon acquire / level-up / maxLevel eligibility (fixture).
- [x] No duplicate weapon instance for same definitionId on growth.
- [x] No core-loop content ID branch for weapon growth.
- [x] Thin `game.ts` facade.

### Regression / audit

- [x] Automated tests 115 pass (x2 independent auditor).
- [x] tsc / build recorded.
- [x] npm audit final 0 vulnerabilities (see RUN_LOG for transient HTTP 400).
- [x] Final independent architecture audit **PASS** (after `a2b3eb7`).

### Browser

Evidence: **User-reported modularized M1-M3 browser regression: 30/30 PASS; browser/version not supplied.**

- [x] Modularized M1–M3 interactive regression (30 items).

### Process

- [x] Architecture checkpoint `ba8b276` / status `bb9ad82`
- [x] Round-1 repair `58c6620` / `952f392`
- [x] Round-2 repair `a2b3eb7` / `e1b2ea2`
- [x] Independent re-audit after round-1: **FAIL** (historical)
- [x] Independent final architecture audit after round-2: **PASS**
- [x] CP-M4-ARCH-01 may formally exit
- [x] M4 gameplay / M5+ not started

## Milestone Audit Rule

Implementer evidence ≠ independent milestone audit. M3 and CP-M4-ARCH-01 independent audits are complete with result **PASS**.