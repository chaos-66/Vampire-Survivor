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
import { ensureContentRegistered } from './content/bootstrap'
import { computeWorldBounds } from './world/world'
import {
  createViewport,
  computeBackingStoreSize,
  type Viewport,
} from './world/viewport'
import { computeCamera, type Camera } from './world/camera'

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

// 世界在 run 创建时固定；resize 不改变世界
const worldBounds = computeWorldBounds(viewport.width, viewport.height)
let game: GameState = createGameState(worldBounds)

const applyCanvasSize = (vp: Viewport): void => {
  const backing = computeBackingStoreSize(vp)
  canvas.width = backing.width
  canvas.height = backing.height
  canvas.style.width = `${vp.width}px`
  canvas.style.height = `${vp.height}px`
  // 后续绘制使用 CSS 像素逻辑单位
  context.setTransform(vp.dpr, 0, 0, vp.dpr, 0, 0)
}

applyCanvasSize(viewport)

const input = createInputState()
let lastTimestampMs: number | null = null
let animationFrameId = 0
let hitFlashRemaining = 0

const statusEl = document.querySelector<HTMLElement>('#status')
if (statusEl) {
  statusEl.textContent = getStatusMessage()
}

const currentCamera = (): Camera =>
  computeCamera(game.player.x, game.player.y, game.arena, viewport)

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
    viewport.width,
    viewport.height,
  )
  const optionIds = game.pendingUpgrade.options.map((o) => o.id)
  tryChooseUpgrade(upgradeIdAtPoint(viewport, point, optionIds))
}

const onResize = (): void => {
  const css = readCssSize()
  viewport = createViewport(css.width, css.height, window.devicePixelRatio || 1)
  applyCanvasSize(viewport)
  // 不重建 GameState，不改 world bounds
}

window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
window.addEventListener('blur', onBlur)
document.addEventListener('visibilitychange', onVisibilityChange)
canvas.addEventListener('click', onCanvasClick)
window.addEventListener('resize', onResize)

const draw = (): void => {
  const camera = currentCamera()
  drawWorld(context, game, camera, viewport, hitFlashRemaining)
  drawHud(context, game)
  drawUpgradeOverlay(context, viewport, game.pendingUpgrade)
}

const frame = (timestampMs: number): void => {
  if (lastTimestampMs === null) {
    lastTimestampMs = timestampMs
  }

  const dtSeconds = clampDeltaSeconds((timestampMs - lastTimestampMs) / 1000)
  lastTimestampMs = timestampMs

  const camera = currentCamera()
  const hpBefore = game.player.health
  const direction =
    game.pendingUpgrade !== null ? { x: 0, y: 0 } : getMoveDirection(input)
  game = updateGame(game, direction, dtSeconds, { camera, viewport })
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
    window.removeEventListener('resize', onResize)
  },
  { once: true },
)