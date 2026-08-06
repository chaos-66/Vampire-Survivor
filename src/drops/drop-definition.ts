/** 掉落静态定义；不持有位置、运行时 ID 或收集状态。 */
export type DropDefinition = {
  id: string
  name: string
  description: string
  radius: number
  pickupDefinitionId: string
  /** 绘制颜色（数据驱动；绘制层不按内容 ID 硬编码）。 */
  color: string
}
