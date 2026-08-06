/**
 * 局内结果解析（纯函数）。
 * 优先级：生命 <= 0 失败 > 有效时间 >= RUN_DURATION_SECONDS 胜利 > 进行中。
 * 不负责模拟；由 game-loop 在钳制时间与生命后调用。
 */

import { RUN_DURATION_SECONDS } from './constants'

export type RunOutcome = 'running' | 'won' | 'lost'

export const resolveRunOutcome = (
  health: number,
  elapsedActiveSeconds: number,
): RunOutcome => {
  if (health <= 0) {
    return 'lost'
  }
  if (elapsedActiveSeconds >= RUN_DURATION_SECONDS) {
    return 'won'
  }
  return 'running'
}

/** 本帧允许推进的有效战斗时间，使 elapsed 最多到 RUN_DURATION_SECONDS，不越过。 */
export const clampDtToRunRemaining = (
  elapsedActiveSeconds: number,
  dtSeconds: number,
): number => {
  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return 0
  }
  const elapsed = Number.isFinite(elapsedActiveSeconds)
    ? Math.max(0, elapsedActiveSeconds)
    : 0
  const remaining = RUN_DURATION_SECONDS - elapsed
  if (remaining <= 0) {
    return 0
  }
  return Math.min(dtSeconds, remaining)
}

export const isTerminalOutcome = (outcome: RunOutcome): boolean =>
  outcome === 'won' || outcome === 'lost'

export const isRestartCode = (code: string): boolean =>
  code === 'KeyR'

export const isPlainRestartEvent = (event: {
  code: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  shiftKey: boolean
}): boolean =>
  isRestartCode(event.code) &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey &&
  !event.shiftKey
