/**
 * 游戏更新协调器（纯逻辑）。
 *
 * 终局（won/lost）时立即返回，不推进任何模拟。
 * 运行中：先钳制本帧 dt 到 60 秒剩余，再模拟，再解析 outcome。
 * 失败（生命<=0）优先于同帧胜利（时间>=60）。
 *
 * 不导入 window/document。
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
import {
  pickupDrops,
  spawnExperienceDropsAt,
} from '../progression/experience-system'
import { tryEnterPendingUpgrade } from '../progression/upgrade-system'
import type { FrameContext } from '../world/frame-context'
import { viewRectFromCamera } from '../world/frame-context'
import { splitDifficultyTime } from './difficulty'
import {
  clampDtToRunRemaining,
  isTerminalOutcome,
  resolveRunOutcome,
} from './run-outcome'
import {
  advanceActiveEffects,
  deriveEffectivePlayer,
  getNextEffectBoundary,
} from '../effects/effect-system'

const simulateActiveSlice = (
  state: GameState,
  direction: Vec2,
  dt: number,
  effectExpiresAtEnd: boolean,
  frame?: FrameContext,
): void => {
  const difficultySlices = splitDifficultyTime(state.elapsedActiveSeconds, dt)
  state.elapsedActiveSeconds += dt

  const effectivePlayer = deriveEffectivePlayer(state.player, state.activeEffects)

  state.player = movePlayer(
    state.player,
    direction,
    dt,
    state.arena,
    state.worldObjects,
    effectivePlayer.moveSpeed,
  )

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
    deriveEffectivePlayer(state.player, state.activeEffects),
    state.enemies,
    state.nextProjectileId,
    dt,
    effectExpiresAtEnd,
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
  const spawnedDrops = spawnExperienceDropsAt(
    state.drops,
    state.nextDropId,
    step.kills,
  )
  state.drops = spawnedDrops.drops
  state.nextDropId = spawnedDrops.nextDropId

  const picked = pickupDrops(state.player, state.drops, state.experience)
  state.drops = picked.drops
  state.experience = picked.experience
  tryEnterPendingUpgrade(state)

  state.player = clampPlayerHealthAndArena(state.player, state.arena)
  state.activeEffects = advanceActiveEffects(state.activeEffects, dt)
  applyTerminalIfNeeded(state)
}

const applyTerminalIfNeeded = (state: GameState): boolean => {
  const next = resolveRunOutcome(
    state.player.health,
    state.elapsedActiveSeconds,
  )
  if (!isTerminalOutcome(next)) {
    return false
  }
  state.outcome = next
  state.pendingUpgrade = null
  return true
}

export const updateGame = (
  state: GameState,
  direction: Vec2,
  dtSeconds: number,
  frame?: FrameContext,
): GameState => {
  if (isTerminalOutcome(state.outcome)) {
    state.pendingUpgrade = null
    return state
  }

  // 已有生命/时间满足终局时，不因 pending 而跳过失败/胜利
  if (applyTerminalIfNeeded(state)) {
    return state
  }

  if (state.pendingUpgrade !== null) {
    return state
  }

  if (!Number.isFinite(dtSeconds) || !(dtSeconds > 0)) {
    return state
  }

  const dt = clampDtToRunRemaining(state.elapsedActiveSeconds, dtSeconds)
  if (!(dt > 0)) {
    applyTerminalIfNeeded(state)
    return state
  }

  let remaining = dt
  while (remaining > 0) {
    const slice = getNextEffectBoundary(state.activeEffects, remaining)
    const effectExpiresAtEnd = state.activeEffects.some(
      (effect) => effect.remainingSeconds === slice,
    )
    simulateActiveSlice(state, direction, slice, effectExpiresAtEnd, frame)
    remaining = Math.max(0, remaining - slice)
    if (
      state.pendingUpgrade !== null ||
      isTerminalOutcome(state.outcome)
    ) {
      break
    }
  }
  return state
}
