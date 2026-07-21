# Handoff

## Current Truth

- Project root: `D:\agent\workspace\vampire_survivors`.
- M1 Green (`563f7ee` / audit `976dfc6`).
- M2 implementation: `6c5afab` (`M2: implement enemy pressure and automatic combat`).
- M2 prior status: `6a6f981` (`M2: record checkpoint status`).
- Chinese localization: `0f1bb50` (`M2: localize game UI in Chinese`).
- Localization status: `ee60495` (`M2: record localization status`).
- Independent M2 audit: **PASS**.
- User functional browser acceptance: **18/18 PASS**.
- User Chinese display acceptance: **5/5 PASS**.
- `CP-M2-01` **Green**; M2 **complete**.
- M3 **Not started**.
- No open M2 exit items; no M2 defects requiring Grok fixes.
- Browser name and version not supplied.
- `AI-Workflow-Library/` is an ignored local reference copy curated separately at the user's direction; outside project commits; do not modify during milestone work.

## User-visible Chinese (runtime)

- Title/H1: `吸血鬼幸存者`
- Status: `M2：移动、躲避敌人并自动攻击`
- Canvas aria: `游戏画布`
- HUD: `生命`, `击败`, `敌人`

## Verified

- Independent auditor: `npm test` 4/63, tsc exit 0, build 10 modules, audit 0 vulns; scope review PASS.
- User functional browser 18/18 PASS (includes HP=0 continues without loss UI).
- User Chinese real-browser 5/5 PASS.

## Not Yet Verified

- None for M2 exit.
- Browser name/version were not supplied.

## Next Task

**One task only:** architect refines M3 checkpoint, Must, Non-goals, and acceptance criteria; then wait for a new Grok M3 development prompt. **Grok must not begin M3 on its own.**

## Read First

1. `AGENTS.md`
2. `docs/STATUS.md`
3. `docs/PLAN.md`
4. `docs/ACCEPTANCE_CRITERIA.md`
5. `docs/RUN_LOG.md`
