import { describe, expect, it } from 'vitest'

import {
  ENEMY_CAP,
  ENEMY_MAX_HEALTH,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_SPEED,
} from './constants'
import {
  DIFFICULTY_PROFILES,
  getDifficultyProfile,
  splitDifficultyTime,
  type DifficultyProfile,
} from './difficulty'
import { createGameState, createSequenceRng } from './game-state'
import { updateGame } from './game-loop'
import { advanceSpawns } from '../combat/enemy-system'
import { getDifficultyHudLines } from '../ui/hud'

const arena = { width: 12000, height: 7000 }

describe('difficulty profile', () => {
  it('uses the approved interval and cap values', () => {
    expect(DIFFICULTY_PROFILES).toEqual([
      {
        tier: 1,
        startsAtSeconds: 0,
        spawnInterval: ENEMY_SPAWN_INTERVAL,
        enemyCap: ENEMY_CAP,
      },
      { tier: 2, startsAtSeconds: 15, spawnInterval: 0.8, enemyCap: 24 },
      { tier: 3, startsAtSeconds: 30, spawnInterval: 0.65, enemyCap: 28 },
      { tier: 4, startsAtSeconds: 45, spawnInterval: 0.5, enemyCap: 32 },
    ])
  })

  it.each([
    [0, 1],
    [14.999, 1],
    [15, 2],
    [29.999, 2],
    [30, 3],
    [44.999, 3],
    [45, 4],
    [999, 4],
  ] as const)('maps %s seconds to tier %s', (seconds, tier) => {
    expect(getDifficultyProfile(seconds).tier).toBe(tier)
  })

  it('treats invalid and negative time as the first tier', () => {
    expect(getDifficultyProfile(-1).tier).toBe(1)
    expect(getDifficultyProfile(Number.NaN).tier).toBe(1)
    expect(getDifficultyProfile(Number.POSITIVE_INFINITY).tier).toBe(1)
  })

  it('exposes immutable profile data', () => {
    const profile = getDifficultyProfile(15)
    expect(Object.isFrozen(DIFFICULTY_PROFILES)).toBe(true)
    expect(Object.isFrozen(profile)).toBe(true)
    expect(() => {
      ;(profile as { spawnInterval: number }).spawnInterval = 0
    }).toThrow(TypeError)
    expect(getDifficultyProfile(15).spawnInterval).toBe(0.8)
  })

  it('splits frames exactly at tier boundaries', () => {
    expect(
      splitDifficultyTime(14.9, 0.2).map((slice) => ({
        duration: Number(slice.duration.toFixed(6)),
        tier: slice.profile.tier,
      })),
    ).toEqual([
      { duration: 0.1, tier: 1 },
      { duration: 0.1, tier: 2 },
    ])
  })
})

describe('active run time', () => {
  it('starts at zero and advances by simulation dt', () => {
    const state = createGameState(arena)
    expect(state.elapsedActiveSeconds).toBe(0)
    updateGame(state, { x: 0, y: 0 }, 0.25)
    updateGame(state, { x: 0, y: 0 }, 0.5)
    expect(state.elapsedActiveSeconds).toBeCloseTo(0.75)
  })

  it('does not advance for non-positive dt', () => {
    const state = createGameState(arena)
    updateGame(state, { x: 0, y: 0 }, 0)
    updateGame(state, { x: 0, y: 0 }, -1)
    expect(state.elapsedActiveSeconds).toBe(0)
  })

  it('does not advance for non-finite dt', () => {
    const state = createGameState(arena)
    const x = state.player.x
    updateGame(state, { x: 1, y: 0 }, Number.POSITIVE_INFINITY)
    expect(state.elapsedActiveSeconds).toBe(0)
    expect(state.player.x).toBe(x)
    expect(state.spawnAccumulator).toBe(0)
  })

  it('uses each tier for its part of a boundary-crossing frame', () => {
    const state = createGameState(arena)
    state.elapsedActiveSeconds = 14.9
    state.spawnAccumulator = 0.95

    updateGame(state, { x: 0, y: 0 }, 0.2)

    expect(state.elapsedActiveSeconds).toBeCloseTo(15.1)
    expect(state.enemies).toHaveLength(1)
    expect(state.spawnAccumulator).toBeCloseTo(0.15)
  })

  it('freezes time and spawning while an upgrade is pending', () => {
    const state = createGameState(arena)
    state.elapsedActiveSeconds = 14.9
    state.spawnAccumulator = 0.99
    state.pendingUpgrade = { options: [] }

    updateGame(state, { x: 0, y: 0 }, 1)

    expect(state.elapsedActiveSeconds).toBe(14.9)
    expect(state.spawnAccumulator).toBe(0.99)
    expect(state.enemies).toHaveLength(0)
  })
})

describe('difficulty-driven spawning', () => {
  it.each(DIFFICULTY_PROFILES)(
    'uses tier $tier interval $spawnInterval',
    (profile) => {
      const state = createGameState(arena)
      advanceSpawns(state, profile.spawnInterval - 0.001, undefined, undefined, profile)
      expect(state.enemies).toHaveLength(0)

      advanceSpawns(state, 0.001, undefined, undefined, profile)
      expect(state.enemies).toHaveLength(1)
    },
  )

  it.each(DIFFICULTY_PROFILES)(
    'stops tier $tier at enemy cap $enemyCap and bounds the accumulator',
    (profile) => {
      const state = createGameState(arena)
      advanceSpawns(
        state,
        profile.spawnInterval * (profile.enemyCap + 5),
        undefined,
        undefined,
        profile,
      )

      expect(state.enemies).toHaveLength(profile.enemyCap)
      expect(state.spawnAccumulator).toBeLessThanOrEqual(profile.spawnInterval)
    },
  )

  it('keeps enemy combat stats at their baseline in the highest tier', () => {
    const state = createGameState(
      arena,
      createSequenceRng([0, 0.5, 0.5]),
    )
    const highest = getDifficultyProfile(45)

    advanceSpawns(
      state,
      highest.spawnInterval,
      undefined,
      undefined,
      highest,
    )

    expect(state.enemies[0]).toMatchObject({
      health: ENEMY_MAX_HEALTH,
      maxHealth: ENEMY_MAX_HEALTH,
      speed: ENEMY_SPEED,
    })
  })

  it.each([
    {
      tier: 4,
      startsAtSeconds: 45,
      spawnInterval: 0,
      enemyCap: Number.POSITIVE_INFINITY,
    },
    {
      tier: 4,
      startsAtSeconds: 45,
      spawnInterval: Number.MIN_VALUE,
      enemyCap: Number.MAX_VALUE,
    },
  ] as DifficultyProfile[])('rejects unregistered profile %#', (unsafe) => {
    const state = createGameState(arena)

    advanceSpawns(state, ENEMY_SPAWN_INTERVAL, undefined, undefined, unsafe)

    expect(state.enemies).toHaveLength(1)
    expect(state.spawnAccumulator).toBe(0)
  })

  it('falls back safely for a null profile', () => {
    const state = createGameState(arena)

    advanceSpawns(state, ENEMY_SPAWN_INTERVAL, undefined, undefined, null)

    expect(state.enemies).toHaveLength(1)
    expect(state.spawnAccumulator).toBe(0)
  })
})

describe('difficulty HUD', () => {
  it('formats elapsed time and tier in Chinese', () => {
    expect(getDifficultyHudLines(30.25)).toEqual([
      '时间 00:30',
      '难度 第 3 档',
    ])
  })

  it('formats five-minute durations as mm:ss', () => {
    expect(getDifficultyHudLines(299.9)).toEqual([
      '时间 04:59',
      '难度 第 4 档',
    ])
  })

  it('normalizes invalid elapsed time for display', () => {
    expect(getDifficultyHudLines(Number.NaN)).toEqual([
      '时间 00:00',
      '难度 第 1 档',
    ])
  })
})
