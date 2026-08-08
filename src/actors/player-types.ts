/**
 * 玩家运行时状态（局内）。
 * 与 CharacterDefinition 分离：生命、移速强化、武器冷却相关属性等会在局内变化。
 */

import type { Player } from '../movement'
import type { Vec2 } from '../vec'
import type { WeaponInstance } from '../weapons/weapon-definition'
import type { AbilityInstance } from '../abilities/ability-definition'

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
  /** 附着角色的被动能力实例（与武器持有槽分离，可叠加多个）。 */
  abilities: AbilityInstance[]
  /** 角色朝向（单位方向，默认朝右 (1,0)）；由最后一次非零移动方向更新。 */
  facing: Vec2
}
