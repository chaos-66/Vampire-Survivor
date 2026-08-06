/** 敌人静态内容定义；不持有位置、当前生命或运行时 ID。 */

/** 敌人自带掉落表条目：独立掷骰的概率掉落（chance ∈ [0,1]）。 */
export type EnemyDropRoll = {
  definitionId: string
  chance: number
}

export type EnemyDefinition = {
  id: string
  name: string
  description: string
  radius: number
  speed: number
  maxHealth: number
  /** 生成权重（可选，默认 1）；权重为 0 的敌人不参与生成。 */
  spawnWeight?: number
  /** 可选掉落表：每次击杀必掉经验后，按 chance 独立掷骰产出额外掉落。 */
  drops?: EnemyDropRoll[]
}
