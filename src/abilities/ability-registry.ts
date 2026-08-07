/** 能力注册表：同一对象幂等，同 ID 不同对象抛错。 */
import type { AbilityDefinition } from './ability-definition'

const byId = new Map<string, AbilityDefinition>()
const order: string[] = []

export const registerAbility = (definition: AbilityDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (existing === definition) {
      return
    }
    throw new Error(
      `Ability already registered with a different definition object: ${definition.id}`,
    )
  }
  byId.set(definition.id, definition)
  order.push(definition.id)
}

export const getAbility = (id: string): AbilityDefinition | undefined =>
  byId.get(id)

export const listAbilities = (): AbilityDefinition[] =>
  order.map((id) => byId.get(id)!).filter(Boolean)

export const clearAbilityRegistry = (): void => {
  byId.clear()
  order.length = 0
}
