/**
 * 运行时常量：局内数值基线（M1–M3 已验收行为）。
 * 内容定义可引用这些基线；不要在主循环里按内容 ID 硬编码分支。
 */

export const PLAYER_MAX_HEALTH = 100
export const PLAYER_SPEED = 220
export const ENEMY_SPAWN_INTERVAL = 1
export const ENEMY_CAP = 20
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
/** 经验结晶实体上限，防止长期运行无界增长。 */
export const GEM_CAP = 100
export const INITIAL_LEVEL = 1
export const INITIAL_EXPERIENCE = 0