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
  const enemyAt = (id: number, x: number, y: number, radius = 10): Enemy => ({
    id,
    definitionId: 'default_enemy',
    x,
    y,
    radius,
    speed: 0,
    health: 10,
    maxHealth: 10,
  })

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
    Math.hypot(b.x - a.x, b.y - a.y)

  it('any intersecting pair strictly increases separation after one frame', () => {
    // 覆盖多种偏移（含旧代码 sign === -1 会吸引的 id 组合）
    const pairs = [
      [1, 2],
      [2, 3], // 奇偶和为奇数（旧代码 sign === -1）
      [4, 7],
      [10, 11],
    ] as const
    const offsets = [
      { dx: 0, dy: 0 },
      { dx: 4, dy: 0 },
      { dx: -3, dy: 5 },
      { dx: 6, dy: -2 },
    ] as const
    for (const [idA, idB] of pairs) {
      for (const off of offsets) {
        const before = distance(enemyAt(idA, 100, 100), enemyAt(idB, 100 + off.dx, 100 + off.dy))
        const result = separateEnemies([
          enemyAt(idA, 100, 100),
          enemyAt(idB, 100 + off.dx, 100 + off.dy),
        ])
        const after = distance(result[0]!, result[1]!)
        expect(after).toBeGreaterThan(before)
      }
    }
  })

  it('old sign-odd fixtures still move apart stably (no attraction)', () => {
    // id 1 与 2：旧代码 (1+2)%2 === 1 → sign === -1 会反转互斥方向
    const a = enemyAt(1, 100, 100)
    const b = enemyAt(2, 105, 100)
    const result = separateEnemies([a, b])
    // a 应向左、b 应向右（互斥，不交换位置）
    expect(result[0]!.x).toBeLessThan(100)
    expect(result[1]!.x).toBeGreaterThan(105)
  })

  it('fully concentric enemies separate stably across repeated calls and frames', () => {
    const make = () => separateEnemies([enemyAt(1, 100, 100), enemyAt(2, 100, 100)])
    const first = make()
    const second = make()
    // 方向稳定：两次调用结果一致
    expect(second[0]!.x).toBe(first[0]!.x)
    expect(second[0]!.y).toBe(first[0]!.y)
    // 不交换相对位置：第二次调用中 id1 仍在 id2 的同一侧
    const sideA = Math.sign(first[1]!.x - first[0]!.x)
    const sideB = Math.sign(second[1]!.x - second[0]!.x)
    expect(sideB).toBe(sideA)
    expect(distance(first[0]!, first[1]!)).toBeGreaterThan(0)
  })

  it('multiple concentric enemies spread into a finite cluster over iterations', () => {
    const enemies = Array.from({ length: 8 }, (_, i) => enemyAt(i + 1, 200, 200))
    // 逐步收敛：多次调用（模拟多帧累积）后所有两两中心距达到半径和 * 0.75
    let result = separateEnemies(enemies)
    for (let i = 0; i < 20; i += 1) {
      result = separateEnemies(result)
    }
    const centers = new Set(result.map((e) => `${e.x.toFixed(4)},${e.y.toFixed(4)}`))
    expect(centers.size).toBeGreaterThan(1)
    for (let i = 0; i < result.length; i += 1) {
      for (let j = i + 1; j < result.length; j += 1) {
        const minDist = (result[i]!.radius + result[j]!.radius) * 0.75
        expect(distance(result[i]!, result[j]!)).toBeGreaterThanOrEqual(minDist - 1e-6)
      }
    }
  })

  it('normally spaced enemies are not moved', () => {
    const a = enemyAt(1, 100, 100)
    const b = enemyAt(2, 500, 100)
    const enemies = separateEnemies([a, b])
    expect(enemies[0]!.x).toBe(100)
    expect(enemies[1]!.x).toBe(500)
  })

  it('minimum distance uses each enemy actual radius (mixed radii)', () => {
    const small = enemyAt(1, 100, 100, 6)
    const big = enemyAt(2, 108, 100, 16)
    const result = separateEnemies([small, big])
    const minDist = (6 + 16) * 0.75
    expect(distance(result[0]!, result[1]!)).toBeGreaterThanOrEqual(minDist - 1e-9)
  })

  it('does not change enemy attributes', () => {
    const enemies = separateEnemies([enemyAt(1, 100, 100), enemyAt(2, 100, 100)])
    for (const enemy of enemies) {
      expect(enemy.health).toBe(10)
      expect(enemy.speed).toBe(0)
      expect(enemy.radius).toBe(10)
      expect(enemy.definitionId).toBe('default_enemy')
      expect(enemy.id).toBeGreaterThan(0)
    }
  })

  it('clamps separated enemies inside the arena', () => {
    const arena = { width: 200, height: 200 }
    const result = separateEnemies([enemyAt(1, 5, 5), enemyAt(2, 5, 5)], arena)
    for (const enemy of result) {
      expect(enemy.x).toBeGreaterThanOrEqual(enemy.radius)
      expect(enemy.x).toBeLessThanOrEqual(arena.width - enemy.radius)
      expect(enemy.y).toBeGreaterThanOrEqual(enemy.radius)
      expect(enemy.y).toBeLessThanOrEqual(arena.height - enemy.radius)
    }
  })

  it('chasing overlapping enemies do not jitter direction across frames', () => {
    const state = createGameState(arena, createSequenceRng([]))
    const a = { ...enemyAt(1001, state.player.x + 40, state.player.y, 10), health: 1000, maxHealth: 1000 }
    const b = { ...enemyAt(1002, state.player.x + 44, state.player.y, 10), health: 1000, maxHealth: 1000 }
    state.enemies = [a, b]
    // 追踪多帧（玩家静止）：两敌人持续靠近玩家，但相对 x 顺序不翻转、无来回推拉
    for (let f = 0; f < 30; f += 1) {
      updateGame(state, { x: 0, y: 0 }, 0.05)
      const e1 = state.enemies.find((e) => e.id === 1001)
      const e2 = state.enemies.find((e) => e.id === 1002)
      expect(e1).toBeDefined()
      expect(e2).toBeDefined()
      // 无穿越：id1 始终在 id2 左侧
      expect(e1!.x).toBeLessThan(e2!.x)
      // 无来回推拉：距离不小于半径和 * 0.75
      const minDist = (e1!.radius + e2!.radius) * 0.75
      expect(distance(e1!, e2!)).toBeGreaterThanOrEqual(minDist - 1e-6)
    }
  })
})
