/**
 * 成长定义（静态内容）：分类 + 资格 + 应用。
 * apply 只通过 ProgressionContext 改运行时状态，不绘制 UI。
 *
 * maxLevel:
 * - number: 有限次数，达到后不再进入候选
 * - null: 无上限（M3 迅捷/急速/强击）
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
  /** null = 无限；number = 有限上限。禁止用 999 等魔法数表示无限。 */
  maxLevel: number | null
  /** 升级候选出现权重（可选，默认 1；0 或缺失按 1 处理，负值按 0 排除）。 */
  offerWeight?: number
  isEligible: (context: ProgressionContext) => boolean
  apply: (context: ProgressionContext) => void
}

export type UpgradeOption = {
  id: string
  name: string
  description: string
  categoryId: string
}

export type PendingUpgrade = {
  /** 画面上正在显示的候选；输入必须只绑定此列表。 */
  options: UpgradeOption[]
}

/** maxLevel 是否已达上限。null 永不满。 */
export const isAtMaxLevel = (
  current: number,
  maxLevel: number | null,
): boolean => {
  if (maxLevel === null) {
    return false
  }
  return current >= maxLevel
}