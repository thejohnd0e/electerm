# Instructions for coding agents

This is the shared instruction file for Codex, Claude Code, and OpenCode.

## Before substantial work

Read `AGENTS.md`, `STATUS.md`, `DECISIONS.md`, and `TODO.md` before starting substantial work. Check the current working tree before editing and preserve unrelated user changes.

## Project conventions

- electerm is a cross-platform terminal and remote-connection client. See `README.md` for product, setup, usage, build, and testing information.
- Follow the existing patterns in the relevant `src/` area; avoid unrelated refactors.
- Use the npm scripts in `package.json` rather than inventing commands. `npm run lint` runs Standard; `npm run fix` applies its fixes.
- Tests are separated into `src/test/e2e`, `src/test/integration`, `src/test/unit`, and `src/test/unit-ci`. Pick checks appropriate to the change; see `package.json` for exact scripts.
- Do not commit secrets or local environment files. `.env` and `.env.test` are ignored.
- Keep changes focused, and update `STATUS.md`, `DECISIONS.md`, or `TODO.md` when substantial work changes project status, establishes a durable decision, or identifies confirmed follow-up work.

## After substantial work

Run the relevant verification commands and report what was run and any limitations. Keep project tracking documents current when relevant.
