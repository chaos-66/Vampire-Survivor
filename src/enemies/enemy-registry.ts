/** 敌人注册表：同一对象幂等，同 ID 不同对象抛错。 */
import type { EnemyDefinition } from './enemy-definition'

const byId = new Map<string, EnemyDefinition>()
const order: string[] = []

export const registerEnemy = (definition: EnemyDefinition): void => {
  const existing = byId.get(definition.id)
  if (existing) {
    if (existing === definition) {
      return
    }
    throw new Error(
      `Enemy already registered with a different definition object: ${definition.id}`,
    )
  }
  byId.set(definition.id, definition)
  order.push(definition.id)
}

export const getEnemy = (id: string): EnemyDefinition | undefined => byId.get(id)

export const listEnemies = (): EnemyDefinition[] =>
  order.map((id) => byId.get(id)!).filter(Boolean)

export const clearEnemyRegistry = (): void => {
  byId.clear()
  order.length = 0
}
