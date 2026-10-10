# Decisions

- **Use `AGENTS.md` as the shared coding-agent guide.** This gives Codex, Claude Code, and OpenCode one source of repository instructions; `CLAUDE.md` points to it for Claude Code.
- **Keep project tracking in separate root files.** `STATUS.md` describes current state, `DECISIONS.md` records durable rationale, and `TODO.md` holds confirmed pending work, avoiding duplication with the product README.
- **Use npm scripts documented in `package.json`.** The repository includes `package-lock.json` and defines its build, lint, and test commands there.
- **Keep AI subscription selection in non-secret configuration.** Store OAuth tokens only in OS-encrypted main-process storage, use fixed provider endpoints, and retain API-key mode as the default and cross-platform option.
- **Treat SuperGrok subscription OAuth as experimental.** xAI's device authorization flow is undocumented and provider denials are surfaced without billing fallback.
