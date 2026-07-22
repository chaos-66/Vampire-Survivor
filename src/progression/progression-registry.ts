/**
 * 成长内容注册表。
 * 候选生成器只读本表；注册时校验 categoryId 已存在。
 * 重复 ID：相同定义幂等；不同定义抛错，避免静默覆盖。
 */

import type { ProgressionDefinition } from './progression-definition'
import { getProgressionCategory } from './progression-category'

const byId = new Map<string, ProgressionDefinition>()
const order: string[] = []

const sameDefinition = (
  a: ProgressionDefinition,
  b: ProgressionDefinition,
): boolean =>
  a.id === b.id &&
  a.categoryId === b.categoryId &&
  a.name === b.name &&
  a.description === b.description &&
  a.maxLevel === b.maxLevel

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
    if (sameDefinition(existing, definition)) {
      return
    }
    throw new Error(
      `Progression already registered with different data: ${definition.id}`,
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