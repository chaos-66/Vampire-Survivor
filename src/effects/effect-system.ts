import type { CombatPlayer } from '../actors/player-types'
import type { GameState } from '../core/game-state'
import type { ActiveEffect, EffectModifiers } from './effect-definition'
import { getEffect } from './effect-registry'

const safeMultiplier = (value: number | undefined): number =>
  Number.isFinite(value) && value! >= 0 ? value! : 1

export const applyEffect = (state: GameState, definitionId: string): void => {
  const definition = getEffect(definitionId)
  if (!definition) {
    throw new Error(`Effect not registered: ${definitionId}`)
  }
  if (definition.kind === 'instant') {
    definition.apply(state.player)
    return
  }
  const existing = state.activeEffects.find(
    (effect) => effect.definitionId === definition.id,
  )
  if (!existing) {
    state.activeEffects.push({
      definitionId: definition.id,
      remainingSeconds: definition.durationSeconds,
      stacks: 1,
    })
    return
  }
  existing.remainingSeconds = definition.durationSeconds
  if (definition.stacking === 'stack') {
    existing.stacks = Math.min(definition.maxStacks, existing.stacks + 1)
  }
}

export const advanceActiveEffects = (
  effects: readonly ActiveEffect[],
  dtSeconds: number,
): ActiveEffect[] => {
  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return [...effects]
  return effects
    .map((effect) => ({
      ...effect,
      remainingSeconds: Math.max(0, effect.remainingSeconds - dtSeconds),
    }))
    .filter((effect) => effect.remainingSeconds > 0)
}

export const getNextEffectBoundary = (
  effects: readonly ActiveEffect[],
  maxSeconds: number,
): number => {
  let boundary = maxSeconds
  for (const effect of effects) {
    if (
      Number.isFinite(effect.remainingSeconds) &&
      effect.remainingSeconds > 0
    ) {
      boundary = Math.min(boundary, effect.remainingSeconds)
    }
  }
  return boundary
}

export const getActiveEffectModifiers = (
  effects: readonly ActiveEffect[],
): Required<EffectModifiers> => {
  let moveSpeedMultiplier = 1
  let attackCooldownMultiplier = 1
  let projectileDamageMultiplier = 1
  for (const active of effects) {
    const definition = getEffect(active.definitionId)
    if (!definition || definition.kind !== 'timed') {
      throw new Error(`Timed effect not registered: ${active.definitionId}`)
    }
    const stacks = Math.max(1, Math.floor(active.stacks))
    moveSpeedMultiplier *= safeMultiplier(definition.modifiers.moveSpeedMultiplier) ** stacks
    attackCooldownMultiplier *=
      safeMultiplier(definition.modifiers.attackCooldownMultiplier) ** stacks
    projectileDamageMultiplier *=
      safeMultiplier(definition.modifiers.projectileDamageMultiplier) ** stacks
  }
  return {
    moveSpeedMultiplier,
    attackCooldownMultiplier,
    projectileDamageMultiplier,
  }
}

export const deriveEffectivePlayer = (
  player: CombatPlayer,
  effects: readonly ActiveEffect[],
): CombatPlayer => {
  const modifiers = getActiveEffectModifiers(effects)
  return {
    ...player,
    moveSpeed: player.moveSpeed * modifiers.moveSpeedMultiplier,
    attackCooldown: player.attackCooldown * modifiers.attackCooldownMultiplier,
    projectileDamage: player.projectileDamage * modifiers.projectileDamageMultiplier,
  }
}
