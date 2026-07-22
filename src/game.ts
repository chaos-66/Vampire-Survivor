import { circlesOverlap, distanceSq } from './collision'
import {
  clampPlayerToArena,
  createPlayer,
  PLAYER_SPEED,
  stepPlayer,
  type Arena,
  type Player,
} from './movement'
import { normalize, type Vec2, zeroVec, vecLength } from './vec'

export type CombatPlayer = Player & {
  health: number
  maxHealth: number
  moveSpeed: number
  attackCooldown: number
  projectileDamage: number
}

export type Enemy = {
  id: number
  x: number
  y: number
  radius: number
  speed: number
  health: number
  maxHealth: number
}

export type Projectile = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  damage: number
  lifeRemaining: number
}

export type ExperienceGem = {
  id: number
  x: number
  y: number
  radius: number
  value: number
}

export type UpgradeId = 'swift' | 'haste' | 'power'

export type UpgradeOption = {
  id: UpgradeId
  name: string
  description: string
}

export type PendingUpgrade = {
  options: UpgradeOption[]
}

/** Returns a number in [0, 1). Injected for deterministic tests. */
export type Rng = () => number

export type GameState = {
  arena: Arena
  player: CombatPlayer
  enemies: Enemy[]
  projectiles: Projectile[]
  gems: ExperienceGem[]
  defeatedCount: number
  spawnAccumulator: number
  attackCooldownRemaining: number
  contactCooldownRemaining: number
  nextEnemyId: number
  nextProjectileId: number
  nextGemId: number
  level: number
  experience: number
  experienceToNextLevel: number
  pendingUpgrade: PendingUpgrade | null
  rng: Rng
}

export const PLAYER_MAX_HEALTH = 100
export const ENEMY_SPAWN_INTERVAL = 1
export const ENEMY_CAP = 20
export const ENEMY_SPEED = 90
export const ENEMY_RADIUS = 14
export const ENEMY_MAX_HEALTH = 30
export const CONTACT_DAMAGE = 10
export const CONTACT_COOLDOWN = 0.5
export const ATTACK_COOLDOWN = 0.45
export const MIN_ATTACK_COOLDOWN = 0.1
export const PROJECTILE_SPEED = 420
export const PROJECTILE_RADIUS = 5
export const PROJECTILE_DAMAGE = 15
export const PROJECTILE_LIFETIME = 2
export const PROJECTILE_BOUNDS_MARGIN = 64
export const GEM_RADIUS = 8
export const GEM_VALUE = 1
export const GEM_CAP = 100
export const INITIAL_LEVEL = 1
export const INITIAL_EXPERIENCE = 0

export const UPGRADE_OPTIONS: UpgradeOption[] = [
  { id: 'swift', name: '迅捷', description: '移动速度 +10%' },
  { id: 'haste', name: '急速', description: '攻击间隔 -10%' },
  { id: 'power', name: '强击', description: '投射物伤害 +5' },
]

export const experienceThresholdForLevel = (level: number): number =>
  3 + (level - 1) * 2

export const defaultRng = (): Rng => Math.random

export const createGameState = (
  arena: Arena,
  rng: Rng = defaultRng(),
): GameState => {
  const base = createPlayer(arena)
  return {
    arena,
    player: {
      ...base,
      health: PLAYER_MAX_HEALTH,
      maxHealth: PLAYER_MAX_HEALTH,
      moveSpeed: PLAYER_SPEED,
      attackCooldown: ATTACK_COOLDOWN,
      projectileDamage: PROJECTILE_DAMAGE,
    },
    enemies: [],
    projectiles: [],
    gems: [],
    defeatedCount: 0,
    spawnAccumulator: 0,
    attackCooldownRemaining: 0,
    contactCooldownRemaining: 0,
    nextEnemyId: 1,
    nextProjectileId: 1,
    nextGemId: 1,
    level: INITIAL_LEVEL,
    experience: INITIAL_EXPERIENCE,
    experienceToNextLevel: experienceThresholdForLevel(INITIAL_LEVEL),
    pendingUpgrade: null,
    rng,
  }
}

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

export const spawnEnemyOnEdge = (state: GameState): Enemy => {
  const edge = Math.floor(state.rng() * 4) % 4
  const t = state.rng()
  const pos = edgeSpawnPosition(state.arena, edge, t, ENEMY_RADIUS)
  const enemy: Enemy = {
    id: state.nextEnemyId,
    x: pos.x,
    y: pos.y,
    radius: ENEMY_RADIUS,
    speed: ENEMY_SPEED,
    health: ENEMY_MAX_HEALTH,
    maxHealth: ENEMY_MAX_HEALTH,
  }
  state.nextEnemyId += 1
  return enemy
}

export const advanceSpawns = (state: GameState, dt: number): void => {
  state.spawnAccumulator += dt
  while (
    state.spawnAccumulator >= ENEMY_SPAWN_INTERVAL &&
    state.enemies.length < ENEMY_CAP
  ) {
    state.spawnAccumulator -= ENEMY_SPAWN_INTERVAL
    state.enemies.push(spawnEnemyOnEdge(state))
  }
  if (state.enemies.length >= ENEMY_CAP) {
    state.spawnAccumulator = Math.min(
      state.spawnAccumulator,
      ENEMY_SPAWN_INTERVAL,
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

export const advanceEnemyChases = (state: GameState, dt: number): void => {
  state.enemies = state.enemies.map((enemy) =>
    chasePlayer(enemy, state.player, dt),
  )
}

export const applyContactDamage = (state: GameState, dt: number): void => {
  state.contactCooldownRemaining = Math.max(
    0,
    state.contactCooldownRemaining - dt,
  )
  if (state.contactCooldownRemaining > 0) {
    return
  }
  const touching = state.enemies.some((enemy) =>
    circlesOverlap(state.player, enemy),
  )
  if (!touching) {
    return
  }
  state.player = {
    ...state.player,
    health: Math.max(0, state.player.health - CONTACT_DAMAGE),
  }
  state.contactCooldownRemaining = CONTACT_COOLDOWN
}

export const selectNearestEnemy = (
  player: CombatPlayer,
  enemies: readonly Enemy[],
): Enemy | null => {
  if (enemies.length === 0) {
    return null
  }
  let best: Enemy | null = null
  let bestDist = Infinity
  for (const enemy of enemies) {
    const d = distanceSq(player.x, player.y, enemy.x, enemy.y)
    if (
      d < bestDist ||
      (d === bestDist && best !== null && enemy.id < best.id) ||
      (d === bestDist && best === null)
    ) {
      best = enemy
      bestDist = d
    }
  }
  return best
}

export const fireAtEnemy = (state: GameState, target: Enemy): void => {
  const dir = normalize({
    x: target.x - state.player.x,
    y: target.y - state.player.y,
  })
  const velocity =
    vecLength(dir) === 0
      ? { x: PROJECTILE_SPEED, y: 0 }
      : { x: dir.x * PROJECTILE_SPEED, y: dir.y * PROJECTILE_SPEED }
  state.projectiles.push({
    id: state.nextProjectileId,
    x: state.player.x,
    y: state.player.y,
    vx: velocity.x,
    vy: velocity.y,
    radius: PROJECTILE_RADIUS,
    damage: state.player.projectileDamage,
    lifeRemaining: PROJECTILE_LIFETIME,
  })
  state.nextProjectileId += 1
}

/** At most one shot per update step to avoid unbounded attack burst on large dt. */
export const advanceAutoAttack = (state: GameState, dt: number): void => {
  state.attackCooldownRemaining = Math.max(
    0,
    state.attackCooldownRemaining - dt,
  )
  if (state.attackCooldownRemaining > 0) {
    return
  }
  const target = selectNearestEnemy(state.player, state.enemies)
  if (!target) {
    return
  }
  fireAtEnemy(state, target)
  state.attackCooldownRemaining = state.player.attackCooldown
}

export const projectileOutOfBounds = (
  p: Projectile,
  arena: Arena,
  margin: number,
): boolean =>
  p.x < -margin ||
  p.y < -margin ||
  p.x > arena.width + margin ||
  p.y > arena.height + margin

export const spawnGemAt = (
  state: GameState,
  x: number,
  y: number,
): void => {
  if (state.gems.length >= GEM_CAP) {
    return
  }
  state.gems.push({
    id: state.nextGemId,
    x,
    y,
    radius: GEM_RADIUS,
    value: GEM_VALUE,
  })
  state.nextGemId += 1
}

/**
 * Move projectiles, resolve first-hit damage (one projectile → one enemy),
 * drop gems on kill, remove dead enemies and spent projectiles.
 */
export const advanceProjectiles = (state: GameState, dt: number): void => {
  const remainingProjectiles: Projectile[] = []
  const enemyById = new Map(state.enemies.map((e) => [e.id, { ...e }]))

  const sortedProjectiles = [...state.projectiles].sort((a, b) => a.id - b.id)

  for (const raw of sortedProjectiles) {
    const moved: Projectile = {
      ...raw,
      x: raw.x + raw.vx * dt,
      y: raw.y + raw.vy * dt,
      lifeRemaining: raw.lifeRemaining - dt,
    }
    if (moved.lifeRemaining <= 0) {
      continue
    }
    if (projectileOutOfBounds(moved, state.arena, PROJECTILE_BOUNDS_MARGIN)) {
      continue
    }

    let hit = false
    const living = [...enemyById.values()]
      .filter((e) => e.health > 0)
      .sort((a, b) => a.id - b.id)

    for (const enemy of living) {
      if (circlesOverlap(moved, enemy)) {
        const nextHp = enemy.health - moved.damage
        if (nextHp <= 0) {
          enemyById.delete(enemy.id)
          state.defeatedCount += 1
          spawnGemAt(state, enemy.x, enemy.y)
        } else {
          enemyById.set(enemy.id, { ...enemy, health: nextHp })
        }
        hit = true
        break
      }
    }

    if (!hit) {
      remainingProjectiles.push(moved)
    }
  }

  state.projectiles = remainingProjectiles
  state.enemies = [...enemyById.values()].sort((a, b) => a.id - b.id)
}

export const tryEnterPendingUpgrade = (state: GameState): void => {
  if (state.pendingUpgrade !== null) {
    return
  }
  if (state.experience >= state.experienceToNextLevel) {
    state.pendingUpgrade = { options: [...UPGRADE_OPTIONS] }
  }
}

export const pickupGems = (state: GameState): void => {
  if (state.pendingUpgrade !== null) {
    return
  }
  const remaining: ExperienceGem[] = []
  for (const gem of state.gems) {
    if (circlesOverlap(state.player, gem)) {
      state.experience += gem.value
    } else {
      remaining.push(gem)
    }
  }
  state.gems = remaining
  tryEnterPendingUpgrade(state)
}

export const movePlayer = (
  state: GameState,
  direction: Vec2,
  dt: number,
): void => {
  const stepped = stepPlayer(
    state.player,
    direction,
    state.player.moveSpeed,
    dt,
    state.arena,
  )
  state.player = {
    ...state.player,
    x: stepped.x,
    y: stepped.y,
    radius: stepped.radius,
  }
}

/**
 * Fixed update order when not pending upgrade:
 * move → spawn → chase → contact → auto-attack → projectiles (gems) → pickup.
 * When pendingUpgrade is set, simulation does not advance.
 */
export const updateGame = (
  state: GameState,
  direction: Vec2,
  dtSeconds: number,
): GameState => {
  if (state.pendingUpgrade !== null) {
    return state
  }

  const dt = dtSeconds
  if (!(dt > 0)) {
    return state
  }

  movePlayer(state, direction, dt)
  advanceSpawns(state, dt)
  advanceEnemyChases(state, dt)
  applyContactDamage(state, dt)
  advanceAutoAttack(state, dt)
  advanceProjectiles(state, dt)
  pickupGems(state)

  state.player = {
    ...state.player,
    health: Math.min(
      state.player.maxHealth,
      Math.max(0, state.player.health),
    ),
  }
  state.player = {
    ...state.player,
    ...clampPlayerToArena(state.player, state.arena),
  }

  return state
}

export const applyUpgradeEffect = (
  state: GameState,
  upgradeId: UpgradeId,
): void => {
  if (upgradeId === 'swift') {
    state.player = {
      ...state.player,
      moveSpeed: state.player.moveSpeed * 1.1,
    }
    return
  }
  if (upgradeId === 'haste') {
    state.player = {
      ...state.player,
      attackCooldown: Math.max(
        MIN_ATTACK_COOLDOWN,
        state.player.attackCooldown * 0.9,
      ),
    }
    return
  }
  if (upgradeId === 'power') {
    state.player = {
      ...state.player,
      projectileDamage: state.player.projectileDamage + 5,
    }
  }
}

/** Apply one upgrade choice while pending; may immediately re-enter pending on overflow. */
export const applyUpgradeChoice = (
  state: GameState,
  upgradeId: UpgradeId,
): boolean => {
  if (state.pendingUpgrade === null) {
    return false
  }
  if (!UPGRADE_OPTIONS.some((option) => option.id === upgradeId)) {
    return false
  }

  applyUpgradeEffect(state, upgradeId)

  const cost = state.experienceToNextLevel
  state.experience = Math.max(0, state.experience - cost)
  state.level += 1
  state.experienceToNextLevel = experienceThresholdForLevel(state.level)
  state.pendingUpgrade = null

  tryEnterPendingUpgrade(state)
  return true
}

export const upgradeIdFromDigitCode = (code: string): UpgradeId | null => {
  if (code === 'Digit1' || code === 'Numpad1') {
    return 'swift'
  }
  if (code === 'Digit2' || code === 'Numpad2') {
    return 'haste'
  }
  if (code === 'Digit3' || code === 'Numpad3') {
    return 'power'
  }
  return null
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export const cssPointToLogical = (
  clientX: number,
  clientY: number,
  canvasRect: { left: number; top: number; width: number; height: number },
  logicalWidth: number,
  logicalHeight: number,
): Vec2 => {
  const scaleX = logicalWidth / canvasRect.width
  const scaleY = logicalHeight / canvasRect.height
  return {
    x: (clientX - canvasRect.left) * scaleX,
    y: (clientY - canvasRect.top) * scaleY,
  }
}

export const getUpgradeCardRects = (arena: Arena): Rect[] => {
  const cardWidth = Math.min(220, arena.width * 0.28)
  const cardHeight = 120
  const gap = 16
  const totalWidth = cardWidth * 3 + gap * 2
  const startX = (arena.width - totalWidth) / 2
  const y = arena.height / 2 - cardHeight / 2
  return [0, 1, 2].map((i) => ({
    x: startX + i * (cardWidth + gap),
    y,
    width: cardWidth,
    height: cardHeight,
  }))
}

export const upgradeIdAtPoint = (
  arena: Arena,
  point: Vec2,
): UpgradeId | null => {
  const rects = getUpgradeCardRects(arena)
  const ids: UpgradeId[] = ['swift', 'haste', 'power']
  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i]
    if (
      point.x >= r.x &&
      point.x <= r.x + r.width &&
      point.y >= r.y &&
      point.y <= r.y + r.height
    ) {
      return ids[i]
    }
  }
  return null
}

export const createSequenceRng = (values: number[]): Rng => {
  let i = 0
  return () => {
    if (i >= values.length) {
      return 0
    }
    const v = values[i]
    i += 1
    return v
  }
}

export { zeroVec, PLAYER_SPEED }
