# Architecture

## M0 Shape

```text
index.html
  -> src/main.ts
       -> obtains the Canvas 2D context
       -> draws an M0-only bootstrap screen
  -> src/style.css
```

`src/main.test.ts` proves that the Vitest harness can import and execute TypeScript. No gameplay architecture exists in M0.

## Intended Direction

Future milestones should keep deterministic game state and update rules independent from Canvas drawing where this improves testability. A single `requestAnimationFrame` loop will gather input, advance state using elapsed time, and render the resulting snapshot. Module boundaries should be introduced only when gameplay code creates a concrete need.

## Constraints

- Canvas 2D is the renderer; DOM is limited to the shell and essential controls or status.
- World measurements are logical units and rendering scales to the viewport.
- Simulation rules should not depend on frame rate.
- No engine, ECS, physics package, or global state library without an approved decision.
- Placeholder geometry is preferred until the core loop is accepted.
