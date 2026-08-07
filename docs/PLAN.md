# 计划

## 当前目标

**当前检查点：`CP-M5-ABILITY-01`（范围关卡，D-041）。** 建立与武器分离的被动能力系统：
静态 `AbilityDefinition`、对象身份注册表、严格创建入口、玩家运行时能力实例（独立于武器
持有槽）及经升级 offer 获取/升级；第一批能力为斧头（额外攻击行为，不占武器槽）、
吸经验（扩大拾取范围或吸附）、追踪弹（生成追踪投射物）。

目标模块：能力定义与注册表、能力严格创建入口、玩家运行时能力状态、升级 offer 接线、
能力推进（斧头/追踪弹生成与吸经验吸附）、针对性与回归测试。

自动验收：能力注册表沿用对象身份规则（同对象幂等、同 ID 不同对象抛错）；严格创建入口要求
能力已注册且 `create()` 返回匹配的 `definitionId`（能力为纯状态实例，无实体位置，不设
运行时实体 ID）；能力不进入 `player.weapons`（武器单件替换语义不变）；斧头作为额外攻击
行为独立触发且不占用武器冷却；吸经验扩大拾取范围或提供吸附；追踪弹生成追踪投射物；
升级 offer 可获取/升级能力；重新开始清空能力；bootstrap/reset 幂等；既有移动、战斗、
掉落、升级、胜负、效果与 CONTENT-01 内容回归不变。

浏览器验收：升级可选斧头/吸经验/追踪弹并生效；散射弹替换语义无回归；5 分钟胜负、
卡片文字、选项卡随机无回归；控制台无未处理错误。

非目标：NPC、程序化地图、敌人行为钩子、稀有度、局外成长、HUD 新 UI（除非验收必须）、
重做武器系统、改变 CONTENT-01 已验收的散射弹/食物/宝箱/快速敌人语义。

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
| M5 CONTENT | **进行中（`CP-M5-CONTENT-01`）** |
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
7. `CP-M5-ABILITY-01`（当前，范围关卡，D-041）
8. `CP-M5-NPC-01`

当前检查点：`CP-M5-ABILITY-01`（范围关卡）；不得合并 NPC 或提前实现敌人行为钩子、
程序化地图。

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
