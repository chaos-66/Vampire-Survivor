import './style.css'

import {
  clearInput,
  createInputState,
  getMoveDirection,
  pressKey,
  releaseKey,
} from './input'
import { createGameState, type GameState } from './core/game-state'
import { updateGame } from './core/game-loop'
import { applyUpgradeChoice, upgradeIdFromDigitCode } from './progression/upgrade-system'
import {
  cssPointToLogical,
  upgradeIdAtPoint,
} from './ui/canvas-coordinates'
import { clampDeltaSeconds } from './movement'
import { getStatusMessage } from './status'
import { drawHud } from './ui/hud'
import { drawUpgradeOverlay } from './ui/upgrade-overlay'
import { drawWorld } from './ui/draw-world'
import { ensureContentRegistered } from './content/bootstrap'

ensureContentRegistered()

const canvas = document.querySelector<HTMLCanvasElement>('#game')

if (!canvas) {
  throw new Error('Game canvas was not found')
}

const context = canvas.getContext('2d')

if (!context) {
  throw new Error('2D canvas is not supported')
}

const arena = {
  width: canvas.width,
  height: canvas.height,
}

const input = createInputState()
let game: GameState = createGameState(arena)
let lastTimestampMs: number | null = null
let animationFrameId = 0
let hitFlashRemaining = 0

const statusEl = document.querySelector<HTMLElement>('#status')
if (statusEl) {
  statusEl.textContent = getStatusMessage()
}

/**
 * 选择必须来自当前 pendingUpgrade.options（画面显示列表）。
 */
const tryChooseUpgrade = (id: string | null): void => {
  if (id === null || game.pendingUpgrade === null) {
    return
  }
  applyUpgradeChoice(game, id)
}

const onKeyDown = (event: KeyboardEvent): void => {
  if (game.pendingUpgrade !== null) {
    if (event.repeat) {
      return
    }
    // 绑定当前显示候选，不用全局注册表
    const upgradeId = upgradeIdFromDigitCode(
      event.code,
      game.pendingUpgrade.options,
    )
    if (upgradeId !== null) {
      event.preventDefault()
      tryChooseUpgrade(upgradeId)
      return
    }
    if (
      event.code === 'KeyW' ||
      event.code === 'KeyA' ||
      event.code === 'KeyS' ||
      event.code === 'KeyD' ||
      event.code.startsWith('Arrow')
    ) {
      event.preventDefault()
    }
    return
  }

  pressKey(input, event.code)
  if (
    event.code === 'KeyW' ||
    event.code === 'KeyA' ||
    event.code === 'KeyS' ||
    event.code === 'KeyD' ||
    event.code.startsWith('Arrow')
  ) {
    event.preventDefault()
  }
}

const onKeyUp = (event: KeyboardEvent): void => {
  releaseKey(input, event.code)
}

const onBlur = (): void => {
  clearInput(input)
}

const onVisibilityChange = (): void => {
  if (document.visibilityState === 'hidden') {
    clearInput(input)
  }
}

const onCanvasClick = (event: MouseEvent): void => {
  if (game.pendingUpgrade === null) {
    return
  }
  const rect = canvas.getBoundingClientRect()
  const point = cssPointToLogical(
    event.clientX,
    event.clientY,
    rect,
    arena.width,
    arena.height,
  )
  const optionIds = game.pendingUpgrade.options.map((o) => o.id)
  tryChooseUpgrade(upgradeIdAtPoint(arena, point, optionIds))
}

window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
window.addEventListener('blur', onBlur)
document.addEventListener('visibilitychange', onVisibilityChange)
canvas.addEventListener('click', onCanvasClick)

const draw = (): void => {
  drawWorld(context, game, hitFlashRemaining)
  drawHud(context, game)
  drawUpgradeOverlay(context, arena, game.pendingUpgrade)
}

const frame = (timestampMs: number): void => {
  if (lastTimestampMs === null) {
    lastTimestampMs = timestampMs
  }

  const dtSeconds = clampDeltaSeconds((timestampMs - lastTimestampMs) / 1000)
  lastTimestampMs = timestampMs

  const hpBefore = game.player.health
  const direction =
    game.pendingUpgrade !== null ? { x: 0, y: 0 } : getMoveDirection(input)
  game = updateGame(game, direction, dtSeconds)
  if (game.player.health < hpBefore) {
    hitFlashRemaining = 0.12
  }
  if (hitFlashRemaining > 0 && game.pendingUpgrade === null) {
    hitFlashRemaining = Math.max(0, hitFlashRemaining - dtSeconds)
  }

  draw()
  animationFrameId = window.requestAnimationFrame(frame)
}

draw()
animationFrameId = window.requestAnimationFrame(frame)

window.addEventListener(
  'beforeunload',
  () => {
    window.cancelAnimationFrame(animationFrameId)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    canvas.removeEventListener('click', onCanvasClick)
  },
  { once: true },
)