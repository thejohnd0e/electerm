# Project status

## Completed

- Windows-only ChatGPT and SuperGrok subscription sign-in, encrypted token storage, provider routing, account controls, and provider-aware chat history/labels. API-key providers remain available.
- Windows packaging of `conpty.dll` and `OpenConsole.exe` through the electron-builder after-pack hook.
- Fixed the AI panel title staying on the old API brand ("Deepseek") after selecting ChatGPT. The source was already correct; same-version rebuilds were served from Chromium's 1-year HTTP cache. `src/app/lib/clear-stale-cache.js` now clears that cache once when bundled assets change.
- Unit tests for subscription auth, storage, IPC, routing, labels, request formatting and ConPTY packaging, plus AI settings E2E coverage.
- Upstream PR https://github.com/electerm/electerm/pull/4589 was opened and then **closed by the owner** after the maintainer asked for one issue per PR and a design discussion first (branch `feat/ai-subscriptions` on the `origin` fork, one commit `1f59cf95`, built from `upstream/master`). It contains only the feature: no agent docs, no dependency or `package-lock.json` changes, and not the cache fix.

## What currently works

- AI and ConPTY unit tests pass (165/165 on the PR branch); lint passes on the whole project.
- Verified on the unpacked build through DevTools: with `providerAI: "chatgpt"` the right-panel title shows "ChatGPT".
- Confirmed manually by the owner on the installed app: ChatGPT and SuperGrok show as connected, provider selection and labels update.
- Latest installer: `dist/electerm-5.5.79-win-x64-installer.exe` (built 2026-10-10 20:21 with `WORKFLOW_NAME=latest npx electron-builder --win nsis --x64 --config build/electron-builder.json --publish never`). ConPTY files are present in `dist/win-unpacked`.

## In progress

- The owner reports having tested the feature in the fork on Windows and that it works (sign-in, chat, API mode). The per-item results of the smoke matrix in the plan document are not recorded.
- Waiting for the maintainer's reply on the proposal issue https://github.com/electerm/electerm/issues/4591 (design and scope of subscription sign-in). The ConPTY packaging fix is promised there as a separate bug issue and is not filed yet.
- If PRs are sent later, `feat/ai-subscriptions` conflicts with `upstream/master`: upstream moved `build/` to `src/build/`, so `build/bin/after-pack.js` must become `src/build/bin/after-pack.js` and its config reference and test path must follow.

## Known issues and blockers

- Upstream `.github/CONTRIBUTING.md` asks that new features be discussed in an issue first and that one PR solve one issue; the maintainer already asked for this on #4589, which is now closed.
- `npm run lint` and the pre-push hook fail under `cmd.exe` (`./node_modules/.bin/...` is not resolved). Run them with `npm_config_script_shell='C:\Program Files\Git\bin\bash.exe'`; do not use `--no-verify`.
- `node --test src/test/unit-ci/*.spec.js` hangs on this machine (unrelated specs); run the AI and ConPTY specs by name instead.
- `npm run prepare-file` fails with an npm peer-dependency `ERESOLVE`. Workaround used: `npm run build`, copy changed `src/app` files into `work/app`, then run electron-builder directly. If `work/app/assets/chunk` accumulates stale chunks from older builds, delete `work/app/assets/chunk` and `work/app/assets/js` before `npm run build`.
- Installer signing status was not verified (the build log shows signtool steps); treat it as unverified.
- `.omo/` is untracked local session metadata; do not commit it.

## Local git state

- `master` is ahead of `origin/master` (the fork) by 36 commits at the time of this handoff and has not been pushed. It also carries agent docs (`AGENTS.md`, `STATUS.md`, etc.) that are intentionally not part of the upstream PR.
- Remote `upstream` points to `https://github.com/electerm/electerm.git`.

## Exact next step

- Check issue #4591 for the maintainer's answer and follow it. Do not send new PRs before the design is agreed. Meanwhile, file the separate ConPTY packaging bug issue if the owner wants it.

## Important files to inspect

- `docs/superpowers/plans/2026-10-10-ai-subscriptions-windows.md` — manual verification matrix and implementation plan.
- `src/app/lib/ai-chatgpt-auth.js`, `ai-supergrok-auth.js`, `ai-subscription-storage.js`, `ai-subscription-ipc.js`, `ai-subscription-provider.js`, `ai-subscriptions.js` — auth, encrypted persistence, IPC and transport.
- `src/client/components/ai/ai-config.jsx`, `ai-subscription-account.jsx`, `ai-chat.jsx`, `get-brand.js` — subscription controls, chat integration and labels.
- `src/client/store/store.js` (`rightPanelTitle`) — provider-aware panel title.
- `src/app/lib/clear-stale-cache.js` and `src/app/lib/create-window.js` — HTTP cache reset (master only, not in the PR).
- `build/bin/after-pack.js` and `build/electron-builder.json` — Windows ConPTY packaging (moved to `src/build/` upstream).
