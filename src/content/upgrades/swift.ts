/**
 * 迅捷：移动速度 ×1.1（可叠，受 maxLevel 限制）。
 */

import { DEFAULT_UPGRADE_MAX_LEVEL } from '../../core/constants'
import type { ProgressionDefinition } from '../../progression/progression-definition'

export const swiftUpgrade: ProgressionDefinition = {
  id: 'swift',
  categoryId: 'stat',
  name: '迅捷',
  description: '移动速度 +10%',
  maxLevel: DEFAULT_UPGRADE_MAX_LEVEL,
  isEligible: () => true,
  apply: (context) => {
    context.player.moveSpeed *= 1.1
  },
}