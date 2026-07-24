# Handoff

## Current Truth

- Root: `D:\agent\workspace\vampire_survivors`
- M3 + ARCH Green (`00166ee`)
- CP-M4-WORLD-01 checkpoint: `ba20893` (`M4: implement full-screen large world demo`)
- Dynamic difficulty / win-loss / M5+ **not started**
- Audit found distant side-band spawning; local repair constrains spawning to
  bounded bands around the current view
- Fresh independent repair audit: **PASS**
- Repair checkpoint: `008514e` (`M4: repair world-edge enemy spawning`)
- User-reported browser WORLD acceptance: **PASS**
- CP-M4-WORLD-01: **Green**

## Modules

- `src/world/world.ts` bounds
- `src/world/viewport.ts` CSS size + DPR
- `src/world/camera.ts` follow/clamp
- `src/world/coordinates.ts` world/screen
- `src/world/frame-context.ts` pure frame data for sim
- Enemy spawn outside view in bounded edge bands in `combat/enemy-system.ts`
- `main.ts` full-screen + resize; draw via camera

## Verified

- Original checkpoint: npm test 136; tsc; build; audit 0
- Independent repair audit: npm test 138; tsc; build; audit 0; diff check passed
- User-reported complete WORLD browser checklist: PASS; browser/version not supplied

## Next Task

User and architect define the next checkpoint. **Do not begin difficulty,
win-loss, or new content without an approved checkpoint.**
