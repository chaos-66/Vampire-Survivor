/**
 * 玩家移动：使用运行时 moveSpeed 与 M1 边界钳制。
 */

import {
  clampPlayerToArena,
  stepPlayer,
  type Arena,
} from '../movement'
import type { Vec2 } from '../vec'
import type { CombatPlayer } from './player-types'
import type { WorldObject } from '../world/world-object'
import { movePlayerAroundObstacles } from '../world/obstacle-collision'

export const movePlayer = (
  player: CombatPlayer,
  direction: Vec2,
  dt: number,
  arena: Arena,
  worldObjects: readonly WorldObject[] = [],
): CombatPlayer => {
  const stepped = stepPlayer(
    player,
    direction,
    player.moveSpeed,
    dt,
    arena,
  )
  const resolved = movePlayerAroundObstacles(player, stepped, arena, worldObjects)
  return {
    ...player,
    x: resolved.x,
    y: resolved.y,
    radius: resolved.radius,
  }
}

export const clampPlayerHealthAndArena = (
  player: CombatPlayer,
  arena: Arena,
): CombatPlayer => {
  const clamped = clampPlayerToArena(player, arena)
  return {
    ...player,
    ...clamped,
    health: Math.min(player.maxHealth, Math.max(0, player.health)),
  }
}
