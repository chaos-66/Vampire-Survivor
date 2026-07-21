# Handoff

## Current Truth

- Project root: `D:\agent\workspace\vampire_survivors`.
- M1 Green at `563f7ee` / audit close `976dfc6`.
- M2 checkpoint: `6c5afab` (`M2: implement enemy pressure and automatic combat`).
- Independent M2 audit **pending**.
- M3 **Not started**.
- `AI-Workflow-Library/` is an ignored local reference copy curated separately at the user's direction; outside project commits; do not modify during milestone work.

## Implemented (M2)

- Edge spawn with interval, cap, injected RNG.
- Normalized chase; contact damage + cooldown; player HP HUD.
- Auto nearest-target projectiles; hit once; expire/bounds clean.
- `defeatedCount`; no XP/drops/loss/restart.
- Pure `updateGame` order; main only DOM/RAF/draw.

## Verified

- `npm test` — 4 files / 63 tests (pre- and post-checkpoint).
- `npx tsc --noEmit` — exit 0.
- `npm run build` — success (10 modules).
- `npm audit` — 0 vulnerabilities.
- HTTP 200 M2 page copy.

## Not Yet Verified

- Full interactive browser combat checklist — **UNVERIFIED**.
- Independent M2 audit — **pending**.

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
