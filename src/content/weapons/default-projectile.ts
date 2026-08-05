/**
 * 默认直线投射物武器（M2/M3 已有自动攻击）。
 * 目标选择与发射逻辑在武器定义内；系统只调用 update。
 */

import { distanceSq } from '../../collision'
import {
  PROJECTILE_LIFETIME,
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
} from '../../core/constants'
import type { Enemy } from '../../combat/enemy-types'
import type { CombatPlayer } from '../../actors/player-types'
import { normalize, vecLength } from '../../vec'
import type {
  WeaponDefinition,
  WeaponInstance,
  WeaponUpdateContext,
} from '../../weapons/weapon-definition'

export const DEFAULT_WEAPON_ID = 'default_projectile'

const selectNearestEnemy = (
  player: CombatPlayer,
  enemies: readonly Enemy[],
): Enemy | null => {
  if (enemies.length === 0) {
    return null
  }
  let best: Enemy | null = null
  let bestDist = Infinity
  for (const enemy of enemies) {
    const d = distanceSq(player.x, player.y, enemy.x, enemy.y)
    if (
      d < bestDist ||
      (d === bestDist && best !== null && enemy.id < best.id) ||
      (d === bestDist && best === null)
    ) {
      best = enemy
      bestDist = d
    }
  }
  return best
}

export const defaultProjectileWeapon: WeaponDefinition = {
  id: DEFAULT_WEAPON_ID,
  name: '自动投射物',
  description: '自动攻击最近敌人',
  maxLevel: 1,
  create: (): WeaponInstance => ({
    definitionId: DEFAULT_WEAPON_ID,
    level: 1,
    cooldownRemaining: 0,
  }),
  update: (context: WeaponUpdateContext, instance: WeaponInstance): void => {
    const cooldownBefore = instance.cooldownRemaining
    instance.cooldownRemaining = Math.max(
      0,
      cooldownBefore - context.dtSeconds,
    )
    // 时间片使用半开区间；恰好在末端就绪时由下一个时间片触发。
    if (
      instance.cooldownRemaining > 0 ||
      (context.deferReadyAtEnd &&
        cooldownBefore > 0 &&
        cooldownBefore === context.dtSeconds)
    ) {
      return
    }
    const target = selectNearestEnemy(context.player, context.enemies)
    if (!target) {
      return
    }
    const dir = normalize({
      x: target.x - context.player.x,
      y: target.y - context.player.y,
    })
    const velocity =
      vecLength(dir) === 0
        ? { x: PROJECTILE_SPEED, y: 0 }
        : { x: dir.x * PROJECTILE_SPEED, y: dir.y * PROJECTILE_SPEED }
    context.spawnProjectile({
      x: context.player.x,
      y: context.player.y,
      vx: velocity.x,
      vy: velocity.y,
      radius: PROJECTILE_RADIUS,
      damage: context.player.projectileDamage,
      lifeRemaining: PROJECTILE_LIFETIME,
    })
    instance.cooldownRemaining = context.player.attackCooldown
  },
}
