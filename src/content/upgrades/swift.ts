/**
 * 迅捷：移动速度 ×1.1。
 * maxLevel: null 表示无上限，可重复选择（M3 已验收叠加行为）。
 */

import type { ProgressionDefinition } from '../../progression/progression-definition'

export const swiftUpgrade: ProgressionDefinition = {
  id: 'swift',
  categoryId: 'stat',
  name: '迅捷',
  description: '移动速度 +10%',
  maxLevel: null,
  isEligible: () => true,
  apply: (context) => {
    context.player.moveSpeed *= 1.1
  },
}