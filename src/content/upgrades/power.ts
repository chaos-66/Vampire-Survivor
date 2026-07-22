/**
 * 强击：投射物伤害 +5。
 */

import { DEFAULT_UPGRADE_MAX_LEVEL } from '../../core/constants'
import type { ProgressionDefinition } from '../../progression/progression-definition'

export const powerUpgrade: ProgressionDefinition = {
  id: 'power',
  categoryId: 'stat',
  name: '强击',
  description: '投射物伤害 +5',
  maxLevel: DEFAULT_UPGRADE_MAX_LEVEL,
  isEligible: () => true,
  apply: (context) => {
    context.player.projectileDamage += 5
  },
}