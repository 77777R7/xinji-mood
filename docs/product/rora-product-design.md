# Rora Product Design

Status: accepted for Action Reward and Weekly Reflection V1

This document is the lightweight product-design contract for Rora user-facing work.
It follows the same principle described in Vercel's product-design agent pattern:
design judgment should live in the repository, not only in a person's memory.

## Request Modes

Before changing user-facing work, choose the narrowest mode.

| Mode | Use When | Behavior |
| --- | --- | --- |
| Shape | The direction, flow, or product meaning is unsettled. | Plan first. Define the user job, outcome, states, non-goals, and open decisions. Do not edit UI unless asked. |
| Implement | The user has accepted a direction. | Make the smallest coherent end-to-end change and verify it. |
| Review | The user asks whether something is good, wrong, ugly, or ready. | Lead with findings and user consequences. Do not edit unless asked. |
| Copy | The structure is settled and wording needs work. | Edit user-facing language and directly required data/copy contracts only. |
| Harden | The feature exists but needs polish or edge states. | Preserve the settled direction while fixing state, resilience, responsive, and accessibility issues. |

## Decision Authority

Resolve conflicts in this order:

1. The user's explicit goal and constraints.
2. Verified app behavior, screenshots, runtime data, and tests.
3. Repository-canonical contracts such as `docs/action-system-v1.md`.
4. Accepted Rora product design decisions in this folder.
5. Adjacent shipped patterns in the same surface.
6. General interface heuristics.

## Rora Voice

Rora should feel like a quiet pattern companion, not a dashboard, therapist, coach,
or productivity system.

Use:

- specific observations from saved traces;
- soft progress language;
- "Rora noticed", "Rora can remember", "this may help next time";
- small, concrete next steps;
- copy that makes the user feel less alone without inflating the moment.

Avoid:

- diagnostic language;
- promises of treatment, healing, or symptom reduction;
- empty praise such as "Great job" or "You crushed it";
- system-log language such as "source action memory";
- pressure language such as streaks, scores, points, wins, optimization, or goals;
- repeating the user's trace back without adding a delta.

## Surface Standards

### Action Completion

The completion surface should answer:

1. What did the user just practice?
2. What did Rora learn from the helpfulness signal?
3. What will Rora remember for next time?

The reward should feel like a small journal stamp, not a trophy.

### Weekly Reflection

Weekly Reflection should answer:

1. What repeated?
2. What shifted?
3. What helped or felt too much?
4. What is the next lightest focus?

It must not summarize raw traces as if repetition itself is the product value.
The paid feeling comes from the delta: what became easier to notice, name,
separate, park, soften, or make kinder.

## Implementation Rule

User-visible reward and weekly copy must route through
`src/actions/actionRewardCopy.ts` when it depends on action schema fields.
Do not scatter reward-stamp or weekly-role copy across unrelated components.

## Verification

Every new action must have:

- a valid `rewardStamp`;
- a valid `weeklyReflectionRole`;
- completion copy for each helpfulness branch;
- weekly insight copy for its role;
- contract-test coverage.
