/**
 * 散射武器：向最近敌人方向一次发射多颗弹（左右对称分布）。
 * 单件持有（选择时替换当前武器）；可升级：等级 1/2/3 对应 3/4/5 颗弹。
 * 每弹伤害低于默认单弹，总量略高但更分散；经武器升级 offer 获得或升级。
 * 自动瞄准最近敌人；角色朝向仅用于视觉反馈，不驱动发射方向（D-045）。
 */

import { normalize, vecLength } from '../../vec'
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
import { selectNearestEnemy } from './default-projectile'

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
  description: '一次发射多颗散射弹，可升级',
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
    const target = selectNearestEnemy(context.player, context.enemies)
    if (!target) {
      return
    }
    const dir = normalize({
      x: target.x - context.player.x,
      y: target.y - context.player.y,
    })
    const base =
      vecLength(dir) === 0
        ? { x: PROJECTILE_SPEED, y: 0 }
        : { x: dir.x * PROJECTILE_SPEED, y: dir.y * PROJECTILE_SPEED }
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
