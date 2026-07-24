# Status

## Snapshot

- Current stage: CP-M4-WORLD-01 repair checkpoint complete; browser acceptance pending
- Audited checkpoint: `ba20893` (`M4: implement full-screen large world demo`)
- Repair checkpoint: `008514e` (`M4: repair world-edge enemy spawning`)
- Last updated: 2026-07-24
- M3 Green; CP-M4-ARCH-01 Green
- Dynamic difficulty: **Not started**
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

## Unverified

- Interactive browser WORLD checklist — UNVERIFIED

## Next Step

Complete browser acceptance. Do not start difficulty or win/loss.
