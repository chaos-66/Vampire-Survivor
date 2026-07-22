/**
 * 成长分类注册表：stat / weapon / item 等体系标签。
 * item 仅注册分类，不实现道具内容。
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
  if (byId.has(definition.id)) {
    byId.set(definition.id, definition)
    return
  }
  byId.set(definition.id, definition)
  orderIds.push(definition.id)
}

export const listProgressionCategories = (): ProgressionCategoryDefinition[] =>
  orderIds
    .map((id) => byId.get(id)!)
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)

export const clearProgressionCategoryRegistry = (): void => {
  byId.clear()
  orderIds.length = 0
}
