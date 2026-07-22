/**
 * 武器系统：对玩家身上每个 WeaponInstance 调用其定义的 update。
 * 不判断具体 weaponId。
 */

import { getWeapon } from './weapon-registry'
import type { WeaponUpdateContext } from './weapon-definition'
import type { CombatPlayer } from '../actors/player-types'
import type { Enemy, Projectile } from '../combat/enemy-types'

export const advanceWeapons = (
  player: CombatPlayer,
  enemies: readonly Enemy[],
  nextProjectileId: number,
  dt: number,
): { projectiles: Projectile[]; nextProjectileId: number } => {
  const spawned: Projectile[] = []
  let id = nextProjectileId

  const context: WeaponUpdateContext = {
    dtSeconds: dt,
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