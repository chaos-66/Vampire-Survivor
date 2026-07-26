# Project Delivery Pipeline

本文档是所有后续开发、审计、交接和 GitHub 同步的强制执行流程。
任何 agent 在修改代码或文档前都必须阅读本文件。

## 1. Pipeline 总则

- 同一时间只允许一个 active checkpoint。
- 未写入 `docs/DECISIONS.md` 的范围扩张不得实施。
- 实现者验证不等于独立审计。
- 浏览器行为只能由真实浏览器观察或用户报告确认。
- 失败证据必须保留在 `docs/RUN_LOG.md`，成功重跑不能删除历史失败。
- checkpoint 必须有可回滚 Git commit；不得只在聊天中宣布完成。
- `AI-Workflow-Library/` 始终只读，不得修改、暂存、提交或上传。

## 2. 强制必读

每次开始或恢复任务，按顺序阅读：

1. `AGENTS.md`
2. `docs/PROJECT_BRIEF.md`
3. `docs/PIPELINE.md`
4. `docs/PLAN.md`
5. `docs/STATUS.md`
6. `docs/HANDOFF.md`
7. `docs/WORKFLOW.md`
8. `docs/ACCEPTANCE_CRITERIA.md`
9. `docs/ARCHITECTURE.md`
10. `docs/DECISIONS.md`
11. `docs/RUN_LOG.md` 的近期记录
12. 当前 checkpoint 涉及的源码和测试

随后检查：

```text
git status --short --branch
git log --oneline -10
git remote -v
```

文档、Git 和聊天冲突时，以仓库事实为准；无法消除的冲突会阻塞实现。

## 3. Checkpoint Pipeline

### Stage 0: Scope Gate

输入：用户目标或已批准的下一任务。

必须产出：

- 唯一 checkpoint ID
- 明确目标、非目标和受影响模块
- 自动验收项
- 浏览器验收项
- `docs/DECISIONS.md` 中的范围批准记录

退出条件：`PLAN`、`STATUS`、`HANDOFF` 和 `ACCEPTANCE_CRITERIA` 一致。

### Stage 1: Baseline

必须确认：

- 分支、HEAD、工作区状态
- 当前测试基线
- 已知失败和残余风险
- 不覆盖未知或并发修改

必要时运行 checkpoint 相关基线测试。缺失证据一律视为未验证。

### Stage 2: Design

- 先使用现有模块、注册表和纯函数边界。
- 选择满足验收的最小实现。
- 不提前实现后续 pipeline stage 或新内容。
- 新基础设施必须有真实调用路径和测试，禁止空壳抽象。

### Stage 3: Implementation

- 小步修改，保持 checkpoint 范围。
- 核心模拟不得依赖 DOM、Canvas 或浏览器全局对象。
- UI 不驱动模拟结果。
- 用户可见文字使用简体中文。
- 不恢复已废弃路径、静默上限或兼容分支，除非有明确批准。

### Stage 4: Verification

代码修改后至少执行：

```text
npm test
npx tsc --noEmit
npm run build
npm audit
git diff --check
```

浏览器或渲染发生变化时还必须：

- 启动 `npm run dev`
- 提供实际 URL
- 将交互检查标为 `UNVERIFIED`，直到用户或真实浏览器报告

所有实际命令和失败/重跑结果写入 `docs/RUN_LOG.md`。

### Stage 5: Implementation Checkpoint

提交前：

```text
git status --short --branch
git diff --stat
git diff --check
git log --oneline -10
```

- 只暂存预期文件。
- 使用 checkpoint 范围的 commit message。
- 不 amend 仅为了写回自身哈希。
- 用单独 docs-only 状态提交记录实际实现哈希。

### Stage 6: Independent Audit

独立审计员严格只读：

- 阅读范围、代码、测试、证据和提交差异
- 独立复跑关键命令
- 输出 `PASS`、`FAIL` 或 `INCONCLUSIVE`

`FAIL` 时：

- 阻止 Green 和后续 checkpoint
- 实现角色修复并记录失败证据
- 创建修复 checkpoint
- 由全新审计上下文重新审计

### Stage 7: Browser Acceptance

- 只检查当前 checkpoint 和必要回归。
- 用户报告必须原样记录，不推断浏览器名称或版本。
- 所有项目 PASS 后才能关闭浏览器 gate。
- 浏览器 chrome、扩展或系统层限制必须作为残余风险明确记录。

### Stage 8: Green Closeout

Green 要求：

- 自动验收通过
- 独立审计 PASS
- 浏览器验收通过或明确不适用
- 实现/修复 checkpoint 存在
- 文档与代码一致
- 工作区状态明确

关闭时运行 `npm test` 和 `npm run build`，创建 docs-only closeout commit。

### Stage 9: GitHub Sync

只有满足本文件第 5 节的同步 gate 才能上传。上传结果必须记录到
`docs/RUN_LOG.md`，并在 `STATUS` / `HANDOFF` 记录最后同步 commit。

## 4. M5 基础建设顺序

MVP 已 Green。后续基础 pipeline 固定为：

| Order | Checkpoint | Goal | Depends on |
|---|---|---|---|
| 1 | `CP-M5-RUNTIME-01` | 无上限实体性能基线、批量掉落成本、可见绘制裁剪 | MVP Green |
| 2 | `CP-M5-ENEMY-ARCH-01` | EnemyDefinition、registry、factory、definitionId | RUNTIME Green |
| 3 | `CP-M5-DROP-ARCH-01` | 通用掉落/拾取定义，保留每击杀必掉经验 | ENEMY-ARCH Green |
| 4 | `CP-M5-WORLD-OBJECTS-01` | 静态世界物体、障碍碰撞、可见查询 | RUNTIME Green |
| 5 | `CP-M5-EFFECTS-01` | 即时效果、限时 Buff/Debuff、叠加规则 | DROP-ARCH Green |
| 6 | `CP-M5-CONTENT-01` | 第一批真实敌人、武器、食物、宝箱 | 前述架构 Green |
| 7 | `CP-M5-NPC-01` | NPC 定义、交互距离、对话状态 | WORLD-OBJECTS + EFFECTS Green |

规则：

- 严格按依赖推进；调整顺序需要用户批准并记录决策。
- 每一行都是独立 checkpoint，不能合并成一次大提交。
- 第一阶段只做 `CP-M5-RUNTIME-01`，不得同时创建敌人、掉落或 NPC 内容。

## 5. Git 与 GitHub 同步策略

### 5.1 本地 Git

- 所有实现、审计修复、Green closeout 都必须提交。
- commit 保持 checkpoint 范围，不混入无关文件。
- 禁止 `git reset --hard`、`git clean -fdx`、强制覆盖和 amend，除非用户明确要求。
- 不提交 secrets、`dist/`、临时文件、截图或只读参考库。

### 5.2 GitHub 初始化 Gate

首次上传前必须具备：

- 用户明确提供或确认 GitHub repository URL
- 可用的 Git 认证（SSH key、credential manager 或 token；不得在日志中暴露）
- remote 名称默认 `origin`
- 远端默认分支和本地 `main` 的关系已核对

不得猜测仓库地址，不得自动创建公开仓库，不得写入或打印 token。

### 5.3 必须同步的时点

配置 remote 后，以下时点必须尝试同步：

1. GitHub remote 首次配置完成后，上传当前 Green 基线。
2. 每个 implementation checkpoint 自动验证通过并已提交后。
3. 每个独立审计修复 checkpoint 通过并已提交后。
4. 每个 Green closeout 和最终状态记录提交后。
5. 长时间中断或跨 agent handoff 前，本地存在尚未上传的干净提交时。
6. 用户明确要求上传时。

这将“时不时上传”转换为确定、可审计的同步点。

### 5.4 上传前 Gate

每次 push 前必须执行并检查：

```text
git status --short --branch
git diff --check
git remote -v
git branch -vv
git log --oneline -10
```

要求：

- 工作区干净。
- 当前提交有真实验证证据。
- remote URL 与用户确认一致。
- 不存在 secrets 或意外文件。
- 远端没有未知领先提交。

推荐只读检查远端状态：

```text
git fetch origin
git status --short --branch
git log --oneline --left-right main...origin/main
```

若远端领先或历史分叉，停止并让用户决定；不得 force push。

### 5.5 上传命令

首次建立 tracking：

```text
git push -u origin main
```

后续同步：

```text
git push origin main
```

禁止：

- `--force` / `--force-with-lease`
- 绕过 hooks
- 上传失败后重写历史
- 将认证信息写入文档或 remote URL

### 5.6 上传证据

每次同步在 `docs/RUN_LOG.md` 记录：

- 时间
- remote 名称
- branch
- 上传 commit
- 成功、失败或阻塞原因

`docs/STATUS.md` 和 `docs/HANDOFF.md` 记录：

- 最后成功上传 commit
- 是否与 `origin/main` 同步
- 下一次必须同步的时点

## 6. 当前入口

- M4 / MVP：Green
- 当前本地最终状态记录：`957aea3`
- M5+：未开始
- 下一可批准 checkpoint：`CP-M5-RUNTIME-01`
- GitHub remote：尚未配置；等待用户提供 repository URL 和认证确认
