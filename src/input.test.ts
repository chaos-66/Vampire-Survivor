import { describe, expect, it } from 'vitest'

import {
  clearInput,
  createInputState,
  getMoveDirection,
  pressKey,
  releaseKey,
} from './input'
import { vecLength } from './vec'

describe('input mapping', () => {
  it('maps W and ArrowUp to up', () => {
    const withW = createInputState()
    pressKey(withW, 'KeyW')
    expect(getMoveDirection(withW)).toEqual({ x: 0, y: -1 })

    const withUp = createInputState()
    pressKey(withUp, 'ArrowUp')
    expect(getMoveDirection(withUp)).toEqual({ x: 0, y: -1 })
  })

  it('maps A/S/D and matching arrows', () => {
    const cases: Array<[string, { x: number; y: number }]> = [
      ['KeyA', { x: -1, y: 0 }],
      ['ArrowLeft', { x: -1, y: 0 }],
      ['KeyS', { x: 0, y: 1 }],
      ['ArrowDown', { x: 0, y: 1 }],
      ['KeyD', { x: 1, y: 0 }],
      ['ArrowRight', { x: 1, y: 0 }],
    ]

    for (const [code, expected] of cases) {
      const state = createInputState()
      pressKey(state, code)
      expect(getMoveDirection(state)).toEqual(expected)
    }
  })

  it('treats WASD and arrows as equivalent for the same direction', () => {
    const wasd = createInputState()
    pressKey(wasd, 'KeyD')
    const arrows = createInputState()
    pressKey(arrows, 'ArrowRight')
    expect(getMoveDirection(wasd)).toEqual(getMoveDirection(arrows))
  })

  it('combines multiple non-opposite keys', () => {
    const state = createInputState()
    pressKey(state, 'KeyW')
    pressKey(state, 'KeyD')
    const dir = getMoveDirection(state)
    expect(dir.x).toBeGreaterThan(0)
    expect(dir.y).toBeLessThan(0)
    expect(vecLength(dir)).toBeCloseTo(1)
  })

  it('cancels opposite directions on the same axis', () => {
    const state = createInputState()
    pressKey(state, 'KeyA')
    pressKey(state, 'KeyD')
    expect(getMoveDirection(state)).toEqual({ x: 0, y: 0 })
  })

  it('returns zero direction when nothing is pressed', () => {
    expect(getMoveDirection(createInputState())).toEqual({ x: 0, y: 0 })
  })

  it('normalizes single-axis directions to unit length', () => {
    const state = createInputState()
    pressKey(state, 'KeyS')
    expect(vecLength(getMoveDirection(state))).toBeCloseTo(1)
  })

  it('normalizes diagonals so length is 1, not ~sqrt(2)', () => {
    const state = createInputState()
    pressKey(state, 'KeyW')
    pressKey(state, 'KeyA')
    const dir = getMoveDirection(state)
    expect(vecLength(dir)).toBeCloseTo(1)
    expect(Math.abs(dir.x)).toBeCloseTo(Math.SQRT1_2)
    expect(Math.abs(dir.y)).toBeCloseTo(Math.SQRT1_2)
  })

  it('ignores non-movement keys', () => {
    const state = createInputState()
    pressKey(state, 'KeyQ')
    expect(getMoveDirection(state)).toEqual({ x: 0, y: 0 })
  })
})

describe('input release and clear', () => {
  it('stops a direction when its key is released', () => {
    const state = createInputState()
    pressKey(state, 'KeyD')
    releaseKey(state, 'KeyD')
    expect(getMoveDirection(state)).toEqual({ x: 0, y: 0 })
  })

  it('keeps other held keys when one key is released', () => {
    const state = createInputState()
    pressKey(state, 'KeyW')
    pressKey(state, 'KeyD')
    releaseKey(state, 'KeyD')
    expect(getMoveDirection(state)).toEqual({ x: 0, y: -1 })
  })

  it('clearInput removes all movement', () => {
    const state = createInputState()
    pressKey(state, 'KeyW')
    pressKey(state, 'KeyA')
    clearInput(state)
    expect(getMoveDirection(state)).toEqual({ x: 0, y: 0 })
  })
})
