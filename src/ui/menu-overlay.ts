/**
 * 主界面、暂停界面与暂停按钮（屏幕空间，不应用 camera）。
 * 命中测试为纯函数，便于测试；绘制只读状态。
 */

export type ViewportSize = {
  width: number
  height: number
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type Point = {
  x: number
  y: number
}

export const rectContainsPoint = (rect: Rect, point: Point): boolean =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height

const centeredButton = (
  viewport: ViewportSize,
  width: number,
  height: number,
  y: number,
): Rect => ({
  x: (viewport.width - width) / 2,
  y,
  width,
  height,
})

/** 主界面"开始游戏"按钮。 */
export const getStartButtonRect = (viewport: ViewportSize): Rect =>
  centeredButton(viewport, 220, 56, viewport.height / 2 + 40)

export const startButtonContainsPoint = (
  viewport: ViewportSize,
  point: Point,
): boolean => rectContainsPoint(getStartButtonRect(viewport), point)

/** 暂停界面"继续游戏"按钮。 */
export const getContinueButtonRect = (viewport: ViewportSize): Rect =>
  centeredButton(viewport, 220, 56, viewport.height / 2 - 10)

export const continueButtonContainsPoint = (
  viewport: ViewportSize,
  point: Point,
): boolean => rectContainsPoint(getContinueButtonRect(viewport), point)

/** 暂停界面"返回主界面"按钮。 */
export const getQuitButtonRect = (viewport: ViewportSize): Rect =>
  centeredButton(viewport, 220, 56, viewport.height / 2 + 60)

export const quitButtonContainsPoint = (
  viewport: ViewportSize,
  point: Point,
): boolean => rectContainsPoint(getQuitButtonRect(viewport), point)

/** 游戏内右上角"暂停"按钮。 */
export const getPauseButtonRect = (viewport: ViewportSize): Rect => ({
  x: viewport.width - 96,
  y: 12,
  width: 84,
  height: 36,
})

export const pauseButtonContainsPoint = (
  viewport: ViewportSize,
  point: Point,
): boolean => rectContainsPoint(getPauseButtonRect(viewport), point)

const drawButton = (
  context: CanvasRenderingContext2D,
  rect: Rect,
  label: string,
): void => {
  context.fillStyle = '#1c2030'
  context.strokeStyle = '#6ec6ff'
  context.lineWidth = 2
  context.fillRect(rect.x, rect.y, rect.width, rect.height)
  context.strokeRect(rect.x, rect.y, rect.width, rect.height)
  context.fillStyle = '#e8dfcf'
  context.font = '700 20px system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2)
  context.textBaseline = 'alphabetic'
}

/** 主界面：深色背景 + 标题 + 开始按钮。 */
export const drawMainMenu = (
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
): void => {
  context.fillStyle = '#11131a'
  context.fillRect(0, 0, viewport.width, viewport.height)

  context.fillStyle = '#e8dfcf'
  context.font = '700 48px system-ui, sans-serif'
  context.textAlign = 'center'
  context.fillText('吸血鬼幸存者', viewport.width / 2, viewport.height / 2 - 90)

  context.font = '500 18px system-ui, sans-serif'
  context.fillStyle = '#c8c0b0'
  context.fillText(
    '坚持 5 分钟，击败敌人并升级',
    viewport.width / 2,
    viewport.height / 2 - 40,
  )

  drawButton(context, getStartButtonRect(viewport), '开始游戏')
}

/** 暂停界面：半透明遮罩 + 继续/返回按钮。 */
export const drawPauseOverlay = (
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
): void => {
  context.fillStyle = 'rgba(0, 0, 0, 0.62)'
  context.fillRect(0, 0, viewport.width, viewport.height)

  context.fillStyle = '#e8dfcf'
  context.font = '700 32px system-ui, sans-serif'
  context.textAlign = 'center'
  context.fillText('已暂停', viewport.width / 2, viewport.height / 2 - 80)

  drawButton(context, getContinueButtonRect(viewport), '继续游戏')
  drawButton(context, getQuitButtonRect(viewport), '返回主界面')
}

/** 游戏内右上角"暂停"小按钮。 */
export const drawPauseButton = (
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
): void => {
  drawButton(context, getPauseButtonRect(viewport), '暂停')
}
