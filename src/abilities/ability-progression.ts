/**
 * 通用能力成长定义生成器（注册式扩展点）。
 * 与武器成长对称：能力是附着角色的被动效果，可叠加多个；
 * 不进入 player.weapons，不触碰武器单件替换语义。
 */

import type { ProgressionDefinition } from '../progression/progression-definition'
import { getAbility } from './ability-registry'
import { createAbility } from './ability-factory'

export type AbilityProgressionOptionMetadata = {
  id: string
  name: string
  description: string
}

export const createAbilityProgressionDefinition = (
  abilityDefinitionId: string,
  optionMetadata: AbilityProgressionOptionMetadata,
): ProgressionDefinition => {
  const ability = getAbility(abilityDefinitionId)
  if (!ability) {
    throw new Error(
      `Cannot create ability progression: ability not registered: ${abilityDefinitionId}`,
    )
  }

  return {
    id: optionMetadata.id,
    categoryId: 'item',
    name: optionMetadata.name,
    description: optionMetadata.description,
    // 能力成长次数上限 = 能力 maxLevel（level 从 1 起，可选次数为 maxLevel）
    maxLevel: ability.maxLevel,
    offerWeight: ability.offerWeight,
    isEligible: (context) => {
      const definition = getAbility(abilityDefinitionId)
      if (!definition) {
        return false
      }
      const owned = context.player.abilities.find(
        (a) => a.definitionId === abilityDefinitionId,
      )
      if (!owned) {
        return true
      }
      return owned.level < definition.maxLevel
    },
    apply: (context) => {
      const definition = getAbility(abilityDefinitionId)
      if (!definition) {
        throw new Error(
          `Ability definition missing during apply: ${abilityDefinitionId}`,
        )
      }
      const owned = context.player.abilities.find(
        (a) => a.definitionId === abilityDefinitionId,
      )
      if (!owned) {
        context.player.abilities.push(createAbility(abilityDefinitionId))
        return
      }
      if (owned.level >= definition.maxLevel) {
        return
      }
      owned.level += 1
    },
  }
}
