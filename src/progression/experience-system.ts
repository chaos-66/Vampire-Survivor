/**
 * 当前经验掉落生成与拾取（纯逻辑）。
 */

import { circlesOverlap } from '../collision'
import type { CombatPlayer } from '../actors/player-types'
import { EXPERIENCE_DROP_ID } from '../content/drops/experience-drop'
import { createDrop } from '../drops/drop-factory'
import type { Drop } from '../drops/drop-types'
import { getDrop } from '../drops/drop-registry'
import { getPickup } from '../drops/pickup-registry'

export type DropSpawnPoint = { x: number; y: number }

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

export const pickupDrops = (
  player: CombatPlayer,
  drops: Drop[],
  experience: number,
): { drops: Drop[]; experience: number } => {
  const remaining: Drop[] = []
  let xp = experience
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
      xp = pickup.collect(xp)
    } else {
      remaining.push(drop)
    }
  }
  return { drops: remaining, experience: xp }
}
