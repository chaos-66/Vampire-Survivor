/**
 * CP-M5-ABILITY-01 针对性测试：
 * 能力注册表、严格创建入口、斧头/吸经验/追踪弹行为、升级 offer 获取与回归。
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { createGameState, createSequenceRng } from './core/game-state'
import { advanceAbilities } from './abilities/ability-system'
import { createAbility } from './abilities/ability-factory'
import {
  registerAbility,
  listAbilities,
} from './abilities/ability-registry'
import { advanceProjectiles } from './combat/projectile-system'
import { AXE_ABILITY_ID } from './content/abilities/axe'
import { EXPERIENCE_MAGNET_ABILITY_ID } from './content/abilities/experience-magnet'
import { HOMING_MISSILE_ABILITY_ID } from './content/abilities/homing-missile'
import {
  AXE_DAMAGE,
  MISSILE_DAMAGE,
} from './core/constants'
import { tryEnterPendingUpgrade } from './progression/upgrade-system'
import { applyUpgradeChoice } from './progression/upgrade-system'
import { getProgression } from './progression/progression-registry'
import { updateGame } from './core/game-loop'
import {
  resetAllContentRegistriesForTests,
  registerDefaultContent,
} from './content/bootstrap'
import type { GameState } from './core/game-state'
import type { Enemy } from './combat/enemy-types'

const arena = { width: 960, height: 540 }

beforeEach(() => {
  resetAllContentRegistriesForTests()
  registerDefaultContent()
})

const enemyAhead = (state: GameState): Enemy => ({
  id: 1,
  definitionId: 'default_enemy',
  x: state.player.x + 300,
  y: state.player.y,
  radius: 10,
  speed: 0,
  health: 100,
  maxHealth: 100,
})

describe('ability registry and factory', () => {
  it('registers default abilities idempotently', () => {
    expect(listAbilities().map((a) => a.id)).toEqual([
      AXE_ABILITY_ID,
      EXPERIENCE_MAGNET_ABILITY_ID,
      HOMING_MISSILE_ABILITY_ID,
    ])
    registerDefaultContent()
    expect(listAbilities()).toHaveLength(3)
  })

  it('strict factory rejects an unregistered ability id', () => {
    expect(() => createAbility('missing_ability')).toThrow(
      /ability not registered/i,
    )
  })

  it('strict factory rejects a mismatched create() result', () => {
    const bad = {
      id: 'bad_ability',
      name: '坏',
      description: '',
      maxLevel: 1,
      create: () => ({
        definitionId: 'other',
        level: 1,
        cooldownRemaining: 0,
      }),
      update: () => undefined,
    }
    registerAbility(bad)
    expect(() => createAbility('bad_ability')).toThrow(/mismatched definitionId/i)
  })

  it('create() returns instance with definitionId and level 1', () => {
    const instance = createAbility(AXE_ABILITY_ID)
    expect(instance.definitionId).toBe(AXE_ABILITY_ID)
    expect(instance.level).toBe(1)
    expect(instance.cooldownRemaining).toBe(0)
  })
})

describe('axe ability', () => {
  it('throws a projectile at the nearest enemy after cooldown', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(AXE_ABILITY_ID))
    const enemy = enemyAhead(state)
    state.enemies = [enemy]

    // 冷却就绪：立即发射
    const fired = advanceAbilities(
      state.player,
      state.player.abilities,
      state.enemies,
      state.drops,
      1,
      0.016,
    )
    expect(fired.projectiles).toHaveLength(1)
    expect(fired.projectiles[0]!.damage).toBe(AXE_DAMAGE)
    expect(fired.projectiles[0]!.vx).toBeGreaterThan(0)
    expect(fired.projectiles[0]!.homingTurnSpeed).toBeUndefined()
  })

  it('does not fire again while cooling down', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(AXE_ABILITY_ID))
    state.enemies = [enemyAhead(state)]
    advanceAbilities(state.player, state.player.abilities, state.enemies, [], 1, 0.016)
    const second = advanceAbilities(
      state.player,
      state.player.abilities,
      state.enemies,
      [],
      2,
      0.1,
    )
    expect(second.projectiles).toHaveLength(0)
  })

  it('axe projectile damages an enemy through the projectile system', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(AXE_ABILITY_ID))
    const enemy = {
      id: 1,
      definitionId: 'default_enemy',
      x: state.player.x + 100,
      y: state.player.y,
      radius: 10,
      speed: 0,
      health: 100,
      maxHealth: 100,
    }
    state.enemies = [enemy]
    const fired = advanceAbilities(
      state.player,
      state.player.abilities,
      state.enemies,
      state.drops,
      1,
      0.016,
    )
    state.projectiles.push(...fired.projectiles)
    // 0.4s 内斧头前进 104px，与 100px 外的敌人重叠（半径和 22）
    const step = advanceProjectiles(
      state.projectiles,
      state.enemies,
      state.arena,
      0.4,
    )
    expect(step.enemies[0]?.health).toBe(100 - AXE_DAMAGE)
  })
})

describe('experience magnet ability', () => {
  it('pulls drops within range toward the player', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(EXPERIENCE_MAGNET_ABILITY_ID))
    state.drops = [
      { id: 1, definitionId: 'experience_drop', x: state.player.x + 100, y: state.player.y, radius: 8 },
      { id: 2, definitionId: 'experience_drop', x: state.player.x + 500, y: state.player.y, radius: 8 },
    ]
    advanceAbilities(
      state.player,
      state.player.abilities,
      state.enemies,
      state.drops,
      1,
      1,
    )
    const near = state.drops[0]!
    const far = state.drops[1]!
    // 距离 100 < 吸附速度 340/s，1 秒内拉到玩家位置；500 超出范围不受影响
    expect(near.x).toBeCloseTo(state.player.x, 5)
    expect(far.x).toBe(state.player.x + 500)
  })
})

describe('homing missile ability', () => {
  it('spawns homing projectiles with turn speed', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(HOMING_MISSILE_ABILITY_ID))
    state.enemies = [enemyAhead(state)]
    const fired = advanceAbilities(
      state.player,
      state.player.abilities,
      state.enemies,
      state.drops,
      1,
      0.016,
    )
    expect(fired.projectiles).toHaveLength(1)
    expect(fired.projectiles[0]!.homingTurnSpeed).toBeGreaterThan(0)
    expect(fired.projectiles[0]!.damage).toBe(MISSILE_DAMAGE)
  })

  it('steers toward the nearest enemy over time', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(HOMING_MISSILE_ABILITY_ID))
    state.enemies = [enemyAhead(state)]
    const fired = advanceAbilities(
      state.player,
      state.player.abilities,
      state.enemies,
      state.drops,
      1,
      0.016,
    )
    state.projectiles.push(...fired.projectiles)
    // 弹初始方向为右（角度 0）；敌人也在正右方，方向应保持接近
    const step = advanceProjectiles(state.projectiles, state.enemies, state.arena, 0.1)
    expect(step.projectiles[0]!.vx).toBeGreaterThan(0)
    expect(Math.abs(Math.atan2(step.projectiles[0]!.vy, step.projectiles[0]!.vx))).toBeLessThan(0.7)
  })

  it('fires more missiles at higher level', () => {
    const state = createGameState(arena, createSequenceRng([]))
    const instance = createAbility(HOMING_MISSILE_ABILITY_ID)
    instance.level = 2
    state.player.abilities.push(instance)
    state.enemies = [enemyAhead(state)]
    const fired = advanceAbilities(
      state.player,
      state.player.abilities,
      state.enemies,
      state.drops,
      1,
      0.016,
    )
    expect(fired.projectiles).toHaveLength(2)
  })
})

describe('ability upgrades', () => {
  it('is obtainable through upgrade offers and cleared on restart', () => {
    const state = createGameState(arena, createSequenceRng([]))
    // 固定 rng 使首抽命中吸经验：池 swift/haste/power/scatter(0.6)/axe(0.7)/magnet(0.8)/missile(0.5)
    // 总权重 5.6；magnet 区间 [4.3, 5.1)，rng=0.8 → cursor 4.48 命中
    state.rng = createSequenceRng([0.8, 0.5, 0.9])
    state.experience = 3
    tryEnterPendingUpgrade(state)
    const offers = state.pendingUpgrade?.options ?? []
    expect(offers[0].id).toBe(EXPERIENCE_MAGNET_ABILITY_ID)
    expect(applyUpgradeChoice(state, EXPERIENCE_MAGNET_ABILITY_ID)).toBe(true)
    expect(
      state.player.abilities.some(
        (a) => a.definitionId === EXPERIENCE_MAGNET_ABILITY_ID,
      ),
    ).toBe(true)
    expect(state.player.weapons).toHaveLength(1)

    // 重新开始清空能力
    const fresh = createGameState(arena, createSequenceRng([]))
    expect(fresh.player.abilities).toHaveLength(0)
  })

  it('homing missile can level up to maxLevel through offers', () => {
    const state = createGameState(arena, createSequenceRng([]))
    const progression = getProgression(HOMING_MISSILE_ABILITY_ID)!
    expect(progression.maxLevel).toBe(3)
    progression.apply({
      player: state.player,
      progressionLevels: state.progressionLevels,
    })
    expect(
      state.player.abilities.find(
        (a) => a.definitionId === HOMING_MISSILE_ABILITY_ID,
      )?.level,
    ).toBe(1)
  })

  it('game-loop integrates ability projectiles into combat', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(AXE_ABILITY_ID))
    state.enemies = [
      {
        id: 1,
        definitionId: 'default_enemy',
        x: state.player.x + 30,
        y: state.player.y,
        radius: 10,
        speed: 0,
        health: 30,
        maxHealth: 30,
      },
    ]
    // 0.1s：武器弹前进 42px、斧头 26px，均与 30px 外敌人重叠并命中（15+20 ≥ 30）
    updateGame(state, { x: 0, y: 0 }, 0.1)
    expect(state.defeatedCount).toBe(1)
    expect(state.enemies).toHaveLength(0)
  })
})
