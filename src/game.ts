/**
 * 兼容门面：对外保持 M1–M3 测试与 main 使用的扁平 API。
 * 实现已拆到 core/combat/progression/weapons/actors/ui/content。
 */

import { ensureContentRegistered } from './content/bootstrap'
import {
  createGameState,
  createSequenceRng,
  defaultRng,
  experienceThresholdForLevel,
  type GameState,
  type Rng,
} from './core/game-state'
import { updateGame } from './core/game-loop'
import {
  ATTACK_COOLDOWN,
  CONTACT_COOLDOWN,
  CONTACT_DAMAGE,
  ENEMY_CAP,
  ENEMY_MAX_HEALTH,
  ENEMY_RADIUS,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_SPEED,
  GEM_CAP,
  GEM_VALUE,
  INITIAL_EXPERIENCE,
  INITIAL_LEVEL,
  MIN_ATTACK_COOLDOWN,
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
  PROJECTILE_DAMAGE,
  PROJECTILE_LIFETIME,
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
} from './core/constants'
import {
  advanceEnemyChases as advanceEnemyChasesList,
  advanceSpawns as advanceSpawnsCore,
  edgeSpawnPosition,
  spawnEnemyOnEdge as spawnEnemyOnEdgeCore,
  chasePlayer,
} from './combat/enemy-system'
import { applyContactDamage as applyContactDamageCore } from './combat/damage-system'
import {
  advanceProjectiles as advanceProjectilesCore,
  projectileOutOfBounds,
} from './combat/projectile-system'
import { advanceWeapons } from './weapons/weapon-system'
import {
  pickupGems as pickupGemsCore,
  spawnGemAt as spawnGemAtCore,
} from './progression/experience-system'
import {
  applyUpgradeChoice,
  tryEnterPendingUpgrade,
  upgradeIdFromDigitCode as upgradeIdFromDigitCodeCore,
} from './progression/upgrade-system'
import {
  cssPointToLogical,
  getUpgradeCardRects,
  upgradeIdAtPoint as upgradeIdAtPointCore,
  type Rect,
} from './ui/canvas-coordinates'
import { listProgressions } from './progression/progression-registry'
import { movePlayer as movePlayerCore } from './actors/player-system'
import type { Enemy } from './combat/enemy-types'
import type { CombatPlayer } from './actors/player-types'
import type {
  UpgradeOption,
  PendingUpgrade,
} from './progression/progression-definition'
import { zeroVec } from './vec'
import { distanceSq } from './collision'
import { normalize, vecLength } from './vec'
import type { Arena } from './movement'
import type { Vec2 } from './vec'
import type { ExperienceGem, Projectile } from './combat/enemy-types'

ensureContentRegistered()

export type {
  GameState,
  Rng,
  Enemy,
  CombatPlayer,
  UpgradeOption,
  PendingUpgrade,
  Rect,
  ExperienceGem,
  Projectile,
}
export type UpgradeId = string

export {
  ATTACK_COOLDOWN,
  CONTACT_COOLDOWN,
  CONTACT_DAMAGE,
  ENEMY_CAP,
  ENEMY_MAX_HEALTH,
  ENEMY_RADIUS,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_SPEED,
  GEM_CAP,
  GEM_VALUE,
  INITIAL_EXPERIENCE,
  INITIAL_LEVEL,
  MIN_ATTACK_COOLDOWN,
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
  PROJECTILE_DAMAGE,
  PROJECTILE_LIFETIME,
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
  createGameState,
  createSequenceRng,
  defaultRng,
  experienceThresholdForLevel,
  updateGame,
  applyUpgradeChoice,
  tryEnterPendingUpgrade,
  edgeSpawnPosition,
  projectileOutOfBounds,
  cssPointToLogical,
  getUpgradeCardRects,
  zeroVec,
  chasePlayer,
}

const registeredUpgradeIds = (): string[] =>
  listProgressions().map((d) => d.id)

/** 兼容：固定三项中文选项的快照（注册序）。 */
export const UPGRADE_OPTIONS: UpgradeOption[] = [
  { id: 'swift', name: '迅捷', description: '移动速度 +10%' },
  { id: 'haste', name: '急速', description: '攻击间隔 -10%' },
  { id: 'power', name: '强击', description: '投射物伤害 +5' },
]

export const spawnEnemyOnEdge = (state: GameState): Enemy =>
  spawnEnemyOnEdgeCore(state)

export const advanceSpawns = (state: GameState, dt: number): void => {
  advanceSpawnsCore(state, dt)
}

export const advanceEnemyChases = (state: GameState, dt: number): void => {
  state.enemies = advanceEnemyChasesList(state.enemies, state.player, dt)
}

export const applyContactDamage = (state: GameState, dt: number): void => {
  const result = applyContactDamageCore(
    state.player,
    state.enemies,
    state.contactCooldownRemaining,
    dt,
  )
  state.player = result.player
  state.contactCooldownRemaining = result.contactCooldownRemaining
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

export const fireAtEnemy = (state: GameState, target: Enemy): void => {
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

export const advanceAutoAttack = (state: GameState, dt: number): void => {
  if (state.player.weapons[0]) {
    state.player.weapons[0].cooldownRemaining = state.attackCooldownRemaining
  }
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
  if (state.player.weapons[0]) {
    state.attackCooldownRemaining = state.player.weapons[0].cooldownRemaining
  }
}

export const spawnGemAt = (state: GameState, x: number, y: number): void => {
  const result = spawnGemAtCore(state.gems, state.nextGemId, x, y)
  state.gems = result.gems
  state.nextGemId = result.nextGemId
}

export const advanceProjectiles = (state: GameState, dt: number): void => {
  const step = advanceProjectilesCore(
    state.projectiles,
    state.enemies,
    state.arena,
    dt,
  )
  state.projectiles = step.projectiles
  state.enemies = step.enemies
  state.defeatedCount += step.defeatedDelta
  for (const kill of step.kills) {
    spawnGemAt(state, kill.x, kill.y)
  }
}

export const pickupGems = (state: GameState): void => {
  if (state.pendingUpgrade !== null) {
    return
  }
  const result = pickupGemsCore(state.player, state.gems, state.experience)
  state.gems = result.gems
  state.experience = result.experience
  tryEnterPendingUpgrade(state)
}

export const movePlayer = (
  state: GameState,
  direction: Vec2,
  dt: number,
): void => {
  state.player = movePlayerCore(state.player, direction, dt, state.arena)
}

export const upgradeIdFromDigitCode = (code: string): string | null => {
  const ids = registeredUpgradeIds()
  return upgradeIdFromDigitCodeCore(
    code,
    ids.map((id) => ({ id })),
  )
}

export const upgradeIdAtPoint = (
  arena: Arena,
  point: Vec2,
): string | null => upgradeIdAtPointCore(arena, point, registeredUpgradeIds())

export type { Arena }