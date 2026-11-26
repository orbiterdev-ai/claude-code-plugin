---
name: orbiter-approvals
description: Request and await one-tap human sign-off on iOS and Android (Face ID and Android biometrics) via Orbiter Dev Hosted MCP and Claude Code fail-closed hooks before AI agents take real-world action.
---

# Orbiter Dev Mobile Approvals for Claude Code

Use this skill when Claude Code plans to run a high-risk, irreversible, external, or credential-sensitive action. Route the action to the operator's phone on iOS (Face ID via APNs) or Android (Android biometrics via FCM) before execution.

## Hosted Remote MCP Connection

This plugin configures the zero-install Orbiter Dev Hosted Remote MCP server:

- **Endpoint:** `https://mcp.orbiterdev.ai/mcp`
- **Transport:** Streamable HTTP (`http`)
- **Authentication:** OAuth 2.1 with PKCE
- **Setup & Mobile Pairing:** `https://orbiterdev.ai/setup`

### Available Remote MCP Tools

1. `orbiter_auth_status` - Verify sign-in status, user profile, and active plan (read-only).
2. `orbiter_request_approval` - Create a pending mobile approval request for the operator's phone. Never auto-approves.
3. `orbiter_await_approval` - Wait up to 60 seconds (default 50s) for the operator's biometric decision on iOS or Android.
4. `orbiter_list_pending_approvals` - List pending owner-scoped approvals.
5. `orbiter_get_approval_status` - Fetch point-in-time status for one `approval_id`.

## Mandatory Workflow for High-Risk Actions

1. Before running destructive shell commands (`rm -rf`, `git push --force`, `terraform destroy`, `kubectl delete`, `curl | sh`), database schema changes (`DROP TABLE`, `DELETE FROM`), production deployments, package publishing, or `.env` / private-key edits:
   - Call `orbiter_request_approval` with a clear `action`, accurate `risk_level`, and redacted `details` (never include raw secrets or API keys).
   - Call `orbiter_await_approval` with the returned `approval_id` and wait for a terminal decision.
2. Only proceed if the decision is explicitly `approved`.
3. If the decision is `rejected`, `denied`, `expired`, `timeout`, or if Orbiter Dev cannot be reached, stop immediately and report the block.

## Deterministic Lifecycle Hooks

This plugin bundles a zero-dependency Node.js (`>=18`) lifecycle hook (`hooks/orbiter-plugin-hook.cjs`) wired to `PreToolUse`, `PermissionRequest`, `PostToolUse`, and `Stop`:

- **Fast-path local allow:** Verified read-only tools and safe read-only shell commands (`git status`, `git diff`, `ls`, `cat`, `rg`) allow locally in milliseconds with zero network calls.
- **Pre-execution mobile gate:** High-risk and critical actions pause, submit a redacted approval request to `ORBITER_API_URL` (`https://api.orbiterdev.ai`), and poll for signed mobile biometric sign-off.
- **Fail-closed safety:** Missing credentials, unsafe API URLs, malformed payloads, offline backend, polling timeout, or explicit mobile rejection always return `deny`.

## Pricing & Account Setup

Install the Orbiter Dev mobile app on iOS or Android and pair your session at `https://orbiterdev.ai/setup`:

- **Free:** `€0` (50 mobile approvals per week)
- **Pro:** `€19.99/mo` (or `€219.99/yr` annual) for unlimited mobile approvals and audit history
