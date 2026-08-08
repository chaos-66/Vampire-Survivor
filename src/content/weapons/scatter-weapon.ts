/**
 * 散射武器：沿角色当前朝向一次发射多颗弹（左右对称分布）。
 * 单件持有（选择时替换当前武器）；可升级：等级 1/2/3 对应 3/4/5 颗弹。
 * 每弹伤害低于默认单弹，总量略高但更分散；经武器升级 offer 获得或升级。
 * 指向性武器：初始发射方向取角色朝向，不选择最近敌人（D-044）。
 */

import { vecLength } from '../../vec'
import {
  PROJECTILE_LIFETIME,
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
} from '../../core/constants'
import { readyToFire } from '../../weapons/weapon-system'
import type { Vec2 } from '../../vec'
import type {
  WeaponDefinition,
  WeaponInstance,
  WeaponUpdateContext,
} from '../../weapons/weapon-definition'

export const SCATTER_WEAPON_ID = 'scatter_weapon'
/** 单弹伤害比例（相对玩家基础伤害）。 */
export const SCATTER_DAMAGE_SCALE = 0.4
/** 相邻弹之间的偏角（弧度）。 */
export const SCATTER_STEP_RAD = 0.25

const rotate = (v: Vec2, radians: number): Vec2 => {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  }
}

/** 等级 1/2/3 对应 3/4/5 颗弹。 */
const shotCountForLevel = (level: number): number => 2 + level

export const scatterProjectileWeapon: WeaponDefinition = {
  id: SCATTER_WEAPON_ID,
  name: '散射弹',
  description: '沿朝向一次发射多颗散射弹，可升级',
  maxLevel: 3,
  create: (): WeaponInstance => ({
    definitionId: SCATTER_WEAPON_ID,
    level: 1,
    cooldownRemaining: 0,
  }),
  update: (context: WeaponUpdateContext, instance: WeaponInstance): void => {
    if (!readyToFire(instance, context)) {
      return
    }
    const facing = context.player.facing
    if (vecLength(facing) === 0) {
      return
    }
    const base = {
      x: facing.x * PROJECTILE_SPEED,
      y: facing.y * PROJECTILE_SPEED,
    }
    const count = shotCountForLevel(instance.level)
    for (let i = 0; i < count; i += 1) {
      const offset = (i - (count - 1) / 2) * SCATTER_STEP_RAD
      const velocity = rotate(base, offset)
      context.spawnProjectile({
        x: context.player.x,
        y: context.player.y,
        vx: velocity.x,
        vy: velocity.y,
        radius: PROJECTILE_RADIUS,
        damage: context.player.projectileDamage * SCATTER_DAMAGE_SCALE,
        lifeRemaining: PROJECTILE_LIFETIME,
      })
    }
    instance.cooldownRemaining = context.player.attackCooldown
  },
}
