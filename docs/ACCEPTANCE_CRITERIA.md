# 验收标准

## 先前检查点 Green

DIFFICULTY 关闭提交为 `84ab53b`。辅助指针生命周期为 Green。

## CP-M4-OUTCOME-01

### 自动化验收

- [x] `resolveRunOutcome`：`running` / `won` / `lost`；`lost` 优先于 `won`
- [x] `clampDtToRunRemaining`：59.98+0.05 -> 0.02；不会超过 60
- [x] `updateGame` 在终局时冻结；结果保持不变
- [x] `pending` 冻结时间（选择过程中不会获胜）
- [x] 接触伤害使 HP 降至 0 -> `lost`；`pending`+0 HP -> `lost`
- [x] `createGameState` 完整重置字段
- [x] 重新开始按钮布局命中测试
- [x] `isRestartCode` 的 `KeyR`
- [x] 审计修复后共计 203 项回归测试
- [x] 已记录 `npm test` / `tsc` / `build` / `audit`

### 浏览器验收

- [x] 完整 OUTCOME 交互检查清单：用户报告为 **PASS**；未提供浏览器及版本

### 流程验收

- [x] OUTCOME 检查点提交（`dfbe925`）
- [x] 首次独立审计为 FAIL；发现的问题已在本地修复
- [x] 全新独立复审为 PASS
- [x] OUTCOME 修复检查点（`a596253`）
- [x] 用户浏览器验收为 PASS
- [x] M5+ 尚未开始

## FINAL-MVP-AUDIT-01

- [x] 审计基线 `6236896` 上的 `main` 干净
- [x] `npm test` 通过两次：8 个文件 / 203 项测试
- [x] `npx tsc --noEmit` 通过
- [x] `npm run build` 通过：43 个模块
- [x] `npm audit` 通过：0 个漏洞
- [x] Git 空白字符和 OUTCOME 范围检查通过
- [x] 已审查 M0-M4 检查点的代码、测试、提交和证据
- [x] 所有 MVP 范围锁定能力均已满足
- [x] M1、M2、M3、架构回归、WORLD、DIFFICULTY、辅助指针和 OUTCOME 均有浏览器证据
- [x] 已记录接受的残余风险
- [x] 独立最终结论：**PASS**
- [x] M4 / MVP 可以宣布为 Green
- [x] 最终纯文档收尾（`0d0289e`）
- [x] M5+ 仍未开始

## CP-OPS-PIPELINE-01

- [x] 强制流程已记录在 `docs/PIPELINE.md` 中
- [x] 流程已加入 `AGENTS.md` 必读列表
- [x] 流程已加入 `docs/WORKFLOW.md` 的开始/恢复流程
- [x] M5 基础检查点已按明确依赖关系排序
- [x] 已定义实现、验证、独立审计、浏览器和收尾关卡
- [x] 已定义本地 Git 检查点规则
- [x] 已定义确定性的 GitHub 同步点和禁止强制推送策略
- [x] 已定义上传证据要求
- [x] 流程检查点（`74b6a3e`）
- [x] 已配置用户确认的 GitHub 远程仓库
- [x] 当前 Green 基线已上传至 GitHub，直至 `04143ba`

## CP-OPS-CHINESE-DOCS-01

- [x] `README.md` 面向人的自然语言使用简体中文
- [x] `AGENTS.md` 与全部 `docs/*.md` 面向人的自然语言使用简体中文
- [x] 强制中文规则写入 `AGENTS.md` 和 `docs/PIPELINE.md`
- [x] 命令、路径、代码标识符、Git 提交原文和专有技术名允许保留原文
- [x] 中文文档实现提交 `67eb0dc` 已同步 GitHub
- [x] 首次正式独立审计为 FAIL；发现的问题已进入审计修复
- [x] 审计修复 `15b474c` 已提交并同步 GitHub
- [x] 全新独立复审为 PASS
- [x] 中文文档检查点已达到 Green 关闭条件

## CP-M5-RUNTIME-01

### 自动化验收

- [x] 批量击杀一次追加对应数量的经验宝石，ID 连续且不设置数量上限
- [x] 批量掉落只构建一次合并结果，不为每个击杀复制已有宝石数组
- [x] 投射物碰撞保持按投射物 ID、敌人 ID 的确定性顺序和一弹一伤语义
- [x] 投射物碰撞不再为每颗投射物重复筛选和排序全部敌人
- [x] 纯函数可正确判断圆形实体与视口相交，包括边缘接触和绘制边距
- [x] 大量屏幕外宝石、敌人和投射物不会进入 Canvas 实体绘制调用
- [x] 绘制裁剪不删除实体，也不改变模拟、碰撞、拾取或目标选择
- [x] `npm test`、`npx tsc --noEmit`、`npm run build`、`npm audit` 和 `git diff --check` 通过
- [x] `npm run dev` 已启动，`http://localhost:5173/` 返回 HTTP 200

### 浏览器验收

- [x] 游戏可通过实际开发服务器加载，移动、战斗、经验掉落和拾取正常
- [x] 实体穿过视口边缘时无明显过早消失，敌人血条显示正常
- [x] 浏览器验收在实际观察前保持 `UNVERIFIED`

### 流程验收

- [x] 范围仅限运行时性能、批量经验掉落和可见绘制裁剪
- [x] 不引入后续敌人、掉落、世界物体、效果、内容或 NPC 架构
- [x] 实现检查点 `07be558` 已提交并同步 GitHub
- [x] 首次正式独立审计为 FAIL；发现视口角点圆形相交假阳性
- [x] 审计修复 `330fa59` 已提交并同步 GitHub
- [x] 全新独立复审为 PASS
- [x] 浏览器验收为 PASS；用户报告全部检查通过
- [x] `CP-M5-RUNTIME-01` 已达到 Green 关闭条件
- [x] Green 关闭 `f250741` 已提交并同步 GitHub

## CP-M5-ENEMY-ARCH-01

### 自动化验收

- [x] `EnemyDefinition` 分离静态内容与运行时生命状态
- [x] 敌人注册表同一对象重复注册幂等，同 ID 不同对象抛错并保留原定义
- [x] 内容 bootstrap 重复调用幂等，完整重置后可恢复默认敌人
- [x] 敌人工厂按定义 ID 创建实例，写入必填 `definitionId` 和连续运行时 ID
- [x] 未注册定义 ID 明确抛错，不静默回退到基础敌人
- [x] 两个真实生成入口均通过工厂创建基础敌人
- [x] 基础敌人半径、速度、生命、生成位置和现有玩法保持不变
- [x] 测试专用额外定义可通过工厂创建，无需修改主循环
- [x] `npm test`、`npx tsc --noEmit`、`npm run build`、`npm audit` 和 `git diff --check` 通过
- [x] 开发服务器 `http://localhost:5173/` 返回 HTTP 200

### 浏览器验收

- [x] 基础敌人仍正常生成、追逐、受击、死亡并掉落经验
- [x] 60 秒单局、升级、胜负和重新开始无回归
- [x] 浏览器验收在实际观察前保持 `UNVERIFIED`

### 流程验收

- [x] 范围仅限敌人定义、注册表、工厂和 `definitionId`
- [x] 不新增第二种默认敌人，不实现通用掉落或后续 M5 内容
- [x] 实现检查点 `fb956cb` 已提交并同步 GitHub
- [x] 独立审计为 PASS
- [x] 浏览器验收为 PASS；用户报告全部检查通过
- [x] `CP-M5-ENEMY-ARCH-01` 已达到 Green 关闭条件
- [ ] Green 关闭已提交并同步 GitHub
