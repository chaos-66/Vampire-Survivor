/**
 * 结算遮罩：屏幕空间，覆盖世界与 HUD/升级 UI。
 * 仅绘制；不修改 GameState。
 */

import type { RunOutcome } from '../core/run-outcome'

export type ViewportSize = {
  width: number
  height: number
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

/** 视口中心的「重新开始」按钮矩形（逻辑 CSS 像素）。 */
export const getRestartButtonRect = (viewport: ViewportSize): Rect => {
  const viewportWidth = Number.isFinite(viewport.width)
    ? Math.max(1, viewport.width)
    : 1
  const viewportHeight = Number.isFinite(viewport.height)
    ? Math.max(1, viewport.height)
    : 1
  const width = Math.min(220, viewportWidth)
  const height = Math.min(48, viewportHeight)
  return {
    x: (viewportWidth - width) / 2,
    y: clamp(viewportHeight / 2 + 48, 0, viewportHeight - height),
    width,
    height,
  }
}

export const restartButtonContainsPoint = (
  viewport: ViewportSize,
  point: { x: number; y: number },
): boolean => {
  const r = getRestartButtonRect(viewport)
  return (
    point.x >= r.x &&
    point.x <= r.x + r.width &&
    point.y >= r.y &&
    point.y <= r.y + r.height
  )
}

export const drawOutcomeOverlay = (
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
  outcome: RunOutcome,
): void => {
  if (outcome === 'running') {
    return
  }

  context.fillStyle = 'rgba(0, 0, 0, 0.62)'
  context.fillRect(0, 0, viewport.width, viewport.height)

  const cx = viewport.width / 2
  const cy = viewport.height / 2

  context.textAlign = 'center'
  context.fillStyle = '#e8dfcf'
  context.font = '700 36px system-ui, sans-serif'
  context.fillText(outcome === 'won' ? '胜利' : '失败', cx, cy - 48)

  context.font = '500 18px system-ui, sans-serif'
  context.fillStyle = '#c8c0b0'
  context.fillText(
    outcome === 'won' ? '你坚持了 60 秒' : '你被敌人击败了',
    cx,
    cy - 8,
  )
  context.fillText('按 R 或点击重新开始', cx, cy + 28)

  const btn = getRestartButtonRect(viewport)
  context.fillStyle = '#1c2030'
  context.strokeStyle = '#6ec6ff'
  context.lineWidth = 2
  context.fillRect(btn.x, btn.y, btn.width, btn.height)
  context.strokeRect(btn.x, btn.y, btn.width, btn.height)
  context.fillStyle = '#e8dfcf'
  context.font = '700 18px system-ui, sans-serif'
  context.fillText(
    '重新开始',
    btn.x + btn.width / 2,
    btn.y + btn.height / 2 + 6,
  )
}
