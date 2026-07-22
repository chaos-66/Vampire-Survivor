# Decisions

| ID | Date | Decision | Reason | Consequence |
|---|---|---|---|---|
| D-001 | 2026-07-21 | Use `D:\agent\workspace\vampire_survivors` as the project root. | The user-provided paths are references and do not exist; this is the actual shared workspace. | All project writes remain inside this root. |
| D-002 | 2026-07-21 | Treat `AI-Workflow-Library/` as read-only source material and exclude it from project Git. | It was the only pre-existing content and must not be modified or mechanically copied. | Project workflow is adapted into the required files only. |
| D-003 | 2026-07-21 | Use vanilla Vite + strict TypeScript + Canvas 2D + Vitest. | This is the smallest stack that meets the project and M0 test requirements. | No frontend framework or game engine is introduced. |
| D-004 | 2026-07-21 | Map the library's M1-M3 execution concepts onto the user-defined M0-M4 milestones. | The user's milestone names are authoritative. | M0 is the bootstrap checkpoint; M1-M4 retain the brief's meanings. |
| D-005 | 2026-07-21 | Keep status, checkpoint evidence, and handoff in the required `docs/` files rather than copying the seven-file memory bank. | The project is small and already requires equivalent records. | Less duplication and fewer synchronization risks. |
| D-006 | 2026-07-22 | Modularize M1–M3 via registries (character/weapon/progression) and system modules without ECS or dual paths. | `game.ts` had become a multi-responsibility bottleneck before content expansion. | CP-M4-ARCH-01 only; flat runtime `GameState` retained for test stability; content is data+apply hooks. |
| D-007 | 2026-07-22 | Keep 迅捷/急速/强击 at effectively unlimited maxLevel (high cap) so M3 stacking behavior is unchanged. | M3 allowed unlimited stacking; architecture still filters by maxLevel for future content. | maxLevel is real; default upgrades use a high cap; tests use a fixture with maxLevel 1. |
