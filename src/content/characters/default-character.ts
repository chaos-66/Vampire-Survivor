/**
 * 默认角色：复刻 M3 玩家生命与移速，并绑定默认武器。
 */

import {
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
} from '../../core/constants'
import type { CharacterDefinition } from '../../actors/character-definition'
import { DEFAULT_WEAPON_ID } from '../weapons/default-projectile'

export const DEFAULT_CHARACTER_ID = 'default_survivor'

export const defaultCharacter: CharacterDefinition = {
  id: DEFAULT_CHARACTER_ID,
  name: '默认幸存者',
  description: 'M1–M3 基线角色',
  baseStats: {
    maxHealth: PLAYER_MAX_HEALTH,
    moveSpeed: PLAYER_SPEED,
  },
  startingWeaponIds: [DEFAULT_WEAPON_ID],
}