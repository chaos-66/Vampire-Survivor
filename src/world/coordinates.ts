/**
 * 世界坐标 <-> 屏幕（逻辑视口）坐标转换。
 *
 * - 世界坐标：模拟位置，原点在世界左上，单位 CSS 像素
 * - 屏幕坐标：相对当前 Canvas 逻辑视口左上
 * - backing store 像素由 context.setTransform(dpr) 处理，不进入本 helper
 */

import type { Vec2 } from '../vec'
import type { Camera } from './camera'

/** 世界点 -> 屏幕点（减去相机偏移）。不修改输入。 */
export const worldToScreen = (worldPoint: Vec2, camera: Camera): Vec2 => ({
  x: worldPoint.x - camera.x,
  y: worldPoint.y - camera.y,
})

/** 屏幕点 -> 世界点（加上相机偏移）。不修改输入。 */
export const screenToWorld = (screenPoint: Vec2, camera: Camera): Vec2 => ({
  x: screenPoint.x + camera.x,
  y: screenPoint.y + camera.y,
})