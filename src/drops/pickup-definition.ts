/** 拾取静态定义；收集逻辑只返回新的经验值，不持有运行时状态。 */
export type PickupDefinition = {
  id: string
  name: string
  description: string
  collect: (experience: number) => number
}
