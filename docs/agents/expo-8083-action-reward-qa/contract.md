# Expo 8083 Action Reward QA Harness

Status: active

## Goal

Restore a usable local web surface at `http://localhost:8083/`, then run the Action completion flow and verify the reward card experience before making any UI polish changes.

## Roles

- Planner: keep the loop scoped to startup diagnosis, real flow QA, and reward-card polish.
- Generator: make the smallest code or config change needed to unblock the current failing check.
- Evaluator: use command output, HTTP checks, rendered screenshots, and focused tests as evidence.

## Done Means

1. No stale Expo/export/static-server process is occupying or blocking port `8083`.
2. The current app can be reached at `http://localhost:8083/`.
3. The served app includes the current Action reward-card code path.
4. The Actions flow is exercised from Actions -> Start -> Complete -> helpfulness response.
5. At least one positive response and one high-friction response are checked, preferably `A little` and `Too much`.
6. The reward card appears after completion and uses `getActionRewardCompletionCopy()` content.
7. Mobile layout is checked for card height, stamp weight, headline tone, overflow, and crowding.
8. Any polish change is narrow and does not rewrite the Action schema or recommendation logic.
9. `npm run typecheck` and `npm run test:contract` pass after code changes.
10. Remaining gaps are named explicitly if browser automation or screenshots cannot be completed.

## Out Of Scope

- Redesigning the full Actions page.
- Changing the Action schema, recommendation eligibility, or Weekly Reflection learning model.
- Production deployment, account changes, publishing, or external messaging.
- Replacing the Expo stack unless diagnosis proves the local web path is unusable.

## Trace Sources

- Process and port checks.
- Expo/export/static-server logs.
- HTTP responses from `localhost:8083`.
- Browser screenshots or rendered DOM checks.
- Focused contract and type checks.

## Current Bottleneck

Verification infrastructure: Expo web/export previously hung at `Using app as the root directory for Expo Router.`

## Stop Conditions

- Success: the done criteria pass and reward-card polish is either accepted by trace or patched and rechecked.
- Needs human: a product decision is required after seeing the real UI.
- Restart: Expo remains hung after a narrow diagnosis identifies a cleaner alternate route.
- Unsafe: a fix would require destructive file operations, account changes, or publishing.
