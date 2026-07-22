/**
 * 武器注册表：保存武器定义。
 * 主循环 / 武器系统按 definitionId 查找并调用 update，不写 if (weaponId === ...)。
 */

import type { WeaponDefinition } from './weapon-definition'

const byId = new Map<string, WeaponDefinition>()
const order: string[] = []

export const registerWeapon = (definition: WeaponDefinition): void => {
  if (byId.has(definition.id)) {
    byId.set(definition.id, definition)
    return
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
