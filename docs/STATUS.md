# Status

## Snapshot

- Current stage: CP-M4-DIFFICULTY-01 input/gem repair independently audited PASS; repair checkpoint pending
- Audited checkpoint: `ba20893` (`M4: implement full-screen large world demo`)
- Repair checkpoint: `008514e` (`M4: repair world-edge enemy spawning`)
- Difficulty checkpoint: `60bd1dc` (`M4: implement dynamic spawn difficulty`)
- Last updated: 2026-07-25
- M3 Green; CP-M4-ARCH-01 Green
- Dynamic difficulty: **Implemented; automated verification passed**
- Win/loss/restart: **Not started**
- M5+ content: **Not started**

## Implemented

- Full-screen CSS viewport Canvas + DPR (cap 2) backing store
- World: max(12000, vw*10) x max(7000, vh*10), fixed for run
- Camera follow + clamp; worldToScreen / screenToWorld
- World entities via camera; HUD/upgrade screen-space
- Visible-only world grid; off-view enemy spawn in bounded view-edge bands
- Resize updates viewport only
- Original checkpoint `ba20893`; post-check 136 tests / tsc / build green
- Audit found side-band spawning sampled across the entire world, allowing
  enemies to spawn thousands of units away and consume the enemy cap
- Repair limits spawn depth and along-edge range near the current view
- Independent repair audit PASS: 6 files / 138 tests; tsc / build / audit /
  diff check green
- User-reported interactive WORLD browser acceptance: PASS

## Approved Difficulty Scope

- Active simulation time only; pending upgrade freezes the difficulty clock
- Four pure tiers at 0s / 15s / 30s / 45s
- Spawn interval 1.00s / 0.80s / 0.65s / 0.50s
- Enemy cap 20 / 24 / 28 / 32
- Chinese HUD shows elapsed time and tier
- No enemy stat scaling and no win/loss/restart

## Difficulty Evidence

- Pure profile module: `src/core/difficulty.ts`
- Active time freezes through the existing pending-upgrade early return
- Dynamic interval/cap passed focused tier, boundary, cap, and baseline-stat tests
- Chinese status/HUD exposes active time and current tier
- Automated difficulty verification: 7 files / 169 tests; tsc / build / audit /
  diff check green
- User reported the difficulty browser checklist passed, then identified two
  blocking regressions: Canvas right-click could stick movement, and gem drops
  stopped after the historical 100-entity cap
- Local repair suppresses Canvas context menus while clearing input and removes
  the gem count cap so every requested kill drop is created
- Repair verification: 7 files / 170 tests; tsc / build / audit / diff check green
- Independent input/gem repair audit: PASS; no blocking findings

## Unverified / Not Started

- Browser name and version were not supplied
- First independent difficulty audit: FAIL; mutable profiles, cross-tier frame
  timing, and non-finite dt findings repaired locally
- Second independent difficulty audit: FAIL; finite hostile external profile
  parameters could still create an effectively unbounded spawn loop
- Final independent difficulty audit: PASS; no blocking findings
- Difficulty browser checklist: user-reported PASS
- Input/gem repair checkpoint and focused browser recheck are pending
- Win/loss/restart and M5+ content remain not started

## Next Step

Create the input/gem repair checkpoint, then obtain focused browser recheck.
