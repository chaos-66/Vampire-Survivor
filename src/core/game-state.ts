/**
 * 局内 GameState（扁平运行时状态）。
 * 静态内容在注册表；武器冷却仅在 player.weapons[i].cooldownRemaining。
 */

import { createPlayer, type Arena } from '../movement'
import {
  ATTACK_COOLDOWN,
  INITIAL_EXPERIENCE,
  INITIAL_LEVEL,
  PROJECTILE_DAMAGE,
} from './constants'
import { ensureContentRegistered } from '../content/bootstrap'
import { getCharacter } from '../actors/character-registry'
import { DEFAULT_CHARACTER_ID } from '../content/characters/default-character'
import { getWeapon } from '../weapons/weapon-registry'
import type { CombatPlayer } from '../actors/player-types'
import type { Enemy, ExperienceGem, Projectile } from '../combat/enemy-types'
import type { PendingUpgrade } from '../progression/progression-definition'

export type Rng = () => number

export type GameState = {
  arena: Arena
  player: CombatPlayer
  enemies: Enemy[]
  projectiles: Projectile[]
  gems: ExperienceGem[]
  defeatedCount: number
  spawnAccumulator: number
  contactCooldownRemaining: number
  nextEnemyId: number
  nextProjectileId: number
  nextGemId: number
  level: number
  experience: number
  experienceToNextLevel: number
  pendingUpgrade: PendingUpgrade | null
  progressionLevels: Record<string, number>
  rng: Rng
}

export const experienceThresholdForLevel = (level: number): number =>
  3 + (level - 1) * 2

export const defaultRng = (): Rng => Math.random

export const createSequenceRng = (values: number[]): Rng => {
  let i = 0
  return () => {
    if (i >= values.length) {
      return 0
    }
    const v = values[i]
    i += 1
    return v
  }
}

export const createGameState = (
  arena: Arena,
  rng: Rng = defaultRng(),
  characterId: string = DEFAULT_CHARACTER_ID,
): GameState => {
  ensureContentRegistered()
  const character = getCharacter(characterId)
  if (!character) {
    throw new Error(`Character not registered: ${characterId}`)
  }

  const base = createPlayer(arena)
  const weapons = character.startingWeaponIds.map((weaponId) => {
    const weapon = getWeapon(weaponId)
    if (!weapon) {
      throw new Error(`Weapon not registered: ${weaponId}`)
    }
    return weapon.create()
  })

  const player: CombatPlayer = {
    ...base,
    health: character.baseStats.maxHealth,
    maxHealth: character.baseStats.maxHealth,
    moveSpeed: character.baseStats.moveSpeed,
    attackCooldown: ATTACK_COOLDOWN,
    projectileDamage: PROJECTILE_DAMAGE,
    characterId: character.id,
    weapons,
  }

  return {
    arena,
    player,
    enemies: [],
    projectiles: [],
    gems: [],
    defeatedCount: 0,
    spawnAccumulator: 0,
    contactCooldownRemaining: 0,
    nextEnemyId: 1,
    nextProjectileId: 1,
    nextGemId: 1,
    level: INITIAL_LEVEL,
    experience: INITIAL_EXPERIENCE,
    experienceToNextLevel: experienceThresholdForLevel(INITIAL_LEVEL),
    pendingUpgrade: null,
    progressionLevels: {},
    rng,
  }
}

export { PLAYER_MAX_HEALTH, PLAYER_SPEED, ATTACK_COOLDOWN, PROJECTILE_DAMAGE } from './constants'