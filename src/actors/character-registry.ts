/**
 * 角色注册表：仅保存可选用的静态角色定义。
 * 重复 ID：相同定义幂等；不同定义抛错。
 */

import type { CharacterDefinition } from './character-definition'

const byId = new Map<string, CharacterDefinition>()
const order: string[] = []

const sameCharacter = (
  a: CharacterDefinition,
  b: CharacterDefinition,
): boolean =>
  a.id === b.id &&
  a.name === b.name &&
  a.description === b.description &&
  a.baseStats.maxHealth === b.baseStats.maxHealth &&
  a.baseStats.moveSpeed === b.baseStats.moveSpeed &&
  a.startingWeaponIds.join(',') === b.startingWeaponIds.join(',')

export const registerCharacter = (definition: CharacterDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (sameCharacter(existing, definition)) {
      return
    }
    throw new Error(
      `Character already registered with different data: ${definition.id}`,
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