# Pending tasks

- Watch https://github.com/electerm/electerm/issues/4591 for the maintainer's decision on subscription sign-in (PR #4589 is closed).
- If the idea is accepted, send small single-purpose PRs in the order proposed in #4591 (ConPTY packaging, `providerAI` routing, ChatGPT, optionally SuperGrok, labels), rebased onto `upstream/master` with `build/` now at `src/build/`.
- ConPTY packaging: the suspected bug (packaged builds without the `afterPack` hook may lack `conpty.dll`/`OpenConsole.exe` in `node-pty/build/Release/conpty`, which `useConptyDll: true` needs) is NOT reproduced. To verify, build an installer or `win-unpacked` without the hook and test a local terminal. File the separate issue promised in #4591 only if it fails; otherwise correct that sentence in #4591.
- Optionally record the per-item results of the smoke matrix in `docs/superpowers/plans/2026-10-10-ai-subscriptions-windows.md` (the owner reports the feature works in the fork).
- Decide whether to ignore `.omo/` in `.gitignore` and when to push the local `master` commits to the fork.
- Decide whether the HTTP cache reset (`clear-stale-cache.js`) should go upstream as its own PR.
