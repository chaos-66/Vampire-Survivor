/** 掉落注册表：同一对象幂等，同 ID 不同对象抛错。 */
import type { DropDefinition } from './drop-definition'

const byId = new Map<string, DropDefinition>()
const order: string[] = []

export const registerDrop = (definition: DropDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (existing === definition) {
      return
    }
    throw new Error(
      `Drop already registered with a different definition object: ${definition.id}`,
    )
  }
  byId.set(definition.id, definition)
  order.push(definition.id)
}

export const getDrop = (id: string): DropDefinition | undefined => byId.get(id)

export const listDrops = (): DropDefinition[] =>
  order.map((id) => byId.get(id)!).filter(Boolean)

export const clearDropRegistry = (): void => {
  byId.clear()
  order.length = 0
}
