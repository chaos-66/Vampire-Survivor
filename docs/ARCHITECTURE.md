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
