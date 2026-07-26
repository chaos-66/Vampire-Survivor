# Plan

## Current Goal

**CP-M4-OUTCOME-01 Green.** Automated verification, independent repair re-audit,
and user browser acceptance all pass. Stop before final MVP audit or M5+.

## History

| ID | Status |
|---|---|
| Prior M0-DIFFICULTY | Green |
| CP-M4-OUTCOME-01 | Green: implementation `dfbe925`; repair `a596253`; fresh audit PASS; 203 tests; user browser acceptance PASS |

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
| Final MVP audit/closeout | **Not started; next checkpoint must be defined** |
| M5+ content | **Not started** |
