/**
 * 世界实体绘制：宝石/敌人/投射物/玩家。只读状态。
 */

import type { GameState } from '../core/game-state'

export const drawWorld = (
  context: CanvasRenderingContext2D,
  game: GameState,
  hitFlashRemaining: number,
): void => {
  const arena = game.arena
  context.fillStyle = '#11131a'
  context.fillRect(0, 0, arena.width, arena.height)

  context.strokeStyle = '#343744'
  context.lineWidth = 2
  context.strokeRect(1, 1, arena.width - 2, arena.height - 2)

  for (const gem of game.gems) {
    context.fillStyle = '#7dffb3'
    context.beginPath()
    context.arc(gem.x, gem.y, gem.radius, 0, Math.PI * 2)
    context.fill()
  }

  for (const enemy of game.enemies) {
    context.fillStyle = '#e85d5d'
    context.beginPath()
    context.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2)
    context.fill()
    const ratio = enemy.health / enemy.maxHealth
    context.fillStyle = '#2a2d38'
    context.fillRect(
      enemy.x - enemy.radius,
      enemy.y - enemy.radius - 8,
      enemy.radius * 2,
      4,
    )
    context.fillStyle = '#f0c14a'
    context.fillRect(
      enemy.x - enemy.radius,
      enemy.y - enemy.radius - 8,
      enemy.radius * 2 * ratio,
      4,
    )
  }

  for (const projectile of game.projectiles) {
    context.fillStyle = '#f5f0a8'
    context.beginPath()
    context.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2)
    context.fill()
  }

  context.fillStyle = hitFlashRemaining > 0 ? '#ff9a6b' : '#6ec6ff'
  context.beginPath()
  context.arc(game.player.x, game.player.y, game.player.radius, 0, Math.PI * 2)
  context.fill()
}