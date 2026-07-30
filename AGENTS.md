# 智能体规则

1. 将此仓库根目录视为唯一可写的项目边界。`AI-Workflow-Library/` 是只读参考资料，不得编辑或提交。
2. 绝不执行递归破坏性删除、`git clean -fdx` 或会覆盖未知用户文件的命令。绝不泄露机密信息。
3. 修改代码或项目文档前，阅读 `docs/PROJECT_BRIEF.md`、`docs/PIPELINE.md`、`docs/PLAN.md`、`docs/STATUS.md`、`docs/HANDOFF.md`、`docs/WORKFLOW.md`、`docs/ACCEPTANCE_CRITERIA.md`、`docs/ARCHITECTURE.md`、`docs/DECISIONS.md`、`docs/RUN_LOG.md` 的近期记录以及受影响的文件。
4. 仅处理当前里程碑和检查点。未经用户批准并在 `docs/DECISIONS.md` 中记录，不得实现非目标或扩大范围。
5. 修改代码后，运行 `npm test` 和 `npm run build`。在 `docs/RUN_LOG.md` 中记录实际结果；绝不虚构或暗示未运行的结果。
6. 检查点前，检查 `git status` 和 `git diff`，更新状态及交接文档，并且只提交预期的项目文件，提交消息须限定在里程碑范围内。
7. 只有验收标准通过、证据已记录、文档与代码一致且工作区状态已报告时，任务才算完成。
8. 交接时，更新 `docs/STATUS.md` 和 `docs/HANDOFF.md`，准确写明状态、已验证项和未验证项、风险、一个下一任务以及最新提交。
9. 遵循 `docs/PIPELINE.md` 的阶段关卡。配置 GitHub 后，在每个要求的同步点推送；绝不猜测远程仓库 URL、泄露凭据或强制推送。
10. 所有面向人的自然语言必须使用简体中文，包括 README、项目文档、标题、表头、状态、交接、验收、日志说明和用户界面；仅命令、路径、代码标识符、Git 提交原文、固定审计标记和专有技术名可保留原文。
