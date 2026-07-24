/**
 * 世界边界（世界坐标空间）。
 * 注意：`Arena` 类型名在历史代码中保留，语义是世界尺寸，不是 Canvas 视口。
 *
 * 世界在 run 创建时按初始视口计算并固定：
 * width = max(12000, initialViewport.width * 10)
 * height = max(7000, initialViewport.height * 10)
 * run 内 resize 只改视口/相机，不改世界。
 */

import type { Arena } from '../movement'

/** 世界宽高下限（逻辑单位 / CSS 像素）。 */
export const WORLD_MIN_WIDTH = 12000
export const WORLD_MIN_HEIGHT = 7000
/** 相对初始视口的倍数下限。 */
export const WORLD_VIEWPORT_MULTIPLIER = 10

export type WorldBounds = Arena

/**
 * 由 run 开始时的逻辑视口计算固定世界尺寸。
 */
export const computeWorldBounds = (
  initialViewportWidth: number,
  initialViewportHeight: number,
): WorldBounds => {
  const vw = Number.isFinite(initialViewportWidth)
    ? Math.max(1, initialViewportWidth)
    : 1
  const vh = Number.isFinite(initialViewportHeight)
    ? Math.max(1, initialViewportHeight)
    : 1
  return {
    width: Math.max(WORLD_MIN_WIDTH, vw * WORLD_VIEWPORT_MULTIPLIER),
    height: Math.max(WORLD_MIN_HEIGHT, vh * WORLD_VIEWPORT_MULTIPLIER),
  }
}