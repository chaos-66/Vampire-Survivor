import { describe, expect, it } from 'vitest'

import { advanceProjectiles } from './combat/projectile-system'
import type { Enemy, Projectile } from './combat/enemy-types'
import { createGameState } from './core/game-state'
import { ensureContentRegistered } from './content/bootstrap'
import { spawnExperienceDropsAt } from './progression/experience-system'
import type { Drop } from './drops/drop-types'
import { drawWorld } from './ui/draw-world'
import { circleIntersectsView } from './world/frame-context'
import { DEFAULT_ENEMY_ID } from './content/enemies/default-enemy'

describe('批量经验掉落', () => {
  it('一次追加大量掉落并保持现有实体和连续 ID', () => {
    ensureContentRegistered()
    const existing: Drop[] = Array.from({ length: 5000 }, (_, id) => ({
      id,
      definitionId: 'experience_drop',
      x: id,
      y: 0,
      radius: 8,
    }))
    const points = Array.from({ length: 1000 }, (_, index) => ({
      x: index * 2,
      y: index * 3,
    }))

    const result = spawnExperienceDropsAt(existing, 5000, points)

    expect(result.drops).toHaveLength(6000)
    expect(result.drops[0]).toBe(existing[0])
    expect(result.drops.slice(5000).map((drop) => drop.id)).toEqual(
      Array.from({ length: 1000 }, (_, index) => 5000 + index),
    )
    expect(result.nextDropId).toBe(6000)
  })

  it('空批次不复制现有数组', () => {
    ensureContentRegistered()
    const existing: Drop[] = [
      { id: 1, definitionId: 'experience_drop', x: 1, y: 2, radius: 8 },
    ]
    const result = spawnExperienceDropsAt(existing, 2, [])
    expect(result.drops).toBe(existing)
    expect(result.nextDropId).toBe(2)
  })
})

describe('投射物运行时顺序', () => {
  it('每帧复用按 ID 排序的敌人并保持一弹一伤', () => {
    const enemies: Enemy[] = [
      { id: 2, definitionId: DEFAULT_ENEMY_ID, x: 101, y: 100, radius: 10, speed: 0, health: 1, maxHealth: 1 },
      { id: 1, definitionId: DEFAULT_ENEMY_ID, x: 100, y: 100, radius: 10, speed: 0, health: 1, maxHealth: 1 },
    ]
    const projectiles: Projectile[] = [
      { id: 2, x: 100.5, y: 100, vx: 0, vy: 0, radius: 2, damage: 1, lifeRemaining: 1 },
      { id: 1, x: 100.5, y: 100, vx: 0, vy: 0, radius: 2, damage: 1, lifeRemaining: 1 },
    ]

    const result = advanceProjectiles(
      projectiles,
      enemies,
      { width: 1000, height: 1000 },
      0,
    )

    expect(result.projectiles).toHaveLength(0)
    expect(result.enemies).toHaveLength(0)
    expect(result.kills).toEqual([
      { x: 100, y: 100, definitionId: DEFAULT_ENEMY_ID },
      { x: 101, y: 100, definitionId: DEFAULT_ENEMY_ID },
    ])
  })

  it('保留输入中本来已经失去生命的实体', () => {
    const dead: Enemy = {
      id: 1,
      definitionId: DEFAULT_ENEMY_ID,
      x: 10,
      y: 10,
      radius: 5,
      speed: 0,
      health: 0,
      maxHealth: 1,
    }
    const result = advanceProjectiles([], [dead], { width: 100, height: 100 }, 0)
    expect(result.enemies).toEqual([dead])
  })

  it('保持重复敌人 ID 由最后一项覆盖的既有语义', () => {
    const first: Enemy = {
      id: 1,
      definitionId: DEFAULT_ENEMY_ID,
      x: 10,
      y: 10,
      radius: 5,
      speed: 0,
      health: 1,
      maxHealth: 1,
    }
    const last = { ...first, x: 20 }
    const result = advanceProjectiles(
      [],
      [first, last],
      { width: 100, height: 100 },
      0,
    )
    expect(result.enemies).toEqual([last])
  })
})

describe('可见绘制裁剪', () => {
  const view = { left: 100, top: 50, right: 300, bottom: 150 }

  it('包含内部、边缘接触和边距范围，排除完全位于外部的圆', () => {
    expect(circleIntersectsView({ x: 150, y: 100, radius: 5 }, view)).toBe(true)
    expect(circleIntersectsView({ x: 95, y: 100, radius: 5 }, view)).toBe(true)
    expect(circleIntersectsView({ x: 94, y: 100, radius: 5 }, view)).toBe(false)
    expect(circleIntersectsView({ x: 90, y: 100, radius: 5 }, view, 5)).toBe(true)
  })

  it('精确排除视口角点外的圆并包含角点相切', () => {
    expect(circleIntersectsView({ x: 96, y: 46, radius: 5 }, view)).toBe(false)
    expect(circleIntersectsView({ x: 97, y: 46, radius: 5 }, view)).toBe(true)
  })

  it('大量屏幕外实体不触发实体绘制且不会从状态中删除', () => {
    const game = createGameState({ width: 12000, height: 7000 })
    const camera = {
      x: game.player.x - 100,
      y: game.player.y - 50,
      width: 200,
      height: 100,
    }
    const viewport = { width: 200, height: 100, dpr: 1 }
    const far = 1000
    game.drops = Array.from({ length: far }, (_, id) => ({
      id,
      definitionId: 'experience_drop',
      x: 0,
      y: 0,
      radius: 8,
    }))
    game.enemies = Array.from({ length: far }, (_, id) => ({
      id,
      definitionId: DEFAULT_ENEMY_ID,
      x: 0,
      y: 0,
      radius: 14,
      speed: 0,
      health: 1,
      maxHealth: 1,
    }))
    game.projectiles = Array.from({ length: far }, (_, id) => ({
      id,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 5,
      damage: 1,
      lifeRemaining: 1,
    }))
    game.drops.push({ id: far, definitionId: 'experience_drop', x: game.player.x, y: game.player.y, radius: 8 })
    game.enemies.push({ id: far, definitionId: DEFAULT_ENEMY_ID, x: game.player.x, y: game.player.y, radius: 14, speed: 0, health: 1, maxHealth: 1 })
    game.projectiles.push({ id: far, x: game.player.x, y: game.player.y, vx: 0, vy: 0, radius: 5, damage: 1, lifeRemaining: 1 })

    let arcCalls = 0
    let fillRectCalls = 0
    const context = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      beginPath: () => undefined,
      arc: () => { arcCalls += 1 },
      fill: () => undefined,
      fillRect: () => { fillRectCalls += 1 },
      moveTo: () => undefined,
      lineTo: () => undefined,
      stroke: () => undefined,
      strokeRect: () => undefined,
    } as unknown as CanvasRenderingContext2D

    drawWorld(context, game, camera, viewport, 0)

    // 玩家外缘、前向内核、内嵌高光弧 + 掉落、敌人、投射物 = 6 次 arc
    expect(arcCalls).toBe(6)
    expect(fillRectCalls).toBe(3)
    expect(game.drops).toHaveLength(far + 1)
    expect(game.enemies).toHaveLength(far + 1)
    expect(game.projectiles).toHaveLength(far + 1)
  })

  it('只绘制可见世界物体且不修改状态', () => {
    const game = createGameState({ width: 12000, height: 7000 })
    const camera = {
      x: game.player.x - 100,
      y: game.player.y - 50,
      width: 200,
      height: 100,
    }
    const viewport = { width: 200, height: 100, dpr: 1 }
    game.worldObjects = [
      { id: 1, x: game.player.x, y: game.player.y, width: 20, height: 20, blocksMovement: true },
      { id: 2, x: 0, y: 0, width: 20, height: 20, blocksMovement: true },
    ]
    const before = game.worldObjects.map((object) => ({ ...object }))
    let objectFillCalls = 0
    const context = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      beginPath: () => undefined,
      arc: () => undefined,
      fill: () => undefined,
      fillRect: (_x: number, _y: number, width: number, height: number) => {
        if (width === 20 && height === 20) {
          objectFillCalls += 1
        }
      },
      moveTo: () => undefined,
      lineTo: () => undefined,
      stroke: () => undefined,
      strokeRect: () => undefined,
    } as unknown as CanvasRenderingContext2D

    drawWorld(context, game, camera, viewport, 0)

    expect(objectFillCalls).toBe(1)
    expect(game.worldObjects).toEqual(before)
  })
})
