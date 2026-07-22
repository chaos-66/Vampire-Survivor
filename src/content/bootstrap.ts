/**
 * 内容启动：注册分类、默认角色、默认武器、三项 M3 升级。
 * 在创建 GameState / 运行测试前调用 ensureContentRegistered。
 */

import { registerCharacter } from '../actors/character-registry'
import { registerWeapon } from '../weapons/weapon-registry'
import { registerProgressionCategory } from '../progression/progression-category'
import { registerProgression } from '../progression/progression-registry'
import { defaultCharacter } from './characters/default-character'
import { defaultProjectileWeapon } from './weapons/default-projectile'
import { swiftUpgrade } from './upgrades/swift'
import { hasteUpgrade } from './upgrades/haste'
import { powerUpgrade } from './upgrades/power'

let registered = false

export const ensureContentRegistered = (): void => {
  if (registered) {
    return
  }
  registerProgressionCategory({ id: 'stat', name: '属性', order: 1 })
  registerProgressionCategory({ id: 'weapon', name: '武器', order: 2 })
  registerProgressionCategory({ id: 'item', name: '道具', order: 3 })

  registerWeapon(defaultProjectileWeapon)
  registerCharacter(defaultCharacter)

  // 顺序固定：1 迅捷 2 急速 3 强击（候选生成按注册序）
  registerProgression(swiftUpgrade)
  registerProgression(hasteUpgrade)
  registerProgression(powerUpgrade)

  registered = true
}

/** 测试用：允许重新注册（先 clear 各表再调用）。 */
export const resetContentRegistrationFlag = (): void => {
  registered = false
}