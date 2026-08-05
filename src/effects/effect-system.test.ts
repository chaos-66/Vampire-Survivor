import { afterEach, describe, expect, it } from 'vitest'

import { createGameState } from '../core/game-state'
import { updateGame } from '../core/game-loop'
import { DEFAULT_ENEMY_ID } from '../content/enemies/default-enemy'
import { resetAllContentRegistriesForTests, ensureContentRegistered } from '../content/bootstrap'
import type {
  InstantEffectDefinition,
  TimedEffectDefinition,
} from './effect-definition'
import {
  advanceActiveEffects,
  applyEffect,
  deriveEffectivePlayer,
} from './effect-system'
import {
  getEffect,
  listEffects,
  registerEffect,
} from './effect-registry'

const arena = { width: 2000, height: 1500 }

const speedRefresh: TimedEffectDefinition = {
  id: 'test_speed_refresh',
  name: '测试加速',
  description: '测试专用限时加速',
  kind: 'timed',
  durationSeconds: 2,
  stacking: 'refresh',
  maxStacks: 1,
  modifiers: { moveSpeedMultiplier: 2 },
}

const damageStack: TimedEffectDefinition = {
  id: 'test_damage_stack',
  name: '测试叠层',
  description: '测试专用伤害叠层',
  kind: 'timed',
  durationSeconds: 3,
  stacking: 'stack',
  maxStacks: 2,
  modifiers: { projectileDamageMultiplier: 1.5 },
}

afterEach(() => {
  resetAllContentRegistriesForTests()
  ensureContentRegistered()
})

describe('效果注册表与严格应用', () => {
  it('同一对象重复注册幂等，同 ID 不同对象抛错并保留原定义', () => {
    registerEffect(speedRefresh)
    registerEffect(speedRefresh)
    expect(listEffects()).toEqual([speedRefresh])

    expect(() => registerEffect({ ...speedRefresh })).toThrow(
      /different definition object/i,
    )
    expect(getEffect(speedRefresh.id)).toBe(speedRefresh)
  })

  it('未知效果 ID 明确失败', () => {
    expect(() => applyEffect(createGameState(arena), 'missing_effect')).toThrow(
      /effect not registered/i,
    )
  })

  it('完整 reset 后 bootstrap 仍保持无默认效果内容', () => {
    registerEffect(speedRefresh)
    resetAllContentRegistriesForTests()
    ensureContentRegistered()
    ensureContentRegistered()
    expect(listEffects()).toEqual([])
  })

  it('即时效果每次只执行一次且不进入活动列表', () => {
    const instant: InstantEffectDefinition = {
      id: 'test_heal',
      name: '测试治疗',
      description: '测试专用即时效果',
      kind: 'instant',
      apply: (player) => {
        player.health = Math.min(player.maxHealth, player.health + 10)
      },
    }
    registerEffect(instant)
    const state = createGameState(arena)
    state.player.health = 50

    applyEffect(state, instant.id)

    expect(state.player.health).toBe(60)
    expect(state.activeEffects).toEqual([])
  })
})

describe('限时效果与叠加规则', () => {
  it('refresh 重置持续时间但保持单层', () => {
    registerEffect(speedRefresh)
    const state = createGameState(arena)
    applyEffect(state, speedRefresh.id)
    state.activeEffects = advanceActiveEffects(state.activeEffects, 1.25)

    applyEffect(state, speedRefresh.id)

    expect(state.activeEffects).toEqual([
      { definitionId: speedRefresh.id, remainingSeconds: 2, stacks: 1 },
    ])
  })

  it('stack 叠加至上限并刷新持续时间', () => {
    registerEffect(damageStack)
    const state = createGameState(arena)
    applyEffect(state, damageStack.id)
    state.activeEffects = advanceActiveEffects(state.activeEffects, 1)
    applyEffect(state, damageStack.id)
    applyEffect(state, damageStack.id)

    expect(state.activeEffects).toEqual([
      { definitionId: damageStack.id, remainingSeconds: 3, stacks: 2 },
    ])
    expect(deriveEffectivePlayer(state.player, state.activeEffects).projectileDamage)
      .toBeCloseTo(state.player.projectileDamage * 1.5 ** 2)
  })

  it('增益与减益相乘派生有效属性且不改写永久值', () => {
    const slow: TimedEffectDefinition = {
      ...speedRefresh,
      id: 'test_slow',
      modifiers: { moveSpeedMultiplier: 0.5 },
    }
    registerEffect(speedRefresh)
    registerEffect(slow)
    const state = createGameState(arena)
    const base = state.player.moveSpeed
    applyEffect(state, speedRefresh.id)
    applyEffect(state, slow.id)

    expect(deriveEffectivePlayer(state.player, state.activeEffects).moveSpeed).toBe(base)
    expect(state.player.moveSpeed).toBe(base)
  })

  it('到期精确移除并恢复基础属性', () => {
    registerEffect(speedRefresh)
    const state = createGameState(arena)
    applyEffect(state, speedRefresh.id)

    state.activeEffects = advanceActiveEffects(state.activeEffects, 2)

    expect(state.activeEffects).toEqual([])
    expect(deriveEffectivePlayer(state.player, state.activeEffects).moveSpeed).toBe(
      state.player.moveSpeed,
    )
  })
})

describe('游戏循环效果接线', () => {
  it('移动使用有效速度且帧结束后推进效果时间', () => {
    registerEffect(speedRefresh)
    const state = createGameState(arena)
    state.worldObjects = []
    applyEffect(state, speedRefresh.id)
    const before = state.player.x

    updateGame(state, { x: 1, y: 0 }, 0.5)

    expect(state.player.x - before).toBeCloseTo(state.player.moveSpeed)
    expect(state.activeEffects[0].remainingSeconds).toBeCloseTo(1.5)
  })

  it('武器发射使用有效伤害但保留永久基础伤害', () => {
    registerEffect(damageStack)
    const state = createGameState(arena)
    state.enemies = [
      {
        id: 1,
        definitionId: DEFAULT_ENEMY_ID,
        x: state.player.x + 100,
        y: state.player.y,
        radius: 14,
        speed: 0,
        health: 100,
        maxHealth: 100,
      },
    ]
    applyEffect(state, damageStack.id)
    const baseDamage = state.player.projectileDamage

    updateGame(state, { x: 0, y: 0 }, 0.01)

    expect(state.projectiles[0].damage).toBeCloseTo(baseDamage * 1.5)
    expect(state.player.projectileDamage).toBe(baseDamage)
  })

  it('武器重置冷却时使用有效攻击间隔', () => {
    const haste: TimedEffectDefinition = {
      ...speedRefresh,
      id: 'test_haste',
      modifiers: { attackCooldownMultiplier: 0.5 },
    }
    registerEffect(haste)
    const state = createGameState(arena)
    state.enemies = [
      {
        id: 1,
        definitionId: DEFAULT_ENEMY_ID,
        x: state.player.x + 100,
        y: state.player.y,
        radius: 14,
        speed: 0,
        health: 100,
        maxHealth: 100,
      },
    ]
    applyEffect(state, haste.id)
    const baseCooldown = state.player.attackCooldown

    updateGame(state, { x: 0, y: 0 }, 0.01)

    expect(state.player.weapons[0].cooldownRemaining).toBeCloseTo(
      baseCooldown * 0.5,
    )
    expect(state.player.attackCooldown).toBe(baseCooldown)
  })

  it('pending 和终局冻结效果时间，重新创建状态清空效果', () => {
    registerEffect(speedRefresh)
    const pending = createGameState(arena)
    applyEffect(pending, speedRefresh.id)
    pending.pendingUpgrade = { options: [] }
    updateGame(pending, { x: 0, y: 0 }, 1)
    expect(pending.activeEffects[0].remainingSeconds).toBe(2)

    pending.pendingUpgrade = null
    pending.outcome = 'won'
    updateGame(pending, { x: 0, y: 0 }, 1)
    expect(pending.activeEffects[0].remainingSeconds).toBe(2)
    expect(createGameState(arena).activeEffects).toEqual([])
  })
})
