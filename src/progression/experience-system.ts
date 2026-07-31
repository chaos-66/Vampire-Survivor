/**
 * 经验结晶生成与拾取（纯逻辑）。
 */

import { circlesOverlap } from '../collision'
import { GEM_RADIUS, GEM_VALUE } from '../core/constants'
import type { CombatPlayer } from '../actors/player-types'
import type { ExperienceGem } from '../combat/enemy-types'

export type GemSpawnPoint = { x: number; y: number }

export const spawnGemsAt = (
  gems: ExperienceGem[],
  nextGemId: number,
  points: readonly GemSpawnPoint[],
): { gems: ExperienceGem[]; nextGemId: number } => {
  if (points.length === 0) {
    return { gems, nextGemId }
  }

  const spawned = points.map((point, index) => ({
    id: nextGemId + index,
    x: point.x,
    y: point.y,
    radius: GEM_RADIUS,
    value: GEM_VALUE,
  }))
  return {
    gems: [...gems, ...spawned],
    nextGemId: nextGemId + spawned.length,
  }
}

export const spawnGemAt = (
  gems: ExperienceGem[],
  nextGemId: number,
  x: number,
  y: number,
): { gems: ExperienceGem[]; nextGemId: number } => {
  return spawnGemsAt(gems, nextGemId, [{ x, y }])
}

export const pickupGems = (
  player: CombatPlayer,
  gems: ExperienceGem[],
  experience: number,
): { gems: ExperienceGem[]; experience: number } => {
  const remaining: ExperienceGem[] = []
  let xp = experience
  for (const gem of gems) {
    if (circlesOverlap(player, gem)) {
      xp += gem.value
    } else {
      remaining.push(gem)
    }
  }
  return { gems: remaining, experience: xp }
}
