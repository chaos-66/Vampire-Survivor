/**
 * 升级候选生成：按 offerWeight 权重随机抽取（无放回），位置随机。
 * - maxLevel: number 达上限则排除；null 永不排除
 * - 尊重 isEligible
 * - offerWeight 可选（默认 1）；0 或负值永不进入候选
 * - rng 决定抽取与位置；默认 Math.random，测试可用 createSequenceRng 复现
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

type WeightedOption = { option: UpgradeOption; weight: number }

export const generateUpgradeOffers = (
  context: ProgressionContext,
  limit = 3,
  rng: () => number = Math.random,
): UpgradeOption[] => {
  const pool: WeightedOption[] = []
  for (const definition of listProgressions()) {
    const current = context.progressionLevels[definition.id] ?? 0
    if (isAtMaxLevel(current, definition.maxLevel)) {
      continue
    }
    if (!definition.isEligible(context)) {
      continue
    }
    const weight = Math.max(0, definition.offerWeight ?? 1)
    if (weight <= 0) {
      continue
    }
    pool.push({
      option: {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        categoryId: definition.categoryId,
      },
      weight,
    })
  }

  const picked: UpgradeOption[] = []
  while (pool.length > 0 && picked.length < limit) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0)
    let cursor = rng() * total
    let index = pool.length - 1
    for (let i = 0; i < pool.length; i += 1) {
      cursor -= pool[i].weight
      if (cursor < 0) {
        index = i
        break
      }
    }
    picked.push(pool[index].option)
    pool.splice(index, 1)
  }
  return picked
}
