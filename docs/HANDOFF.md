# Handoff

## Current Truth

- Root: `D:\agent\workspace\vampire_survivors`
- M3 + ARCH Green (`00166ee`)
- CP-M4-WORLD-01 implemented (hash after commit)
- Dynamic difficulty / win-loss / M5+ **not started**
- Independent WORLD audit **pending**
- Browser WORLD interactive **UNVERIFIED**

## Modules

- `src/world/world.ts` bounds
- `src/world/viewport.ts` CSS size + DPR
- `src/world/camera.ts` follow/clamp
- `src/world/coordinates.ts` world/screen
- `src/world/frame-context.ts` pure frame data for sim
- Enemy spawn outside view in `combat/enemy-system.ts`
- `main.ts` full-screen + resize; draw via camera

## Verified

- npm test 136; tsc; build; audit 0

## Next Task

WORLD independent audit + user browser acceptance. **No difficulty / win-loss / new content.**