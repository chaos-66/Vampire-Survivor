# Handoff

## Current Truth

- Root: `D:\agent\workspace\vampire_survivors`
- Secondary-pointer repair: `098841f` (`M4: make secondary pointer input-neutral`)
- Difficulty: `60bd1dc`; prior input/gem: `c2f6588` (cleared input on contextmenu — **superseded**)
- Secondary pointer is **input-neutral** (preventDefault only on Canvas)
- Win/loss/restart and M5+ **not started**

## What changed

- Removed `clearInput` from right-click handling
- Canvas secondary events prevent default only; keyboard state untouched
- Pointer capture for secondary drag where supported
- Left-click upgrade path unchanged; no global document contextmenu ban
- Gem uncapped drops remain

## Residual risk

- Edge/Chromium chrome-level mouse gestures or extensions may still navigate in some environments; page-level protection is implemented but not absolute.

## Audit Repair

- First independent audit of `098841f`: FAIL
- Findings: no `lostpointercapture`, stale/single pointerId tracking, click filter
  excluded right-click but did not positively require primary button
- Local repair tracks multiple captured IDs, clears on lost/up/cancel, retains no
  ID when capture fails, and requires `button === 0` for upgrade clicks
- Local verification: 7 files / 179 tests; tsc / build / audit / diff check PASS
- Fresh independent lifecycle re-audit: PASS; repair checkpoint pending

## Next Task

Create the lifecycle repair checkpoint, then run user browser recheck of
secondary pointer + held-key movement. **No win/loss/restart.**
