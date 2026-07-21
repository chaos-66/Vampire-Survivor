# Status

## Snapshot

- Current stage: M2 implementation checkpoint complete; independent audit pending
- Current checkpoint: `CP-M2-01` (implementation done; not independently audited)
- Last updated: 2026-07-21
- Latest milestone checkpoint: pending create — `M2: implement enemy pressure and automatic combat`
- M1 remains **Green** (`563f7ee`; audit `976dfc6`)
- M3 status: **Not started**

## Recently Completed

- Defined CP-M2-01 Must/Non-goals and acceptance checklist.
- Implemented pure combat in `src/game.ts` + `src/collision.ts`.
- Enemies spawn from edges (injected RNG), chase, cap 20, interval 1s.
- Contact damage with 0.5s cooldown; player HP 0..100; no loss screen at 0.
- Auto-attack nearest enemy; projectiles; defeat count HUD.
- Vitest: 4 files, 63 tests (M1 regression retained).
- Automated: `npm test`, `npx tsc --noEmit`, `npm run build`, `npm audit` passed.

## Verified (implementer)

- Pure spawn/chase/attack/projectile/contact/kill loop tests.
- Typecheck, build, audit 0 vulnerabilities.

## Unverified

- Interactive browser combat acceptance — **UNVERIFIED** (no interactive browser session in this environment).
- Independent M2 milestone audit — **pending**.

## Risks

- Browser feel of spawn pressure, projectile aim, and contact cadence not human-verified here.
- Implementer self-check ≠ independent audit.

## Next Step

M2 independent audit + remaining browser acceptance. Do not start M3.
