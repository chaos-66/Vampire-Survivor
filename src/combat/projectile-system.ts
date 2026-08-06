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
    const moved: Projectile = {
      ...raw,
      x: raw.x + raw.vx * dt,
      y: raw.y + raw.vy * dt,
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
