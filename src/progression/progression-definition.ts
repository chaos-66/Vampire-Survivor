/**
 * 成长定义（静态内容）：分类 + 资格 + 应用。
 * apply 只通过 ProgressionContext 改运行时状态，不绘制 UI。
 */

import type { CombatPlayer } from '../actors/player-types'

export type ProgressionContext = {
  player: CombatPlayer
  /** 局内已选等级：definitionId → 已选次数。 */
  progressionLevels: Record<string, number>
}

export type ProgressionDefinition = {
  id: string
  categoryId: string
  name: string
  description: string
  maxLevel: number
  isEligible: (context: ProgressionContext) => boolean
  apply: (context: ProgressionContext) => void
}

export type UpgradeOption = {
  id: string
  name: string
  description: string
}

export type PendingUpgrade = {
  options: UpgradeOption[]
}
