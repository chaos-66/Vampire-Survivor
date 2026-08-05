import { clampPlayerToArena, type Arena, type Player } from '../movement'
import type { WorldObject } from './world-object'

const moveAxis = (
  player: Player,
  delta: number,
  axis: 'x' | 'y',
  obstacles: readonly WorldObject[],
): Player => {
  if (delta === 0) {
    return player
  }

  const otherAxis = axis === 'x' ? 'y' : 'x'
  let target = player[axis] + delta
  for (const obstacle of obstacles) {
    if (!obstacle.blocksMovement) {
      continue
    }
    const otherStart = obstacle[otherAxis] - player.radius
    const otherSize = axis === 'x' ? obstacle.height : obstacle.width
    const otherEnd = obstacle[otherAxis] + otherSize + player.radius
    if (player[otherAxis] < otherStart || player[otherAxis] > otherEnd) {
      continue
    }

    const obstacleStart = obstacle[axis] - player.radius
    const obstacleSize = axis === 'x' ? obstacle.width : obstacle.height
    const obstacleEnd = obstacle[axis] + obstacleSize + player.radius
    if (delta > 0 && player[axis] <= obstacleStart && target > obstacleStart) {
      target = Math.min(target, obstacleStart)
    } else if (
      delta < 0 &&
      player[axis] >= obstacleEnd &&
      target < obstacleEnd
    ) {
      target = Math.max(target, obstacleEnd)
    }
  }
  return { ...player, [axis]: target }
}

/**
 * 以小于玩家半径的确定性步长解析两轴移动，防止大步长穿过薄障碍并允许沿边滑动。
 */
export const movePlayerAroundObstacles = (
  player: Player,
  target: Player,
  arena: Arena,
  objects: readonly WorldObject[],
): Player => {
  const safeTarget = clampPlayerToArena(target, arena)
  if (!Number.isFinite(safeTarget.x) || !Number.isFinite(safeTarget.y)) {
    return clampPlayerToArena(player, arena)
  }

  const dx = safeTarget.x - player.x
  const dy = safeTarget.y - player.y
  const maxStep = Math.max(1, player.radius / 2)
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / maxStep))
  const stepX = dx / steps
  const stepY = dy / steps
  let current = clampPlayerToArena(player, arena)

  for (let index = 0; index < steps; index += 1) {
    current = moveAxis(current, stepX, 'x', objects)
    current = moveAxis(current, stepY, 'y', objects)
    current = clampPlayerToArena(current, arena)
  }
  return current
}
