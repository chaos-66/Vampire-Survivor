import { describe, expect, it } from 'vitest'

import { circlesOverlap } from './collision'
import {
  advanceAutoAttack,
  advanceEnemyChases,
  advanceProjectiles,
  advanceSpawns,
  applyContactDamage,
  ATTACK_COOLDOWN,
  CONTACT_COOLDOWN,
  CONTACT_DAMAGE,
  createGameState,
  createSequenceRng,
  ENEMY_CAP,
  ENEMY_MAX_HEALTH,
  ENEMY_RADIUS,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_SPEED,
  edgeSpawnPosition,
  fireAtEnemy,
  PLAYER_MAX_HEALTH,
  PROJECTILE_DAMAGE,
  PROJECTILE_LIFETIME,
  PROJECTILE_SPEED,
  selectNearestEnemy,
  spawnEnemyOnEdge,
  updateGame,
  type Enemy,
  type GameState,
} from './game'
import type { Arena } from './movement'

const arena: Arena = { width: 960, height: 540 }

const stateWith = (rngValues: number[] = [0, 0.5]): GameState =>
  createGameState(arena, createSequenceRng(rngValues))

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
    // Use binary-friendly steps so accumulator hits exact interval boundaries.
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

  it('spawns on an arena edge (outside or on boundary with radius offset)', () => {
    const state = stateWith([0, 0.5])
    const enemy = spawnEnemyOnEdge(state)
    const onTop = enemy.y <= 0
    const onBottom = enemy.y >= arena.height
    const onLeft = enemy.x <= 0
    const onRight = enemy.x >= arena.width
    expect(onTop || onBottom || onLeft || onRight).toBe(true)
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

  it('large dt does not exceed cap (bounded burst)', () => {
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

  it('normalizes diagonal chase so distance matches axis speed * dt', () => {
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
    state.attackCooldownRemaining = 0
    advanceAutoAttack(state, 1)
    expect(state.projectiles).toHaveLength(0)
  })

  it('does not fire while cooldown remains', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: 100,
        y: 100,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      },
    ]
    state.attackCooldownRemaining = ATTACK_COOLDOWN
    advanceAutoAttack(state, 0.01)
    expect(state.projectiles).toHaveLength(0)
  })

  it('fires when cooldown elapsed', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: state.player.x + 50,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      },
    ]
    state.attackCooldownRemaining = 0
    advanceAutoAttack(state, 0)
    expect(state.projectiles).toHaveLength(1)
    expect(state.attackCooldownRemaining).toBe(ATTACK_COOLDOWN)
  })

  it('selects nearest living enemy', () => {
    const state = stateWith()
    const near: Enemy = {
      id: 2,
      x: state.player.x + 20,
      y: state.player.y,
      radius: ENEMY_RADIUS,
      speed: ENEMY_SPEED,
      health: 10,
      maxHealth: 10,
    }
    const far: Enemy = {
      id: 1,
      x: state.player.x + 200,
      y: state.player.y,
      radius: ENEMY_RADIUS,
      speed: ENEMY_SPEED,
      health: 10,
      maxHealth: 10,
    }
    expect(selectNearestEnemy(state.player, [far, near])?.id).toBe(2)
  })

  it('breaks equal distance ties by lower enemy id', () => {
    const state = stateWith()
    const a: Enemy = {
      id: 5,
      x: state.player.x + 30,
      y: state.player.y,
      radius: ENEMY_RADIUS,
      speed: ENEMY_SPEED,
      health: 10,
      maxHealth: 10,
    }
    const b: Enemy = {
      id: 2,
      x: state.player.x - 30,
      y: state.player.y,
      radius: ENEMY_RADIUS,
      speed: ENEMY_SPEED,
      health: 10,
      maxHealth: 10,
    }
    expect(selectNearestEnemy(state.player, [a, b])?.id).toBe(2)
  })

  it('projectile direction is unit-scaled by speed', () => {
    const state = stateWith()
    const target: Enemy = {
      id: 1,
      x: state.player.x + 100,
      y: state.player.y,
      radius: ENEMY_RADIUS,
      speed: ENEMY_SPEED,
      health: 10,
      maxHealth: 10,
    }
    fireAtEnemy(state, target)
    const p = state.projectiles[0]
    expect(p.vx).toBeCloseTo(PROJECTILE_SPEED)
    expect(p.vy).toBeCloseTo(0)
  })

  it('large dt fires at most one projectile (no unbounded burst)', () => {
    const state = stateWith()
    state.enemies = [
      {
        id: 1,
        x: state.player.x + 40,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: 10,
        maxHealth: 10,
      },
    ]
    state.attackCooldownRemaining = 0
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
      {
        id: 1,
        x: state.player.x + 10,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      },
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
      {
        id: 1,
        x: 900,
        y: 500,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED,
        health: ENEMY_MAX_HEALTH,
        maxHealth: ENEMY_MAX_HEALTH,
      },
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

describe('collision death and count', () => {
  it('circlesOverlap false when separate', () => {
    expect(
      circlesOverlap(
        { x: 0, y: 0, radius: 5 },
        { x: 20, y: 0, radius: 5 },
      ),
    ).toBe(false)
  })

  it('circlesOverlap true when touching', () => {
    expect(
      circlesOverlap(
        { x: 0, y: 0, radius: 5 },
        { x: 10, y: 0, radius: 5 },
      ),
    ).toBe(true)
  })

  it('removes enemy at 0 hp and increments defeatedCount once', () => {
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
  })

  it('kill does not create XP or upgrade fields on state', () => {
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
    expect(state).not.toHaveProperty('experience')
    expect(state).not.toHaveProperty('level')
    expect(state).not.toHaveProperty('upgrades')
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

describe('game loop closed circuit', () => {
  it('spawn chase attack hit kill increments defeatedCount', () => {
    const state = createGameState(arena, createSequenceRng([0, 0.5]))
    // Place enemy close and weak; force ready attack
    state.enemies = [
      {
        id: 1,
        x: state.player.x + ENEMY_RADIUS + 8,
        y: state.player.y,
        radius: ENEMY_RADIUS,
        speed: 0,
        health: PROJECTILE_DAMAGE,
        maxHealth: PROJECTILE_DAMAGE,
      },
    ]
    state.attackCooldownRemaining = 0
    updateGame(state, { x: 0, y: 0 }, 0.02)
    // Projectile may need travel; step until hit or timeout
    for (let i = 0; i < 40; i += 1) {
      updateGame(state, { x: 0, y: 0 }, 0.02)
      if (state.defeatedCount >= 1) {
        break
      }
    }
    expect(state.defeatedCount).toBeGreaterThanOrEqual(1)
  })
})
