# 状态

## 快照

- 当前阶段：M5 基础建设；`CP-M5-CONTENT-01` 已达到 **Green**；`CP-M5-ABILITY-01` 范围关卡待进行
- 交接状态：CONTENT-01 自动验证、独立审计、用户浏览器验收和 Green 关闭验证均为 PASS
- CONTENT-01 范围关卡提交：`cd36de5`（`M5: scope first real content checkpoint`），已同步 GitHub
- CONTENT-01 实现提交：`aa0a999`（`M5: introduce first real content`），已同步 GitHub
- EFFECTS 实现提交：`9ddf4f6`（`M5: introduce runtime effect architecture`），已同步 GitHub
- EFFECTS 首次修复提交：`9986b4d`（`M5: fix runtime effect audit findings`），已同步 GitHub
- EFFECTS 第二轮修复提交：`980232c`（`M5: harden runtime effect boundaries`），已同步 GitHub
- EFFECTS 审计状态修复提交：`8650e7f`（`M5: record runtime effect audit repairs`），已同步 GitHub
- EFFECTS 审计状态对齐提交：`9581698`（`M5: align runtime effect audit status`），已同步 GitHub
- EFFECTS 交接稳定提交：`b523b4f`（`M5: stabilize runtime effect audit handoff`），已同步 GitHub
- 最近关闭的检查点：`CP-M5-CONTENT-01`，**Green**
- 最近关闭的检查点：`CP-M5-WORLD-OBJECTS-01`，**Green**
- 最近关闭的检查点：`CP-M5-DROP-ARCH-01`，**Green**
- 交接状态：WORLD-OBJECTS 自动验证、独立审计、用户浏览器验收和 Green 关闭验证均为 PASS
- WORLD-OBJECTS 实现提交：`e3883a8`（`M5: introduce static world objects`），已同步 GitHub
- WORLD-OBJECTS Green 关闭提交：`e3fd3ec`（`M5: close world objects checkpoint`），已同步 GitHub
- 最近关闭的检查点：`CP-M5-ENEMY-ARCH-01`，**Green**
- DROP-ARCH 实现提交：`bdb5513`（`M5: introduce drop and pickup architecture`），已同步 GitHub
- DROP-ARCH Green 关闭提交：`37e0a9a`（`M5: close drop architecture checkpoint`），已同步 GitHub
- ENEMY-ARCH 基线 HEAD：`e6627de`；开始时工作区干净并与 `origin/main` 同步
- ENEMY-ARCH 实现提交：`fb956cb`（`M5: introduce enemy definition architecture`）
- ENEMY-ARCH 正式独立审计：**PASS**
- ENEMY-ARCH 用户浏览器验收：**PASS**
- ENEMY-ARCH Green 关闭提交：`ecf5ffb`（`M5: close enemy architecture checkpoint`）
- 依赖检查点：`CP-M5-RUNTIME-01`，**Green**
- 基线 HEAD：`a68424a`；开始时工作区干净并与 `origin/main` 同步
- 实现提交：`07be558`（`M5: establish runtime entity performance baseline`）
- 首次正式独立审计：**FAIL**；发现视口角点圆形相交假阳性
- 审计修复提交：`330fa59`（`M5: fix runtime visibility corner culling`）
- 全新独立复审：**PASS**
- 用户浏览器验收：**PASS**
- Green 关闭提交：`f250741`（`M5: close runtime performance checkpoint`）
- 最近关闭的检查点：`CP-OPS-CHINESE-DOCS-01`，**Green**
- 中文化实现提交：`67eb0dc`（`OPS: localize human-readable documentation`）
- 首次正式独立审计：**FAIL**；审计修复提交：`15b474c`（`OPS: fix Chinese documentation audit findings`）
- 全新独立复审：**PASS**
- Green 关闭提交：`1279998`（`OPS: close Chinese documentation checkpoint`）
- 检查点：`dfbe925`（`M4: implement timed run outcomes and restart`）
- 已审计的 MVP 基线：`6236896`（`M4: close run outcome checkpoint`）
- 最终 MVP 纯文档收尾：`0d0289e`（`M4: close final MVP audit`）
- OUTCOME 修复：`a596253`（`M4: fix run outcome audit findings`）
- 最后更新：2026-08-06
- DIFFICULTY Green；辅助指针 Green
- 获胜/失败/重新开始：**Green**
- FINAL-MVP-AUDIT-01: **PASS**
- M5+ 内容：**RUNTIME、ENEMY-ARCH、DROP-ARCH、WORLD-OBJECTS、EFFECTS 与 CONTENT-01 Green；`CP-M5-ABILITY-01` 范围关卡待进行**
- 交付流程：**已定义；强制执行**（`docs/PIPELINE.md`）
- 流程检查点：`74b6a3e`（`OPS: define mandatory delivery pipeline`）
- GitHub 远程仓库：`origin` -> `https://github.com/chaos-66/Vampire-Survivor.git`
- GitHub 同步：**CONTENT-01 Green 关闭提交 `6476dcf` 已同步；`main` 跟踪 `origin/main`**

## 已实现

- `outcome: running | won | lost`；同一帧中 lost > won
- RUNTIME：批量经验追加、投射物碰撞列表复用、可见实体绘制裁剪已应用
- ENEMY-ARCH：定义、注册表、严格工厂、默认敌人和运行时 `definitionId` 已应用
- DROP-ARCH：掉落/拾取定义、对象身份注册表、严格工厂、默认经验掉落和运行时
  `definitionId` 已应用；现有经验路径已迁移为 `drops`
- DROP-ARCH 自动验证：9 个测试文件 / 223 项测试；tsc / build（50 个模块）/ audit /
  diff check 通过；开发服务器 `http://127.0.0.1:5173/` 返回 HTTP 200
- DROP-ARCH 独立审计：首次和第二次为 FAIL（文档一致性问题，均已修复）；第三次全新复审
  为 PASS；用户浏览器验收为 PASS
- WORLD-OBJECTS：确定性静态矩形物体、玩家障碍碰撞、矩形可见查询和可见绘制已应用
- WORLD-OBJECTS 自动验证：10 个测试文件 / 236 项测试；tsc / build（52 个模块）/ audit /
  diff check 通过；开发服务器 `http://127.0.0.1:5173/` 返回 HTTP 200
- WORLD-OBJECTS 独立审计：PASS；未发现阻塞性问题
- WORLD-OBJECTS 用户浏览器验收：PASS
- EFFECTS：即时/限时效果定义、对象身份注册表、严格应用、`refresh` / `stack` 规则、
  活动状态和移动/武器有效属性接线已应用；默认内容不注册效果
- EFFECTS 自动验证：11 个测试文件 / 248 项测试；tsc / build（54 个模块）/ audit /
  diff check 通过；开发服务器 `http://127.0.0.1:5173/` 返回 HTTP 200
- EFFECTS 首次独立审计：FAIL；非法 `maxStacks` 可产生无限/`NaN` 层，帧中到期仍错误影响整帧
- EFFECTS 审计修复验证：11 个测试文件 / 256 项测试；tsc / build（54 个模块）/ audit /
  diff check 通过
- EFFECTS 第二次独立复审：FAIL；合法大倍率组合仍可溢出，冷却恰好等于到期边界时仍使用旧效果
- EFFECTS 第二轮修复验证：11 个测试文件 / 259 项测试；tsc / build（54 个模块）/ audit /
  diff check 通过
- EFFECTS 第三次独立复审：FAIL；代码结论通过，但提交和同步状态文档过时
- EFFECTS 第四次独立复审：FAIL；代码结论通过，但第三次失败计数和 `8650e7f` 同步证据仍过时
- EFFECTS 第五次独立复审：FAIL；仅汇总计数过时，改用不依赖动态计数的稳定表述
- EFFECTS 第六次全新独立复审：PASS；代码与流程均无阻塞项
- EFFECTS 用户浏览器验收：PASS；Green 关闭验证：11 个文件 / 259 项测试；tsc / build（54
  个模块）/ audit / diff check 通过
- EFFECTS Green 关闭提交：`32da5a4`（`M5: close runtime effect checkpoint`），已同步 GitHub
- CONTENT-01：`spawnWeight` 权重生成、敌人自带掉落表（`kills` 携带 `definitionId`）、
  `PickupResult` 拾取结果、散射武器 offer、迅捷蝠、食物与宝箱、数据驱动掉落颜色已应用
- CONTENT-01 自动验证：12 个文件 / 278 项测试；tsc / build（59 个模块）/ audit /
  diff check 通过；开发服务器 `http://localhost:5173/` 返回 HTTP 200
- CONTENT-01 首次独立审计：FAIL；代码与自动化验收全部通过，阻塞项仅为文档一致性
  （实现提交与同步事实未记录、旧状态残留、build 模块数记录不符）；修复提交 `bdc9b70` 已推送
- CONTENT-01 第二次独立复审：FAIL；代码通过，阻塞项为 PIPELINE 当前入口与 HANDOFF 残留
  旧表述、`bdc9b70` 同步事实未记录；第二次修复提交 `9dd2c73` 已推送
- CONTENT-01 第三次独立复审：FAIL；代码通过，阻塞项为 `9dd2c73` 同步证据未记录、
  最后同步提交未更新、旧措辞残留；第三次修复提交 `c19b3ab` 已推送
- CONTENT-01 第四次独立复审：FAIL；代码通过，阻塞项为 STATUS 快照残留旧计数措辞；
  第四次修复已应用
- CONTENT-01 武器语义修复：D-037 单件替换 + 散射弹 1/2/3 级 → 3/4/5 颗弹；修复后全新复审
  PASS（提交 `8a49ef5`）
- CONTENT-01 升级随机化：D-038 `offerWeight` 权重随机抽取、位置随机、散射弹权重 0.6
  （提交 `e05977c`）；三次复审 FAIL 均为文档一致性（同步证据缺失、PIPELINE 入口过时、
  证据链不全），第四次全新复审 **PASS**
- CONTENT-01 坚持时间与卡片适配：D-039 5 分钟单局、HUD `mm:ss`、卡片描述自动换行
  （`wrapTextByWidth`）；四次复审 FAIL 均为文档一致性，第四次全新复审 **PASS**（提交 `0866487`）
- CONTENT-01 用户浏览器验收：PASS（用户回复 `pass`；未提供浏览器名称和版本）
- CONTENT-01 Green 关闭验证：13 个文件 / 286 项测试；tsc / build（60 个模块）/ audit /
  diff check 通过；`npm audit fix` 最小 nanoid 锁文件更新（D-040）
- 活跃时间被钳制为准确的 5 分钟（`RUN_DURATION_SECONDS`）
- 终局状态冻结所有模拟；清除 pendingUpgrade
- 仅在终局状态下可通过 KeyR 或中文按钮重新开始；完整调用 `createGameState`
- 根据当前视口创建新单局世界；清除键盘输入；重置帧时钟
- 屏幕空间中的结果叠加层
- RUNTIME 自动验证：9 个测试文件 / 211 项测试；tsc / build / audit / diff check 通过
- ENEMY-ARCH 自动验证：9 个测试文件 / 217 项测试；tsc / build / audit / diff check 通过
- ENEMY-ARCH 开发服务器：`http://localhost:5173/` 返回 HTTP 200；随后用户浏览器验收 PASS
- RUNTIME 开发服务器可达：`http://localhost:5173/` 返回 HTTP 200；随后用户浏览器验收 PASS
- 检查点 `dfbe925`；检查后 198 项测试 / tsc / build 均为绿色状态
- 首次独立 OUTCOME 审计：FAIL；带修饰键的 R 组合会重新开始
  游戏，小视口可能隐藏重新开始按钮，终局状态提前返回时可能
  保留待处理升级，并且流程文档存在标识符/HEAD 冲突
- 本地修复仅接受无修饰键的 R，将按钮边界保持在视口内，
  清除终局待处理状态，并修复决策/HEAD 记录
- 修复验证：8 个文件 / 203 项测试；tsc / build / audit / 差异检查均为绿色状态
- 全新独立 OUTCOME 修复复审：PASS；没有阻塞性发现
- 用户报告的完整 OUTCOME 浏览器验收：PASS

## 最终审计证据

- `npm test` 两次：每次均有 8 个文件 / 203 项测试 PASS
- `npx tsc --noEmit`: PASS
- `npm run build`：PASS；转换了 43 个模块
- `npm audit`：0 个漏洞
- Git 范围 `84ab53b..6236896`：仅包含预期的 OUTCOME 和文档路径；空白检查 PASS
- M0、M1、M2、M3、ARCH、WORLD、DIFFICULTY 和 OUTCOME 均已审查为 Green
- 已审查所有玩法检查点的用户浏览器证据
- 最终纯文档收尾 `0d0289e`；源代码与审计基线相比未发生变化

## 已接受的残余风险

- 未提供浏览器名称和版本
- 未收集的经验宝石有意不设上限，可能增加长时间运行时的
  内存、扫描和绘制成本
- Edge 浏览器界面或扩展的右键拖动手势可能绕过页面脚本
- 屏幕外宝石和完整世界边界可能增加较低且不阻塞的绘制成本

## 下一步

`CP-M5-CONTENT-01` 已 Green 关闭。唯一下一任务是 `CP-M5-ABILITY-01` 的范围关卡：
按 `docs/PIPELINE.md` 阶段 0 产出唯一检查点 ID、目标/非目标、受影响模块、自动与浏览器
验收项，并在 `docs/DECISIONS.md` 记录范围批准（D-041）后开始实现。能力与武器分离，
不重做武器系统。后续纯文档状态提交按 `docs/PIPELINE.md` 不写入自身哈希，以避免递归
状态提交。
