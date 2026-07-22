/**
 * 武器注册表。
 * 重复 ID：相同定义幂等；不同定义抛错。
 */

import type { WeaponDefinition } from './weapon-definition'

const byId = new Map<string, WeaponDefinition>()
const order: string[] = []

const sameWeapon = (a: WeaponDefinition, b: WeaponDefinition): boolean =>
  a.id === b.id &&
  a.name === b.name &&
  a.description === b.description &&
  a.maxLevel === b.maxLevel

export const registerWeapon = (definition: WeaponDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (sameWeapon(existing, definition)) {
      return
    }
    throw new Error(
      `Weapon already registered with different data: ${definition.id}`,
    )
  }
  byId.set(definition.id, definition)
  order.push(definition.id)
}

export const getWeapon = (id: string): WeaponDefinition | undefined =>
  byId.get(id)

export const listWeapons = (): WeaponDefinition[] =>
  order.map((id) => byId.get(id)!).filter(Boolean)

export const clearWeaponRegistry = (): void => {
  byId.clear()
  order.length = 0
}