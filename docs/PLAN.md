# 计划

## 当前目标

**当前检查点：`CP-M5-DROP-ARCH-01` Green 收尾。** 实现和自动化验证已完成，第三次
全新独立复审为 PASS，用户浏览器验收为 PASS。

目标模块：掉落定义、对象身份注册表、严格工厂、默认经验掉落内容、内容 bootstrap/reset、
运行时掉落实例、掉落生成/拾取路径、现有绘制和针对性测试。

自动验收：默认经验掉落可由注册表解析；同一对象重复注册幂等、同 ID 不同对象抛错；
未知定义 ID 的工厂明确失败；bootstrap 重复调用幂等且完整重置后恢复默认定义；每次实际
击杀只生成一个经验掉落；掉落 ID 连续；未收集掉落不设数量上限；拾取仍只增加经验并保持
升级、胜负和重新开始语义。

浏览器验收：基础敌人死亡后仍出现并可收集经验掉落；升级、60 秒胜负和重新开始无回归；
控制台无未处理错误。

非目标：不加入食物、宝箱或其他真实掉落内容，不实现稀有度、掉落权重、库存、世界物体、
效果或 NPC；不修改敌人定义/生成、难度或单局结果规则。

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
- won：elapsedActiveSeconds >= 60 且 health > 0
- 对 dt 进行钳制，使模拟期间的已用时间永不超过 60
- 终局状态冻结所有系统；清除 pendingUpgrade
- 仅在终局状态下可通过 R 或按钮重新开始；从当前视口创建完整的新单局和世界

## 后续

| 项目 | 状态 |
|---|---|
| 独立 OUTCOME 审计 | **修复后 PASS** |
| 最终 MVP 审计/收尾 | **PASS / 收尾 `0d0289e`** |
| 交付流程 | **已定义；强制执行** |
| GitHub 同步 | **已配置；初始 Green 基线已上传** |
| M5+ 内容 | **未开始** |

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

下一任务：通过范围关卡定义 `CP-M5-WORLD-OBJECTS-01`；不得在范围、基线和文档一致性
检查前开始实现。

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
