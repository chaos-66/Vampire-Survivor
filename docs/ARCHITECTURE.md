# Architecture

## M1 Shape

```text
index.html
  -> src/main.ts
       -> DOM: canvas, keyboard, blur/visibility, requestAnimationFrame
       -> draws arena + player snapshot each frame
  -> src/input.ts   (pure: key set, direction combine/normalize)
  -> src/movement.ts (pure: delta clamp, step, bounds by radius)
  -> src/vec.ts     (pure: vector helpers)
  -> src/status.ts  (status copy)
  -> src/style.css  (responsive shell; CSS scale does not change sim units)
```

Logical arena size matches the canvas width/height attributes (960×540). CSS only scales the display. Simulation uses seconds for delta time.

## M0 History

M0 only drew a bootstrap screen via `main.ts` + `status.ts` with no gameplay modules.

## Intended Direction

Deterministic game state and update rules stay independent from Canvas drawing so rules can be unit tested. A single `requestAnimationFrame` loop gathers input, advances state using elapsed time, and renders the resulting snapshot. Module boundaries are introduced only when gameplay creates a concrete need.

## Constraints

- Canvas 2D is the renderer; DOM is limited to the shell and essential status.
- World measurements are logical units; rendering scales to the viewport.
- Simulation rules must not depend on frame rate.
- No engine, ECS, physics package, or global state library without an approved decision.
- Placeholder geometry is preferred until the core loop is accepted.
