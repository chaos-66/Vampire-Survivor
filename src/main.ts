import './style.css'

import {
  clearInput,
  createInputState,
  getMoveDirection,
  pressKey,
  releaseKey,
} from './input'
import {
  createGameState,
  updateGame,
  type GameState,
} from './game'
import { clampDeltaSeconds } from './movement'
import { getStatusMessage } from './status'

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

  for (const enemy of game.enemies) {
    context.fillStyle = '#e85d5d'
    context.beginPath()
    context.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2)
    context.fill()
    const ratio = enemy.health / enemy.maxHealth
    context.fillStyle = '#2a2d38'
    context.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 8, enemy.radius * 2, 4)
    context.fillStyle = '#f0c14a'
    context.fillRect(
      enemy.x - enemy.radius,
      enemy.y - enemy.radius - 8,
      enemy.radius * 2 * ratio,
      4,
    )
  }

  for (const projectile of game.projectiles) {
    context.fillStyle = '#f5f0a8'
    context.beginPath()
    context.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2)
    context.fill()
  }

  context.fillStyle = hitFlashRemaining > 0 ? '#ff9a6b' : '#6ec6ff'
  context.beginPath()
  context.arc(game.player.x, game.player.y, game.player.radius, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#e8dfcf'
  context.font = '600 14px system-ui, sans-serif'
  context.textAlign = 'left'
  context.fillText(getStatusMessage(), 12, 24)
  context.fillText(
    `HP ${game.player.health} / ${game.player.maxHealth}`,
    12,
    44,
  )
  context.fillText(`Defeated ${game.defeatedCount}`, 12, 64)
  context.fillText(`Enemies ${game.enemies.length}`, 12, 84)
}

const frame = (timestampMs: number): void => {
  if (lastTimestampMs === null) {
    lastTimestampMs = timestampMs
  }

  const dtSeconds = clampDeltaSeconds((timestampMs - lastTimestampMs) / 1000)
  lastTimestampMs = timestampMs

  const hpBefore = game.player.health
  const direction = getMoveDirection(input)
  game = updateGame(game, direction, dtSeconds)
  if (game.player.health < hpBefore) {
    hitFlashRemaining = 0.12
  }
  if (hitFlashRemaining > 0) {
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
  },
  { once: true },
)
