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
| D-017 | 2026-07-25 | Implement dynamic difficulty before win/loss/restart. | User selected the minimum-risk sequence. | CP-M4-DIFFICULTY-01 is the only active checkpoint. |
| D-018 | 2026-07-25 | Difficulty uses active-time spawn interval/cap tiers only. | Increase pressure without coupling outcome logic or changing enemy balance. | Tiers at 0/15/30/45s; upgrades freeze time; enemy stats remain baseline. |
| D-019 | 2026-07-25 | Every defeated enemy must create an experience drop; gems have no count cap. | User explicitly rejected silent drop loss after the historical cap. | Remove `GEM_CAP`; long runs may retain all uncollected gem entities. |
| D-020 | 2026-07-25 | (Superseded) Earlier attempt cleared held input on Canvas `contextmenu`. | Avoid stuck keys when browser swallows keyup. | Incorrect: stopped movement while keys still held. |
| D-021 | 2026-07-25 | Canvas secondary pointer only `preventDefault`s; never mutates keyboard `InputState`. | D-020 stopped held WASD/arrows on right-click. | Right-click is browser-default suppression only on the game Canvas; blur/visibility still clear input. |
| D-022 | 2026-07-26 | Accept Edge chrome/extension right-drag gestures as a non-blocking browser-level risk. | Page script cannot reliably cancel gestures intercepted by browser chrome or extensions. | Canvas input neutrality is required; users disable configured browser gestures when needed. |
| D-023 | 2026-07-25 | Timed run: 60s win, HP0 loss, lost preferred, full restart. | User approved OUTCOME checkpoint. | CP-M4-OUTCOME-01; no endless mode. |
| D-024 | 2026-07-25 | Clamp sim dt to remaining run time so elapsed hits 60 exactly. | Avoid overshoot past win boundary. | No extra spawn/damage past 60. |
| D-025 | 2026-07-26 | Declare M4/MVP Green after FINAL-MVP-AUDIT-01 PASS at `6236896`. | All scope-lock capabilities have automated, independent, and user browser evidence. | Stop before M5+; expansion requires a new approved checkpoint. |
| D-026 | 2026-07-27 | Make `docs/PIPELINE.md` mandatory for all future tasks. | User requested a documented, required delivery pipeline. | Every task follows scope, implementation, verification, audit, browser, closeout, and GitHub sync gates. |
| D-027 | 2026-07-27 | Synchronize GitHub at deterministic checkpoint boundaries. | Replace ad hoc uploads with safe, auditable version publication. | Push verified commits after implementation, repair, Green closeout, handoff, or explicit request; never force-push. |
| D-028 | 2026-07-27 | M5 foundations proceed RUNTIME -> ENEMY-ARCH -> DROP-ARCH -> WORLD-OBJECTS -> EFFECTS -> CONTENT -> NPC. | Performance and reusable definitions must precede content growth. | Reordering or combining checkpoints requires explicit user approval. |
