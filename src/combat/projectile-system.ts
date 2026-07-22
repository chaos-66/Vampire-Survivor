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
  kills: Array<{ x: number; y: number }>
}

export const advanceProjectiles = (
  projectiles: Projectile[],
  enemies: Enemy[],
  arena: Arena,
  dt: number,
): ProjectileStepResult => {
  const remainingProjectiles: Projectile[] = []
  const enemyById = new Map(enemies.map((e) => [e.id, { ...e }]))
  let defeatedDelta = 0
  const kills: Array<{ x: number; y: number }> = []

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
    const living = [...enemyById.values()]
      .filter((e) => e.health > 0)
      .sort((a, b) => a.id - b.id)

    for (const enemy of living) {
      if (circlesOverlap(moved, enemy)) {
        const nextHp = enemy.health - moved.damage
        if (nextHp <= 0) {
          enemyById.delete(enemy.id)
          defeatedDelta += 1
          kills.push({ x: enemy.x, y: enemy.y })
        } else {
          enemyById.set(enemy.id, { ...enemy, health: nextHp })
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
    enemies: [...enemyById.values()].sort((a, b) => a.id - b.id),
    defeatedDelta,
    kills,
  }
}