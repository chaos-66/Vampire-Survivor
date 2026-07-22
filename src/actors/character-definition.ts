/**
 * 角色定义（静态内容）。
 * 与运行时 PlayerState 分离：定义只描述基线与起始配置，不持有当前生命或局内强化。
 */

export type CharacterBaseStats = {
  maxHealth: number
  moveSpeed: number
}

export type CharacterDefinition = {
  id: string
  name: string
  description: string
  baseStats: CharacterBaseStats
  /** 起始武器 definitionId 列表；由武器注册表解析。 */
  startingWeaponIds: string[]
  traitIds: string[]
}
