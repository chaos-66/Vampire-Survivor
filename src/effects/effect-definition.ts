import type { CombatPlayer } from '../actors/player-types'

export type EffectModifiers = {
  moveSpeedMultiplier?: number
  attackCooldownMultiplier?: number
  projectileDamageMultiplier?: number
}

export type InstantEffectDefinition = {
  id: string
  name: string
  description: string
  kind: 'instant'
  apply: (player: CombatPlayer) => void
}

export type TimedEffectDefinition = {
  id: string
  name: string
  description: string
  kind: 'timed'
  durationSeconds: number
  stacking: 'refresh' | 'stack'
  maxStacks: number
  modifiers: Readonly<EffectModifiers>
}

export type EffectDefinition = InstantEffectDefinition | TimedEffectDefinition

export type ActiveEffect = {
  definitionId: string
  remainingSeconds: number
  stacks: number
}
