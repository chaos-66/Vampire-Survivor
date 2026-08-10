# 计划

## 当前目标

**当前检查点：`CP-M5-TARGETING-01`（D-044/D-045/D-046/D-047）。** 角色朝向指示与战斗修订：
玩家持久朝向（新局默认朝右、最后非零移动方向更新、静止保留）仅作视觉反馈，不驱动发射
方向；朝向通过角色主体内嵌的前向亮面与高光弧表达（D-046，用户认为仍可继续改进，
暂时接受）；散射弹与斧头恢复自动瞄准最近敌人；敌群分离为稳定互斥算法（D-047）。
敌群分离修复已应用并验证，待用户重新浏览器验收。

目标模块：`src/actors/player-types.ts`/`src/actors/player-system.ts`（朝向状态与移动更新）、
`src/core/game-state.ts`（新局默认朝向）、`src/content/weapons/scatter-weapon.ts` 与
`src/content/abilities/axe.ts`（沿朝向发射）、`src/ui/draw-world.ts`（朝向指示绘制）、
针对性测试。

自动验收：新局默认朝右；非零移动更新朝向；静止保留最近朝向；散射弹/斧头按朝向决定
初始发射方向（不依赖最近敌人）；默认弹仍选取最近敌人；追踪弹仍飞行中追踪最近敌人；
暂停冻结朝向行为；重新开始重置默认朝向；既有移动、战斗、掉落、升级、胜负、暂停、
重开、难度、武器、能力测试保持通过；全套工具链通过。

浏览器验收：角色身上有清晰简洁的朝向指示；移动后朝向往移动方向；静止保持最后朝向；
散射弹/斧头沿朝向发射（不再自动转向最近敌人）；默认弹仍自动瞄准；追踪弹仍自动追踪；
暂停冻结、继续、返回主界面、再次开始完整新局无回归；控制台无未处理错误。

非目标：鼠标/手柄瞄准、锁定目标 UI、新武器/能力/敌人/掉落/效果、NPC、角色选择、
难度选择、存档、修改敌人数量或难度参数、改变武器单件替换与能力独立持有语义。

最终纯文档收尾：`0d0289e`（`M4: close final MVP audit`）。
交付流程：所有未来工作都必须遵循 `docs/PIPELINE.md`。
流程检查点：`74b6a3e`（`OPS: define mandatory delivery pipeline`）。

## 历史

| 标识 | 状态 |
|---|---|
| 先前的 M0-DIFFICULTY | Green |
| CP-M4-OUTCOME-01 | Green：实现 `dfbe925`；修复 `a596253`；全新审计 PASS；203 项测试；用户浏览器验收 PASS |
| FINAL-MVP-AUDIT-01 | 在审计基线 `6236896` 上 PASS；两次运行 203 项测试；tsc/build/audit/Git 均为绿色状态 |

## OUTCOME 规则

- lost：health <= 0（同一帧中优先于获胜）
- won：elapsedActiveSeconds >= RUN_DURATION_SECONDS（5 分钟）且 health > 0
- 对 dt 进行钳制，使模拟期间的已用时间永不超过 RUN_DURATION_SECONDS
- 终局状态冻结所有系统；清除 pendingUpgrade
- 仅在终局状态下可通过 R 或按钮重新开始；从当前视口创建完整的新单局和世界

## 后续

| 项目 | 状态 |
|---|---|
| 独立 OUTCOME 审计 | **修复后 PASS** |
| 最终 MVP 审计/收尾 | **PASS / 收尾 `0d0289e`** |
| 交付流程 | **已定义；强制执行** |
| GitHub 同步 | **已配置；初始 Green 基线已上传** |
| M5 架构检查点 | **RUNTIME、ENEMY-ARCH、DROP-ARCH、WORLD-OBJECTS、EFFECTS 均 Green** |
| M5 CONTENT | **Green（`CP-M5-CONTENT-01` 已关闭）** |
| M5 ABILITY | **Green（`CP-M5-ABILITY-01` 已关闭）** |
| M5 运行流程/难度 | **Green（`CP-M5-RUN-FLOW-DIFFICULTY-01` 已关闭）** |
| M5 目标规则 | **进行中（`CP-M5-TARGETING-01`）** |
| M5 NPC | **未开始** |

## 最近关闭的检查点

`CP-M5-RUNTIME-01`。基线 HEAD 为 `a68424a`；目标模块为
`src/progression/experience-system.ts`、`src/combat/projectile-system.ts`、
`src/world/frame-context.ts`、`src/ui/draw-world.ts` 及针对性测试。

实现提交 `07be558`（`M5: establish runtime entity performance baseline`）和修复提交
`330fa59`（`M5: fix runtime visibility corner culling`）已同步 GitHub。正式独立审计
首次为 `FAIL`，修复后全新复审为 `PASS`。用户报告浏览器验收全部 `PASS`；
Green 关闭提交为 `f250741`（`M5: close runtime performance checkpoint`）。

## 先前关闭的检查点

`CP-OPS-CHINESE-DOCS-01`：实现提交 `67eb0dc`；首次正式独立审计 `FAIL`；
审计修复提交 `15b474c`；全新独立复审 `PASS`。中文文档检查点已达到 Green
关闭条件；Green 关闭提交为 `1279998`（`OPS: close Chinese documentation checkpoint`）。

## 最近关闭的检查点

`CP-M5-ENEMY-ARCH-01`。基线 HEAD 为 `e6627de`；目标模块为敌人定义、注册表、
工厂、默认敌人内容、内容 bootstrap、敌人生成路径及架构测试。

实现提交 `fb956cb`（`M5: introduce enemy definition architecture`）已同步 GitHub。
正式独立审计和用户浏览器验收均已 `PASS`；Green 关闭提交为 `ecf5ffb`
（`M5: close enemy architecture checkpoint`）。

## M5 基础建设队列

1. `CP-M5-RUNTIME-01` ✅
2. `CP-M5-ENEMY-ARCH-01` ✅
3. `CP-M5-DROP-ARCH-01` ✅
4. `CP-M5-WORLD-OBJECTS-01` ✅
5. `CP-M5-EFFECTS-01` ✅
6. `CP-M5-CONTENT-01` ✅
7. `CP-M5-ABILITY-01` ✅
8. `CP-M5-RUN-FLOW-DIFFICULTY-01` ✅
9. `CP-M5-TARGETING-01`（当前，D-044：NPC 前插入）
10. `CP-M5-NPC-01`

当前检查点：`CP-M5-TARGETING-01`；不得合并 NPC 或提前实现敌人行为钩子、
程序化地图。

## TARGETING-01 范围要点

- 朝向状态：`CombatPlayer.facing`（`Vec2`，默认 (1,0) 朝右）；`movePlayer` 在非零移动
  方向时更新朝向，静止保留；`createGameState` 重置默认朝向。朝向仅用于视觉反馈。
- 朝向指示：玩家球体内部的深色外缘、朝向微偏内核与同向短高光弧（D-046；用户认为仍可
  继续改进，后续可再调整）。
- 目标规则：默认弹、散射弹与斧头均自动瞄准最近敌人（`selectNearestEnemy`）；追踪弹
  `homingTurnSpeed` 飞行中追踪（D-045 取消与朝向绑定）。
- 敌群分离（D-047）：`separateEnemies` 稳定互斥——非零距离对沿连线纯互斥；同心对用
  `(min(id), max(id))` 派生的固定 8 向单位方向；每轮基于本轮快照两阶段处理；最小中心距
  = 半径和 × 0.75（保留群聚感但中心不重合）；有限值防御与世界边界钳制；O(n²)×3 轮在
  220 上限下实测可控；不改 D-043 数量档位与敌人强度。

## ABILITY-01 范围要点

- 能力与武器分离：能力是附着角色的被动效果，可叠加多个；不进入 `player.weapons`，
  散射弹单件替换语义不变。
- 机制：`AbilityDefinition`（静态定义，含推进逻辑）、对象身份注册表、严格创建入口、
  玩家运行时能力实例（`abilityIds`/`abilities`）、升级 offer 获取/升级。
- 第一批能力：斧头（周期性额外攻击行为，瞄准最近敌人，不占武器冷却）、吸经验（扩大
  经验拾取范围或吸附掉落）、追踪弹（周期性生成追踪投射物）。
- 默认内容注册三个能力；bootstrap/reset 幂等；重新开始清空能力。

## DROP-ARCH 交接要点

- 当前击杀由 `advanceProjectiles` 返回 `kills: Array<{ x, y }>`；`updateGame` 直接调用
  `spawnGemsAt`，随后 `pickupGems` 直接增加经验。
- 迁移后仍必须保证每次实际击杀产生一个经验掉落，掉落 ID 连续、未收集实体不设上限。
- 优先沿用角色、武器和敌人的静态定义、对象身份注册表、严格工厂及 bootstrap/reset
  模式；新基础设施必须有真实调用路径和测试。
- 本检查点只提供通用定义和经验适配路径；食物、宝箱和其他内容属于
  `CP-M5-CONTENT-01`，不得提前实现。

准确的关卡、依赖关系、Git 提交、审计、浏览器验收和 GitHub
同步点均在 `docs/PIPELINE.md` 中定义。
