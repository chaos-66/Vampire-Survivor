/** 从已注册静态定义创建运行时敌人实例。 */
import type { Enemy } from '../combat/enemy-types'
import { getEnemy } from './enemy-registry'

export const createEnemy = (
  definitionId: string,
  id: number,
  x: number,
  y: number,
): Enemy => {
  const definition = getEnemy(definitionId)
  if (!definition) {
    throw new Error(`Enemy not registered: ${definitionId}`)
  }
  return {
    id,
    definitionId: definition.id,
    x,
    y,
    radius: definition.radius,
    speed: definition.speed,
    health: definition.maxHealth,
    maxHealth: definition.maxHealth,
  }
}
