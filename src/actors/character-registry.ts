/**
 * 角色注册表：仅保存可选用的静态角色定义。
 * 新增角色 = 写定义 + registerCharacter，不改主循环。
 */

import type { CharacterDefinition } from './character-definition'

const byId = new Map<string, CharacterDefinition>()
const order: string[] = []

export const registerCharacter = (definition: CharacterDefinition): void => {
  if (byId.has(definition.id)) {
    byId.set(definition.id, definition)
    return
  }
  byId.set(definition.id, definition)
  order.push(definition.id)
}

export const getCharacter = (id: string): CharacterDefinition | undefined =>
  byId.get(id)

export const listCharacters = (): CharacterDefinition[] =>
  order.map((id) => byId.get(id)!).filter(Boolean)

export const clearCharacterRegistry = (): void => {
  byId.clear()
  order.length = 0
}
