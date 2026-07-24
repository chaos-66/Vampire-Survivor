/**
 * 视口与 Canvas backing store。
 *
 * - 逻辑视口：CSS 像素，模拟与绘制布局使用
 * - backing store：逻辑尺寸 * DPR，仅影响清晰度
 * - DPR 上限防止超高分辨率过大显存/绘制成本
 */

export const MAX_DEVICE_PIXEL_RATIO = 2

export type Viewport = {
  /** 逻辑宽度（CSS 像素） */
  width: number
  /** 逻辑高度（CSS 像素） */
  height: number
  /** 实际使用的 DPR（已钳制） */
  dpr: number
}

export type BackingStoreSize = {
  width: number
  height: number
}

const safePositive = (value: number, fallback = 1): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback
  }
  return value
}

/**
 * 将浏览器提供的尺寸/DPR 规范化为逻辑视口。
 */
export const createViewport = (
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
  maxDpr: number = MAX_DEVICE_PIXEL_RATIO,
): Viewport => {
  const width = Math.max(1, Math.round(safePositive(cssWidth)))
  const height = Math.max(1, Math.round(safePositive(cssHeight)))
  const rawDpr = Number.isFinite(devicePixelRatio) ? devicePixelRatio : 1
  const dpr = Math.min(Math.max(rawDpr, 1 / 64), maxDpr)
  return { width, height, dpr }
}

/** backing store 像素尺寸 = 逻辑尺寸 * DPR */
export const computeBackingStoreSize = (
  viewport: Viewport,
): BackingStoreSize => ({
  width: Math.max(1, Math.round(viewport.width * viewport.dpr)),
  height: Math.max(1, Math.round(viewport.height * viewport.dpr)),
})