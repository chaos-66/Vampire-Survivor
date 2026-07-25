import { describe, expect, it } from 'vitest'

import { circlesOverlap } from './collision'
import {
  advanceAutoAttack,
  advanceEnemyChases,
  advanceProjectiles,
  advanceSpawns,
  applyContactDamage,
  applyUpgradeChoice,
  ATTACK_COOLDOWN,
  CONTACT_COOLDOWN,
  CONTACT_DAMAGE,
  createGameState,
  createSequenceRng,
  cssPointToLogical,
  ENEMY_CAP,
  ENEMY_MAX_HEALTH,
  ENEMY_RADIUS,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_SPEED,
  edgeSpawnPosition,
  experienceThresholdForLevel,
  fireAtEnemy,
  GEM_VALUE,
  getUpgradeCardRects,
  MIN_ATTACK_COOLDOWN,
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
  PROJECTILE_DAMAGE,
  PROJECTILE_LIFETIME,
  PROJECTILE_SPEED,
  pickupGems,
  selectNearestEnemy,
  spawnEnemyOnEdge,
  spawnGemAt,
  tryEnterPendingUpgrade,
  updateGame,
  upgradeIdAtPoint,
  upgradeIdFromDigitCode,
  type Enemy,
  type GameState,
} from './game'
import type { Arena } from './movement'

const arena: Arena = { width: 960, height: 540 }

const stateWith = (rngValues: number[] = [0, 0.5]): GameState =>
  createGameState(arena, createSequenceRng(rngValues))

const weakEnemy = (
  state: GameState,
  overrides: Partial<Enemy> = {},
): Enemy => ({
  id: 1,
  x: state.player.x + ENEMY_RADIUS + 8,
  y: state.player.y,
  radius: ENEMY_RADIUS,
  speed: 0,
  health: PROJECTILE_DAMAGE,
  maxHealth: PROJECTILE_DAMAGE,
  ...overrides,
})

describe('enemy spawn', () => {
  it('does not spawn before interval', () => {
    const state = stateWith()
    advanceSpawns(state, ENEMY_SPAWN_INTERVAL - 0.01)
    expect(state.enemies).toHaveLength(0)
  })

  it('spawns one when interval is crossed', () => {
    const state = stateWith([0, 0.5])
    advanceSpawns(state, ENEMY_SPAWN_INTERVAL)
    expect(state.enemies).toHaveLength(1)
  })

  it('matches multi small steps with one large step for equal time', () => {
    const values = Array.from({ length: 40 }, (_, i) => (i % 4) * 0.1 + 0.05)
    const a = createGameState(arena, createSequenceRng([...values]))
    const b = createGameState(arena, createSequenceRng([...values]))
    const step = 0.25
    const steps = 12
    const total = step * steps
    advanceSpawns(a, total)
    for (let i = 0; i < steps; i += 1) {
      advanceSpawns(b, step)
    }
    expect(b.enemies).toHaveLength(a.enemies.length)
    expect(a.enemies).toHaveLength(3)
  })

  it('spawns on an arena edge', () => {
    const state = stateWith([0, 0.5])
    const enemy = spawnEnemyOnEdge(state)
    const onEdge =
      enemy.y <= 0 ||
      enemy.y >= arena.height ||
      enemy.x <= 0 ||
      enemy.x >= arena.width
    expect(onEdge).toBe(true)
  })

  it('does not spawn overlapping a centered player for edge spawns', () => {
    const state = stateWith([0, 0.5, 1, 0.5, 2, 0.5, 3, 0.5])
    for (let i = 0; i < 4; i += 1) {
      advanceSpawns(state, ENEMY_SPAWN_INTERVAL)
    }
    for (const enemy of state.enemies) {
      expect(circlesOverlap(state.player, enemy)).toBe(false)
    }
  })

  it('repeats positions with fixed RNG sequence', () => {
    const seq = [0.25, 0.1, 0.9, 0.8]
    const a = createGameState(arena, createSequenceRng(seq))
    const b = createGameState(arena, createSequenceRng(seq))
    advanceSpawns(a, ENEMY_SPAWN_INTERVAL)
    advanceSpawns(a, ENEMY_SPAWN_INTERVAL)
    advanceSpawns(b, ENEMY_SPAWN_INTERVAL)
    advanceSpawns(b, ENEMY_SPAWN_INTERVAL)
    expect(a.enemies.map((e) => ({ x: e.x, y: e.y }))).toEqual(
      b.enemies.map((e) => ({ x: e.x, y: e.y })),
    )
  })

  it('stops spawning at enemy cap', () => {
    const state = stateWith(Array.from({ length: 200 }, () => 0.5))
    advanceSpawns(state, ENEMY_SPAWN_INTERVAL * (ENEMY_CAP + 10))
    expect(state.enemies).toHaveLength(ENEMY_CAP)
  })

  it('large dt does not exceed cap', () => {
    const state = stateWith(Array.from({ length: 200 }, () => 0.2))
    advanceSpawns(state, ENEMY_SPAWN_INTERVAL * 100)
    expect(state.enemies.length).toBeLessThanOrEqual(ENEMY_CAP)
  })

  it('edgeSpawnPosition maps edges predictably', () => {
    expect(edgeSpawnPosition(arena, 0, 0.5, ENEMY_RADIUS).y).toBe(-ENEMY_RADIUS)
    expect(edgeSpawnPosition(arena, 1, 0.5, ENEMY_RADIUS).x).toBe(
      arena.width + ENEMY_RADIUS,
    )
  })
})

describe('enemy chase', () => {
  it('moves toward the player', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: 0,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      },
    ]
    const before = state.enemies[0].x
    advanceEnemyChases(state, 0.1)
    expect(state.enemies[0].x).toBeGreaterThan(before)
  })

  it('normalizes diagonal chase', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: state.player.x - 100,
        y: state.player.y - 100,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      },
    ]
    const e0 = state.enemies[0]
    advanceEnemyChases(state, 0.1)
    const e1 = state.enemies[0]
    const dist = Math.hypot(e1.x - e0.x, e1.y - e0.y)
    expect(dist).toBeCloseTo(ENEMY_SPEED * 0.1, 5)
  })

  it('displacement scales with delta time', () => {
    const make = () => {
      const s = stateWith()
      s.enemies = [
        {
          id: 1,
          x: 0,
          y: s.player.y,
          radius: ENEMY_RADIUS,
          speed: ENEMY_SPEED,
          health: ENEMY_MAX_HEALTH,
          maxHealth: ENEMY_MAX_HEALTH,
        },
      ]
      return s
    }
    const a = make()
    const b = make()
    advanceEnemyChases(a, 0.1)
    advanceEnemyChases(b, 0.2)
    expect(b.enemies[0].x - 0).toBeCloseTo((a.enemies[0].x - 0) * 2)
  })

  it('co-located enemy produces finite positions', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      },
    ]
    advanceEnemyChases(state, 0.1)
    expect(Number.isFinite(state.enemies[0].x)).toBe(true)
    expect(Number.isFinite(state.enemies[0].y)).toBe(true)
  })

  it('two small chase steps match one large step', () => {
    const make = (): Enemy => ({
      id: 1,
      x: 10,
      y: 10,
      radius: ENEMY_RADIUS,
      speed: ENEMY_SPEED,
      health: ENEMY_MAX_HEALTH,
      maxHealth: ENEMY_MAX_HEALTH,
    })
    const a = stateWith()
    const b = stateWith()
    a.enemies = [make()]
    b.enemies = [make()]
    advanceEnemyChases(a, 0.2)
    advanceEnemyChases(b, 0.1)
    advanceEnemyChases(b, 0.1)
    expect(b.enemies[0].x).toBeCloseTo(a.enemies[0].x)
    expect(b.enemies[0].y).toBeCloseTo(a.enemies[0].y)
  })
})

describe('auto attack and targeting', () => {
  it('does not fire without enemies', () => {
    const state = stateWith()
    if (state.player.weapons[0]) { state.player.weapons[0].cooldownRemaining = 0 }
    advanceAutoAttack(state, 1)
    expect(state.projectiles).toHaveLength(0)
  })

  it('does not fire while cooldown remains', () => {
    const state = stateWith()
    state.enemies = [weakEnemy(state, { health: ENEMY_MAX_HEALTH, maxHealth: ENEMY_MAX_HEALTH })]
    if (state.player.weapons[0]) { state.player.weapons[0].cooldownRemaining = ATTACK_COOLDOWN }
    advanceAutoAttack(state, 0.01)
    expect(state.projectiles).toHaveLength(0)
  })

  it('fires when cooldown elapsed', () => {
    const state = stateWith()
    state.enemies = [weakEnemy(state, { health: ENEMY_MAX_HEALTH, maxHealth: ENEMY_MAX_HEALTH })]
    if (state.player.weapons[0]) { state.player.weapons[0].cooldownRemaining = 0 }
    advanceAutoAttack(state, 0)
    expect(state.projectiles).toHaveLength(1)
    expect(state.player.weapons[0]?.cooldownRemaining).toBe(state.player.attackCooldown)
  })

  it('selects nearest living enemy', () => {
    const state = stateWith()
    const near: Enemy = weakEnemy(state, {
      id: 2,
      x: state.player.x + 20,
      health: 10,
      maxHealth: 10,
    })
    const far: Enemy = weakEnemy(state, {
      id: 1,
      x: state.player.x + 200,
      health: 10,
      maxHealth: 10,
    })
    expect(selectNearestEnemy(state.player, [far, near])?.id).toBe(2)
  })

  it('breaks equal distance ties by lower enemy id', () => {
    const state = stateWith()
    const a: Enemy = weakEnemy(state, {
      id: 5,
      x: state.player.x + 30,
      health: 10,
      maxHealth: 10,
    })
    const b: Enemy = weakEnemy(state, {
      id: 2,
      x: state.player.x - 30,
      health: 10,
      maxHealth: 10,
    })
    expect(selectNearestEnemy(state.player, [a, b])?.id).toBe(2)
  })

  it('projectile direction is unit-scaled by speed', () => {
    const state = stateWith()
    const target = weakEnemy(state, {
      x: state.player.x + 100,
      health: 10,
      maxHealth: 10,
    })
    fireAtEnemy(state, target)
    const p = state.projectiles[0]
    expect(p.vx).toBeCloseTo(PROJECTILE_SPEED)
    expect(p.vy).toBeCloseTo(0)
  })

  it('large dt fires at most one projectile', () => {
    const state = stateWith()
    state.enemies = [weakEnemy(state, { health: 10, maxHealth: 10 })]
    if (state.player.weapons[0]) { state.player.weapons[0].cooldownRemaining = 0 }
    advanceAutoAttack(state, 10)
    expect(state.projectiles).toHaveLength(1)
  })
})

describe('projectiles', () => {
  it('moves with velocity * dt', () => {
    const state = stateWith()
    state.projectiles = [
      {
        id: 1,
        x: 0,
        y: 0,
        vx: 100,
        vy: 0,
        radius: 5,
        damage: 1,
        lifeRemaining: 1,
      },
    ]
    advanceProjectiles(state, 0.2)
    expect(state.projectiles[0].x).toBeCloseTo(20)
  })

  it('expires after lifetime', () => {
    const state = stateWith()
    state.projectiles = [
      {
        id: 1,
        x: 100,
        y: 100,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 1,
        lifeRemaining: 0.05,
      },
    ]
    advanceProjectiles(state, 0.1)
    expect(state.projectiles).toHaveLength(0)
  })

  it('cleans up outside margin', () => {
    const state = stateWith()
    state.projectiles = [
      {
        id: 1,
        x: -1000,
        y: 100,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 1,
        lifeRemaining: 10,
      },
    ]
    advanceProjectiles(state, 0.01)
    expect(state.projectiles).toHaveLength(0)
  })

  it('hits once, damages enemy, removes projectile', () => {
    const state = stateWith()
    state.enemies = [
      weakEnemy(state, {
        x: state.player.x + 10,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      }),
    ]
    state.projectiles = [
      {
        id: 1,
        x: state.player.x + 10,
        y: state.player.y,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: PROJECTILE_DAMAGE,
        lifeRemaining: PROJECTILE_LIFETIME,
      },
    ]
    advanceProjectiles(state, 0)
    expect(state.projectiles).toHaveLength(0)
    expect(state.enemies[0].health).toBe(ENEMY_MAX_HEALTH - PROJECTILE_DAMAGE)
  })

  it('does not damage when not overlapping', () => {
    const state = stateWith()
    state.enemies = [
      weakEnemy(state, {
        x: 900,
        y: 500,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      }),
    ]
    state.projectiles = [
      {
        id: 1,
        x: 10,
        y: 10,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: PROJECTILE_DAMAGE,
        lifeRemaining: 1,
      },
    ]
    advanceProjectiles(state, 0)
    expect(state.enemies[0].health).toBe(ENEMY_MAX_HEALTH)
    expect(state.projectiles).toHaveLength(1)
  })

  it('one projectile cannot hit two enemies', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: 100,
        y: 100,
        radius: 20,
        speed: ENEMY_SPEED,
        health: 100,
        maxHealth: 100,
      },
      {
        id: 2,
        x: 105,
        y: 100,
        radius: 20,
        speed: ENEMY_SPEED,
        health: 100,
        maxHealth: 100,
      },
    ]
    state.projectiles = [
      {
        id: 1,
        x: 102,
        y: 100,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 10,
        lifeRemaining: 1,
      },
    ]
    advanceProjectiles(state, 0)
    const totalHp = state.enemies.reduce((s, e) => s + e.health, 0)
    expect(totalHp).toBe(190)
    expect(state.projectiles).toHaveLength(0)
  })
})

describe('collision death and gems', () => {
  it('circlesOverlap false when separate', () => {
    expect(
      circlesOverlap({ x: 0, y: 0, radius: 5 }, { x: 20, y: 0, radius: 5 }),
    ).toBe(false)
  })

  it('circlesOverlap true when touching', () => {
    expect(
      circlesOverlap({ x: 0, y: 0, radius: 5 }, { x: 10, y: 0, radius: 5 }),
    ).toBe(true)
  })

  it('non-lethal hit does not drop a gem', () => {
    const state = stateWith()
    state.enemies = [
      weakEnemy(state, {
        x: 50,
        y: 50,
        health: 20,
        maxHealth: 20,
      }),
    ]
    state.projectiles = [
      {
        id: 1,
        x: 50,
        y: 50,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 5,
        lifeRemaining: 1,
      },
    ]
    advanceProjectiles(state, 0)
    expect(state.enemies).toHaveLength(1)
    expect(state.gems).toHaveLength(0)
  })

  it('removes enemy at 0 hp, increments defeatedCount once, drops one gem', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: 50,
        y: 50,
        radius: 10,
        speed: ENEMY_SPEED,
        health: 5,
        maxHealth: 5,
      },
    ]
    state.projectiles = [
      {
        id: 1,
        x: 50,
        y: 50,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 5,
        lifeRemaining: 1,
      },
    ]
    advanceProjectiles(state, 0)
    expect(state.enemies).toHaveLength(0)
    expect(state.defeatedCount).toBe(1)
    expect(state.gems).toHaveLength(1)
    expect(state.gems[0].x).toBe(50)
    expect(state.gems[0].y).toBe(50)
    expect(state.gems[0].value).toBe(GEM_VALUE)
  })

  it('does not double-drop from one kill', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: 0,
        y: 0,
        radius: 10,
        speed: 1,
        health: 1,
        maxHealth: 1,
      },
    ]
    state.projectiles = [
      {
        id: 1,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 10,
        lifeRemaining: 1,
      },
      {
        id: 2,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 10,
        lifeRemaining: 1,
      },
    ]
    advanceProjectiles(state, 0)
    expect(state.defeatedCount).toBe(1)
    expect(state.gems).toHaveLength(1)
  })

  it('gem ids increment stably', () => {
    const state = stateWith()
    spawnGemAt(state, 1, 1)
    spawnGemAt(state, 2, 2)
    expect(state.gems.map((g) => g.id)).toEqual([1, 2])
  })

  it('creates a gem for every requested drop without a cap', () => {
    const state = stateWith()
    const dropCount = 250
    for (let i = 0; i < dropCount; i += 1) {
      spawnGemAt(state, i, 0)
    }
    expect(state.gems).toHaveLength(dropCount)
    expect(state.nextGemId).toBe(dropCount + 1)
  })

  it('kill does not create M4 outcome/restart fields', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: 0,
        y: 0,
        radius: 10,
        speed: 1,
        health: 1,
        maxHealth: 1,
      },
    ]
    state.projectiles = [
      {
        id: 1,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 10,
        lifeRemaining: 1,
      },
    ]
    advanceProjectiles(state, 0)
    expect(state).not.toHaveProperty('outcome')
    expect(state).not.toHaveProperty('lost')
    expect(state).not.toHaveProperty('restart')
  })
})

describe('player contact damage', () => {
  it('does not damage when not overlapping', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: 0,
        y: 0,
        radius: 5,
        speed: 1,
        health: 10,
        maxHealth: 10,
      },
    ]
    applyContactDamage(state, 0.1)
    expect(state.player.health).toBe(PLAYER_MAX_HEALTH)
  })

  it('damages on overlap', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: 1,
        health: 10,
        maxHealth: 10,
      },
    ]
    applyContactDamage(state, 0.01)
    expect(state.player.health).toBe(PLAYER_MAX_HEALTH - CONTACT_DAMAGE)
  })

  it('does not re-damage every frame during cooldown', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: 1,
        health: 10,
        maxHealth: 10,
      },
    ]
    applyContactDamage(state, 0.01)
    applyContactDamage(state, 0.01)
    expect(state.player.health).toBe(PLAYER_MAX_HEALTH - CONTACT_DAMAGE)
  })

  it('can damage again after cooldown', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: 1,
        health: 10,
        maxHealth: 10,
      },
    ]
    applyContactDamage(state, 0.01)
    applyContactDamage(state, CONTACT_COOLDOWN)
    expect(state.player.health).toBe(PLAYER_MAX_HEALTH - CONTACT_DAMAGE * 2)
  })

  it('clamps health at 0 and does not add loss state', () => {
    const state = stateWith()
    state.player = { ...state.player, health: 5 }
    state.enemies = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: 1,
        health: 10,
        maxHealth: 10,
      },
    ]
    applyContactDamage(state, 0.01)
    expect(state.player.health).toBe(0)
    expect(state).not.toHaveProperty('outcome')
    expect(state).not.toHaveProperty('lost')
    expect(state).not.toHaveProperty('restart')
  })
})

describe('experience pickup', () => {
  it('does not pick up without contact', () => {
    const state = stateWith()
    state.gems = [
      { id: 1, x: 0, y: 0, radius: 8, value: 1 },
    ]
    pickupGems(state)
    expect(state.experience).toBe(0)
    expect(state.gems).toHaveLength(1)
  })

  it('picks up on touch, removes gem, adds XP once', () => {
    const state = stateWith()
    state.gems = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: 8,
        value: 1,
      },
    ]
    pickupGems(state)
    expect(state.experience).toBe(1)
    expect(state.gems).toHaveLength(0)
  })

  it('picks multiple overlapping gems in one step', () => {
    const state = stateWith()
    state.gems = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: 8,
        value: 1,
      },
      {
        id: 2,
        x: state.player.x + 2,
        y: state.player.y,
        radius: 8,
        value: 1,
      },
    ]
    pickupGems(state)
    expect(state.experience).toBe(2)
    expect(state.gems).toHaveLength(0)
  })

  it('keeps distant gems', () => {
    const state = stateWith()
    state.gems = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: 8,
        value: 1,
      },
      { id: 2, x: 10, y: 10, radius: 8, value: 1 },
    ]
    pickupGems(state)
    expect(state.experience).toBe(1)
    expect(state.gems).toHaveLength(1)
    expect(state.gems[0].id).toBe(2)
  })
})

describe('level thresholds', () => {
  it('starts at level 1, XP 0, threshold 3', () => {
    const state = stateWith()
    expect(state.level).toBe(1)
    expect(state.experience).toBe(0)
    expect(state.experienceToNextLevel).toBe(3)
  })

  it('threshold formula for levels 1-3', () => {
    expect(experienceThresholdForLevel(1)).toBe(3)
    expect(experienceThresholdForLevel(2)).toBe(5)
    expect(experienceThresholdForLevel(3)).toBe(7)
  })
})

describe('pending upgrade freeze', () => {
  it('does not pending below threshold', () => {
    const state = stateWith()
    state.experience = 2
    tryEnterPendingUpgrade(state)
    expect(state.pendingUpgrade).toBeNull()
  })

  it('enters pending at threshold', () => {
    const state = stateWith()
    state.experience = 3
    tryEnterPendingUpgrade(state)
    expect(state.pendingUpgrade).not.toBeNull()
    expect(state.pendingUpgrade?.options).toHaveLength(3)
  })

  it('retains overflow XP until choice', () => {
    const state = stateWith()
    state.experience = 5
    tryEnterPendingUpgrade(state)
    expect(state.experience).toBe(5)
    expect(state.level).toBe(1)
  })

  it('updateGame freezes combat while pending', () => {
    const state = stateWith()
    state.pendingUpgrade = { options: [...state.pendingUpgrade?.options ?? []] }
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: '移动速度 +10%', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: '攻击间隔 -10%', categoryId: 'stat' },
        { id: 'power', name: '强击', description: '投射物伤害 +5', categoryId: 'stat' },
      ],
    }
    state.enemies = [
      {
        id: 1,
        x: 0,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: 10,
        maxHealth: 10,
      },
    ]
    state.projectiles = [
      {
        id: 1,
        x: 10,
        y: 10,
        vx: 100,
        vy: 0,
        radius: 5,
        damage: 1,
        lifeRemaining: 1,
      },
    ]
    state.gems = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        radius: 8,
        value: 1,
      },
    ]
    const px = state.player.x
    const enemyX = state.enemies[0].x
    const projX = state.projectiles[0].x
    const xp = state.experience
    const hp = state.player.health
    updateGame(state, { x: 1, y: 0 }, 0.5)
    expect(state.player.x).toBe(px)
    expect(state.enemies[0].x).toBe(enemyX)
    expect(state.projectiles[0].x).toBe(projX)
    expect(state.experience).toBe(xp)
    expect(state.player.health).toBe(hp)
    expect(state.enemies).toHaveLength(1)
  })

  it('zero delta remains safe', () => {
    const state = stateWith()
    updateGame(state, { x: 1, y: 0 }, 0)
    expect(state.player.x).toBe(arena.width / 2)
  })
})

describe('upgrade effects and apply', () => {
  it('swift multiplies move speed by 1.1', () => {
    const state = stateWith()
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: '移动速度 +10%', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: '攻击间隔 -10%', categoryId: 'stat' },
        { id: 'power', name: '强击', description: '投射物伤害 +5', categoryId: 'stat' },
      ],
    }
    const before = state.player.moveSpeed
    applyUpgradeChoice(state, 'swift')
    expect(state.player.moveSpeed).toBeCloseTo(before * 1.1)
  })

  it('haste multiplies attack cooldown by 0.9', () => {
    const state = stateWith()
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
        { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
      ],
    }
    const before = state.player.attackCooldown
    applyUpgradeChoice(state, 'haste')
    expect(state.player.attackCooldown).toBeCloseTo(before * 0.9)
  })

  it('haste does not go below MIN_ATTACK_COOLDOWN', () => {
    const state = stateWith()
    state.player = { ...state.player, attackCooldown: 0.11 }
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
        { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
      ],
    }
    applyUpgradeChoice(state, 'haste')
    expect(state.player.attackCooldown).toBe(MIN_ATTACK_COOLDOWN)
  })

  it('power adds 5 projectile damage and new shots use it', () => {
    const state = stateWith()
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
        { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
      ],
    }
    applyUpgradeChoice(state, 'power')
    expect(state.player.projectileDamage).toBe(PROJECTILE_DAMAGE + 5)
    state.enemies = [weakEnemy(state, { health: 100, maxHealth: 100 })]
    if (state.player.weapons[0]) { state.player.weapons[0].cooldownRemaining = 0 }
    advanceAutoAttack(state, 0)
    expect(state.projectiles[0].damage).toBe(PROJECTILE_DAMAGE + 5)
  })

  it('stacks repeated same upgrade', () => {
    const state = stateWith()
    state.experience = 100
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
        { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
      ],
    }
    applyUpgradeChoice(state, 'power')
    if (state.pendingUpgrade === null) {
      state.pendingUpgrade = {
        options: [
          { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
          { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
          { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
        ],
      }
    }
    applyUpgradeChoice(state, 'power')
    expect(state.player.projectileDamage).toBe(PROJECTILE_DAMAGE + 10)
  })

  it('invalid upgrade id does nothing', () => {
    const state = stateWith()
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
        { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
      ],
    }
    const ok = applyUpgradeChoice(state, 'nope' as 'swift')
    expect(ok).toBe(false)
    expect(state.level).toBe(1)
    expect(state.pendingUpgrade).not.toBeNull()
  })

  it('non-pending cannot apply upgrade', () => {
    const state = stateWith()
    expect(applyUpgradeChoice(state, 'swift')).toBe(false)
    expect(state.player.moveSpeed).toBe(PLAYER_SPEED)
  })

  it('apply increases level, subtracts threshold, keeps overflow, updates next', () => {
    const state = stateWith()
    state.experience = 5
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
        { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
      ],
    }
    applyUpgradeChoice(state, 'swift')
    expect(state.level).toBe(2)
    expect(state.experience).toBe(2)
    expect(state.experienceToNextLevel).toBe(5)
  })

  it('overflow into next threshold immediately re-pends without double apply', () => {
    const state = stateWith()
    state.experience = 8
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
        { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
        { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
      ],
    }
    applyUpgradeChoice(state, 'power')
    expect(state.level).toBe(2)
    expect(state.experience).toBe(5)
    expect(state.pendingUpgrade).not.toBeNull()
    expect(state.player.projectileDamage).toBe(PROJECTILE_DAMAGE + 5)
    applyUpgradeChoice(state, 'power')
    expect(state.level).toBe(3)
    expect(state.player.projectileDamage).toBe(PROJECTILE_DAMAGE + 10)
  })
})

describe('input helpers', () => {
  it('maps digits 1/2/3 to pending display options', () => {
    const options = [
      { id: 'swift', name: '迅捷', description: 'a', categoryId: 'stat' },
      { id: 'haste', name: '急速', description: 'b', categoryId: 'stat' },
      { id: 'power', name: '强击', description: 'c', categoryId: 'stat' },
    ]
    expect(upgradeIdFromDigitCode('Digit1', options)).toBe('swift')
    expect(upgradeIdFromDigitCode('Digit2', options)).toBe('haste')
    expect(upgradeIdFromDigitCode('Digit3', options)).toBe('power')
    expect(upgradeIdFromDigitCode('KeyW', options)).toBeNull()
  })

  it('converts CSS click to logical coords under scale', () => {
    const p = cssPointToLogical(
      100,
      50,
      { left: 0, top: 0, width: 480, height: 270 },
      960,
      540,
    )
    expect(p.x).toBeCloseTo(200)
    expect(p.y).toBeCloseTo(100)
  })

  it('hit-tests upgrade cards using pending option ids', () => {
    const ids = ['swift', 'haste', 'power']
    const rects = getUpgradeCardRects(arena, ids.length)
    const mid = (r: { x: number; y: number; width: number; height: number }) => ({
      x: r.x + r.width / 2,
      y: r.y + r.height / 2,
    })
    expect(upgradeIdAtPoint(arena, mid(rects[0]), ids)).toBe('swift')
    expect(upgradeIdAtPoint(arena, mid(rects[1]), ids)).toBe('haste')
    expect(upgradeIdAtPoint(arena, mid(rects[2]), ids)).toBe('power')
    expect(upgradeIdAtPoint(arena, { x: 0, y: 0 }, ids)).toBeNull()
  })
})

describe('game loop closed circuits', () => {
  it('M2 combat: attack hit kill increments defeatedCount and drops gem', () => {
    const state = createGameState(arena, createSequenceRng([0, 0.5]))
    state.enemies = [weakEnemy(state)]
    if (state.player.weapons[0]) { state.player.weapons[0].cooldownRemaining = 0 }
    updateGame(state, { x: 0, y: 0 }, 0.02)
    for (let i = 0; i < 40; i += 1) {
      updateGame(state, { x: 0, y: 0 }, 0.02)
      if (state.defeatedCount >= 1) {
        break
      }
    }
    expect(state.defeatedCount).toBeGreaterThanOrEqual(1)
    expect(state.gems.length + state.experience).toBeGreaterThanOrEqual(1)
  })

  it('M3 loop: kill→gem→pickup→pending→choose→buff→resume', () => {
    const state = createGameState(arena, createSequenceRng([0, 0.5]))
    state.enemies = [
      weakEnemy(state, {
        x: state.player.x,
        y: state.player.y,
        health: 1,
        maxHealth: 1,
      }),
    ]
    state.projectiles = [
      {
        id: 1,
        x: state.player.x,
        y: state.player.y,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 10,
        lifeRemaining: 1,
      },
    ]
    advanceProjectiles(state, 0)
    expect(state.gems).toHaveLength(1)
    state.experience = 2
    pickupGems(state)
    expect(state.pendingUpgrade).not.toBeNull()
    expect(state.level).toBe(1)
    const speedBefore = state.player.moveSpeed
    applyUpgradeChoice(state, 'swift')
    expect(state.level).toBe(2)
    expect(state.player.moveSpeed).toBeCloseTo(speedBefore * 1.1)
    expect(state.pendingUpgrade).toBeNull()
    const xBefore = state.player.x
    updateGame(state, { x: 1, y: 0 }, 0.1)
    expect(state.player.x).toBeGreaterThan(xBefore)
  })
})
