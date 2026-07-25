# Handoff

## Current Truth

- Root: `D:\agent\workspace\vampire_survivors`
- Latest committed HEAD: `e10402e` (`M4: close world demo checkpoint`)
- M3 + ARCH Green (`00166ee`)
- CP-M4-WORLD-01 checkpoint: `ba20893` (`M4: implement full-screen large world demo`)
- CP-M4-DIFFICULTY-01 implemented; automated verification **PASS**
- Win-loss/restart and M5+ **not started**
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
- Difficulty implementation: 7 files / 162 tests; tsc / build / audit / diff check PASS
- First difficulty audit FAIL; repairs freeze profiles, split cross-tier frames,
  reject non-finite dt, and normalize unsafe spawn parameters
- Post-repair: 7 files / 167 tests; tsc / build / audit / diff check PASS
- Second difficulty audit FAIL; latest local repair accepts only frozen registered
  profiles and falls back safely for custom or null values
- Latest local verification: 7 files / 169 tests; tsc / build / audit / diff check PASS
- Final independent difficulty audit: PASS; implementation checkpoint pending

## Next Task

Create the CP-M4-DIFFICULTY-01 implementation checkpoint and request user
browser acceptance. **Do not implement win-loss, restart, enemy stat scaling,
or new content.**
