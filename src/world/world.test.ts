import { describe, expect, it } from 'vitest'

import {
  computeWorldBounds,
  WORLD_MIN_HEIGHT,
  WORLD_MIN_WIDTH,
  WORLD_VIEWPORT_MULTIPLIER,
} from './world'
import {
  createViewport,
  computeBackingStoreSize,
  MAX_DEVICE_PIXEL_RATIO,
} from './viewport'
import { computeCamera } from './camera'
import { worldToScreen, screenToWorld } from './coordinates'
import { viewRectFromCamera } from './frame-context'
import {
  spawnPositionOutsideView,
  SPAWN_VIEW_MARGIN,
  advanceSpawns,
} from '../combat/enemy-system'
import { getUpgradeCardRects, upgradeIdAtPoint } from '../ui/canvas-coordinates'
import { PLAYER_SPEED } from '../core/constants'
import { clampPlayerToArena, stepPlayer } from '../movement'
import {
  createGameState,
  createSequenceRng,
  updateGame,
} from '../game'

describe('world size', () => {
  it('uses floor when viewport is small', () => {
    const w = computeWorldBounds(800, 600)
    expect(w.width).toBe(WORLD_MIN_WIDTH)
    expect(w.height).toBe(WORLD_MIN_HEIGHT)
  })

  it('is at least 10x viewport when viewport is large', () => {
    const w = computeWorldBounds(2000, 1200)
    expect(w.width).toBe(2000 * WORLD_VIEWPORT_MULTIPLIER)
    expect(w.height).toBe(1200 * WORLD_VIEWPORT_MULTIPLIER)
  })

  it('is finite and positive', () => {
    const w = computeWorldBounds(Number.NaN, -10)
    expect(w.width).toBeGreaterThan(0)
    expect(w.height).toBeGreaterThan(0)
    expect(Number.isFinite(w.width)).toBe(true)
  })
})

describe('player spawn and world bounds', () => {
  it('starts at world center', () => {
    const world = computeWorldBounds(960, 540)
    const state = createGameState(world)
    expect(state.player.x).toBeCloseTo(world.width / 2)
    expect(state.player.y).toBeCloseTo(world.height / 2)
  })

  it('cannot cross world edges', () => {
    const world = { width: 1000, height: 800 }
    let player = { x: 20, y: 20, radius: 16 }
    player = clampPlayerToArena(
      stepPlayer(player, { x: -1, y: -1 }, PLAYER_SPEED, 10, world),
      world,
    )
    expect(player.x).toBe(16)
    expect(player.y).toBe(16)
  })

  it('can travel farther than one viewport', () => {
    const world = computeWorldBounds(960, 540)
    const state = createGameState(world)
    const startX = state.player.x
    const viewport = { width: 960, height: 540, dpr: 1 }
    for (let i = 0; i < 200; i += 1) {
      const camera = computeCamera(
        state.player.x,
        state.player.y,
        world,
        viewport,
      )
      updateGame(state, { x: 1, y: 0 }, 0.05, { camera, viewport })
    }
    expect(state.player.x - startX).toBeGreaterThan(960)
  })
})

describe('camera', () => {
  const world = { width: 12000, height: 7000 }
  const viewport = { width: 960, height: 540, dpr: 1 }

  it('centers player in middle of world', () => {
    const cam = computeCamera(6000, 3500, world, viewport)
    expect(cam.x).toBeCloseTo(6000 - 480)
    expect(cam.y).toBeCloseTo(3500 - 270)
    expect(cam.width).toBe(960)
    expect(cam.height).toBe(540)
  })

  it('clamps to top-left', () => {
    const cam = computeCamera(10, 10, world, viewport)
    expect(cam.x).toBe(0)
    expect(cam.y).toBe(0)
  })

  it('clamps to bottom-right', () => {
    const cam = computeCamera(11990, 6990, world, viewport)
    expect(cam.x).toBeCloseTo(world.width - viewport.width)
    expect(cam.y).toBeCloseTo(world.height - viewport.height)
  })

  it('handles viewport larger than world without non-finite values', () => {
    const cam = computeCamera(
      100,
      100,
      { width: 400, height: 300 },
      { width: 800, height: 600, dpr: 1 },
    )
    expect(Number.isFinite(cam.x)).toBe(true)
    expect(Number.isFinite(cam.y)).toBe(true)
  })
})

describe('coordinates', () => {
  const camera = { x: 100, y: 50, width: 960, height: 540 }

  it('worldToScreen subtracts camera', () => {
    expect(worldToScreen({ x: 150, y: 80 }, camera)).toEqual({ x: 50, y: 30 })
  })

  it('screenToWorld is inverse', () => {
    const w = { x: 500, y: 400 }
    const s = worldToScreen(w, camera)
    const back = screenToWorld(s, camera)
    expect(back.x).toBeCloseTo(w.x)
    expect(back.y).toBeCloseTo(w.y)
  })

  it('identity at camera 0,0', () => {
    const cam = { x: 0, y: 0, width: 100, height: 100 }
    expect(worldToScreen({ x: 12, y: 34 }, cam)).toEqual({ x: 12, y: 34 })
  })

  it('does not mutate input', () => {
    const p = { x: 1, y: 2 }
    worldToScreen(p, camera)
    expect(p).toEqual({ x: 1, y: 2 })
  })
})

describe('viewport and dpr', () => {
  it('dpr 1 and 2', () => {
    const v1 = createViewport(800, 600, 1)
    expect(v1.dpr).toBe(1)
    expect(computeBackingStoreSize(v1)).toEqual({ width: 800, height: 600 })
    const v2 = createViewport(800, 600, 2)
    expect(v2.dpr).toBe(2)
    expect(computeBackingStoreSize(v2)).toEqual({ width: 1600, height: 1200 })
  })

  it('clamps dpr to max', () => {
    const v = createViewport(100, 100, 5)
    expect(v.dpr).toBe(MAX_DEVICE_PIXEL_RATIO)
  })

  it('safe for invalid sizes', () => {
    const v = createViewport(0, Number.NaN, -1)
    expect(v.width).toBeGreaterThanOrEqual(1)
    expect(v.height).toBeGreaterThanOrEqual(1)
    expect(v.dpr).toBeGreaterThan(0)
  })
})

describe('off-view spawn', () => {
  const world = { width: 2000, height: 1500 }
  const view = { left: 400, top: 300, right: 1360, bottom: 840 }

  it('spawns outside view and inside world', () => {
    const rng = createSequenceRng([
      0, 0.5, 0.25, 0.5, 0.5, 0.5, 0.75, 0.2, 0.1, 0.9, 0.3, 0.4, 0.6, 0.7,
      0.15, 0.85, 0.2, 0.8, 0.45, 0.55, 0.05, 0.95, 0.35, 0.65, 0.12, 0.88,
      0.22, 0.78, 0.42, 0.58, 0.08, 0.92, 0.18, 0.82, 0.28, 0.72, 0.38, 0.62,
      0.48, 0.52,
    ])
    for (let i = 0; i < 20; i += 1) {
      const p = spawnPositionOutsideView({
        world,
        view,
        margin: SPAWN_VIEW_MARGIN,
        player: {
          x: 880,
          y: 570,
          radius: 16,
          health: 1,
          maxHealth: 1,
          moveSpeed: 1,
          attackCooldown: 1,
          projectileDamage: 1,
          characterId: 'x',
          weapons: [],
        },
        rng,
      })
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(world.width)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(world.height)
      const inside =
        p.x >= view.left &&
        p.x <= view.right &&
        p.y >= view.top &&
        p.y <= view.bottom
      expect(inside).toBe(false)
    }
  })

  it('same rng sequence is repeatable', () => {
    const seq = [0.1, 0.2, 0.3, 0.4]
    const makePlayer = () => ({
      x: 0,
      y: 0,
      radius: 1,
      health: 1,
      maxHealth: 1,
      moveSpeed: 1,
      attackCooldown: 1,
      projectileDamage: 1,
      characterId: '',
      weapons: [] as [],
    })
    const a = spawnPositionOutsideView({
      world,
      view,
      margin: 40,
      player: makePlayer(),
      rng: createSequenceRng(seq),
    })
    const b = spawnPositionOutsideView({
      world,
      view,
      margin: 40,
      player: makePlayer(),
      rng: createSequenceRng(seq),
    })
    expect(a).toEqual(b)
  })

  it('advanceSpawns with view uses off-view path', () => {
    const worldLocal = { width: 2000, height: 1500 }
    const state = createGameState(
      worldLocal,
      createSequenceRng([0, 0.5, 0.5, 0.5, 0.2, 0.3]),
    )
    const camera = computeCamera(state.player.x, state.player.y, worldLocal, {
      width: 400,
      height: 300,
      dpr: 1,
    })
    advanceSpawns(state, 1.1, viewRectFromCamera(camera), state.player)
    expect(state.enemies.length).toBeGreaterThanOrEqual(1)
    const e = state.enemies[0]
    const vr = viewRectFromCamera(camera)
    const inside =
      e.x >= vr.left && e.x <= vr.right && e.y >= vr.top && e.y <= vr.bottom
    expect(inside).toBe(false)
  })
})

describe('upgrade layout uses viewport size', () => {
  it('cards and hit test follow viewport not world', () => {
    const viewport = { width: 800, height: 600 }
    const ids = ['swift', 'haste', 'power']
    const rects = getUpgradeCardRects(viewport, 3)
    expect(rects[0].x).toBeGreaterThan(0)
    const mid = {
      x: rects[1].x + rects[1].width / 2,
      y: rects[1].y + rects[1].height / 2,
    }
    expect(upgradeIdAtPoint(viewport, mid, ids)).toBe('haste')
  })
})