# 计划

## 当前目标

**当前检查点：`CP-M5-RUN-FLOW-DIFFICULTY-01`（D-042，NPC 前插入）。** 运行入口与暂停
流程 + 敌人数量压力：开始主界面（标题 + "开始游戏"按钮，加载后不直接开战）、游戏内暂停
（冻结全部模拟，可继续或提前结束回主界面，再开始创建完整新局）、提高敌人数量压力
（仅提高 `enemyCap` 与降低 `spawnInterval`，不改敌人强度属性）。实现已提交（`9702f19`），
首次审计 FAIL（文档一致性）已修复，待复审。

目标模块：`src/main.ts`（应用模式、按钮事件、主界面/暂停状态接线）、`src/ui/*`
（主界面、暂停菜单绘制与命中测试）、`src/core/game-loop.ts`（暂停时不推进模拟）、
`src/core/game-state.ts`（如需要新增 run/session 状态必须谨慎）、`src/core/difficulty.ts`
（提高敌人数量压力）、`src/combat/enemy-system.ts`（配合更高 cap/频率）、
`main.test.ts`/`game.test.ts`/`difficulty.test.ts` 及必要的新 UI helper 测试。

自动验收：初始状态不推进游戏等待开始；点击"开始游戏"创建新局并进入游戏；暂停时
`updateGame` 不推进玩家、敌人、投射物、掉落、能力、效果、经验、时间与胜负；暂停后
"继续"恢复同一局；"提前结束"回主界面；再次开始创建完整新局；5 分钟胜负规则不变；
各难度档 `enemyCap` 明显高于当前且 `spawnInterval` 更短；敌人强度属性不变；移动、战斗、
经验、升级、掉落、障碍、效果、能力回归通过；全套工具链通过。

浏览器验收：打开页面先见主界面与"开始游戏"按钮；点击开始进入游戏；游戏内有暂停按钮；
暂停后画面/时间/敌人/投射物冻结；继续后同一局恢复；提前结束回主界面；再次开始为完整
新局；敌人数量明显更多、压力更高但单个敌人强度无明显变化；5 分钟胜负、HUD `mm:ss`、
升级卡片、散射弹、斧头、吸经验、追踪弹、食物/宝箱无回归；控制台无未处理错误。

非目标：NPC、设置菜单、存档、角色选择、新敌人行为、新武器/能力/掉落内容、难度选择 UI、
修改敌人强度属性、修改 5 分钟胜负规则、改变散射弹/斧头/吸经验/追踪弹/食物/宝箱语义。

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
| M5 运行流程/难度 | **进行中（`CP-M5-RUN-FLOW-DIFFICULTY-01`，NPC 前插入）** |
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
8. `CP-M5-RUN-FLOW-DIFFICULTY-01`（当前，D-042：NPC 前插入）
9. `CP-M5-NPC-01`

当前检查点：`CP-M5-RUN-FLOW-DIFFICULTY-01`；不得合并 NPC 或提前实现敌人行为钩子、
程序化地图。

## RUN-FLOW-DIFFICULTY-01 范围要点

- 主界面：页面加载后不直接开战，显示标题与"开始游戏"按钮；点击后创建/重置新局进入
  running；再次开始创建完整新局。
- 暂停：游戏内暂停按钮；暂停冻结全部模拟（时间、敌人、投射物、掉落、能力、效果、升级、
  胜负计时）；可继续同一局，或提前结束回主界面。
- 敌人数量压力：仅提高各难度档 `enemyCap` 与降低 `spawnInterval`；敌人血量/速度/伤害/
  半径等强度属性不变；保持确定性（rng 驱动不变）与测试覆盖。

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
