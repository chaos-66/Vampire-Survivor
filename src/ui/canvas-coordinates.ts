/**
 * CSS 显示坐标 -> 逻辑屏幕坐标；升级卡片布局（屏幕空间）。
 * 升级 UI 使用视口逻辑尺寸，不使用世界尺寸，也不应用 camera offset。
 */

import type { Vec2 } from '../vec'

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type Size2 = {
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

/**
 * 升级卡片矩形：基于视口（屏幕）尺寸居中。
 */
export const getUpgradeCardRects = (
  viewport: Size2,
  optionCount = 3,
): Rect[] => {
  const count = Math.max(0, optionCount)
  if (count === 0) {
    return []
  }
  const cardWidth = Math.min(220, viewport.width * 0.28)
  const cardHeight = 120
  const gap = 16
  const totalWidth = cardWidth * count + gap * Math.max(0, count - 1)
  const startX = (viewport.width - totalWidth) / 2
  const y = viewport.height / 2 - cardHeight / 2
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * (cardWidth + gap),
    y,
    width: cardWidth,
    height: cardHeight,
  }))
}

/**
 * 命中测试：optionIds 必须来自 pendingUpgrade.options。
 */
export const upgradeIdAtPoint = (
  viewport: Size2,
  point: Vec2,
  optionIds: readonly string[],
): string | null => {
  const rects = getUpgradeCardRects(viewport, optionIds.length)
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