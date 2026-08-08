/**
 * CP-M5-TARGETING-01 针对性测试：
 * 朝向状态更新、散射弹/斧头沿朝向发射、默认弹/追踪弹自动目标保持。
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { createGameState, createSequenceRng } from './core/game-state'
import { movePlayer } from './actors/player-system'
import { advanceWeapons } from './weapons/weapon-system'
import { advanceAbilities } from './abilities/ability-system'
import { createAbility } from './abilities/ability-factory'
import { separateEnemies } from './combat/enemy-system'
import { AXE_ABILITY_ID } from './content/abilities/axe'
import { HOMING_MISSILE_ABILITY_ID } from './content/abilities/homing-missile'
import { SCATTER_WEAPON_ID } from './content/weapons/scatter-weapon'
import { DEFAULT_WEAPON_ID } from './content/weapons/default-projectile'
import { getWeapon } from './weapons/weapon-registry'
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

describe('player facing', () => {
  it('starts facing right in a new run', () => {
    const state = createGameState(arena, createSequenceRng([]))
    expect(state.player.facing).toEqual({ x: 1, y: 0 })
  })

  it('updates facing from the last non-zero move direction', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player = movePlayer(state.player, { x: 0, y: -1 }, 0.1, arena)
    expect(state.player.facing.x).toBeCloseTo(0)
    expect(state.player.facing.y).toBeCloseTo(-1)
    state.player = movePlayer(state.player, { x: -1, y: 0 }, 0.1, arena)
    expect(state.player.facing.x).toBeCloseTo(-1)
    expect(state.player.facing.y).toBeCloseTo(0)
  })

  it('keeps the last facing while stationary', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player = movePlayer(state.player, { x: 1, y: 0 }, 0.1, arena)
    state.player = movePlayer(state.player, { x: 0, y: 0 }, 0.1, arena)
    expect(state.player.facing).toEqual({ x: 1, y: 0 })
  })

  it('restart resets facing to right', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player = movePlayer(state.player, { x: 0, y: 1 }, 0.1, arena)
    expect(state.player.facing.y).toBeCloseTo(1)
    const fresh = createGameState(arena, createSequenceRng([]))
    expect(fresh.player.facing).toEqual({ x: 1, y: 0 })
  })
})

describe('directional weapons and abilities', () => {
  it('scatter weapon aims at the nearest enemy again (facing no longer drives firing)', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.weapons = [getWeapon(SCATTER_WEAPON_ID)!.create()]
    state.player.facing = { x: 0, y: -1 }
    // 最近敌人在右方；散射弹应朝右（敌人）发射，而非朝上（朝向）
    state.enemies = [enemyAhead(state)]
    const fired = advanceWeapons(state.player, state.enemies, 1, 0.5)
    expect(fired.projectiles).toHaveLength(3)
    for (const p of fired.projectiles) {
      expect(p.vx).toBeGreaterThan(0)
      expect(Math.abs(p.vy)).toBeLessThan(Math.abs(p.vx))
    }
  })

  it('axe throws at the nearest enemy again (facing no longer drives throwing)', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(AXE_ABILITY_ID))
    state.player.facing = { x: -1, y: 0 }
    // 最近敌人在右方；斧头应朝右（敌人）投掷
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
    expect(fired.projectiles[0]!.vx).toBeGreaterThan(0)
    expect(fired.projectiles[0]!.vy).toBeCloseTo(0)
  })

  it('scatter weapon does not fire without enemies', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.weapons = [getWeapon(SCATTER_WEAPON_ID)!.create()]
    state.player.facing = { x: 1, y: 0 }
    const fired = advanceWeapons(state.player, [], 1, 0.5)
    expect(fired.projectiles).toHaveLength(0)
  })
})

describe('automatic targeting preserved', () => {
  it('default projectile still aims at the nearest enemy', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.weapons = [getWeapon(DEFAULT_WEAPON_ID)!.create()]
    state.player.facing = { x: 0, y: -1 }
    state.enemies = [
      {
        id: 1,
        definitionId: 'default_enemy',
        x: state.player.x + 200,
        y: state.player.y,
        radius: 10,
        speed: 0,
        health: 10,
        maxHealth: 10,
      },
    ]
    const fired = advanceWeapons(state.player, state.enemies, 1, 0.5)
    expect(fired.projectiles).toHaveLength(1)
    expect(fired.projectiles[0]!.vx).toBeGreaterThan(0)
  })

  it('homing missile still tracks the nearest enemy in flight', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(HOMING_MISSILE_ABILITY_ID))
    state.player.facing = { x: 0, y: -1 }
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
  })
})

describe('pause and reset integration', () => {
  it('updateGame updates facing from movement direction during a run', () => {
    const state = createGameState(arena, createSequenceRng([]))
    updateGame(state, { x: 0, y: -1 }, 0.1)
    expect(state.player.facing.y).toBeCloseTo(-1)
    // 暂停冻结由 main.ts 的应用阶段门控实现（暂停时不调用 updateGame），
    // 由浏览器验收覆盖；重新开始经 createGameState 重置默认朝向。
  })
})

describe('enemy separation', () => {
  const enemyAt = (id: number, x: number, y: number): Enemy => ({
    id,
    definitionId: 'default_enemy',
    x,
    y,
    radius: 10,
    speed: 0,
    health: 10,
    maxHealth: 10,
  })

  it('fully overlapping enemies are deterministically separated', () => {
    const enemies = separateEnemies([enemyAt(1, 100, 100), enemyAt(2, 100, 100)])
    expect(enemies).toHaveLength(2)
    const dx = enemies[1]!.x - enemies[0]!.x
    const dy = enemies[1]!.y - enemies[0]!.y
    const dist = Math.hypot(dx, dy)
    expect(dist).toBeGreaterThan(0)
    // 再次分离结果一致（确定性）
    const again = separateEnemies([enemyAt(1, 100, 100), enemyAt(2, 100, 100)])
    expect(again[0]!.x).toBe(enemies[0]!.x)
    expect(again[0]!.y).toBe(enemies[0]!.y)
  })

  it('partially overlapping enemies are pushed apart', () => {
    const enemies = separateEnemies([enemyAt(1, 100, 100), enemyAt(2, 105, 100)])
    const dist = Math.hypot(enemies[1]!.x - enemies[0]!.x, enemies[1]!.y - enemies[0]!.y)
    expect(dist).toBeGreaterThan(5)
  })

  it('normally spaced enemies are not pushed apart', () => {
    const a = enemyAt(1, 100, 100)
    const b = enemyAt(2, 500, 100)
    const enemies = separateEnemies([a, b])
    expect(enemies[0]!.x).toBe(100)
    expect(enemies[1]!.x).toBe(500)
  })

  it('does not change enemy attributes', () => {
    const enemies = separateEnemies([enemyAt(1, 100, 100), enemyAt(2, 100, 100)])
    for (const enemy of enemies) {
      expect(enemy.health).toBe(10)
      expect(enemy.speed).toBe(0)
      expect(enemy.radius).toBe(10)
      expect(enemy.definitionId).toBe('default_enemy')
    }
  })
})
