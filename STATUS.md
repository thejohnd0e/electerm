# Project status

## What works

- The repository contains the electerm application and its build, lint, and test scripts.
- AI settings now support API-key, ChatGPT subscription, and experimental SuperGrok subscription modes; subscription auth and routing have focused automated coverage.
- Updated Windows x64 NSIS installer at `dist/electerm-5.5.79-win-x64-installer.exe` includes provider-aware AI labels and packaged ConPTY runtime files. The installer is unsigned; installed-app and live subscription smoke checks remain unverified.

## In progress

- Install and smoke-test the updated Windows package with ChatGPT and SuperGrok; confirm local terminal startup and provider labels.

## Known issues

- SuperGrok OAuth is experimental and depends on xAI's undocumented device authorization behavior. See the [project known-issues page](https://github.com/electerm/electerm/wiki/Know-issues) for published information.

## Next step

- Complete the manual Windows smoke matrix in `docs/superpowers/plans/2026-10-10-ai-subscriptions-windows.md` before release.
