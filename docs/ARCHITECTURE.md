# 架构

## CP-M4-OUTCOME-01

### 单局结果

- `GameState.outcome`: running | won | lost
- 纯函数：`src/core/run-outcome.ts` 中的 `resolveRunOutcome`、`clampDtToRunRemaining`
- 优先级：health <= 0 时为 lost；否则 time >= 60 时为 won；否则为 running
- `updateGame`：若为终局状态则返回；将 dt 钳制为单局剩余时间；执行模拟；重新解析结果；进入终局状态时清除待处理项

### 重新开始

- 仅限浏览器：按 KeyR 或使用鼠标主按钮点击“重新开始”
- 通过 KeyR 重新开始时不得带有 Ctrl/Meta/Alt/Shift 修饰键
- 始终执行 `createGameState(computeWorldBounds(currentViewport))` + clearInput + 重置帧时钟
- 仅可在新单局开始时改变世界大小

### 用户界面

- `drawOutcomeOverlay` 位于升级叠加层上方的屏幕空间中
- 使用按钮矩形纯辅助函数进行命中测试
- 重新开始按钮的矩形被钳制为完全位于逻辑视口内

## CP-M5-RUNTIME-01

- 经验掉落继续使用扁平 `ExperienceGem[]`，但同帧击杀通过一次批量追加生成宝石。
- 投射物碰撞继续使用确定性的 ID 顺序，但每帧只建立一次有序活敌列表。
- 可见性判断是无 DOM/Canvas 依赖的纯函数；绘制裁剪只影响 Canvas 调用，不改变 `GameState`。
- 宝石和投射物按圆形边界裁剪；敌人使用额外绘制边距保留顶部血条。
- 不引入实体上限、空间索引、通用实体容器或后续 M5 定义架构。
