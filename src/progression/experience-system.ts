/**
 * 掉落生成与拾取（纯逻辑）。
 * 每次实际击杀必掉一个经验掉落；敌人定义可带掉落表按 chance 独立掷骰追加。
 */

import { circlesOverlap } from '../collision'
import type { CombatPlayer } from '../actors/player-types'
import { EXPERIENCE_DROP_ID } from '../content/drops/experience-drop'
import { getEnemy } from '../enemies/enemy-registry'
import { createDrop } from '../drops/drop-factory'
import type { Drop } from '../drops/drop-types'
import { getDrop } from '../drops/drop-registry'
import { getPickup } from '../drops/pickup-registry'
import type { Rng } from '../core/game-state'

export type DropSpawnPoint = { x: number; y: number }

export type KillPoint = DropSpawnPoint & { definitionId: string }

export const spawnExperienceDropsAt = (
  drops: Drop[],
  nextDropId: number,
  points: readonly DropSpawnPoint[],
): { drops: Drop[]; nextDropId: number } => {
  if (points.length === 0) {
    return { drops, nextDropId }
  }

  const spawned = points.map((point, index) =>
    createDrop(EXPERIENCE_DROP_ID, nextDropId + index, point.x, point.y),
  )
  return {
    drops: [...drops, ...spawned],
    nextDropId: nextDropId + spawned.length,
  }
}

export const spawnExperienceDropAt = (
  drops: Drop[],
  nextDropId: number,
  x: number,
  y: number,
): { drops: Drop[]; nextDropId: number } => {
  return spawnExperienceDropsAt(drops, nextDropId, [{ x, y }])
}

/**
 * 击杀掉落：每个击杀先产出必掉经验掉落，再按敌人定义掉落表逐条掷骰。
 * 未注册敌人或掉落定义明确失败，不静默回退。
 */
export const spawnDropsForKills = (
  drops: Drop[],
  nextDropId: number,
  kills: readonly KillPoint[],
  rng: Rng,
): { drops: Drop[]; nextDropId: number } => {
  if (kills.length === 0) {
    return { drops, nextDropId }
  }
  const spawned: Drop[] = []
  let id = nextDropId
  for (const kill of kills) {
    spawned.push(createDrop(EXPERIENCE_DROP_ID, id, kill.x, kill.y))
    id += 1
    const definition = getEnemy(kill.definitionId)
    if (!definition) {
      throw new Error(`Enemy not registered: ${kill.definitionId}`)
    }
    if (definition.drops) {
      for (const roll of definition.drops) {
        if (
          !Number.isFinite(roll.chance) ||
          roll.chance < 0 ||
          roll.chance > 1
        ) {
          throw new Error(
            `Invalid drop chance for ${definition.id}: ${roll.chance}`,
          )
        }
        if (rng() < roll.chance) {
          spawned.push(createDrop(roll.definitionId, id, kill.x, kill.y))
          id += 1
        }
      }
    }
  }
  return { drops: [...drops, ...spawned], nextDropId: id }
}

export const pickupDrops = (
  player: CombatPlayer,
  drops: Drop[],
  experience: number,
): { drops: Drop[]; experience: number; healthDelta: number } => {
  const remaining: Drop[] = []
  let xp = experience
  let healthDelta = 0
  for (const drop of drops) {
    if (circlesOverlap(player, drop)) {
      const definition = getDrop(drop.definitionId)
      if (!definition) {
        throw new Error(`Drop not registered: ${drop.definitionId}`)
      }
      const pickup = getPickup(definition.pickupDefinitionId)
      if (!pickup) {
        throw new Error(`Pickup not registered: ${definition.pickupDefinitionId}`)
      }
      const result = pickup.collect()
      xp += result.experienceDelta
      healthDelta += result.healthDelta
    } else {
      remaining.push(drop)
    }
  }
  return { drops: remaining, experience: xp, healthDelta }
}
