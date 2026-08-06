/**
 * 测试用状态封装：把系统 API 接到扁平 GameState 上。
 * 不含业务规则副本；规则仍在 combat/progression/weapons 模块。
 */

import type { GameState } from './core/game-state'
import type { Enemy } from './combat/enemy-types'
import type { CombatPlayer } from './actors/player-types'
import type { Vec2 } from './vec'
import type { Arena } from './movement'
import {
  advanceSpawns as advanceSpawnsCore,
  advanceEnemyChases as advanceEnemyChasesList,
} from './combat/enemy-system'
import { applyContactDamage as applyContactDamageCore } from './combat/damage-system'
import { advanceProjectiles as advanceProjectilesCore } from './combat/projectile-system'
import { advanceWeapons } from './weapons/weapon-system'
import {
  pickupDrops as pickupDropsCore,
  spawnExperienceDropAt as spawnExperienceDropAtCore,
  spawnDropsForKills as spawnDropsForKillsCore,
} from './progression/experience-system'
import { tryEnterPendingUpgrade } from './progression/upgrade-system'
import { movePlayer as movePlayerCore } from './actors/player-system'
import { distanceSq } from './collision'
import { normalize, vecLength } from './vec'
import {
  PROJECTILE_LIFETIME,
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
} from './core/constants'

export const advanceSpawnsOnState = (state: GameState, dt: number): void => {
  advanceSpawnsCore(state, dt)
}

export const advanceEnemyChasesOnState = (
  state: GameState,
  dt: number,
): void => {
  state.enemies = advanceEnemyChasesList(state.enemies, state.player, dt)
}

export const applyContactDamageOnState = (
  state: GameState,
  dt: number,
): void => {
  const result = applyContactDamageCore(
    state.player,
    state.enemies,
    state.contactCooldownRemaining,
    dt,
  )
  state.player = result.player
  state.contactCooldownRemaining = result.contactCooldownRemaining
}

export const spawnExperienceDropAtOnState = (
  state: GameState,
  x: number,
  y: number,
): void => {
  const result = spawnExperienceDropAtCore(state.drops, state.nextDropId, x, y)
  state.drops = result.drops
  state.nextDropId = result.nextDropId
}

export const advanceProjectilesOnState = (
  state: GameState,
  dt: number,
): void => {
  const step = advanceProjectilesCore(
    state.projectiles,
    state.enemies,
    state.arena,
    dt,
  )
  state.projectiles = step.projectiles
  state.enemies = step.enemies
  state.defeatedCount += step.defeatedDelta
  const spawned = spawnDropsForKillsCore(
    state.drops,
    state.nextDropId,
    step.kills,
    state.rng,
  )
  state.drops = spawned.drops
  state.nextDropId = spawned.nextDropId
}

export const pickupDropsOnState = (state: GameState): void => {
  if (state.pendingUpgrade !== null) {
    return
  }
  const result = pickupDropsCore(state.player, state.drops, state.experience)
  state.drops = result.drops
  state.experience = result.experience
  if (result.healthDelta !== 0) {
    state.player = {
      ...state.player,
      health: Math.min(
        state.player.maxHealth,
        state.player.health + result.healthDelta,
      ),
    }
  }
  tryEnterPendingUpgrade(state)
}

export const movePlayerOnState = (
  state: GameState,
  direction: Vec2,
  dt: number,
): void => {
  state.player = movePlayerCore(state.player, direction, dt, state.arena)
}

export const selectNearestEnemy = (
  player: CombatPlayer,
  enemies: readonly Enemy[],
): Enemy | null => {
  if (enemies.length === 0) {
    return null
  }
  let best: Enemy | null = null
  let bestDist = Infinity
  for (const enemy of enemies) {
    const d = distanceSq(player.x, player.y, enemy.x, enemy.y)
    if (
      d < bestDist ||
      (d === bestDist && best !== null && enemy.id < best.id) ||
      (d === bestDist && best === null)
    ) {
      best = enemy
      bestDist = d
    }
  }
  return best
}

/** 测试辅助：直接生成一发投射物（不改武器冷却）。 */
export const fireAtEnemyOnState = (state: GameState, target: Enemy): void => {
  const dir = normalize({
    x: target.x - state.player.x,
    y: target.y - state.player.y,
  })
  const velocity =
    vecLength(dir) === 0
      ? { x: PROJECTILE_SPEED, y: 0 }
      : { x: dir.x * PROJECTILE_SPEED, y: dir.y * PROJECTILE_SPEED }
  state.projectiles.push({
    id: state.nextProjectileId,
    x: state.player.x,
    y: state.player.y,
    vx: velocity.x,
    vy: velocity.y,
    radius: PROJECTILE_RADIUS,
    damage: state.player.projectileDamage,
    lifeRemaining: PROJECTILE_LIFETIME,
  })
  state.nextProjectileId += 1
}

/** 测试辅助：推进全部武器实例（唯一冷却源）。 */
export const advanceAutoAttackOnState = (
  state: GameState,
  dt: number,
): void => {
  const fired = advanceWeapons(
    state.player,
    state.enemies,
    state.nextProjectileId,
    dt,
  )
  state.nextProjectileId = fired.nextProjectileId
  if (fired.projectiles.length > 0) {
    state.projectiles.push(...fired.projectiles)
  }
}

export type { Arena }
