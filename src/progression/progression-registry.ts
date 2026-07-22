/**
 * 成长内容注册表。
 * 注册时校验 categoryId 已存在。
 * 重复 ID 策略（对象身份）：
 * - 同一 definition 对象：幂等
 * - 同 ID 不同对象：抛错（不比较 apply/isEligible 源码）
 */

import type { ProgressionDefinition } from './progression-definition'
import { getProgressionCategory } from './progression-category'

const byId = new Map<string, ProgressionDefinition>()
const order: string[] = []

export const registerProgression = (
  definition: ProgressionDefinition,
): void => {
  if (!getProgressionCategory(definition.categoryId)) {
    throw new Error(
      `Progression category not registered: ${definition.categoryId} (for ${definition.id})`,
    )
  }
  const existing = byId.get(definition.id)
  if (existing) {
    if (existing === definition) {
      return
    }
    throw new Error(
      `Progression already registered with a different definition object: ${definition.id}`,
    )
  }
  byId.set(definition.id, definition)
  order.push(definition.id)
}

export const getProgression = (
  id: string,
): ProgressionDefinition | undefined => byId.get(id)

export const listProgressions = (): ProgressionDefinition[] =>
  order.map((id) => byId.get(id)!).filter(Boolean)

export const clearProgressionRegistry = (): void => {
  byId.clear()
  order.length = 0
}