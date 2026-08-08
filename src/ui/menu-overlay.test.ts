/**
 * 主界面/暂停界面按钮命中测试（纯函数）。
 */

import { describe, expect, it } from 'vitest'
import {
  continueButtonContainsPoint,
  getContinueButtonRect,
  getPauseButtonRect,
  getQuitButtonRect,
  getStartButtonRect,
  pauseButtonContainsPoint,
  quitButtonContainsPoint,
  rectContainsPoint,
  startButtonContainsPoint,
} from './menu-overlay'

const viewport = { width: 960, height: 540 }

const center = (r: { x: number; y: number; width: number; height: number }) => ({
  x: r.x + r.width / 2,
  y: r.y + r.height / 2,
})

describe('menu overlay hit tests', () => {
  it('start button is centered and hit-testable', () => {
    const rect = getStartButtonRect(viewport)
    expect(startButtonContainsPoint(viewport, center(rect))).toBe(true)
    expect(
      startButtonContainsPoint(viewport, { x: rect.x - 1, y: rect.y - 1 }),
    ).toBe(false)
  })

  it('continue and quit buttons are distinct regions', () => {
    const cont = getContinueButtonRect(viewport)
    const quit = getQuitButtonRect(viewport)
    expect(cont.y).toBeLessThan(quit.y)
    expect(continueButtonContainsPoint(viewport, center(cont))).toBe(true)
    expect(quitButtonContainsPoint(viewport, center(quit))).toBe(true)
    expect(continueButtonContainsPoint(viewport, center(quit))).toBe(false)
  })

  it('pause button sits in the top-right corner', () => {
    const rect = getPauseButtonRect(viewport)
    expect(rect.x).toBe(viewport.width - 96)
    expect(rect.y).toBe(12)
    expect(pauseButtonContainsPoint(viewport, center(rect))).toBe(true)
    expect(
      pauseButtonContainsPoint(viewport, { x: viewport.width - 8, y: viewport.height - 8 }),
    ).toBe(false)
  })

  it('rectContainsPoint rejects outside points', () => {
    expect(
      rectContainsPoint(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10.1, y: 5 },
      ),
    ).toBe(false)
  })
})
