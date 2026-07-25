/**
 * 游戏更新协调器（纯逻辑）。
 *
 * 固定顺序（pendingUpgrade 时整段跳过）：
 * 1 玩家移动（世界坐标，受世界边界限制）
 * 2 敌人生成（视口外围，需 FrameContext）
 * 3 敌人追踪
 * 4 接触伤害
 * 5 武器
 * 6 投射物和击杀
 * 7 经验拾取
 *
 * 不导入 window/document；相机只通过纯 FrameContext 影响刷怪可见矩形。
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
import type { FrameContext } from '../world/frame-context'
import { viewRectFromCamera } from '../world/frame-context'
import { splitDifficultyTime } from './difficulty'

export const updateGame = (
  state: GameState,
  direction: Vec2,
  dtSeconds: number,
  frame?: FrameContext,
): GameState => {
  if (state.pendingUpgrade !== null) {
    return state
  }

  const dt = dtSeconds
  if (!Number.isFinite(dt) || !(dt > 0)) {
    return state
  }

  const difficultySlices = splitDifficultyTime(state.elapsedActiveSeconds, dt)
  state.elapsedActiveSeconds += dt

  state.player = movePlayer(state.player, direction, dt, state.arena)

  const view = frame ? viewRectFromCamera(frame.camera) : undefined
  for (const slice of difficultySlices) {
    advanceSpawns(state, slice.duration, view, state.player, slice.profile)
  }
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
