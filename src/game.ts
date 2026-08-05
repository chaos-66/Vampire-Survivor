/**
 * 薄公共门面：re-export 真实模块 API + 少量测试状态封装。
 * 不写死升级列表，不复制武器/升级核心规则。
 */

import { ensureContentRegistered } from './content/bootstrap'

ensureContentRegistered()

export type { GameState, Rng } from './core/game-state'
export {
  createGameState,
  createSequenceRng,
  defaultRng,
  experienceThresholdForLevel,
} from './core/game-state'
export { updateGame } from './core/game-loop'
export {
  DIFFICULTY_PROFILES,
  getDifficultyProfile,
  splitDifficultyTime,
} from './core/difficulty'
export type {
  DifficultyProfile,
  DifficultyTier,
  DifficultyTimeSlice,
} from './core/difficulty'
export {
  ATTACK_COOLDOWN,
  CONTACT_COOLDOWN,
  CONTACT_DAMAGE,
  ENEMY_CAP,
  ENEMY_MAX_HEALTH,
  ENEMY_RADIUS,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_SPEED,
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

export type { Enemy, Projectile } from './combat/enemy-types'
export type { Drop } from './drops/drop-types'
export type { DropDefinition } from './drops/drop-definition'
export type { PickupDefinition } from './drops/pickup-definition'
export { createDrop } from './drops/drop-factory'
export {
  registerDrop,
  getDrop,
  listDrops,
  clearDropRegistry,
} from './drops/drop-registry'
export {
  registerPickup,
  getPickup,
  listPickups,
  clearPickupRegistry,
} from './drops/pickup-registry'
export type { EnemyDefinition } from './enemies/enemy-definition'
export { createEnemy } from './enemies/enemy-factory'
export {
  registerEnemy,
  getEnemy,
  listEnemies,
  clearEnemyRegistry,
} from './enemies/enemy-registry'
export {
  edgeSpawnPosition,
  spawnEnemyOnEdge,
  chasePlayer,
} from './combat/enemy-system'
export { projectileOutOfBounds } from './combat/projectile-system'

export type { CombatPlayer } from './actors/player-types'
export type { WorldObject } from './world/world-object'
export {
  createStaticWorldObjects,
  circleIntersectsWorldObject,
  worldObjectIntersectsView,
  queryVisibleWorldObjects,
} from './world/world-object'
export { movePlayerAroundObstacles } from './world/obstacle-collision'

export {
  applyUpgradeChoice,
  tryEnterPendingUpgrade,
  upgradeIdFromDigitCode,
} from './progression/upgrade-system'
export type {
  UpgradeOption,
  PendingUpgrade,
  ProgressionDefinition,
} from './progression/progression-definition'
export { generateUpgradeOffers } from './progression/offer-generator'
export {
  listProgressions,
  getProgression,
  registerProgression,
  clearProgressionRegistry,
} from './progression/progression-registry'
export {
  listProgressionCategories,
  getProgressionCategory,
  registerProgressionCategory,
  clearProgressionCategoryRegistry,
} from './progression/progression-category'
export {
  ensureContentRegistered,
  registerDefaultContent,
  resetAllContentRegistriesForTests,
} from './content/bootstrap'

export {
  cssPointToLogical,
  getUpgradeCardRects,
  upgradeIdAtPoint,
  type Rect,
} from './ui/canvas-coordinates'

export { zeroVec } from './vec'
export type { Arena } from './movement'
export type { UpgradeId } from './progression/types-compat'

export {
  getCharacter,
  listCharacters,
  registerCharacter,
  clearCharacterRegistry,
} from './actors/character-registry'
export {
  getWeapon,
  listWeapons,
  registerWeapon,
  clearWeaponRegistry,
} from './weapons/weapon-registry'
export { advanceWeapons } from './weapons/weapon-system'
export { createWeaponProgressionDefinition } from './weapons/weapon-progression'
export type { WeaponDefinition, WeaponInstance } from './weapons/weapon-definition'

// 状态封装：名称与旧测试一致
export {
  advanceSpawnsOnState as advanceSpawns,
  advanceEnemyChasesOnState as advanceEnemyChases,
  applyContactDamageOnState as applyContactDamage,
  advanceProjectilesOnState as advanceProjectiles,
  pickupDropsOnState as pickupDrops,
  spawnExperienceDropAtOnState as spawnExperienceDropAt,
  advanceAutoAttackOnState as advanceAutoAttack,
  fireAtEnemyOnState as fireAtEnemy,
  selectNearestEnemy,
  movePlayerOnState as movePlayer,
} from './game-facade-helpers'
