# Project Brief

## Goal

Build a small, deterministic Survivors-style browser game whose core loop is movement, automatic attacks, enemy pressure, experience collection, upgrades, and a clear run outcome.

## Stack

- Vite for local development and production builds
- TypeScript in strict mode
- HTML Canvas 2D for rendering
- Vitest for automated tests
- Browser APIs and CSS without a UI framework

## Scope Lock

The MVP must provide no more than these five capabilities:

- A player moves inside a bounded arena.
- Enemies spawn, pursue the player, and create collision pressure.
- The player attacks automatically and can defeat enemies.
- Defeated enemies yield experience that drives a small upgrade choice flow.
- A timed run ends in a visible win or loss state and can restart.

## Non-goals

- No multiplayer, backend, accounts, cloud saves, analytics, or online services.
- No 3D engine, game framework, physics library, or heavy state-management library.
- No production art pipeline, music, elaborate menus, settings, localization, or accessibility certification in the MVP.
- No procedural map system, meta-progression, character roster, inventory, achievements, or leaderboard.
- No M1-M4 gameplay implementation during M0.

## Milestones

| Milestone | Deliverable | Exit signal |
|---|---|---|
| M0 | Project workflow, Vite/TypeScript/Canvas scaffold, test harness, and Git checkpoint | Install, test, and build pass; M0 checkpoint exists |
| M1 | Playable movement loop in a bounded Canvas arena | Player movement and frame loop are testable and demonstrable |
| M2 | Enemy spawning, pursuit, collision pressure, automatic attacks, and enemy defeat | Combat pressure loop is demonstrable |
| M3 | Experience drops, leveling, and a minimal upgrade choice | Progression loop is demonstrable |
| M4 | Timed win/loss, restart, tuning, regression checks, and final MVP audit | All scope-lock capabilities pass acceptance |

Scope changes require explicit user approval and an entry in `docs/DECISIONS.md`.
