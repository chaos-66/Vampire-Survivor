# Architecture

## M3 Shape

```text
index.html
  -> src/main.ts
       -> DOM, keyboard, mouse click (CSS→logical), blur/visibility, RAF
       -> updateGame / applyUpgradeChoice
       -> draw world + upgrade overlay
  -> src/game.ts      (pure: combat + gems + level + pending upgrade + apply)
  -> src/collision.ts
  -> src/input.ts
  -> src/movement.ts
  -> src/vec.ts
  -> src/status.ts
  -> src/style.css
```

Logical arena: 960×540. Simulation uses seconds.

### Update order (`updateGame`)

When `pendingUpgrade` is set: **no simulation advance**.

Otherwise:

1. Move player (buffed `moveSpeed`)
2. Spawn enemies
3. Chase
4. Contact damage
5. Auto-attack (buffed cooldown/damage)
6. Projectiles (kills drop gems)
7. Pickup gems → maybe enter `pendingUpgrade`

### Progression

- Gems: fixed value 1, cap 100, drop on kill at death position.
- Threshold: `3 + (level - 1) * 2`; XP is within-level.
- Upgrades: fixed 迅捷 / 急速 / 强击; apply then level+1; overflow may re-pending.

## M2 History

Combat loop without XP/upgrades.

## Constraints

- No engine/ECS/physics/UI framework.
- No M4 win/loss/restart.
- Placeholder geometry; Chinese user-visible copy.
