/** 宝箱掉落：被收集时提供一次性经验。 */
import { CHEST_XP } from '../../core/constants'
import type { DropDefinition } from '../../drops/drop-definition'
import type { PickupDefinition } from '../../drops/pickup-definition'

export const CHEST_PICKUP_ID = 'chest_pickup'
export const CHEST_DROP_ID = 'chest_drop'

export const chestPickup: PickupDefinition = {
  id: CHEST_PICKUP_ID,
  name: '宝箱',
  description: '提供一次性经验',
  collect: () => ({ experienceDelta: CHEST_XP, healthDelta: 0 }),
}

export const chestDrop: DropDefinition = {
  id: CHEST_DROP_ID,
  name: '宝箱',
  description: '被收集时提供经验',
  radius: 11,
  pickupDefinitionId: CHEST_PICKUP_ID,
  color: '#f0c14a',
}
