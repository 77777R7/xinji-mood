import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { Feather } from '@expo/vector-icons';
import type { ActionFeedbackSignal, ActionRecommendationMode } from '../trace/dataFoundation';

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

export type ActionStepOption = {
  id: string;
  label: string;
  value?: string;
  followupPlaceholder?: string;
};

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
  inputKind: 'short_text' | 'long_text' | 'single_choice' | 'multi_choice' | 'none';
  options?: ActionStepOption[];
  allowOptionalNote?: boolean;
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
    recentHelpfulness: ActionFeedbackSignal[];
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
  recentHelpfulness: ['too_much'] as ActionFeedbackSignal[],
  contraindicationSignalKeys: ['self_harm_language', 'crisis_language'],
};

const bodyLocationOptions: ActionStepOption[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'stomach', label: 'Stomach' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'head', label: 'Head' },
  { id: 'whole_body', label: 'Whole body' },
  { id: 'not_sure', label: 'Not sure' },
];

const softenOptions: ActionStepOption[] = [
  { id: 'unclench_jaw', label: 'Unclench jaw' },
  { id: 'drop_shoulders', label: 'Drop shoulders' },
  { id: 'sit_back', label: 'Sit back' },
  { id: 'sip_water', label: 'Sip water' },
  { id: 'look_away', label: 'Look away' },
  { id: 'one_exhale', label: 'One slow exhale' },
];

const tinyDirectionOptions: ActionStepOption[] = [
  { id: 'ask', label: 'Ask' },
  { id: 'write', label: 'Write' },
  { id: 'rest', label: 'Rest' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'pause', label: 'Pause' },
  { id: 'clean_up', label: 'Clean up' },
];

const loopNicknameOptions: ActionStepOption[] = [
  { id: 'feedback_echo', label: 'Feedback Echo' },
  { id: 'too_many_guesses', label: 'Too Many Guesses' },
  { id: 'body_alarm', label: 'Body Alarm' },
  { id: 'replay_loop', label: 'Replay Loop' },
];

const earlyCueOptions: ActionStepOption[] = [
  { id: 'chest_tightness', label: 'Chest tightness' },
  { id: 'stomach_tightness', label: 'Stomach tightness' },
  { id: 'head_pressure', label: 'Head pressure' },
  { id: 'shoulders', label: 'Shoulders tense' },
  { id: 'thought_replay', label: 'Thought replay' },
  { id: 'not_sure', label: 'Not sure yet' },
];

const eveningParkingOptions: ActionStepOption[] = [
  { id: 'tomorrow_notes', label: 'Tomorrow notes' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'after_sleep', label: 'After sleep' },
  { id: 'not_mine_tonight', label: 'Not mine tonight' },
];

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
        detailPrompt: 'Write only the parts you know happened. Later, Rora can prefill this for you to confirm.',
        placeholder: 'Example: My manager asked one follow-up question.',
        inputKind: 'short_text',
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'guess',
        title: 'Guess',
        prompt: 'What am I assuming?',
        detailPrompt: 'Name the story your mind is filling in. Keep it short; this is not a full journal entry.',
        placeholder: 'Example: I am assuming they think I did badly.',
        inputKind: 'short_text',
        allowOptionalNote: true,
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
        allowOptionalNote: true,
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
    description: 'Notice the body cue before trying to solve the whole loop.',
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
        detailPrompt: 'Tap done when you have taken two slower breaths.',
        placeholder: 'Optional: what changed after two breaths?',
        inputKind: 'none',
        options: [{ id: 'done', label: 'Done' }],
        allowOptionalNote: true,
        optional: true,
        image: actionAssets.stepBreatheNoticeBody,
        imageKey: 'stepBreatheNoticeBody',
      },
      {
        key: 'body_notice',
        title: 'Notice',
        prompt: 'Where is it strongest?',
        detailPrompt: 'Name the body signal without trying to fix it.',
        placeholder: 'Optional: add one word about the body cue.',
        inputKind: 'single_choice',
        options: bodyLocationOptions,
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'soften',
        title: 'Soften',
        prompt: 'What would feel 5% easier?',
        detailPrompt: 'Choose one tiny physical adjustment.',
        placeholder: 'Optional: add what changed.',
        inputKind: 'single_choice',
        options: softenOptions,
        allowOptionalNote: true,
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
    description: 'Give the pattern a small nickname so Rora can recognize it with you next time.',
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
        detailPrompt: 'Choose the piece that feels most familiar today.',
        placeholder: 'Optional: add your own repeating piece.',
        inputKind: 'single_choice',
        options: [
          { id: 'feedback_replay', label: 'Feedback replay' },
          { id: 'too_many_guesses', label: 'Too many guesses' },
          { id: 'body_signal_first', label: 'Body signal first' },
          { id: 'self_blame', label: 'Self-blame' },
        ],
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.stepNameIt,
        imageKey: 'stepNameIt',
      },
      {
        key: 'name_it',
        title: 'Nickname',
        prompt: 'What could you call this loop?',
        detailPrompt: 'Pick one Rora can remember lightly.',
        placeholder: 'Optional: write your own nickname.',
        inputKind: 'single_choice',
        options: loopNicknameOptions,
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.actionNameLoop,
        imageKey: 'actionNameLoop',
      },
      {
        key: 'spot_early',
        title: 'Early sign',
        prompt: 'How might you spot it earlier?',
        detailPrompt: 'Choose one cue Rora should watch with you.',
        placeholder: 'Optional: add your own early sign.',
        inputKind: 'single_choice',
        options: earlyCueOptions,
        allowOptionalNote: true,
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
        title: 'Direction',
        prompt: 'What direction would help a little?',
        detailPrompt: 'Choose the direction, not the whole plan.',
        placeholder: 'Optional: add your own direction.',
        inputKind: 'single_choice',
        options: tinyDirectionOptions,
        allowOptionalNote: true,
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
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'first_30_seconds',
        title: 'First 30 seconds',
        prompt: 'What is the first 30-second version?',
        detailPrompt: 'Make the start smaller than you think.',
        placeholder: 'Example: open the draft and write one line.',
        inputKind: 'short_text',
        allowOptionalNote: true,
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
    description: 'Close one mental tab so the unfinished thought has somewhere to wait tonight.',
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
        detailPrompt: 'Choose the kind of open tab. You can add words only if you want.',
        placeholder: 'Optional: name the open tab.',
        inputKind: 'single_choice',
        options: [
          { id: 'work_tab', label: 'Work tab' },
          { id: 'message_tab', label: 'Message tab' },
          { id: 'decision_tab', label: 'Decision tab' },
          { id: 'tomorrow_tab', label: 'Tomorrow tab' },
        ],
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'park',
        title: 'Park it',
        prompt: 'Where can it wait?',
        detailPrompt: 'Choose a place or time to return to it.',
        placeholder: 'Optional: add the exact place.',
        inputKind: 'single_choice',
        options: eveningParkingOptions,
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.actionEveningUnload,
        imageKey: 'actionEveningUnload',
      },
      {
        key: 'enough',
        title: 'Enough',
        prompt: 'What is enough for tonight?',
        detailPrompt: 'Pick a stopping line for tonight.',
        placeholder: 'Optional: write your own stopping line.',
        inputKind: 'single_choice',
        options: [
          { id: 'i_wrote_it_down', label: 'I wrote it down.' },
          { id: 'tomorrow_can_hold_it', label: 'Tomorrow can hold it.' },
          { id: 'enough_for_tonight', label: 'Enough for tonight.' },
          { id: 'not_solving_now', label: 'Not solving this now.' },
        ],
        allowOptionalNote: true,
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
    title: 'Say It Less Harshly',
    shortTitle: 'Less Harsh Line',
    estimatedMinutes: 2,
    family: 'self_compassion',
    primaryNeed: 'reframe',
    burdenLevel: 'low',
    tone: 'kind',
    reason: 'This helps when the thread includes a harsher story about yourself.',
    reasonTemplate: 'Use when self-blame needs a less harsh sentence that is still honest.',
    description: 'Keep the truth, but take out the attack.',
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
        detailPrompt: 'Pick the shape of the self-critical line, or add your own.',
        placeholder: 'Optional: write the line as-is.',
        inputKind: 'single_choice',
        options: [
          { id: 'i_messed_up', label: 'I messed up.' },
          { id: 'i_should_know', label: 'I should know better.' },
          { id: 'they_are_upset', label: 'They are upset with me.' },
          { id: 'i_am_behind', label: 'I am behind.' },
        ],
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.stepWorry,
        imageKey: 'stepWorry',
      },
      {
        key: 'true_part',
        title: 'True part',
        prompt: 'What part is actually true?',
        detailPrompt: 'Keep the truth, drop the punishment.',
        placeholder: 'Optional: add the true part.',
        inputKind: 'single_choice',
        options: [
          { id: 'i_felt_unsure', label: 'I felt unsure.' },
          { id: 'i_need_clarity', label: 'I need clarity.' },
          { id: 'i_missed_a_piece', label: 'I missed a piece.' },
          { id: 'i_am_learning', label: 'I am learning.' },
        ],
        allowOptionalNote: true,
        optional: false,
        image: actionAssets.stepFact,
        imageKey: 'stepFact',
      },
      {
        key: 'less_harsh_line',
        title: 'Less harsh line',
        prompt: 'How can you say the true part without attacking yourself?',
        detailPrompt: 'Choose a line that feels believable, not falsely positive.',
        placeholder: 'Optional: write your own less harsh line.',
        inputKind: 'single_choice',
        options: [
          { id: 'can_learn', label: 'I can learn from this.' },
          { id: 'need_one_clarifier', label: 'I need one clarifier.' },
          { id: 'not_all_on_me', label: 'This is not all on me.' },
          { id: 'one_next_step', label: 'One next step is enough.' },
        ],
        allowOptionalNote: true,
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
