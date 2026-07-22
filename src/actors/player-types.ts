/**
 * 玩家运行时状态（局内）。
 * 与 CharacterDefinition 分离：生命、移速强化、武器冷却相关属性等会在局内变化。
 */

import type { Player } from '../movement'
import type { WeaponInstance } from '../weapons/weapon-definition'

export type CombatPlayer = Player & {
  health: number
  maxHealth: number
  moveSpeed: number
  /** 自动武器基础攻击间隔（秒）；急速强化会改写。 */
  attackCooldown: number
  /** 投射物基础伤害；强击强化会改写。 */
  projectileDamage: number
  characterId: string
  weapons: WeaponInstance[]
}
