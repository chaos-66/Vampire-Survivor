/**
 * 成长分类注册表：stat / weapon / item 等体系标签。
 * item 仅注册分类，不实现道具内容。
 *
 * 分类是不可变数据值：同 ID 且 name/order 相同则幂等；
 * 同 ID 但字段不同则抛错（无行为函数，故可按值比较）。
 */

export type ProgressionCategoryDefinition = {
  id: string
  name: string
  order: number
}

const byId = new Map<string, ProgressionCategoryDefinition>()
const orderIds: string[] = []

export const registerProgressionCategory = (
  definition: ProgressionCategoryDefinition,
): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (
      existing.name === definition.name &&
      existing.order === definition.order
    ) {
      return
    }
    throw new Error(
      `Progression category already registered with different data: ${definition.id}`,
    )
  }
  byId.set(definition.id, definition)
  orderIds.push(definition.id)
}

export const getProgressionCategory = (
  id: string,
): ProgressionCategoryDefinition | undefined => byId.get(id)

export const listProgressionCategories = (): ProgressionCategoryDefinition[] =>
  orderIds
    .map((id) => byId.get(id)!)
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)

export const clearProgressionCategoryRegistry = (): void => {
  byId.clear()
  orderIds.length = 0
}