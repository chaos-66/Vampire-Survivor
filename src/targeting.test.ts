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
  it('scatter weapon fires along facing regardless of nearest enemy', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.weapons = [getWeapon(SCATTER_WEAPON_ID)!.create()]
    state.player.facing = { x: 0, y: -1 }
    // 最近敌人在右方；散射弹应朝上（朝向）发射
    state.enemies = [enemyAhead(state)]
    const fired = advanceWeapons(state.player, state.enemies, 1, 0.5)
    expect(fired.projectiles).toHaveLength(3)
    for (const p of fired.projectiles) {
      expect(p.vy).toBeLessThan(0)
      expect(Math.abs(p.vx)).toBeLessThan(Math.abs(p.vy))
    }
  })

  it('axe throws along facing regardless of nearest enemy', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.abilities.push(createAbility(AXE_ABILITY_ID))
    state.player.facing = { x: -1, y: 0 }
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
    expect(fired.projectiles[0]!.vx).toBeLessThan(0)
    expect(fired.projectiles[0]!.vy).toBeCloseTo(0)
  })

  it('scatter weapon fires even without enemies (facing only)', () => {
    const state = createGameState(arena, createSequenceRng([]))
    state.player.weapons = [getWeapon(SCATTER_WEAPON_ID)!.create()]
    state.player.facing = { x: 1, y: 0 }
    const fired = advanceWeapons(state.player, [], 1, 0.5)
    expect(fired.projectiles).toHaveLength(3)
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
