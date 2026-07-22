# Decisions

| ID | Date | Decision | Reason | Consequence |
|---|---|---|---|---|
| D-001 | 2026-07-21 | Project root `D:\agent\workspace\vampire_survivors`. | Actual workspace. | Writes in root. |
| D-002 | 2026-07-21 | `AI-Workflow-Library/` ignored reference. | Must not modify/commit. | Required docs only. |
| D-003 | 2026-07-21 | Vite + strict TS + Canvas 2D + Vitest. | Smallest stack. | No engine. |
| D-004 | 2026-07-21 | User M0-M4 names authoritative. | Scope lock. | Milestone meanings fixed. |
| D-005 | 2026-07-21 | Evidence in required docs/. | Avoid duplicate bank. | Less sync risk. |
| D-006 | 2026-07-22 | Modularize via registries without ECS. | game.ts bottleneck. | CP-M4-ARCH-01. |
| D-007 | 2026-07-22 | maxLevel null for unlimited upgrades. | Avoid 999 magic. | Offer filter correct. |
| D-008 | 2026-07-22 | Pending options bind all upgrade input. | Prevent UI desync. | Keyboard/mouse use pending. |
| D-009 | 2026-07-22 | Delete traitIds; weapon level/maxLevel need real path. | Avoid fake extensions. | Round-1 incomplete on weapon path. |
| D-010 | 2026-07-22 | Idempotent bootstrap + test reset API. | Flag/registry desync. | Stable multi-run tests. |
| D-011 | 2026-07-22 | Registry duplicates by object identity. | Metadata equality hid behavior diffs. | Same object OK; different object same id throws. |
| D-012 | 2026-07-22 | `createWeaponProgressionDefinition` for real weapon growth. | Round-1 re-audit: level/maxLevel unused. | Fixture acquire/level-up/max without user-visible second weapon. |