import type { Player, Arena } from '../movement'
import type { ViewRect } from './frame-context'

/** 当前检查点的静态矩形世界物体。 */
export type WorldObject = {
  id: number
  x: number
  y: number
  width: number
  height: number
  blocksMovement: boolean
}

const DEFAULT_OBJECT_WIDTH = 56
const DEFAULT_OBJECT_HEIGHT = 176
const DEFAULT_OBJECT_OFFSET = 220

/** 按世界中心创建固定布局；空间不足时只保留安全且位于世界内的物体。 */
export const createStaticWorldObjects = (
  world: Arena,
  player: Player,
): WorldObject[] => {
  const centerX = world.width / 2
  const centerY = world.height / 2
  const candidates: Omit<WorldObject, 'id'>[] = [
    {
      x: centerX + DEFAULT_OBJECT_OFFSET,
      y: centerY - DEFAULT_OBJECT_OFFSET,
      width: DEFAULT_OBJECT_WIDTH,
      height: DEFAULT_OBJECT_HEIGHT,
      blocksMovement: true,
    },
    {
      x: centerX - DEFAULT_OBJECT_OFFSET - DEFAULT_OBJECT_WIDTH,
      y: centerY + DEFAULT_OBJECT_OFFSET - DEFAULT_OBJECT_HEIGHT,
      width: DEFAULT_OBJECT_WIDTH,
      height: DEFAULT_OBJECT_HEIGHT,
      blocksMovement: true,
    },
    {
      x: centerX - DEFAULT_OBJECT_HEIGHT / 2,
      y: centerY + DEFAULT_OBJECT_OFFSET,
      width: DEFAULT_OBJECT_HEIGHT,
      height: DEFAULT_OBJECT_WIDTH,
      blocksMovement: true,
    },
  ]

  return candidates
    .filter(
      (object) =>
        object.x >= 0 &&
        object.y >= 0 &&
        object.x + object.width <= world.width &&
        object.y + object.height <= world.height &&
        !circleIntersectsWorldObject(player, object),
    )
    .map((object, index) => ({ id: index + 1, ...object }))
}

export const circleIntersectsWorldObject = (
  circle: Player,
  object: Pick<WorldObject, 'x' | 'y' | 'width' | 'height'>,
): boolean => {
  const nearestX = Math.max(object.x, Math.min(circle.x, object.x + object.width))
  const nearestY = Math.max(object.y, Math.min(circle.y, object.y + object.height))
  const dx = circle.x - nearestX
  const dy = circle.y - nearestY
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

export const worldObjectIntersectsView = (
  object: Pick<WorldObject, 'x' | 'y' | 'width' | 'height'>,
  view: ViewRect,
  margin = 0,
): boolean => {
  const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0
  return (
    object.x + object.width + safeMargin >= view.left &&
    object.x - safeMargin <= view.right &&
    object.y + object.height + safeMargin >= view.top &&
    object.y - safeMargin <= view.bottom
  )
}

export const queryVisibleWorldObjects = (
  objects: readonly WorldObject[],
  view: ViewRect,
  margin = 0,
): WorldObject[] =>
  objects.filter((object) => worldObjectIntersectsView(object, view, margin))
