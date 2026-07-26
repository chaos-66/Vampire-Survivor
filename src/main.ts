import './style.css'

import {
  clearInput,
  createSecondaryPointerState,
  createInputState,
  getMoveDirection,
  isPrimaryPointerEvent,
  isSecondaryPointerEvent,
  isTrackedSecondaryPointer,
  pressKey,
  preventSecondaryDefault,
  releaseSecondaryPointer,
  releaseKey,
  trackSecondaryPointer,
} from './input'
import { createGameState, type GameState } from './core/game-state'
import { updateGame } from './core/game-loop'
import {
  applyUpgradeChoice,
  upgradeIdFromDigitCode,
} from './progression/upgrade-system'
import {
  cssPointToLogical,
  upgradeIdAtPoint,
} from './ui/canvas-coordinates'
import { clampDeltaSeconds } from './movement'
import { getStatusMessage } from './status'
import { drawHud } from './ui/hud'
import { drawUpgradeOverlay } from './ui/upgrade-overlay'
import { drawWorld } from './ui/draw-world'
import {
  drawOutcomeOverlay,
  restartButtonContainsPoint,
} from './ui/outcome-overlay'
import { ensureContentRegistered } from './content/bootstrap'
import { computeWorldBounds } from './world/world'
import {
  createViewport,
  computeBackingStoreSize,
  type Viewport,
} from './world/viewport'
import { computeCamera, type Camera } from './world/camera'
import { isPlainRestartEvent, isTerminalOutcome } from './core/run-outcome'

ensureContentRegistered()

const canvas = document.querySelector<HTMLCanvasElement>('#game')

if (!canvas) {
  throw new Error('Game canvas was not found')
}

const context = canvas.getContext('2d')

if (!context) {
  throw new Error('2D canvas is not supported')
}

const readCssSize = (): { width: number; height: number } => ({
  width: Math.max(1, window.innerWidth || 1),
  height: Math.max(1, window.innerHeight || 1),
})

const initialCss = readCssSize()
let viewport: Viewport = createViewport(
  initialCss.width,
  initialCss.height,
  window.devicePixelRatio || 1,
)

const worldBounds = computeWorldBounds(viewport.width, viewport.height)
let game: GameState = createGameState(worldBounds)

const applyCanvasSize = (vp: Viewport): void => {
  const backing = computeBackingStoreSize(vp)
  canvas.width = backing.width
  canvas.height = backing.height
  canvas.style.width = `${vp.width}px`
  canvas.style.height = `${vp.height}px`
  context.setTransform(vp.dpr, 0, 0, vp.dpr, 0, 0)
}

applyCanvasSize(viewport)

const input = createInputState()
let lastTimestampMs: number | null = null
let animationFrameId = 0
let hitFlashRemaining = 0
const secondaryPointers = createSecondaryPointerState()

const statusEl = document.querySelector<HTMLElement>('#status')
if (statusEl) {
  statusEl.textContent = getStatusMessage()
}

const currentCamera = (): Camera =>
  computeCamera(game.player.x, game.player.y, game.arena, viewport)

/** 完整新 run：新世界、新状态、清键盘、重置帧时钟。 */
const restartRun = (): void => {
  const css = readCssSize()
  viewport = createViewport(css.width, css.height, window.devicePixelRatio || 1)
  applyCanvasSize(viewport)
  const nextWorld = computeWorldBounds(viewport.width, viewport.height)
  game = createGameState(nextWorld)
  clearInput(input)
  lastTimestampMs = null
  hitFlashRemaining = 0
}

const tryChooseUpgrade = (id: string | null): void => {
  if (id === null || game.pendingUpgrade === null) {
    return
  }
  if (isTerminalOutcome(game.outcome)) {
    return
  }
  applyUpgradeChoice(game, id)
}

const onKeyDown = (event: KeyboardEvent): void => {
  if (isTerminalOutcome(game.outcome)) {
    if (event.repeat) {
      return
    }
    if (isPlainRestartEvent(event)) {
      event.preventDefault()
      restartRun()
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

  if (game.pendingUpgrade !== null) {
    if (event.repeat) {
      return
    }
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
  if (!isPrimaryPointerEvent(event)) {
    return
  }
  const rect = canvas.getBoundingClientRect()
  const point = cssPointToLogical(
    event.clientX,
    event.clientY,
    rect,
    viewport.width,
    viewport.height,
  )

  if (isTerminalOutcome(game.outcome)) {
    if (restartButtonContainsPoint(viewport, point)) {
      restartRun()
    }
    return
  }

  if (game.pendingUpgrade === null) {
    return
  }
  const optionIds = game.pendingUpgrade.options.map((o) => o.id)
  tryChooseUpgrade(upgradeIdAtPoint(viewport, point, optionIds))
}

const onCanvasContextMenu = (event: MouseEvent): void => {
  preventSecondaryDefault(event)
}

const releaseSecondaryCapture = (pointerId: number): void => {
  if (!releaseSecondaryPointer(secondaryPointers, pointerId)) {
    return
  }
  try {
    if (canvas.hasPointerCapture?.(pointerId)) {
      canvas.releasePointerCapture(pointerId)
    }
  } catch {
    // ignore
  }
}

const onCanvasPointerDown = (event: PointerEvent): void => {
  if (!isSecondaryPointerEvent(event)) {
    return
  }
  preventSecondaryDefault(event)
  try {
    canvas.setPointerCapture(event.pointerId)
    trackSecondaryPointer(secondaryPointers, event.pointerId)
  } catch {
    // ignore
  }
}

const onCanvasPointerMove = (event: PointerEvent): void => {
  if (!isSecondaryPointerEvent(event)) {
    return
  }
  preventSecondaryDefault(event)
}

const onCanvasPointerUp = (event: PointerEvent): void => {
  const tracked = isTrackedSecondaryPointer(secondaryPointers, event.pointerId)
  if (!isSecondaryPointerEvent(event) && !tracked) {
    return
  }
  preventSecondaryDefault(event)
  releaseSecondaryCapture(event.pointerId)
}

const onCanvasPointerCancel = (event: PointerEvent): void => {
  if (
    isSecondaryPointerEvent(event) ||
    isTrackedSecondaryPointer(secondaryPointers, event.pointerId)
  ) {
    preventSecondaryDefault(event)
  }
  releaseSecondaryCapture(event.pointerId)
}

const onCanvasLostPointerCapture = (event: PointerEvent): void => {
  releaseSecondaryPointer(secondaryPointers, event.pointerId)
}

const onCanvasAuxClick = (event: MouseEvent): void => {
  if (!isSecondaryPointerEvent(event)) {
    return
  }
  preventSecondaryDefault(event)
}

const onCanvasMouseDown = (event: MouseEvent): void => {
  if (!isSecondaryPointerEvent(event)) {
    return
  }
  preventSecondaryDefault(event)
}

const onCanvasMouseUp = (event: MouseEvent): void => {
  if (!isSecondaryPointerEvent(event)) {
    return
  }
  preventSecondaryDefault(event)
}

const onResize = (): void => {
  const css = readCssSize()
  viewport = createViewport(css.width, css.height, window.devicePixelRatio || 1)
  applyCanvasSize(viewport)
}

window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
window.addEventListener('blur', onBlur)
document.addEventListener('visibilitychange', onVisibilityChange)
canvas.addEventListener('click', onCanvasClick)
canvas.addEventListener('contextmenu', onCanvasContextMenu)
canvas.addEventListener('pointerdown', onCanvasPointerDown)
canvas.addEventListener('pointermove', onCanvasPointerMove)
canvas.addEventListener('pointerup', onCanvasPointerUp)
canvas.addEventListener('pointercancel', onCanvasPointerCancel)
canvas.addEventListener('lostpointercapture', onCanvasLostPointerCapture)
canvas.addEventListener('auxclick', onCanvasAuxClick)
canvas.addEventListener('mousedown', onCanvasMouseDown)
canvas.addEventListener('mouseup', onCanvasMouseUp)
window.addEventListener('resize', onResize)

const draw = (): void => {
  const camera = currentCamera()
  drawWorld(context, game, camera, viewport, hitFlashRemaining)
  drawHud(context, game)
  if (!isTerminalOutcome(game.outcome)) {
    drawUpgradeOverlay(context, viewport, game.pendingUpgrade)
  }
  drawOutcomeOverlay(context, viewport, game.outcome)
}

const frame = (timestampMs: number): void => {
  if (lastTimestampMs === null) {
    lastTimestampMs = timestampMs
  }

  const dtSeconds = clampDeltaSeconds((timestampMs - lastTimestampMs) / 1000)
  lastTimestampMs = timestampMs

  const camera = currentCamera()
  const hpBefore = game.player.health
  const terminal = isTerminalOutcome(game.outcome)
  const direction =
    terminal || game.pendingUpgrade !== null
      ? { x: 0, y: 0 }
      : getMoveDirection(input)
  game = updateGame(game, direction, dtSeconds, { camera, viewport })
  if (!terminal && game.player.health < hpBefore) {
    hitFlashRemaining = 0.12
  }
  if (
    hitFlashRemaining > 0 &&
    game.pendingUpgrade === null &&
    !isTerminalOutcome(game.outcome)
  ) {
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
    canvas.removeEventListener('contextmenu', onCanvasContextMenu)
    canvas.removeEventListener('pointerdown', onCanvasPointerDown)
    canvas.removeEventListener('pointermove', onCanvasPointerMove)
    canvas.removeEventListener('pointerup', onCanvasPointerUp)
    canvas.removeEventListener('pointercancel', onCanvasPointerCancel)
    canvas.removeEventListener('lostpointercapture', onCanvasLostPointerCapture)
    canvas.removeEventListener('auxclick', onCanvasAuxClick)
    canvas.removeEventListener('mousedown', onCanvasMouseDown)
    canvas.removeEventListener('mouseup', onCanvasMouseUp)
    window.removeEventListener('resize', onResize)
  },
  { once: true },
)
