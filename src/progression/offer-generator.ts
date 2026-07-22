/**
 * 升级候选生成：从注册表过滤可选项。
 * - 尊重 maxLevel（已达上限不再出现）
 * - 尊重 isEligible
 * - 当前 M3 行为：确定性注册顺序，不随机抽卡
 */

import type {
  ProgressionContext,
  UpgradeOption,
} from './progression-definition'
import { listProgressions } from './progression-registry'

export const generateUpgradeOffers = (
  context: ProgressionContext,
  limit = 3,
): UpgradeOption[] => {
  const offers: UpgradeOption[] = []
  for (const definition of listProgressions()) {
    const current = context.progressionLevels[definition.id] ?? 0
    if (current >= definition.maxLevel) {
      continue
    }
    if (!definition.isEligible(context)) {
      continue
    }
    offers.push({
      id: definition.id,
      name: definition.name,
      description: definition.description,
    })
    if (offers.length >= limit) {
      break
    }
  }
  return offers
}