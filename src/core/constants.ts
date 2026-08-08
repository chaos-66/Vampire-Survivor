/**
 * 运行时常量：局内数值基线（M1–M3 已验收行为）。
 * 内容定义可引用这些基线；不要在主循环里按内容 ID 硬编码分支。
 */

export const PLAYER_MAX_HEALTH = 100
export const PLAYER_SPEED = 220
export const ENEMY_SPAWN_INTERVAL = 0.8
export const ENEMY_CAP = 28
export const ENEMY_SPEED = 90
export const ENEMY_RADIUS = 14
export const ENEMY_MAX_HEALTH = 30
export const CONTACT_DAMAGE = 10
export const CONTACT_COOLDOWN = 0.5
export const ATTACK_COOLDOWN = 0.45
/** 急速强化后的攻击间隔下限，防止冷却趋近于 0。 */
export const MIN_ATTACK_COOLDOWN = 0.1
export const PROJECTILE_SPEED = 420
export const PROJECTILE_RADIUS = 5
export const PROJECTILE_DAMAGE = 15
export const PROJECTILE_LIFETIME = 2
export const PROJECTILE_BOUNDS_MARGIN = 64
export const GEM_RADIUS = 8
export const GEM_VALUE = 1
/** 食物拾取恢复的生命值。 */
export const FOOD_HEAL = 20
/** 宝箱拾取提供的一次性经验。 */
export const CHEST_XP = 5
/** 斧头能力：冷却、伤害、半径、速度、寿命。 */
export const AXE_COOLDOWN = 1.2
export const AXE_DAMAGE = 20
export const AXE_RADIUS = 12
export const AXE_SPEED = 260
export const AXE_LIFETIME = 0.9
/** 吸经验能力：吸附范围与吸附速度。 */
export const MAGNET_RANGE = 120
export const MAGNET_PULL_SPEED = 340
/** 追踪弹能力：冷却、伤害、半径、速度、寿命、转向速度（弧度/秒）。 */
export const MISSILE_COOLDOWN = 2.2
export const MISSILE_DAMAGE = 12
export const MISSILE_RADIUS = 6
export const MISSILE_SPEED = 300
export const MISSILE_LIFETIME = 3
export const MISSILE_TURN_SPEED = 6
export const INITIAL_LEVEL = 1
export const INITIAL_EXPERIENCE = 0
/** 有效战斗时间达到该秒数即胜利（精确边界）。5 分钟 = 300 秒。 */
export const RUN_DURATION_SECONDS = 300