#!/usr/bin/env node
/**
 * Orbiter Dev plugin hook runner (Claude Code plugin edition).
 *
 * Resolves the published @orbiterdev/mcp-server@0.1.13 package via npx and
 * forwards the hook invocation (e.g. `permission-check`) to it, inheriting stdin/stdout
 * so the PermissionRequest decision JSON passes straight through to Claude Code.
 *
 * Why npx and not a baked absolute path: the global `claude setup` runner pins the npx
 * cache path at install time, which silently breaks when the cache is evicted. The
 * plugin must survive cache eviction and machine moves; first invocation may take a few
 * extra seconds while npx populates its cache, subsequent calls are fast. A phone
 * round-trip dwarfs that latency anyway.
 *
 * Fail-safe behavior: if the package cannot be resolved or the backend is unreachable,
 * the underlying permission-check reports its error on stderr and Claude Code falls back
 * to its normal permission prompt (nothing is silently auto-approved).
 */
const { spawnSync } = require("node:child_process");

const PACKAGE_SPEC = "@orbiterdev/mcp-server@0.1.13";

const env = { ...process.env };
if (!env.ORBITER_SERVER_URL) env.ORBITER_SERVER_URL = "https://api.orbiterdev.ai";
if (!env.ORBITER_CREDENTIAL_PROFILE) env.ORBITER_CREDENTIAL_PROFILE = "claude-code";
if (!env.ORBITER_IDE_NAME) env.ORBITER_IDE_NAME = "Claude Code";

const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npxCmd, ["-y", PACKAGE_SPEC, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(String(result.error));
  process.exit(1);
}
if (typeof result.status === "number") process.exit(result.status);
if (result.signal) console.error("Orbiter plugin hook runner exited with signal " + result.signal);
process.exit(1);
