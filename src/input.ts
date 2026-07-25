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

/** MouseEvent.button / PointerEvent.button: secondary (right) button. */
export const SECONDARY_BUTTON = 2

/** MouseEvent.buttons bit mask for the secondary button. */
export const SECONDARY_BUTTONS_MASK = 2

/**
 * 判断是否为辅助/右键相关指针事件。
 * 不读取或修改任何键盘 InputState。
 */
export const isSecondaryPointerEvent = (event: {
  button?: number
  buttons?: number
}): boolean => {
  if (event.button === SECONDARY_BUTTON) {
    return true
  }
  if (
    typeof event.buttons === 'number' &&
    (event.buttons & SECONDARY_BUTTONS_MASK) !== 0
  ) {
    return true
  }
  return false
}

/**
 * 仅阻止浏览器默认行为（菜单、手势等）。
 * 绝不修改 InputState；右键不是失焦，也不是按键释放。
 */
export const preventSecondaryDefault = (event: {
  preventDefault: () => void
}): void => {
  event.preventDefault()
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
