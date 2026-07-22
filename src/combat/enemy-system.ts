/**
 * 敌人生成与追踪（纯逻辑）。
 * 世界坐标为逻辑 arena 单位；不依赖 DOM。
 */

import type { Arena } from '../movement'
import type { Vec2 } from '../vec'
import { normalize } from '../vec'
import {
  ENEMY_CAP,
  ENEMY_MAX_HEALTH,
  ENEMY_RADIUS,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_SPEED,
} from '../core/constants'
import type { CombatPlayer } from '../actors/player-types'
import type { Enemy } from './enemy-types'

export type SpawnState = {
  arena: Arena
  enemies: Enemy[]
  spawnAccumulator: number
  nextEnemyId: number
  rng: () => number
}

export const edgeSpawnPosition = (
  arena: Arena,
  edge: number,
  t: number,
  radius: number,
): Vec2 => {
  const u = Math.min(Math.max(t, 0), 1)
  switch (edge) {
    case 0:
      return { x: u * arena.width, y: -radius }
    case 1:
      return { x: arena.width + radius, y: u * arena.height }
    case 2:
      return { x: u * arena.width, y: arena.height + radius }
    default:
      return { x: -radius, y: u * arena.height }
  }
}

export const spawnEnemyOnEdge = (state: SpawnState): Enemy => {
  const edge = Math.floor(state.rng() * 4) % 4
  const t = state.rng()
  const pos = edgeSpawnPosition(state.arena, edge, t, ENEMY_RADIUS)
  const enemy: Enemy = {
    id: state.nextEnemyId,
    x: pos.x,
    y: pos.y,
    radius: ENEMY_RADIUS,
    speed: ENEMY_SPEED,
    health: ENEMY_MAX_HEALTH,
    maxHealth: ENEMY_MAX_HEALTH,
  }
  state.nextEnemyId += 1
  return enemy
}

export const advanceSpawns = (state: SpawnState, dt: number): void => {
  state.spawnAccumulator += dt
  while (
    state.spawnAccumulator >= ENEMY_SPAWN_INTERVAL &&
    state.enemies.length < ENEMY_CAP
  ) {
    state.spawnAccumulator -= ENEMY_SPAWN_INTERVAL
    state.enemies.push(spawnEnemyOnEdge(state))
  }
  if (state.enemies.length >= ENEMY_CAP) {
    state.spawnAccumulator = Math.min(
      state.spawnAccumulator,
      ENEMY_SPAWN_INTERVAL,
    )
  }
}

export const chasePlayer = (
  enemy: Enemy,
  player: CombatPlayer,
  dt: number,
): Enemy => {
  const dx = player.x - enemy.x
  const dy = player.y - enemy.y
  const dir = normalize({ x: dx, y: dy })
  return {
    ...enemy,
    x: enemy.x + dir.x * enemy.speed * dt,
    y: enemy.y + dir.y * enemy.speed * dt,
  }
}

export const advanceEnemyChases = (
  enemies: Enemy[],
  player: CombatPlayer,
  dt: number,
): Enemy[] => enemies.map((enemy) => chasePlayer(enemy, player, dt))