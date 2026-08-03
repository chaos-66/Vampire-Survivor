/**
 * 内容启动与测试重置。
 * 不使用与 registry 脱节的 hidden registered flag。
 * registerDefaultContent 幂等：重复调用不会重复条目。
 * resetAllContentRegistriesForTests 清空全部表后，可再次 bootstrap 恢复默认内容。
 */

import { registerCharacter, clearCharacterRegistry } from '../actors/character-registry'
import { registerWeapon, clearWeaponRegistry } from '../weapons/weapon-registry'
import { registerEnemy, clearEnemyRegistry } from '../enemies/enemy-registry'
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
import { swiftUpgrade } from './upgrades/swift'
import { hasteUpgrade } from './upgrades/haste'
import { powerUpgrade } from './upgrades/power'
import { defaultEnemy } from './enemies/default-enemy'

/**
 * 注册默认分类、角色、武器、敌人与三项升级。
 * 可安全重复调用（依赖各 registry 的幂等行为）。
 */
export const registerDefaultContent = (): void => {
  registerProgressionCategory({ id: 'stat', name: '属性', order: 1 })
  registerProgressionCategory({ id: 'weapon', name: '武器', order: 2 })
  registerProgressionCategory({ id: 'item', name: '道具', order: 3 })

  registerWeapon(defaultProjectileWeapon)
  registerCharacter(defaultCharacter)
  registerEnemy(defaultEnemy)

  // 顺序固定：1 迅捷 2 急速 3 强击
  registerProgression(swiftUpgrade)
  registerProgression(hasteUpgrade)
  registerProgression(powerUpgrade)
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
  clearProgressionRegistry()
  clearProgressionCategoryRegistry()
}
