# Pending tasks

- Resolve the conflict on upstream PR https://github.com/electerm/electerm/pull/4589: rebase `feat/ai-subscriptions` onto `upstream/master` and move `build/bin/after-pack.js` to `src/build/bin/after-pack.js` (update the config and test paths). Confirm with the owner before force-pushing.
- Respond to maintainer feedback on #4589; be ready to split it (auth/storage, routing, UI, packaging) or open a discussion issue first, as upstream `CONTRIBUTING.md` asks for new features.
- Finish the manual Windows smoke matrix in `docs/superpowers/plans/2026-10-10-ai-subscriptions-windows.md` on the installed app: streaming/tool use, cancellation, persistence across restarts, sign-out, local ConPTY startup, and legacy API mode, for both providers. Record the results.
- Decide whether to ignore `.omo/` in `.gitignore` and when to push the local `master` commits to the fork.
- Decide whether the HTTP cache reset (`clear-stale-cache.js`) should go upstream as its own PR.
