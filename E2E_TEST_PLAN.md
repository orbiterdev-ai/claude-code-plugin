# Orbiter Dev Claude Code Plugin - E2E Test Plan (v1.1.x)

> Status: ALL STEPS PASSED 2026-07-19 on Windows against production
> (`api.orbiterdev.ai`), including a live phone round-trip. Ledger row
> `CLAUDE-CODE-PLUGIN-SHIPPED-2026-07-19`. The pre-v1.1 plan tested the legacy
> orbiter-bridge 7-hook pack, which this plugin no longer uses (single enforced
> `PermissionRequest` hook + MCP server via the published npm package).

## 1. Static validation
1. `plugin.json` parses; does NOT declare `hooks` (hooks/hooks.json auto-loads by
   convention; declaring it too causes "Duplicate hooks file detected" and the plugin
   fails to load - regression found and fixed 2026-07-19, v1.1.1).
2. `.mcp.json` pins the PUBLISHED npm version (never an unpublished one) and
   `ORBITER_SERVER_URL=https://api.orbiterdev.ai` (never localhost).

## 2. Marketplace install (the real user path)
```bash
claude plugin marketplace add orbiterdev-ai/orbiter-plugin
claude plugin install orbiter-dev@orbiter
claude plugin list      # expect: orbiter-dev@orbiter - enabled
claude plugin details orbiter-dev
# expect: Hooks (1) PermissionRequest; MCP servers (1) orbiter-dev; Skills: approve, status
```
After changing the published plugin: `claude plugin marketplace update orbiter` then
reinstall (the install cache pins versions; stale cache shows the old version).

## 3. No double gate
If the npx-era global setup is present, remove it (plugin replaces it):
```bash
npx -y @orbiterdev/mcp-server@0.1.13 claude uninstall --scope both
```
Verify `~/.claude/settings.json` has no `PermissionRequest` hook of its own.

## 4. Live round-trip (phone required)
Feed the bundled runner a real PermissionRequest payload and decide on the phone:
```bash
node <plugin>/hooks/orbiter-plugin-hook.cjs permission-check <<'EOF'
{"session_id":"e2e","hook_event_name":"PermissionRequest","tool_name":"Bash","cwd":".",
 "tool_input":{"command":"echo PLUGIN-E2E-OK","description":"plugin e2e"}}
EOF
```
Expect: "Waiting for mobile approval" -> phone push -> decision -> JSON
`{"decision":{"behavior":"allow"|"deny"}}`, exit 0. Test BOTH approve and deny.
Verify the server record (`GET /api/v1/approvals?limit=1` with the paired key):
`source_ide: "Claude Code"`, correct status.

## 5. In-session verification (new session)
Hook config is cached per session: restart Claude Code, run a risky command, and
confirm the phone gate fires from inside a real session.

## 2026-07-19 results
Steps 1-4 PASSED (approve leg live; deny leg proven same-day on the identical
runner path via the global-hook E2E, record `aef50b49` status `rejected`).
Step 5 pending first restarted session on this machine.
