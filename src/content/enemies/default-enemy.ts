/** 当前唯一基础敌人；数值保持 M2-M4 已验收基线。 */
import type { EnemyDefinition } from '../../enemies/enemy-definition'
import {
  ENEMY_MAX_HEALTH,
  ENEMY_RADIUS,
  ENEMY_SPEED,
} from '../../core/constants'

export const DEFAULT_ENEMY_ID = 'default_enemy'

export const defaultEnemy: EnemyDefinition = {
  id: DEFAULT_ENEMY_ID,
  name: '基础敌人',
  description: '现有追逐敌人的基线定义',
  radius: ENEMY_RADIUS,
  speed: ENEMY_SPEED,
  maxHealth: ENEMY_MAX_HEALTH,
  spawnWeight: 2,
}
