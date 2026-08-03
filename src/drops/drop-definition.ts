/** 掉落静态定义；不持有位置、运行时 ID 或收集状态。 */
export type DropDefinition = {
  id: string
  name: string
  description: string
  radius: number
  pickupDefinitionId: string
}
