import './style.css'

import { getBootstrapMessage } from './status'

const canvas = document.querySelector<HTMLCanvasElement>('#game')

if (!canvas) {
  throw new Error('Game canvas was not found')
}

const context = canvas.getContext('2d')

if (!context) {
  throw new Error('2D canvas is not supported')
}

context.fillStyle = '#11131a'
context.fillRect(0, 0, canvas.width, canvas.height)
context.fillStyle = '#e8dfcf'
context.font = '600 28px system-ui, sans-serif'
context.textAlign = 'center'
context.fillText(getBootstrapMessage(), canvas.width / 2, canvas.height / 2)
