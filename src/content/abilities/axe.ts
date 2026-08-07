/**
 * 斧头能力：周期性朝最近敌人投掷斧头（额外攻击行为，不占武器冷却与武器槽）。
 */

import {
  AXE_COOLDOWN,
  AXE_DAMAGE,
  AXE_LIFETIME,
  AXE_RADIUS,
  AXE_SPEED,
} from '../../core/constants'
import { normalize, vecLength } from '../../vec'
import { selectNearestEnemy } from '../weapons/default-projectile'
import type {
  AbilityDefinition,
  AbilityInstance,
  AbilityUpdateContext,
} from '../../abilities/ability-definition'

export const AXE_ABILITY_ID = 'axe'

export const axeAbility: AbilityDefinition = {
  id: AXE_ABILITY_ID,
  name: '斧头',
  description: '周期性向最近敌人投掷斧头',
  maxLevel: 1,
  offerWeight: 0.7,
  create: (): AbilityInstance => ({
    definitionId: AXE_ABILITY_ID,
    level: 1,
    cooldownRemaining: 0,
  }),
  update: (context: AbilityUpdateContext, instance: AbilityInstance): void => {
    instance.cooldownRemaining = Math.max(
      0,
      instance.cooldownRemaining - context.dtSeconds,
    )
    if (instance.cooldownRemaining > 0) {
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
        ? { x: AXE_SPEED, y: 0 }
        : { x: dir.x * AXE_SPEED, y: dir.y * AXE_SPEED }
    context.spawnProjectile({
      x: context.player.x,
      y: context.player.y,
      vx: velocity.x,
      vy: velocity.y,
      radius: AXE_RADIUS,
      damage: AXE_DAMAGE,
      lifeRemaining: AXE_LIFETIME,
    })
    instance.cooldownRemaining = AXE_COOLDOWN
  },
}
