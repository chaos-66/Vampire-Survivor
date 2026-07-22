# Architecture

## CP-M4-ARCH-01 (post round-2 repair)

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