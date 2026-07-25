/**
 * HUD：屏幕空间固定左上角，不应用 camera offset。
 */

import type { GameState } from '../core/game-state'
import { getStatusMessage } from '../status'
import { getDifficultyProfile } from '../core/difficulty'

export const getDifficultyHudLines = (
  elapsedActiveSeconds: number,
): [string, string] => {
  const elapsed = Number.isFinite(elapsedActiveSeconds)
    ? Math.max(0, elapsedActiveSeconds)
    : 0
  const difficulty = getDifficultyProfile(elapsed)
  return [
    `时间 ${elapsed.toFixed(1)} 秒`,
    `难度 第 ${difficulty.tier} 档`,
  ]
}

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
  context.fillText(
    `位置 ${Math.round(game.player.x)}, ${Math.round(game.player.y)}`,
    12,
    144,
  )
  context.fillText(
    `世界 ${Math.round(game.arena.width)} × ${Math.round(game.arena.height)}`,
    12,
    164,
  )
  const [timeLine, tierLine] = getDifficultyHudLines(game.elapsedActiveSeconds)
  context.fillText(timeLine, 12, 184)
  context.fillText(tierLine, 12, 204)
}
