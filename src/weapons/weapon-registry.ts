/**
 * 武器注册表。
 * 重复 ID 策略（按对象身份，不比较函数源码）：
 * - 同一 definition 对象再次注册：幂等
 * - 同 ID 但不同对象：抛错（即使元数据相同，行为也可能不同）
 * 默认 bootstrap 导出稳定单例，因此可安全重复调用。
 */

import type { WeaponDefinition } from './weapon-definition'

const byId = new Map<string, WeaponDefinition>()
const order: string[] = []

export const registerWeapon = (definition: WeaponDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (existing === definition) {
      return
    }
    throw new Error(
      `Weapon already registered with a different definition object: ${definition.id}`,
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