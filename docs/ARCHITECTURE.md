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

## CP-M5-ENEMY-ARCH-01

- `EnemyDefinition` 保存静态名称、说明、半径、速度和最大生命；不保存当前生命或位置。
- `Enemy` 保存运行时 ID、必填 `definitionId`、位置、当前生命及定义派生的运行属性。
- 敌人注册表沿用对象身份规则：同一对象幂等，同 ID 不同对象抛错。
- 敌人工厂必须解析已注册定义；未知 ID 明确失败，不提供静默兼容回退。
- 当前两个生成入口只选择默认基础敌人 ID，实例属性统一由工厂创建。
- 本检查点不加入生成权重、第二种默认敌人或掉落配置。

## CP-M5-DROP-ARCH-01

- `DropDefinition` 保存静态名称、说明、半径和 `pickupDefinitionId`；不保存位置、运行时
  ID 或收集状态。
- `PickupDefinition` 保存静态名称、说明和纯 `collect(experience)` 规则；当前唯一实现只
  增加既有经验值。
- 掉落与拾取注册表均遵循对象身份规则：同一对象幂等，同 ID 不同对象抛错。
- 严格掉落工厂必须解析已注册的掉落定义及其拾取定义；任一缺失均明确失败，不提供静默
  默认经验掉落或拾取回退。
- `experience_drop` 是当前唯一默认掉落，映射 `experience_pickup`；两者由内容 bootstrap
  注册，完整测试重置后可恢复。
- `GameState.drops` 保存运行时实例；`advanceProjectiles.kills` 通过
  `spawnExperienceDropsAt` 一次追加实例，`pickupDrops` 通过定义解析经验结果。
- 本检查点不加入其他掉落内容、稀有度、权重、库存、世界物体、效果或 NPC。

## CP-M5-WORLD-OBJECTS-01

- `WorldObject` 是运行时静态矩形物体，保存连续 ID、位置、宽高和 `blocksMovement`；不使用
  注册表、随机地图或内容生成权重。
- `createStaticWorldObjects` 按世界中心创建固定布局；小世界空间不足时安全返回可用子集，默认布局
  不与初始玩家重叠且位于世界内。
- 玩家移动先按既有速度与世界边界计算目标，再通过 `movePlayerAroundObstacles` 解析圆形玩家与
  矩形障碍；两轴分步移动阻止大步长穿透，并允许沿障碍边缘滑动。
- 当前只有玩家受 `blocksMovement` 物体阻挡；敌人、投射物、掉落和生成不与世界物体碰撞。
- `worldObjectIntersectsView` / `queryVisibleWorldObjects` 是无 DOM/Canvas 依赖的矩形可见查询；
  绘制只跳过不可见物体，不删除、重排或修改状态。
- 本检查点不加入可破坏物、交互、效果、食物、宝箱、NPC、空间索引或程序化地图。

## CP-M5-EFFECTS-01

- `EffectDefinition` 分为 `instant` 和 `timed`；即时效果每次应用直接执行一次，限时效果进入
  `GameState.activeEffects`。
- 效果注册表遵循对象身份规则：同一对象幂等，同 ID 不同对象抛错；未知 ID 的应用明确失败。
- 限时效果定义持续时间、`refresh` / `stack` 规则、叠层上限及移速、攻击间隔、投射物伤害
  倍率；运行时只保存定义 ID、剩余时间和层数。
- `refresh` 重新应用时刷新持续时间并保持单层；`stack` 刷新持续时间并增加至明确上限。
- `deriveEffectivePlayer` 从永久玩家属性和活动效果派生有效值；不改写基础移速、攻击间隔或伤害，
  因此效果到期无需反向修改升级结果。
- 游戏循环按最近效果到期边界切分有效战斗帧，在每个时间片重新派生移速和武器属性并推进
  效果时间；pending 和终局状态在提前返回时冻结效果时间。
- 注册表严格要求持续时间为正有限数、`maxStacks` 为正有限整数、`refresh` 上限为 1，倍率为
  非负有限数，防止无限叠层或 `NaN` 污染运行时属性。
- 默认内容不注册任何效果；本检查点不加入 UI、特效、伤害类型、抗性、光环、区域效果、食物、
  宝箱、NPC 或其他真实内容。
