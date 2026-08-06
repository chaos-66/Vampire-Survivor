/**
 * 升级遮罩与卡片：屏幕空间，覆盖整个视口，不应用 camera。
 */

import type { PendingUpgrade } from '../progression/progression-definition'
import { getUpgradeCardRects } from './canvas-coordinates'
import { wrapTextByWidth } from './text-wrap'

export type ViewportSize = {
  width: number
  height: number
}

export const drawUpgradeOverlay = (
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
  pending: PendingUpgrade | null,
): void => {
  if (pending === null) {
    return
  }

  context.fillStyle = 'rgba(0, 0, 0, 0.55)'
  context.fillRect(0, 0, viewport.width, viewport.height)

  context.fillStyle = '#e8dfcf'
  context.font = '700 28px system-ui, sans-serif'
  context.textAlign = 'center'
  context.fillText('选择强化', viewport.width / 2, viewport.height / 2 - 100)

  const options = pending.options
  const rects = getUpgradeCardRects(viewport, options.length)
  for (let i = 0; i < options.length; i += 1) {
    const r = rects[i]
    if (!r) {
      break
    }
    const option = options[i]
    context.fillStyle = '#1c2030'
    context.strokeStyle = '#6ec6ff'
    context.lineWidth = 2
    context.fillRect(r.x, r.y, r.width, r.height)
    context.strokeRect(r.x, r.y, r.width, r.height)

    context.fillStyle = '#e8dfcf'
    context.font = '700 18px system-ui, sans-serif'
    context.textAlign = 'center'
    context.fillText(
      `${i + 1} ${option.name}`,
      r.x + r.width / 2,
      r.y + 42,
    )
    context.font = '500 14px system-ui, sans-serif'
    context.fillStyle = '#c8c0b0'
    const descLines = wrapTextByWidth(
      option.description,
      r.width - 24,
      14,
      2,
    )
    for (let j = 0; j < descLines.length; j += 1) {
      context.fillText(descLines[j], r.x + r.width / 2, r.y + 66 + j * 20)
    }
  }
}