import { ENEMY_CAP, ENEMY_SPAWN_INTERVAL } from './constants'

export type DifficultyTier = 1 | 2 | 3 | 4

export type DifficultyProfile = {
  readonly tier: DifficultyTier
  readonly startsAtSeconds: number
  readonly spawnInterval: number
  readonly enemyCap: number
}

export const DIFFICULTY_PROFILES: readonly DifficultyProfile[] = Object.freeze([
  Object.freeze({
    tier: 1,
    startsAtSeconds: 0,
    spawnInterval: ENEMY_SPAWN_INTERVAL,
    enemyCap: ENEMY_CAP,
  }),
  Object.freeze({ tier: 2, startsAtSeconds: 15, spawnInterval: 0.65, enemyCap: 36 }),
  Object.freeze({ tier: 3, startsAtSeconds: 30, spawnInterval: 0.5, enemyCap: 46 }),
  Object.freeze({ tier: 4, startsAtSeconds: 45, spawnInterval: 0.4, enemyCap: 56 }),
])

/** 纯时间映射；无效或负时间按本局起点处理。 */
export const getDifficultyProfile = (
  elapsedActiveSeconds: number,
): DifficultyProfile => {
  const elapsed = Number.isFinite(elapsedActiveSeconds)
    ? Math.max(0, elapsedActiveSeconds)
    : 0

  for (let i = DIFFICULTY_PROFILES.length - 1; i >= 0; i -= 1) {
    const profile = DIFFICULTY_PROFILES[i]
    if (profile && elapsed >= profile.startsAtSeconds) {
      return profile
    }
  }

  return DIFFICULTY_PROFILES[0]
}

export type DifficultyTimeSlice = {
  readonly duration: number
  readonly profile: DifficultyProfile
}

/** 将一帧按档位边界切开，避免跨档 dt 全部使用新档参数。 */
export const splitDifficultyTime = (
  elapsedActiveSeconds: number,
  dtSeconds: number,
): readonly DifficultyTimeSlice[] => {
  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return []
  }

  let cursor = Number.isFinite(elapsedActiveSeconds)
    ? Math.max(0, elapsedActiveSeconds)
    : 0
  const end = cursor + dtSeconds
  const slices: DifficultyTimeSlice[] = []

  while (cursor < end) {
    const profile = getDifficultyProfile(cursor)
    const next = DIFFICULTY_PROFILES[profile.tier]
    const sliceEnd = next ? Math.min(end, next.startsAtSeconds) : end
    const duration = sliceEnd - cursor
    if (duration <= 0) {
      break
    }
    slices.push({ duration, profile })
    cursor = sliceEnd
  }

  return slices
}
