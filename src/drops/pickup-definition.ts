/** 拾取静态定义；收集逻辑返回纯结果增量，不持有运行时状态。 */
export type PickupResult = {
  experienceDelta: number
  healthDelta: number
}

export type PickupDefinition = {
  id: string
  name: string
  description: string
  collect: () => PickupResult
}
