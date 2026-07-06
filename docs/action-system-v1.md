# Action System V1

This document is the source-of-truth contract for Rora actions.

Actions are not a generic activity library. Each action must be able to:

- be recommended from a saved trace or visible loop;
- explain why it was recommended;
- collect a completion signal;
- become action memory;
- influence future recommendations;
- feed Weekly Reflection;
- feed pattern learning;
- support playful UI without becoming random decoration.

## Current Audit

### Existing Runtime Surface

The current runtime already has the core pieces:

- Action definitions live in `src/actions/actionLibrary.ts` as `actionDefinitions`.
- Action reward and Weekly Reflection role copy live in
  `src/actions/actionRewardCopy.ts`.
- The current action ids are:
  - `fact-guess-worry-split`
  - `body-scan`
  - `name-loop`
  - `tiny-next-step`
  - `evening-unload`
  - `kind-reframe`
- `RecommendedAction` stores:
  - `actionId`
  - `reason`
  - `evidenceLine`
  - `mode`
  - `source`
- `ActionMemoryEntry` lives in `src/trace/dataFoundation.ts` and stores:
  - the action snapshot;
  - the recommendation snapshot;
  - recommendation source;
  - completion time;
  - helpfulness;
  - effort;
  - answers;
  - safety level;
  - loop chain key.
- `MoodTraceRecord` stores `actionRoutingFeatures` from AI extraction when
  available.
- `HelpfulnessMemory` aggregates `ActionMemoryEntry` by `chainKey + actionId`.
- Weekly Reflection receives `actionMemory`, `helpfulnessMemory`, and trace-level
  `actionRoutingFeatures`.

### Existing Recommendation Rules

The current recommender is `getRuleBasedRecommendedAction()` in
`src/actions/actionRecommendation.ts`.

Its effective rules are:

- If there is no trace, recommend the fallback action:
  - `fact-guess-worry-split`
  - mode: `daily_action`
  - source: `daily_fallback`
- If the trace is not safe for regular action recommendation:
  - recommend `name-loop`
  - keep it light and reflective
  - mode: `daily_action`
- Before a loop is visible:
  - body signal -> `body-scan`
  - replaying/worry/overthinking -> `tiny-next-step`
  - otherwise -> `tiny-next-step`
  - if AI routing proposes an eligible same-branch action, use that action and
    mark source as `ai_routing`
- After a loop is visible:
  - latest same-loop action was `too_much` -> `name-loop`
  - positive helpfulness memory exists -> repeat the remembered helpful action
  - early possible loop with low count -> `name-loop`
  - strong body signal -> `body-scan`
  - overthinking/worry -> `fact-guess-worry-split`
  - otherwise -> `fact-guess-worry-split`

### Existing Action Feedback Rules

Runtime completion status values are:

- `completed`
- `skipped`

Runtime helpfulness values only describe whether a completed action helped:

- `helped`
- `helped_a_little`
- `did_not_help`

Runtime effort values describe burden:

- `easy`
- `okay`
- `too_much`

Runtime skip reasons describe why an action was not tried:

- `not_today`
- `not_relevant`
- `no_time`

Important: `not_today` is not `did_not_help`. It means the moment did not fit;
it should not punish the action in recommendation memory.

Helpfulness memory currently ranks actions by:

- `helped * 2 + helped_a_little`
- then completion count
- then recency

Weekly Reflection currently uses action learning to choose modes such as:

- `micro_win`
- `lighter_loop`
- `lighter_step`

### Existing Gaps

The system works, but the contract is not explicit yet.

Current gaps:

- recommendation selection still lives in `App.tsx` instead of a shared recommender;
- recommendation fit rules live in code branches, not data;
- playful assets are not connected to action outcomes;
- Action completion UI does not yet render the reward copy card;
- Weekly Reflection consumes action family, primary need, weekly role, and reward stamp, but the UI still needs richer playful outcome states;
- old docs still mention `MicroAction` and `unsure`, which no longer matches runtime;
- contract tests now cover the shared action library, but do not yet cover data-driven recommendation ranking.

## Naming Standard

Use `Action`, not `MicroAction`, for the product/system name.

Reason:

- The product UI may call these "small actions" or use softer copy.
- The data model should use one stable domain name.
- `MicroAction` in old docs is now a legacy term.

Use these three layers:

- `ActionDefinition`: the reusable action in the library.
- `ActionRecommendation`: why this action is being offered now.
- `ActionCompletion`: what happened when the user tried it.

The current runtime combines `ActionRecommendation` and `ActionCompletion` into `ActionMemoryEntry`. That is acceptable for the MVP, but the schema below keeps the concepts separate so the system remains clean.

## Formal Schema

### ActionDefinitionV1

```ts
export type ActionId =
  | 'fact-guess-worry-split'
  | 'body-scan'
  | 'name-loop'
  | 'tiny-next-step'
  | 'evening-unload'
  | 'kind-reframe';

export type ActionFamily =
  | 'physiological'
  | 'cognitive'
  | 'labeling'
  | 'behavioral'
  | 'reflection'
  | 'self_compassion';

export type ActionPrimaryNeed =
  | 'downshift_body'
  | 'separate_thoughts'
  | 'name_loop'
  | 'tiny_next_step'
  | 'unload'
  | 'reframe';

export type ActionBurdenLevel = 'very_low' | 'low' | 'medium';

export type ActionTone =
  | 'grounding'
  | 'clear'
  | 'gentle'
  | 'reflective'
  | 'kind';

export type ActionStageFit =
  | 'daily_action'
  | 'possible_thread'
  | 'possible_loop'
  | 'familiar_loop'
  | 'micro_win_followup'
  | 'lighter_step_after_too_much';

export type ActionRewardStamp =
  | 'noticed'
  | 'named_it'
  | 'softened'
  | 'sorted'
  | 'parked'
  | 'kind_shift';

export type ActionDefinitionV1 = {
  schemaVersion: 'action_definition_v1';
  id: ActionId;
  title: string;
  shortTitle: string;
  estimatedMinutes: number;
  family: ActionFamily;
  primaryNeed: ActionPrimaryNeed;
  burdenLevel: ActionBurdenLevel;
  tone: ActionTone;
  description: string;
  reasonTemplate: string;
  fits: {
    stages: ActionStageFit[];
    traceSignalKeys: string[];
    bodySignalKeys: string[];
    thoughtFormKeys: string[];
    triggerKeys: string[];
  };
  avoidWhen: {
    safetyLevels: string[];
    recentHelpfulness: ActionFeedbackSignal[];
    contraindicationSignalKeys: string[];
  };
  steps: ActionStepDefinitionV1[];
  completion: {
    helpfulnessPrompt: string;
    rewardStamp: ActionRewardStamp;
    tooMuchFallbackActionId: ActionId | null;
  };
  memory: {
    storeAnswers: boolean;
    weeklyReflectionRole:
      | 'early_cue_practice'
      | 'thought_sorting'
      | 'loop_labeling'
      | 'behavioral_nudge'
      | 'evening_release'
      | 'self_compassion';
    positiveOutcomeWeight: number;
  };
  assets: {
    imageKey: string;
    rewardImageKey: string | null;
    animationKey: string | null;
  };
};
```

### ActionStepDefinitionV1

```ts
export type ActionStepDefinitionV1 = {
  key: string;
  title: string;
  prompt: string;
  detailPrompt: string;
  placeholder: string;
  inputKind: 'short_text' | 'long_text' | 'single_choice' | 'none';
  optional: boolean;
  imageKey: string | null;
};
```

### ActionRecommendationV1

```ts
export type ActionRecommendationMode = 'daily_action' | 'loop_action';

export type ActionRecommendationSource =
  | 'memory_helped'
  | 'too_much_lighter'
  | 'new_loop'
  | 'body_signal'
  | 'overthinking'
  | 'fallback'
  | 'daily_body_signal'
  | 'daily_overthinking'
  | 'daily_fallback'
  | 'ai_routing';

export type ActionRecommendationV1 = {
  schemaVersion: 'action_recommendation_v1';
  id: string;
  traceId: string | null;
  loopSignatureId: string | null;
  chainKey: string | null;
  actionId: ActionId;
  mode: ActionRecommendationMode;
  source: ActionRecommendationSource;
  reason: string;
  evidenceLine: string;
  recommendedAt: string;
  safetyLevel: string;
  canRecommendAction: boolean;
  routing: {
    family: ActionFamily;
    primaryNeed: ActionPrimaryNeed;
    burdenLevel: ActionBurdenLevel;
  };
};
```

### ActionCompletionV1

```ts
export type ActionHelpfulnessSignal =
  | 'helped'
  | 'helped_a_little'
  | 'did_not_help';

export type ActionCompletionStatus = 'completed' | 'skipped';
export type ActionEffortSignal = 'easy' | 'okay' | 'too_much';
export type ActionSkipReason = 'not_today' | 'not_relevant' | 'no_time';
export type ActionFeedbackSignal = ActionHelpfulnessSignal | 'too_much' | 'not_today';

export type ActionCompletionV1 = {
  schemaVersion: 'action_completion_v1';
  id: string;
  recommendationId: string | null;
  traceId: string;
  loopSignatureId: string;
  chainKey: string;
  actionId: ActionId;
  actionTitle: string;
  completedAt: string;
  completionStatus: ActionCompletionStatus;
  helpfulness: ActionHelpfulnessSignal | null;
  effort: ActionEffortSignal | null;
  skipReason: ActionSkipReason | null;
  answers: Record<string, string>;
  notes: string | null;
  rewardStamp: ActionRewardStamp;
  safetyLevel: string;
};
```

### ActionMemoryEntryV1

For the current MVP, `ActionMemoryEntry` can remain the persisted object, but it should be treated as:

```ts
ActionMemoryEntryV1 = ActionRecommendationSnapshot + ActionCompletionV1
```

Minimum persisted fields:

- `schemaVersion`
- `id`
- `traceId`
- `loopSignatureId`
- `chainKey`
- `actionId`
- `actionTitle`
- `recommendationMode`
- `recommendationReason`
- `recommendationSource`
- `evidenceLine`
- `completedAt`
- `helpfulness`
- `effort`
- `answers`
- `notes`
- `outcomeLabel`
- `safetyLevel`
- `family`
- `primaryNeed`
- `weeklyReflectionRole`
- `rewardStamp`

The current runtime stores these fields directly on `ActionMemoryEntry`. Hydration backfills older entries from `actionLibrary` so legacy memories remain usable.

### HelpfulnessMemoryV1

```ts
export type HelpfulnessMemoryV1 = {
  schemaVersion: 'helpfulness_memory_v1';
  id: string;
  loopSignatureId: string;
  chainKey: string;
  actionId: ActionId;
  actionTitle: string;
  family: ActionFamily;
  primaryNeed: ActionPrimaryNeed;
  completions: number;
  lastCompletedAt: string;
  outcomeCounts: Record<ActionFeedbackSignal, number>;
  lastOutcome: ActionFeedbackSignal;
  lastOutcomeLabel: string;
  bestOutcomeLabel: string;
  recommendationReason: string;
  weeklyReflectionRole: ActionDefinitionV1['memory']['weeklyReflectionRole'];
};
```

## Canonical Library Mapping

| Action | Family | Primary need | Burden | Stage fit | Weekly role | Reward stamp |
| --- | --- | --- | --- | --- | --- | --- |
| `body-scan` | `physiological` | `downshift_body` | `very_low` | daily, possible loop, after too much | `early_cue_practice` | `softened` |
| `fact-guess-worry-split` | `cognitive` | `separate_thoughts` | `low` | daily, possible loop, familiar loop | `thought_sorting` | `sorted` |
| `name-loop` | `labeling` | `name_loop` | `very_low` | daily, possible thread, possible loop, after too much | `loop_labeling` | `named_it` |
| `tiny-next-step` | `behavioral` | `tiny_next_step` | `low` | daily, possible loop, micro-win follow-up | `behavioral_nudge` | `noticed` |
| `evening-unload` | `reflection` | `unload` | `medium` | daily, familiar loop | `evening_release` | `parked` |
| `kind-reframe` | `self_compassion` | `reframe` | `low` | daily, possible loop, familiar loop | `self_compassion` | `kind_shift` |

## Recommendation Standard

### Safety First

If `traceRecord.safetyAssessment.canRecommendAction` is false:

- do not recommend normal cognitive or behavioral actions;
- prefer `name-loop` only if the copy frames it as reflection, not fixing;
- never show playful rewards that imply achievement or treatment;
- keep Weekly Reflection factual and gentle.

### Daily Action vs Loop Action

Use `daily_action` when:

- the user has a current trace;
- the loop is not yet visible;
- the recommendation is based on today's saved trace.

Use `loop_action` when:

- the trace passes the pattern visibility rule;
- the UI is showing a loop/pattern context;
- the recommendation uses loop evidence or action memory.

The same `ActionDefinition` can support both modes, but the recommendation reason must change.

### Pattern Stage Fit

The action should match the pattern stage:

- `still_learning`: `body-scan`, `name-loop`, `tiny-next-step`
- `early_cue`: `body-scan`, `name-loop`
- `possible_thread`: `name-loop`, `tiny-next-step`
- `possible_loop`: `fact-guess-worry-split`, `body-scan`, `name-loop`
- `familiar_loop`: remembered helpful action first
- `micro_win`: repeat or lightly build on the helpful action
- `lighter_step`: choose `name-loop` or another `very_low` burden action

### Helpfulness Memory

Use these weights for ranking:

- `helped`: 2
- `helped_a_little`: 1
- `did_not_help`: 0
- `too_much`: -2 for the same action in the same chain
- `not_today`: 0 and do not treat it as failed

If the latest same-chain action was `too_much`:

- do not recommend the same action again immediately;
- use `tooMuchFallbackActionId`;
- if no fallback exists, use `name-loop`.

If an action has repeated `did_not_help` for the same chain:

- deprioritize it unless no better action exists;
- do not present it as "remembered helpful".

## Weekly Reflection Contract

Weekly Reflection must be able to say more than "you did X".

It can use action data for:

- micro-wins: user tried something and it helped;
- lighter-step moments: user said something was too much;
- pattern learning: same chain + same action + helpfulness trend;
- next-week focus: recommend a known helpful action or a lighter fallback;
- early cue insight: body signal appeared before the thought/action loop.

Weekly Reflection should consume:

- `ActionMemoryEntryV1`
- `HelpfulnessMemoryV1`
- `ActionDefinitionV1.memory.weeklyReflectionRole`
- `ActionDefinitionV1.completion.rewardStamp`
- `weeklyFacts.actionLearning.recommendedActionSource`
- `weeklyFacts.actionLearning.bestActionFamily`
- `weeklyFacts.actionLearning.bestPrimaryNeed`
- `weeklyFacts.actionLearning.weeklyReflectionRole`
- `weeklyFacts.actionLearning.rewardStamp`

Weekly Reflection should not:

- repeat raw trace labels as a fake insight;
- overstate efficacy from one completion;
- frame an action as treatment;
- use streak pressure;
- claim a pattern exists before the pattern visibility rule allows it.

## Pattern Learning Contract

Pattern learning can use action data only when all of these are present:

- `chainKey`
- `actionId`
- `helpfulness`
- `completedAt`
- `recommendationMode`
- `safetyLevel`

Allowed pattern-learning conclusions:

- "This action helped once for this loop."
- "This action helped a little more than once for this loop."
- "This action felt too much last time this loop showed up."
- "Rora is still learning whether this action helps this loop."

Disallowed conclusions:

- diagnosis;
- treatment claims;
- guaranteed improvement;
- broad generalization across unrelated chains;
- emotional judgment of the user.

## Playfulness Contract

Fun can be added only as metadata on an action or completion.

Allowed playful elements:

- reward stamp after completion;
- small action-specific illustration;
- tiny completion animation;
- gentle "saved for next time" moment;
- collectible language based on awareness, not performance.

Not allowed:

- streak pressure;
- shame if the user skips;
- gamified diagnosis;
- leaderboards;
- rewards that imply the user should push through distress;
- random badges that do not map to `ActionRewardStamp`.

Every playful element must answer:

- Which action produced it?
- Which completion outcome produced it?
- Does Weekly Reflection know how to interpret it?
- Does it remain safe when effort is `too_much`?

## Implementation Plan

### Step 1: Move The Library Out Of App.tsx

Status: done for the shared library.

Created:

- `src/actions/actionLibrary.ts`

Moved:

- `ActionId`
- `ActionDefinition`
- `actionDefinitions`
- `getActionDefinition`
- `fallbackActionId`
- `getEmptyActionAnswers`
- `browseActionOptions`

Status: done. `App.tsx` now consumes the shared recommender.

### Step 2: Add Contract Tests

Add tests that fail if:

- an action is missing family/need/burden/stage fit;
- an action has no `tooMuchFallbackActionId`;
- an action has no `weeklyReflectionRole`;
- an action has no `rewardStamp`;
- recommendation source is not stored in action memory;
- old `unsure` helpfulness appears anywhere in runtime types.

Status: done for action library metadata, recommendation source memory, and
recommendation path contract tests.

### Step 3: Make Recommendation Data-Driven

Status: partially done. The recommender keeps the current rule order, and action
selection now uses:

- eligible action filtering;
- safety filtering;
- memory ranking;
- stage fit ranking;
- burden-level fallback.
- AI routing features when they pass the same eligibility layer.

Still open:

- make ranking weights explicit instead of preserving the current branch order;
- add richer playful outcome states on top of the persisted reward stamp.

### Step 4: Extend ActionMemoryEntry

Add optional migration-safe fields first:

- `recommendationSource`
- `family`
- `primaryNeed`
- `weeklyReflectionRole`
- `rewardStamp`

Then update `hydrateActionMemoryEntry()` to backfill older entries from `actionLibrary`.

Status: `recommendationSource`, action family, primary need, weekly role, and
reward stamp are now persisted and hydrated. Weekly facts prefer the stored
action-memory snapshot, with `actionLibrary` only used as a legacy backfill.

### Step 5: Wire Weekly Reflection To Roles

Update weekly facts and AI payload so the weekly layer sees:

- action role;
- reward stamp;
- helpfulness status;
- same-chain memory trend.
- trace-level AI action routing features.

Status: `weeklyFacts.actionLearning` and `weeklyFacts.recommendedNextStep` now
carry action source, family, primary need, weekly reflection role, and reward
stamp as source-of-truth facts.

### Step 6: Add Fun Layer

Only after the contract is in code:

- show action-specific completion stamps;
- let "What helped before" use real helpfulness memory;
- let Weekly Reflection mention one earned micro-win;
- never make fun UI the source of truth.

## Acceptance Criteria

Action System V1 is ready when:

- every action has a complete `ActionDefinitionV1`;
- every recommendation stores reason, evidence, source, mode, and safety;
- every completion stores helpfulness, effort, answers, role, and reward stamp;
- helpfulness memory can rank actions per loop chain;
- Weekly Reflection can consume action learning without guessing from titles;
- pattern learning never uses action data without a chain key;
- playful UI is derived from action completion data, not random UI state;
- old `MicroAction` docs are either migrated or clearly marked legacy.
