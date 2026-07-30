# 计划

## 当前目标

**M4 / MVP Green。** FINAL-MVP-AUDIT-01 针对 `6236896` 的独立审计已通过。
所有范围锁定能力、检查点审计和用户浏览器证据均已通过。
在 M5+ 之前停止；任何扩展都需要新批准的检查点。

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
