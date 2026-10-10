# AI Subscription Support for Windows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Enable electerm's existing AI features to use eligible ChatGPT and SuperGrok subscription allowances on Windows desktop.

**Architecture:** OAuth and subscription sessions are owned by Electron's main process. The existing `AIchat`, `AIchatWithTools`, and `AIlistModels` entry points route subscription requests through provider-specific Responses API handling, while continuing to support the existing API-key configuration. The LingvoLoc implementations are adapted to electerm's JavaScript, IPC, configuration, chat-history, and agent-tool patterns.

**Tech Stack:** Electron, Node.js, Axios, `crypto`, existing `jsonwebtoken`, React/Ant Design, Electron `safeStorage`, Node's built-in test runner and existing Playwright E2E setup.

**Spec:** Approved design and scope recorded in the conversation: Windows desktop only; ChatGPT and SuperGrok subscriptions; Claude subscriptions excluded.

## Global Constraints

- Subscription sign-in is available only in Windows desktop builds; API-key providers and existing platforms keep current behavior.
- Subscription secrets never cross IPC into the renderer, enter AI config/history/sync data, or appear in logs/errors.
- Do not store OAuth tokens in plaintext. If OS-backed encryption is unavailable, fail closed instead of saving plaintext.
- Use fixed provider endpoints for subscription requests; never send subscription credentials to user-configured API URLs.
- ChatGPT plan usage requires the `chatgpt.tokens.use.direct` grant and Responses API requests with `stream: true` and `store: false`.
- Responses are successful only after `response.completed`; failed, incomplete, malformed, or prematurely closed streams are errors.
- Do not silently fall back to API-key billing or another provider when a subscription request fails.
- Treat SuperGrok provider authorization denial as a final, actionable error.
- Preserve API mode, old configuration, existing chat history, and existing IPC call compatibility.
- Automated auth and HTTP tests use mock servers and synthetic credentials only; never use live subscription accounts or tokens in automated tests.
- Keep the existing AI flows and platform behavior unchanged unless needed for subscription routing.

---

## File Structure

### New files

- `src/app/lib/ai-subscription-storage.js` — encrypted, atomic local storage for account records and stable ChatGPT host ID; in-memory access-token cache remains in auth modules.
- `src/app/lib/ai-subscription-oauth.js` — shared HTTP/OIDC discovery, form-encoded token calls, PKCE helpers, JWKS signature validation helpers, and safe OAuth errors.
- `src/app/lib/ai-chatgpt-auth.js` — ChatGPT OAuth lifecycle, loopback callback, issued client IDs, permission checks, refresh, cancellation, and sign-out.
- `src/app/lib/ai-supergrok-auth.js` — SuperGrok device-code flow, polling, refresh, cancellation, and sign-out.
- `src/app/lib/ai-subscriptions.js` — main-process provider/session selection, token access, status, model discovery, and request dispatch.
- `src/app/lib/ai-subscription-provider.js` — build provider Responses requests, consume SSE, and normalize text/tool calls/errors/usage.
- `src/client/components/ai/ai-subscription-account.jsx` — account status, provider-specific sign-in controls, cancellation, and sign-out.
- `src/client/components/ai/ai-request.js` — shared renderer-side invocation helper that passes provider selection to IPC.
- `src/test/unit-ci/ai-subscription-storage.spec.js` — encrypted storage tests with injectable OS storage and filesystem.
- `src/test/unit-ci/ai-subscription-chatgpt-auth.spec.js` — ChatGPT OAuth tests with local protocol fixtures and injectable browser/listener/storage dependencies.
- `src/test/unit-ci/ai-subscription-supergrok-auth.spec.js` — SuperGrok device-flow tests with local protocol fixtures and injectable dependencies.
- `src/test/unit-ci/ai-subscription-http.spec.js` — provider request, model list, SSE, usage, tool-call, error and cancellation tests.

### Existing files to modify

- `src/app/common/default-setting.js` — default `providerAI: 'api'`.
- `src/client/components/ai/ai-config-props.js` — include provider field and optional-field semantics.
- `src/client/store/common.js` — provider-specific required-configuration rules and persist provider choice in chat-entry snapshots.
- `src/app/lib/ai.js` — route provider-aware calls; support completed non-stream results as well as pollable chat streams.
- `src/app/lib/ai-format.js` — strengthen Responses SSE completion/error/usage handling and normalize tool-call events.
- `src/app/lib/ipc.js` — expose allowlisted status/sign-in/cancel/sign-out/model commands to renderer.
- `src/client/components/ai/ai-config.jsx` and `ai-config.styl` — provider controls, models, status and subscription guidance.
- `src/client/components/ai/ai-chat.jsx` and `ai-chat-history-item.jsx` — capture and use provider with each chat entry.
- `src/client/components/ai/ai-compress.js` — use the selected entry's provider for manual/automatic compression.
- `src/client/components/ai/agent.js` — forward subscription provider through every tool-loop request.
- `src/client/components/terminal/terminal-command-dropdown.jsx` — forward provider for command suggestions.
- `src/client/components/bookmark-form/ai-bookmark-form.jsx` — forward provider for bookmark generation.
- `src/client/components/quick-commands/quick-command-ai-editor.jsx` — forward provider for quick-command generation.
- `src/client/components/theme/theme-ai-editor.jsx` — forward provider for theme generation.
- `src/test/unit-ci/ai-format.spec.js` and `ai-http.spec.js` — lock existing API behavior and test additive subscription behavior.
- `src/test/e2e/005.ai-config.spec.js` — verify existing API setup plus subscription settings visibility/flows where supported by test stubs.
- `README.md` — describe the two subscription options and Windows-only scope.
- `STATUS.md`, `DECISIONS.md`, `TODO.md` — update after implementation only for confirmed status, decisions, or follow-up.

## Interfaces

Renderer config stores only a provider selector and non-secret options:

```js
providerAI: 'api' // 'api' | 'chatgpt' | 'supergrok'
```

Subscription-specific provider invocation is additive; existing call sites retain their current positional arguments:

```js
AIchat(
  prompt, model, role, baseURL, path, apiKey, proxy,
  stream, authHeaderName, messages, format,
  options = { providerAI: 'api' }
)

AIchatWithTools(
  messages, model, baseURL, path, apiKey, proxy,
  tools, authHeaderName, format, requestId,
  options = { providerAI: 'api' }
)
```

Public main-process operations expose status and lifecycle results, never tokens:

```js
getAISubscriptionStatus(providerAI) // { supported, configured, hint, planUsageEnabled? }
signInChatGPT() // starts browser OAuth; returns safe status
cancelChatGPTSignIn()
finishSuperGrokSignIn() // resolves to safe status after polling
cancelSuperGrokSignIn()
AIlistSubscriptionModels(providerAI, proxy) // { models } or { error }
```

Backend responses retain existing electerm structures:

- Non-stream caller: `{ response, isStream: false, usage }`.
- Pollable text caller: `{ sessionId, isStream: true, hasMore: true, content: '' }` followed by `getStreamContent` results.
- Agent caller: `{ message, usage }`, where `message` uses electerm's existing OpenAI chat shape with `tool_calls` when applicable.
- Errors: `{ error }`; redact authorization data and do not include user prompt/source text.

The backend must construct these provider requests:

- ChatGPT: `POST https://api.openai.com/v1/responses`; bearer access token; `stream: true`; `store: false`; input includes all request context; developer role/instructions rather than system role items; no unsupported Responses fields.
- SuperGrok: `POST https://api.x.ai/v1/responses`; bearer access token; streamed Responses events; `store: false`; provider-specific supported model/tool shape.

---

## Task 1: Add Provider Configuration and Preserve Existing Behavior

**Files:**

- Modify: `src/app/common/default-setting.js`
- Modify: `src/client/components/ai/ai-config-props.js`
- Modify: `src/client/store/common.js`
- Test: `src/test/unit-ci/ai-format.spec.js` or a focused provider-config spec in `src/test/unit-ci/`

**Interfaces:**

- Introduce `providerAI` defaulting to `api`.
- Add a helper that determines required AI settings for API versus subscription mode.
- Keep config/history values free of OAuth tokens.

- [ ] Add tests for a pre-feature config with no `providerAI`; expect API mode and existing required API URL behavior.
- [ ] Add tests for ChatGPT and SuperGrok config completeness; expect no API URL, API key, path, or auth header requirement, while model/role/language remain required.
- [ ] Add a test proving subscription mode never considers config complete without a selected model.
- [ ] Implement the default and validation helper with compatibility-preserving behavior.
- [ ] Run `npm run test-unit-ci`; expect all pre-existing tests and the new tests to pass.

## Task 2: Implement Windows-Encrypted Subscription Session Storage

**Files:**

- Create: `src/app/lib/ai-subscription-storage.js`
- Create: `src/test/unit-ci/ai-subscription-storage.spec.js`
- Use: `src/app/common/app-props.js`, `src/app/lib/safe-storage.js`

**Interfaces:**

```js
createSubscriptionStorage({ appPath, dataPath, userName, safeStorage, fs })
// get(provider), set(provider, record), delete(provider), getOrCreateHostId()
```

The default instance resolves to `<data-root>/users/<defaultUserName>/ai-subscriptions/`. Each provider file contains encrypted JSON. The host ID is stable across ChatGPT sign-outs.

- [ ] Write tests proving saved records are ciphertext on disk and round-trip only through OS decrypt.
- [ ] Write tests proving encryption unavailable/throws causes a clear error and never writes plaintext.
- [ ] Write tests for atomic replacement, missing/corrupt records, delete, host ID stability, and distinct provider files.
- [ ] Implement injectable storage and filesystem boundaries; production uses Windows Electron `safeStorage` and `fs` atomic temp-file replacement.
- [ ] Ensure portable installs and `DATA_PATH` resolve to the same app-data root patterns already used by electerm.
- [ ] Run `node --test src/test/unit-ci/ai-subscription-storage.spec.js`; expect PASS.

## Task 3: Add Shared OAuth Utilities and ChatGPT Sign-In

**Files:**

- Create: `src/app/lib/ai-subscription-oauth.js`
- Create: `src/app/lib/ai-chatgpt-auth.js`
- Create: `src/test/unit-ci/ai-subscription-chatgpt-auth.spec.js`
- Modify: `package.json` only if an already-present dependency cannot validate JWT signatures/JWKS; prefer existing `jsonwebtoken` plus a minimal JWKS key resolver.

**Interfaces:**

```js
createChatGPTAuth({ storage, http, openExternal, listenerFactory, clock, random })
  .signIn()
  .cancelSignIn()
  .status()
  .getAccessToken()
  .signOut()
```

Use `auth.openai.com` OIDC discovery, `127.0.0.1` loopback callback at `/auth/callback`, dynamic first client registration and saved issued client ID on future authorization.

- [ ] Add tests for PKCE S256, state, nonce and exact loopback callback matching.
- [ ] Add tests proving the first OAuth authorization uses `dynamic_agent_client`, `agent_name_hint=electerm`, stable `ext_agent_host_id`, and scopes `openid profile email offline_access resource.invoke chatgpt.tokens.use.direct`.
- [ ] Add tests proving a later sign-in reuses the issued client ID and rejects an unexpected callback client ID.
- [ ] Add tests for callback OAuth errors, invalid state, missing code, unavailable port, browser-open failure, timeout, and cancellation.
- [ ] Add synthetic-ID-token tests for valid signature/JWKS, wrong issuer/audience/nonce, expiry, and wrong account on reauthorization.
- [ ] Add tests for absent `chatgpt.tokens.use.direct`: identity may be displayed as connected but inference permission is false.
- [ ] Add tests for token refresh serialization, rotating refresh-token persistence, `invalid_grant` recovery, and sign-out revocation best effort.
- [ ] Implement the auth flow, use a stable host ID, validate signatures using trusted OpenAI JWKS, and never trust display claims before validation.
- [ ] Run `node --test src/test/unit-ci/ai-subscription-chatgpt-auth.spec.js`; expect PASS without network access.

## Task 4: Add SuperGrok Device Authorization

**Files:**

- Create: `src/app/lib/ai-supergrok-auth.js`
- Create: `src/test/unit-ci/ai-subscription-supergrok-auth.spec.js`
- Reuse: `src/app/lib/ai-subscription-oauth.js`, `src/app/lib/ai-subscription-storage.js`

**Interfaces:**

```js
createSuperGrokAuth({ storage, http, openExternal, clock, sleep })
  .beginSignIn() // safe device-code data
  .finishSignIn(attemptId)
  .cancelSignIn(attemptId)
  .status()
  .getAccessToken()
  .signOut()
```

Discover xAI device/token/revocation endpoints; use the LingvoLoc SuperGrok client ID and requested scopes. Never send an access token to the renderer.

- [ ] Add tests for device authorization request and safe response shape (`verificationUrl`, `userCode`, `expiresIn` only).
- [ ] Add polling tests for `authorization_pending`, `slow_down`, success, `access_denied`, `expired_token`, timeout and cancellation.
- [ ] Add tests for refresh serialization/rotation and best-effort revocation on sign-out.
- [ ] Add a race test proving a cancelled/old attempt cannot save credentials after sign-out or after a newer attempt starts.
- [ ] Implement the flow with an attempt identifier per sign-in, minimum provider polling interval, and bounded user-visible errors.
- [ ] Run `node --test src/test/unit-ci/ai-subscription-supergrok-auth.spec.js`; expect PASS without network access.

## Task 5: Add Main-Process Provider Requests and SSE Normalization

**Files:**

- Create: `src/app/lib/ai-subscriptions.js`
- Create: `src/app/lib/ai-subscription-provider.js`
- Create: `src/test/unit-ci/ai-subscription-http.spec.js`
- Modify: `src/app/lib/ai.js`
- Modify: `src/app/lib/ai-format.js`
- Test: `src/test/unit-ci/ai-http.spec.js`, `src/test/unit-ci/ai-format.spec.js`

**Interfaces:**

- `getAccessToken(providerAI, proxy)` obtains/refreshed credentials internally.
- `chat({ providerAI, messages, model, tools, proxy, stream, requestId })` dispatches to a fixed provider base URL and normalizes the result.
- `listModels({ providerAI, proxy })` returns provider-supported models.
- Existing `AIchat` and `AIchatWithTools` signatures accept an optional final provider options argument; all old positional calls retain API behavior.

- [ ] Add mock-server tests for ChatGPT and SuperGrok fixed paths, bearer auth, streamed requests, `store: false`, model and message mapping.
- [ ] Add request-body tests proving no caller-supplied base URL, API key, unsupported Responses options, or ChatGPT `system` role can leak into subscription requests.
- [ ] Add parser tests for text deltas, response function calls, completed usage, failed/incomplete responses, malformed events, and truncated streams.
- [ ] Add tests for subscription models: ChatGPT filters visibility `list` and returns slugs/display labels; SuperGrok normalizes its documented model response.
- [ ] Add tests verifying text-only non-stream callers receive accumulated text, pollable chats receive session updates, and agent requests receive OpenAI-shaped tool calls.
- [ ] Add cancellation tests that abort the exact socket for the matching request ID and do not report user cancellation as a provider failure.
- [ ] Implement native Responses stream consumption and reject end-of-stream before `response.completed`.
- [ ] Add provider-aware error formatting for ChatGPT codes `subscription_sharing_user_not_eligible`, `subscription_sharing_usage_limit_exceeded`, `subscription_sharing_usage_unavailable`, `subscription_sharing_unsupported_capability`, and `subscription_sharing_route_not_supported`; do not retry/fallback automatically.
- [ ] Run `node --test src/test/unit-ci/ai-subscription-http.spec.js src/test/unit-ci/ai-format.spec.js src/test/unit-ci/ai-http.spec.js`; expect new and regression tests to pass.

## Task 6: Connect Subscription Operations Through IPC

**Files:**

- Modify: `src/app/lib/ipc.js`
- Modify: `src/app/lib/ai-subscriptions.js`
- Create or extend: `src/test/unit-ci/ai-subscription-ipc.spec.js`

**Interfaces:**

Expose only these renderer-facing operations:

```js
getAISubscriptionStatus(providerAI)
signInChatGPT()
cancelChatGPTSignIn()
beginSuperGrokSignIn()
finishSuperGrokSignIn(attemptId)
cancelSuperGrokSignIn(attemptId)
signOutAISubscription(providerAI)
AIlistSubscriptionModels(providerAI, proxy)
```

Status may contain `supported`, `configured`, `hint`, and `planUsageEnabled`, but no token, refresh token, OAuth client secret, or raw session.

- [ ] Add tests proving non-Windows or web runtime returns `supported: false` and performs no subscription auth request.
- [ ] Add tests for safe status, model-list output, cancellation and sign-out IPC operation.
- [ ] Add serialization assertions proving returned IPC objects never include access/refresh token values.
- [ ] Register main-process functions in the existing `window.pre.runGlobalAsync` allowlist, preserving all existing exposed names.
- [ ] Run `node --test src/test/unit-ci/ai-subscription-ipc.spec.js`; expect PASS.

## Task 7: Add Subscription Settings UI

**Files:**

- Create: `src/client/components/ai/ai-subscription-account.jsx`
- Modify: `src/client/components/ai/ai-config.jsx`
- Modify: `src/client/components/ai/ai-config.styl`
- Test: `src/test/e2e/005.ai-config.spec.js`

**Interfaces:**

- `AIConfigForm` receives `providerAI` with the existing AI config and persists it using current form submission.
- `AISubscriptionAccount` receives a provider ID and proxy value; it uses only the allowlisted IPC operations and displays safe status.

- [ ] Add UI-level assertions for API/ChatGPT/SuperGrok selection and API-only fields hidden in subscription mode.
- [ ] Add UI-level assertions for model refresh, model choice and normal save/validation.
- [ ] Add mocked IPC tests for ChatGPT connected/no-plan-permission status, browser sign-in/cancel/sign-out, and ChatGPT usage link.
- [ ] Add mocked IPC tests for SuperGrok device code, pending state, cancellation and sign-out.
- [ ] Add assertions that account records and token values are not displayed or inserted into form values.
- [ ] Implement controls; disable subscription selection when backend says unsupported; show API as unaffected default.
- [ ] Use approved OpenAI button label “Continue with ChatGPT”.
- [ ] Run `npm run test-unit-ci` and the focused AI-config E2E test when app build and browser dependencies are available.

## Task 8: Route Every AI Feature and Preserve Provider in Chat History

**Files:**

- Create: `src/client/components/ai/ai-request.js`
- Modify: `src/client/components/ai/ai-chat.jsx`
- Modify: `src/client/components/ai/ai-chat-history-item.jsx`
- Modify: `src/client/components/ai/ai-compress.js`
- Modify: `src/client/components/ai/agent.js`
- Modify: `src/client/store/common.js`
- Modify: `src/client/components/terminal/terminal-command-dropdown.jsx`
- Modify: `src/client/components/bookmark-form/ai-bookmark-form.jsx`
- Modify: `src/client/components/quick-commands/quick-command-ai-editor.jsx`
- Modify: `src/client/components/theme/theme-ai-editor.jsx`
- Test: `src/test/unit-ci/ai-http.spec.js` and relevant AI E2E tests

**Interfaces:**

- `ai-request.js` accepts `{ providerAI, ...existingAIConfig }` and appends provider options to backend IPC calls.
- Each chat entry snapshots `providerAI` alongside model and role; it never snapshots OAuth credentials.
- `agent.js` includes provider selection on every tool iteration; `ai-compress.js` uses the originating chat's provider.

- [ ] Add regression tests showing API requests retain existing argument behavior when options are absent.
- [ ] Add tests for a chat history entry retaining `providerAI` and resuming through that provider after global settings change.
- [ ] Add tests proving compression uses the original entry's provider, not the current global provider.
- [ ] Add tests proving agent loop tool calls and tool results continue under subscription provider selection.
- [ ] Route command suggestions, bookmark, quick-command, and theme generation through the common helper.
- [ ] Verify no additional AI IPC caller remains that omits provider selection; retain default API behavior for configs created before migration.
- [ ] Run `npm run test-unit-ci` and the relevant focused E2E tests.

## Task 9: Documentation and Windows Verification

**Files:**

- Modify: `README.md`
- Modify: `STATUS.md`
- Modify: `DECISIONS.md`
- Modify: `TODO.md`
- Verify: project npm scripts and Windows packaged app.

- [ ] Document ChatGPT and SuperGrok subscription setup, Windows-only availability, account usage links, local encrypted session storage, limitations, and API-mode coexistence.
- [ ] Document that ChatGPT subscription usage is separate from API keys, requires explicit OAuth grant, uses Responses API constraints, and shares provider policies.
- [ ] Run `npm run lint`; expect Standard lint to pass.
- [ ] Run `npm run test-unit-ci`; expect unit-CI suite to pass, including AI API regression tests.
- [ ] Run `npm run build`; expect renderer and main-process build to pass.
- [ ] Build the Windows application with the project-supported build command; verify subscription selection is hidden/disabled when unsupported.
- [ ] With test accounts, verify ChatGPT OAuth, permission-denied handling, model listing, text response, tool call, cancellation and limit handling.
- [ ] With an eligible SuperGrok account, verify device-code OAuth, model listing, text/tool behavior if supported by provider, cancellation and denied-account messaging.
- [ ] Verify restart persistence, sign-out, corrupted credential file handling, and no secrets in renderer/local config/history/sync/logs.
- [ ] Verify every legacy API-key AI path still works and no subscription failure silently falls back to another billing route.
- [ ] Update project status/decisions only with verified implementation outcomes; record only confirmed follow-up work in TODO.

## Manual Windows Smoke Matrix

| Scenario | Expected result |
|---|---|
| Existing API config | Works unchanged; existing AI tests remain green |
| Old saved config/history | Defaults to `providerAI: 'api'`; no forced subscription setup |
| ChatGPT first sign-in | Browser consent completes, issued client ID and encrypted session persist |
| ChatGPT denied plan scope | Account state explains permission is missing; inference is blocked |
| ChatGPT restart | Session refreshes without exposing tokens to renderer |
| ChatGPT model list | Only visible account models offered; selection uses model slug |
| ChatGPT ask mode | Text streams and completes only after `response.completed` |
| ChatGPT agent mode | Local tools are invoked from normalized function-call events |
| ChatGPT usage limit | Clear usage-limit error and management link; no automatic retry/fallback |
| SuperGrok device flow | Code is shown, browser opens, approval persists encrypted session |
| SuperGrok denied account | User receives an explicit provider denial; no infinite retry |
| Sign-out/cancel | Credentials cleared or pending attempt stopped; late results cannot recreate session |
| Chat history resume | Each session continues with its original provider, or clearly asks for reconnection |
| Context compression | Summary uses the same provider as the conversation |
| All other AI entry points | Suggestions, bookmark/theme/quick-command generation use selected provider |
| Non-Windows/web | Subscription mode unavailable; API mode remains available |
| Portable/data override | Data path follows electerm conventions; DPAPI-bound credential requires reauthentication under another Windows identity |
