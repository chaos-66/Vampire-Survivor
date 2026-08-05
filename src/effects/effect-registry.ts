import type { EffectDefinition } from './effect-definition'

const byId = new Map<string, EffectDefinition>()
const order: string[] = []

export const MAX_EFFECT_STACKS = 64
export const MAX_EFFECT_MULTIPLIER = 1000

const validateTimedDefinition = (definition: EffectDefinition): void => {
  if (definition.kind !== 'timed') return
  if (!Number.isFinite(definition.durationSeconds) || definition.durationSeconds <= 0) {
    throw new Error(`Effect duration must be positive: ${definition.id}`)
  }
  if (
    !Number.isSafeInteger(definition.maxStacks) ||
    definition.maxStacks < 1 ||
    definition.maxStacks > MAX_EFFECT_STACKS
  ) {
    throw new Error(`Effect maxStacks must be a positive integer: ${definition.id}`)
  }
  if (definition.stacking === 'refresh' && definition.maxStacks !== 1) {
    throw new Error(`Refresh effect maxStacks must be 1: ${definition.id}`)
  }
  for (const value of Object.values(definition.modifiers)) {
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > MAX_EFFECT_MULTIPLIER
    ) {
      throw new Error(`Effect modifier must be finite and non-negative: ${definition.id}`)
    }
  }
}

export const registerEffect = (definition: EffectDefinition): void => {
  validateTimedDefinition(definition)
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
