/**
 * 相机：仅决定“看到哪里”，不参与模拟/碰撞。
 * x/y 为视口左上角对应的世界坐标；宽高等于逻辑视口。
 *
 * 远离边界时玩家尽量居中；靠近边界时钳制，不显示世界外区域。
 * 视口大于世界时安全居中，不产生负数异常。
 */

import type { WorldBounds } from './world'
import type { Viewport } from './viewport'

export type Camera = {
  x: number
  y: number
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number): number => {
  if (max < min) {
    return min
  }
  return Math.min(Math.max(value, min), max)
}

/**
 * 由玩家世界坐标与视口计算相机（直接跟随，无平滑）。
 */
export const computeCamera = (
  playerX: number,
  playerY: number,
  world: WorldBounds,
  viewport: Viewport,
): Camera => {
  const width = Math.max(1, viewport.width)
  const height = Math.max(1, viewport.height)
  const maxX = world.width - width
  const maxY = world.height - height

  let x: number
  let y: number
  if (maxX < 0) {
    x = (world.width - width) / 2
  } else {
    x = clamp(playerX - width / 2, 0, maxX)
  }
  if (maxY < 0) {
    y = (world.height - height) / 2
  } else {
    y = clamp(playerY - height / 2, 0, maxY)
  }

  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    width,
    height,
  }
}