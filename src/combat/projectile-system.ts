/**
 * 投射物移动与碰撞：一弹一伤，击杀时回调掉落。
 * 世界逻辑坐标；不碰 Canvas。
 */

import { circlesOverlap } from '../collision'
import { PROJECTILE_BOUNDS_MARGIN } from '../core/constants'
import type { Arena } from '../movement'
import type { Enemy, Projectile } from './enemy-types'

export const projectileOutOfBounds = (
  p: Projectile,
  arena: Arena,
  margin: number,
): boolean =>
  p.x < -margin ||
  p.y < -margin ||
  p.x > arena.width + margin ||
  p.y > arena.height + margin

/**
 * 追踪转向：把当前速度方向朝最近活敌旋转，单帧转角不超过 turnSpeed * dt。
 * 无活敌时保持原方向。
 */
export const steerTowardNearest = (
  mover: { x: number; y: number; vx: number; vy: number },
  enemies: readonly Enemy[],
  turnSpeed: number,
  dt: number,
): { x: number; y: number } => {
  let best: Enemy | null = null
  let bestDist = Infinity
  for (const enemy of enemies) {
    if (enemy.health <= 0) {
      continue
    }
    const dx = enemy.x - mover.x
    const dy = enemy.y - mover.y
    const d = dx * dx + dy * dy
    if (d < bestDist) {
      best = enemy
      bestDist = d
    }
  }
  if (!best) {
    return { x: mover.vx, y: mover.vy }
  }
  const desiredAngle = Math.atan2(best.y - mover.y, best.x - mover.x)
  const currentAngle = Math.atan2(mover.vy, mover.vx)
  let delta = desiredAngle - currentAngle
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  const maxTurn = turnSpeed * dt
  const newAngle =
    currentAngle + Math.max(-maxTurn, Math.min(maxTurn, delta))
  const speed = Math.hypot(mover.vx, mover.vy)
  if (!(speed > 0)) {
    return { x: mover.vx, y: mover.vy }
  }
  return {
    x: Math.cos(newAngle) * speed,
    y: Math.sin(newAngle) * speed,
  }
}

export type ProjectileStepResult = {
  projectiles: Projectile[]
  enemies: Enemy[]
  defeatedDelta: number
  kills: Array<{ x: number; y: number; definitionId: string }>
}

export const advanceProjectiles = (
  projectiles: Projectile[],
  enemies: Enemy[],
  arena: Arena,
  dt: number,
): ProjectileStepResult => {
  const remainingProjectiles: Projectile[] = []
  const enemyById = new Map<number, Enemy>(
    enemies.map((enemy): [number, Enemy] => [enemy.id, { ...enemy }]),
  )
  const orderedEnemies = [...enemyById.values()].sort((a, b) => a.id - b.id)
  const killedEnemyIds = new Set<number>()
  let defeatedDelta = 0
  const kills: Array<{ x: number; y: number; definitionId: string }> = []

  const sortedProjectiles = [...projectiles].sort((a, b) => a.id - b.id)

  for (const raw of sortedProjectiles) {
    let velocity = { x: raw.vx, y: raw.vy }
    if (raw.homingTurnSpeed !== undefined && raw.homingTurnSpeed > 0) {
      velocity = steerTowardNearest(
        { x: raw.x, y: raw.y, vx: velocity.x, vy: velocity.y },
        orderedEnemies,
        raw.homingTurnSpeed,
        dt,
      )
    }
    const moved: Projectile = {
      ...raw,
      x: raw.x + velocity.x * dt,
      y: raw.y + velocity.y * dt,
      vx: velocity.x,
      vy: velocity.y,
      lifeRemaining: raw.lifeRemaining - dt,
    }
    if (moved.lifeRemaining <= 0) {
      continue
    }
    if (projectileOutOfBounds(moved, arena, PROJECTILE_BOUNDS_MARGIN)) {
      continue
    }

    let hit = false
    for (const enemy of orderedEnemies) {
      if (enemy.health <= 0) {
        continue
      }
      if (circlesOverlap(moved, enemy)) {
        const nextHp = enemy.health - moved.damage
        if (nextHp <= 0) {
          enemy.health = 0
          killedEnemyIds.add(enemy.id)
          defeatedDelta += 1
          kills.push({ x: enemy.x, y: enemy.y, definitionId: enemy.definitionId })
        } else {
          enemy.health = nextHp
        }
        hit = true
        break
      }
    }

    if (!hit) {
      remainingProjectiles.push(moved)
    }
  }

  return {
    projectiles: remainingProjectiles,
    enemies: orderedEnemies.filter((enemy) => !killedEnemyIds.has(enemy.id)),
    defeatedDelta,
    kills,
  }
}
