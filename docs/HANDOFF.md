# Handoff

## Current Truth

- Root: `D:\agent\workspace\vampire_survivors`
- CP-M4-OUTCOME-01 checkpoint: `dfbe925` (`M4: implement timed run outcomes and restart`)
- Latest committed HEAD: `0943397` (`M4: record run outcome repair status`)
- OUTCOME repair checkpoint: `a596253` (`M4: fix run outcome audit findings`)
- Rules: lost if HP<=0; won if elapsedActiveSeconds>=60; lost preferred; clamp dt to remaining run time
- Restart: only terminal + KeyR / 重新开始 button; full new GameState
- First independent audit **FAIL**; local repair complete at 203 tests
- Fresh independent re-audit **PASS**
- User-reported full OUTCOME browser acceptance: **PASS**
- CP-M4-OUTCOME-01: **Green**
- M5+ **not started**

## Modules

- `src/core/run-outcome.ts` resolve + clampDt + isRestartCode
- `src/ui/outcome-overlay.ts` Chinese overlay + button hit-test
- `src/core/game-loop.ts` terminal freeze + time clamp
- `src/main.ts` R/restart wiring

## Next Task

Define and run the final cross-checkpoint MVP audit/closeout. **No M5+.**
