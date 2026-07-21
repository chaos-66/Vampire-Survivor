# Acceptance Criteria

## M0

- [x] Scaffold, workflow, install, test, build, checkpoint `574d0ca` (see history).

## M1 (CP-M1-01) — Green

- [x] Movement, input, bounds, delta, blur; independent audit PASS (`976dfc6`); user browser 11/11 PASS.

## M2 (CP-M2-01)

### Automated / pure logic

- [x] All CP-M2-01 automated items (spawn, chase, attack, projectiles, contact, kills, M1 regression) — evidence in `RUN_LOG.md`.

### Browser / manual (functional)

Evidence: **User-reported M2 browser acceptance: PASS on all 18 listed checks; browser/version not supplied.** Acceptance performed before Chinese localization; gameplay behavior unchanged by localization.

- [x] Page/Canvas/console normal.
- [x] M1 movement regression.
- [x] Player bounds.
- [x] Enemy spawn / chase.
- [x] Auto-attack / nearest target visual.
- [x] Projectile hit, enemy HP, death, defeat count.
- [x] Contact damage + cooldown; HP floor.
- [x] Enemy cap; 60s sustained run.
- [x] Narrow layout; blur recovery.
- [x] M2 copy present; no M3/M4 features.
- [x] HP=0 continues without loss screen/buttons (user confirmed; M2 design).

### Chinese UI

- [x] Static source/HTML: `lang=zh-CN`, Chinese title/h1/aria/status, HUD labels `生命`/`击败`/`敌人` (implementer static check).
- [ ] Real-browser Chinese visual display — **pending user quick confirm**.

### Process

- [x] M2 checkpoint `6c5afab`.
- [x] Independent code/auto re-verify PASS (auditor; not implementer self-claim as full exit until final closeout).
- [x] User functional browser PASS recorded.
- [ ] Formal M2 final audit closeout after Chinese visual confirm.
- [x] M3 remains Not started.

## Milestone Audit Rule

Implementer evidence ≠ independent milestone audit. Functional audit evidence is recorded; final closeout follows Chinese UI user confirm.
