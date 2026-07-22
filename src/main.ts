import './style.css'

import {
  clearInput,
  createInputState,
  getMoveDirection,
  pressKey,
  releaseKey,
} from './input'
import {
  applyUpgradeChoice,
  createGameState,
  cssPointToLogical,
  getUpgradeCardRects,
  updateGame,
  upgradeIdAtPoint,
  upgradeIdFromDigitCode,
  type GameState,
  type UpgradeId,
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

const tryChooseUpgrade = (id: UpgradeId | null): void => {
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
    const upgradeId = upgradeIdFromDigitCode(event.code)
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
  tryChooseUpgrade(upgradeIdAtPoint(arena, point))
}

window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
window.addEventListener('blur', onBlur)
document.addEventListener('visibilitychange', onVisibilityChange)
canvas.addEventListener('click', onCanvasClick)

const drawUpgradeOverlay = (): void => {
  if (game.pendingUpgrade === null) {
    return
  }

  context.fillStyle = 'rgba(0, 0, 0, 0.55)'
  context.fillRect(0, 0, arena.width, arena.height)

  context.fillStyle = '#e8dfcf'
  context.font = '700 28px system-ui, sans-serif'
  context.textAlign = 'center'
  context.fillText('选择强化', arena.width / 2, arena.height / 2 - 100)

  const rects = getUpgradeCardRects(arena)
  const options = game.pendingUpgrade.options
  for (let i = 0; i < options.length; i += 1) {
    const r = rects[i]
    const option = options[i]
    context.fillStyle = '#1c2030'
    context.strokeStyle = '#6ec6ff'
    context.lineWidth = 2
    context.fillRect(r.x, r.y, r.width, r.height)
    context.strokeRect(r.x, r.y, r.width, r.height)

    context.fillStyle = '#e8dfcf'
    context.font = '700 18px system-ui, sans-serif'
    context.textAlign = 'center'
    context.fillText(
      `${i + 1} ${option.name}`,
      r.x + r.width / 2,
      r.y + 42,
    )
    context.font = '500 14px system-ui, sans-serif'
    context.fillStyle = '#c8c0b0'
    context.fillText(option.description, r.x + r.width / 2, r.y + 74)
  }
}

const draw = (): void => {
  context.fillStyle = '#11131a'
  context.fillRect(0, 0, arena.width, arena.height)

  context.strokeStyle = '#343744'
  context.lineWidth = 2
  context.strokeRect(1, 1, arena.width - 2, arena.height - 2)

  for (const gem of game.gems) {
    context.fillStyle = '#7dffb3'
    context.beginPath()
    context.arc(gem.x, gem.y, gem.radius, 0, Math.PI * 2)
    context.fill()
  }

  for (const enemy of game.enemies) {
    context.fillStyle = '#e85d5d'
    context.beginPath()
    context.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2)
    context.fill()
    const ratio = enemy.health / enemy.maxHealth
    context.fillStyle = '#2a2d38'
    context.fillRect(
      enemy.x - enemy.radius,
      enemy.y - enemy.radius - 8,
      enemy.radius * 2,
      4,
    )
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
    `生命 ${game.player.health} / ${game.player.maxHealth}`,
    12,
    44,
  )
  context.fillText(`击败 ${game.defeatedCount}`, 12, 64)
  context.fillText(`敌人 ${game.enemies.length}`, 12, 84)
  context.fillText(`等级 ${game.level}`, 12, 104)
  context.fillText(
    `经验 ${game.experience} / ${game.experienceToNextLevel}`,
    12,
    124,
  )

  drawUpgradeOverlay()
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
