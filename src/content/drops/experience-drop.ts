/** 当前唯一经验掉落；数值保持 M3-M4 已验收基线。 */
import { GEM_RADIUS, GEM_VALUE } from '../../core/constants'
import type { DropDefinition } from '../../drops/drop-definition'
import type { PickupDefinition } from '../../drops/pickup-definition'

export const EXPERIENCE_PICKUP_ID = 'experience_pickup'
export const EXPERIENCE_DROP_ID = 'experience_drop'

export const experiencePickup: PickupDefinition = {
  id: EXPERIENCE_PICKUP_ID,
  name: '经验',
  description: '增加既有经验值',
  collect: (experience) => experience + GEM_VALUE,
}

export const experienceDrop: DropDefinition = {
  id: EXPERIENCE_DROP_ID,
  name: '经验结晶',
  description: '被收集时提供经验',
  radius: GEM_RADIUS,
  pickupDefinitionId: EXPERIENCE_PICKUP_ID,
}
