# Plan

## Current Goal

**M4 / MVP Green.** FINAL-MVP-AUDIT-01 independently passed against `6236896`.
All scope-lock capabilities, checkpoint audits, and user browser evidence pass.
Stop before M5+; any expansion requires a newly approved checkpoint.

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
| Final MVP audit/closeout | **PASS / docs-only closeout in progress** |
| M5+ content | **Not started** |
