import { normalize, type Vec2, zeroVec } from './vec'

/** Browser `KeyboardEvent.code` values that contribute to movement. */
const MOVE_CODES = {
  KeyW: { x: 0, y: -1 },
  ArrowUp: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  ArrowDown: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  ArrowLeft: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
} as const

export type MoveCode = keyof typeof MOVE_CODES

export type InputState = {
  pressed: Set<string>
}

export const createInputState = (): InputState => ({
  pressed: new Set(),
})

export const isMoveCode = (code: string): code is MoveCode =>
  Object.prototype.hasOwnProperty.call(MOVE_CODES, code)

export const pressKey = (state: InputState, code: string): void => {
  if (isMoveCode(code)) {
    state.pressed.add(code)
  }
}

export const releaseKey = (state: InputState, code: string): void => {
  state.pressed.delete(code)
}

export const clearInput = (state: InputState): void => {
  state.pressed.clear()
}

/**
 * Combines held move keys into a direction.
 * Opposite axes cancel; non-zero results are normalized so diagonals are not faster.
 */
export const getMoveDirection = (state: InputState): Vec2 => {
  let x = 0
  let y = 0

  for (const code of state.pressed) {
    if (!isMoveCode(code)) {
      continue
    }
    const contribution = MOVE_CODES[code]
    x += contribution.x
    y += contribution.y
  }

  if (x === 0 && y === 0) {
    return zeroVec()
  }

  return normalize({ x, y })
}
