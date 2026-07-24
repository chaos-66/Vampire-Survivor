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