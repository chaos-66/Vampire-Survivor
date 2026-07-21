# Run Log

Only commands actually executed are recorded here. Pending commands are not represented as successful.

| Time | Command or action | Result | Evidence |
|---|---|---|---|
| 2026-07-21 | Inspect actual and reference paths | Passed | Actual root exists; both reference paths were absent. |
| 2026-07-21 | Inspect root contents | Passed | Only `AI-Workflow-Library/` existed before project initialization. |
| 2026-07-21 | `git status --short --branch` before initialization | Expected failure | Git reported that the directory was not a repository. |
| 2026-07-21 | Read selected Workflow Library planning, execution, checkpoint, recovery, audit, testing, frontend, game, agent, and minimalism files | Passed | Library remained unmodified. |
| 2026-07-21 | `node --version` | Passed | `v22.12.0` |
| 2026-07-21 | `npm --version` | Passed | `10.9.0` |
| 2026-07-21 | `git --version` | Passed | `2.54.0.windows.1` |
| 2026-07-21 | `git init` | Passed | Empty repository initialized at the actual project root. |
| 2026-07-21 | `npm install` | Passed with security findings | Added 54 packages; npm reported 5 vulnerabilities: 3 moderate, 1 high, and 1 critical. |
| 2026-07-21 | First `npm test` | Failed | Vitest collected no tests because importing `src/main.ts` raised `ReferenceError: document is not defined`. |
| 2026-07-21 | First `npm run build` | Passed | TypeScript and Vite completed; 4 modules transformed and `dist/` generated. |
| 2026-07-21 | `npm audit --json` | Failed security audit | Findings originated from the Vitest 2 dependency chain; npm identified Vitest 4.1.10 as the available major-version fix. |
| 2026-07-21 | Second `npm install` after upgrading Vitest | Passed | Added 6, removed 17, and changed 13 packages; audited 44 packages with 0 vulnerabilities. |
| 2026-07-21 | Final `npm test` | Passed | Vitest 4.1.10: 1 test file and 1 test passed. |
| 2026-07-21 | Final `npm run build` | Passed | TypeScript and Vite completed; 5 modules transformed and ignored `dist/` output generated. |
| 2026-07-21 | Final `npm audit` | Passed | `found 0 vulnerabilities` |
| 2026-07-21 | `git status --short --branch` | Passed | Repository is on unborn `main`; only intended untracked project files are visible and the library is ignored. |
| 2026-07-21 | `git diff --check` | Passed | No whitespace errors reported. |
| 2026-07-21 | Independent read-only pre-commit M0 audit | Passed | Auditor reran test, build, and audit; confirmed scope and document consistency. One low finding: the earlier unstaged `git diff --check` was vacuous in an initial repository. |
| 2026-07-21 | Stage intended project files and run `git diff --cached --check` | Passed | 20 intended files staged with no whitespace errors; `AI-Workflow-Library/` remained ignored. |
| 2026-07-21 | `git commit -m "M0: bootstrap project workflow and toolchain"` | Passed | Created root checkpoint commit `574d0ca` with 20 intended project files. |
| 2026-07-21 | M0 status-record commit | Passed | `ba842c4` (`M0: record checkpoint status`). |
| 2026-07-21 | M1 recovery: `git status`, `git log -10`, HEAD | Passed | Branch `main`, clean worktree, HEAD `ba842c4`, M0 checkpoint `574d0ca`; library ignored. |
| 2026-07-21 | M1 pre-impl: read project docs and M0 sources | Passed | M1 not started; Canvas still M0 bootstrap only. |
| 2026-07-21 | M1 `npm test` after implementation | Passed | Vitest 4.1.10: 3 files, 26 tests passed (`main`, `input`, `movement`). |
| 2026-07-21 | M1 `npx tsc --noEmit` | Passed | Exit code 0. |
| 2026-07-21 | M1 `npm run build` | Passed | `tsc && vite build`; 8 modules transformed; `dist/` generated. |
| 2026-07-21 | M1 `npm audit` | Passed | `found 0 vulnerabilities`. |
| 2026-07-21 | M1 `git diff --check` | Passed | No whitespace errors (CRLF normalization warnings only). |
| 2026-07-21 | M1 `npm run dev` + HTTP GET `http://localhost:5173/` | Partial | Vite ready on 5173; HTTP 200; HTML includes `M1: move with WASD or arrow keys` and no old “Gameplay begins in M1” paragraph. **Interactive keyboard/layout/blur play checks UNVERIFIED** (no interactive browser session in this environment). |
| 2026-07-21 | M0 Canvas browser smoke (pre-M1 interactive) | UNVERIFIED | Superseded by M1 page smoke above for static load; full interactive still UNVERIFIED. |
| 2026-07-21 | `git commit -m "M1: implement frame-independent player movement"` | Passed | Checkpoint `563f7ee` (16 files). |
| 2026-07-21 | Post-checkpoint `npm test` | Passed | 3 files, 26 tests passed. |
| 2026-07-21 | Post-checkpoint `npx tsc --noEmit` | Passed | Exit code 0. |
| 2026-07-21 | Post-checkpoint `npm run build` | Passed | 8 modules; `dist/` generated. |

Manual interactive browser acceptance for M1 movement is **not** claimed as passed.
