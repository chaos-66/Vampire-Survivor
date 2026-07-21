# Handoff

## Current Truth

- Project root: `D:\agent\workspace\vampire_survivors`.
- M1 Green at `563f7ee` / audit close `976dfc6`.
- M2 **CP-M2-01** implementation complete (checkpoint hash recorded after commit); independent audit **pending**.
- M3 **Not started**.
- `AI-Workflow-Library/` is an ignored local reference copy curated separately at the user's direction; outside project commits; do not modify during milestone work.

## Implemented (M2)

- Edge spawn with interval, cap, injected RNG.
- Normalized chase; contact damage + cooldown; player HP HUD.
- Auto nearest-target projectiles; hit once; expire/bounds clean.
- `defeatedCount`; no XP/drops/loss/restart.
- Pure `updateGame` order; main only DOM/RAF/draw.

## Verified

- `npm test` — 4 files / 63 tests passed.
- `npx tsc --noEmit` — exit 0.
- `npm run build` — success.
- `npm audit` — 0 vulnerabilities.

## Not Yet Verified

- Full interactive browser combat checklist — **UNVERIFIED**.
- Independent M2 audit — **pending**.

## Recent Files

- `src/game.ts`, `src/game.test.ts`, `src/collision.ts`
- `src/main.ts`, `src/status.ts`, `src/main.test.ts`, `index.html`
- `docs/PLAN.md`, `docs/STATUS.md`, `docs/ACCEPTANCE_CRITERIA.md`, `docs/RUN_LOG.md`, `docs/HANDOFF.md`, `docs/ARCHITECTURE.md`, `README.md`

## Risks

- Do not treat build success as browser combat acceptance.
- Do not start M3 without independent M2 audit PASS and new prompt.

## Next Task

**One task:** M2 independent audit + browser acceptance. **Do not implement M3.**

## Read First

1. `AGENTS.md`
2. `docs/PROJECT_BRIEF.md`
3. `docs/STATUS.md`
4. `docs/PLAN.md`
5. `docs/ACCEPTANCE_CRITERIA.md`
6. `docs/RUN_LOG.md`
7. `docs/ARCHITECTURE.md`
