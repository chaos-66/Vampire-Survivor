# Project Workflow

This is a lightweight adaptation of the local Workflow Library for a small TypeScript Canvas game.

## Start A Task

1. Confirm the repository root and inspect `git status` without discarding existing changes.
2. Read `AGENTS.md`, `PROJECT_BRIEF.md`, `PLAN.md`, `STATUS.md`, and `HANDOFF.md` plus affected source and tests.
3. Reconstruct truth from repository files, not prior chat. Resolve contradictions before coding.
4. Select one current-milestone checkpoint and compare it with the scope lock and non-goals.
5. Define observable acceptance and the commands that prove it before implementation.

## Code

1. Make the smallest change that satisfies the selected checkpoint.
2. Keep simulation logic separable from Canvas rendering where practical so rules can be unit tested.
3. Use placeholders and browser APIs before adding dependencies or abstractions.
4. Do not mix unrelated cleanup or future milestone work into the change.

## Test

1. Add or update focused Vitest tests for deterministic logic.
2. Run `npm test` and `npm run build` after code changes.
3. Manually run `npm run dev` when browser behavior or rendering changes, and record what was actually observed.
4. Record command, result, and relevant warnings or failures in `RUN_LOG.md`. Failed evidence remains recorded until superseded by a successful rerun.

## Checkpoint

1. Confirm the checkpoint acceptance criteria and run its commands.
2. Review `git status` and `git diff`; stage only intended files and never stage secrets or build output.
3. Update `STATUS.md`, `RUN_LOG.md`, and `HANDOFF.md` before committing.
4. Commit with a milestone-scoped message and then record the resulting commit hash without amending solely to place its own hash in that commit.
5. A checkpoint is green only with real evidence and a Git commit that can serve as the rollback point.

## Audit

At every milestone exit, a fresh agent or user acting only as auditor reads the scope, acceptance criteria, evidence, and diff, then reruns critical commands. The result is `PASS`, `FAIL`, or `INCONCLUSIVE`; the implementing agent's own claim is not an independent audit. A failure blocks the next milestone.

## Interruption Recovery

1. Read `PROJECT_BRIEF.md`, `STATUS.md`, `HANDOFF.md`, `PLAN.md`, `ARCHITECTURE.md`, and recent `RUN_LOG.md` entries.
2. Compare the documented latest commit with `git log -1` and inspect `git status`.
3. Treat missing evidence as unverified and contradictions as blockers.
4. Resume only the single next task named in `STATUS.md`; do not infer progress from chat history.

## Multi-Agent Handoff

The outgoing agent updates `STATUS.md` and `HANDOFF.md` with exact verified/unverified state, recent files, risks, blockers, latest commit, and one next task. The incoming agent reads those files first, checks Git independently, and does not overwrite concurrent or unknown changes.
