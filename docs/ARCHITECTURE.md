# Architecture

## CP-M4-ARCH-01 Shape (current)

```text
index.html
  -> src/main.ts          DOM / RAF / events only
  -> src/ui/              hud, upgrade-overlay, draw-world, canvas-coordinates
  -> src/game.ts          兼容门面（re-export）
  -> src/core/            game-state, game-loop, constants
  -> src/actors/          character definition/registry, player types/system
  -> src/weapons/         weapon definition/registry/system
  -> src/combat/          enemy, projectile, contact damage
  -> src/progression/     experience, categories, registry, offers, upgrade apply
  -> src/content/         default character/weapon + 迅捷/急速/强击
  -> src/input.ts, movement.ts, vec.ts, collision.ts, status.ts
```

逻辑世界 960×540；CSS 仅缩放。

### Update order (`updateGame`)

`pendingUpgrade` 时：不推进模拟。

否则：move → spawn → chase → contact → weapons → projectiles(gems) → pickup。

### Registries

- CharacterRegistry + default_survivor
- WeaponRegistry + default_projectile
- ProgressionCategory: stat / weapon / item（item 仅分类）
- ProgressionRegistry: swift / haste / power（maxLevel 高上限，过滤真实生效）

### Constraints

无 ECS、事件总线、UI 框架、双轨旧系统。