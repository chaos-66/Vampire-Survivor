/**
 * 成长内容注册表。
 * 候选生成器只读本表，不依赖迅捷/急速/强击等具体名称。
 */

import type { ProgressionDefinition } from './progression-definition'

const byId = new Map<string, ProgressionDefinition>()
const order: string[] = []

export const registerProgression = (
  definition: ProgressionDefinition,
): void => {
  if (byId.has(definition.id)) {
    byId.set(definition.id, definition)
    return
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