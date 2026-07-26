# Architecture

## CP-M4-OUTCOME-01

### Run outcome

- `GameState.outcome`: running | won | lost
- Pure: `resolveRunOutcome`, `clampDtToRunRemaining` in `src/core/run-outcome.ts`
- Priority: health <= 0 lost; else time >= 60 won; else running
- `updateGame`: if terminal return; clamp dt to remaining run time; sim; re-resolve; clear pending on terminal

### Restart

- Browser-only: KeyR or primary click on 重新开始
- KeyR restart requires no Ctrl/Meta/Alt/Shift modifier
- Always `createGameState(computeWorldBounds(currentViewport))` + clearInput + reset frame clock
- World may change size only on new run

### UI

- `drawOutcomeOverlay` screen-space above upgrade overlay
- Button rect pure helpers for hit-test
- Restart button rect is clamped fully inside the logical viewport
