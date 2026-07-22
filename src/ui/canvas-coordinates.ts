/**
 * CSS 显示坐标 → Canvas 逻辑坐标。
 * 逻辑世界为 960×540；CSS 只做缩放，不改变模拟。
 *
 * 升级卡片命中必须使用当前 pending 显示的 option IDs，
 * 不得用全局注册表顺序替代画面顺序。
 */

import type { Vec2 } from '../vec'
import type { Arena } from '../movement'

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export const cssPointToLogical = (
  clientX: number,
  clientY: number,
  canvasRect: { left: number; top: number; width: number; height: number },
  logicalWidth: number,
  logicalHeight: number,
): Vec2 => {
  const scaleX = logicalWidth / canvasRect.width
  const scaleY = logicalHeight / canvasRect.height
  return {
    x: (clientX - canvasRect.left) * scaleX,
    y: (clientY - canvasRect.top) * scaleY,
  }
}

export const getUpgradeCardRects = (
  arena: Arena,
  optionCount = 3,
): Rect[] => {
  const count = Math.max(0, optionCount)
  if (count === 0) {
    return []
  }
  const cardWidth = Math.min(220, arena.width * 0.28)
  const cardHeight = 120
  const gap = 16
  const totalWidth = cardWidth * count + gap * Math.max(0, count - 1)
  const startX = (arena.width - totalWidth) / 2
  const y = arena.height / 2 - cardHeight / 2
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * (cardWidth + gap),
    y,
    width: cardWidth,
    height: cardHeight,
  }))
}

/**
 * 按当前 pending 选项顺序命中卡片。
 * optionIds 必须来自 game.pendingUpgrade.options 的 id 列表。
 */
export const upgradeIdAtPoint = (
  arena: Arena,
  point: Vec2,
  optionIds: readonly string[],
): string | null => {
  const rects = getUpgradeCardRects(arena, optionIds.length)
  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i]
    if (
      point.x >= r.x &&
      point.x <= r.x + r.width &&
      point.y >= r.y &&
      point.y <= r.y + r.height
    ) {
      return optionIds[i] ?? null
    }
  }
  return null
}