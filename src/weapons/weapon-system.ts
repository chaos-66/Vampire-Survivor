/**
 * 武器系统：遍历玩家全部 WeaponInstance，各自独立冷却与 update。
 * 不判断具体 weaponId；冷却状态只在 instance.cooldownRemaining。
 */

import { getWeapon } from './weapon-registry'
import type {
  WeaponUpdateContext,
  WeaponInstance,
} from './weapon-definition'
import type { CombatPlayer } from '../actors/player-types'
import type { Enemy, Projectile } from '../combat/enemy-types'

/**
 * 推进武器冷却并判断本时间片是否就绪。
 * 半开区间语义：恰好在切片末端就绪的事件由下一个时间片处理。
 */
export const readyToFire = (
  instance: WeaponInstance,
  context: WeaponUpdateContext,
): boolean => {
  const cooldownBefore = instance.cooldownRemaining
  instance.cooldownRemaining = Math.max(
    0,
    cooldownBefore - context.dtSeconds,
  )
  if (
    instance.cooldownRemaining > 0 ||
    (context.deferReadyAtEnd &&
      cooldownBefore > 0 &&
      cooldownBefore === context.dtSeconds)
  ) {
    return false
  }
  return true
}

export const advanceWeapons = (
  player: CombatPlayer,
  enemies: readonly Enemy[],
  nextProjectileId: number,
  dt: number,
  deferReadyAtEnd = false,
): { projectiles: Projectile[]; nextProjectileId: number } => {
  const spawned: Projectile[] = []
  let id = nextProjectileId

  const context: WeaponUpdateContext = {
    dtSeconds: dt,
    deferReadyAtEnd,
    player,
    enemies,
    spawnProjectile: (request) => {
      spawned.push({
        id,
        x: request.x,
        y: request.y,
        vx: request.vx,
        vy: request.vy,
        radius: request.radius,
        damage: request.damage,
        lifeRemaining: request.lifeRemaining,
      })
      id += 1
    },
  }

  for (const instance of player.weapons) {
    const definition = getWeapon(instance.definitionId)
    if (!definition) {
      continue
    }
    definition.update(context, instance)
  }

  return { projectiles: spawned, nextProjectileId: id }
}
