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