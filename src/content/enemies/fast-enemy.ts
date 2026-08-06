/** 第一批真实内容：快速但脆弱的敌人，带概率掉落表。 */
import type { EnemyDefinition } from '../../enemies/enemy-definition'
import { FOOD_DROP_ID } from '../drops/food-drop'
import { CHEST_DROP_ID } from '../drops/chest-drop'

export const FAST_ENEMY_ID = 'fast_enemy'

export const fastEnemy: EnemyDefinition = {
  id: FAST_ENEMY_ID,
  name: '迅捷蝠',
  description: '快速但脆弱，掉落食物与宝箱',
  radius: 12,
  speed: 160,
  maxHealth: 15,
  spawnWeight: 1,
  drops: [
    { definitionId: FOOD_DROP_ID, chance: 0.12 },
    { definitionId: CHEST_DROP_ID, chance: 0.05 },
  ],
}
