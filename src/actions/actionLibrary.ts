import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { Feather } from '@expo/vector-icons';
import type { ActionHelpfulnessSignal, ActionRecommendationMode } from '../trace/dataFoundation';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export type ActionId =
  | 'fact-guess-worry-split'
  | 'body-scan'
  | 'name-loop'
  | 'tiny-next-step'
  | 'evening-unload'
  | 'kind-reframe';

export type ActionAnswerKey = string;
export type ActionAnswers = Record<string, string>;

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

export type ActionRoutingPrimaryNeed = ActionPrimaryNeed | 'none';

export type ActionRoutingFamily = ActionFamily | 'none';

export type ActionTone = 'grounding' | 'clear' | 'gentle' | 'reflective' | 'kind';

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

export type ActionWeeklyReflectionRole =
  | 'early_cue_practice'
  | 'thought_sorting'
  | 'loop_labeling'
  | 'behavioral_nudge'
  | 'evening_release'
  | 'self_compassion';

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

export type ActionStep = {
  key: ActionAnswerKey;
  title: string;
  prompt: string;
  detailPrompt: string;
  placeholder: string;
  inputKind: 'short_text' | 'long_text' | 'single_choice' | 'none';
  optional: boolean;
  icon?: FeatherIconName;
  image?: ImageSourcePropType;
  imageKey: string | null;
};

export type RecommendedAction = {
  actionId: ActionId;
  reason: string;
  evidenceLine: string;
  mode: ActionRecommendationMode;
  source: ActionRecommendationSource;
};

export type ActionDefinition = {
  schemaVersion: 'action_definition_v1';
  id: ActionId;
  title: string;
  shortTitle: string;
  estimatedMinutes: number;
  family: ActionFamily;
  primaryNeed: ActionPrimaryNeed;
  burdenLevel: ActionBurdenLevel;
  tone: ActionTone;
  reason: string;
  reasonTemplate: string;
  description: string;
  image: ImageSourcePropType;
  fits: {
    stages: ActionStageFit[];
    traceSignalKeys: string[];
    bodySignalKeys: string[];
    thoughtFormKeys: string[];
    triggerKeys: string[];
  };
  avoidWhen: {
    safetyLevels: string[];
    recentHelpfulness: ActionHelpfulnessSignal[];
    contraindicationSignalKeys: string[];
  };
  steps: ActionStep[];
  completion: {
    helpfulnessPrompt: string;
    rewardStamp: ActionRewardStamp;
    tooMuchFallbackActionId: ActionId | null;
  };
  memory: {
    storeAnswers: boolean;
    weeklyReflectionRole: ActionWeeklyReflectionRole;
    positiveOutcomeWeight: number;
  };
  assets: {
    imageKey: string;
    rewardImageKey: string | null;
    animationKey: string | null;
  };
};

export type WhatHelpedAction = {
  id: string;
  actionId: ActionId;
  title: string;
  outcome: string;
  date: string;
  icon?: FeatherIconName;
  image?: ImageSourcePropType;
  isNew?: boolean;
  loopLabel?: string;
  matchLabel?: string;
};

export type BrowseAction = {
  id: ActionId;
  title: string;
  description: string;
  duration: string;
  image: ImageSourcePropType;
};

const actionAssets = {
  actionFgwSplit: require('../../assets/figma/today/action-icons-v1/action-fgw-split-v1.png'),
  actionBodyScan: require('../../assets/figma/today/action-icons-v1/action-body-scan-v1.png'),
  actionNameLoop: require('../../assets/figma/today/action-icons-v1/action-name-loop-v1.png'),
  actionTinyNextStep: require('../../assets/figma/today/action-icons-v1/action-tiny-next-step-v1.png'),
  actionEveningUnload: require('../../assets/figma/today/action-icons-v1/action-evening-unload-v1.png'),
  actionKindReframe: require('../../assets/figma/today/action-icons-v1/action-kind-reframe-v1.png'),
  stepFact: require('../../assets/figma/today/action-step-icons-v1/step-fact-v2.png'),
  stepGuess: require('../../assets/figma/today/action-step-icons-v1/step-guess-v1.png'),
  stepWorry: require('../../assets/figma/today/action-step-icons-v1/step-worry-v1.png'),
  stepBreatheNoticeBody: require('../../assets/figma/today/action-step-icons-v1/step-breathe-notice-body-v1.png'),
  stepNameIt: require('../../assets/figma/today/action-step-icons-v1/step-name-it-v1.png'),
  stepChooseOneSmallStep: require('../../assets/figma/today/action-step-icons-v1/step-choose-one-small-step-v1.png'),
};

const actionAvoidWhen = {
  safetyLevels: ['high', 'urgent_medical'],
  recentHelpfulness: ['too_much'] as ActionHelpfulnessSignal[],
  contraindicationSignalKeys: ['self_harm_language', 'crisis_language'],
};

export const actionDefinitions: ActionDefinition[] = [
  {
    schemaVersion: 'action_definition_v1',
    id: 'fact-guess-worry-split',
    title: 'Fact / Guess / Worry Split',
    shortTitle: 'Fact / Guess / Worry',
    estimatedMinutes: 2,
    family: 'cognitive',
    primaryNeed: 'separate_thoughts',
    burdenLevel: 'low',
    tone: 'clear',
    reason: 'This helps when a thread has replaying, worry, or too many guesses mixed together.',
    reasonTemplate: 'Use when replaying, worry, or self-blame needs separating into smaller parts.',
    description: 'A tiny reset for separating what happened from what your mind is filling in.',
    image: actionAssets.actionFgwSplit,
    fits: {
      stages: ['daily_action', 'possible_loop', 'familiar_loop'],
      traceSignalKeys: ['overthinking', 'self_blame', 'replaying_thought'],
      bodySignalKeys: [],
      thoughtFormKeys: ['replaying_thought', 'self_blame', 'worry'],
      triggerKeys: ['work_feedback', 'work_message'],
    },
    avoidWhen: actionAvoidWhen,
    steps: [
      {
        key: 'fact',
        title: 'Fact',
        prompt: 'What actually happened?',
        detailPrompt: 'Write only the parts you know happened.',
        placeholder: 'Example: My manager asked one follow-up question.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'guess',
        title: 'Guess',
        prompt: 'What am I assuming?',
        detailPrompt: 'Name the story your mind is filling in.',
        placeholder: 'Example: I am assuming they think I did badly.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepGuess,
        imageKey: 'stepGuess',
      },
      {
        key: 'worry',
        title: 'Worry',
        prompt: 'What am I worried about?',
        detailPrompt: 'Put the fear down in one small sentence.',
        placeholder: 'Example: I am worried this will affect how they see me.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepWorry,
        imageKey: 'stepWorry',
      },
    ],
    completion: {
      helpfulnessPrompt: 'Did this make the thought feel clearer?',
      rewardStamp: 'sorted',
      tooMuchFallbackActionId: 'name-loop',
    },
    memory: {
      storeAnswers: true,
      weeklyReflectionRole: 'thought_sorting',
      positiveOutcomeWeight: 2,
    },
    assets: {
      imageKey: 'actionFgwSplit',
      rewardImageKey: null,
      animationKey: null,
    },
  },
  {
    schemaVersion: 'action_definition_v1',
    id: 'body-scan',
    title: '2-min Body Scan',
    shortTitle: 'Body Scan',
    estimatedMinutes: 2,
    family: 'physiological',
    primaryNeed: 'downshift_body',
    burdenLevel: 'very_low',
    tone: 'grounding',
    reason: 'Suggested because this trace has a stronger body signal.',
    reasonTemplate: 'Use when the body signal is the clearest early cue.',
    description: 'A short check-in for noticing where the loop is living in your body before solving it.',
    image: actionAssets.actionBodyScan,
    fits: {
      stages: ['daily_action', 'possible_loop', 'familiar_loop', 'lighter_step_after_too_much'],
      traceSignalKeys: ['chest_tightness', 'head_pressure', 'stomach_tightness', 'tired_heavy'],
      bodySignalKeys: ['chest_tightness', 'head_pressure', 'stomach_tightness', 'neck_shoulder_tension', 'tired_heavy'],
      thoughtFormKeys: [],
      triggerKeys: [],
    },
    avoidWhen: actionAvoidWhen,
    steps: [
      {
        key: 'breathe',
        title: 'Breathe',
        prompt: 'Take two slower breaths.',
        detailPrompt: 'Start by letting your body arrive before naming anything.',
        placeholder: 'Optional: what changed after two breaths?',
        inputKind: 'short_text',
        optional: true,
        image: actionAssets.stepBreatheNoticeBody,
        imageKey: 'stepBreatheNoticeBody',
      },
      {
        key: 'body_notice',
        title: 'Notice',
        prompt: 'Where is it strongest?',
        detailPrompt: 'Name the body signal without trying to fix it.',
        placeholder: 'Example: tight chest, heavy stomach, tense shoulders.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'soften',
        title: 'Soften',
        prompt: 'What would feel 5% easier?',
        detailPrompt: 'Choose one tiny physical adjustment.',
        placeholder: 'Example: unclench jaw, sit back, sip water.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepChooseOneSmallStep,
        imageKey: 'stepChooseOneSmallStep',
      },
    ],
    completion: {
      helpfulnessPrompt: 'Did this make the body signal feel a little easier to notice?',
      rewardStamp: 'softened',
      tooMuchFallbackActionId: 'name-loop',
    },
    memory: {
      storeAnswers: true,
      weeklyReflectionRole: 'early_cue_practice',
      positiveOutcomeWeight: 2,
    },
    assets: {
      imageKey: 'actionBodyScan',
      rewardImageKey: null,
      animationKey: null,
    },
  },
  {
    schemaVersion: 'action_definition_v1',
    id: 'name-loop',
    title: 'Name the Loop',
    shortTitle: 'Name the Loop',
    estimatedMinutes: 1,
    family: 'labeling',
    primaryNeed: 'name_loop',
    burdenLevel: 'very_low',
    tone: 'gentle',
    reason: 'This helps when a thread is just starting and needs a kind, ordinary name.',
    reasonTemplate: 'Use when a pattern is early, uncertain, or needs a lighter step.',
    description: 'Give the pattern a gentle name so it becomes easier to notice next time.',
    image: actionAssets.actionNameLoop,
    fits: {
      stages: ['daily_action', 'possible_thread', 'possible_loop', 'lighter_step_after_too_much'],
      traceSignalKeys: ['overthinking', 'self_blame', 'chest_tightness', 'head_pressure'],
      bodySignalKeys: ['chest_tightness', 'head_pressure', 'stomach_tightness'],
      thoughtFormKeys: ['replaying_thought', 'self_blame', 'worry'],
      triggerKeys: ['work_feedback', 'work_message'],
    },
    avoidWhen: {
      ...actionAvoidWhen,
      recentHelpfulness: [],
    },
    steps: [
      {
        key: 'notice',
        title: 'Notice',
        prompt: 'What keeps repeating?',
        detailPrompt: 'Pick the smallest pattern you can name.',
        placeholder: 'Example: replaying feedback after work.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepNameIt,
        imageKey: 'stepNameIt',
      },
      {
        key: 'name_it',
        title: 'Name it',
        prompt: 'What could you call this loop?',
        detailPrompt: 'Use a kind, ordinary name.',
        placeholder: 'Example: the replay loop.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.actionNameLoop,
        imageKey: 'actionNameLoop',
      },
      {
        key: 'spot_early',
        title: 'Early sign',
        prompt: 'How might you spot it earlier?',
        detailPrompt: 'Name one early body or thought signal.',
        placeholder: 'Example: chest tightness after a message.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepBreatheNoticeBody,
        imageKey: 'stepBreatheNoticeBody',
      },
    ],
    completion: {
      helpfulnessPrompt: 'Did naming it make the pattern easier to notice?',
      rewardStamp: 'named_it',
      tooMuchFallbackActionId: null,
    },
    memory: {
      storeAnswers: true,
      weeklyReflectionRole: 'loop_labeling',
      positiveOutcomeWeight: 1,
    },
    assets: {
      imageKey: 'actionNameLoop',
      rewardImageKey: null,
      animationKey: null,
    },
  },
  {
    schemaVersion: 'action_definition_v1',
    id: 'tiny-next-step',
    title: 'One Tiny Next Step',
    shortTitle: 'Tiny Next Step',
    estimatedMinutes: 2,
    family: 'behavioral',
    primaryNeed: 'tiny_next_step',
    burdenLevel: 'low',
    tone: 'gentle',
    reason: 'This helps when the next move needs to be small enough to actually start.',
    reasonTemplate: 'Use when replaying needs a small next move instead of more thinking.',
    description: 'Choose one action small enough that starting does not become another task.',
    image: actionAssets.actionTinyNextStep,
    fits: {
      stages: ['daily_action', 'possible_thread', 'possible_loop', 'micro_win_followup'],
      traceSignalKeys: ['overthinking', 'stuck', 'work_feedback'],
      bodySignalKeys: [],
      thoughtFormKeys: ['replaying_thought', 'worry'],
      triggerKeys: ['work_feedback', 'work_message'],
    },
    avoidWhen: actionAvoidWhen,
    steps: [
      {
        key: 'want',
        title: 'Want',
        prompt: 'What would help a little?',
        detailPrompt: 'Name the direction, not the whole plan.',
        placeholder: 'Example: ask one clarifying question.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepChooseOneSmallStep,
        imageKey: 'stepChooseOneSmallStep',
      },
      {
        key: 'small_step',
        title: 'Small step',
        prompt: 'What is the tiniest version?',
        detailPrompt: 'Shrink it until it feels almost too small.',
        placeholder: 'Example: write the first sentence.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'when',
        title: 'When',
        prompt: 'When could you do it?',
        detailPrompt: 'Pick a nearby moment.',
        placeholder: 'Example: after lunch, before opening Slack.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepNameIt,
        imageKey: 'stepNameIt',
      },
    ],
    completion: {
      helpfulnessPrompt: 'Did this make the next moment feel a little more doable?',
      rewardStamp: 'noticed',
      tooMuchFallbackActionId: 'name-loop',
    },
    memory: {
      storeAnswers: true,
      weeklyReflectionRole: 'behavioral_nudge',
      positiveOutcomeWeight: 2,
    },
    assets: {
      imageKey: 'actionTinyNextStep',
      rewardImageKey: null,
      animationKey: null,
    },
  },
  {
    schemaVersion: 'action_definition_v1',
    id: 'evening-unload',
    title: 'Evening Unload List',
    shortTitle: 'Evening Unload',
    estimatedMinutes: 3,
    family: 'reflection',
    primaryNeed: 'unload',
    burdenLevel: 'medium',
    tone: 'reflective',
    reason: 'This helps when a thread needs somewhere to wait before sleep.',
    reasonTemplate: 'Use when unfinished thoughts need to be parked before rest.',
    description: 'Move the unfinished parts of the day out of your head and onto a small list.',
    image: actionAssets.actionEveningUnload,
    fits: {
      stages: ['daily_action', 'familiar_loop'],
      traceSignalKeys: ['overthinking', 'short_sleep', 'unfinished'],
      bodySignalKeys: ['tired_heavy'],
      thoughtFormKeys: ['replaying_thought', 'worry'],
      triggerKeys: ['work_feedback', 'work_message'],
    },
    avoidWhen: actionAvoidWhen,
    steps: [
      {
        key: 'unfinished',
        title: 'Unfinished',
        prompt: 'What is still open?',
        detailPrompt: 'List the thought that keeps returning.',
        placeholder: 'Example: tomorrow’s meeting.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'park',
        title: 'Park it',
        prompt: 'Where can it wait?',
        detailPrompt: 'Choose a place or time to return to it.',
        placeholder: 'Example: notes app tomorrow morning.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.actionEveningUnload,
        imageKey: 'actionEveningUnload',
      },
      {
        key: 'enough',
        title: 'Enough',
        prompt: 'What is enough for tonight?',
        detailPrompt: 'Give your mind a stopping line.',
        placeholder: 'Example: I wrote it down. I can stop for now.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepBreatheNoticeBody,
        imageKey: 'stepBreatheNoticeBody',
      },
    ],
    completion: {
      helpfulnessPrompt: 'Did this help the thought feel parked for now?',
      rewardStamp: 'parked',
      tooMuchFallbackActionId: 'name-loop',
    },
    memory: {
      storeAnswers: true,
      weeklyReflectionRole: 'evening_release',
      positiveOutcomeWeight: 2,
    },
    assets: {
      imageKey: 'actionEveningUnload',
      rewardImageKey: null,
      animationKey: null,
    },
  },
  {
    schemaVersion: 'action_definition_v1',
    id: 'kind-reframe',
    title: 'Kind Reframe',
    shortTitle: 'Kind Reframe',
    estimatedMinutes: 2,
    family: 'self_compassion',
    primaryNeed: 'reframe',
    burdenLevel: 'low',
    tone: 'kind',
    reason: 'This helps when the thread includes a harsher story about yourself.',
    reasonTemplate: 'Use when self-blame needs a kinder sentence that is still honest.',
    description: 'Try a softer sentence that is still honest.',
    image: actionAssets.actionKindReframe,
    fits: {
      stages: ['daily_action', 'possible_loop', 'familiar_loop'],
      traceSignalKeys: ['self_blame', 'overthinking'],
      bodySignalKeys: [],
      thoughtFormKeys: ['self_blame'],
      triggerKeys: ['work_feedback', 'work_message'],
    },
    avoidWhen: actionAvoidWhen,
    steps: [
      {
        key: 'harsh_line',
        title: 'Harsh line',
        prompt: 'What did your mind say?',
        detailPrompt: 'Write the self-critical line as-is.',
        placeholder: 'Example: I always mess this up.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepWorry,
        imageKey: 'stepWorry',
      },
      {
        key: 'true_part',
        title: 'True part',
        prompt: 'What part is actually true?',
        detailPrompt: 'Keep the truth, drop the punishment.',
        placeholder: 'Example: I felt unsure in that moment.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'kind_line',
        title: 'Kind line',
        prompt: 'What is a kinder version?',
        detailPrompt: 'Make it something you could say to a friend.',
        placeholder: 'Example: I can learn from this without attacking myself.',
        inputKind: 'short_text',
        optional: false,
        image: actionAssets.actionKindReframe,
        imageKey: 'actionKindReframe',
      },
    ],
    completion: {
      helpfulnessPrompt: 'Did this make the self-talk feel a little kinder?',
      rewardStamp: 'kind_shift',
      tooMuchFallbackActionId: 'name-loop',
    },
    memory: {
      storeAnswers: true,
      weeklyReflectionRole: 'self_compassion',
      positiveOutcomeWeight: 2,
    },
    assets: {
      imageKey: 'actionKindReframe',
      rewardImageKey: null,
      animationKey: null,
    },
  },
];

export const actionDefinitionById = actionDefinitions.reduce(
  (definitions, action) => ({
    ...definitions,
    [action.id]: action,
  }),
  {} as Record<ActionId, ActionDefinition>,
);

export const fallbackActionId: ActionId = 'fact-guess-worry-split';

export function isActionId(value: string): value is ActionId {
  return value in actionDefinitionById;
}

export function getActionDefinition(actionId: ActionId) {
  return actionDefinitionById[actionId] || actionDefinitionById[fallbackActionId];
}

export function getActionImage(actionId: ActionId) {
  return getActionDefinition(actionId).image;
}

export function getEmptyActionAnswers(action: ActionDefinition): ActionAnswers {
  return action.steps.reduce(
    (answers, step) => ({
      ...answers,
      [step.key]: '',
    }),
    {} as ActionAnswers,
  );
}

export const browseActionOptions: BrowseAction[] = actionDefinitions.map((action) => ({
  id: action.id,
  title: action.title,
  description: action.description,
  duration: `${action.estimatedMinutes} min`,
  image: action.image,
}));
