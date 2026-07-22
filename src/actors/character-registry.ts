/**
 * 角色注册表。
 * 重复 ID 策略与武器/成长一致：同一对象幂等，同 ID 不同对象抛错。
 */

import type { CharacterDefinition } from './character-definition'

const byId = new Map<string, CharacterDefinition>()
const order: string[] = []

export const registerCharacter = (definition: CharacterDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (existing === definition) {
      return
    }
    throw new Error(
      `Character already registered with a different definition object: ${definition.id}`,
    )
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