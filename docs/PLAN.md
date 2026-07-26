# Plan

## Current Goal

**M4 / MVP Green.** FINAL-MVP-AUDIT-01 independently passed against `6236896`.
All scope-lock capabilities, checkpoint audits, and user browser evidence pass.
Stop before M5+; any expansion requires a newly approved checkpoint.

Final docs-only closeout: `0d0289e` (`M4: close final MVP audit`).
Delivery pipeline: `docs/PIPELINE.md` is mandatory for all future work.

## History

| ID | Status |
|---|---|
| Prior M0-DIFFICULTY | Green |
| CP-M4-OUTCOME-01 | Green: implementation `dfbe925`; repair `a596253`; fresh audit PASS; 203 tests; user browser acceptance PASS |
| FINAL-MVP-AUDIT-01 | PASS at audited baseline `6236896`; 203 tests twice; tsc/build/audit/Git green |

## OUTCOME rules

- lost: health <= 0 (beats win same frame)
- won: elapsedActiveSeconds >= 60 with health > 0
- dt clamped so elapsed never overshoots 60 during sim
- terminal freezes all systems; clears pendingUpgrade
- restart only when terminal: R or button; full new run + world from current viewport

## Later

| Item | Status |
|---|---|
| Independent OUTCOME audit | **PASS after repair** |
| Final MVP audit/closeout | **PASS / closeout `0d0289e`** |
| Delivery pipeline | **Defined; mandatory** |
| GitHub sync | **Blocked: no remote configured** |
| M5+ content | **Not started** |

## M5 Foundation Queue

1. `CP-M5-RUNTIME-01`
2. `CP-M5-ENEMY-ARCH-01`
3. `CP-M5-DROP-ARCH-01`
4. `CP-M5-WORLD-OBJECTS-01`
5. `CP-M5-EFFECTS-01`
6. `CP-M5-CONTENT-01`
7. `CP-M5-NPC-01`

Exact gates, dependencies, Git commits, audits, browser acceptance, and GitHub
sync points are defined in `docs/PIPELINE.md`.
