/**
 * 强击：投射物伤害 +5。
 * maxLevel: null 表示无上限。
 */

import type { ProgressionDefinition } from '../../progression/progression-definition'

export const powerUpgrade: ProgressionDefinition = {
  id: 'power',
  categoryId: 'stat',
  name: '强击',
  description: '投射物伤害 +5',
  maxLevel: null,
  isEligible: () => true,
  apply: (context) => {
    context.player.projectileDamage += 5
  },
}