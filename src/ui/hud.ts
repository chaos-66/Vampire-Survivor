/**
 * HUD 绘制：只读 GameState 快照，不修改模拟状态。
 */

import type { GameState } from '../core/game-state'
import { getStatusMessage } from '../status'

export const drawHud = (
  context: CanvasRenderingContext2D,
  game: GameState,
): void => {
  context.fillStyle = '#e8dfcf'
  context.font = '600 14px system-ui, sans-serif'
  context.textAlign = 'left'
  context.fillText(getStatusMessage(), 12, 24)
  context.fillText(
    `生命 ${game.player.health} / ${game.player.maxHealth}`,
    12,
    44,
  )
  context.fillText(`击败 ${game.defeatedCount}`, 12, 64)
  context.fillText(`敌人 ${game.enemies.length}`, 12, 84)
  context.fillText(`等级 ${game.level}`, 12, 104)
  context.fillText(
    `经验 ${game.experience} / ${game.experienceToNextLevel}`,
    12,
    124,
  )
}