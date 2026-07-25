# Acceptance Criteria

## M0-M3 / ARCH — Green

Closeout `00166ee`.

## CP-M4-WORLD-01

### Automated

- [x] World size floor and 10x viewport rules
- [x] Player center spawn; world bounds; travel beyond one viewport
- [x] Camera center/clamp/viewport-larger-than-world safe
- [x] worldToScreen / screenToWorld
- [x] Viewport/DPR clamp helpers
- [x] Off-view enemy spawn inside world, not in view, and in a bounded view-edge band
- [x] Upgrade layout uses viewport size
- [x] M1-M3 + architecture regression retained (138 tests after repair)
- [x] npm test / tsc / build / audit recorded

### Browser

- [x] Interactive WORLD checklist — user-reported **PASS**; browser/version not supplied

### Process

- [x] WORLD checkpoint commit (`ba20893`)
- [x] WORLD spawn repair checkpoint (`008514e`)
- [x] Independent repair audit PASS
- [x] User browser acceptance PASS
- [x] Dynamic difficulty / win-loss / M5+ not started

## CP-M4-DIFFICULTY-01

### Automated

- [x] Active time starts at 0 and advances by simulation dt
- [x] Pending upgrade freezes active time and all difficulty-driven spawning
- [x] Pure tier boundaries are exact at 0s, 15s, 30s, and 45s
- [x] Spawn intervals are 1.00s, 0.80s, 0.65s, and 0.50s by tier
- [x] Enemy caps are 20, 24, 28, and 32 by tier
- [x] Spawn accumulator remains bounded when the active tier cap is reached
- [x] Enemy combat stats remain at baseline across tiers
- [x] View-edge spawn guarantees and M1-M3/WORLD regressions pass
- [x] `npm test`, `npx tsc --noEmit`, `npm run build`, and `npm audit` pass

### Browser

- [ ] Chinese HUD shows elapsed active time and current difficulty tier
- [ ] Pressure visibly increases across tiers without enemies appearing in view
- [ ] Upgrade selection freezes elapsed time and pressure progression
- [ ] Movement, combat, experience, upgrades, camera, resize, and DPR regressions pass
- [ ] No win/loss/restart UI or behavior appears

### Process

- [x] User approved minimum-risk order: difficulty before win/loss/restart
- [x] Implementation checkpoint (`60bd1dc`)
- [x] Independent audit PASS after two repair rounds
- [ ] User browser acceptance PASS
