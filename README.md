# Orbiter Dev - Claude Code Plugin

Approve or deny your AI agent's risky actions **from your phone**, with receipts.

This plugin is the one-command install for Orbiter on Claude Code (CLI and desktop app,
which share plugin config). It bundles:

- **Enforced approval gate** - a `PermissionRequest` hook that fires on every permissioned
  tool call, routes the raw action to your phone via `api.orbiterdev.ai`, and returns your
  decision to Claude Code. High-risk actions require biometric confirmation (Face ID and
  Android biometrics) on the phone. Enforced means enforced: the harness runs the hook
  whether or not the model cooperates.
- **Orbiter MCP tools** - `request_approval`, pairing, and mobile alerts via the published
  `@orbiterdev/mcp-server` package.
- **Commands** - `/approve` (create an approval for the current action) and `/status`.

## Install

```bash
# one time: register the marketplace, then install
claude plugin marketplace add orbiterdev-ai/orbiter-plugin
claude plugin install orbiter-dev@orbiter
```

Then pair with your phone (once): open the **Orbiter Dev mobile app (iOS and Android) -> Settings -> Pair IDE**
and follow the prompt, or run `npx -y @orbiterdev/mcp-server claude doctor
--check-backend` to verify `credentials_present: true`.

**Restart Claude Code after install** - hook and permission config is cached per session.

## Migrating from the npx setup

If you previously ran `npx @orbiterdev/mcp-server claude setup`, remove that wiring so you
don't get double approval prompts:

```bash
npx -y @orbiterdev/mcp-server claude uninstall --scope both
```

The plugin replaces both the hook and the MCP server registration. Your pairing credential
(`~/.orbiter/profiles/claude-code/credentials`) is untouched and keeps working.

## How it decides

The hook classifies the action (ruleset v2, same classifier across all Orbiter IDE
integrations), sends risky ones to your phone, and blocks until you decide (5-minute
timeout; low-risk auto-allows, high-risk auto-denies on timeout, configurable). Every
decision lands as a receipt in your Orbiter audit trail.

If the backend is unreachable or the package cannot resolve, Claude Code falls back to its
normal built-in permission prompt. Nothing is silently auto-approved.

## Files

- `.claude-plugin/plugin.json` - manifest
- `hooks/hooks.json` + `hooks/orbiter-plugin-hook.cjs` - the enforced gate
- `.mcp.json` - Orbiter MCP server (published npm package, pinned)
- `commands/` - `/approve`, `/status`

Website: https://orbiterdev.ai · Docs: https://orbiterdev.ai/docs
