import type { EffectDefinition } from './effect-definition'

const byId = new Map<string, EffectDefinition>()
const order: string[] = []

export const registerEffect = (definition: EffectDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (existing === definition) return
    throw new Error(
      `Effect already registered with a different definition object: ${definition.id}`,
    )
  }
  byId.set(definition.id, definition)
  order.push(definition.id)
}

export const getEffect = (id: string): EffectDefinition | undefined => byId.get(id)

export const listEffects = (): EffectDefinition[] =>
  order.map((id) => byId.get(id)!).filter(Boolean)

export const clearEffectRegistry = (): void => {
  byId.clear()
  order.length = 0
}
