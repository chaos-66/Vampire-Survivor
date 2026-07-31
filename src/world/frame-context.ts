/**
 * 单帧纯数据上下文：传给 updateGame / 刷怪，不依赖 DOM。
 */

import type { Camera } from './camera'
import type { Viewport } from './viewport'

export type FrameContext = {
  camera: Camera
  viewport: Viewport
}

/** 当前相机可见矩形（世界坐标）。 */
export type ViewRect = {
  left: number
  top: number
  right: number
  bottom: number
}

export const viewRectFromCamera = (camera: Camera): ViewRect => ({
  left: camera.x,
  top: camera.y,
  right: camera.x + camera.width,
  bottom: camera.y + camera.height,
})

export const circleIntersectsView = (
  circle: { x: number; y: number; radius: number },
  view: ViewRect,
  margin = 0,
): boolean => {
  const safeRadius = Number.isFinite(circle.radius)
    ? Math.max(0, circle.radius)
    : 0
  const safeMargin = Number.isFinite(margin) ? Math.max(0, margin) : 0
  const reach = safeRadius + safeMargin
  const nearestX = Math.max(view.left, Math.min(circle.x, view.right))
  const nearestY = Math.max(view.top, Math.min(circle.y, view.bottom))
  const dx = circle.x - nearestX
  const dy = circle.y - nearestY
  return dx * dx + dy * dy <= reach * reach
}
