/** 食物掉落：被收集时恢复生命。 */
import { FOOD_HEAL } from '../../core/constants'
import type { DropDefinition } from '../../drops/drop-definition'
import type { PickupDefinition } from '../../drops/pickup-definition'

export const FOOD_PICKUP_ID = 'food_pickup'
export const FOOD_DROP_ID = 'food_drop'

export const foodPickup: PickupDefinition = {
  id: FOOD_PICKUP_ID,
  name: '食物',
  description: '恢复生命',
  collect: () => ({ experienceDelta: 0, healthDelta: FOOD_HEAL }),
}

export const foodDrop: DropDefinition = {
  id: FOOD_DROP_ID,
  name: '食物',
  description: '被收集时恢复生命',
  radius: 10,
  pickupDefinitionId: FOOD_PICKUP_ID,
  color: '#ff8c5a',
}
