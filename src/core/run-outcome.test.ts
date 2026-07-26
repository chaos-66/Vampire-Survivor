import { describe, expect, it } from 'vitest'

import {
  clampDtToRunRemaining,
  isPlainRestartEvent,
  isRestartCode,
  resolveRunOutcome,
} from './run-outcome'
import { CONTACT_DAMAGE, RUN_DURATION_SECONDS } from './constants'
import { createGameState, createSequenceRng, updateGame } from '../game'
import { computeWorldBounds } from '../world/world'
import { computeCamera } from '../world/camera'
import {
  getRestartButtonRect,
  restartButtonContainsPoint,
} from '../ui/outcome-overlay'

describe('resolveRunOutcome', () => {
  it('starts as running for healthy early time', () => {
    expect(resolveRunOutcome(100, 0)).toBe('running')
    expect(resolveRunOutcome(1, 59.99)).toBe('running')
  })

  it('lost when health is zero or below', () => {
    expect(resolveRunOutcome(0, 10)).toBe('lost')
    expect(resolveRunOutcome(-1, 10)).toBe('lost')
  })

  it('won at exact 60 with positive health', () => {
    expect(resolveRunOutcome(1, RUN_DURATION_SECONDS)).toBe('won')
    expect(resolveRunOutcome(50, 60.5)).toBe('won')
  })

  it('lost beats won when both conditions hold', () => {
    expect(resolveRunOutcome(0, 60)).toBe('lost')
    expect(resolveRunOutcome(0, 100)).toBe('lost')
  })
})

describe('clampDtToRunRemaining', () => {
  it('clamps overshoot so elapsed lands on 60', () => {
    expect(clampDtToRunRemaining(59.98, 0.05)).toBeCloseTo(0.02)
  })

  it('returns 0 when already at or past 60', () => {
    expect(clampDtToRunRemaining(60, 0.05)).toBe(0)
    expect(clampDtToRunRemaining(61, 1)).toBe(0)
  })

  it('rejects non-positive dt', () => {
    expect(clampDtToRunRemaining(10, 0)).toBe(0)
    expect(clampDtToRunRemaining(10, -1)).toBe(0)
    expect(clampDtToRunRemaining(10, Number.NaN)).toBe(0)
  })
})

describe('isRestartCode', () => {
  it('matches KeyR only', () => {
    expect(isRestartCode('KeyR')).toBe(true)
    expect(isRestartCode('KeyA')).toBe(false)
    expect(isRestartCode('Keyr')).toBe(false)
  })

  it('accepts only an unmodified physical R event', () => {
    const plain = {
      code: 'KeyR',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
    }
    expect(isPlainRestartEvent(plain)).toBe(true)
    expect(isPlainRestartEvent({ ...plain, ctrlKey: true })).toBe(false)
    expect(isPlainRestartEvent({ ...plain, metaKey: true })).toBe(false)
    expect(isPlainRestartEvent({ ...plain, altKey: true })).toBe(false)
    expect(isPlainRestartEvent({ ...plain, shiftKey: true })).toBe(false)
    expect(isPlainRestartEvent({ ...plain, code: 'KeyA' })).toBe(false)
  })
})

describe('updateGame outcome integration', () => {
  const world = computeWorldBounds(960, 540)
  const viewport = { width: 960, height: 540, dpr: 1 }
  const frameFor = (state: ReturnType<typeof createGameState>) => ({
    camera: computeCamera(state.player.x, state.player.y, world, viewport),
    viewport,
  })

  it('new state starts running at 0 time', () => {
    const state = createGameState(world)
    expect(state.outcome).toBe('running')
    expect(state.elapsedActiveSeconds).toBe(0)
  })

  it('precise win at 60 without overshooting elapsed', () => {
    const state = createGameState(world, createSequenceRng([]))
    state.elapsedActiveSeconds = 59.98
    updateGame(state, { x: 0, y: 0 }, 0.05, frameFor(state))
    expect(state.elapsedActiveSeconds).toBeCloseTo(60)
    expect(state.outcome).toBe('won')
  })

  it('does not advance past 60 on further updates', () => {
    const state = createGameState(world, createSequenceRng([]))
    state.elapsedActiveSeconds = 59.98
    updateGame(state, { x: 0, y: 0 }, 0.05, frameFor(state))
    const enemies = state.enemies.length
    const x = state.player.x
    updateGame(state, { x: 1, y: 0 }, 1, frameFor(state))
    expect(state.outcome).toBe('won')
    expect(state.elapsedActiveSeconds).toBeCloseTo(60)
    expect(state.player.x).toBe(x)
    expect(state.enemies.length).toBe(enemies)
  })

  it('pending upgrade freezes time so win cannot happen mid-choice', () => {
    const state = createGameState(world)
    state.elapsedActiveSeconds = 59.5
    state.pendingUpgrade = {
      options: [
        {
          id: 'swift',
          name: '迅捷',
          description: 'a',
          categoryId: 'stat',
        },
      ],
    }
    updateGame(state, { x: 0, y: 0 }, 1, frameFor(state))
    expect(state.elapsedActiveSeconds).toBe(59.5)
    expect(state.outcome).toBe('running')
  })

  it('lost when contact drops health to 0', () => {
    const state = createGameState(world, createSequenceRng([0, 0.5]))
    state.player = { ...state.player, health: CONTACT_DAMAGE }
    state.enemies = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: 20,
        speed: 0,
        health: 10,
        maxHealth: 10,
      },
    ]
    state.contactCooldownRemaining = 0
    updateGame(state, { x: 0, y: 0 }, 0.05, frameFor(state))
    expect(state.player.health).toBe(0)
    expect(state.outcome).toBe('lost')
    expect(state.pendingUpgrade).toBeNull()
  })

  it('lost with pending upgrade when health already 0', () => {
    const state = createGameState(world)
    state.player = { ...state.player, health: 0 }
    state.pendingUpgrade = {
      options: [
        {
          id: 'swift',
          name: '迅捷',
          description: 'a',
          categoryId: 'stat',
        },
      ],
    }
    updateGame(state, { x: 0, y: 0 }, 0.1, frameFor(state))
    expect(state.outcome).toBe('lost')
    expect(state.pendingUpgrade).toBeNull()
  })

  it('lost preferred over win same conditions', () => {
    const state = createGameState(world)
    state.player = { ...state.player, health: 0 }
    state.elapsedActiveSeconds = 60
    updateGame(state, { x: 0, y: 0 }, 0.1, frameFor(state))
    expect(state.outcome).toBe('lost')
  })

  it('terminal outcome is sticky', () => {
    const state = createGameState(world)
    state.outcome = 'won'
    state.elapsedActiveSeconds = 60
    state.player = { ...state.player, health: 0 }
    updateGame(state, { x: 0, y: 0 }, 1, frameFor(state))
    expect(state.outcome).toBe('won')
  })

  it('terminal early return clears a stale pending upgrade', () => {
    const state = createGameState(world)
    state.outcome = 'lost'
    state.pendingUpgrade = { options: [] }

    updateGame(state, { x: 0, y: 0 }, 1, frameFor(state))

    expect(state.outcome).toBe('lost')
    expect(state.pendingUpgrade).toBeNull()
  })
})

describe('restart creates full new run', () => {
  it('createGameState resets all counters and entities', () => {
    const b = createGameState(computeWorldBounds(800, 600))
    expect(b.outcome).toBe('running')
    expect(b.elapsedActiveSeconds).toBe(0)
    expect(b.defeatedCount).toBe(0)
    expect(b.nextEnemyId).toBe(1)
    expect(b.nextProjectileId).toBe(1)
    expect(b.nextGemId).toBe(1)
    expect(b.level).toBe(1)
    expect(b.experience).toBe(0)
    expect(b.enemies).toHaveLength(0)
    expect(b.projectiles).toHaveLength(0)
    expect(b.gems).toHaveLength(0)
    expect(b.pendingUpgrade).toBeNull()
    expect(b.progressionLevels).toEqual({})
    expect(b.player.x).toBeCloseTo(b.arena.width / 2)
    expect(b.player.health).toBe(b.player.maxHealth)
  })

  it('restart world uses current viewport size', () => {
    const small = computeWorldBounds(500, 400)
    const large = computeWorldBounds(2000, 1200)
    expect(large.width).toBeGreaterThan(small.width)
    expect(createGameState(large).arena.width).toBe(large.width)
  })
})

describe('outcome overlay layout', () => {
  it('centers restart button on viewport', () => {
    const vp = { width: 1000, height: 800 }
    const r = getRestartButtonRect(vp)
    expect(r.x + r.width / 2).toBeCloseTo(500)
    expect(
      restartButtonContainsPoint(vp, {
        x: r.x + r.width / 2,
        y: r.y + r.height / 2,
      }),
    ).toBe(true)
    expect(restartButtonContainsPoint(vp, { x: 0, y: 0 })).toBe(false)
  })

  it.each([
    { width: 120, height: 100 },
    { width: 1, height: 1 },
    { width: 320, height: 120 },
  ])('keeps the restart button inside viewport $width x $height', (vp) => {
    const r = getRestartButtonRect(vp)
    expect(r.x).toBeGreaterThanOrEqual(0)
    expect(r.y).toBeGreaterThanOrEqual(0)
    expect(r.x + r.width).toBeLessThanOrEqual(vp.width)
    expect(r.y + r.height).toBeLessThanOrEqual(vp.height)
  })
})
