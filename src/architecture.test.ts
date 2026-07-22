import { afterEach, describe, expect, it } from 'vitest'

import {
  applyUpgradeChoice,
  createGameState,
  createSequenceRng,
  updateGame,
  upgradeIdFromDigitCode,
  upgradeIdAtPoint,
  getUpgradeCardRects,
  generateUpgradeOffers,
  registerProgression,
  registerProgressionCategory,
  listProgressions,
  listProgressionCategories,
  getProgression,
  registerCharacter,
  getCharacter,
  listCharacters,
  registerWeapon,
  getWeapon,
  listWeapons,
  ensureContentRegistered,
  resetAllContentRegistriesForTests,
  advanceWeapons,
  PROJECTILE_DAMAGE,
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
} from './game'
import { DEFAULT_CHARACTER_ID } from './content/characters/default-character'
import { DEFAULT_WEAPON_ID } from './content/weapons/default-projectile'
import type { WeaponDefinition } from './weapons/weapon-definition'
import type { CharacterDefinition } from './actors/character-definition'

const arena = { width: 960, height: 540 }

afterEach(() => {
  resetAllContentRegistriesForTests()
  ensureContentRegistered()
})

describe('character registry', () => {
  it('registers default character with M3 baseline stats', () => {
    const character = getCharacter(DEFAULT_CHARACTER_ID)
    expect(character).toBeDefined()
    expect(character!.baseStats.maxHealth).toBe(PLAYER_MAX_HEALTH)
    expect(character!.baseStats.moveSpeed).toBe(PLAYER_SPEED)
    expect(character!.startingWeaponIds).toContain(DEFAULT_WEAPON_ID)
    expect(listCharacters().some((c) => c.id === DEFAULT_CHARACTER_ID)).toBe(
      true,
    )
  })

  it('createGameState uses default character; runtime separate from definition', () => {
    const state = createGameState(arena)
    expect(state.player.characterId).toBe(DEFAULT_CHARACTER_ID)
    expect(state.player.health).toBe(PLAYER_MAX_HEALTH)
    const definition = getCharacter(DEFAULT_CHARACTER_ID)!
    state.player.moveSpeed *= 1.1
    expect(definition.baseStats.moveSpeed).toBe(PLAYER_SPEED)
  })

  it('can register extra character without game loop change', () => {
    const extra: CharacterDefinition = {
      id: 'test_only_character',
      name: '测试角色',
      description: 'fixture',
      baseStats: { maxHealth: 50, moveSpeed: 100 },
      startingWeaponIds: [DEFAULT_WEAPON_ID],
    }
    registerCharacter(extra)
    const state = createGameState(
      arena,
      createSequenceRng([]),
      'test_only_character',
    )
    expect(state.player.maxHealth).toBe(50)
    expect(state.player.moveSpeed).toBe(100)
  })

  it('default character resolves default weapon', () => {
    const character = getCharacter(DEFAULT_CHARACTER_ID)!
    for (const id of character.startingWeaponIds) {
      expect(getWeapon(id)).toBeDefined()
    }
  })
})

describe('weapon registry and multi-instance cooldown', () => {
  it('registers default projectile weapon', () => {
    expect(getWeapon(DEFAULT_WEAPON_ID)).toBeDefined()
    expect(listWeapons().some((w) => w.id === DEFAULT_WEAPON_ID)).toBe(true)
  })

  it('default weapon fires via weapon system without DOM', () => {
    const state = createGameState(arena)
    state.enemies = [
      {
        id: 1,
        x: state.player.x + 40,
        y: state.player.y,
        radius: 14,
        speed: 0,
        health: 30,
        maxHealth: 30,
      },
    ]
    if (state.player.weapons[0]) {
      state.player.weapons[0].cooldownRemaining = 0
    }
    updateGame(state, { x: 0, y: 0 }, 0.02)
    expect(state.projectiles.length).toBeGreaterThanOrEqual(1)
  })

  it('two weapon instances update independently', () => {
    let aCalls = 0
    let bCalls = 0
    const weaponA: WeaponDefinition = {
      id: 'fixture_a',
      name: 'A',
      description: 'a',
      maxLevel: 3,
      create: () => ({
        definitionId: 'fixture_a',
        level: 1,
        cooldownRemaining: 0.2,
      }),
      update: (ctx, instance) => {
        aCalls += 1
        instance.cooldownRemaining = Math.max(
          0,
          instance.cooldownRemaining - ctx.dtSeconds,
        )
        if (instance.cooldownRemaining === 0) {
          ctx.spawnProjectile({
            x: 1,
            y: 1,
            vx: 1,
            vy: 0,
            radius: 1,
            damage: 11,
            lifeRemaining: 1,
          })
          instance.cooldownRemaining = 1
        }
      },
    }
    const weaponB: WeaponDefinition = {
      id: 'fixture_b',
      name: 'B',
      description: 'b',
      maxLevel: 2,
      create: () => ({
        definitionId: 'fixture_b',
        level: 1,
        cooldownRemaining: 0.05,
      }),
      update: (ctx, instance) => {
        bCalls += 1
        instance.cooldownRemaining = Math.max(
          0,
          instance.cooldownRemaining - ctx.dtSeconds,
        )
        if (instance.cooldownRemaining === 0) {
          ctx.spawnProjectile({
            x: 2,
            y: 2,
            vx: 1,
            vy: 0,
            radius: 1,
            damage: 22,
            lifeRemaining: 1,
          })
          instance.cooldownRemaining = 1
        }
      },
    }
    registerWeapon(weaponA)
    registerWeapon(weaponB)
    const state = createGameState(arena)
    state.player.weapons = [weaponA.create(), weaponB.create()]
    expect(state.player.weapons[0].cooldownRemaining).toBeCloseTo(0.2)
    expect(state.player.weapons[1].cooldownRemaining).toBeCloseTo(0.05)

    const fired = advanceWeapons(state.player, state.enemies, 1, 0.1)
    expect(aCalls).toBe(1)
    expect(bCalls).toBe(1)
    expect(state.player.weapons[0].cooldownRemaining).toBeCloseTo(0.1)
    expect(state.player.weapons[1].cooldownRemaining).toBe(1)
    expect(fired.projectiles.some((p) => p.damage === 22)).toBe(true)
    expect(fired.projectiles.some((p) => p.damage === 11)).toBe(false)

    const fired2 = advanceWeapons(
      state.player,
      state.enemies,
      fired.nextProjectileId,
      0.1,
    )
    expect(state.player.weapons[0].cooldownRemaining).toBe(1)
    expect(fired2.projectiles.some((p) => p.damage === 11)).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(state, 'attackCooldownRemaining')).toBe(
      false,
    )
  })

  it('power upgrade affects projectile damage used by weapons', () => {
    const state = createGameState(arena)
    state.experience = 3
    state.pendingUpgrade = {
      options: generateUpgradeOffers({
        player: state.player,
        progressionLevels: state.progressionLevels,
      }),
    }
    applyUpgradeChoice(state, 'power')
    expect(state.player.projectileDamage).toBe(PROJECTILE_DAMAGE + 5)
  })
})

describe('progression registry and offers', () => {
  it('registers stat/weapon/item categories', () => {
    const ids = listProgressionCategories().map((c) => c.id)
    expect(ids).toEqual(expect.arrayContaining(['stat', 'weapon', 'item']))
  })

  it('registers swift/haste/power with Chinese copy and order', () => {
    const defs = listProgressions()
    expect(defs.map((d) => d.id).slice(0, 3)).toEqual([
      'swift',
      'haste',
      'power',
    ])
    expect(getProgression('swift')?.name).toBe('迅捷')
    expect(getProgression('swift')?.maxLevel).toBeNull()
  })

  it('rejects progression with missing category', () => {
    expect(() =>
      registerProgression({
        id: 'bad_cat',
        categoryId: 'no_such_category',
        name: 'x',
        description: 'y',
        maxLevel: 1,
        isEligible: () => true,
        apply: () => undefined,
      }),
    ).toThrow(/category not registered/i)
  })

  it('rejects unexpected duplicate progression ids', () => {
    expect(() =>
      registerProgression({
        id: 'swift',
        categoryId: 'stat',
        name: '另一迅捷',
        description: '不同',
        maxLevel: 1,
        isEligible: () => true,
        apply: () => undefined,
      }),
    ).toThrow(/different data/i)
  })

  it('maxLevel null never filters; finite maxLevel filters', () => {
    const state = createGameState(arena)
    state.progressionLevels = { swift: 1000 }
    const offers = generateUpgradeOffers({
      player: state.player,
      progressionLevels: state.progressionLevels,
    })
    expect(offers.some((o) => o.id === 'swift')).toBe(true)

    registerProgression({
      id: 'fixture_cap',
      categoryId: 'stat',
      name: '封顶',
      description: 'max 1',
      maxLevel: 1,
      isEligible: () => true,
      apply: () => undefined,
    })
    const capped = generateUpgradeOffers(
      {
        player: state.player,
        progressionLevels: { fixture_cap: 1 },
      },
      10,
    )
    expect(capped.some((o) => o.id === 'fixture_cap')).toBe(false)
  })

  it('offers include categoryId from definition', () => {
    const state = createGameState(arena)
    const offers = generateUpgradeOffers({
      player: state.player,
      progressionLevels: {},
    })
    expect(offers[0].categoryId).toBe('stat')
  })
})

describe('pending options bind input', () => {
  it('digit 1 selects first visible option after swift maxed out of list', () => {
    // finite fixture first in registry would require re-register order;
    // instead craft pending display list directly
    const options = [
      { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
      { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
    ]
    expect(upgradeIdFromDigitCode('Digit1', options)).toBe('haste')
    expect(upgradeIdFromDigitCode('Digit2', options)).toBe('power')
    expect(upgradeIdFromDigitCode('Digit3', options)).toBeNull()
  })

  it('ineligible first definition does not affect pending-bound digits', () => {
    const options = [
      { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
      { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
    ]
    expect(upgradeIdFromDigitCode('Digit1', options)).toBe('power')
  })

  it('click maps to pending option ids not global registry', () => {
    const ids = ['power', 'swift']
    const rects = getUpgradeCardRects(arena, ids.length)
    const mid = (r: { x: number; y: number; width: number; height: number }) => ({
      x: r.x + r.width / 2,
      y: r.y + r.height / 2,
    })
    expect(upgradeIdAtPoint(arena, mid(rects[0]), ids)).toBe('power')
    expect(upgradeIdAtPoint(arena, mid(rects[1]), ids)).toBe('swift')
  })

  it('apply choice from pending closes UI and may re-open on overflow', () => {
    const state = createGameState(arena)
    state.experience = 3
    state.pendingUpgrade = {
      options: generateUpgradeOffers({
        player: state.player,
        progressionLevels: state.progressionLevels,
      }),
    }
    const first = state.pendingUpgrade.options[0].id
    applyUpgradeChoice(state, first)
    expect(state.level).toBe(2)
    // no overflow beyond next threshold with xp 0 after cost 3
    expect(state.pendingUpgrade).toBeNull()
  })

  it('when all finite options capped, offers empty so no freeze path', () => {
    resetAllContentRegistriesForTests()
    registerProgressionCategory({ id: 'stat', name: '属性', order: 1 })
    registerProgression({
      id: 'a',
      categoryId: 'stat',
      name: 'A',
      description: 'd',
      maxLevel: 1,
      isEligible: () => true,
      apply: () => undefined,
    })
    const offers = generateUpgradeOffers({
      player: {
        x: 0,
        y: 0,
        radius: 1,
        health: 1,
        maxHealth: 1,
        moveSpeed: 1,
        attackCooldown: 1,
        projectileDamage: 1,
        characterId: 'x',
        weapons: [],
      },
      progressionLevels: { a: 1 },
    })
    expect(offers).toHaveLength(0)
  })
})

describe('registry lifecycle', () => {
  it('bootstrap twice is idempotent', () => {
    ensureContentRegistered()
    ensureContentRegistered()
    expect(listProgressions().filter((p) => p.id === 'swift')).toHaveLength(1)
    expect(listCharacters().filter((c) => c.id === DEFAULT_CHARACTER_ID)).toHaveLength(
      1,
    )
  })

  it('full reset then bootstrap restores defaults', () => {
    resetAllContentRegistriesForTests()
    expect(listProgressions()).toHaveLength(0)
    ensureContentRegistered()
    expect(getCharacter(DEFAULT_CHARACTER_ID)).toBeDefined()
    expect(getWeapon(DEFAULT_WEAPON_ID)).toBeDefined()
    expect(listProgressionCategories().map((c) => c.id)).toEqual(
      expect.arrayContaining(['stat', 'weapon', 'item']),
    )
    expect(listProgressions().map((p) => p.id).slice(0, 3)).toEqual([
      'swift',
      'haste',
      'power',
    ])
  })

  it('fixture does not pollute next test after afterEach', () => {
    registerProgression({
      id: 'pollute',
      categoryId: 'stat',
      name: '污染',
      description: 'd',
      maxLevel: 1,
      isEligible: () => true,
      apply: () => undefined,
    })
    expect(getProgression('pollute')).toBeDefined()
  })

  it('previous fixture cleaned', () => {
    expect(getProgression('pollute')).toBeUndefined()
  })
})

describe('system boundaries', () => {
  it('pending freezes simulation', () => {
    const state = createGameState(arena)
    state.pendingUpgrade = {
      options: generateUpgradeOffers({
        player: state.player,
        progressionLevels: {},
      }),
    }
    const x = state.player.x
    updateGame(state, { x: 1, y: 0 }, 0.5)
    expect(state.player.x).toBe(x)
  })
})