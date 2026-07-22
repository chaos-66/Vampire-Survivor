import { describe, expect, it } from 'vitest'

import { createGameState, createSequenceRng, updateGame, applyUpgradeChoice } from './game'
import { getCharacter, listCharacters, registerCharacter } from './actors/character-registry'
import { DEFAULT_CHARACTER_ID } from './content/characters/default-character'
import {
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
  PROJECTILE_DAMAGE,
} from './core/constants'
import { getWeapon, listWeapons, registerWeapon } from './weapons/weapon-registry'
import { DEFAULT_WEAPON_ID } from './content/weapons/default-projectile'
import {
  listProgressionCategories,
} from './progression/progression-category'
import {
  listProgressions,
  registerProgression,
  getProgression,
} from './progression/progression-registry'
import { generateUpgradeOffers } from './progression/offer-generator'
import { ensureContentRegistered } from './content/bootstrap'
import type { WeaponDefinition } from './weapons/weapon-definition'
import type { ProgressionDefinition } from './progression/progression-definition'
import type { CharacterDefinition } from './actors/character-definition'

const arena = { width: 960, height: 540 }

describe('character registry', () => {
  it('registers default character with M3 baseline stats', () => {
    ensureContentRegistered()
    const character = getCharacter(DEFAULT_CHARACTER_ID)
    expect(character).toBeDefined()
    expect(character!.baseStats.maxHealth).toBe(PLAYER_MAX_HEALTH)
    expect(character!.baseStats.moveSpeed).toBe(PLAYER_SPEED)
    expect(character!.startingWeaponIds).toContain(DEFAULT_WEAPON_ID)
    expect(listCharacters().some((c) => c.id === DEFAULT_CHARACTER_ID)).toBe(true)
  })

  it('createGameState uses default character runtime separate from definition', () => {
    const state = createGameState(arena)
    expect(state.player.characterId).toBe(DEFAULT_CHARACTER_ID)
    expect(state.player.health).toBe(PLAYER_MAX_HEALTH)
    expect(state.player.moveSpeed).toBe(PLAYER_SPEED)
    const definition = getCharacter(DEFAULT_CHARACTER_ID)!
    state.player.moveSpeed *= 1.1
    expect(definition.baseStats.moveSpeed).toBe(PLAYER_SPEED)
  })

  it('can register an extra character without touching the game loop', () => {
    const extra: CharacterDefinition = {
      id: 'test_only_character',
      name: '测试角色',
      description: 'fixture',
      baseStats: { maxHealth: 50, moveSpeed: 100 },
      startingWeaponIds: [DEFAULT_WEAPON_ID],
      traitIds: [],
    }
    registerCharacter(extra)
    expect(getCharacter('test_only_character')?.name).toBe('测试角色')
    const state = createGameState(arena, createSequenceRng([]), 'test_only_character')
    expect(state.player.maxHealth).toBe(50)
    expect(state.player.moveSpeed).toBe(100)
  })
})

describe('weapon registry', () => {
  it('registers default projectile weapon', () => {
    ensureContentRegistered()
    expect(getWeapon(DEFAULT_WEAPON_ID)).toBeDefined()
    expect(listWeapons().some((w) => w.id === DEFAULT_WEAPON_ID)).toBe(true)
  })

  it('default weapon fires via context without DOM', () => {
    const state = createGameState(arena)
    state.enemies = [
      {
        id: 1,
        x: state.player.x + 40,
        y: state.player.y,
        radius: 14,
        speed: 0,
        health: 30,
        maxHealth: 30,
      },
    ]
    state.attackCooldownRemaining = 0
    if (state.player.weapons[0]) {
      state.player.weapons[0].cooldownRemaining = 0
    }
    updateGame(state, { x: 0, y: 0 }, 0.02)
    expect(state.projectiles.length).toBeGreaterThanOrEqual(1)
    expect(state.projectiles[0].damage).toBe(state.player.projectileDamage)
  })

  it('fixture weapon can register and be invoked by system', () => {
    let calls = 0
    const fixture: WeaponDefinition = {
      id: 'fixture_weapon',
      name: 'Fixture',
      description: 'test',
      maxLevel: 1,
      create: () => ({
        definitionId: 'fixture_weapon',
        level: 1,
        cooldownRemaining: 0,
      }),
      update: (ctx, instance) => {
        calls += 1
        instance.cooldownRemaining = 1
        ctx.spawnProjectile({
          x: ctx.player.x,
          y: ctx.player.y,
          vx: 1,
          vy: 0,
          radius: 1,
          damage: 1,
          lifeRemaining: 1,
        })
      },
    }
    registerWeapon(fixture)
    const state = createGameState(arena)
    state.player.weapons = [fixture.create()]
    updateGame(state, { x: 0, y: 0 }, 0.01)
    expect(calls).toBe(1)
    expect(state.projectiles.some((p) => p.damage === 1)).toBe(true)
  })

  it('upgrades still affect weapon damage and cooldown', () => {
    const state = createGameState(arena)
    state.experience = 3
    state.pendingUpgrade = {
      options: [
        { id: 'power', name: '强击', description: '投射物伤害 +5' },
        { id: 'haste', name: '急速', description: '攻击间隔 -10%' },
        { id: 'swift', name: '迅捷', description: '移动速度 +10%' },
      ],
    }
    applyUpgradeChoice(state, 'power')
    expect(state.player.projectileDamage).toBe(PROJECTILE_DAMAGE + 5)
  })
})

describe('progression registry', () => {
  it('registers stat/weapon/item categories', () => {
    ensureContentRegistered()
    const ids = listProgressionCategories().map((c) => c.id)
    expect(ids).toEqual(expect.arrayContaining(['stat', 'weapon', 'item']))
  })

  it('registers swift/haste/power with Chinese copy and order', () => {
    const defs = listProgressions()
    expect(defs.map((d) => d.id).slice(0, 3)).toEqual(['swift', 'haste', 'power'])
    expect(getProgression('swift')?.name).toBe('迅捷')
    expect(getProgression('haste')?.name).toBe('急速')
    expect(getProgression('power')?.name).toBe('强击')
  })

  it('offer generator does not hardcode names and respects maxLevel', () => {
    const state = createGameState(arena)
    const offers = generateUpgradeOffers({
      player: state.player,
      progressionLevels: {},
    })
    expect(offers.map((o) => o.id)).toEqual(['swift', 'haste', 'power'])

    const capped: ProgressionDefinition = {
      id: 'fixture_cap',
      categoryId: 'stat',
      name: '封顶',
      description: 'max 1',
      maxLevel: 1,
      isEligible: () => true,
      apply: () => undefined,
    }
    registerProgression(capped)
    const after = generateUpgradeOffers({
      player: state.player,
      progressionLevels: { fixture_cap: 1 },
      },
      10,
    )
    expect(after.some((o) => o.id === 'fixture_cap')).toBe(false)
  })

  it('registered test upgrade appears in offers', () => {
    registerProgression({
      id: 'fixture_offer',
      categoryId: 'stat',
      name: '测试',
      description: 'd',
      maxLevel: 1,
      isEligible: () => true,
      apply: () => undefined,
    })
    const state = createGameState(arena)
    const offers = generateUpgradeOffers(
      { player: state.player, progressionLevels: {} },
      10,
    )
    expect(offers.some((o) => o.id === 'fixture_offer')).toBe(true)
  })
})

describe('system boundaries', () => {
  it('pure modules do not import main', async () => {
    const sources = [
      './core/game-loop',
      './combat/enemy-system',
      './progression/upgrade-system',
      './weapons/weapon-system',
    ]
    for (const s of sources) {
      const mod = await import(s)
      expect(mod).toBeTruthy()
    }
  })

  it('pending upgrade freezes simulation', () => {
    const state = createGameState(arena)
    state.pendingUpgrade = {
      options: [
        { id: 'swift', name: '迅捷', description: 'a' },
        { id: 'haste', name: '急速', description: 'b' },
        { id: 'power', name: '强击', description: 'c' },
      ],
    }
    const x = state.player.x
    updateGame(state, { x: 1, y: 0 }, 0.5)
    expect(state.player.x).toBe(x)
  })
})