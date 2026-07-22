/**
 * 武器定义与运行时实例（静态定义 vs 局内状态）。
 * 武器通过 WeaponUpdateContext 产生投射物，不直接碰 DOM/Canvas，也不应改写完整 GameState。
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
  level: number
  cooldownRemaining: number
}

export type WeaponUpdateContext = {
  dtSeconds: number
  player: CombatPlayer
  enemies: readonly Enemy[]
  /** 受控生成接口：武器只提交请求，不直接改数组。 */
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
