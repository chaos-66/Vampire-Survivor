# 计划

## 当前目标

**当前检查点：`CP-M5-CONTENT-01`。** 第一批真实内容与内容驱动模式：新敌人、第二件武器、
食物、宝箱，并扩展生成权重、敌人自带掉落表与拾取结果三个通用机制。

目标模块：`EnemyDefinition`（`spawnWeight` + `drops`）、敌人生成权重选择、
`kills` 携带 `definitionId`、通用击杀掉落生成、`PickupResult`、食物/宝箱/新敌人/新武器
内容文件、内容 bootstrap 注册、掉落绘制颜色及针对性测试。

自动验收：权重生成确定性且默认敌人行为不变；每击杀仍必掉一个经验掉落；带掉落表的敌人
按定义概率额外产出食物/宝箱；食物拾取回血且不超过最大生命；宝箱拾取增加经验；散射武器
经升级 offer 获得并一次发射三颗弹；新内容注册/重置幂等；既有升级、胜负、掉落、世界物体
和效果测试保持通过。

浏览器验收：两种敌人混合出现（快速敌人更快更脆）；升级时可选散射武器并正常发射三弹；
击杀偶见食物（回血）与宝箱（经验）；移动、战斗、经验、升级、障碍、5 分钟胜负和重新开始
无回归；控制台无未处理错误。

非目标：敌人行为钩子（远程/自爆/分裂）、稀有度、掉落权重表、效果内容（buff 实物）、
程序化地图、NPC、HUD 新 UI、修改既有升级数值。

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

1. `CP-M5-RUNTIME-01`
2. `CP-M5-ENEMY-ARCH-01`
3. `CP-M5-DROP-ARCH-01`
4. `CP-M5-WORLD-OBJECTS-01`
5. `CP-M5-EFFECTS-01`
6. `CP-M5-CONTENT-01`
7. `CP-M5-NPC-01`

当前检查点：`CP-M5-CONTENT-01`；不得合并 NPC 或提前实现敌人行为钩子、程序化地图。

## CONTENT-01 范围要点

- 内容注入模式：新内容全部为 `src/content/` 下的静态定义 + bootstrap 注册；系统不按内容
  ID 硬编码分支。
- 机制扩展一：`EnemyDefinition.spawnWeight`（可选，默认 1）；敌人生成按注册表内定义权重
  选择，`rng` 保持确定性；难度档位只控制间隔/上限，行为不变。
- 机制扩展二：`EnemyDefinition.drops`（可选，`{ definitionId, chance }[]`，chance ∈ [0,1]
  独立掷骰）；`kills` 携带敌人 `definitionId`；通用掉落生成先产出必掉经验掉落，再按表
  概率产出额外掉落；未注册掉落/敌人定义明确失败。
- 机制扩展三：`PickupDefinition.collect` 返回 `PickupResult { experienceDelta, healthDelta }`；
  拾取汇总由 `game-loop` 应用，生命钳制到最大生命；纯函数不依赖 DOM。
- 默认敌人 `spawnWeight: 2`、`fast_enemy` `spawnWeight: 1`；食物回血 20、宝箱经验 +5；
  掉落颜色通过 `DropDefinition.color` 数据驱动，绘制层不按 ID 硬编码。
- 散射武器经 `createWeaponProgressionDefinition` 注册武器升级 offer，单件持有（选择时替换
  当前武器），等级 1/2/3 对应 3/4/5 颗弹，伤害低于默认单弹以保持总量平衡。

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
