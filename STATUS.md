# Project status

## Completed

- Added Windows-only ChatGPT subscription sign-in and SuperGrok subscription sign-in, encrypted token storage, provider routing, account controls, and provider-aware chat history/labels. API-key providers remain available.
- Added Windows packaging support for `conpty.dll` and `OpenConsole.exe` through the electron-builder after-pack hook.
- Added focused unit coverage for subscription auth, storage, IPC, provider routing, labels, request formatting, and ConPTY packaging, plus AI settings E2E coverage.
- Changes are committed on `master` in 32 local commits; the branch is 32 commits ahead of `origin/master`.

## What currently works

- Focused AI/subscription and Windows packaging unit tests passed in the latest implementation verification.
- `npm run lint` and `npm run build` passed.
- The generated Windows x64 installer at `dist/electerm-5.5.79-win-x64-installer.exe` contains the ConPTY runtime files. It is unsigned; installer launch and in-app subscription behavior have not been verified manually.

## In progress

- Manual Windows smoke testing of the packaged installer and the ChatGPT/SuperGrok subscription flows remains outstanding.

## Known issues and blockers

- `npm run prepare-file` currently encounters an npm peer-dependency `ERESOLVE`; direct electron-builder packaging succeeded as a workaround.
- Three untracked `.omo/run-continuation/*.json` files are local session metadata and were intentionally not committed. Do not treat them as project source.
- The Windows installer is unsigned, and live provider sign-in, streaming/tool use, persistence, sign-out, and local terminal startup have not been confirmed in an installed app.

- Fixed the AI panel title showing the old API brand ("Deepseek") after selecting ChatGPT: the source was already correct, but same-version rebuilds were served from Chromium's 1-year cache. Verified on the unpacked build via DevTools (title now "ChatGPT"). The installer was rebuilt at 19:55 with the fix; it has not been installed and run manually.

## Exact next step

- Run the manual Windows smoke matrix in `docs/superpowers/plans/2026-10-10-ai-subscriptions-windows.md` against the generated installer; record results and blockers before release.

## Important files to inspect

- `docs/superpowers/plans/2026-10-10-ai-subscriptions-windows.md` — manual verification matrix and implementation plan.
- `src/app/lib/ai-chatgpt-auth.js`, `src/app/lib/ai-supergrok-auth.js`, `src/app/lib/ai-subscription-storage.js`, `src/app/lib/ai-subscription-ipc.js`, `src/app/lib/ai-subscription-provider.js` — auth, encrypted persistence, IPC, and transport.
- `src/client/components/ai/ai-config.jsx`, `src/client/components/ai/ai-subscription-account.jsx`, and `src/client/components/ai/ai-chat.jsx` — subscription controls and chat integration.
- `build/bin/after-pack.js` and `build/electron-builder.json` — Windows ConPTY packaging.
