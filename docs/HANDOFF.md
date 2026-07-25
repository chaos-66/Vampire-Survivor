# Handoff

## Current Truth

- Root: `D:\agent\workspace\vampire_survivors`
- HEAD before this repair: `05fdad8`
- Difficulty: `60bd1dc`; prior input/gem: `c2f6588` (cleared input on contextmenu — **superseded**)
- This repair: secondary pointer is **input-neutral** (preventDefault only on Canvas)
- Win/loss/restart and M5+ **not started**

## What changed

- Removed `clearInput` from right-click handling
- Canvas secondary events prevent default only; keyboard state untouched
- Pointer capture for secondary drag where supported
- Left-click upgrade path unchanged; no global document contextmenu ban
- Gem uncapped drops remain

## Residual risk

- Edge/Chromium chrome-level mouse gestures or extensions may still navigate in some environments; page-level protection is implemented but not absolute.

## Next Task

Independent audit + user browser recheck of secondary-pointer + held-key movement. **No win/loss/restart.**