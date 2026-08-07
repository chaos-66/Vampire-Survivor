/**
 * 追踪弹能力：周期性生成追踪弹（每帧转向最近敌人）。
 * 等级 1/2/3 对应 1/2/3 颗弹。
 */

import {
  MISSILE_COOLDOWN,
  MISSILE_DAMAGE,
  MISSILE_LIFETIME,
  MISSILE_RADIUS,
  MISSILE_SPEED,
  MISSILE_TURN_SPEED,
} from '../../core/constants'
import type {
  AbilityDefinition,
  AbilityInstance,
  AbilityUpdateContext,
} from '../../abilities/ability-definition'

export const HOMING_MISSILE_ABILITY_ID = 'homing_missile'

const shotCountForLevel = (level: number): number => level

export const homingMissileAbility: AbilityDefinition = {
  id: HOMING_MISSILE_ABILITY_ID,
  name: '追踪弹',
  description: '周期性发射自动追踪敌人的小魔法',
  maxLevel: 3,
  offerWeight: 0.5,
  create: (): AbilityInstance => ({
    definitionId: HOMING_MISSILE_ABILITY_ID,
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
    const count = shotCountForLevel(instance.level)
    for (let i = 0; i < count; i += 1) {
      const angle = (i / Math.max(1, count)) * Math.PI * 2
      context.spawnProjectile({
        x: context.player.x,
        y: context.player.y,
        vx: Math.cos(angle) * MISSILE_SPEED,
        vy: Math.sin(angle) * MISSILE_SPEED,
        radius: MISSILE_RADIUS,
        damage: MISSILE_DAMAGE,
        lifeRemaining: MISSILE_LIFETIME,
        homingTurnSpeed: MISSILE_TURN_SPEED,
      })
    }
    instance.cooldownRemaining = MISSILE_COOLDOWN
  },
}
