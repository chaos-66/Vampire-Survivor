/**
 * 升级遮罩与卡片绘制：只读 pending 选项，不改 GameState。
 * 卡片数量与 pending.options 一致；输入绑定同一列表。
 */

import type { Arena } from '../movement'
import type { PendingUpgrade } from '../progression/progression-definition'
import { getUpgradeCardRects } from './canvas-coordinates'

export const drawUpgradeOverlay = (
  context: CanvasRenderingContext2D,
  arena: Arena,
  pending: PendingUpgrade | null,
): void => {
  if (pending === null) {
    return
  }

  context.fillStyle = 'rgba(0, 0, 0, 0.55)'
  context.fillRect(0, 0, arena.width, arena.height)

  context.fillStyle = '#e8dfcf'
  context.font = '700 28px system-ui, sans-serif'
  context.textAlign = 'center'
  context.fillText('选择强化', arena.width / 2, arena.height / 2 - 100)

  const options = pending.options
  const rects = getUpgradeCardRects(arena, options.length)
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
    context.fillText(option.description, r.x + r.width / 2, r.y + 74)
  }
}