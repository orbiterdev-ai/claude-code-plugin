---
description: Request explicit one-tap mobile biometric sign-off (iOS and Android) via Orbiter Dev before executing a high-risk action.
argument-hint: [action description]
---

# Approve an Action

Request explicit human sign-off from your paired phone (iOS Face ID or Android biometrics) via the Orbiter Dev Hosted MCP server (`orbiter_request_approval` followed by `orbiter_await_approval`).

## Steps

1. Summarize the planned action clearly (use `$ARGUMENTS` if provided, or summarize the pending risky operation) with redacted parameters and an accurate `risk_level` (`low`, `medium`, `high`, or `critical`). Never include raw secrets, tokens, or private keys.
2. Call `orbiter_request_approval` with the action summary and risk level.
3. Call `orbiter_await_approval` with the returned `approval_id` until a terminal decision arrives.
4. Proceed only if the decision is explicitly `approved`. If `rejected`, `denied`, `expired`, or unreachable, stop and report the block.
