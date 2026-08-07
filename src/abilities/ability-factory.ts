/** 从已注册静态定义创建运行时能力实例；未注册 ID 明确失败。 */
import type { AbilityInstance } from './ability-definition'
import { getAbility } from './ability-registry'

export const createAbility = (definitionId: string): AbilityInstance => {
  const definition = getAbility(definitionId)
  if (!definition) {
    throw new Error(`Ability not registered: ${definitionId}`)
  }
  const instance = definition.create()
  if (instance.definitionId !== definitionId) {
    throw new Error(
      `Ability create() returned mismatched definitionId: expected ${definitionId}, got ${instance.definitionId}`,
    )
  }
  return instance
}
