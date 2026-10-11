# Decisions

- **Use `AGENTS.md` as the shared coding-agent guide.** This gives Codex, Claude Code, and OpenCode one source of repository instructions; `CLAUDE.md` points to it for Claude Code.
- **Keep project tracking in separate root files.** `STATUS.md` describes current state, `DECISIONS.md` records durable rationale, and `TODO.md` holds confirmed pending work, avoiding duplication with the product README.
- **Use npm scripts documented in `package.json`.** The repository includes `package-lock.json` and defines its build, lint, and test commands there.
- **Keep AI subscription selection in non-secret configuration.** Store OAuth tokens only in OS-encrypted main-process storage, use fixed provider endpoints, and retain API-key mode as the default and cross-platform option.
- **Surface SuperGrok authorization denials without billing fallback.** Provider denials are shown as final, actionable errors.
- **Package Windows ConPTY runtime files with the unpacked application.** Use electron-builder's Windows after-pack hook to copy `conpty.dll` and `OpenConsole.exe`, so packaged terminal startup does not depend on build-machine files.
- **Clear Chromium HTTP cache when bundled assets change.** The local asset server sends `max-age=1y` and the page URL only carries the app version, so a rebuild of the same version kept serving the old renderer. `src/app/lib/clear-stale-cache.js` compares an `index.html` mtime stamp (stored in `userData/asset-stamp.txt`) and clears the cache once per change; normal launches keep the long cache.
- **Keep the upstream PR limited to the feature.** PR #4589 is built from `upstream/master` with only product code, tests and one README line. Agent docs, dependency and lockfile changes, the `.gitignore` edit and the cache reset stay on the fork `master`, because upstream asks for one focused change per PR.
