/**
 * 内容启动与测试重置。
 * 不使用与 registry 脱节的 hidden registered flag。
 * registerDefaultContent 幂等：重复调用不会重复条目。
 * resetAllContentRegistriesForTests 清空全部表后，可再次 bootstrap 恢复默认内容。
 */

import { registerCharacter, clearCharacterRegistry } from '../actors/character-registry'
import { registerWeapon, clearWeaponRegistry } from '../weapons/weapon-registry'
import { registerEnemy, clearEnemyRegistry } from '../enemies/enemy-registry'
import { registerDrop, clearDropRegistry } from '../drops/drop-registry'
import { registerPickup, clearPickupRegistry } from '../drops/pickup-registry'
import { clearEffectRegistry } from '../effects/effect-registry'
import {
  registerProgressionCategory,
  clearProgressionCategoryRegistry,
} from '../progression/progression-category'
import {
  registerProgression,
  clearProgressionRegistry,
} from '../progression/progression-registry'
import { defaultCharacter } from './characters/default-character'
import { defaultProjectileWeapon } from './weapons/default-projectile'
import { scatterProjectileWeapon } from './weapons/scatter-weapon'
import { swiftUpgrade } from './upgrades/swift'
import { hasteUpgrade } from './upgrades/haste'
import { powerUpgrade } from './upgrades/power'
import { defaultEnemy } from './enemies/default-enemy'
import { fastEnemy } from './enemies/fast-enemy'
import { experienceDrop, experiencePickup } from './drops/experience-drop'
import { foodDrop, foodPickup } from './drops/food-drop'
import { chestDrop, chestPickup } from './drops/chest-drop'
import { createWeaponProgressionDefinition } from '../weapons/weapon-progression'
import type { ProgressionDefinition } from '../progression/progression-definition'
import { SCATTER_WEAPON_ID } from './weapons/scatter-weapon'

/** 模块级缓存保证幂等：同一对象重复注册安全。 */
let scatterWeaponProgression: ProgressionDefinition | null = null

const ensureScatterWeaponProgression = (): ProgressionDefinition => {
  if (scatterWeaponProgression === null) {
    scatterWeaponProgression = createWeaponProgressionDefinition(
      SCATTER_WEAPON_ID,
      {
        id: SCATTER_WEAPON_ID,
        name: '散射弹',
        description: '获得散射弹武器（替换当前武器）：一次发射多颗弹，可升级',
      },
    )
    scatterWeaponProgression.offerWeight = 0.6
  }
  return scatterWeaponProgression
}

/**
 * 注册默认分类、角色、武器、敌人、掉落与升级。
 * 可安全重复调用（依赖各 registry 的幂等行为）。
 */
export const registerDefaultContent = (): void => {
  registerProgressionCategory({ id: 'stat', name: '属性', order: 1 })
  registerProgressionCategory({ id: 'weapon', name: '武器', order: 2 })
  registerProgressionCategory({ id: 'item', name: '道具', order: 3 })

  registerWeapon(defaultProjectileWeapon)
  registerWeapon(scatterProjectileWeapon)
  registerCharacter(defaultCharacter)
  registerEnemy(defaultEnemy)
  registerEnemy(fastEnemy)
  registerPickup(experiencePickup)
  registerDrop(experienceDrop)
  registerPickup(foodPickup)
  registerDrop(foodDrop)
  registerPickup(chestPickup)
  registerDrop(chestDrop)

  // 顺序固定：1 迅捷 2 急速 3 强击；散射弹为武器 offer，生成时优先展示
  registerProgression(swiftUpgrade)
  registerProgression(hasteUpgrade)
  registerProgression(powerUpgrade)
  registerProgression(ensureScatterWeaponProgression())
}

/** 与 registerDefaultContent 同义，保持既有调用点。 */
export const ensureContentRegistered = (): void => {
  registerDefaultContent()
}

/**
 * 测试专用：清空全部内容注册表。
 * 之后必须再次 registerDefaultContent / ensureContentRegistered。
 */
export const resetAllContentRegistriesForTests = (): void => {
  clearCharacterRegistry()
  clearWeaponRegistry()
  clearEnemyRegistry()
  clearDropRegistry()
  clearPickupRegistry()
  clearEffectRegistry()
  clearProgressionRegistry()
  clearProgressionCategoryRegistry()
}
