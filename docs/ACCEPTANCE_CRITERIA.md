# Acceptance Criteria

## Prior checkpoints Green

DIFFICULTY close `84ab53b`. Secondary pointer lifecycle Green.

## CP-M4-OUTCOME-01

### Automated

- [x] resolveRunOutcome: running / won / lost; lost beats won
- [x] clampDtToRunRemaining: 59.98+0.05 -> 0.02; no overshoot past 60
- [x] updateGame terminal freeze; sticky outcome
- [x] pending freezes time (no mid-choice win)
- [x] contact to 0 HP -> lost; pending+0 HP -> lost
- [x] createGameState full reset fields
- [x] restart button layout hit-test
- [x] isRestartCode KeyR
- [x] Regression 203 tests total after audit repair
- [x] npm test / tsc / build / audit recorded

### Browser

- [ ] Full OUTCOME interactive checklist — **UNVERIFIED**

### Process

- [x] OUTCOME checkpoint commit (`dfbe925`)
- [x] First independent audit FAIL; findings repaired locally
- [x] Fresh independent re-audit PASS
- [x] OUTCOME repair checkpoint (`a596253`)
- [x] M5+ not started
