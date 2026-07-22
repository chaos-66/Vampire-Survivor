/**
 * 接触伤害：基于模拟时间的 cooldown，不按帧数。
 */

import { circlesOverlap } from '../collision'
import { CONTACT_COOLDOWN, CONTACT_DAMAGE } from '../core/constants'
import type { CombatPlayer } from '../actors/player-types'
import type { Enemy } from './enemy-types'

export const applyContactDamage = (
  player: CombatPlayer,
  enemies: readonly Enemy[],
  contactCooldownRemaining: number,
  dt: number,
): { player: CombatPlayer; contactCooldownRemaining: number } => {
  let cooldown = Math.max(0, contactCooldownRemaining - dt)
  if (cooldown > 0) {
    return { player, contactCooldownRemaining: cooldown }
  }
  const touching = enemies.some((enemy) => circlesOverlap(player, enemy))
  if (!touching) {
    return { player, contactCooldownRemaining: cooldown }
  }
  return {
    player: {
      ...player,
      health: Math.max(0, player.health - CONTACT_DAMAGE),
    },
    contactCooldownRemaining: CONTACT_COOLDOWN,
  }
}