# Project status

## Completed

- Windows-only ChatGPT and SuperGrok subscription sign-in, encrypted token storage, provider routing, account controls, and provider-aware chat history/labels. API-key providers remain available. The "experimental" labeling was removed from the UI and docs on request.
- Windows packaging of `conpty.dll` and `OpenConsole.exe` through the electron-builder after-pack hook.
- Fixed the AI panel title staying on the old API brand ("Deepseek") after selecting ChatGPT. The source was already correct; same-version rebuilds were served from Chromium's 1-year HTTP cache. `src/app/lib/clear-stale-cache.js` now clears that cache once when bundled assets change.
- Unit tests for subscription auth, storage, IPC, routing, labels, request formatting and ConPTY packaging, plus AI settings E2E coverage.
- Upstream PR opened: https://github.com/electerm/electerm/pull/4589 (branch `feat/ai-subscriptions` on the `origin` fork, one commit `1f59cf95`, built from `upstream/master`). It contains only the feature: no agent docs, no dependency or `package-lock.json` changes, and not the cache fix.

## What currently works

- AI and ConPTY unit tests pass (165/165 on the PR branch); lint passes on the whole project.
- Verified on the unpacked build through DevTools: with `providerAI: "chatgpt"` the right-panel title shows "ChatGPT".
- Confirmed manually by the owner on the installed app: ChatGPT and SuperGrok show as connected, provider selection and labels update, the "experimental" wording is gone.
- Latest installer: `dist/electerm-5.5.79-win-x64-installer.exe` (built 2026-10-10 20:21 with `WORKFLOW_NAME=latest npx electron-builder --win nsis --x64 --config build/electron-builder.json --publish never`). ConPTY files are present in `dist/win-unpacked`.

## In progress

- The rest of the manual Windows smoke matrix is not done: streaming/tool use, cancellation, persistence across restarts and sign-out per provider, local terminal startup in the installed app, and API-mode regression.
- PR #4589 is open and currently **conflicting** with `upstream/master`: upstream moved `build/` to `src/build/`, so `build/bin/after-pack.js` must become `src/build/bin/after-pack.js`, and the reference in `src/build/electron-builder.json` and the path in the packaging test must follow. No maintainer feedback yet.

## Known issues and blockers

- Upstream `.github/CONTRIBUTING.md` asks that new features be discussed in an issue first and that one PR solve one issue; the maintainer may ask to split or close #4589.
- SuperGrok sign-in relies on xAI's device authorization behavior, which is not published as a stable API; the PR description mentions this.
- `npm run lint` and the pre-push hook fail under `cmd.exe` (`./node_modules/.bin/...` is not resolved). Run them with `npm_config_script_shell='C:\Program Files\Git\bin\bash.exe'`; do not use `--no-verify`.
- `node --test src/test/unit-ci/*.spec.js` hangs on this machine (unrelated specs); run the AI and ConPTY specs by name instead.
- `npm run prepare-file` fails with an npm peer-dependency `ERESOLVE`. Workaround used: `npm run build`, copy changed `src/app` files into `work/app`, then run electron-builder directly. If `work/app/assets/chunk` accumulates stale chunks from older builds, delete `work/app/assets/chunk` and `work/app/assets/js` before `npm run build`.
- Installer signing status was not verified (the build log shows signtool steps); treat it as unverified.
- `.omo/` is untracked local session metadata; do not commit it.

## Local git state

- `master` is ahead of `origin/master` (the fork) by 35 commits and has not been pushed. It also carries agent docs (`AGENTS.md`, `STATUS.md`, etc.) that are intentionally not part of the upstream PR.
- Remote `upstream` points to `https://github.com/electerm/electerm.git`.

## Exact next step

- Rebase `feat/ai-subscriptions` onto `upstream/master`, move `build/bin/after-pack.js` to `src/build/bin/after-pack.js` (and update the path in `src/build/electron-builder.json` and `src/test/unit-ci/windows-conpty-packaging.spec.js`), re-run the AI/ConPTY specs and lint, then force-push the branch with lease to update PR #4589. Ask the owner before force-pushing.

## Important files to inspect

- `docs/superpowers/plans/2026-10-10-ai-subscriptions-windows.md` — manual verification matrix and implementation plan.
- `src/app/lib/ai-chatgpt-auth.js`, `ai-supergrok-auth.js`, `ai-subscription-storage.js`, `ai-subscription-ipc.js`, `ai-subscription-provider.js`, `ai-subscriptions.js` — auth, encrypted persistence, IPC and transport.
- `src/client/components/ai/ai-config.jsx`, `ai-subscription-account.jsx`, `ai-chat.jsx`, `get-brand.js` — subscription controls, chat integration and labels.
- `src/client/store/store.js` (`rightPanelTitle`) — provider-aware panel title.
- `src/app/lib/clear-stale-cache.js` and `src/app/lib/create-window.js` — HTTP cache reset (master only, not in the PR).
- `build/bin/after-pack.js` and `build/electron-builder.json` — Windows ConPTY packaging (moved to `src/build/` upstream).
