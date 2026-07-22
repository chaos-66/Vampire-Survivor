# Acceptance Criteria

## M0 / M1 / M2 — Green (history)

See `RUN_LOG.md`. M2 final audit PASS at `5ce3915`.

## M3 (CP-M3-01)

### Automated / pure logic

- [x] Non-lethal hit does not drop gem; kill drops one gem at death position.
- [x] One gem per enemy; no double drop same step; stable gem ids; fixed XP value.
- [x] Gem cap does not unbounded grow.
- [x] Pickup on overlap only; remove gem; XP once; multi-pickup same step.
- [x] Initial level 1, XP 0, threshold 3; thresholds 5 then 7.
- [x] Below threshold no pending; at/over threshold pending with overflow retained until choice.
- [x] Pending freezes move/spawn/chase/contact/attack/projectiles/pickup.
- [x] 迅捷 ×1.1 speed; 急速 ×0.9 cooldown with floor; 强击 +5 damage; stacks; invalid/non-pending no-op.
- [x] Apply: level+1, subtract threshold, keep overflow, update next threshold, clear pending; chain if still enough XP.
- [x] Closed loop: kill→gem→pickup→pending→choose→buff→resume.
- [x] Digit map + click hit-test helpers; CSS→logical coords.
- [x] M1/M2 regression; M3 status copy; no M4 outcome/restart.
- [x] `npm test` / tsc / build / audit recorded.

### Browser / manual

- [ ] All interactive progression checks — **UNVERIFIED** (implementer environment).

### Process

- [ ] M3 checkpoint commit — set after commit.
- [x] Independent M3 audit not claimed by implementer (pending).
- [x] M4 remains Not started.

## Milestone Audit Rule

Implementer evidence ≠ independent milestone audit.
