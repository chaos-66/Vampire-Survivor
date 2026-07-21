# Acceptance Criteria

## M0

- [x] Scaffold, workflow, install, test, build, checkpoint `574d0ca` (see history).

## M1 (CP-M1-01) — Green

- [x] Movement, input, bounds, delta, blur; independent audit PASS (`976dfc6`); user browser 11/11 PASS.

## M2 (CP-M2-01)

### Automated / pure logic

- [x] Spawn waits until interval; fires when interval crossed.
- [x] Multi small dt vs one large dt spawn behavior tested (binary-friendly steps).
- [x] Spawn positions on arena edge; not overlapping center player under test.
- [x] Fixed RNG sequence yields repeatable spawn positions.
- [x] Enemy cap prevents further spawns.
- [x] Large dt does not create unbounded spawn burst beyond cap.
- [x] Enemies chase player; diagonal chase normalized; displacement ∝ dt.
- [x] Co-located enemy/player produces finite numbers.
- [x] No enemies → no projectile; before cooldown → no attack; at cooldown → projectile.
- [x] Nearest living enemy; equal distance broken by lower enemy id.
- [x] Projectile moves with velocity × dt; expires; cleans outside margin.
- [x] Hit deals once and removes projectile; no multi-enemy hit from one projectile.
- [x] Circle collision; enemy dies at ≤0 hp; defeatedCount +1 once; no XP/upgrade fields.
- [x] Contact damage on overlap; cooldown prevents per-frame drain; re-applies after cooldown.
- [x] Player hp clamped at 0; no loss/restart state.
- [x] M1 input/movement tests still pass.
- [x] Pure tests do not import `main.ts`.
- [x] Status copy reflects M2.
- [x] Game-state loop test: attack→hit→kill→count.
- [x] `npm test` / `npx tsc --noEmit` / `npm run build` / `npm audit` recorded.

### Browser / manual

- [ ] All interactive combat checks — **UNVERIFIED** (implementer environment).

### Process

- [x] M2 checkpoint commit with intended files only (`6c5afab`).
- [x] Independent M2 audit not claimed by implementer (pending).
- [x] M3 remains Not started.

## Milestone Audit Rule

Implementer evidence ≠ independent milestone audit.
