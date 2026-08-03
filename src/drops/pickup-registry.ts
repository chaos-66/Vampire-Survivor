/** 拾取注册表：同一对象幂等，同 ID 不同对象抛错。 */
import type { PickupDefinition } from './pickup-definition'

const byId = new Map<string, PickupDefinition>()
const order: string[] = []

export const registerPickup = (definition: PickupDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (existing === definition) {
      return
    }
    throw new Error(
      `Pickup already registered with a different definition object: ${definition.id}`,
    )
  }
  byId.set(definition.id, definition)
  order.push(definition.id)
}

export const getPickup = (id: string): PickupDefinition | undefined => byId.get(id)

export const listPickups = (): PickupDefinition[] =>
  order.map((id) => byId.get(id)!).filter(Boolean)

export const clearPickupRegistry = (): void => {
  byId.clear()
  order.length = 0
}
