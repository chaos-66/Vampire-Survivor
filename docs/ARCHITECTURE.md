# Architecture

## CP-M4-ARCH-01 (post-repair)

```text
main.ts -> ui/* + core/game-loop + progression input helpers
game.ts -> thin re-exports only
core/   -> game-state, game-loop, constants
actors/ -> character registry + player system
weapons/-> definition, registry, system (instance cooldown sole source)
combat/ -> enemy, projectile, contact
progression/ -> offers from registry; pending.options is UI+input source
content/ -> default character/weapon/upgrades; bootstrap/reset
```

### Key rules

- `pendingUpgrade.options` is the only source for on-screen choices and input mapping.
- Each `WeaponInstance.cooldownRemaining` is independent; no global attack cooldown field.
- `maxLevel: number | null` — `null` means unlimited stacking.
- Progression register requires existing `categoryId`.
- `registerDefaultContent` is idempotent; tests use `resetAllContentRegistriesForTests`.

### Constraints

No ECS/event bus/UI framework. No dual upgrade/attack paths. No empty trait system.