/**
 * 吸经验能力：把玩家附近的经验掉落向玩家吸附，扩大拾取范围。
 */

import { MAGNET_PULL_SPEED, MAGNET_RANGE } from '../../core/constants'
import type {
  AbilityDefinition,
  AbilityInstance,
  AbilityUpdateContext,
} from '../../abilities/ability-definition'

export const EXPERIENCE_MAGNET_ABILITY_ID = 'experience_magnet'

export const experienceMagnetAbility: AbilityDefinition = {
  id: EXPERIENCE_MAGNET_ABILITY_ID,
  name: '吸经验',
  description: '扩大经验拾取范围并吸附附近掉落',
  maxLevel: 1,
  offerWeight: 0.8,
  create: (): AbilityInstance => ({
    definitionId: EXPERIENCE_MAGNET_ABILITY_ID,
    level: 1,
    cooldownRemaining: 0,
  }),
  update: (
    context: AbilityUpdateContext,
    _instance: AbilityInstance,
  ): void => {
    for (const drop of context.drops) {
      const dx = context.player.x - drop.x
      const dy = context.player.y - drop.y
      if (dx * dx + dy * dy > MAGNET_RANGE * MAGNET_RANGE) {
        continue
      }
      context.pullDrop(
        drop,
        context.player.x,
        context.player.y,
        MAGNET_PULL_SPEED,
      )
    }
  },
}
