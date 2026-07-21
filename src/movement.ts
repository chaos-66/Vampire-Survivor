import type { Vec2 } from './vec'

export type Player = {
  x: number
  y: number
  radius: number
}

export type Arena = {
  width: number
  height: number
}

/** Logical units per second. */
export const PLAYER_SPEED = 220

/** Cap a single frame so long hangs do not teleport the player. */
export const MAX_DELTA_SECONDS = 0.05

export const clampDeltaSeconds = (
  dt: number,
  max: number = MAX_DELTA_SECONDS,
): number => {
  if (!Number.isFinite(dt) || dt < 0) {
    return 0
  }
  return Math.min(dt, max)
}

/** Keeps the player's full circle inside the arena (not just the center). */
export const clampPlayerToArena = (player: Player, arena: Arena): Player => {
  const minX = player.radius
  const maxX = arena.width - player.radius
  const minY = player.radius
  const maxY = arena.height - player.radius

  return {
    ...player,
    x: Math.min(Math.max(player.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(player.y, minY), Math.max(minY, maxY)),
  }
}

/**
 * Advances the player using a unit (or zero) direction and delta time in seconds.
 * Speed is units per second; displacement is independent of display frame rate.
 */
export const stepPlayer = (
  player: Player,
  direction: Vec2,
  speed: number,
  dtSeconds: number,
  arena: Arena,
): Player => {
  const next: Player = {
    ...player,
    x: player.x + direction.x * speed * dtSeconds,
    y: player.y + direction.y * speed * dtSeconds,
  }
  return clampPlayerToArena(next, arena)
}

export const createPlayer = (arena: Arena, radius = 16): Player =>
  clampPlayerToArena(
    {
      x: arena.width / 2,
      y: arena.height / 2,
      radius,
    },
    arena,
  )
