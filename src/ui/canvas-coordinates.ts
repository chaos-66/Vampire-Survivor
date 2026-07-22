/**
 * CSS 显示坐标 → Canvas 逻辑坐标。
 * 逻辑世界为 960×540；CSS 只做缩放，不改变模拟。
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

export const getUpgradeCardRects = (arena: Arena): Rect[] => {
  const cardWidth = Math.min(220, arena.width * 0.28)
  const cardHeight = 120
  const gap = 16
  const totalWidth = cardWidth * 3 + gap * 2
  const startX = (arena.width - totalWidth) / 2
  const y = arena.height / 2 - cardHeight / 2
  return [0, 1, 2].map((i) => ({
    x: startX + i * (cardWidth + gap),
    y,
    width: cardWidth,
    height: cardHeight,
  }))
}

/** 按当前 pending 选项顺序命中卡片，不硬编码升级 id。 */
export const upgradeIdAtPoint = (
  arena: Arena,
  point: Vec2,
  optionIds: readonly string[],
): string | null => {
  const rects = getUpgradeCardRects(arena)
  for (let i = 0; i < rects.length && i < optionIds.length; i += 1) {
    const r = rects[i]
    if (
      point.x >= r.x &&
      point.x <= r.x + r.width &&
      point.y >= r.y &&
      point.y <= r.y + r.height
    ) {
      return optionIds[i]
    }
  }
  return null
}