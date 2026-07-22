/** 敌人与投射物运行时实体类型。 */

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
