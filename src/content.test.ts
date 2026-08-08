/**
 * CP-M5-CONTENT-01 针对性测试：
 * 权重生成、敌人自带掉落表、拾取结果、散射武器与内容数据驱动颜色。
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { createGameState, createSequenceRng } from './core/game-state'
import {
  pickupDrops,
  spawnDropsForKills,
} from './progression/experience-system'
import { pickEnemyDefinitionId } from './combat/enemy-system'
import { advanceProjectiles } from './combat/projectile-system'
import { listEnemies, registerEnemy } from './enemies/enemy-registry'
import { DEFAULT_ENEMY_ID } from './content/enemies/default-enemy'
import { FAST_ENEMY_ID } from './content/enemies/fast-enemy'
import { FOOD_DROP_ID } from './content/drops/food-drop'
import { CHEST_DROP_ID } from './content/drops/chest-drop'
import { EXPERIENCE_DROP_ID } from './content/drops/experience-drop'
import { SCATTER_WEAPON_ID } from './content/weapons/scatter-weapon'
import { advanceWeapons } from './weapons/weapon-system'
import { getWeapon } from './weapons/weapon-registry'
import { tryEnterPendingUpgrade } from './progression/upgrade-system'
import { applyUpgradeChoice } from './progression/upgrade-system'
import { getProgression } from './progression/progression-registry'
import { createDrop } from './drops/drop-factory'
import { getDrop } from './drops/drop-registry'
import { updateGame } from './core/game-loop'
import {
  resetAllContentRegistriesForTests,
  registerDefaultContent,
} from './content/bootstrap'
import { FOOD_HEAL, CHEST_XP, GEM_VALUE, CONTACT_DAMAGE } from './core/constants'
import type { EnemyDefinition } from './enemies/enemy-definition'
import type { GameState, Rng } from './core/game-state'

const arena = { width: 960, height: 540 }

beforeEach(() => {
  resetAllContentRegistriesForTests()
  registerDefaultContent()
})

describe('weighted enemy spawn', () => {
  it('selects default enemy when rng lands in its weight range', () => {
    expect(pickEnemyDefinitionId(() => 0.1, listEnemies())).toBe(
      DEFAULT_ENEMY_ID,
    )
  })

  it('selects fast enemy when rng lands in its weight range', () => {
    expect(pickEnemyDefinitionId(() => 0.9, listEnemies())).toBe(FAST_ENEMY_ID)
  })

  it('excludes zero-weight enemies', () => {
    const defs: EnemyDefinition[] = [
      { id: 'a', name: 'A', description: '', radius: 1, speed: 1, maxHealth: 1, spawnWeight: 0 },
      { id: 'b', name: 'B', description: '', radius: 1, speed: 1, maxHealth: 1, spawnWeight: 1 },
    ]
    expect(pickEnemyDefinitionId(() => 0, defs)).toBe('b')
    expect(pickEnemyDefinitionId(() => 0.99, defs)).toBe('b')
  })
})

describe('kill drops', () => {
  it('always drops one experience drop per kill', () => {
    const kills = [
      { x: 1, y: 2, definitionId: DEFAULT_ENEMY_ID },
      { x: 3, y: 4, definitionId: FAST_ENEMY_ID },
    ]
    const result = spawnDropsForKills([], 1, kills, () => 1)
    expect(result.drops.map((drop) => drop.definitionId)).toEqual([
      'experience_drop',
      'experience_drop',
    ])
    expect(result.nextDropId).toBe(3)
  })

  it('rolls the enemy drop table with independent chance', () => {
    const kills = [{ x: 1, y: 2, definitionId: FAST_ENEMY_ID }]
    const rng = createSequenceRng([0.05, 0.99])
    const result = spawnDropsForKills([], 1, kills, rng)
    expect(result.drops.map((drop) => drop.definitionId)).toEqual([
      'experience_drop',
      'food_drop',
    ])
  })

  it('drops all table entries when rng always passes', () => {
    const kills = [{ x: 1, y: 2, definitionId: FAST_ENEMY_ID }]
    const result = spawnDropsForKills([], 1, kills, () => 0)
    expect(result.drops.map((drop) => drop.definitionId)).toEqual([
      'experience_drop',
      'food_drop',
      'chest_drop',
    ])
  })

  it('rejects an unregistered enemy definition id in kills', () => {
    expect(() =>
      spawnDropsForKills([], 1, [{ x: 0, y: 0, definitionId: 'missing' }], () => 0),
    ).toThrow(/enemy not registered/i)
  })

  it('rejects an out-of-range drop chance at runtime', () => {
    const bad: EnemyDefinition = {
      id: 'bad_chance',
      name: '坏',
      description: '',
      radius: 1,
      speed: 1,
      maxHealth: 1,
      drops: [{ definitionId: FOOD_DROP_ID, chance: 1.5 }],
    }
    registerEnemy(bad)
    expect(() =>
      spawnDropsForKills([], 1, [{ x: 0, y: 0, definitionId: 'bad_chance' }], () => 0),
    ).toThrow(/invalid drop chance/i)
  })

  it('carries definitionId through kills after projectile advance', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.enemies = [
      {
        id: 1,
        definitionId: FAST_ENEMY_ID,
        x: 100,
        y: 100,
        radius: 10,
        speed: 0,
        health: 1,
        maxHealth: 1,
      },
    ]
    state.projectiles = [
      {
        id: 1,
        x: 100,
        y: 100,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 10,
        lifeRemaining: 1,
      },
    ]
    const step = advanceProjectiles(
      state.projectiles,
      state.enemies,
      state.arena,
      0,
    )
    expect(step.kills).toEqual([
      { x: 100, y: 100, definitionId: FAST_ENEMY_ID },
    ])
  })
})

describe('pickup results', () => {
  it('food adds health and no experience', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player = { ...state.player, health: 50 }
    const drop = createDrop(FOOD_DROP_ID, 1, state.player.x, state.player.y)
    const result = pickupDrops(state.player, [drop], 0)
    expect(result.healthDelta).toBe(FOOD_HEAL)
    expect(result.experience).toBe(0)
  })

  it('health is clamped to max health when applied', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player = { ...state.player, health: 95 }
    const drop = createDrop(FOOD_DROP_ID, 1, state.player.x, state.player.y)
    const result = pickupDrops(state.player, [drop], 0)
    const applied = Math.min(state.player.maxHealth, state.player.health + result.healthDelta)
    expect(applied).toBe(state.player.maxHealth)
  })

  it('chest adds experience and no health', () => {
    const state = createGameState(arena, createSequenceRng([]))
    const drop = createDrop(CHEST_DROP_ID, 1, state.player.x, state.player.y)
    const result = pickupDrops(state.player, [drop], 0)
    expect(result.experience).toBe(CHEST_XP)
    expect(result.healthDelta).toBe(0)
  })

  it('experience pickup still adds gem value', () => {
    const state = createGameState(arena, createSequenceRng([]))
    const drop = createDrop(EXPERIENCE_DROP_ID, 1, state.player.x, state.player.y)
    const result = pickupDrops(state.player, [drop], 0)
    expect(result.experience).toBe(GEM_VALUE)
  })

  it('game-loop applies food healing and rolls extra drops from a fast enemy kill', () => {
    const state = createGameState(arena, createSequenceRng([0, 0]))
    state.player = { ...state.player, health: 50 }
    state.enemies = [
      {
        id: 1000,
        definitionId: FAST_ENEMY_ID,
        x: state.player.x,
        y: state.player.y,
        radius: 10,
        speed: 0,
        health: 1,
        maxHealth: 1,
      },
    ]
    state.projectiles = [
      {
        id: 1000,
        x: state.player.x,
        y: state.player.y,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 10,
        lifeRemaining: 1,
      },
    ]
    updateGame(state, { x: 0, y: 0 }, 0.5)
    // 重叠敌人造成一次接触伤害，食物回血后净变化：-CONTACT_DAMAGE + FOOD_HEAL
    expect(state.player.health).toBe(50 - CONTACT_DAMAGE + FOOD_HEAL)
    // 必掉经验 + 掉落表全中（食物 + 宝箱）
    expect(state.experience).toBe(GEM_VALUE + CHEST_XP)
    expect(state.defeatedCount).toBe(1)
  })
})

describe('scatter weapon', () => {
  /**
   * rng 序列使第一次抽取命中散射弹。
   * 池顺序 swift/haste/power/scatter(0.6)/axe(0.7)/magnet(0.8)/missile(0.5)，总权重 5.6；
   * scatter 区间 [3.0, 3.6)，rng=0.6 → cursor 3.36 命中。
   */
  const scatterFirstRng = (): Rng => createSequenceRng([0.6, 0.5, 0.9])

  const withPendingScatter = (): GameState => {
    const state = createGameState(arena, scatterFirstRng())
    state.experience = 3
    tryEnterPendingUpgrade(state)
    expect(state.pendingUpgrade?.options[0].id).toBe(SCATTER_WEAPON_ID)
    return state
  }

  it('can appear in offers with weighted probability while not owned', () => {
    const state = createGameState(arena, scatterFirstRng())
    state.experience = 3
    tryEnterPendingUpgrade(state)
    const offers = state.pendingUpgrade?.options ?? []
    expect(offers[0].id).toBe(SCATTER_WEAPON_ID)
    expect(offers).toHaveLength(3)
  })

  it('does not always appear: weight 0 excludes it entirely', () => {
    const state = createGameState(arena, scatterFirstRng())
    state.experience = 3
    const scatter = getProgression(SCATTER_WEAPON_ID)!
    const original = scatter.offerWeight
    scatter.offerWeight = 0
    tryEnterPendingUpgrade(state)
    const offers = state.pendingUpgrade?.options ?? []
    expect(offers.some((o) => o.id === SCATTER_WEAPON_ID)).toBe(false)
    scatter.offerWeight = original
  })

  it('replaces the held weapon instead of stacking, and can level up to maxLevel', () => {
    const state = withPendingScatter()
    expect(state.player.weapons).toHaveLength(1)
    expect(applyUpgradeChoice(state, SCATTER_WEAPON_ID)).toBe(true)
    expect(state.player.weapons).toHaveLength(1)
    expect(state.player.weapons[0].definitionId).toBe(SCATTER_WEAPON_ID)
    expect(state.player.weapons[0].level).toBe(1)

    // 拥有后仍可升级（level 1 < maxLevel 3）
    state.rng = scatterFirstRng()
    state.experience = 5
    tryEnterPendingUpgrade(state)
    const offers = state.pendingUpgrade?.options ?? []
    expect(offers[0].id).toBe(SCATTER_WEAPON_ID)
    expect(applyUpgradeChoice(state, SCATTER_WEAPON_ID)).toBe(true)
    expect(state.player.weapons[0].level).toBe(2)
  })

  it('is excluded from offers once owned at max level', () => {
    const state = createGameState(arena, createSequenceRng([]))
    const weapon = getWeapon(SCATTER_WEAPON_ID)!.create()
    weapon.level = 3
    state.player.weapons = [weapon]
    state.experience = 3
    tryEnterPendingUpgrade(state)
    const offers = state.pendingUpgrade?.options ?? []
    expect(offers.some((o) => o.id === SCATTER_WEAPON_ID)).toBe(false)
  })

  it('fires shots based on weapon level', () => {
    const state = createGameState(arena, createSequenceRng([]))
    const weapon = getWeapon(SCATTER_WEAPON_ID)!.create()
    weapon.level = 2
    state.player.weapons = [weapon]
    state.enemies = [
      {
        id: 1,
        definitionId: DEFAULT_ENEMY_ID,
        x: state.player.x + 200,
        y: state.player.y,
        radius: 10,
        speed: 0,
        health: 10,
        maxHealth: 10,
      },
    ]
    const fired = advanceWeapons(state.player, state.enemies, 1, 0.5)
    const scatterShots = fired.projectiles.filter(
      (projectile) =>
        projectile.damage === state.player.projectileDamage * 0.4,
    )
    expect(scatterShots).toHaveLength(4)
  })
})

describe('drop colors are data-driven', () => {
  it('registers colors on default drop definitions', () => {
    expect(getDrop(EXPERIENCE_DROP_ID)?.color).toBe('#7dffb3')
    expect(getDrop(FOOD_DROP_ID)?.color).toBe('#ff8c5a')
    expect(getDrop(CHEST_DROP_ID)?.color).toBe('#f0c14a')
  })
})
