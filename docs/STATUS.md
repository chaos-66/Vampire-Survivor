# Status

## Snapshot

- Current stage: CP-M4-DIFFICULTY-01 Green; stopped before win/loss/restart
- Secondary-pointer repair: `098841f` (`M4: make secondary pointer input-neutral`)
- Lifecycle repair: `a9f2d6d` (`M4: fix secondary pointer capture lifecycle`)
- Prior input/gem repair: `c2f6588` (contextmenu cleared input — **wrong semantics**, superseded by `098841f`)
- Difficulty checkpoint: `60bd1dc`
- Last updated: 2026-07-25
- M3 Green; CP-M4-ARCH-01 Green; WORLD Green
- Dynamic difficulty: **Implemented; automated verification passed**
- Win/loss/restart: **Not started**
- M5+ content: **Not started**

## Root cause (this repair)

- `c2f6588` suppressed Canvas `contextmenu` by calling `clearInput`, which stopped held WASD/arrows while the physical key remained down.
- Correct behavior: prevent secondary-button defaults on the game Canvas only; **never** read/clear/release keyboard `InputState`.

## Implemented (this repair)

- `preventSecondaryDefault` / `isSecondaryPointerEvent` — no InputState coupling
- Canvas-only: contextmenu, pointerdown/move/up/cancel, auxclick, mousedown/mouseup for button 2
- Optional pointer capture on secondary down; safe release; does not affect left-click upgrades
- CSS: `overscroll-behavior: none` + `user-select: none` on canvas only
- blur/visibilitychange still clear input
- GEM uncapped policy unchanged (no GEM_CAP)

## Verified

- `npm test`: 7 files / **176** tests (pre- and post-commit)
- `npx tsc --noEmit`: exit 0
- `npm run build`: success
- `npm audit`: 0 vulnerabilities
- First independent audit of `098841f`: FAIL; missing `lostpointercapture`, stale
  pointerId/multi-pointer lifecycle, and non-exclusive upgrade click filter
- Local lifecycle repair: tracked pointer ID set, capture-loss cleanup, primary-only
  upgrade clicks; 179 tests / tsc / build / audit / diff check PASS

## Unverified

- Fresh independent audit of the lifecycle repair: PASS; no blocking findings
- User-reported focused browser recheck: PASS
- Accepted residual risk: Edge browser chrome or extensions may still perform
  configured right-drag navigation outside page-script control

## Next Step

User and architect define the win/loss/restart checkpoint. Do not implement it
until its scope and acceptance criteria are approved.
