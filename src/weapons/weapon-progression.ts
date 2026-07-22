/**
 * 通用武器成长定义生成器（注册式扩展点）。
 *
 * - 武器定义是静态内容（WeaponDefinition）
 * - 武器实例是局内状态（WeaponInstance.level / cooldownRemaining）
 * - 首次获取：玩家尚无该 definitionId → create() 并加入 weapons，level 必须为 1
 * - 已有武器：instance.level + 1，不超过 definition.maxLevel
 * - 达 maxLevel 后 isEligible=false，不再进入候选
 *
 * 不写主循环 if (weaponId === ...)；通过 registry 解析武器定义。
 * 默认 M3 三个属性升级不走此路径，避免改变当前玩法。
 */

import type { ProgressionDefinition } from '../progression/progression-definition'
import { getWeapon } from './weapon-registry'

export type WeaponProgressionOptionMetadata = {
  id: string
  name: string
  description: string
}

export const createWeaponProgressionDefinition = (
  weaponDefinitionId: string,
  optionMetadata: WeaponProgressionOptionMetadata,
): ProgressionDefinition => {
  const weapon = getWeapon(weaponDefinitionId)
  if (!weapon) {
    throw new Error(
      `Cannot create weapon progression: weapon not registered: ${weaponDefinitionId}`,
    )
  }

  return {
    id: optionMetadata.id,
    categoryId: 'weapon',
    name: optionMetadata.name,
    description: optionMetadata.description,
    // 武器成长次数上限 = 武器 maxLevel（level 从 1 起，可选次数为 maxLevel）
    maxLevel: weapon.maxLevel,
    isEligible: (context) => {
      const definition = getWeapon(weaponDefinitionId)
      if (!definition) {
        return false
      }
      const owned = context.player.weapons.find(
        (w) => w.definitionId === weaponDefinitionId,
      )
      if (!owned) {
        return true
      }
      return owned.level < definition.maxLevel
    },
    apply: (context) => {
      const definition = getWeapon(weaponDefinitionId)
      if (!definition) {
        throw new Error(
          `Weapon definition missing during apply: ${weaponDefinitionId}`,
        )
      }
      const owned = context.player.weapons.find(
        (w) => w.definitionId === weaponDefinitionId,
      )
      if (!owned) {
        const instance = definition.create()
        if (instance.definitionId !== weaponDefinitionId) {
          throw new Error(
            `Weapon create() returned mismatched definitionId: expected ${weaponDefinitionId}, got ${instance.definitionId}`,
          )
        }
        instance.level = 1
        context.player.weapons.push(instance)
        return
      }
      if (owned.level >= definition.maxLevel) {
        return
      }
      owned.level += 1
    },
  }
}