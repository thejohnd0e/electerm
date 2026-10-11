# Pending tasks

- Watch https://github.com/electerm/electerm/issues/4591 for the maintainer's decision on subscription sign-in (PR #4589 is closed).
- If the idea is accepted, send small single-purpose PRs in the order proposed in #4591 (ConPTY packaging, `providerAI` routing, ChatGPT, optionally SuperGrok, labels), rebased onto `upstream/master` with `build/` now at `src/build/`.
- File the separate ConPTY packaging bug issue promised in #4591 (not filed yet).
- Optionally record the per-item results of the smoke matrix in `docs/superpowers/plans/2026-10-10-ai-subscriptions-windows.md` (the owner reports the feature works in the fork).
- Decide whether to ignore `.omo/` in `.gitignore` and when to push the local `master` commits to the fork.
- Decide whether the HTTP cache reset (`clear-stale-cache.js`) should go upstream as its own PR.
