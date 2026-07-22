/**
 * 武器定义与运行时实例。
 * - definition.maxLevel / instance.level 用于武器成长资格（测试 fixture 可证明）
 * - cooldownRemaining 仅存在于 WeaponInstance，是该武器冷却的唯一状态源
 * 武器通过 WeaponUpdateContext 产生投射物，不碰 DOM，不改写完整 GameState。
 */

import type { Enemy } from '../combat/enemy-types'
import type { CombatPlayer } from '../actors/player-types'

export type ProjectileRequest = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  damage: number
  lifeRemaining: number
}

export type WeaponInstance = {
  definitionId: string
  /** 当前武器等级；与 definition.maxLevel 配合做成长过滤。 */
  level: number
  /** 该武器冷却的唯一状态源。 */
  cooldownRemaining: number
}

export type WeaponUpdateContext = {
  dtSeconds: number
  player: CombatPlayer
  enemies: readonly Enemy[]
  spawnProjectile: (request: ProjectileRequest) => void
}

export type WeaponDefinition = {
  id: string
  name: string
  description: string
  maxLevel: number
  create: () => WeaponInstance
  update: (context: WeaponUpdateContext, instance: WeaponInstance) => void
}