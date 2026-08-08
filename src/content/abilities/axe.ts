/**
 * 斧头能力：周期性沿角色当前朝向投掷斧头（额外攻击行为，不占武器冷却与武器槽）。
 * 指向性能力：初始投掷方向取角色朝向，不选择最近敌人（D-044）。
 */

import {
  AXE_COOLDOWN,
  AXE_DAMAGE,
  AXE_LIFETIME,
  AXE_RADIUS,
  AXE_SPEED,
} from '../../core/constants'
import { vecLength } from '../../vec'
import type {
  AbilityDefinition,
  AbilityInstance,
  AbilityUpdateContext,
} from '../../abilities/ability-definition'

export const AXE_ABILITY_ID = 'axe'

export const axeAbility: AbilityDefinition = {
  id: AXE_ABILITY_ID,
  name: '斧头',
  description: '周期性沿朝向投掷斧头',
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
    const facing = context.player.facing
    if (vecLength(facing) === 0) {
      return
    }
    context.spawnProjectile({
      x: context.player.x,
      y: context.player.y,
      vx: facing.x * AXE_SPEED,
      vy: facing.y * AXE_SPEED,
      radius: AXE_RADIUS,
      damage: AXE_DAMAGE,
      lifeRemaining: AXE_LIFETIME,
    })
    instance.cooldownRemaining = AXE_COOLDOWN
  },
}
