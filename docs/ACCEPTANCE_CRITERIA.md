# Acceptance Criteria

## M0

- [x] The actual project location and pre-existing files are documented.
- [x] Git is initialized and the worktree is inspected before checkpointing.
- [x] The required ten workflow and project documents exist and do not contain material contradictions.
- [x] Vite, strict TypeScript, HTML Canvas, and Vitest are configured without gameplay implementation.
- [x] `npm install` exits successfully and creates a lockfile.
- [x] `npm test` exits successfully with at least one executed test.
- [x] `npm run build` exits successfully and creates ignored build output.
- [x] Actual command evidence is present in `RUN_LOG.md`.
- [x] `STATUS.md` and `HANDOFF.md` reflect the post-verification state.
- [ ] A Git checkpoint named `M0: bootstrap project workflow and toolchain` exists.

## Milestone Audit Rule

The implementing agent may gather evidence but must not represent its own review as an independent milestone audit. Before entering M1, a fresh agent or the user should compare this checklist with the repository and rerun `npm test` and `npm run build`. Until then, the implementation can be checkpointed as M0 while independent audit status remains explicitly recorded.
