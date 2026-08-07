/**
 * 能力定义与运行时实例。
 * 能力是附着在角色身上的被动效果（可叠加多个），与武器持有槽完全分离。
 * 能力通过升级 offer 获取/升级；定义只保存静态数据与推进逻辑。
 */

import type { CombatPlayer } from '../actors/player-types'
import type { Enemy } from '../combat/enemy-types'
import type { Drop } from '../drops/drop-types'
import type { ProjectileRequest } from '../weapons/weapon-definition'

export type AbilityInstance = {
  definitionId: string
  /** 当前能力等级；与 definition.maxLevel 配合做成长过滤。 */
  level: number
  /** 该能力独立冷却的唯一状态源（不占用武器冷却）。 */
  cooldownRemaining: number
}

export type AbilityUpdateContext = {
  dtSeconds: number
  player: CombatPlayer
  enemies: readonly Enemy[]
  /** 当前局内掉落（readonly 数组；吸附等就地修改 Drop 对象）。 */
  drops: readonly Drop[]
  /** 生成一枚普通或追踪投射物（追踪弹设置 homingTurnSpeed）。 */
  spawnProjectile: (request: ProjectileRequest) => void
  /** 将掉落向目标位置吸附（吸经验能力使用）。 */
  pullDrop: (drop: Drop, targetX: number, targetY: number, speed: number) => void
}

export type AbilityDefinition = {
  id: string
  name: string
  description: string
  /** 能力成长次数上限（level 从 1 起）。 */
  maxLevel: number
  /** 升级候选出现权重（可选，默认 1；0 或负值永不进入候选）。 */
  offerWeight?: number
  create: () => AbilityInstance
  update: (context: AbilityUpdateContext, instance: AbilityInstance) => void
}
