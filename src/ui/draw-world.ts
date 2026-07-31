/**
 * 世界实体绘制（只读状态）。
 * 实体使用世界坐标，经 worldToScreen(camera) 转屏幕坐标。
 * 清屏与可见网格仅覆盖当前视口，不对整个大世界 fillRect。
 */

import type { GameState } from '../core/game-state'
import type { Camera } from '../world/camera'
import type { Viewport } from '../world/viewport'
import { worldToScreen } from '../world/coordinates'
import {
  circleIntersectsView,
  viewRectFromCamera,
} from '../world/frame-context'

/** 世界网格间距（逻辑单位）；仅绘制可见线。 */
export const WORLD_GRID_SPACING = 256
export const ENEMY_DRAW_MARGIN = 12

export const drawWorld = (
  context: CanvasRenderingContext2D,
  game: GameState,
  camera: Camera,
  viewport: Viewport,
  hitFlashRemaining: number,
): void => {
  // 视口清屏（屏幕空间）
  context.fillStyle = '#11131a'
  context.fillRect(0, 0, viewport.width, viewport.height)

  drawVisibleGrid(context, camera, viewport, game.arena)
  drawWorldBorder(context, camera, game.arena)
  const view = viewRectFromCamera(camera)

  for (const gem of game.gems) {
    if (!circleIntersectsView(gem, view)) {
      continue
    }
    const s = worldToScreen(gem, camera)
    context.fillStyle = '#7dffb3'
    context.beginPath()
    context.arc(s.x, s.y, gem.radius, 0, Math.PI * 2)
    context.fill()
  }

  for (const enemy of game.enemies) {
    if (!circleIntersectsView(enemy, view, ENEMY_DRAW_MARGIN)) {
      continue
    }
    const s = worldToScreen(enemy, camera)
    context.fillStyle = '#e85d5d'
    context.beginPath()
    context.arc(s.x, s.y, enemy.radius, 0, Math.PI * 2)
    context.fill()
    const ratio = enemy.health / enemy.maxHealth
    context.fillStyle = '#2a2d38'
    context.fillRect(
      s.x - enemy.radius,
      s.y - enemy.radius - 8,
      enemy.radius * 2,
      4,
    )
    context.fillStyle = '#f0c14a'
    context.fillRect(
      s.x - enemy.radius,
      s.y - enemy.radius - 8,
      enemy.radius * 2 * ratio,
      4,
    )
  }

  for (const projectile of game.projectiles) {
    if (!circleIntersectsView(projectile, view)) {
      continue
    }
    const s = worldToScreen(projectile, camera)
    context.fillStyle = '#f5f0a8'
    context.beginPath()
    context.arc(s.x, s.y, projectile.radius, 0, Math.PI * 2)
    context.fill()
  }

  const ps = worldToScreen(game.player, camera)
  context.fillStyle = hitFlashRemaining > 0 ? '#ff9a6b' : '#6ec6ff'
  context.beginPath()
  context.arc(ps.x, ps.y, game.player.radius, 0, Math.PI * 2)
  context.fill()
}

const drawVisibleGrid = (
  context: CanvasRenderingContext2D,
  camera: Camera,
  viewport: Viewport,
  world: { width: number; height: number },
): void => {
  const spacing = WORLD_GRID_SPACING
  const left = Math.max(0, camera.x)
  const top = Math.max(0, camera.y)
  const right = Math.min(world.width, camera.x + viewport.width)
  const bottom = Math.min(world.height, camera.y + viewport.height)

  context.strokeStyle = 'rgba(52, 55, 68, 0.55)'
  context.lineWidth = 1

  const startX = Math.floor(left / spacing) * spacing
  for (let x = startX; x <= right; x += spacing) {
    const sx = x - camera.x
    context.beginPath()
    context.moveTo(sx, top - camera.y)
    context.lineTo(sx, bottom - camera.y)
    context.stroke()
  }

  const startY = Math.floor(top / spacing) * spacing
  for (let y = startY; y <= bottom; y += spacing) {
    const sy = y - camera.y
    context.beginPath()
    context.moveTo(left - camera.x, sy)
    context.lineTo(right - camera.x, sy)
    context.stroke()
  }
}

const drawWorldBorder = (
  context: CanvasRenderingContext2D,
  camera: Camera,
  world: { width: number; height: number },
): void => {
  const tl = worldToScreen({ x: 0, y: 0 }, camera)
  context.strokeStyle = '#343744'
  context.lineWidth = 2
  context.strokeRect(tl.x, tl.y, world.width, world.height)
}
