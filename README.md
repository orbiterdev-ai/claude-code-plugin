# Orbiter Dev - Claude Code Plugin

One-tap human sign-off on **iOS and Android** (Face ID and Android biometrics) when AI agents take real-world action in Claude Code, with tamper-evident audit receipts.

This plugin is the one-command install for Orbiter Dev on Claude Code (CLI and Desktop). It bundles:

- **Zero-Dependency Fail-Closed Lifecycle Hooks (`hooks/hooks.json` + `hooks/orbiter-plugin-hook.cjs`)** - Native `PreToolUse`, `PermissionRequest`, `PostToolUse`, and `Stop` hooks built on pure Node.js (`>=18`) with zero external npm dependencies and 11 enterprise security controls (see [SECURITY.md](SECURITY.md)).
- **Hosted OAuth 2.1 Remote MCP (`.mcp.json`)** - Zero-install Streamable HTTP connection to `https://mcp.orbiterdev.ai/mcp` (`orbiter_auth_status`, `orbiter_request_approval`, `orbiter_await_approval`, `orbiter_list_pending_approvals`, `orbiter_get_approval_status`).
- **Orbiter Approvals Skill (`skills/orbiter-approvals/SKILL.md`)** and slash commands (`/approve`, `/status`).

## Install

### Option A: Claude Code Plugin Marketplace (One Command)

```bash
claude plugin marketplace add orbiterdev-ai/claude-code-plugin
claude plugin install orbiter-dev@orbiter
```

### Option B: Local Plugin Directory (Development / Verification)

```bash
claude --plugin-dir ./claude-code-plugin
```

Then pair with your phone once:

1. Install the Orbiter Dev mobile app on **iOS** ([App Store](https://apps.apple.com/us/app/orbiter-dev/id6761080153)) or **Android** ([Early Access](https://orbiterdev.ai/download)).
2. Pair your session at [orbiterdev.ai/setup](https://orbiterdev.ai/setup) (credentials saved to `~/.orbiter/profiles/claude-code/credentials.json` or set `ORBITER_API_KEY`).
3. Restart Claude Code (or run `/reload-plugins`) so the new hooks take effect.

## Migrating from the Legacy npx Setup

If you previously installed global `npx @orbiterdev/mcp-server claude setup` hooks, remove them to avoid duplicate prompts:

```bash
npx -y @orbiterdev/mcp-server claude uninstall --scope both
```

Your existing `~/.orbiter/profiles/claude-code/credentials` file continues to work automatically. For local stdio MCP fallback instead of Hosted OAuth 2.1 MCP, configure command `npx` with args `["-y", "@orbiterdev/mcp-server"]`.

## How Decisions Work

| Action Class | Example | Behavior |
| :--- | :--- | :--- |
| Verified read-only in-workspace | `Read src/app.ts`, `Glob`, `Grep`, `Bash` with strictly allowlisted read-only flags (`git status`, `git diff`, `ls`, `cat`, `rg "foo" src/`) | Fast-path `allow` (`<5ms`, zero network). Effectful flags (`rg --pre`, `git -c`, `--ext-diff`, `--textconv`, out-of-workspace targets) are never fast-allowed |
| Sensitive credential access | Reading or editing `.env`, `~/.ssh/id_rsa`, `~/.aws/credentials`, `.npmrc`, `.pem` | Pauses and routes to phone (Face ID / Android biometrics) |
| Path traversal / workspace escape | `../../.env`, `/etc/shadow`, out-of-workspace files | Pauses and routes to phone |
| High-risk & critical commands (normalized) | `rm -rf` / `rm -r -f`, `Remove-Item -Recurse -Force`, `git -C dir push --force`, `aws --profile p s3 rm`, `kubectl --context c delete`, `docker --host h rm -f`, `terraform -chdir=d destroy`, `npm --prefix d publish`, `wrangler --env prod deploy`, `curl \| sh`, `DROP TABLE` | Command structure is normalized across wrappers (`env`, `sudo`, full binary paths) and global options; pauses and routes to phone on both `PreToolUse` and `PermissionRequest` |
| Unclassified / unknown effectful commands | Generic workspace scripts or ordinary in-workspace edits (`medium` risk) | **Default profile (`ORBITER_MIN_RISK=high`):** allowed locally on `PreToolUse`, gated on `PermissionRequest`. **Strict profile (`ORBITER_HOOK_PROFILE=strict` or `ORBITER_MIN_RISK=medium`):** pauses and routes every non-allowlisted command and edit to your phone on `PreToolUse` as well |
| Missing creds / timeout / offline / malformed JSON | Unpaired session, unreachable API, `>2 MiB` stdin, null bytes | Deterministic fail-closed `deny` |

## Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `ORBITER_API_KEY` / `ORBITER_TOKEN` | (from `~/.orbiter/profiles/claude-code/credentials.json`) | API key or JWT for mobile approval routing |
| `ORBITER_API_URL` / `ORBITER_SERVER_URL` | `https://api.orbiterdev.ai` | HTTPS backend endpoint (loopback HTTP allowed for local dev only) |
| `ORBITER_APPROVAL_TIMEOUT_SEC` | `300` | Seconds to wait for mobile biometric sign-off before fail-closed deny |
| `ORBITER_HOOK_PROFILE` | `default` | `default` gates high/critical on `PreToolUse` and all non-fastAllow calls on `PermissionRequest`; `strict` gates every non-allowlisted effectful call on `PreToolUse` too |
| `ORBITER_MIN_RISK` | `high` | Minimum risk tier routed to phone on `PreToolUse` (`low`, `medium`, `high`, `critical`) |
| `ORBITER_ZERO_DATA_MODE` | `0` | Set to `1` to withhold raw tool arguments locally |
| `ORBITER_CLAUDE_REPORT_TELEMETRY` | `false` | Opt-in `PostToolUse` / `Stop` audit telemetry |

## Verify Locally

```bash
claude plugin validate .
node --test tests/e2e_claude_plugin.test.js
```

## Pricing

- **Free:** `€0` - 50 mobile approvals per week
- **Pro:** `€19.99/mo` (or `€219.99/yr` annual) - unlimited mobile approvals and audit history

## Orbiter Dev Official Plugin Ecosystem

All four official Orbiter Dev agent plugins share the same zero-dependency fail-closed security engine, Hosted OAuth 2.1 MCP endpoint (`https://mcp.orbiterdev.ai/mcp`), SHA-pinned CI and CodeQL v4 verification, and dual-OS mobile biometric sign-off (iOS Face ID and Android biometrics):

| Platform | Official Plugin Repository |
| :--- | :--- |
| **Claude Code** | [orbiterdev-ai/claude-code-plugin](https://github.com/orbiterdev-ai/claude-code-plugin) |
| **Cursor 3** | [orbiterdev-ai/cursor-plugin](https://github.com/orbiterdev-ai/cursor-plugin) |
| **OpenAI Codex & ChatGPT** | [orbiterdev-ai/codex-plugin](https://github.com/orbiterdev-ai/codex-plugin) |
| **Google Antigravity** | [orbiterdev-ai/antigravity-plugin](https://github.com/orbiterdev-ai/antigravity-plugin) |

Website: https://orbiterdev.ai | Setup: https://orbiterdev.ai/setup | Docs: https://orbiterdev.ai/docs | Security: [SECURITY.md](SECURITY.md) | License: [MIT](LICENSE)

MIT License - Copyright 2026 Orbiter Dev.
