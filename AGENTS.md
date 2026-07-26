# Agent Rules

1. Treat this repository root as the only writable project boundary. `AI-Workflow-Library/` is read-only source material and must not be edited or committed.
2. Never run recursive destructive deletion, `git clean -fdx`, or commands that overwrite unknown user files. Never expose secrets.
3. Before changing code or project docs, read `docs/PROJECT_BRIEF.md`, `docs/PIPELINE.md`, `docs/PLAN.md`, `docs/STATUS.md`, `docs/HANDOFF.md`, `docs/WORKFLOW.md`, `docs/ACCEPTANCE_CRITERIA.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, recent `docs/RUN_LOG.md`, and the affected files.
4. Work only on the current milestone and checkpoint. Do not implement a non-goal or expand scope without user approval recorded in `docs/DECISIONS.md`.
5. After code changes, run `npm test` and `npm run build`. Record actual results in `docs/RUN_LOG.md`; never invent or imply unrun results.
6. Before a checkpoint, inspect `git status` and `git diff`, update status and handoff documents, and commit only intended project files with a milestone-scoped message.
7. A task is complete only when its acceptance criteria pass, evidence is recorded, documentation agrees with the code, and the worktree state is reported.
8. At handoff, update `docs/STATUS.md` and `docs/HANDOFF.md` with the exact state, verified and unverified items, risks, one next task, and the latest commit.
9. Follow `docs/PIPELINE.md` stage gates. After GitHub is configured, push at every required sync point; never guess a remote URL, expose credentials, or force-push.
