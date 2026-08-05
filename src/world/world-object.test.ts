import { describe, expect, it } from 'vitest'

import {
  circleIntersectsWorldObject,
  createStaticWorldObjects,
  queryVisibleWorldObjects,
  worldObjectIntersectsView,
  type WorldObject,
} from './world-object'
import { movePlayerAroundObstacles } from './obstacle-collision'

const arena = { width: 1000, height: 800 }
const player = { x: 500, y: 400, radius: 16 }
const obstacle: WorldObject = {
  id: 1,
  x: 400,
  y: 300,
  width: 100,
  height: 200,
  blocksMovement: true,
}

describe('静态世界物体布局', () => {
  it('创建固定、连续 ID、位于世界内且避开初始玩家的布局', () => {
    const first = createStaticWorldObjects(arena, player)
    const second = createStaticWorldObjects(arena, player)

    expect(first).toEqual(second)
    expect(first.map((object) => object.id)).toEqual(
      first.map((_, index) => index + 1),
    )
    expect(first.length).toBeGreaterThan(0)
    for (const object of first) {
      expect(object.x).toBeGreaterThanOrEqual(0)
      expect(object.y).toBeGreaterThanOrEqual(0)
      expect(object.x + object.width).toBeLessThanOrEqual(arena.width)
      expect(object.y + object.height).toBeLessThanOrEqual(arena.height)
      expect(circleIntersectsWorldObject(player, object)).toBe(false)
    }
  })

  it('极小世界安全返回空布局', () => {
    expect(
      createStaticWorldObjects(
        { width: 32, height: 32 },
        { x: 16, y: 16, radius: 16 },
      ),
    ).toEqual([])
  })
})

describe('玩家障碍碰撞', () => {
  it.each([
    [{ x: 300, y: 400, radius: 16 }, { x: 600, y: 400, radius: 16 }, 384, 400],
    [{ x: 600, y: 400, radius: 16 }, { x: 300, y: 400, radius: 16 }, 516, 400],
    [{ x: 450, y: 200, radius: 16 }, { x: 450, y: 600, radius: 16 }, 450, 284],
    [{ x: 450, y: 600, radius: 16 }, { x: 450, y: 200, radius: 16 }, 450, 516],
  ])('从四边阻止大步长穿透', (start, target, expectedX, expectedY) => {
    const result = movePlayerAroundObstacles(start, target, arena, [obstacle])
    expect(result.x).toBeCloseTo(expectedX)
    expect(result.y).toBeCloseTo(expectedY)
    expect(circleIntersectsWorldObject(result, obstacle)).toBe(true)
  })

  it('对角移动在阻挡轴停止并沿另一轴滑动', () => {
    const result = movePlayerAroundObstacles(
      { x: 300, y: 280, radius: 16 },
      { x: 600, y: 360, radius: 16 },
      arena,
      [obstacle],
    )
    expect(result.x).toBe(384)
    expect(result.y).toBeGreaterThan(300)
  })

  it('非障碍物体不阻挡玩家', () => {
    const result = movePlayerAroundObstacles(
      { x: 300, y: 400, radius: 16 },
      { x: 600, y: 400, radius: 16 },
      arena,
      [{ ...obstacle, blocksMovement: false }],
    )
    expect(result.x).toBeCloseTo(600)
  })

  it('无效目标保持有限且位于世界内', () => {
    const result = movePlayerAroundObstacles(
      player,
      { ...player, x: Number.NaN, y: Number.POSITIVE_INFINITY },
      arena,
      [obstacle],
    )
    expect(result).toEqual(player)
  })
})

describe('世界物体可见查询', () => {
  const view = { left: 100, top: 100, right: 300, bottom: 250 }

  it('包含内部、边缘接触和绘制边距，排除完全位于外部的矩形', () => {
    expect(
      worldObjectIntersectsView(
        { x: 150, y: 150, width: 20, height: 20 },
        view,
      ),
    ).toBe(true)
    expect(
      worldObjectIntersectsView(
        { x: 300, y: 150, width: 20, height: 20 },
        view,
      ),
    ).toBe(true)
    expect(
      worldObjectIntersectsView(
        { x: 321, y: 150, width: 20, height: 20 },
        view,
        20,
      ),
    ).toBe(false)
    expect(
      worldObjectIntersectsView(
        { x: 320, y: 150, width: 20, height: 20 },
        view,
        20,
      ),
    ).toBe(true)
  })

  it('保持输入顺序和对象身份且不修改输入', () => {
    const visible = { ...obstacle, id: 2, x: 120, y: 120 }
    const hidden = { ...obstacle, id: 1, x: 600, y: 600 }
    const objects = [hidden, visible]
    const result = queryVisibleWorldObjects(objects, view)

    expect(result).toEqual([visible])
    expect(result[0]).toBe(visible)
    expect(objects).toEqual([hidden, visible])
  })
})
