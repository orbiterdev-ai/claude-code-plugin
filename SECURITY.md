# Security Policy - Orbiter Dev Claude Code Plugin

## Enterprise Hardening Invariants

The Orbiter Dev Claude Code hook runner (`hooks/orbiter-plugin-hook.cjs`) is a self-contained, zero-dependency Node.js (`>=18`) fail-closed enforcement engine implementing 11 verified security controls:

1. **No self-hook substring bypass:** Loop prevention matches explicit Orbiter MCP tool names only, never command strings or argument substrings.
2. **Cross-platform destructive command detection:** Enforces explicit flag boundaries across POSIX, PowerShell (`Remove-Item -Recurse -Force`, `Format-Volume`, `Clear-Disk`, `Initialize-Disk`, `Stop-Computer`, `Restart-Computer`), Windows `del`/`rmdir`, SQL, Git, Terraform, Kubernetes, and cloud CLIs.
3. **SSRF and credential-exfiltration protection:** `ORBITER_API_URL` / `ORBITER_SERVER_URL` is restricted to `https://` (or explicit loopback `http://127.0.0.1`, `http://localhost`, `http://[::1]` for local development) with zero embedded credentials, zero query/fragment parameters, and `redirect: "error"`.
4. **Shell-chaining and exfiltration blocking:** Rejects shell metacharacters (`;`, `&`, `|`, `` ` ``, `$`, `<`, `>`, `(`, `)`, newlines, null bytes) and unsafe `git -c`/`--ext-diff`/`--exec-path` flags on the fast-path. Detects pipe-to-shell, decode-to-exec, `nc`/`/dev/tcp/` exfiltration, separate-flag `rm -r -f`, unfiltered `DELETE FROM`, and array command inputs.
5. **Strict safe-read boundary and credential detection:** Excludes `find`, `awk`, and `sed` from safe-read shell whitelists. Detects `.env`, `.ssh/`, `.aws/`, `.gnupg/`, `.kube/config`, `.docker/config.json`, `.orbiter/`, `.npmrc`, `.pypirc`, `.netrc`, `.git-credentials`, `id_ed25519`/`id_rsa`, `credentials`, `secrets`, `.pem`/`.key`/`.p8`, and `/etc/shadow` across `Read`, `Glob`, `Grep`, `Bash`, `Write`, `Edit`, and MCP tools.
6. **Path traversal and workspace isolation:** Canonicalizes paths with drive-aware `path.posix.normalize()` against `cwd`. Any `..`, `~/`, or out-of-workspace path blocks fast-path allow on both read and write tools.
7. **Secret redaction and Zero Data Mode:** Strips Bearer/Basic headers, API keys, JWTs, PEM private keys, env assignments, URL userinfo, and active `ORBITER_API_KEY`/`ORBITER_TOKEN` values from payloads, `stdout`, `stderr`, and errors. Set `ORBITER_ZERO_DATA_MODE=1` to withhold raw tool arguments locally.
8. **DoS and malformed input resilience:** Enforces a `2 MiB` stdin cap with early abort, maximum JSON nesting depth (`64`), raw and escaped null-byte rejection, depth-capped serialization, strict `tool_name` / `tool_input` validation, zero `eval`, and deterministic fail-closed `deny` output on every error path.
9. **Zero shell-wrapper / npx attack surface:** Runs directly on built-in Node.js `>=18` APIs with zero external npm dependencies and no `shell: true` subprocess invocation.
10. **Supply-chain hygiene:** Uniform LF line endings, automated E2E + adversarial security test suite in CI, and MIT Gitleaks `v8.30.1` CLI scanning pinned by SHA-256.
11. **Zero telemetry by default:** `PostToolUse` and `Stop` hooks transmit zero telemetry unless `ORBITER_CLAUDE_REPORT_TELEMETRY=true` is explicitly configured.

## Reporting a Vulnerability

Email **info@orbiterdev.ai** with reproduction steps and affected versions. Do not open public issues for undisclosed security vulnerabilities.
