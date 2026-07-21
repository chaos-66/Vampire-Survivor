# Acceptance Criteria

## M0

- [x] Scaffold, workflow, install, test, build, checkpoint `574d0ca` (see history).

## M1 (CP-M1-01) — Green

- [x] Movement, input, bounds, delta, blur; independent audit PASS (`976dfc6`); user browser 11/11 PASS.

## M2 (CP-M2-01) — Green

### Automated / pure logic

- [x] All CP-M2-01 automated items (spawn, chase, attack, projectiles, contact, kills, M1 regression) — evidence in `RUN_LOG.md`.

### Browser / manual (functional)

Evidence: **User-reported M2 browser acceptance: PASS on all 18 listed checks; browser/version not supplied.**

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

Evidence: **User-reported real-browser Chinese display acceptance: 5/5 PASS; browser/version not supplied.**

- [x] `lang=zh-CN`
- [x] Chinese title and H1 (`吸血鬼幸存者`)
- [x] Chinese Canvas aria-label (`游戏画布`)
- [x] Chinese status copy (`M2：移动、躲避敌人并自动攻击`)
- [x] HUD shows `生命` / `击败` / `敌人`
- [x] Real-browser Chinese display without garbled text
- [x] No truncation or obvious overlap
- [x] Gameplay still normal after localization

### Process

- [x] M2 checkpoint `6c5afab`
- [x] M2 status `6a6f981`
- [x] localization `0f1bb50`
- [x] localization status `ee60495`
- [x] independent code/automated audit PASS
- [x] user functional browser acceptance 18/18 PASS
- [x] user Chinese display acceptance 5/5 PASS
- [x] `CP-M2-01` final audit PASS
- [x] M2 may formally exit
- [x] M3 remains Not started

## Milestone Audit Rule

Implementer evidence ≠ independent milestone audit. M2 final independent audit is complete with result **PASS**.
