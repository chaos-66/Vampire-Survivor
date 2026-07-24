# Decisions

| ID | Date | Decision | Reason | Consequence |
|---|---|---|---|---|
| D-001 | 2026-07-21 | Project root `D:\agent\workspace\vampire_survivors`. | Actual workspace. | Writes in root. |
| D-002 | 2026-07-21 | `AI-Workflow-Library/` ignored. | Must not modify/commit. | Required docs only. |
| D-003 | 2026-07-21 | Vite + strict TS + Canvas 2D + Vitest. | Smallest stack. | No engine. |
| D-004 | 2026-07-21 | User M0-M4 names authoritative. | Scope lock. | Milestone meanings fixed. |
| D-005 | 2026-07-21 | Evidence in required docs/. | Avoid duplicate bank. | Less sync risk. |
| D-006 | 2026-07-22 | Modularize via registries without ECS. | game.ts bottleneck. | CP-M4-ARCH-01. |
| D-007 | 2026-07-22 | maxLevel null for unlimited upgrades. | Avoid 999 magic. | Offer filter correct. |
| D-008 | 2026-07-22 | Pending options bind all upgrade input. | Prevent UI desync. | Keyboard/mouse use pending. |
| D-009 | 2026-07-22 | Delete traitIds; weapon level needs real path. | Avoid fake extensions. | Later weapon growth. |
| D-010 | 2026-07-22 | Idempotent bootstrap + test reset API. | Flag/registry desync. | Stable multi-run tests. |
| D-011 | 2026-07-22 | Registry duplicates by object identity. | Metadata equality hid behavior. | Same object OK; different object throws. |
| D-012 | 2026-07-22 | `createWeaponProgressionDefinition` for weapon growth. | level/maxLevel unused. | Fixture path without second user weapon. |
| D-013 | 2026-07-22 | Full-screen Canvas uses CSS viewport + DPR-capped backing store. | WORLD demo needs fill window clarity. | Logical draw in CSS pixels. |
| D-014 | 2026-07-22 | World size max(12000,vw*10) x max(7000,vh*10); fixed for run. | Large world without infinite map. | Resize does not resim world. |
| D-015 | 2026-07-22 | Camera follows player; screen-only transform. | Separation of sim and view. | Camera not in collision. |
| D-016 | 2026-07-22 | Enemies spawn outside current view, inside world. | Edge-of-world spawn too far on large maps. | Spawn needs view rect pure inputs. |