import { describe, expect, it } from 'vitest'

import {
  clampDeltaSeconds,
  clampPlayerToArena,
  createPlayer,
  MAX_DELTA_SECONDS,
  PLAYER_SPEED,
  stepPlayer,
  type Arena,
  type Player,
} from './movement'
import { normalize } from './vec'

const arena: Arena = { width: 960, height: 540 }

const centerPlayer = (radius = 16): Player => createPlayer(arena, radius)

describe('delta time movement', () => {
  it('moves proportionally to delta time at fixed speed and input', () => {
    const dir = { x: 1, y: 0 }
    const a = stepPlayer(centerPlayer(), dir, PLAYER_SPEED, 0.1, arena)
    const b = stepPlayer(centerPlayer(), dir, PLAYER_SPEED, 0.2, arena)
    const dxA = a.x - centerPlayer().x
    const dxB = b.x - centerPlayer().x
    expect(dxB).toBeCloseTo(dxA * 2)
    expect(dxA).toBeCloseTo(PLAYER_SPEED * 0.1)
  })

  it('does not move when direction is zero', () => {
    const start = centerPlayer()
    const next = stepPlayer(start, { x: 0, y: 0 }, PLAYER_SPEED, 1, arena)
    expect(next).toEqual(start)
  })

  it('matches two small steps with one large step away from bounds', () => {
    const dir = normalize({ x: 1, y: 1 })
    const start = centerPlayer()
    const oneStep = stepPlayer(start, dir, PLAYER_SPEED, 0.2, arena)
    const twoSteps = stepPlayer(
      stepPlayer(start, dir, PLAYER_SPEED, 0.1, arena),
      dir,
      PLAYER_SPEED,
      0.1,
      arena,
    )
    expect(twoSteps.x).toBeCloseTo(oneStep.x)
    expect(twoSteps.y).toBeCloseTo(oneStep.y)
  })

  it('uses normalized diagonal so speed is not ~sqrt(2) times axis speed', () => {
    const dt = 0.1
    const axis = stepPlayer(centerPlayer(), { x: 1, y: 0 }, PLAYER_SPEED, dt, arena)
    const diagDir = normalize({ x: 1, y: 1 })
    const diag = stepPlayer(centerPlayer(), diagDir, PLAYER_SPEED, dt, arena)
    const axisDist = Math.hypot(axis.x - centerPlayer().x, axis.y - centerPlayer().y)
    const diagDist = Math.hypot(diag.x - centerPlayer().x, diag.y - centerPlayer().y)
    expect(diagDist).toBeCloseTo(axisDist)
    expect(diagDist).toBeCloseTo(PLAYER_SPEED * dt)
  })
})

describe('arena bounds', () => {
  it('cannot cross the left edge (radius considered)', () => {
    const player: Player = { x: 20, y: 200, radius: 16 }
    const next = stepPlayer(player, { x: -1, y: 0 }, PLAYER_SPEED, 10, arena)
    expect(next.x).toBe(player.radius)
  })

  it('cannot cross the right edge (radius considered)', () => {
    const player: Player = { x: 900, y: 200, radius: 16 }
    const next = stepPlayer(player, { x: 1, y: 0 }, PLAYER_SPEED, 10, arena)
    expect(next.x).toBe(arena.width - player.radius)
  })

  it('cannot cross the top edge (radius considered)', () => {
    const player: Player = { x: 200, y: 20, radius: 16 }
    const next = stepPlayer(player, { x: 0, y: -1 }, PLAYER_SPEED, 10, arena)
    expect(next.y).toBe(player.radius)
  })

  it('cannot cross the bottom edge (radius considered)', () => {
    const player: Player = { x: 200, y: 500, radius: 16 }
    const next = stepPlayer(player, { x: 0, y: 1 }, PLAYER_SPEED, 10, arena)
    expect(next.y).toBe(arena.height - player.radius)
  })

  it('clampPlayerToArena respects radius on all sides', () => {
    const clamped = clampPlayerToArena(
      { x: -50, y: 9999, radius: 12 },
      arena,
    )
    expect(clamped.x).toBe(12)
    expect(clamped.y).toBe(arena.height - 12)
  })
})

describe('delta clamp', () => {
  it('caps oversized delta to MAX_DELTA_SECONDS', () => {
    expect(clampDeltaSeconds(5)).toBe(MAX_DELTA_SECONDS)
  })

  it('passes through small positive deltas', () => {
    expect(clampDeltaSeconds(0.016)).toBeCloseTo(0.016)
  })

  it('treats negative or non-finite delta as zero', () => {
    expect(clampDeltaSeconds(-1)).toBe(0)
    expect(clampDeltaSeconds(Number.NaN)).toBe(0)
  })

  it('step with capped delta does not jump by the full hang duration', () => {
    const start = centerPlayer()
    const rawDt = 2
    const capped = clampDeltaSeconds(rawDt)
    const moved = stepPlayer(start, { x: 1, y: 0 }, PLAYER_SPEED, capped, arena)
    expect(moved.x - start.x).toBeCloseTo(PLAYER_SPEED * MAX_DELTA_SECONDS)
    expect(moved.x - start.x).toBeLessThan(PLAYER_SPEED * rawDt)
  })
})
