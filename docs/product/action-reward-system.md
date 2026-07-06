# Action Reward System

Status: accepted for V1

Action reward is not gamification. It is a memory signal.

When a user completes an action, the product should make the smallest useful
meaning visible:

```text
action completed
-> rewardStamp
-> helpfulness signal
-> action memory
-> Weekly Reflection insight
```

## Reward Stamp Contract

| rewardStamp | User Meaning | Product Use |
| --- | --- | --- |
| `softened` | The body signal became easier to notice or hold. | Use for physiological downshift and early-cue practice. |
| `sorted` | Mixed thoughts were separated into smaller pieces. | Use for cognitive sorting. |
| `named_it` | A repeating loop now has a gentle name. | Use for loop labeling. |
| `noticed` | One next step became small enough to begin. | Use for behavioral nudges. |
| `parked` | An unfinished thought has somewhere to wait. | Use for evening release. |
| `kind_shift` | The user's self-talk moved toward a kinder sentence. | Use for self-compassion. |

## Helpfulness Branches

| feedback | Tone | Product Meaning |
| --- | --- | --- |
| `helped` | confident and warm | This action is worth remembering. |
| `helped_a_little` | gentle and precise | A small shift is still useful evidence. |
| `did_not_help` | neutral and non-failing | Rora learned this may not fit this thread. |
| `too_much` | protective and lighter | Rora should lower the burden next time. |
| `not_today` | protective and non-punitive | The moment did not fit; do not punish the action. |

## UX Rules

- Never make the reward feel like a grade.
- Never imply the user solved the loop.
- Never reward volume over awareness.
- Always preserve the feedback nuance.
- Never treat `not_today` as `did_not_help`.
- If an action is `too_much`, the next recommendation should become lighter.
- Reward noticing, trying, and giving feedback. Do not imply the user's mood had
  to improve for the action to count.

## V1 Surface

V1 can ship with a small completion card:

- stamp badge from `rewardStamp`;
- one-sentence headline;
- one-sentence body;
- small "Rora learned from this" line when feedback is positive;
- lighter fallback line when effort is `too_much`.
- gentle skip line when completion status is `skipped`.

The visual treatment should match `docs/design-system.md`: paper, soft cards,
sage/clay/amber accents, and hand-journal warmth.
