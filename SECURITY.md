# Security Policy

## Supported Versions

Security updates are provided for the latest release line of `orbiter-plugin`:

| Version | Supported |
|---------|-----------|
| `1.1.x` | Yes |
| `< 1.1.0` | No |

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Report suspected security issues privately by emailing **[support@orbiterdev.ai](mailto:support@orbiterdev.ai)** with the subject line `[SECURITY] orbiter-plugin: <short summary>`.

Include as much of the following as possible:

- Affected plugin version, Claude Code version, and operating system
- Reproduction steps or minimal sanitized hook payload
- Potential impact and any suggested remediation

## Response SLA

- **Initial acknowledgment:** within 24 business hours
- **Triage and severity confirmation:** within 72 hours
- **Target remediation timelines:**
  - Critical severity: within 7 days
  - High severity: within 14 days
  - Moderate severity: within 30 days
- **Coordinated disclosure:** we coordinate public advisories and credit researchers once a fix is released (unless anonymity is requested).

## Security Architecture & Trust Boundary

`orbiter-plugin` enforces human-in-the-loop sign-off outside the AI agent's reasoning loop:

- **Deterministic harness gate:** the `PermissionRequest` hook runs in the Claude Code host harness rather than relying on model compliance.
- **Out-of-band mobile biometric boundary:** high-risk approvals require explicit biometric confirmation on the paired Orbiter Dev mobile app (iOS Face ID or Android biometrics) over TLS.
- **Input redaction before egress:** secrets, tokens, and PEM key blocks are redacted locally before approval summaries are sent to `https://api.orbiterdev.ai`.
- **No silent auto-approval on failure:** if the backend or package runner is unavailable, the hook falls back to Claude Code's native permission prompt rather than silently allowing execution.

## Scope Exclusions

- Vulnerabilities inside Claude Code itself (report those directly to Anthropic)
- Attacks requiring an adversary with existing local write access to `~/.claude/` or `~/.orbiter/`
