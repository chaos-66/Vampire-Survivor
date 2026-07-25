/**
 * 经验结晶生成与拾取（纯逻辑）。
 */

import { circlesOverlap } from '../collision'
import { GEM_RADIUS, GEM_VALUE } from '../core/constants'
import type { CombatPlayer } from '../actors/player-types'
import type { ExperienceGem } from '../combat/enemy-types'

export const spawnGemAt = (
  gems: ExperienceGem[],
  nextGemId: number,
  x: number,
  y: number,
): { gems: ExperienceGem[]; nextGemId: number } => {
  return {
    gems: [
      ...gems,
      {
        id: nextGemId,
        x,
        y,
        radius: GEM_RADIUS,
        value: GEM_VALUE,
      },
    ],
    nextGemId: nextGemId + 1,
  }
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
