# 计划

## 当前目标

**CP-M5-RUNTIME-01 正在进行。** 在不改变玩法结果和不限制实体数量的前提下，
建立大规模实体运行时基线，降低批量击杀掉落和投射物碰撞分配成本，并裁剪
完全位于当前视口外的实体绘制。

非目标：不引入空间索引、实体上限、`EnemyDefinition`、通用掉落定义、世界物体、
效果、内容或 NPC；不改变生成、碰撞、拾取、目标选择、难度和单局结果规则。

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

## 当前活动检查点

`CP-M5-RUNTIME-01`。基线 HEAD 为 `a68424a`；目标模块为
`src/progression/experience-system.ts`、`src/combat/projectile-system.ts`、
`src/world/frame-context.ts`、`src/ui/draw-world.ts` 及针对性测试。

实现已应用，当前待完成：提交实现检查点、同步、独立审计和用户浏览器验收。

## 最近关闭的检查点

`CP-OPS-CHINESE-DOCS-01`：实现提交 `67eb0dc`；首次正式独立审计 `FAIL`；
审计修复提交 `15b474c`；全新独立复审 `PASS`。中文文档检查点已达到 Green
关闭条件；Green 关闭提交为 `1279998`（`OPS: close Chinese documentation checkpoint`）。

## M5 基础建设队列

1. `CP-M5-RUNTIME-01`
2. `CP-M5-ENEMY-ARCH-01`
3. `CP-M5-DROP-ARCH-01`
4. `CP-M5-WORLD-OBJECTS-01`
5. `CP-M5-EFFECTS-01`
6. `CP-M5-CONTENT-01`
7. `CP-M5-NPC-01`

准确的关卡、依赖关系、Git 提交、审计、浏览器验收和 GitHub
同步点均在 `docs/PIPELINE.md` 中定义。
