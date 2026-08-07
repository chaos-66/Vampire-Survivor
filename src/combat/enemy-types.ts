/** 敌人与投射物运行时实体类型。 */

export type Enemy = {
  id: number
  definitionId: string
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
  /** 可选追踪转向速度（弧度/秒）；存在时每帧朝最近活敌转向。 */
  homingTurnSpeed?: number
}
