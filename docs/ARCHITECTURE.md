# Architecture

## CP-M4-WORLD-01

### Spaces

- World coordinates: simulation (`GameState.arena` = world bounds)
- Screen / viewport: CSS pixels, full window; HUD and upgrade UI
- Backing store: viewport * DPR (capped at 2); setTransform(dpr)

### Modules

```text
src/world/
  world.ts        computeWorldBounds
  viewport.ts     createViewport, backing store
  camera.ts       computeCamera
  coordinates.ts  worldToScreen / screenToWorld
  frame-context.ts FrameContext for pure update
```

### Update

updateGame(state, direction, dt, { camera, viewport })
Spawns use view rect outside camera; no DOM in core.

### Draw

World entities: worldToScreen(camera). HUD/upgrade: screen space. Visible-only grid.

## CP-M4-DIFFICULTY-01 (approved)

- `GameState.elapsedActiveSeconds` is run-local simulation time
- `pendingUpgrade` returns before the clock advances, so upgrades freeze difficulty
- Frozen pure difficulty profiles map elapsed time to tier, interval, and cap
- Cross-tier frames split at exact boundaries before advancing spawn accumulation
- `advanceSpawns` receives the active profile instead of reading tier rules or DOM
- Only frozen registered profiles are accepted; custom or null profiles fall
  back to the baseline profile
- Enemy definitions and existing enemy instances retain baseline combat stats
- HUD reads elapsed time/profile for Chinese evidence; it does not drive simulation
