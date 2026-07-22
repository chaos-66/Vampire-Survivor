/**
 * 角色定义（静态内容）。
 * 与运行时玩家状态分离：定义只描述基线与起始配置，不持有当前生命或局内强化。
 * 本 checkpoint 不包含 trait 系统，故不声明 traitIds，避免假扩展点。
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
}