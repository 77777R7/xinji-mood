# Weekly Facts Action Schema Harness

## Goal

Make `weeklyFacts` the authoritative Weekly Reflection fact layer for Action schema learning.

## Roles

- Planner: keep scope limited to weekly facts/action schema data flow.
- Generator: implement the smallest code changes needed for the data contract.
- Evaluator: verify by reading diffs, tests, and contract assertions.

## Done Means

- `weeklyFacts.actionLearning` exposes:
  - `recommendedActionSource`
  - `bestActionFamily`
  - `bestPrimaryNeed`
  - `weeklyReflectionRole`
  - `rewardStamp`
- Values are derived from `ActionMemoryEntry` plus `actionLibrary`, not from UI copy.
- OpenAI Weekly Reflection receives those fields through `weeklyFacts`.
- Existing action recommendation behavior is not changed.
- Contract tests assert the fields exist and match the canonical action schema.

## Checks

- `npm run typecheck`
- `npm run test:contract`
- Search confirms server prompt still treats `weeklyFacts` as source of truth.

## Out Of Scope

- No UI redesign.
- No new action cards.
- No playful animation implementation.
- No production/account/deployment changes.

## Stop Conditions

- Success: checks pass and contract assertions cover the new fields.
- Needs human: product copy or UI behavior must change.
- Restart: patch introduces broad unrelated changes.
- Unsafe: any clinical/diagnostic inference is introduced.

