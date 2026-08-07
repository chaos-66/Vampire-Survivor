/**
 * 能力系统：推进玩家全部能力实例，各自独立冷却与 update。
 * 不判断具体 abilityId；冷却状态只在 instance.cooldownRemaining。
 * 能力生成的投射物与武器共用 Projectile 通道；吸附就地修改 Drop 对象。
 */

import { getAbility } from './ability-registry'
import type {
  AbilityInstance,
  AbilityUpdateContext,
} from './ability-definition'
import type { CombatPlayer } from '../actors/player-types'
import type { Enemy, Projectile } from '../combat/enemy-types'
import type { Drop } from '../drops/drop-types'
import type { ProjectileRequest } from '../weapons/weapon-definition'

export const advanceAbilities = (
  player: CombatPlayer,
  abilities: readonly AbilityInstance[],
  enemies: readonly Enemy[],
  drops: readonly Drop[],
  nextProjectileId: number,
  dt: number,
): { projectiles: Projectile[]; nextProjectileId: number } => {
  const spawned: Projectile[] = []
  let id = nextProjectileId

  const context: AbilityUpdateContext = {
    dtSeconds: dt,
    player,
    enemies,
    drops,
    spawnProjectile: (request: ProjectileRequest) => {
      spawned.push({
        id,
        x: request.x,
        y: request.y,
        vx: request.vx,
        vy: request.vy,
        radius: request.radius,
        damage: request.damage,
        lifeRemaining: request.lifeRemaining,
        homingTurnSpeed: request.homingTurnSpeed,
      })
      id += 1
    },
    pullDrop: (
      drop: Drop,
      targetX: number,
      targetY: number,
      speed: number,
    ): void => {
      const dx = targetX - drop.x
      const dy = targetY - drop.y
      const distance = Math.hypot(dx, dy)
      if (!(distance > 0)) {
        return
      }
      const step = Math.min(distance, speed * dt)
      drop.x += (dx / distance) * step
      drop.y += (dy / distance) * step
    },
  }

  for (const instance of abilities) {
    const definition = getAbility(instance.definitionId)
    if (!definition) {
      continue
    }
    definition.update(context, instance)
  }

  return { projectiles: spawned, nextProjectileId: id }
}
