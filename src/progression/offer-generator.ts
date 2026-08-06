/**
 * 升级候选生成：从注册表过滤可选项。
 * - maxLevel: number 达上限则排除；null 永不排除
 * - 尊重 isEligible
 * - 确定性注册顺序，不随机
 * - 武器分类（categoryId === 'weapon'）优先展示，未获得的新武器可及
 * - 不写死分类或具体升级名称
 *
 * 返回的 options 即为 UI 显示与输入绑定的唯一来源。
 */

import {
  isAtMaxLevel,
  type ProgressionContext,
  type UpgradeOption,
} from './progression-definition'
import { listProgressions } from './progression-registry'

const weaponFirst = (a: UpgradeOption, b: UpgradeOption): number => {
  const aw = a.categoryId === 'weapon' ? 0 : 1
  const bw = b.categoryId === 'weapon' ? 0 : 1
  return aw - bw
}

export const generateUpgradeOffers = (
  context: ProgressionContext,
  limit = 3,
): UpgradeOption[] => {
  const offers: UpgradeOption[] = []
  for (const definition of listProgressions()) {
    const current = context.progressionLevels[definition.id] ?? 0
    if (isAtMaxLevel(current, definition.maxLevel)) {
      continue
    }
    if (!definition.isEligible(context)) {
      continue
    }
    offers.push({
      id: definition.id,
      name: definition.name,
      description: definition.description,
      categoryId: definition.categoryId,
    })
  }
  offers.sort(weaponFirst)
  return offers.slice(0, limit)
}