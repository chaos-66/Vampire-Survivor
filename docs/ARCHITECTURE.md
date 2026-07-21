# Architecture

## M2 Shape

```text
index.html
  -> src/main.ts
       -> DOM, keyboard, blur/visibility, requestAnimationFrame
       -> updateGame(state, direction, dt)
       -> draw player / enemies / projectiles / HP / defeated
  -> src/game.ts      (pure: state, spawn, chase, contact, attack, projectiles)
  -> src/collision.ts (pure: circle overlap, distanceSq)
  -> src/input.ts     (pure: keys → direction)
  -> src/movement.ts  (pure: player step, bounds, delta clamp)
  -> src/vec.ts
  -> src/status.ts
  -> src/style.css
```

Logical arena: 960×540. CSS scales display only. Simulation uses seconds.

### Update order (`updateGame`)

1. Move player (M1 rules)
2. Spawn enemies (interval accumulator, cap, injected RNG)
3. Chase player (normalized direction × speed × dt)
4. Contact damage (time cooldown)
5. Auto-attack (time cooldown, nearest enemy, at most one shot per step)
6. Projectiles (move, first-hit damage, expire/bounds, remove dead enemies)

## M1 History

Input + movement + RAF player-only loop.

## M0 History

Bootstrap screen only.

## Constraints

- Canvas 2D; no engine/ECS/physics/state library.
- Frame-rate independent combat and movement.
- Placeholder geometry.
- No M3 XP/upgrade or M4 win/loss systems in this layer.
