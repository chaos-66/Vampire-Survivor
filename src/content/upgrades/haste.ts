/**
 * 急速：攻击间隔 ×0.9，且不低于 MIN_ATTACK_COOLDOWN。
 * maxLevel: null 表示无上限。
 */

import { MIN_ATTACK_COOLDOWN } from '../../core/constants'
import type { ProgressionDefinition } from '../../progression/progression-definition'

export const hasteUpgrade: ProgressionDefinition = {
  id: 'haste',
  categoryId: 'stat',
  name: '急速',
  description: '攻击间隔 -10%',
  maxLevel: null,
  isEligible: () => true,
  apply: (context) => {
    context.player.attackCooldown = Math.max(
      MIN_ATTACK_COOLDOWN,
      context.player.attackCooldown * 0.9,
    )
  },
}