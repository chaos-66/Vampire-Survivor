# Decisions

| ID | Date | Decision | Reason | Consequence |
|---|---|---|---|---|
| D-001 | 2026-07-21 | Use `D:\agent\workspace\vampire_survivors` as the project root. | Actual shared workspace. | Writes stay in root. |
| D-002 | 2026-07-21 | Treat `AI-Workflow-Library/` as ignored reference. | Must not be modified or committed. | Project workflow in required docs only. |
| D-003 | 2026-07-21 | Vanilla Vite + strict TS + Canvas 2D + Vitest. | Smallest stack. | No engine/UI framework. |
| D-004 | 2026-07-21 | User M0-M4 milestone names are authoritative. | Scope lock. | M0 bootstrap; M1-M4 meanings fixed. |
| D-005 | 2026-07-21 | Status/evidence live in required docs/ files. | Avoid duplicate memory bank. | Less sync risk. |
| D-006 | 2026-07-22 | Modularize via registries without ECS/dual paths. | game.ts bottleneck. | CP-M4-ARCH-01. |
| D-007 | 2026-07-22 | Use maxLevel null for unlimited M3 upgrades (not 999). | Audit: magic number breaks when all options hit cap. | Offer generator treats null as unlimited. |
| D-008 | 2026-07-22 | Pending options bind all upgrade input. | Audit: registry remapping desyncs UI. | Keyboard/mouse use pending list only. |
| D-009 | 2026-07-22 | Delete unused traitIds; keep weapon level/maxLevel for real fixture path. | Avoid fake extension points. | No empty trait system. |
| D-010 | 2026-07-22 | Idempotent registerDefaultContent + explicit test reset API. | Hidden flag desynced from registries. | Stable multi-run tests. |