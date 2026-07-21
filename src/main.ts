import './style.css'

import {
  clearInput,
  createInputState,
  getMoveDirection,
  pressKey,
  releaseKey,
} from './input'
import {
  clampDeltaSeconds,
  createPlayer,
  PLAYER_SPEED,
  stepPlayer,
  type Arena,
  type Player,
} from './movement'
import { getStatusMessage } from './status'

const canvas = document.querySelector<HTMLCanvasElement>('#game')

if (!canvas) {
  throw new Error('Game canvas was not found')
}

const context = canvas.getContext('2d')

if (!context) {
  throw new Error('2D canvas is not supported')
}

const arena: Arena = {
  width: canvas.width,
  height: canvas.height,
}

const input = createInputState()
let player: Player = createPlayer(arena)
let lastTimestampMs: number | null = null
let animationFrameId = 0

const statusEl = document.querySelector<HTMLElement>('#status')
if (statusEl) {
  statusEl.textContent = getStatusMessage()
}

const onKeyDown = (event: KeyboardEvent): void => {
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

window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
window.addEventListener('blur', onBlur)
document.addEventListener('visibilitychange', onVisibilityChange)

const draw = (): void => {
  context.fillStyle = '#11131a'
  context.fillRect(0, 0, arena.width, arena.height)

  context.strokeStyle = '#343744'
  context.lineWidth = 2
  context.strokeRect(1, 1, arena.width - 2, arena.height - 2)

  context.fillStyle = '#6ec6ff'
  context.beginPath()
  context.arc(player.x, player.y, player.radius, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#e8dfcf'
  context.font = '600 14px system-ui, sans-serif'
  context.textAlign = 'left'
  context.fillText(getStatusMessage(), 12, 24)
  context.fillText(
    `pos ${player.x.toFixed(0)}, ${player.y.toFixed(0)}`,
    12,
    44,
  )
}

const frame = (timestampMs: number): void => {
  if (lastTimestampMs === null) {
    lastTimestampMs = timestampMs
  }

  const dtSeconds = clampDeltaSeconds((timestampMs - lastTimestampMs) / 1000)
  lastTimestampMs = timestampMs

  const direction = getMoveDirection(input)
  player = stepPlayer(player, direction, PLAYER_SPEED, dtSeconds, arena)
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
  },
  { once: true },
)
