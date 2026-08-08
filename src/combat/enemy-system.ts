/**
 * 敌人生成与追踪（纯逻辑，世界坐标）。
 * 刷怪在当前相机视口外围进行，避免大世界下从世界最外缘生成过远。
 * 不依赖 DOM；接收 ViewRect / WorldBounds 纯数据。
 */

import type { Arena } from '../movement'
import type { Vec2 } from '../vec'
import { normalize } from '../vec'
import {
  ENEMY_RADIUS,
} from '../core/constants'
import type { CombatPlayer } from '../actors/player-types'
import type { Enemy } from './enemy-types'
import type { EnemyDefinition } from '../enemies/enemy-definition'
import { listEnemies } from '../enemies/enemy-registry'
import type { ViewRect } from '../world/frame-context'
import { circlesOverlap } from '../collision'
import type { DifficultyProfile } from '../core/difficulty'
import {
  DIFFICULTY_PROFILES,
  getDifficultyProfile,
} from '../core/difficulty'
import { createEnemy } from '../enemies/enemy-factory'

/** 生成点距视口边缘的外边距（逻辑单位）。 */
export const SPAWN_VIEW_MARGIN = 80
/** 生成点沿视口外侧向世界延伸的最大深度（逻辑单位）。 */
export const SPAWN_VIEW_DEPTH = 160

/** 按 spawnWeight 加权选择敌人定义 ID（确定性：注册表顺序 + 传入 rng）。 */
export const pickEnemyDefinitionId = (
  rng: () => number,
  enemies: readonly EnemyDefinition[],
): string => {
  const weighted = enemies.map((definition) => ({
    definition,
    weight: Math.max(0, definition.spawnWeight ?? 1),
  }))
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0)
  if (!(total > 0)) {
    if (weighted.length === 0) {
      throw new Error('Cannot pick enemy definition: no enemies registered')
    }
    return weighted[0].definition.id
  }
  let cursor = rng() * total
  for (const entry of weighted) {
    cursor -= entry.weight
    if (cursor < 0) {
      return entry.definition.id
    }
  }
  return weighted[weighted.length - 1].definition.id
}

export type SpawnState = {
  /** 世界边界（历史名 arena = 世界，不是屏幕） */
  arena: Arena
  enemies: Enemy[]
  spawnAccumulator: number
  nextEnemyId: number
  rng: () => number
}

export type VisibleSpawnContext = {
  world: Arena
  view: ViewRect
  margin: number
  player: CombatPlayer
  rng: () => number
}

/**
 * 历史 edge spawn（世界边界外侧），保留给旧测试。
 * WORLD 运行时使用 spawnPositionOutsideView。
 */
export const edgeSpawnPosition = (
  arena: Arena,
  edge: number,
  t: number,
  radius: number,
): Vec2 => {
  const u = Math.min(Math.max(t, 0), 1)
  switch (edge) {
    case 0:
      return { x: u * arena.width, y: -radius }
    case 1:
      return { x: arena.width + radius, y: u * arena.height }
    case 2:
      return { x: u * arena.width, y: arena.height + radius }
    default:
      return { x: -radius, y: u * arena.height }
  }
}

/**
 * 在视口外、世界内生成候选点。
 * 边：0 上 1 右 2 下 3 左（仅当该侧有足够世界空间）。
 */
export const spawnPositionOutsideView = (
  ctx: VisibleSpawnContext,
): Vec2 => {
  const { world, view, margin, rng } = ctx
  const m = Number.isFinite(margin) ? Math.max(0, margin) : 0
  // margin 为 0 时仍需严格落在视口外，避免命中测试把边界算作可见。
  const separation = Math.max(0.001, m)
  const sides: number[] = []

  // 上：view.top - m >= 0 且有条带
  if (view.top - separation >= ENEMY_RADIUS) {
    sides.push(0)
  }
  // 右
  if (view.right + separation <= world.width - ENEMY_RADIUS) {
    sides.push(1)
  }
  // 下
  if (view.bottom + separation <= world.height - ENEMY_RADIUS) {
    sides.push(2)
  }
  // 左
  if (view.left - separation >= ENEMY_RADIUS) {
    sides.push(3)
  }

  // 若 margin 太严，放宽为任意在世界内且不在 view 内的边带
  if (sides.length === 0) {
    if (view.top > 0) sides.push(0)
    if (view.right < world.width) sides.push(1)
    if (view.bottom < world.height) sides.push(2)
    if (view.left > 0) sides.push(3)
  }

  const pickSide = (): number => {
    if (sides.length === 0) {
      return 0
    }
    const idx = Math.floor(rng() * sides.length) % sides.length
    return sides[idx]
  }

  const clamp = (v: number, lo: number, hi: number): number =>
    Math.min(Math.max(v, lo), hi)

  const randomUnit = (): number => {
    const value = rng()
    return Number.isFinite(value) ? clamp(value, 0, 1) : 0
  }

  const sampleRange = (
    lo: number,
    hi: number,
    limit: number,
    amount: number,
  ): number => {
    const max = Math.max(ENEMY_RADIUS, limit - ENEMY_RADIUS)
    const start = clamp(lo, ENEMY_RADIUS, max)
    const end = clamp(hi, ENEMY_RADIUS, max)
    const rangeLo = Math.min(start, end)
    const rangeHi = Math.max(start, end)
    return rangeLo + amount * (rangeHi - rangeLo)
  }

  const side = pickSide()
  const along = randomUnit()
  const depth = randomUnit()

  let x = 0
  let y = 0
  switch (side) {
    case 0: {
      // 上方窄带：横向贴近视口，纵向只向世界内部延伸有限深度。
      const edge = view.top - separation
      y = edge - depth * SPAWN_VIEW_DEPTH
      x = sampleRange(view.left - m, view.right + m, world.width, along)
      break
    }
    case 1: {
      const edge = view.right + separation
      x = edge + depth * SPAWN_VIEW_DEPTH
      y = sampleRange(view.top - m, view.bottom + m, world.height, along)
      break
    }
    case 2: {
      const edge = view.bottom + separation
      y = edge + depth * SPAWN_VIEW_DEPTH
      x = sampleRange(view.left - m, view.right + m, world.width, along)
      break
    }
    default: {
      const edge = view.left - separation
      x = edge - depth * SPAWN_VIEW_DEPTH
      y = sampleRange(view.top - m, view.bottom + m, world.height, along)
      break
    }
  }

  x = clamp(x, ENEMY_RADIUS, world.width - ENEMY_RADIUS)
  y = clamp(y, ENEMY_RADIUS, world.height - ENEMY_RADIUS)

  // 若仍落在 view 内（极端窄边），推到 view 外最近可用点
  if (
    x >= view.left &&
    x <= view.right &&
    y >= view.top &&
    y <= view.bottom
  ) {
    if (view.left > ENEMY_RADIUS) {
      x = Math.max(ENEMY_RADIUS, view.left - m)
    } else if (view.right < world.width - ENEMY_RADIUS) {
      x = Math.min(world.width - ENEMY_RADIUS, view.right + m)
    } else if (view.top > ENEMY_RADIUS) {
      y = Math.max(ENEMY_RADIUS, view.top - m)
    } else {
      y = Math.min(world.height - ENEMY_RADIUS, view.bottom + m)
    }
  }

  return { x, y }
}

export const spawnEnemyOutsideView = (
  state: SpawnState,
  view: ViewRect,
  margin: number = SPAWN_VIEW_MARGIN,
): Enemy => {
  let pos = spawnPositionOutsideView({
    world: state.arena,
    view,
    margin,
    player: {
      x: (view.left + view.right) / 2,
      y: (view.top + view.bottom) / 2,
      radius: 16,
      health: 1,
      maxHealth: 1,
      moveSpeed: 1,
      attackCooldown: 1,
      projectileDamage: 1,
      characterId: '',
      weapons: [],
      abilities: [],
      facing: { x: 1, y: 0 },
    },
    rng: state.rng,
  })

  // 避免与已有玩家重叠：若 state 上无 player，调用方应保证；这里用重试
  const playerLike = (state as SpawnState & { player?: CombatPlayer }).player
  if (playerLike) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (
        !circlesOverlap(
          { x: pos.x, y: pos.y, radius: ENEMY_RADIUS },
          playerLike,
        )
      ) {
        break
      }
      pos = spawnPositionOutsideView({
        world: state.arena,
        view,
        margin,
        player: playerLike,
        rng: state.rng,
      })
    }
  }

  const enemy = createEnemy(
    pickEnemyDefinitionId(state.rng, listEnemies()),
    state.nextEnemyId,
    pos.x,
    pos.y,
  )
  state.nextEnemyId += 1
  return enemy
}

/** 兼容旧测试：世界边界外侧生成。 */
export const spawnEnemyOnEdge = (state: SpawnState): Enemy => {
  const edge = Math.floor(state.rng() * 4) % 4
  const t = state.rng()
  const pos = edgeSpawnPosition(state.arena, edge, t, ENEMY_RADIUS)
  const enemy = createEnemy(
    pickEnemyDefinitionId(state.rng, listEnemies()),
    state.nextEnemyId,
    pos.x,
    pos.y,
  )
  state.nextEnemyId += 1
  return enemy
}

export const advanceSpawns = (
  state: SpawnState,
  dt: number,
  view?: ViewRect,
  player?: CombatPlayer,
  difficulty: DifficultyProfile | null = getDifficultyProfile(0),
): void => {
  const baseline = getDifficultyProfile(0)
  const activeDifficulty =
    difficulty !== null && DIFFICULTY_PROFILES.includes(difficulty)
      ? difficulty
      : baseline
  const spawnInterval = activeDifficulty.spawnInterval
  const enemyCap = activeDifficulty.enemyCap
  state.spawnAccumulator += dt
  while (
    state.spawnAccumulator >= spawnInterval &&
    state.enemies.length < enemyCap
  ) {
    state.spawnAccumulator -= spawnInterval
    if (view) {
      const withPlayer = state as SpawnState & { player?: CombatPlayer }
      if (player) {
        withPlayer.player = player
      }
      state.enemies.push(spawnEnemyOutsideView(state, view, SPAWN_VIEW_MARGIN))
    } else {
      state.enemies.push(spawnEnemyOnEdge(state))
    }
  }
  if (state.enemies.length >= enemyCap) {
    state.spawnAccumulator = Math.min(
      state.spawnAccumulator,
      spawnInterval,
    )
  }
}

export const chasePlayer = (
  enemy: Enemy,
  player: CombatPlayer,
  dt: number,
): Enemy => {
  const dx = player.x - enemy.x
  const dy = player.y - enemy.y
  const dir = normalize({ x: dx, y: dy })
  return {
    ...enemy,
    x: enemy.x + dir.x * enemy.speed * dt,
    y: enemy.y + dir.y * enemy.speed * dt,
  }
}

export const advanceEnemyChases = (
  enemies: Enemy[],
  player: CombatPlayer,
  dt: number,
): Enemy[] => enemies.map((enemy) => chasePlayer(enemy, player, dt))
