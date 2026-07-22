/**
 * 游戏更新协调器（纯逻辑）。
 *
 * 固定顺序（pendingUpgrade 时整段跳过）：
 * 1 玩家移动
 * 2 敌人生成
 * 3 敌人追踪
 * 4 接触伤害
 * 5 武器（各实例独立 cooldown）
 * 6 投射物（击杀掉落结晶）
 * 7 拾取经验 → 可能进入升级冻结
 *
 * 升级选择期间只停止纯模拟；RAF 仍可绘制冻结画面。
 */

import type { Vec2 } from '../vec'
import type { GameState } from './game-state'
import { movePlayer, clampPlayerHealthAndArena } from '../actors/player-system'
import {
  advanceSpawns,
  advanceEnemyChases,
} from '../combat/enemy-system'
import { applyContactDamage } from '../combat/damage-system'
import { advanceProjectiles } from '../combat/projectile-system'
import { advanceWeapons } from '../weapons/weapon-system'
import { pickupGems, spawnGemAt } from '../progression/experience-system'
import { tryEnterPendingUpgrade } from '../progression/upgrade-system'

export const updateGame = (
  state: GameState,
  direction: Vec2,
  dtSeconds: number,
): GameState => {
  if (state.pendingUpgrade !== null) {
    return state
  }

  const dt = dtSeconds
  if (!(dt > 0)) {
    return state
  }

  state.player = movePlayer(state.player, direction, dt, state.arena)

  advanceSpawns(state, dt)
  state.enemies = advanceEnemyChases(state.enemies, state.player, dt)

  const contact = applyContactDamage(
    state.player,
    state.enemies,
    state.contactCooldownRemaining,
    dt,
  )
  state.player = contact.player
  state.contactCooldownRemaining = contact.contactCooldownRemaining

  const fired = advanceWeapons(
    state.player,
    state.enemies,
    state.nextProjectileId,
    dt,
  )
  state.nextProjectileId = fired.nextProjectileId
  if (fired.projectiles.length > 0) {
    state.projectiles.push(...fired.projectiles)
  }

  const step = advanceProjectiles(
    state.projectiles,
    state.enemies,
    state.arena,
    dt,
  )
  state.projectiles = step.projectiles
  state.enemies = step.enemies
  state.defeatedCount += step.defeatedDelta
  for (const kill of step.kills) {
    const gem = spawnGemAt(state.gems, state.nextGemId, kill.x, kill.y)
    state.gems = gem.gems
    state.nextGemId = gem.nextGemId
  }

  const picked = pickupGems(state.player, state.gems, state.experience)
  state.gems = picked.gems
  state.experience = picked.experience
  tryEnterPendingUpgrade(state)

  state.player = clampPlayerHealthAndArena(state.player, state.arena)
  return state
}