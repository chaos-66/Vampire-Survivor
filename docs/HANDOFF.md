# Handoff

## Current Truth

- Project root: `D:\agent\workspace\vampire_survivors`.
- M2 Green (`6c5afab`; audit close `5ce3915`).
- M3 **CP-M3-01** implementation complete (checkpoint hash after commit); independent audit **pending**.
- M4 **Not started**.
- `AI-Workflow-Library/` is an ignored local reference copy; do not modify during milestone work.

## Implemented (M3)

- Gems on enemy death; pickup; level/XP/threshold.
- Pending upgrade freezes full combat sim.
- 迅捷 / 急速 / 强击; Digit1–3 + mouse; CSS→logical clicks.
- HUD 等级/经验; Chinese M3 status copy.
- Pure logic in `src/game.ts`; main wires input/draw.

## Verified

- `npm test` — 4 files / 91 tests.
- `npx tsc --noEmit` — exit 0.
- `npm run build` — success.
- `npm audit` — 0 vulnerabilities.

## Not Yet Verified

- Full interactive browser progression checklist — **UNVERIFIED**.
- Independent M3 audit — **pending**.

## Next Task

**One task:** M3 independent audit + browser acceptance. **Do not implement M4.**

## Read First

1. `AGENTS.md`
2. `docs/STATUS.md`
3. `docs/PLAN.md`
4. `docs/ACCEPTANCE_CRITERIA.md`
5. `docs/RUN_LOG.md`
6. `docs/ARCHITECTURE.md`
