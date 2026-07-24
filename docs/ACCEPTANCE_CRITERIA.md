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

- [ ] Interactive WORLD checklist — **UNVERIFIED**

### Process

- [x] WORLD checkpoint commit (`ba20893`)
- [x] Independent repair audit PASS
- [x] Dynamic difficulty / win-loss / M5+ not started
