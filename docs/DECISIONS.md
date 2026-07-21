# Decisions

| ID | Date | Decision | Reason | Consequence |
|---|---|---|---|---|
| D-001 | 2026-07-21 | Use `D:\agent\workspace\vampire_survivors` as the project root. | The user-provided paths are references and do not exist; this is the actual shared workspace. | All project writes remain inside this root. |
| D-002 | 2026-07-21 | Treat `AI-Workflow-Library/` as read-only source material and exclude it from project Git. | It was the only pre-existing content and must not be modified or mechanically copied. | Project workflow is adapted into the required files only. |
| D-003 | 2026-07-21 | Use vanilla Vite + strict TypeScript + Canvas 2D + Vitest. | This is the smallest stack that meets the project and M0 test requirements. | No frontend framework or game engine is introduced. |
| D-004 | 2026-07-21 | Map the library's M1-M3 execution concepts onto the user-defined M0-M4 milestones. | The user's milestone names are authoritative. | M0 is the bootstrap checkpoint; M1-M4 retain the brief's meanings. |
| D-005 | 2026-07-21 | Keep status, checkpoint evidence, and handoff in the required `docs/` files rather than copying the seven-file memory bank. | The project is small and already requires equivalent records. | Less duplication and fewer synchronization risks. |
