/** 从已注册静态定义创建运行时掉落实例。 */
import type { Drop } from './drop-types'
import { getDrop } from './drop-registry'
import { getPickup } from './pickup-registry'

export const createDrop = (
  definitionId: string,
  id: number,
  x: number,
  y: number,
): Drop => {
  const definition = getDrop(definitionId)
  if (!definition) {
    throw new Error(`Drop not registered: ${definitionId}`)
  }
  if (!getPickup(definition.pickupDefinitionId)) {
    throw new Error(`Pickup not registered: ${definition.pickupDefinitionId}`)
  }
  return { id, definitionId: definition.id, x, y, radius: definition.radius }
}
