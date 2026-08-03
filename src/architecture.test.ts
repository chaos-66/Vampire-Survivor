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
  createWeaponProgressionDefinition,
  createEnemy,
  registerEnemy,
  getEnemy,
  listEnemies,
  spawnEnemyOnEdge,
  ENEMY_MAX_HEALTH,
  ENEMY_RADIUS,
  ENEMY_SPEED,
  PROJECTILE_DAMAGE,
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
} from './game'
import { DEFAULT_CHARACTER_ID } from './content/characters/default-character'
import { DEFAULT_WEAPON_ID } from './content/weapons/default-projectile'
import { defaultProjectileWeapon } from './content/weapons/default-projectile'
import { swiftUpgrade } from './content/upgrades/swift'
import type { WeaponDefinition } from './weapons/weapon-definition'
import type { CharacterDefinition } from './actors/character-definition'
import type { EnemyDefinition } from './enemies/enemy-definition'
import {
  DEFAULT_ENEMY_ID,
  defaultEnemy,
} from './content/enemies/default-enemy'

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
  })

  it('same character object registers twice safely', () => {
    const c = getCharacter(DEFAULT_CHARACTER_ID)!
    registerCharacter(c)
    registerCharacter(c)
    expect(listCharacters().filter((x) => x.id === c.id)).toHaveLength(1)
  })

  it('different character object same id throws', () => {
    expect(() =>
      registerCharacter({
        id: DEFAULT_CHARACTER_ID,
        name: '另一角色',
        description: 'd',
        baseStats: { maxHealth: 1, moveSpeed: 1 },
        startingWeaponIds: [DEFAULT_WEAPON_ID],
      }),
    ).toThrow(/different definition object/i)
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
  })
})

describe('weapon registry identity', () => {
  it('same weapon definition object registers twice safely', () => {
    registerWeapon(defaultProjectileWeapon)
    registerWeapon(defaultProjectileWeapon)
    expect(listWeapons().filter((w) => w.id === DEFAULT_WEAPON_ID)).toHaveLength(
      1,
    )
  })

  it('same id different create throws and keeps original', () => {
    const original = getWeapon(DEFAULT_WEAPON_ID)!
    expect(() =>
      registerWeapon({
        id: DEFAULT_WEAPON_ID,
        name: original.name,
        description: original.description,
        maxLevel: original.maxLevel,
        create: () => ({
          definitionId: DEFAULT_WEAPON_ID,
          level: 99,
          cooldownRemaining: 0,
        }),
        update: original.update,
      }),
    ).toThrow(/different definition object/i)
    expect(getWeapon(DEFAULT_WEAPON_ID)).toBe(original)
    expect(getWeapon(DEFAULT_WEAPON_ID)!.create().level).not.toBe(99)
  })

  it('same id different update throws', () => {
    const original = getWeapon(DEFAULT_WEAPON_ID)!
    expect(() =>
      registerWeapon({
        id: DEFAULT_WEAPON_ID,
        name: original.name,
        description: original.description,
        maxLevel: original.maxLevel,
        create: original.create,
        update: () => undefined,
      }),
    ).toThrow(/different definition object/i)
  })

  it('bootstrap twice remains safe', () => {
    ensureContentRegistered()
    ensureContentRegistered()
    expect(listWeapons().filter((w) => w.id === DEFAULT_WEAPON_ID)).toHaveLength(
      1,
    )
  })
})

describe('enemy registry and factory', () => {
  it('registers the default enemy with the existing gameplay baseline', () => {
    const definition = getEnemy(DEFAULT_ENEMY_ID)
    expect(definition).toBe(defaultEnemy)
    expect(definition).toMatchObject({
      radius: ENEMY_RADIUS,
      speed: ENEMY_SPEED,
      maxHealth: ENEMY_MAX_HEALTH,
    })
  })

  it('registers the same enemy object twice safely', () => {
    registerEnemy(defaultEnemy)
    registerEnemy(defaultEnemy)
    expect(listEnemies().filter((enemy) => enemy.id === DEFAULT_ENEMY_ID)).toHaveLength(1)
  })

  it('rejects a different enemy object with the same id and keeps the original', () => {
    const replacement: EnemyDefinition = {
      ...defaultEnemy,
      speed: defaultEnemy.speed + 1,
    }
    expect(() => registerEnemy(replacement)).toThrow(/different definition object/i)
    expect(getEnemy(DEFAULT_ENEMY_ID)).toBe(defaultEnemy)
  })

  it('creates a test-only enemy definition without changing the game loop', () => {
    const fixture: EnemyDefinition = {
      id: 'fixture_enemy',
      name: '测试敌人',
      description: '仅用于工厂测试',
      radius: 9,
      speed: 123,
      maxHealth: 45,
    }
    registerEnemy(fixture)
    expect(createEnemy(fixture.id, 7, 11, 13)).toEqual({
      id: 7,
      definitionId: fixture.id,
      x: 11,
      y: 13,
      radius: 9,
      speed: 123,
      health: 45,
      maxHealth: 45,
    })
  })

  it('rejects an unregistered enemy definition id', () => {
    expect(() => createEnemy('missing_enemy', 1, 0, 0)).toThrow(
      /enemy not registered/i,
    )
  })

  it('real spawn path uses the default definition and consecutive runtime ids', () => {
    const state = createGameState(arena, createSequenceRng([0, 0.5, 1, 0.5]))
    const first = spawnEnemyOnEdge(state)
    const second = spawnEnemyOnEdge(state)
    expect(first.definitionId).toBe(DEFAULT_ENEMY_ID)
    expect(second.definitionId).toBe(DEFAULT_ENEMY_ID)
    expect([first.id, second.id]).toEqual([1, 2])
  })
})

describe('progression registry identity', () => {
  it('same progression object registers twice safely', () => {
    registerProgression(swiftUpgrade)
    registerProgression(swiftUpgrade)
    expect(listProgressions().filter((p) => p.id === 'swift')).toHaveLength(1)
  })

  it('same id different apply throws and keeps original effect', () => {
    const original = getProgression('swift')!
    const before = createGameState(arena).player.moveSpeed
    expect(() =>
      registerProgression({
        id: 'swift',
        categoryId: 'stat',
        name: original.name,
        description: original.description,
        maxLevel: original.maxLevel,
        isEligible: original.isEligible,
        apply: (ctx) => {
          ctx.player.moveSpeed = 1
        },
      }),
    ).toThrow(/different definition object/i)
    const state = createGameState(arena)
    state.experience = 3
    state.pendingUpgrade = {
      options: generateUpgradeOffers({
        player: state.player,
        progressionLevels: {},
      }),
    }
    applyUpgradeChoice(state, 'swift')
    expect(state.player.moveSpeed).toBeCloseTo(before * 1.1)
    expect(state.player.moveSpeed).not.toBe(1)
  })

  it('same id different isEligible throws', () => {
    const original = getProgression('swift')!
    expect(() =>
      registerProgression({
        id: 'swift',
        categoryId: 'stat',
        name: original.name,
        description: original.description,
        maxLevel: original.maxLevel,
        isEligible: () => false,
        apply: original.apply,
      }),
    ).toThrow(/different definition object/i)
  })
})

describe('multi-weapon cooldown', () => {
  it('two weapon instances update independently', () => {
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
    const fired = advanceWeapons(state.player, state.enemies, 1, 0.1)
    expect(state.player.weapons[0].cooldownRemaining).toBeCloseTo(0.1)
    expect(state.player.weapons[1].cooldownRemaining).toBe(1)
    expect(fired.projectiles.some((p) => p.damage === 22)).toBe(true)
  })
})

describe('weapon progression path', () => {
  const makeFixtureWeapon = (id: string, maxLevel: number): WeaponDefinition => ({
    id,
    name: id,
    description: 'fixture weapon',
    maxLevel,
    create: () => ({
      definitionId: id,
      level: 1,
      cooldownRemaining: 0,
    }),
    update: (ctx, instance) => {
      instance.cooldownRemaining = Math.max(
        0,
        instance.cooldownRemaining - ctx.dtSeconds,
      )
    },
  })

  it('acquires, levels up, respects maxLevel without core-loop branches', () => {
    const fixture = makeFixtureWeapon('fixture_growth_weapon', 2)
    registerWeapon(fixture)
    const progression = createWeaponProgressionDefinition(fixture.id, {
      id: 'prog_fixture_growth',
      name: '获得测试武器',
      description: 'fixture path',
    })
    registerProgression(progression)

    const state = createGameState(arena)
    expect(
      state.player.weapons.some((w) => w.definitionId === fixture.id),
    ).toBe(false)
    expect(
      progression.isEligible({
        player: state.player,
        progressionLevels: state.progressionLevels,
      }),
    ).toBe(true)

    // first acquire
    progression.apply({
      player: state.player,
      progressionLevels: state.progressionLevels,
    })
    const owned = state.player.weapons.filter(
      (w) => w.definitionId === fixture.id,
    )
    expect(owned).toHaveLength(1)
    expect(owned[0].level).toBe(1)

    // level up
    expect(
      progression.isEligible({
        player: state.player,
        progressionLevels: state.progressionLevels,
      }),
    ).toBe(true)
    progression.apply({
      player: state.player,
      progressionLevels: state.progressionLevels,
    })
    const owned2 = state.player.weapons.filter(
      (w) => w.definitionId === fixture.id,
    )
    expect(owned2).toHaveLength(1)
    expect(owned2[0].level).toBe(2)

    // maxed
    expect(
      progression.isEligible({
        player: state.player,
        progressionLevels: state.progressionLevels,
      }),
    ).toBe(false)
    progression.apply({
      player: state.player,
      progressionLevels: state.progressionLevels,
    })
    expect(
      state.player.weapons.find((w) => w.definitionId === fixture.id)?.level,
    ).toBe(2)

    // offers exclude when progressionLevels track selections OR isEligible false
    // offer generator uses maxLevel on progression + isEligible
    state.progressionLevels['prog_fixture_growth'] = 0
    const offersWhileOwnedMaxed = generateUpgradeOffers(
      {
        player: state.player,
        progressionLevels: state.progressionLevels,
      },
      20,
    )
    // still filtered by isEligible even if progressionLevels low
    expect(
      offersWhileOwnedMaxed.some((o) => o.id === 'prog_fixture_growth'),
    ).toBe(false)
  })

  it('weapon progression uses category weapon', () => {
    const fixture = makeFixtureWeapon('fixture_cat_weapon', 3)
    registerWeapon(fixture)
    const progression = createWeaponProgressionDefinition(fixture.id, {
      id: 'prog_cat',
      name: '武器成长',
      description: 'd',
    })
    expect(progression.categoryId).toBe('weapon')
  })

  it('cannot create progression for missing weapon', () => {
    expect(() =>
      createWeaponProgressionDefinition('no_such_weapon', {
        id: 'x',
        name: 'x',
        description: 'x',
      }),
    ).toThrow(/weapon not registered/i)
  })

  it('fixture cleaned after afterEach', () => {
    expect(getWeapon('fixture_growth_weapon')).toBeUndefined()
    expect(getProgression('prog_fixture_growth')).toBeUndefined()
  })
})

describe('pending input and offers', () => {
  it('digits bind pending display list', () => {
    const options = [
      { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
      { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
    ]
    expect(upgradeIdFromDigitCode('Digit1', options)).toBe('haste')
    expect(upgradeIdFromDigitCode('Digit3', options)).toBeNull()
  })

  it('clicks bind pending option ids', () => {
    const ids = ['power', 'swift']
    const rects = getUpgradeCardRects(arena, ids.length)
    const mid = (r: { x: number; y: number; width: number; height: number }) => ({
      x: r.x + r.width / 2,
      y: r.y + r.height / 2,
    })
    expect(upgradeIdAtPoint(arena, mid(rects[0]), ids)).toBe('power')
  })

  it('maxLevel null never filters; finite filters', () => {
    const state = createGameState(arena)
    state.progressionLevels = { swift: 1000 }
    const offers = generateUpgradeOffers({
      player: state.player,
      progressionLevels: state.progressionLevels,
    })
    expect(offers.some((o) => o.id === 'swift')).toBe(true)
  })

  it('power upgrade still works', () => {
    const state = createGameState(arena)
    state.experience = 3
    state.pendingUpgrade = {
      options: generateUpgradeOffers({
        player: state.player,
        progressionLevels: {},
      }),
    }
    applyUpgradeChoice(state, 'power')
    expect(state.player.projectileDamage).toBe(PROJECTILE_DAMAGE + 5)
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
    expect(listEnemies().filter((enemy) => enemy.id === DEFAULT_ENEMY_ID)).toHaveLength(1)
  })

  it('full reset then bootstrap restores defaults', () => {
    resetAllContentRegistriesForTests()
    expect(listProgressions()).toHaveLength(0)
    expect(listEnemies()).toHaveLength(0)
    ensureContentRegistered()
    expect(getCharacter(DEFAULT_CHARACTER_ID)).toBeDefined()
    expect(getWeapon(DEFAULT_WEAPON_ID)).toBeDefined()
    expect(getEnemy(DEFAULT_ENEMY_ID)).toBeDefined()
    expect(listProgressionCategories().map((c) => c.id)).toEqual(
      expect.arrayContaining(['stat', 'weapon', 'item']),
    )
  })

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
})
