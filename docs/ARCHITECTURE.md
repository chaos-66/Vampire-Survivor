# Architecture

## CP-M4-ARCH-01 — Green (final)

Accepted modular shape after independent architecture audit PASS at repair `a2b3eb7` / status `e1b2ea2`.

### Layout

```text
main.ts -> ui/* + core/game-loop + progression input helpers
game.ts -> thin re-exports only
core/   -> game-state, game-loop, constants
actors/ -> character registry + player system
weapons/-> definition, registry, system, weapon-progression helper
combat/ -> enemy, projectile, contact
progression/ -> offers from registry; pending.options is UI+input source
content/ -> default character/weapon/upgrades; bootstrap/reset
```

### Registries

- Character / Weapon / Progression: **object-identity** duplicate policy
  - same definition object -> idempotent
  - same id, different object -> throw
- ProgressionCategory: **value equality** (immutable data fields)

### Weapon growth

`createWeaponProgressionDefinition(weaponDefinitionId, meta)` builds a `categoryId: 'weapon'` progression:

1. Not owned -> `create()` instance, force `level=1`, push to `player.weapons`
2. Owned and `level < maxLevel` -> `level += 1`
3. Owned and `level >= maxLevel` -> not eligible

Default M3 offers remain swift/haste/power only (no default weapon progression in offer list).

### Other rules

- `pendingUpgrade.options` sole input source
- Per-instance weapon cooldown
- `maxLevel: number | null` on progression
- Thin `game.ts` re-exports; test helpers in `game-facade-helpers.ts` only
- No ECS, event bus, dual legacy paths, or empty trait system