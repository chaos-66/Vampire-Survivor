/** 敌人静态内容定义；不持有位置、当前生命或运行时 ID。 */
export type EnemyDefinition = {
  id: string
  name: string
  description: string
  radius: number
  speed: number
  maxHealth: number
}
