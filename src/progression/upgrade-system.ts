/**
 * 升级进入/应用：pending 冻结由 game-loop 检查；本模块只处理状态转换。
 * 不写 if id === swift/haste/power 长期分支，效果在各 definition.apply。
 */

import type { GameState } from '../core/game-state'
import { experienceThresholdForLevel } from '../core/game-state'
import { generateUpgradeOffers } from './offer-generator'
import { getProgression } from './progression-registry'

export const tryEnterPendingUpgrade = (state: GameState): void => {
  if (state.pendingUpgrade !== null) {
    return
  }
  if (state.experience >= state.experienceToNextLevel) {
    const options = generateUpgradeOffers({
      player: state.player,
      progressionLevels: state.progressionLevels,
    })
    if (options.length > 0) {
      state.pendingUpgrade = { options }
    }
  }
}

export const applyUpgradeChoice = (
  state: GameState,
  upgradeId: string,
): boolean => {
  if (state.pendingUpgrade === null) {
    return false
  }
  const definition = getProgression(upgradeId)
  if (!definition) {
    return false
  }
  const offered = state.pendingUpgrade.options.some((o) => o.id === upgradeId)
  if (!offered) {
    return false
  }

  const current = state.progressionLevels[upgradeId] ?? 0
  if (current >= definition.maxLevel) {
    return false
  }

  definition.apply({
    player: state.player,
    progressionLevels: state.progressionLevels,
  })
  state.progressionLevels[upgradeId] = current + 1

  const cost = state.experienceToNextLevel
  state.experience = Math.max(0, state.experience - cost)
  state.level += 1
  state.experienceToNextLevel = experienceThresholdForLevel(state.level)
  state.pendingUpgrade = null

  tryEnterPendingUpgrade(state)
  return true
}

/** 数字键 1/2/3 映射到当前 pending 选项下标，不硬编码升级 id。 */
export const upgradeIdFromDigitCode = (
  code: string,
  pendingOptions: ReadonlyArray<{ id: string }> | null | undefined,
): string | null => {
  if (!pendingOptions || pendingOptions.length === 0) {
    return null
  }
  let index = -1
  if (code === 'Digit1' || code === 'Numpad1') index = 0
  else if (code === 'Digit2' || code === 'Numpad2') index = 1
  else if (code === 'Digit3' || code === 'Numpad3') index = 2
  if (index < 0 || index >= pendingOptions.length) {
    return null
  }
  return pendingOptions[index].id
}