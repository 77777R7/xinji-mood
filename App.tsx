import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from 'react-native';
import Svg, {
  Circle,
  Line as SvgLine,
  Path as SvgPath,
  Polygon as SvgPolygon,
} from 'react-native-svg';
import {
  buildNormalizedTraceFields,
  buildHelpfulnessMemory,
  buildLoopSignaturesFromTraces,
  buildMoodTraceRecord,
  buildWeeklyReflectionPreview,
  createActionMemoryEntry,
  getLoopIdentityKey,
  getLoopPatternRuleState,
  hydrateActionMemoryEntry,
  hydrateMoodTraceRecord,
  type ActionHelpfulnessSignal,
  type ActionMemoryEntry,
  type ActionRecommendationMode,
  type BodySignalDayItem,
  type HelpfulnessMemory,
  type LoopPatternRuleState,
  type LoopSignature,
  type MoodTraceRecord,
  type WeeklyReflectionPreview,
  buildBodySignalDaysFromTraces,
  buildBodySignalSummary,
  buildFinalTraceResultFromReview,
  getBodySignalSortRank,
  getConfirmedBodySignalLabels,
  getTraceIconPlainLabel,
} from './src/trace/dataFoundation';
import {
  requestMoodPromptSpeech,
  runOpenAiTraceExtraction,
  runOpenAiWeeklyReflection,
  type AiTraceExtractionResponse,
  type MoodAiSpeechResponse,
} from './src/trace/aiTraceExtraction';
import {
  noticingContentByState,
  startingFocusTraceResult,
  todayTraceContent,
} from './src/trace/mockTrace';
import { traceIconDictionary } from './src/trace/traceIconDictionary';
import type { MockTraceResult, NoticingState, TraceExtraction, TraceIconKey } from './src/trace/types';
import {
  browseActionOptions,
  fallbackActionId,
  getActionDefinition,
  getActionImage,
  getEmptyActionAnswers,
  isActionId,
  type ActionAnswerKey,
  type ActionAnswers,
  type ActionDefinition,
  type ActionId,
  type RecommendedAction,
  type WhatHelpedAction,
} from './src/actions/actionLibrary';
import {
  getBestPositiveHelpfulnessMemoryForLoop,
  getRuleBasedRecommendedAction,
} from './src/actions/actionRecommendation';
import { getActionRewardCompletionCopy } from './src/actions/actionRewardCopy';

const assets = {
  paper: require('./assets/figma/today/paper-bg.png'),
  hero: require('./assets/figma/today/hero-heart.png'),
  todayHeroWeekAMonday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-a-monday-app.png'),
  todayHeroWeekATuesday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-a-tuesday-app.png'),
  todayHeroWeekAWednesday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-a-wednesday-app.png'),
  todayHeroWeekAThursday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-a-thursday-app.png'),
  todayHeroWeekAFriday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-a-friday-app.png'),
  todayHeroWeekASaturday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-a-saturday-app.png'),
  todayHeroWeekASunday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-a-sunday-app.png'),
  todayHeroWeekBMonday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-b-monday-app.png'),
  todayHeroWeekBTuesday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-b-tuesday-app.png'),
  todayHeroWeekBWednesday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-b-wednesday-app.png'),
  todayHeroWeekBThursday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-b-thursday-app.png'),
  todayHeroWeekBFriday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-b-friday-app.png'),
  todayHeroWeekBSaturday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-b-saturday-app.png'),
  todayHeroWeekBSunday: require('./assets/figma/today/daily-heroes/app-ready/today-hero-week-b-sunday-app.png'),
  actionGreenCard: require('./assets/figma/today/action-green-pulp-card.png'),
  actionIntroMascot: require('./assets/figma/today/action-heart-left-leaf-spaced-v1.png'),
  actionLeafSprig: require('./assets/figma/today/action-leaf-sprig-pulp-floating-v1.png'),
  actionFgwSplit: require('./assets/figma/today/action-icons-v1/action-fgw-split-v1.png'),
  actionBodyScan: require('./assets/figma/today/action-icons-v1/action-body-scan-v1.png'),
  actionNameLoop: require('./assets/figma/today/action-icons-v1/action-name-loop-v1.png'),
  actionTinyNextStep: require('./assets/figma/today/action-icons-v1/action-tiny-next-step-v1.png'),
  actionEveningUnload: require('./assets/figma/today/action-icons-v1/action-evening-unload-v1.png'),
  actionKindReframe: require('./assets/figma/today/action-icons-v1/action-kind-reframe-v1.png'),
  stepFact: require('./assets/figma/today/action-step-icons-v1/step-fact-v2.png'),
  stepGuess: require('./assets/figma/today/action-step-icons-v1/step-guess-v1.png'),
  stepWorry: require('./assets/figma/today/action-step-icons-v1/step-worry-v1.png'),
  stepBreatheNoticeBody: require('./assets/figma/today/action-step-icons-v1/step-breathe-notice-body-v1.png'),
  stepNameIt: require('./assets/figma/today/action-step-icons-v1/step-name-it-v1.png'),
  stepChooseOneSmallStep: require('./assets/figma/today/action-step-icons-v1/step-choose-one-small-step-v1.png'),
  feedbackHelped: require('./assets/figma/today/action-feedback-icons-v1/feedback-helped-v1.png'),
  feedbackHelpedALittle: require('./assets/figma/today/action-feedback-icons-v1/feedback-helped-a-little-v1.png'),
  feedbackNotToday: require('./assets/figma/today/action-feedback-icons-v1/feedback-not-today-v1.png'),
  feedbackTooMuch: require('./assets/figma/today/action-feedback-icons-v1/feedback-too-much-v1.png'),
  weeklyWhatShifted: require('./assets/figma/today/weekly-reflection-icons-v1/weekly-what-shifted-v1.png'),
  weeklyWhatHelped: require('./assets/figma/today/weekly-reflection-icons-v1/weekly-what-helped-v1.png'),
  moodCalm: require('./assets/figma/today/ui-icons/mood-calm-face-ui.png'),
  moodDown: require('./assets/figma/today/ui-icons/mood-down-face-ui.png'),
  moodSad: require('./assets/figma/today/ui-icons/mood-sad-face-ui.png'),
  moodIrritable: require('./assets/figma/today/ui-icons/mood-irritable-face-ui.png'),
  bodyStomach: require('./assets/figma/today/ui-icons/body-stomach-ui.png'),
  bodyChest: require('./assets/figma/today/ui-icons/body-chest-ui.png'),
  bodyHead: require('./assets/figma/today/ui-icons/body-head-ui.png'),
  bodyNeckShoulder: require('./assets/figma/today/ui-icons/body-neck-shoulder-ui.png'),
  bodyTired: require('./assets/figma/today/ui-icons/body-tired-ui.png'),
  bodyNotSure: require('./assets/figma/today/ui-icons/body-not-sure-ui.png'),
  recordMic: require('./assets/figma/today/ui-icons/record-mic-ui.png'),
  draftReviewMascot: require('./assets/figma/today/draft-review/trace-stack-mascot-v2.png'),
  moodAiMark: require('./assets/figma/today/draft-review/loading-v1/mood-ai-mark-v2.png'),
  moodThinkingMascot: require('./assets/figma/today/draft-review/loading-v1/mood-thinking-mascot-v2.png'),
  draftTraceSummary: require('./assets/figma/today/draft-review/trace-stack-icons-v1/trace-summary-v1.png'),
  draftTraceFeeling: require('./assets/figma/today/draft-review/trace-stack-icons-v1/trace-feeling-v1.png'),
  draftTraceBody: require('./assets/figma/today/draft-review/trace-stack-icons-v1/trace-body-v1.png'),
  draftTraceContext: require('./assets/figma/today/draft-review/trace-stack-icons-v1/trace-context-v1.png'),
  draftTraceThought: require('./assets/figma/today/draft-review/trace-stack-icons-v1/trace-thought-v1.png'),
  draftTraceNeed: require('./assets/figma/today/draft-review/trace-stack-icons-v1/trace-need-v1.png'),
  draftTraceResponse: require('./assets/figma/today/draft-review/trace-stack-icons-v1/trace-response-v1.png'),
  weeklyReportBook: require('./assets/figma/today/patterns/weekly-report-book.png'),
  loopArrowDown: require('./assets/figma/today/patterns/loop-arrow-down.png'),
  roraLearningMascot: require('./assets/figma/today/patterns/rora-learning-mascot-v1.png'),
  roraThreadDiscoveryMascot: require('./assets/figma/today/patterns/rora-thread-discovery-mascot-v1.png'),
  traceWorkFeedback: require('./assets/figma/today/trace-icons-v1/trace-work-feedback.png'),
  traceOverthinking: require('./assets/figma/today/trace-icons-v1/trace-overthinking.png'),
  traceShortSleep: require('./assets/figma/today/trace-icons-v1/trace-short-sleep.png'),
  traceTiredHeavy: require('./assets/figma/today/trace-icons-v1/trace-tired-heavy.png'),
};

type TodayHeroVariant = {
  title: string;
  weekday: string;
  image: ImageSourcePropType;
  imageStyle: {
    right: number;
    top: number;
    width: number;
    height: number;
  };
};

const todayHeroVariants: TodayHeroVariant[] = [
  {
    title: 'Nothing needs to be fixed right now.',
    weekday: 'Monday',
    image: assets.todayHeroWeekAMonday,
    imageStyle: { right: 2, top: 18, width: 143, height: 128 },
  },
  {
    title: 'What feels present today?',
    weekday: 'Tuesday',
    image: assets.todayHeroWeekATuesday,
    imageStyle: { right: 4, top: 10, width: 138, height: 154 },
  },
  {
    title: 'Your body may already have a clue.',
    weekday: 'Wednesday',
    image: assets.todayHeroWeekAWednesday,
    imageStyle: { right: 4, top: 8, width: 139, height: 158 },
  },
  {
    title: 'There is room for what stayed with you.',
    weekday: 'Thursday',
    image: assets.todayHeroWeekAThursday,
    imageStyle: { right: 4, top: 18, width: 138, height: 132 },
  },
  {
    title: 'You do not have to carry all of it forward.',
    weekday: 'Friday',
    image: assets.todayHeroWeekAFriday,
    imageStyle: { right: 4, top: 12, width: 138, height: 154 },
  },
  {
    title: 'A slower check-in is still a check-in.',
    weekday: 'Saturday',
    image: assets.todayHeroWeekASaturday,
    imageStyle: { right: 2, top: 20, width: 135, height: 128 },
  },
  {
    title: 'Let the week settle for a moment.',
    weekday: 'Sunday',
    image: assets.todayHeroWeekASunday,
    imageStyle: { right: -4, top: 14, width: 158, height: 142 },
  },
  {
    title: 'One small thread is enough to begin.',
    weekday: 'Monday',
    image: assets.todayHeroWeekBMonday,
    imageStyle: { right: 8, top: 18, width: 150, height: 132 },
  },
  {
    title: 'What did you notice, even quietly?',
    weekday: 'Tuesday',
    image: assets.todayHeroWeekBTuesday,
    imageStyle: { right: 10, top: 18, width: 124, height: 142 },
  },
  {
    title: 'Let’s notice one small thing together.',
    weekday: 'Wednesday',
    image: assets.todayHeroWeekBWednesday,
    imageStyle: { right: -1, top: 18, width: 146, height: 134 },
  },
  {
    title: 'Let’s look gently at what is here.',
    weekday: 'Thursday',
    image: assets.todayHeroWeekBThursday,
    imageStyle: { right: 4, top: 12, width: 138, height: 154 },
  },
  {
    title: 'Something can be named, then set down.',
    weekday: 'Friday',
    image: assets.todayHeroWeekBFriday,
    imageStyle: { right: 4, top: 12, width: 138, height: 154 },
  },
  {
    title: 'You can meet today softly.',
    weekday: 'Saturday',
    image: assets.todayHeroWeekBSaturday,
    imageStyle: { right: 8, top: 22, width: 142, height: 128 },
  },
  {
    title: 'Make a little space for yourself.',
    weekday: 'Sunday',
    image: assets.todayHeroWeekBSunday,
    imageStyle: { right: 12, top: 10, width: 128, height: 148 },
  },
];

const todayHeroAnchorDate = new Date(2026, 5, 15);
const dayInMs = 24 * 60 * 60 * 1000;

function getLocalDayTimestamp(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function getTodayHeroVariant(date = new Date()) {
  const daysSinceAnchor = Math.floor(
    (getLocalDayTimestamp(date) - getLocalDayTimestamp(todayHeroAnchorDate)) / dayInMs,
  );
  const variantIndex =
    ((daysSinceAnchor % todayHeroVariants.length) + todayHeroVariants.length) %
    todayHeroVariants.length;

  return todayHeroVariants[variantIndex];
}

type MoodItem = {
  label: string;
  image: ImageSourcePropType;
};

type BodyItem = {
  label: string;
  image: ImageSourcePropType;
};

type ReflectionInputMode = 'type' | 'speak' | 'cue';
type ReflectionReviewStep = 'capture' | 'recording' | 'transcribing' | 'thinking' | 'review' | 'safety' | 'error';
type ActiveTab = 'today' | 'patterns' | 'actions' | 'me';
type ActionView = 'list' | 'detail' | 'browse';
type MoodChartView = 'shape' | 'timeline';
type ActionRunState = 'idle' | 'started' | 'completed';
type ActionHelpfulness = ActionHelpfulnessSignal;
type MoodMemorySnapshot = {
  schemaVersion: number;
  savedAt: string;
  traces: MoodTraceRecord[];
  loopSignatures: LoopSignature[];
  actionMemory: ActionMemoryEntry[];
  helpfulnessMemory: HelpfulnessMemory[];
  weeklyReflectionPreview: WeeklyReflectionPreview;
};
type PatternMilestoneId = 'thread' | 'loop_action';
type PatternConfettiPiece = {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  radius: number;
  driftX: number;
  fallY: number;
  rotate: string;
  delay: number;
};
type DevSeedScenario = 'clear' | 'learning' | 'possible-thread' | 'loop-action' | 'action-memory';
type MoodSummaryItem = {
  label: string;
  color: string;
  count: number;
  percent: number;
};
type MoodTimelinePoint = {
  id: string;
  day: string;
  dayNumber: string;
  dateLabel: string;
  moodLabel: string | null;
  moodLevel: number | null;
  color: string | null;
};

function getTraceStackIconSource(label: string): ImageSourcePropType {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('feeling') || normalizedLabel.includes('mood')) {
    return assets.draftTraceFeeling;
  }

  if (normalizedLabel.includes('body') || normalizedLabel.includes('chest') || normalizedLabel.includes('signal')) {
    return assets.draftTraceBody;
  }

  if (
    normalizedLabel.includes('context') ||
    normalizedLabel.includes('trigger') ||
    normalizedLabel.includes('work') ||
    normalizedLabel.includes('situation')
  ) {
    return assets.draftTraceContext;
  }

  if (
    normalizedLabel.includes('thought') ||
    normalizedLabel.includes('worry') ||
    normalizedLabel.includes('guess') ||
    normalizedLabel.includes('self')
  ) {
    return assets.draftTraceThought;
  }

  if (normalizedLabel.includes('need')) {
    return assets.draftTraceNeed;
  }

  if (normalizedLabel.includes('behavior') || normalizedLabel.includes('response')) {
    return assets.draftTraceResponse;
  }

  return assets.draftTraceSummary;
}

function getDraftReviewSummary(response: AiTraceExtractionResponse | null) {
  const summary = response?.traceDraft.summaryOneLiner?.trim().replace(/^[\s.。,:;]+/, '');
  const fields = response?.traceDraft.fields || [];
  const fieldValue = (label: string) =>
    fields.find((field) => field.label.toLowerCase().includes(label))?.value.trim() || '';
  const feeling = fieldValue('feeling').toLowerCase();
  const context = fieldValue('context').toLowerCase();
  const thought = fieldValue('thought').toLowerCase();

  if (
    feeling.includes('calm') &&
    (context.includes('work') || thought.includes('work')) &&
    (thought.includes('replay') || thought.includes('linger') || thought.includes('stayed') || thought.includes('work'))
  ) {
    return 'Calm, with a work thought still replaying.';
  }

  if (summary) {
    const normalizedSummary = summary.toLowerCase();

    if (
      normalizedSummary.includes('work') &&
      (normalizedSummary.includes('stayed') ||
        normalizedSummary.includes('present') ||
        normalizedSummary.includes('sitting') ||
        normalizedSummary.includes('lingering') ||
        normalizedSummary.includes('replay'))
    ) {
      return normalizedSummary.includes('calm')
        ? 'Calm, with a work thought still replaying.'
        : 'A work thought still replaying.';
    }

    return summary;
  }

  const reflection = response?.warmReflection.text?.trim().replace(/^[\s.。,:;]+/, '');

  if (reflection) {
    return reflection;
  }

  return 'Here’s a gentle draft of this trace.';
}

function getDraftExtractionSortRank(label: string) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('feeling') || normalizedLabel.includes('mood')) return 0;
  if (normalizedLabel.includes('body') || normalizedLabel.includes('chest')) return 1;
  if (normalizedLabel.includes('context') || normalizedLabel.includes('trigger')) return 2;
  if (normalizedLabel.includes('thought') || normalizedLabel.includes('worry')) return 3;
  if (normalizedLabel.includes('need')) return 4;
  if (normalizedLabel.includes('response') || normalizedLabel.includes('behavior')) return 5;

  return 6;
}

function normalizeDraftReviewExtractionItem(item: TraceExtraction): TraceExtraction {
  const normalizedLabel = item.label.toLowerCase();
  const normalizedValue = item.value.toLowerCase();
  let label = item.label;
  let value = item.value;

  if (normalizedLabel.includes('body') || normalizedLabel.includes('chest')) {
    label = 'Body signal';
  }

  if (normalizedLabel.includes('context') && normalizedValue.includes('work')) {
    value = 'Work';
  }

  if (
    normalizedLabel.includes('thought') &&
    (normalizedValue.includes('lingering') ||
      normalizedValue.includes('work thought') ||
      normalizedValue.includes('replay') ||
      normalizedValue.includes('stayed'))
  ) {
    value = 'A work thought kept replaying';
  }

  return { label, value };
}

const MOOD_MEMORY_STORAGE_KEY = 'mood.memory.v1';
const PATTERN_MILESTONES_STORAGE_KEY = 'mood.patternMilestonesSeen.v1';

const moodItems: MoodItem[] = [
  { label: 'Calm', image: assets.moodCalm },
  { label: 'Down', image: assets.moodDown },
  { label: 'Sad', image: assets.moodSad },
  { label: 'Irritable', image: assets.moodIrritable },
];

const moodChartColors: Record<string, string> = {
  Calm: '#7f8d50',
  Down: '#9fb9cf',
  Sad: '#f17a4b',
  Irritable: '#f0bd42',
};

const moodChartLevels: Record<string, number> = {
  Calm: 4,
  Down: 3,
  Sad: 2,
  Irritable: 1,
};

const bodyItems: BodyItem[] = [
  { label: 'Stomach\ntightness', image: assets.bodyStomach },
  { label: 'Chest tightness', image: assets.bodyChest },
  { label: 'Head pressure', image: assets.bodyHead },
  { label: 'Neck / shoulder\ntension', image: assets.bodyNeckShoulder },
  { label: 'Tired / heavy', image: assets.bodyTired },
  { label: 'Not sure', image: assets.bodyNotSure },
];

const repeatingLoopChain: TraceIconKey[] = [
  'short_sleep',
  'work_feedback',
  'self_blame',
  'overthinking',
  'stomach_tightness',
];

const voiceWaveBars = [
  2, 2, 3, 2, 2, 3, 2, 2, 4, 2, 3, 2, 2, 5, 3, 4, 18, 8, 14, 7, 22, 10, 30, 12,
  20, 9, 26, 16, 34, 24, 18, 10, 14, 7, 10, 5, 7, 4, 5, 3, 4, 2, 3, 2, 2, 2,
];

const patternConfettiPieces: PatternConfettiPiece[] = [
  { left: 23, top: 106, width: 7, height: 15, color: '#f05a37', radius: 4, driftX: -72, fallY: -64, rotate: '-72deg', delay: 0.01 },
  { left: 25, top: 110, width: 9, height: 9, color: '#f3ba50', radius: 9, driftX: -52, fallY: -30, rotate: '44deg', delay: 0.04 },
  { left: 27, top: 114, width: 7, height: 13, color: '#f7d89f', radius: 4, driftX: -38, fallY: 8, rotate: '96deg', delay: 0.08 },
  { left: 29, top: 108, width: 8, height: 8, color: '#e8754c', radius: 8, driftX: -18, fallY: -76, rotate: '-36deg', delay: 0.12 },
  { left: 31, top: 116, width: 8, height: 16, color: '#e7c888', radius: 4, driftX: -10, fallY: -20, rotate: '64deg', delay: 0.16 },
  { left: 33, top: 112, width: 7, height: 7, color: '#f0a62e', radius: 7, driftX: 10, fallY: -52, rotate: '18deg', delay: 0.2 },
  { left: 35, top: 118, width: 7, height: 13, color: '#f15c3c', radius: 4, driftX: 24, fallY: 18, rotate: '-88deg', delay: 0.23 },
  { left: 65, top: 112, width: 7, height: 13, color: '#f15c3c', radius: 4, driftX: -24, fallY: 18, rotate: '88deg', delay: 0.02 },
  { left: 67, top: 116, width: 7, height: 7, color: '#f0a62e', radius: 7, driftX: -10, fallY: -52, rotate: '-18deg', delay: 0.06 },
  { left: 69, top: 108, width: 8, height: 16, color: '#e7c888', radius: 4, driftX: 10, fallY: -20, rotate: '-64deg', delay: 0.1 },
  { left: 71, top: 114, width: 8, height: 8, color: '#e8754c', radius: 8, driftX: 18, fallY: -76, rotate: '36deg', delay: 0.14 },
  { left: 73, top: 110, width: 7, height: 13, color: '#f7d89f', radius: 4, driftX: 38, fallY: 8, rotate: '-96deg', delay: 0.18 },
  { left: 75, top: 106, width: 9, height: 9, color: '#f3ba50', radius: 9, driftX: 52, fallY: -30, rotate: '-44deg', delay: 0.21 },
  { left: 77, top: 106, width: 7, height: 15, color: '#f05a37', radius: 4, driftX: 72, fallY: -64, rotate: '72deg', delay: 0.24 },
];

const fullDayNameByShortName: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const loopEvidenceChips = [
  'Seen in 3 saved traces',
  'Last 14 days',
  'Often starts with short sleep',
  'Usually includes stomach tightness',
];

const whatHelpedBeforeActions: WhatHelpedAction[] = [
  {
    id: 'body-scan',
    actionId: 'body-scan',
    title: '2-min Body Scan',
    outcome: 'Helped',
    date: 'Today',
    image: assets.actionBodyScan,
  },
  {
    id: 'evening-unload',
    actionId: 'evening-unload',
    title: 'Evening Unload List',
    outcome: 'Easy to finish',
    date: 'Yesterday',
    image: assets.actionEveningUnload,
  },
  {
    id: 'fact-guess-worry-split-old',
    actionId: 'fact-guess-worry-split',
    title: 'Fact / Guess / Worry Split',
    outcome: 'Helped a little',
    date: 'Jun 9',
    image: assets.actionFgwSplit,
  },
  {
    id: 'feedback-reframe',
    actionId: 'kind-reframe',
    title: 'Kind Reframe',
    outcome: 'Worth trying again',
    date: 'Jun 8',
    image: assets.actionKindReframe,
  },
];

const helpfulnessLabels: Record<ActionHelpfulness, string> = {
  helped: 'Helped',
  helped_a_little: 'Helped a little',
  did_not_help: 'Not today',
  too_much: 'Too much',
};

const helpfulnessOptions: Array<{ value: ActionHelpfulness; label: string; image: ImageSourcePropType }> = [
  { value: 'helped', label: 'Yes', image: assets.feedbackHelped },
  { value: 'helped_a_little', label: 'A little', image: assets.feedbackHelpedALittle },
  { value: 'did_not_help', label: 'Not today', image: assets.feedbackNotToday },
  { value: 'too_much', label: 'Too much', image: assets.feedbackTooMuch },
];

const emptyActionAnswers: ActionAnswers = {};

function getTranscriptExcerpt(transcript: string) {
  const compactTranscript = transcript.trim().replace(/\s+/g, ' ');

  if (compactTranscript.length <= 118) {
    return compactTranscript;
  }

  return `${compactTranscript.slice(0, 115)}...`;
}

function waitForAiStage(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeSelectionLabel(label: string) {
  return label.replace(/\n/g, ' ');
}

function getMoodSpeechPhrase(selectedMood: string | null) {
  const mood = selectedMood ? normalizeSelectionLabel(selectedMood).toLowerCase() : '';

  if (mood === 'calm') {
    return 'a sense of calm';
  }

  if (mood === 'down') {
    return 'feeling a little down';
  }

  if (mood === 'sad') {
    return 'some sadness';
  }

  if (mood === 'irritable') {
    return 'some irritability';
  }

  return mood ? `feeling ${mood}` : null;
}

function getBodySpeechPhrase(bodySignal: string | null) {
  const body = bodySignal ? normalizeSelectionLabel(bodySignal).toLowerCase() : '';

  if (body.includes('chest')) {
    return 'some tightness in your chest';
  }

  if (body.includes('stomach')) {
    return 'some tightness in your stomach';
  }

  if (body.includes('head')) {
    return 'some pressure in your head';
  }

  if (body.includes('neck') || body.includes('shoulder')) {
    return 'some tension in your neck or shoulders';
  }

  if (body.includes('tired') || body.includes('heavy')) {
    return 'some tiredness or heaviness';
  }

  if (body.includes('not sure')) {
    return 'something in your body';
  }

  return body || null;
}

function getReflectionPrompt({
  selectedMood,
  selectedBodySignals,
}: {
  selectedMood: string | null;
  selectedBodySignals: string[];
}) {
  const bodySignal = selectedBodySignals[0] ? normalizeSelectionLabel(selectedBodySignals[0]) : null;
  const moodPhrase = getMoodSpeechPhrase(selectedMood);
  const bodyPhrase = getBodySpeechPhrase(bodySignal);

  if (moodPhrase && bodyPhrase) {
    return `I noticed ${moodPhrase}, with ${bodyPhrase} too. What else was there?`;
  }

  if (moodPhrase) {
    return `I noticed ${moodPhrase}. What else was there?`;
  }

  if (bodyPhrase) {
    return `I noticed ${bodyPhrase}. What else was there?`;
  }

  return 'What else was there? You can start anywhere.';
}

function getReflectionInputPlaceholder() {
  return 'Your words will appear here while you speak. You can edit anything before Review.';
}

function isAiProgressStep(step: ReflectionReviewStep) {
  return step === 'recording' || step === 'transcribing' || step === 'thinking';
}

function getAiProgressCopy(step: ReflectionReviewStep) {
  if (step === 'recording') {
    return {
      title: 'Listening gently',
      note: 'Keep it short. A few words are enough.',
      icon: 'mic' as const,
    };
  }

  if (step === 'transcribing') {
    return {
      title: 'Turning this into words',
      note: 'Rora is making a transcript first so you can review it.',
      icon: 'file-text' as const,
    };
  }

  return {
    title: 'Sorting the trace',
    note: 'Rora is looking for what you said, what you selected, and what should stay editable.',
    icon: 'heart' as const,
  };
}

function getSafetySupportCopy(response: AiTraceExtractionResponse | null) {
  if (response?.safety.support === 'medical_note') {
    return {
      title: 'Let’s keep this as a private note first',
      note: 'Because this includes a body signal that could need care, Rora will not turn it into a pattern or recommend a regular action.',
      detail: 'If this feels sudden, severe, or unusual, consider getting medical help.',
    };
  }

  if (response?.safety.support === 'resources_panel') {
    return {
      title: 'This feels important',
      note: 'Rora will not turn this into a pattern or suggest a regular action right now.',
      detail:
        'If you might be in immediate danger, contact local emergency services or someone you trust.',
    };
  }

  return {
    title: 'Let’s save this gently',
    note: 'Rora can keep your words without using them for ordinary patterns yet.',
    detail: 'You can delete this draft or save it as a private note.',
  };
}

function getBrowserMediaRecorder() {
  return (globalThis as typeof globalThis & { MediaRecorder?: any }).MediaRecorder || null;
}

function getBrowserSpeechRecognition() {
  const speechGlobal = globalThis as typeof globalThis & {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  };

  return speechGlobal.SpeechRecognition || speechGlobal.webkitSpeechRecognition || null;
}

function getSupportedAudioMimeType() {
  const MediaRecorderConstructor = getBrowserMediaRecorder();
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg'];

  if (!MediaRecorderConstructor?.isTypeSupported) {
    return '';
  }

  return candidates.find((candidate) => MediaRecorderConstructor.isTypeSupported(candidate)) || '';
}

function readBlobAsBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(new Error('Could not read recorded audio.'));
    reader.readAsDataURL(blob);
  });
}

function formatRecordingElapsed(elapsedMs: number) {
  const safeElapsedMs = Math.max(0, elapsedMs);
  const minutes = Math.floor(safeElapsedMs / 60000);
  const seconds = Math.floor((safeElapsedMs % 60000) / 1000);
  const centiseconds = Math.floor((safeElapsedMs % 1000) / 10);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(
    centiseconds,
  ).padStart(2, '0')}`;
}

function playAiVoiceReply(response: AiTraceExtractionResponse) {
  if (!response.ttsAudio.base64 || !response.ttsAudio.mimeType || Platform.OS !== 'web') {
    return;
  }

  const AudioConstructor = (globalThis as typeof globalThis & { Audio?: typeof Audio }).Audio;

  if (!AudioConstructor) {
    return;
  }

  const audio = new AudioConstructor(`data:${response.ttsAudio.mimeType};base64,${response.ttsAudio.base64}`);
  void audio.play().catch(() => undefined);
}

async function transcribeRecordedAudio({
  audioBase64,
  audioMimeType,
}: {
  audioBase64: string;
  audioMimeType: string;
}) {
  const response = await fetch('http://localhost:8084/api/mood-ai/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioBase64,
      audioMimeType,
    }),
  });

  if (!response.ok) {
    throw new Error(`Rora transcribe failed: ${response.status}`);
  }

  return response.json() as Promise<{ transcript: string; confidence: string }>;
}

function getPatternVisibility(loopSignature: LoopSignature | null, traceRecords: MoodTraceRecord[]) {
  return getLoopPatternRuleState(loopSignature, traceRecords);
}

function getPatternEvidenceLine(patternVisibility: { traceCount: number; dayCount: number }) {
  const traceLabel = `${patternVisibility.traceCount} saved ${
    patternVisibility.traceCount === 1 ? 'trace' : 'traces'
  }`;
  const dayLabel = `${patternVisibility.dayCount} ${patternVisibility.dayCount === 1 ? 'day' : 'days'}`;

  return `Seen in ${traceLabel} across ${dayLabel}.`;
}

function getPatternState(patternVisibility: LoopPatternRuleState) {
  if (!patternVisibility.canShowLoop) {
    return {
      title: 'Patterns are still forming',
      stageLabel: 'Still learning',
      noun: 'thread',
      seenLabel: 'Not enough history yet',
      subtitle: 'Save a few traces and Rora will start connecting what repeats.',
      evidenceLead: 'Rora needs a little more history',
    };
  }

  const count = patternVisibility.traceCount;
  const savedTraceLabel = `${count} saved ${count === 1 ? 'trace' : 'traces'}`;

  if (patternVisibility.canShowLoopAction) {
    return {
      title: 'A possible loop',
      stageLabel: 'Possible loop',
      noun: 'loop',
      seenLabel: `Seen in ${savedTraceLabel}`,
      subtitle: 'Rora is starting to see this thread repeat.',
      evidenceLead: `Based on ${savedTraceLabel}`,
    };
  }

  return {
    title: 'A possible thread',
    stageLabel: 'Possible thread',
    noun: 'thread',
    seenLabel: `Seen in ${savedTraceLabel}`,
    subtitle: 'Rora is starting to see this thread repeat.',
    evidenceLead: `Based on ${savedTraceLabel}`,
  };
}

function readPersistedMoodMemory() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  try {
    const storedSnapshot = window.localStorage.getItem(MOOD_MEMORY_STORAGE_KEY);

    if (!storedSnapshot) {
      return null;
    }

    return JSON.parse(storedSnapshot) as MoodMemorySnapshot;
  } catch {
    return null;
  }
}

function writePersistedMoodMemory(snapshot: MoodMemorySnapshot) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(MOOD_MEMORY_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Local storage can fail in private browsing or embedded previews; the app should still work in memory.
  }
}

function readSeenPatternMilestones(): PatternMilestoneId[] {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(PATTERN_MILESTONES_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (item): item is PatternMilestoneId => item === 'thread' || item === 'loop_action',
    );
  } catch {
    return [];
  }
}

function writeSeenPatternMilestones(milestones: PatternMilestoneId[]) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(PATTERN_MILESTONES_STORAGE_KEY, JSON.stringify(milestones));
  } catch {
    // The visual milestone can still work in memory if local storage is unavailable.
  }
}

function getPatternMilestoneId(patternVisibility: LoopPatternRuleState): PatternMilestoneId | null {
  if (patternVisibility.canShowLoopAction) {
    return 'loop_action';
  }

  if (patternVisibility.canShowLoop) {
    return 'thread';
  }

  return null;
}

function getPatternMilestoneTitle(milestone: PatternMilestoneId) {
  if (milestone === 'loop_action') {
    return 'Rora found one small step for this thread.';
  }

  return 'Rora is starting to see a thread.';
}

function getTraceResultFromRecord(record: MoodTraceRecord): MockTraceResult {
  return {
    chain: record.chain,
    extraction: record.extraction,
    bodySignals: record.bodySignals,
  };
}

function getTraceResultFallbackTranscript(traceResult: MockTraceResult) {
  const extractionText = traceResult.extraction
    .map((item) => `${item.label}: ${item.value}`)
    .join('. ');

  return extractionText || 'A small starting focus Rora noticed today.';
}

function getIsoDaysAgo(daysAgo: number, hour = 10) {
  const date = new Date();
  date.setHours(hour, 12, 0, 0);
  date.setDate(date.getDate() - daysAgo);

  return date.toISOString();
}

function buildDevTraceRecords(count: number) {
  const transcripts = [
    'Something from work stayed with me today. I felt calm, but my chest felt tight, and I kept replaying it in my mind.',
    'A work message stayed with me. My chest tightened and I kept replaying the moment.',
    'After feedback at work, I noticed chest tightness and kept replaying the moment.',
    'Work feedback showed up again. I felt chest tightness first, then overthinking started.',
    'A follow-up from work stayed on my mind, and my chest felt tight while I replayed it.',
  ];
  const dayOffsets = [0, 1, 2, 3, 4];
  const traceResult: MockTraceResult = {
    chain: ['work_feedback', 'overthinking', 'chest_tightness'],
    bodySignals: [{ key: 'chest_tightness', value: 'Chest tightness' }],
    extraction: [
      { label: 'Trigger', value: 'Work feedback' },
      { label: 'Thought', value: 'Replaying thought' },
      { label: 'Body', value: 'Chest tightness' },
    ],
  };

  return Array.from({ length: count }, (_, index) => {
    const createdAt = getIsoDaysAgo(dayOffsets[index] || index, 9 + index);
    const transcript = transcripts[index] || transcripts[0];

    return buildMoodTraceRecord({
      transcript,
      selectedMood: 'Calm',
      selectedBodySignalLabels: ['Chest tightness'],
      traceResult,
      source: 'manual_text',
      createdAt,
      savedAt: createdAt,
      occurrenceCount: index + 1,
    });
  });
}

function getLoopRecords(traceRecords: MoodTraceRecord[], chainKey: string | null) {
  if (!chainKey) {
    return [];
  }

  return traceRecords.filter((record) => getLoopIdentityKey(record) === chainKey);
}

function getMostCommonBodySignalLabel(traceRecords: MoodTraceRecord[], fallbackRecord: MoodTraceRecord | null) {
  const counts = new Map<TraceIconKey, number>();

  traceRecords.forEach((record) => {
    const bodyKey = record.loopSignature.primaryBodyKey;

    if (bodyKey) {
      counts.set(bodyKey, (counts.get(bodyKey) || 0) + 1);
    }
  });

  const [topBodyKey] =
    Array.from(counts.entries()).sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return getBodySignalSortRank(left[0]) - getBodySignalSortRank(right[0]);
    })[0] || [];

  return getTraceIconPlainLabel(topBodyKey || fallbackRecord?.loopSignature.primaryBodyKey || 'stomach_tightness').toLowerCase();
}

function formatMemoryDate(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'Saved';
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCanonicalMoodLabel(label: string | null) {
  const normalizedLabel = String(label || '').replace(/\n/g, ' ').trim().toLowerCase();

  return moodItems.find((item) => item.label.toLowerCase() === normalizedLabel)?.label || null;
}

function getTraceRecordDate(record: MoodTraceRecord) {
  return record.savedAt || record.createdAt;
}

function getRecentMoodWindowStartTimestamp(windowDays = 7, referenceDate = new Date()) {
  return getLocalDayTimestamp(referenceDate) - (windowDays - 1) * dayInMs;
}

function getTraceRecordDayTimestamp(record: MoodTraceRecord) {
  const recordDate = new Date(getTraceRecordDate(record));

  if (Number.isNaN(recordDate.getTime())) {
    return null;
  }

  return getLocalDayTimestamp(recordDate);
}

function isTraceRecordInRecentWindow(record: MoodTraceRecord, windowDays = 7, referenceDate = new Date()) {
  const dayTimestamp = getTraceRecordDayTimestamp(record);

  if (dayTimestamp === null) {
    return false;
  }

  const windowStart = getRecentMoodWindowStartTimestamp(windowDays, referenceDate);
  const windowEnd = getLocalDayTimestamp(referenceDate);

  return dayTimestamp >= windowStart && dayTimestamp <= windowEnd;
}

function buildMoodSummary(traceRecords: MoodTraceRecord[], windowDays = 7): MoodSummaryItem[] {
  const counts = new Map(moodItems.map((item) => [item.label, 0]));

  traceRecords.forEach((record) => {
    if (!isTraceRecordInRecentWindow(record, windowDays)) {
      return;
    }

    const moodLabel = getCanonicalMoodLabel(record.moodLabel);

    if (moodLabel) {
      counts.set(moodLabel, (counts.get(moodLabel) || 0) + 1);
    }
  });

  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);

  return moodItems.map((item) => {
    const count = counts.get(item.label) || 0;

    return {
      label: item.label,
      color: moodChartColors[item.label],
      count,
      percent: total > 0 ? count / total : 0,
    };
  });
}

function buildMoodTimeline(traceRecords: MoodTraceRecord[], windowDays = 7): MoodTimelinePoint[] {
  const windowStart = getRecentMoodWindowStartTimestamp(windowDays);
  const latestRecordByDay = new Map<
    number,
    { record: MoodTraceRecord; moodLabel: string; savedAt: string }
  >();

  traceRecords.forEach((record) => {
    const moodLabel = getCanonicalMoodLabel(record.moodLabel);
    const dayTimestamp = getTraceRecordDayTimestamp(record);

    if (!moodLabel || dayTimestamp === null || !isTraceRecordInRecentWindow(record, windowDays)) {
      return;
    }

    const savedAt = getTraceRecordDate(record);
    const existingRecord = latestRecordByDay.get(dayTimestamp);

    if (!existingRecord || savedAt.localeCompare(existingRecord.savedAt) > 0) {
      latestRecordByDay.set(dayTimestamp, { record, moodLabel, savedAt });
    }
  });

  return Array.from({ length: windowDays }, (_, index) => {
    const dayTimestamp = windowStart + index * dayInMs;
    const date = new Date(dayTimestamp);
    const dayRecord = latestRecordByDay.get(dayTimestamp);

    return {
      id: dayRecord?.record.id || `empty-${dayTimestamp}`,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.toLocaleDateString('en-US', { day: 'numeric' }),
      dateLabel: date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      moodLabel: dayRecord?.moodLabel || null,
      moodLevel: dayRecord ? moodChartLevels[dayRecord.moodLabel] : null,
      color: dayRecord ? moodChartColors[dayRecord.moodLabel] : null,
    };
  });
}

function MoodButton({
  item,
  selected,
  onSelect,
}: {
  item: MoodItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const selectionProgress = React.useRef(new Animated.Value(selected ? 1 : 0)).current;

  React.useEffect(() => {
    selectionProgress.stopAnimation(() => {
      Animated.timing(selectionProgress, {
        toValue: selected ? 1 : 0,
        duration: selected ? 210 : 135,
        easing: selected ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
        useNativeDriver: false,
      }).start();
    });
  }, [selected, selectionProgress]);

  const selectionScale = selectionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const iconScale = selectionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={item.label.replace(/\n/g, ' ')}
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={styles.moodButton}
    >
      <View style={styles.moodHalo}>
        <Animated.View
          style={[
            styles.moodSelectionHalo,
            {
              opacity: selectionProgress,
              transform: [{ scale: selectionScale }],
            },
          ]}
        />
        <Animated.Image
          source={item.image}
          style={[styles.moodIcon, { transform: [{ scale: iconScale }] }]}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function RecordButton({ onStart }: { onStart: () => void }) {
  const content = (
    <>
      <Image source={assets.recordMic} style={styles.recordIcon} resizeMode="contain" />
      <Text style={styles.recordLabel}>Tap to speak</Text>
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <button
        type="button"
        aria-label="Tap to speak"
        onClick={onStart}
        style={webRecordButtonStyle}
      >
        {content}
      </button>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Tap to speak"
      onPress={onStart}
      style={styles.recordButton}
    >
      {content}
    </TouchableOpacity>
  );
}

function BodyButton({
  item,
  selected,
  onSelect,
}: {
  item: BodyItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const selectionProgress = React.useRef(new Animated.Value(selected ? 1 : 0)).current;

  React.useEffect(() => {
    selectionProgress.stopAnimation(() => {
      Animated.timing(selectionProgress, {
        toValue: selected ? 1 : 0,
        duration: selected ? 210 : 135,
        easing: selected ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
        useNativeDriver: false,
      }).start();
    });
  }, [selected, selectionProgress]);

  const selectionScale = selectionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const iconScale = selectionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={item.label.replace(/\n/g, ' ')}
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={styles.bodyButton}
    >
      <View style={styles.bodyIconFrame}>
        <Animated.View
          style={[
            styles.bodySelectionHalo,
            {
              opacity: selectionProgress,
              transform: [{ scale: selectionScale }],
            },
          ]}
        />
        <Animated.Image
          source={item.image}
          style={[styles.bodyIcon, { transform: [{ scale: iconScale }] }]}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.bodyLabel, selected && styles.bodyLabelSelected]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function LoopRow({ item, isLast }: { item: TraceIconKey; isLast: boolean }) {
  return (
    <View style={styles.loopRowWrap}>
      <View style={styles.loopPill}>
        <Image source={traceIconDictionary[item].image} style={styles.loopIcon} resizeMode="contain" />
        <Text style={styles.loopLabel}>{traceIconDictionary[item].label.replace(/\n/g, ' ')}</Text>
      </View>
      {!isLast ? (
        <View style={styles.loopArrow}>
          <Image source={assets.loopArrowDown} style={styles.loopArrowImage} resizeMode="contain" />
        </View>
      ) : null}
    </View>
  );
}

function BodySignalDay({
  day,
  expanded,
  onToggle,
  signals,
}: {
  day: string;
  expanded: boolean;
  onToggle: () => void;
  signals: TraceIconKey[];
}) {
  const primarySignal = signals[0];
  const extraSignalCount = Math.max(0, signals.length - 1);

  return (
    <TouchableOpacity
      activeOpacity={signals.length > 0 ? 0.86 : 1}
      accessibilityRole="button"
      accessibilityLabel={`${day} body signals`}
      accessibilityState={{ expanded, disabled: signals.length === 0 }}
      disabled={signals.length === 0}
      onPress={onToggle}
      style={styles.signalDay}
    >
      <View
        style={[
          styles.signalDaySlot,
          signals.length === 0 && styles.signalDayEmpty,
          expanded && styles.signalDaySlotExpanded,
        ]}
      >
        {primarySignal ? (
          <Image
            source={traceIconDictionary[primarySignal].image}
            style={styles.signalDayIcon}
            resizeMode="contain"
          />
        ) : null}
        {extraSignalCount > 0 ? (
          <View style={styles.signalDayMoreBadge}>
            <Text style={styles.signalDayMoreBadgeText}>+{extraSignalCount}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.signalDayLabel}>{day}</Text>
    </TouchableOpacity>
  );
}

function ActionsScreen() {
  return (
    <>
      <Text style={styles.title}>Actions</Text>

      <View style={styles.actionFocusCard}>
        <View style={styles.actionFocusHeader}>
          <Text style={styles.actionEyebrow}>Chosen for this loop</Text>
          <View style={styles.actionTimePill}>
            <Feather name="clock" size={11} color="#5b6f41" />
            <Text style={styles.actionTimeText}>2 min</Text>
          </View>
        </View>
        <Text style={styles.actionTitle}>Fact / Guess / Worry Split</Text>
        <Text style={styles.actionDescription}>
          A tiny reset for replaying feedback and separating what happened from what your mind is filling in.
        </Text>
      </View>
    </>
  );
}

function ActionsScreenV2({
  activeActionView,
  actionRunState,
  actionAnswers,
  selectedHelpfulness,
  latestActionRewardEntry,
  selectedAction,
  selectedActionRecommendationMode,
  recommendedAction,
  recommendedActionDefinition,
  loopRecommendedAction,
  loopRecommendedActionDefinition,
  canShowLoopAction,
  actionLoopContextKeys,
  whatHelpedActions,
  onOpenActionDetail,
  onOpenActionBrowse,
  onBackToActions,
  onStartAction,
  onCompleteAction,
  onSelectHelpfulness,
  onChangeActionAnswer,
}: {
  activeActionView: ActionView;
  actionRunState: ActionRunState;
  actionAnswers: ActionAnswers;
  selectedHelpfulness: ActionHelpfulness | null;
  latestActionRewardEntry: ActionMemoryEntry | null;
  selectedAction: ActionDefinition;
  selectedActionRecommendationMode: ActionRecommendationMode;
  recommendedAction: RecommendedAction;
  recommendedActionDefinition: ActionDefinition;
  loopRecommendedAction: RecommendedAction;
  loopRecommendedActionDefinition: ActionDefinition;
  canShowLoopAction: boolean;
  actionLoopContextKeys: TraceIconKey[];
  whatHelpedActions: WhatHelpedAction[];
  onOpenActionDetail: (actionId?: ActionId, recommendationMode?: ActionRecommendationMode) => void;
  onOpenActionBrowse: () => void;
  onBackToActions: () => void;
  onStartAction: () => void;
  onCompleteAction: () => void;
  onSelectHelpfulness: (value: ActionHelpfulness) => void;
  onChangeActionAnswer: (key: ActionAnswerKey, value: string) => void;
}) {
  const latestActionRewardCopy = latestActionRewardEntry
    ? getActionRewardCompletionCopy({
        rewardStamp: latestActionRewardEntry.rewardStamp,
        helpfulness: latestActionRewardEntry.helpfulness,
      })
    : null;
  const actionRewardIconName =
    latestActionRewardEntry?.helpfulness === 'too_much'
      ? 'arrow-down-circle'
      : latestActionRewardEntry?.helpfulness === 'did_not_help'
        ? 'compass'
        : 'check-circle';

  if (activeActionView === 'browse') {
    return (
      <>
        <View style={styles.actionDetailTopRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Back to Actions"
            onPress={onBackToActions}
            style={styles.actionBackButton}
          >
            <Feather name="chevron-left" size={20} color="#5b6f41" />
          </TouchableOpacity>
          <Text style={styles.title}>Actions</Text>
        </View>

        <Text style={styles.actionBrowseTitle}>Choose a small action</Text>
        <Text style={styles.actionBrowseSubtitle}>Start with one gentle reset. More guided flows can build from here.</Text>

        <View style={styles.actionBrowseList}>
          {browseActionOptions.map((action) => (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel={`Open ${action.title} action`}
              onPress={() => onOpenActionDetail(action.id)}
              style={styles.actionBrowseRow}
            >
              <View style={styles.actionBrowseIconWrap}>
                <Image source={action.image} style={styles.actionBrowseIcon} resizeMode="contain" />
              </View>
              <View style={styles.actionBrowseCopy}>
                <View style={styles.actionBrowseTopLine}>
                  <Text style={styles.actionBrowseRowTitle}>{action.title}</Text>
                  <Text style={styles.actionBrowseDuration}>{action.duration}</Text>
                </View>
                <Text style={styles.actionBrowseDescription}>{action.description}</Text>
              </View>
              <Feather name="chevron-right" size={19} color={colors.softText} />
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  }

  if (activeActionView === 'detail') {
    const isStarted = actionRunState === 'started';
    const isCompleted = actionRunState === 'completed';
    const detailRecommendedAction =
      selectedActionRecommendationMode === 'loop_action' ? loopRecommendedAction : recommendedAction;

    return (
      <>
        <View style={styles.actionDetailTopRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Back to Actions"
            onPress={onBackToActions}
            style={styles.actionBackButton}
          >
            <Feather name="chevron-left" size={20} color="#5b6f41" />
          </TouchableOpacity>
          <Text style={styles.title}>Actions</Text>
        </View>

        <View style={styles.actionDetailCard}>
          <View style={styles.actionDetailHeader}>
            <View style={styles.actionDetailTitleCopy}>
              <Text style={styles.actionDetailTitle}>{selectedAction.title}</Text>
              <Text style={styles.actionDetailReason}>
                {selectedAction.id === detailRecommendedAction.actionId
                  ? detailRecommendedAction.reason
                  : selectedAction.reason}
              </Text>
              {selectedAction.id === detailRecommendedAction.actionId ? (
                <Text style={styles.actionDetailEvidence}>{detailRecommendedAction.evidenceLine}</Text>
              ) : null}
            </View>
            <View style={styles.actionDetailTimePill}>
              <Feather name="clock" size={12} color="#5b6f41" />
              <Text style={styles.actionDetailTimeText}>{selectedAction.estimatedMinutes} min</Text>
            </View>
          </View>

          <View style={styles.actionLoopContext}>
            <Text style={styles.actionLoopContextLabel}>
              {detailRecommendedAction.mode === 'loop_action' ? 'From this loop' : 'From today’s trace'}
            </Text>
            <View style={styles.actionLoopMiniRow}>
              {actionLoopContextKeys.map((item, index) => (
                <React.Fragment key={item}>
                  <View style={styles.actionLoopMiniNode}>
                    <Image
                      source={traceIconDictionary[item].image}
                      style={styles.actionLoopMiniIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.actionLoopMiniText}>{getTraceIconPlainLabel(item)}</Text>
                  </View>
                  {index < actionLoopContextKeys.length - 1 ? (
                    <Feather name="arrow-right" size={13} color="#8f806e" />
                  ) : null}
                </React.Fragment>
              ))}
            </View>
          </View>

          {!isStarted && !isCompleted ? (
            <>
              <Text style={styles.actionDetailDescription}>{selectedAction.description}</Text>
              <View style={styles.actionDetailPreviewList}>
                {selectedAction.steps.map((step) => (
                  <View key={step.key} style={styles.actionDetailPreviewRow}>
                    <View style={styles.actionDetailStepIconWrap}>
                      {step.image ? (
                        <Image source={step.image} style={styles.actionDetailStepImage} resizeMode="contain" />
                      ) : (
                        <Feather name={step.icon} size={18} color="#6b5b4a" />
                      )}
                    </View>
                    <View style={styles.actionDetailStepCopy}>
                      <Text style={styles.actionDetailStepTitle}>{step.title}</Text>
                      <Text style={styles.actionDetailStepPrompt}>{step.detailPrompt}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel={`Start ${selectedAction.title}`}
                onPress={onStartAction}
                style={styles.actionPrimaryButton}
              >
                <Text style={styles.actionPrimaryButtonText}>Start</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {isStarted ? (
            <>
              <View style={styles.actionInputList}>
                {selectedAction.steps.map((step) => (
                  <View key={step.key} style={styles.actionInputBlock}>
                    <Text style={styles.actionInputLabel}>{step.title}</Text>
                    <Text style={styles.actionInputPrompt}>{step.prompt}</Text>
                    <TextInput
                      multiline
                      value={actionAnswers[step.key] || ''}
                      onChangeText={(value) => onChangeActionAnswer(step.key, value)}
                      placeholder={step.placeholder}
                      placeholderTextColor="#9a8b77"
                      style={styles.actionInput}
                      textAlignVertical="top"
                    />
                  </View>
                ))}
              </View>
              <TouchableOpacity
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel="Complete action"
                onPress={onCompleteAction}
                style={styles.actionPrimaryButton}
              >
                <Text style={styles.actionPrimaryButtonText}>Complete</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {isCompleted ? (
            <View style={styles.actionFeedbackPanel}>
              <Text style={styles.actionFeedbackTitle}>
                {detailRecommendedAction.mode === 'loop_action'
                  ? 'Did this make the loop feel lighter?'
                  : 'Did this help today feel a little lighter?'}
              </Text>
              <View style={styles.actionFeedbackGrid}>
                {helpfulnessOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.78}
                    accessibilityRole="button"
                    accessibilityLabel={`Feedback ${option.label}`}
                    onPress={() => onSelectHelpfulness(option.value)}
                    style={[
                      styles.actionFeedbackButton,
                      selectedHelpfulness === option.value && styles.actionFeedbackButtonSelected,
                    ]}
                  >
                    <Image source={option.image} style={styles.actionFeedbackButtonIcon} resizeMode="contain" />
                    <Text
                      style={[
                        styles.actionFeedbackButtonText,
                        selectedHelpfulness === option.value && styles.actionFeedbackButtonTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </>
    );
  }

  return (
    <>
      <View style={styles.actionsTopRow}>
        <Text style={styles.title}>Actions</Text>
      </View>

      <View style={styles.actionIntroCard}>
        <View style={styles.actionIntroCopy}>
          <Text style={styles.heroTitle}>
            Let’s make today a little lighter.
          </Text>
          <Text style={styles.heroSubtitle}>2 minutes is enough.</Text>
        </View>
        <Image source={assets.actionIntroMascot} style={styles.actionIntroImage} resizeMode="contain" />
      </View>

      <Text style={styles.actionSectionLabel}>Today's focus</Text>

      {latestActionRewardEntry && latestActionRewardCopy ? (
        <View style={styles.actionRewardCard}>
          <View style={styles.actionRewardTopRow}>
            <View style={styles.actionRewardStamp}>
              <Feather name={actionRewardIconName} size={14} color="#5b6f41" />
              <Text style={styles.actionRewardStampText}>{latestActionRewardCopy.badge}</Text>
            </View>
            <Text style={styles.actionRewardActionTitle} numberOfLines={1}>
              {latestActionRewardEntry.actionTitle}
            </Text>
          </View>
          <Text style={styles.actionRewardHeadline}>{latestActionRewardCopy.headline}</Text>
          <Text style={styles.actionRewardBody}>{latestActionRewardCopy.body}</Text>
          <View style={styles.actionRewardMemoryRow}>
            <Feather name="bookmark" size={14} color="#5b6f41" />
            <Text style={styles.actionRewardMemoryText}>{latestActionRewardCopy.memoryLine}</Text>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel={`Open ${recommendedActionDefinition.title} action`}
        onPress={() => onOpenActionDetail(recommendedActionDefinition.id, 'daily_action')}
        style={styles.actionFocusCardV2}
      >
        <View style={styles.actionGreenHeader}>
          <Image source={assets.actionGreenCard} style={styles.actionGreenTexture} resizeMode="stretch" />
          <View style={styles.actionGreenContent}>
            <Text style={styles.actionFocusMode}>
              For today
            </Text>
            <Text style={styles.actionFocusTitle}>{recommendedActionDefinition.title}</Text>
            <View style={styles.actionTimePillV2}>
              <Feather name="clock" size={12} color="#f7ecd8" />
              <Text style={styles.actionTimeTextV2}>{recommendedActionDefinition.estimatedMinutes} min</Text>
            </View>
          </View>
          <Image source={assets.actionLeafSprig} style={styles.actionLeafSprig} resizeMode="contain" />
        </View>

        <View style={styles.actionStepRow}>
          {recommendedActionDefinition.steps.map((step, index) => (
            <View
              key={step.title}
              style={[
                styles.actionStepCard,
                index === 0 && styles.actionStepCardFirst,
                index === recommendedActionDefinition.steps.length - 1 && styles.actionStepCardLast,
              ]}
            >
              <Text style={styles.actionStepTitle}>{step.title}</Text>
              <Text style={styles.actionStepPrompt}>{step.prompt}</Text>
              {step.image ? (
                <Image source={step.image} style={styles.actionStepImage} resizeMode="contain" />
              ) : (
                <Feather name={step.icon} size={31} color="#6b5b4a" style={styles.actionStepIcon} />
              )}
            </View>
          ))}
        </View>

      </TouchableOpacity>

      {canShowLoopAction ? (
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Open ${loopRecommendedActionDefinition.title} loop action`}
          onPress={() => onOpenActionDetail(loopRecommendedActionDefinition.id, 'loop_action')}
          style={styles.loopActionBridgeCard}
        >
          <View style={styles.loopActionBridgeIconWrap}>
            <Feather name="repeat" size={20} color="#5b6f41" />
          </View>
          <View style={styles.loopActionBridgeCopy}>
            <Text style={styles.loopActionBridgeKicker}>For a loop Rora noticed</Text>
            <Text style={styles.loopActionBridgeTitle}>{loopRecommendedActionDefinition.title}</Text>
            <Text style={styles.loopActionBridgeReason}>{loopRecommendedAction.evidenceLine}</Text>
          </View>
          <Feather name="arrow-right" size={20} color="#5b6f41" />
        </TouchableOpacity>
      ) : null}

      <Text style={[styles.actionSectionLabel, styles.recentActionsLabel]}>What helped before</Text>
      <View style={styles.recentActionsCard}>
        {whatHelpedActions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={`Open ${action.title} from what helped before`}
            onPress={() => onOpenActionDetail(action.actionId)}
            style={styles.recentActionRow}
          >
            <View style={styles.recentActionIconWrap}>
              {action.image ? (
                <Image source={action.image} style={styles.recentActionImage} resizeMode="contain" />
              ) : (
                <Feather name={action.icon} size={25} color="#6b5b4a" />
              )}
            </View>
            <View style={styles.recentActionCopy}>
              <View style={styles.recentActionTopLine}>
                <Text style={styles.recentActionTitle}>{action.title}</Text>
                <Text style={styles.recentActionDate}>{action.date}</Text>
              </View>
              <View style={styles.whatHelpedOutcomeRow}>
                <View style={[styles.whatHelpedPill, action.isNew && styles.whatHelpedPillNew]}>
                  <Text style={[styles.whatHelpedPillText, action.isNew && styles.whatHelpedPillTextNew]}>
                    {action.outcome}
                  </Text>
                </View>
                {action.isNew ? <Text style={styles.whatHelpedSavedText}>Just saved</Text> : null}
              </View>
              {action.loopLabel ? (
                <Text style={styles.whatHelpedLoopText}>
                  {action.loopLabel} · {action.matchLabel}
                </Text>
              ) : null}
            </View>
            {index < whatHelpedActions.length - 1 ? <View style={styles.recentActionDivider} /> : null}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel="Find another small action"
        onPress={onOpenActionBrowse}
        style={styles.browseActionsCard}
      >
        <View style={styles.browseActionsIconWrap}>
          <Feather name="compass" size={25} color="#5b6f41" />
        </View>
        <Text style={styles.browseActionsText}>Find another small action</Text>
        <Feather name="chevron-right" size={23} color={colors.softText} />
      </TouchableOpacity>
    </>
  );
}

function getMoodFaceImage(label: string) {
  return moodItems.find((item) => item.label === label)?.image || assets.moodCalm;
}

function buildSmoothLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previousPoint = points[index - 1];
    const controlX = (previousPoint.x + point.x) / 2;

    return `${path} C ${controlX} ${previousPoint.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function MoodShapeChart({ moodSummary }: { moodSummary: MoodSummaryItem[] }) {
  const chartSize = 220;
  const center = chartSize / 2;
  const maxRadius = 78;
  const totalMoodCount = moodSummary.reduce((sum, item) => sum + item.count, 0);
  const hasMoodData = moodSummary.some((item) => item.count > 0);
  const summaryByLabel = new Map(moodSummary.map((item) => [item.label, item]));
  const axes = [
    { label: 'Calm', angle: -90, labelStyle: styles.moodShapeLabelTop },
    { label: 'Irritable', angle: 0, labelStyle: styles.moodShapeLabelRight },
    { label: 'Sad', angle: 90, labelStyle: styles.moodShapeLabelBottom },
    { label: 'Down', angle: 180, labelStyle: styles.moodShapeLabelLeft },
  ];
  const getPoint = (angle: number, radius: number) => {
    const radians = (angle * Math.PI) / 180;

    return {
      x: center + Math.cos(radians) * radius,
      y: center + Math.sin(radians) * radius,
    };
  };
  const dataPoints = axes.map((axis) => {
    const item = summaryByLabel.get(axis.label);
    const percent = totalMoodCount > 0 && item ? item.count / totalMoodCount : 0;
    const radius = hasMoodData ? 38 + percent * (maxRadius - 38) : 0;

    return {
      ...axis,
      ...getPoint(axis.angle, radius),
      color: item?.color || colors.mutedText,
      count: item?.count || 0,
    };
  });
  const dataPolygonPoints = dataPoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <View style={styles.moodShapeWrap}>
      <Svg
        width={chartSize}
        height={chartSize}
        viewBox={`0 0 ${chartSize} ${chartSize}`}
        style={styles.moodShapeSvg}
      >
        {hasMoodData ? (
          <>
            <SvgPolygon
              points={dataPolygonPoints}
              fill="#dfe7c9"
              fillOpacity={0.58}
              stroke="#6f7d42"
              strokeWidth={3.1}
              strokeLinejoin="round"
            />
            {dataPoints.map((point) => (
              <Circle
                key={point.label}
                cx={point.x}
                cy={point.y}
                r={6.4}
                fill="#6f7d42"
                stroke="#fff8ec"
                strokeWidth={1.9}
              />
            ))}
          </>
        ) : (
          <Circle cx={center} cy={center} r={4} fill="#d8c9b3" />
        )}
      </Svg>

      {axes.map((axis) => {
        const item = summaryByLabel.get(axis.label);

        return (
          <View key={axis.label} style={[styles.moodShapeLabel, axis.labelStyle]}>
            <Image
              source={getMoodFaceImage(axis.label)}
              style={[
                styles.moodShapeFace,
                { backgroundColor: item?.color || colors.nav },
              ]}
              resizeMode="contain"
            />
            <Text style={styles.moodShapeLabelText}>{axis.label}</Text>
          </View>
        );
      })}

      <View style={styles.moodShapeTodayPill}>
        <Feather name="calendar" size={12} color="#5b6f41" />
        <Text style={styles.moodShapeTodayText}>This week</Text>
      </View>
    </View>
  );
}

function MoodTimelineChart({ timelinePoints }: { timelinePoints: MoodTimelinePoint[] }) {
  const chartWidth = 238;
  const chartHeight = 168;
  const paddingX = 10;
  const paddingY = 18;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;
  const pointCount = timelinePoints.length;
  const getX = (index: number) =>
    pointCount <= 1 ? chartWidth / 2 : paddingX + (index / (pointCount - 1)) * graphWidth;
  const getY = (level: number) => paddingY + ((4 - level) / 3) * graphHeight;
  const plottedPoints = timelinePoints.map((point, index) => ({
    ...point,
    x: getX(index),
    y: point.moodLevel ? getY(point.moodLevel) : null,
  }));
  const moodPoints = plottedPoints.flatMap((point) =>
    point.y !== null && point.moodLevel !== null
      ? [{ ...point, y: point.y, moodLevel: point.moodLevel }]
      : [],
  );
  const smoothPath = buildSmoothLinePath(moodPoints);

  return (
    <View style={styles.moodTimelineWrap}>
      <View style={styles.moodTimelineHeader}>
        <View>
          <Text style={styles.moodTimelineTitle}>Mood timeline</Text>
          <Text style={styles.moodTimelineSubtitle}>Last 7 days</Text>
        </View>
        <View style={styles.moodTimelineFullButton}>
          <Text style={styles.moodTimelineFullButtonText}>Full timeline</Text>
          <Feather name="chevron-right" size={13} color="#8d7a61" />
        </View>
      </View>

      <View style={styles.moodTimelineChartBody}>
        <View style={styles.moodTimelineMoodRail}>
          {['Calm', 'Down', 'Sad', 'Irritable'].map((label) => (
            <View key={label} style={styles.moodTimelineMoodDotRow}>
              <Image
                source={getMoodFaceImage(label)}
                style={[
                  styles.moodTimelineMoodFace,
                  { backgroundColor: moodChartColors[label] },
                ]}
                resizeMode="contain"
              />
            </View>
          ))}
        </View>
        <View style={styles.moodTimelinePlotArea}>
          <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {[4, 3, 2, 1].map((level) => (
              <SvgLine
                key={level}
                x1={paddingX}
                y1={getY(level)}
                x2={chartWidth - paddingX}
                y2={getY(level)}
                stroke="#eadcc8"
                strokeWidth={0.95}
                strokeDasharray="6 7"
              />
            ))}
            <SvgLine
              x1={paddingX}
              y1={paddingY - 5}
              x2={paddingX}
              y2={chartHeight - paddingY + 5}
              stroke="#ddc9aa"
              strokeWidth={1}
            />
            <SvgLine
              x1={paddingX - 4}
              y1={chartHeight - paddingY}
              x2={chartWidth - paddingX + 3}
              y2={chartHeight - paddingY}
              stroke="#ddc9aa"
              strokeWidth={1}
            />
            {moodPoints.length > 1 && smoothPath ? (
              <SvgPath
                d={smoothPath}
                fill="none"
                stroke="#7a843f"
                strokeWidth={2.35}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {moodPoints.map((point) => (
              <Circle
                key={point.id}
                cx={point.x}
                cy={point.y}
                r={5}
                fill="#7a843f"
                stroke="#fff8ec"
                strokeWidth={1.5}
              />
            ))}
          </Svg>

          <View style={styles.moodTimelineDayRow}>
            {plottedPoints.map((point) => (
              <View
                key={`${point.id}-day`}
                style={styles.moodTimelineDayItem}
                accessibilityLabel={`${point.day} ${point.dateLabel}`}
              >
                <Text style={styles.moodTimelineDayText}>{point.dayNumber}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function MoodStatsCard({
  moodChartView,
  moodSummary,
  moodTimelinePoints,
  onChangeMoodChartView,
}: {
  moodChartView: MoodChartView;
  moodSummary: MoodSummaryItem[];
  moodTimelinePoints: MoodTimelinePoint[];
  onChangeMoodChartView: (view: MoodChartView) => void;
}) {
  const totalMoodCount = moodSummary.reduce((sum, item) => sum + item.count, 0);
  const hasMoodTimelineData = moodTimelinePoints.some((point) => point.moodLevel !== null);

  return (
    <View style={styles.patternCard}>
      <View style={styles.patternHeaderRow}>
        <View>
          <Text style={styles.patternCardTitle}>Mood pattern</Text>
          <Text style={styles.moodStatsSubtitle}>
            {totalMoodCount > 0
              ? `${totalMoodCount} ${totalMoodCount === 1 ? 'mood' : 'moods'} this week`
              : 'Save a trace to begin'}
          </Text>
        </View>
        <View style={styles.moodChartToggle}>
          <TouchableOpacity
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Show mood timeline chart"
            accessibilityState={{ selected: moodChartView === 'timeline' }}
            onPress={() => onChangeMoodChartView('timeline')}
            style={[styles.moodChartToggleButton, moodChartView === 'timeline' && styles.moodChartToggleButtonActive]}
          >
            <Feather name="trending-up" size={17} color={moodChartView === 'timeline' ? '#fff8ef' : '#6b5b4a'} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Show mood shape chart"
            accessibilityState={{ selected: moodChartView === 'shape' }}
            onPress={() => onChangeMoodChartView('shape')}
            style={[styles.moodChartToggleButton, moodChartView === 'shape' && styles.moodChartToggleButtonActive]}
          >
            <Feather name="aperture" size={16} color={moodChartView === 'shape' ? '#fff8ef' : '#6b5b4a'} />
          </TouchableOpacity>
        </View>
      </View>

      {moodChartView === 'shape' ? (
        <MoodShapeChart moodSummary={moodSummary} />
      ) : hasMoodTimelineData ? (
        <MoodTimelineChart timelinePoints={moodTimelinePoints} />
      ) : (
        <View style={styles.moodEmptyChart}>
          <Text style={styles.signalEmptyText}>Your mood line will appear after a few saved traces.</Text>
        </View>
      )}
    </View>
  );
}

function PatternsScreen({
  currentTraceRecord,
  loopSignatures,
  savedTraceRecords,
  recommendedAction,
  recommendedActionDefinition,
  weeklyReflectionPreview,
  onTryLoopAction,
}: {
  currentTraceRecord: MoodTraceRecord | null;
  loopSignatures: LoopSignature[];
  savedTraceRecords: MoodTraceRecord[];
  recommendedAction: RecommendedAction;
  recommendedActionDefinition: ActionDefinition;
  weeklyReflectionPreview: WeeklyReflectionPreview;
  onTryLoopAction: () => void;
}) {
  const [expandedSignalDay, setExpandedSignalDay] = React.useState<string | null>(null);
  const [moodChartView, setMoodChartView] = React.useState<MoodChartView>('timeline');
  const bodySignalDays = React.useMemo(
    () => buildBodySignalDaysFromTraces(savedTraceRecords),
    [savedTraceRecords],
  );
  const bodySignalSummary = React.useMemo(
    () => buildBodySignalSummary(bodySignalDays),
    [bodySignalDays],
  );
  const moodSummary = React.useMemo(
    () => buildMoodSummary(savedTraceRecords),
    [savedTraceRecords],
  );
  const moodTimelinePoints = React.useMemo(
    () => buildMoodTimeline(savedTraceRecords),
    [savedTraceRecords],
  );
  const expandedSignalDayItem = bodySignalDays.find((item) => item.day === expandedSignalDay);
  const activeLoopSignature = currentTraceRecord?.loopSignature || loopSignatures[0] || null;
  const patternVisibility = getPatternVisibility(activeLoopSignature, savedTraceRecords);
  const patternState = getPatternState(patternVisibility);
  const loopChainForDisplay = activeLoopSignature?.signalKeys || repeatingLoopChain;
  const weeklyCard = weeklyReflectionPreview.summaryCard;
  return (
    <>
      <Text style={styles.title}>Patterns</Text>

      {patternVisibility.canShowLoop ? (
        <View style={styles.patternCard}>
          <View style={styles.patternHeaderRow}>
            <Text style={styles.patternCardTitle}>{patternState.title}</Text>
            <View style={styles.patternMetaPill}>
              <Text style={styles.patternMetaPillText}>Last {patternVisibility.windowDays} days</Text>
            </View>
          </View>
          <Text style={styles.patternSubtext}>{patternState.subtitle}</Text>
          <Text style={styles.patternEvidenceLine}>{getPatternEvidenceLine(patternVisibility)}</Text>

          <View style={styles.loopList}>
            {loopChainForDisplay.map((item, index, chain) => (
              <LoopRow key={`${item}-${index}`} item={item} isLast={index === chain.length - 1} />
            ))}
          </View>

          {patternVisibility.canShowLoopAction ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Try ${recommendedActionDefinition.title}`}
              onPress={onTryLoopAction}
              style={styles.tryActionButton}
            >
              <View style={styles.tryActionIconWrap}>
                <Feather name="star" size={19} color="#fff8ef" />
              </View>
              <View style={styles.tryActionCopy}>
                <Text style={styles.tryActionTitle}>Try a small action</Text>
                <Text style={styles.tryActionSubtitle}>
                  {recommendedAction.mode === 'loop_action'
                    ? `For this loop: ${recommendedActionDefinition.title}`
                    : `For today: ${recommendedActionDefinition.title}`}
                </Text>
              </View>
              <Feather name="arrow-right" size={23} color="#5b6f41" />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <View style={styles.patternLearningCard}>
          <Image source={assets.roraLearningMascot} style={styles.patternLearningMascot} resizeMode="contain" />
          <Text style={styles.patternLearningTitle}>Rora is still learning your rhythm.</Text>
          <Text style={styles.patternLearningBody}>
            Every trace you save helps Rora understand what tends to repeat.
          </Text>
        </View>
      )}

      <MoodStatsCard
        moodChartView={moodChartView}
        moodSummary={moodSummary}
        moodTimelinePoints={moodTimelinePoints}
        onChangeMoodChartView={setMoodChartView}
      />

      <View style={styles.patternCard}>
        <View style={styles.patternHeaderRow}>
          <Text style={styles.patternCardTitle}>Body signals</Text>
          <View style={styles.segmentedControl}>
            <View style={styles.segmentActive}>
              <Text style={styles.segmentActiveText}>7D</Text>
            </View>
          </View>
        </View>

        <View style={styles.signalWeekRow}>
          {bodySignalDays.map((item) => (
            <BodySignalDay
              key={item.day}
              day={item.day}
              expanded={expandedSignalDay === item.day}
              onToggle={() => setExpandedSignalDay((currentDay) => (currentDay === item.day ? null : item.day))}
              signals={item.signals}
            />
          ))}
        </View>

        {expandedSignalDayItem && expandedSignalDayItem.signals.length > 0 ? (
          <View style={styles.signalDayDetails}>
            <Text style={styles.signalDayDetailsTitle}>
              {fullDayNameByShortName[expandedSignalDayItem.day] ?? expandedSignalDayItem.day}
            </Text>
            <View style={styles.signalDayDetailsList}>
              {expandedSignalDayItem.signals.map((signal) => (
                <View key={signal} style={styles.signalDayDetailChip}>
                  <Image
                    source={traceIconDictionary[signal].image}
                    style={styles.signalDayDetailIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.signalDayDetailText}>{getTraceIconPlainLabel(signal)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {bodySignalSummary.length > 0 ? (
          <View style={styles.signalSummaryList}>
            {bodySignalSummary.map((item) => (
              <View key={item.key} style={styles.signalSummaryRow}>
                <Image
                  source={traceIconDictionary[item.key].image}
                  style={styles.signalSummaryIcon}
                  resizeMode="contain"
                />
                <View style={styles.signalSummaryCopy}>
                  <View style={styles.signalSummaryTextRow}>
                    <Text style={styles.signalSummaryLabel}>{item.label}</Text>
                    <Text style={styles.signalSummaryCount}>{item.count}</Text>
                  </View>
                  <View style={styles.signalBarTrack}>
                    <View style={[styles.signalBarFill, { width: item.width }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.signalEmptyText}>
            Save a few traces and Rora will start showing which body signals repeat.
          </Text>
        )}
      </View>

      <View style={styles.weeklyReflectionCard}>
        <View style={styles.weeklyReflectionHeader}>
          <View>
            <Text style={styles.patternCardTitle}>Weekly Reflection</Text>
          </View>
        </View>

        <View style={styles.weeklyAiSummaryCard}>
          <View style={styles.weeklyAiSummaryTop}>
            <Image source={assets.weeklyReportBook} style={styles.weeklyAiSummaryAvatar} resizeMode="contain" />
            <View style={styles.weeklyAiSummaryHeaderCopy}>
              <Text style={styles.weeklyAiSummaryLabel}>{weeklyCard.eyebrow}</Text>
            </View>
          </View>

          <Text style={styles.weeklyAiSummaryTitle}>{weeklyCard.headline}</Text>
          <Text style={styles.weeklyAiSummaryText}>{weeklyCard.summary}</Text>

          <View style={styles.weeklyAiSummaryEvidence}>
            <Feather name="check-circle" size={14} color="#6f7b42" />
            <Text style={styles.weeklyAiSummaryEvidenceText}>{weeklyCard.evidenceChip}</Text>
          </View>

          <View style={styles.weeklyAiSummaryNextStep}>
            <Text style={styles.weeklyAiSummaryNextLabel}>{weeklyCard.bottomRow.label}</Text>
            <Text style={styles.weeklyAiSummaryNextTitle}>{weeklyCard.bottomRow.title}</Text>
            <Text style={styles.weeklyAiSummaryNextDetail}>{weeklyCard.bottomRow.detail}</Text>
          </View>
          <Text style={styles.weeklyAiSummaryBoundary}>{weeklyCard.boundaryLine}</Text>
        </View>
      </View>
    </>
  );
}

export default function App() {
  const [selectedMood, setSelectedMood] = React.useState<string | null>(null);
  const [selectedBodySignals, setSelectedBodySignals] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('today');
  const [activeActionView, setActiveActionView] = React.useState<ActionView>('list');
  const [selectedActionId, setSelectedActionId] = React.useState<ActionId>(fallbackActionId);
  const [selectedActionRecommendationMode, setSelectedActionRecommendationMode] =
    React.useState<ActionRecommendationMode>('daily_action');
  const [actionRunState, setActionRunState] = React.useState<ActionRunState>('idle');
  const [actionAnswers, setActionAnswers] = React.useState<ActionAnswers>(emptyActionAnswers);
  const [selectedHelpfulness, setSelectedHelpfulness] = React.useState<ActionHelpfulness | null>(null);
  const [noticingState, setNoticingState] = React.useState<NoticingState>('starting_focus');
  const [isNoticingCardFlipped, setIsNoticingCardFlipped] = React.useState(false);
  const [isRecordingReviewOpen, setIsRecordingReviewOpen] = React.useState(false);
  const [reflectionReviewStep, setReflectionReviewStep] = React.useState<ReflectionReviewStep>('capture');
  const [reflectionInputMode, setReflectionInputMode] = React.useState<ReflectionInputMode>('speak');
  const [draftTranscript, setDraftTranscript] = React.useState('');
  const [draftTraceResult, setDraftTraceResult] = React.useState<MockTraceResult>(startingFocusTraceResult);
  const [draftReviewExtraction, setDraftReviewExtraction] = React.useState<TraceExtraction[]>([]);
  const [draftAiTraceResponse, setDraftAiTraceResponse] = React.useState<AiTraceExtractionResponse | null>(null);
  const [editingTraceId, setEditingTraceId] = React.useState<string | null>(null);
  const [editingDraftFieldLabel, setEditingDraftFieldLabel] = React.useState<string | null>(null);
  const [voiceCaptureState, setVoiceCaptureState] = React.useState<
    'idle' | 'preparing' | 'speaking' | 'recording' | 'transcribing' | 'ready' | 'unsupported'
  >('idle');
  const [recordedAudioBase64, setRecordedAudioBase64] = React.useState<string | null>(null);
  const [recordedAudioMimeType, setRecordedAudioMimeType] = React.useState<string | null>(null);
  const [recordingElapsedMs, setRecordingElapsedMs] = React.useState(0);
  const [voiceWaveLevels, setVoiceWaveLevels] = React.useState<number[]>(voiceWaveBars);
  const [savedTranscript, setSavedTranscript] = React.useState('');
  const [lastSavedAtLabel, setLastSavedAtLabel] = React.useState('');
  const [traceResult, setTraceResult] = React.useState<MockTraceResult>(startingFocusTraceResult);
  const [savedTraceRecords, setSavedTraceRecords] = React.useState<MoodTraceRecord[]>([]);
  const [actionMemoryEntries, setActionMemoryEntries] = React.useState<ActionMemoryEntry[]>([]);
  const [aiWeeklyReflectionPreview, setAiWeeklyReflectionPreview] =
    React.useState<WeeklyReflectionPreview | null>(null);
  const [hasHydratedMemory, setHasHydratedMemory] = React.useState(false);
  const [seenPatternMilestones, setSeenPatternMilestones] = React.useState<PatternMilestoneId[]>([]);
  const [activePatternMilestone, setActivePatternMilestone] = React.useState<PatternMilestoneId | null>(null);
  const patternConfettiProgress = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const mediaRecorderRef = React.useRef<any>(null);
  const mediaStreamRef = React.useRef<any>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const speechRecognitionRef = React.useRef<any>(null);
  const audioContextRef = React.useRef<any>(null);
  const audioSourceRef = React.useRef<any>(null);
  const analyserRef = React.useRef<any>(null);
  const waveAnimationFrameRef = React.useRef<number | null>(null);
  const lastWaveUpdateAtRef = React.useRef(0);
  const recordingStartedAtRef = React.useRef<number | null>(null);
  const recordingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const moodPromptAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const moodPromptFallbackTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodPromptSpeechCacheRef = React.useRef<Map<string, MoodAiSpeechResponse>>(new Map());
  const moodPromptPreloadRef = React.useRef<{
    key: string;
    promise: Promise<MoodAiSpeechResponse>;
  } | null>(null);
  const weeklyReflectionRequestKeyRef = React.useRef<string | null>(null);

  const loopSignatures = React.useMemo(
    () => buildLoopSignaturesFromTraces(savedTraceRecords),
    [savedTraceRecords],
  );
  const rawCurrentTraceRecord = savedTraceRecords[0] || null;
  const currentTraceRecord = React.useMemo(() => {
    if (!rawCurrentTraceRecord) {
      return null;
    }

    const updatedLoopSignature = loopSignatures.find(
      (signature) => signature.chainKey === rawCurrentTraceRecord.loopSignature.chainKey,
    );

    if (!updatedLoopSignature) {
      return rawCurrentTraceRecord;
    }

    return {
      ...rawCurrentTraceRecord,
      loopSignature: updatedLoopSignature,
    };
  }, [loopSignatures, rawCurrentTraceRecord]);
  const currentLoopTraceRecords = React.useMemo(
    () => getLoopRecords(savedTraceRecords, currentTraceRecord?.loopSignature.chainKey || null),
    [currentTraceRecord, savedTraceRecords],
  );
  const currentPatternVisibility = React.useMemo(
    () => getPatternVisibility(currentTraceRecord?.loopSignature || null, savedTraceRecords),
    [currentTraceRecord, savedTraceRecords],
  );
  const currentPatternEvidenceLine = React.useMemo(
    () => getPatternEvidenceLine(currentPatternVisibility),
    [currentPatternVisibility],
  );
  const actionLoopContextKeys = React.useMemo(
    () => currentTraceRecord?.loopSignature.signalKeys.slice(0, 2) || (['overthinking', 'stomach_tightness'] as TraceIconKey[]),
    [currentTraceRecord],
  );
  const helpfulnessMemories = React.useMemo(
    () => buildHelpfulnessMemory(actionMemoryEntries),
    [actionMemoryEntries],
  );
  const weeklyReflectionPreview = React.useMemo(
    () =>
      buildWeeklyReflectionPreview({
        traceRecords: savedTraceRecords,
        actionMemoryEntries,
        helpfulnessMemories,
      }),
    [actionMemoryEntries, helpfulnessMemories, savedTraceRecords],
  );
  const displayWeeklyReflectionPreview = aiWeeklyReflectionPreview || weeklyReflectionPreview;
  const dailyRecommendedAction = React.useMemo(
    () =>
      getRuleBasedRecommendedAction({
        traceRecord: currentTraceRecord,
        actionMemoryEntries,
        helpfulnessMemories,
        loopIsVisible: false,
        loopEvidenceLine: currentPatternEvidenceLine,
      }),
    [actionMemoryEntries, currentPatternEvidenceLine, currentTraceRecord, helpfulnessMemories],
  );
  const dailyRecommendedActionDefinition = React.useMemo(
    () => getActionDefinition(dailyRecommendedAction.actionId),
    [dailyRecommendedAction],
  );
  const loopRecommendedAction = React.useMemo(
    () =>
      getRuleBasedRecommendedAction({
        traceRecord: currentTraceRecord,
        actionMemoryEntries,
        helpfulnessMemories,
        loopIsVisible: currentPatternVisibility.canShowLoopAction,
        loopEvidenceLine: currentPatternEvidenceLine,
      }),
    [actionMemoryEntries, currentPatternEvidenceLine, currentPatternVisibility.canShowLoopAction, currentTraceRecord, helpfulnessMemories],
  );
  const loopRecommendedActionDefinition = React.useMemo(
    () => getActionDefinition(loopRecommendedAction.actionId),
    [loopRecommendedAction],
  );
  const selectedActionRecommendation = React.useMemo(
    () =>
      selectedActionRecommendationMode === 'loop_action'
        ? loopRecommendedAction
        : dailyRecommendedAction,
    [dailyRecommendedAction, loopRecommendedAction, selectedActionRecommendationMode],
  );
  const selectedAction = React.useMemo(
    () => getActionDefinition(selectedActionId),
    [selectedActionId],
  );
  const currentHelpfulnessMemory = React.useMemo(() => {
    if (!currentTraceRecord) {
      return null;
    }

    return getBestPositiveHelpfulnessMemoryForLoop(
      helpfulnessMemories,
      currentTraceRecord.loopSignature.chainKey,
    );
  }, [currentTraceRecord, helpfulnessMemories]);

  React.useEffect(() => {
    const persistedSnapshot = readPersistedMoodMemory();
    setSeenPatternMilestones(readSeenPatternMilestones());

    if (!persistedSnapshot) {
      setHasHydratedMemory(true);
      return;
    }

    const persistedTraces = Array.isArray(persistedSnapshot.traces)
      ? persistedSnapshot.traces.map(hydrateMoodTraceRecord)
      : [];
    const persistedActionMemory = Array.isArray(persistedSnapshot.actionMemory)
      ? persistedSnapshot.actionMemory.map(hydrateActionMemoryEntry)
      : [];
    const latestTrace = persistedTraces[0] || null;

    setSavedTraceRecords(persistedTraces);
    setActionMemoryEntries(persistedActionMemory);

    if (latestTrace) {
      setSavedTranscript(latestTrace.transcript);
      setTraceResult(getTraceResultFromRecord(latestTrace));
      setSelectedMood(latestTrace.moodLabel);
      setSelectedBodySignals(latestTrace.bodySignalLabels);
      setLastSavedAtLabel(`Saved ${formatMemoryDate(latestTrace.savedAt || latestTrace.createdAt).toLowerCase()}`);
      setNoticingState('today_trace');
      setIsNoticingCardFlipped(false);
    }

    setHasHydratedMemory(true);
  }, []);

  React.useEffect(() => {
    if (!hasHydratedMemory || activeTab !== 'patterns' || activePatternMilestone) {
      return;
    }

    const nextMilestone = getPatternMilestoneId(currentPatternVisibility);

    if (!nextMilestone || seenPatternMilestones.includes(nextMilestone)) {
      return;
    }

    setActivePatternMilestone(nextMilestone);
  }, [
    activePatternMilestone,
    activeTab,
    currentPatternVisibility.canShowLoop,
    currentPatternVisibility.canShowLoopAction,
    hasHydratedMemory,
    seenPatternMilestones,
  ]);

  React.useEffect(() => {
    if (!activePatternMilestone) {
      patternConfettiProgress.stopAnimation();
      patternConfettiProgress.setValue(0);
      return;
    }

    patternConfettiProgress.stopAnimation(() => {
      patternConfettiProgress.setValue(0);
      Animated.timing(patternConfettiProgress, {
        toValue: 1,
        duration: 1550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });
  }, [activePatternMilestone, patternConfettiProgress]);

  React.useEffect(() => {
    if (!hasHydratedMemory || activeTab !== 'patterns') {
      return;
    }

    const traceKey = savedTraceRecords
      .filter((record) => record.safetyAssessment.canShowPattern)
      .map((record) => `${record.id}:${record.savedAt || record.createdAt}:${record.loopSignature.chainKey}`)
      .join('|');
    const actionKey = actionMemoryEntries
      .map((entry) => `${entry.id}:${entry.completedAt}:${entry.helpfulness}`)
      .join('|');
    const requestKey = `${traceKey}::${actionKey}`;

    if (!traceKey && !actionKey) {
      setAiWeeklyReflectionPreview(null);
      weeklyReflectionRequestKeyRef.current = null;
      return;
    }

    if (weeklyReflectionRequestKeyRef.current === requestKey) {
      return;
    }

    weeklyReflectionRequestKeyRef.current = requestKey;
    setAiWeeklyReflectionPreview(null);

    let cancelled = false;

    runOpenAiWeeklyReflection({
      localPreview: weeklyReflectionPreview,
      traces: savedTraceRecords,
      actionMemory: actionMemoryEntries,
      helpfulnessMemory: helpfulnessMemories,
    })
      .then((preview) => {
        if (!cancelled) {
          setAiWeeklyReflectionPreview(preview);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAiWeeklyReflectionPreview(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    actionMemoryEntries,
    activeTab,
    hasHydratedMemory,
    helpfulnessMemories,
    savedTraceRecords,
    weeklyReflectionPreview,
  ]);

  React.useEffect(() => {
    if (!hasHydratedMemory) {
      return;
    }

    writePersistedMoodMemory({
      schemaVersion: 1,
      savedAt: new Date().toISOString(),
      traces: savedTraceRecords,
      loopSignatures,
      actionMemory: actionMemoryEntries,
      helpfulnessMemory: helpfulnessMemories,
      weeklyReflectionPreview: displayWeeklyReflectionPreview,
    });
  }, [
    actionMemoryEntries,
    displayWeeklyReflectionPreview,
    hasHydratedMemory,
    helpfulnessMemories,
    loopSignatures,
    savedTraceRecords,
  ]);
  const reflectionPrompt = React.useMemo(
    () => getReflectionPrompt({ selectedMood, selectedBodySignals }),
    [selectedMood, selectedBodySignals],
  );

  const stopRecordingClock = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const startRecordingClock = () => {
    stopRecordingClock();
    recordingStartedAtRef.current = Date.now();
    setRecordingElapsedMs(0);
    recordingTimerRef.current = setInterval(() => {
      if (!recordingStartedAtRef.current) {
        return;
      }

      setRecordingElapsedMs(Date.now() - recordingStartedAtRef.current);
    }, 80);
  };

  const stopVoiceMeter = (shouldResetLevels = true) => {
    if (waveAnimationFrameRef.current !== null) {
      globalThis.cancelAnimationFrame?.(waveAnimationFrameRef.current);
      waveAnimationFrameRef.current = null;
    }

    try {
      audioSourceRef.current?.disconnect?.();
    } catch {
      // Audio nodes can already be disconnected when recording stops.
    }

    try {
      analyserRef.current?.disconnect?.();
    } catch {
      // Audio nodes can already be disconnected when recording stops.
    }

    try {
      void audioContextRef.current?.close?.();
    } catch {
      // Closing an already closed AudioContext is harmless here.
    }

    audioSourceRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
    lastWaveUpdateAtRef.current = 0;

    if (shouldResetLevels) {
      setVoiceWaveLevels(voiceWaveBars);
    }
  };

  const startVoiceMeter = (stream: any) => {
    if (Platform.OS !== 'web' || !stream) {
      return;
    }

    const audioGlobal = globalThis as typeof globalThis & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextConstructor = audioGlobal.AudioContext || audioGlobal.webkitAudioContext;

    if (!AudioContextConstructor || !globalThis.requestAnimationFrame) {
      return;
    }

    try {
      stopVoiceMeter(false);

      const audioContext = new AudioContextConstructor();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      audioSourceRef.current = source;
      analyserRef.current = analyser;

      const sampleBuffer = new Uint8Array(analyser.fftSize);
      const barCount = voiceWaveBars.length;

      const updateWave = (timestamp: number) => {
        const activeAnalyser = analyserRef.current;

        if (!activeAnalyser) {
          return;
        }

        if (timestamp - lastWaveUpdateAtRef.current > 58) {
          activeAnalyser.getByteTimeDomainData(sampleBuffer);
          const samplesPerBar = Math.max(1, Math.floor(sampleBuffer.length / barCount));
          const nextLevels = Array.from({ length: barCount }, (_, barIndex) => {
            const startIndex = barIndex * samplesPerBar;
            let sum = 0;

            for (let sampleIndex = 0; sampleIndex < samplesPerBar; sampleIndex += 1) {
              const sample = sampleBuffer[startIndex + sampleIndex] ?? 128;
              sum += Math.abs(sample - 128) / 128;
            }

            const localAverage = sum / samplesPerBar;
            const centerWeight = 1 - Math.min(0.58, Math.abs(barIndex - barCount / 2) / barCount);
            const height = 2 + Math.round(Math.min(1, localAverage * 6.5) * 42 * centerWeight);

            return Math.max(2, height);
          });

          setVoiceWaveLevels(nextLevels);
          lastWaveUpdateAtRef.current = timestamp;
        }

        waveAnimationFrameRef.current = globalThis.requestAnimationFrame(updateWave);
      };

      waveAnimationFrameRef.current = globalThis.requestAnimationFrame(updateWave);
    } catch {
      setVoiceWaveLevels(voiceWaveBars);
    }
  };

  const stopVoiceTracks = () => {
    mediaStreamRef.current?.getTracks?.().forEach((track: { stop: () => void }) => track.stop());
    mediaStreamRef.current = null;
  };

  const stopSpeechRecognition = () => {
    try {
      speechRecognitionRef.current?.stop?.();
    } catch {
      // Browser speech recognition can throw if it already stopped.
    }

    speechRecognitionRef.current = null;
  };

  const resetRecordedAudio = () => {
    stopSpeechRecognition();
    stopRecordingClock();
    stopVoiceMeter();
    audioChunksRef.current = [];
    setRecordedAudioBase64(null);
    setRecordedAudioMimeType(null);
    setRecordingElapsedMs(0);
    setVoiceCaptureState('idle');
  };

  const stopMoodPromptSpeech = () => {
    if (moodPromptFallbackTimerRef.current) {
      clearTimeout(moodPromptFallbackTimerRef.current);
      moodPromptFallbackTimerRef.current = null;
    }

    const currentAudio = moodPromptAudioRef.current;

    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.onerror = null;

      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch {
        // Some embedded browsers restrict media controls after navigation.
      }
    }

    if (Platform.OS === 'web') {
      try {
        (globalThis as typeof globalThis & { speechSynthesis?: SpeechSynthesis }).speechSynthesis?.cancel();
      } catch {
        // Browser speech synthesis can throw in restricted webviews.
      }
    }

    moodPromptAudioRef.current = null;
  };

  const preloadMoodPromptSpeech = (promptText: string) => {
    const normalizedPrompt = promptText.trim();

    if (Platform.OS !== 'web' || !normalizedPrompt) {
      return Promise.resolve(null);
    }

    const cachedSpeech = moodPromptSpeechCacheRef.current.get(normalizedPrompt);

    if (cachedSpeech) {
      return Promise.resolve(cachedSpeech);
    }

    if (moodPromptPreloadRef.current?.key === normalizedPrompt) {
      return moodPromptPreloadRef.current.promise;
    }

    const promise = requestMoodPromptSpeech({ text: normalizedPrompt })
      .then((speechResponse) => {
        moodPromptSpeechCacheRef.current.set(normalizedPrompt, speechResponse);
        return speechResponse;
      })
      .finally(() => {
        if (moodPromptPreloadRef.current?.key === normalizedPrompt) {
          moodPromptPreloadRef.current = null;
        }
      });

    moodPromptPreloadRef.current = {
      key: normalizedPrompt,
      promise,
    };

    return promise;
  };

  const speakMoodPromptThenStart = (promptText: string) => {
    if (Platform.OS !== 'web') {
      void startVoiceCapture();
      return;
    }

    const AudioConstructor = (globalThis as typeof globalThis & { Audio?: typeof Audio }).Audio;

    let hasStartedRecording = false;

    const startAfterPrompt = () => {
      if (hasStartedRecording) {
        return;
      }

      hasStartedRecording = true;
      moodPromptAudioRef.current = null;

      if (moodPromptFallbackTimerRef.current) {
        clearTimeout(moodPromptFallbackTimerRef.current);
        moodPromptFallbackTimerRef.current = null;
      }

      void startVoiceCapture();
    };

    try {
      stopMoodPromptSpeech();
      setVoiceCaptureState('preparing');

      moodPromptFallbackTimerRef.current = setTimeout(() => {
        startAfterPrompt();
      }, Math.min(7000, Math.max(2600, promptText.length * 70)));

      if (!AudioConstructor) {
        startAfterPrompt();
        return;
      }

      void preloadMoodPromptSpeech(promptText)
        .then((speechResponse) => {
          if (
            hasStartedRecording ||
            !speechResponse ||
            !speechResponse.ttsAudio.base64 ||
            !speechResponse.ttsAudio.mimeType
          ) {
            startAfterPrompt();
            return;
          }

          const promptAudio = new AudioConstructor(
            `data:${speechResponse.ttsAudio.mimeType};base64,${speechResponse.ttsAudio.base64}`,
          );

          promptAudio.onplaying = () => {
            if (!hasStartedRecording) {
              setVoiceCaptureState('speaking');
            }
          };
          promptAudio.onplay = () => {
            if (!hasStartedRecording) {
              setVoiceCaptureState('speaking');
            }
          };
          promptAudio.onended = startAfterPrompt;
          promptAudio.onerror = startAfterPrompt;
          moodPromptAudioRef.current = promptAudio;

          void promptAudio.play().catch(() => {
            startAfterPrompt();
          });
        })
        .catch(() => {
          startAfterPrompt();
        });
    } catch {
      startAfterPrompt();
    }
  };

  React.useEffect(() => {
    if (!selectedMood && selectedBodySignals.length === 0) {
      return;
    }

    void preloadMoodPromptSpeech(reflectionPrompt).catch(() => {
      // The click path still falls back to live generation or direct recording.
    });
  }, [reflectionPrompt, selectedMood, selectedBodySignals]);

  const finishVoiceCapture = () =>
    new Promise<{ base64: string; mimeType: string } | null>((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === 'inactive') {
        resolve(
          recordedAudioBase64 && recordedAudioMimeType
            ? { base64: recordedAudioBase64, mimeType: recordedAudioMimeType }
            : null,
        );
        return;
      }

      recorder.onstop = async () => {
        try {
          const mimeType = recorder.mimeType || recordedAudioMimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const base64 = await readBlobAsBase64(audioBlob);

          setRecordedAudioBase64(base64);
          setRecordedAudioMimeType(mimeType);
          setVoiceCaptureState('ready');
          resolve({ base64, mimeType });
        } catch {
          setVoiceCaptureState('idle');
          resolve(null);
        } finally {
          stopRecordingClock();
          stopVoiceMeter(false);
          stopSpeechRecognition();
          stopVoiceTracks();
          mediaRecorderRef.current = null;
        }
      };

      stopRecordingClock();
      recorder.stop();
    });

  const startVoiceCapture = async () => {
    if (Platform.OS !== 'web') {
      setVoiceCaptureState('unsupported');
      return;
    }

    const MediaRecorderConstructor = getBrowserMediaRecorder();
    const mediaDevices = (globalThis.navigator as Navigator | undefined)?.mediaDevices;

    if (!MediaRecorderConstructor || !mediaDevices?.getUserMedia) {
      setVoiceCaptureState('unsupported');
      return;
    }

    try {
      resetRecordedAudio();
      const stream = await mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const recorder = new MediaRecorderConstructor(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data?.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      const SpeechRecognitionConstructor = getBrowserSpeechRecognition();

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        let finalTranscript = '';

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = globalThis.navigator?.language || 'en-US';
        recognition.onresult = (event: any) => {
          let interimTranscript = '';

          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const transcriptPiece = event.results[index][0]?.transcript || '';

            if (event.results[index].isFinal) {
              finalTranscript = `${finalTranscript} ${transcriptPiece}`.trim();
            } else {
              interimTranscript = `${interimTranscript} ${transcriptPiece}`.trim();
            }
          }

          setDraftTranscript(`${finalTranscript} ${interimTranscript}`.trim());
        };
        recognition.onerror = () => undefined;
        speechRecognitionRef.current = recognition;

        try {
          recognition.start();
        } catch {
          speechRecognitionRef.current = null;
        }
      }

      recorder.start();
      startVoiceMeter(stream);
      startRecordingClock();
      setVoiceCaptureState('recording');
    } catch {
      stopRecordingClock();
      stopVoiceMeter();
      stopVoiceTracks();
      setVoiceCaptureState('unsupported');
    }
  };

  const toggleVoiceCapture = async () => {
    if (voiceCaptureState === 'recording') {
      const finishedAudio = await finishVoiceCapture();

      if (!finishedAudio) {
        return;
      }

      try {
        setVoiceCaptureState('transcribing');
        const transcription = await transcribeRecordedAudio({
          audioBase64: finishedAudio.base64,
          audioMimeType: finishedAudio.mimeType,
        });

        if (transcription.transcript.trim()) {
          setDraftTranscript(transcription.transcript.trim());
        }

        setVoiceCaptureState('ready');
      } catch {
        setVoiceCaptureState('ready');
      }
      return;
    }

    await startVoiceCapture();
  };

  const whatHelpedActions = React.useMemo(() => {
    const currentChainKey = currentTraceRecord?.loopSignature.chainKey;
    const sortedMemoryEntries = [...actionMemoryEntries].sort((left, right) => {
      const leftMatchesCurrentLoop = currentChainKey && left.chainKey === currentChainKey;
      const rightMatchesCurrentLoop = currentChainKey && right.chainKey === currentChainKey;

      if (leftMatchesCurrentLoop !== rightMatchesCurrentLoop) {
        return leftMatchesCurrentLoop ? -1 : 1;
      }

      return right.completedAt.localeCompare(left.completedAt);
    });
    const savedActionRows = sortedMemoryEntries.map((entry, index) => ({
      id: entry.id,
      actionId: isActionId(entry.actionId) ? entry.actionId : fallbackActionId,
      title: entry.actionTitle,
      outcome: entry.outcomeLabel,
      date: formatMemoryDate(entry.completedAt),
      image: getActionImage(isActionId(entry.actionId) ? entry.actionId : fallbackActionId),
      isNew: Boolean(selectedHelpfulness) && index === 0,
      loopLabel: currentChainKey && entry.chainKey === currentChainKey ? 'For this loop' : 'Past loop',
      matchLabel:
        currentChainKey && entry.chainKey === currentChainKey
          ? currentTraceRecord?.loopSignature.label
          : loopSignatures.find((signature) => signature.chainKey === entry.chainKey)?.label ||
            'Saved from another trace',
    }));

    return [...savedActionRows, ...whatHelpedBeforeActions];
  }, [actionMemoryEntries, currentTraceRecord, loopSignatures, selectedHelpfulness]);

  const currentNoticingContent =
    noticingState === 'today_trace'
      ? { ...todayTraceContent, chain: traceResult.chain }
      : { ...noticingContentByState[noticingState], chain: traceResult.chain };
  const todayHeroVariant = getTodayHeroVariant();
  const canFlipNoticingCard = noticingState === 'today_trace' && savedTranscript.length > 0;
  const noticingCardAccessibilityLabel = canFlipNoticingCard
    ? 'What we are noticing. Tap for details.'
    : 'What we are noticing.';
  const noticingCardStyle = [
    styles.noticingCard,
    isNoticingCardFlipped && styles.noticingCardBack,
    !canFlipNoticingCard && styles.noticingCardStatic,
  ];
  const webNoticingCardStyle = getWebNoticingCardStyle({
    isBack: isNoticingCardFlipped,
    canFlip: canFlipNoticingCard,
  });
  const shouldShowDevSeedPanel =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('devSeed');

  const openRecordingReview = () => {
    setReflectionInputMode('speak');
    setReflectionReviewStep('capture');
    setDraftTraceResult(traceResult);
    setDraftReviewExtraction(traceResult.extraction.map(normalizeDraftReviewExtractionItem));
    setDraftAiTraceResponse(null);
    setEditingTraceId(null);
    resetRecordedAudio();
    setDraftTranscript('');

    setIsRecordingReviewOpen(true);
    setVoiceCaptureState('preparing');
    speakMoodPromptThenStart(reflectionPrompt);
  };

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    });
  };

  const openActionDetail = (
    actionId: ActionId = dailyRecommendedAction.actionId,
    recommendationMode: ActionRecommendationMode = 'daily_action',
  ) => {
    const nextAction = getActionDefinition(actionId);

    setSelectedActionId(actionId);
    setSelectedActionRecommendationMode(recommendationMode);
    setActiveTab('actions');
    setActiveActionView('detail');
    setActionRunState('idle');
    setActionAnswers(getEmptyActionAnswers(nextAction));
    scrollToTop();
  };

  const openActionsList = () => {
    setActiveTab('actions');
    setSelectedActionRecommendationMode('daily_action');
    setActiveActionView('list');
    scrollToTop();
  };

  const openActionBrowse = () => {
    setActiveTab('actions');
    setSelectedActionRecommendationMode('daily_action');
    setActiveActionView('browse');
    scrollToTop();
  };

  const applyDevSeed = React.useCallback(
    (scenario: DevSeedScenario) => {
      if (scenario === 'clear') {
        setSavedTraceRecords([]);
        setActionMemoryEntries([]);
        setSavedTranscript('');
        setTraceResult(startingFocusTraceResult);
        setSelectedMood(null);
        setSelectedBodySignals([]);
        setLastSavedAtLabel('');
        setNoticingState('starting_focus');
        setIsNoticingCardFlipped(false);
        setSelectedHelpfulness(null);
        setSelectedActionId(fallbackActionId);
        setSelectedActionRecommendationMode('daily_action');
        setActiveActionView('list');
        setActiveTab('patterns');
        setHasHydratedMemory(true);
        setSeenPatternMilestones([]);
        setActivePatternMilestone(null);

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.localStorage.removeItem(MOOD_MEMORY_STORAGE_KEY);
          window.localStorage.removeItem(PATTERN_MILESTONES_STORAGE_KEY);
        }

        scrollToTop();
        return { scenario, traceCount: 0, actionMemoryCount: 0 };
      }

      const traceCountByScenario: Record<Exclude<DevSeedScenario, 'clear'>, number> = {
        learning: 2,
        'possible-thread': 3,
        'loop-action': 4,
        'action-memory': 4,
      };
      const nextTraceRecords = buildDevTraceRecords(traceCountByScenario[scenario]);
      const latestTrace = nextTraceRecords[0];
      const actionDefinition = getActionDefinition('fact-guess-worry-split');
      const nextActionMemoryEntries =
        scenario === 'action-memory'
          ? [
              createActionMemoryEntry({
                traceRecord: latestTrace,
                actionId: actionDefinition.id,
                actionTitle: actionDefinition.title,
                recommendationMode: 'loop_action',
                recommendationSource: 'memory_helped',
                recommendationReason:
                  'Rora saw this work-feedback thread repeat and remembered this helped a little.',
                evidenceLine: 'Based on 4 saved traces across 4 days.',
                helpfulness: 'helped_a_little',
                answers: {
                  fact: 'A work message asked for one follow-up.',
                  guess: 'I guessed I had done something wrong.',
                  worry: 'I worried it would change how they saw me.',
                },
                completedAt: getIsoDaysAgo(0, 15),
              }),
            ]
          : [];

      setSavedTraceRecords(nextTraceRecords);
      setActionMemoryEntries(nextActionMemoryEntries);
      setSavedTranscript(latestTrace.transcript);
      setTraceResult(getTraceResultFromRecord(latestTrace));
      setSelectedMood(latestTrace.moodLabel);
      setSelectedBodySignals(latestTrace.bodySignalLabels);
      setLastSavedAtLabel(`Saved ${formatMemoryDate(latestTrace.savedAt || latestTrace.createdAt).toLowerCase()}`);
      setNoticingState('today_trace');
      setIsNoticingCardFlipped(false);
      setSelectedHelpfulness(null);
      setSelectedActionId(fallbackActionId);
      setSelectedActionRecommendationMode('daily_action');
      setActiveActionView('list');
      setActiveTab('patterns');
      setHasHydratedMemory(true);

      const previewMilestone = scenario === 'possible-thread'
        ? 'thread'
        : scenario === 'loop-action' || scenario === 'action-memory'
        ? 'loop_action'
        : null;
      setSeenPatternMilestones((currentMilestones) => {
        const nextMilestones = previewMilestone
          ? currentMilestones.filter((milestone) => milestone !== previewMilestone)
          : currentMilestones;
        writeSeenPatternMilestones(nextMilestones);

        return nextMilestones;
      });
      setActivePatternMilestone(previewMilestone);
      scrollToTop();

      return {
        scenario,
        traceCount: nextTraceRecords.length,
        actionMemoryCount: nextActionMemoryEntries.length,
        loopKey: latestTrace.normalizedFields.loopCandidateKey,
      };
    },
    [scrollToTop],
  );

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const browserWindow = window as typeof window & {
      roraDevSeed?: (scenario: DevSeedScenario) => unknown;
    };
    browserWindow.roraDevSeed = applyDevSeed;

    return () => {
      delete browserWindow.roraDevSeed;
    };
  }, [applyDevSeed]);

  const dismissPatternMilestone = () => {
    if (!activePatternMilestone) {
      return;
    }

    const dismissedMilestone = activePatternMilestone;
    setActivePatternMilestone(null);
    setSeenPatternMilestones((currentMilestones) => {
      const nextMilestones = Array.from(new Set([...currentMilestones, dismissedMilestone]));
      writeSeenPatternMilestones(nextMilestones);

      return nextMilestones;
    });
  };

  const updateActionAnswer = (key: ActionAnswerKey, value: string) => {
    setActionAnswers((currentAnswers) => ({
      ...currentAnswers,
      [key]: value,
    }));
  };

  const startAction = () => {
    setSelectedHelpfulness(null);
    setActionRunState('started');
    scrollToTop();
  };

  const completeAction = () => {
    setActionRunState('completed');
    scrollToTop();
  };

  const saveActionHelpfulness = (value: ActionHelpfulness) => {
    const actionTranscript = savedTranscript.trim() || getTraceResultFallbackTranscript(traceResult);
    const actionBodySignalLabels =
      selectedBodySignals.length > 0 ? selectedBodySignals : getConfirmedBodySignalLabels(traceResult);

    const traceRecordForAction =
      currentTraceRecord ||
      (() => {
        const normalizedFields = buildNormalizedTraceFields({
          traceResult,
          transcript: actionTranscript,
          selectedMood,
        });

        return buildMoodTraceRecord({
          transcript: actionTranscript,
          selectedMood,
          selectedBodySignalLabels: actionBodySignalLabels,
          traceResult,
          occurrenceCount:
            savedTraceRecords.filter(
              (record) => getLoopIdentityKey(record) === normalizedFields.loopCandidateKey,
            ).length + 1,
        });
      })();
    const recommendationSnapshot =
      selectedAction.id === selectedActionRecommendation.actionId
        ? selectedActionRecommendation
        : {
            ...selectedActionRecommendation,
            reason: selectedAction.reason,
          };
    const nextActionMemoryEntry = createActionMemoryEntry({
      traceRecord: traceRecordForAction,
      actionId: selectedAction.id,
      actionTitle: selectedAction.title,
      recommendationMode: recommendationSnapshot.mode,
      recommendationSource: recommendationSnapshot.source,
      recommendationReason: recommendationSnapshot.reason,
      evidenceLine: recommendationSnapshot.evidenceLine,
      helpfulness: value,
      answers: { ...actionAnswers },
    });

    if (!currentTraceRecord) {
      setSavedTraceRecords((currentRecords) => [traceRecordForAction, ...currentRecords]);
    }

    setActionMemoryEntries((currentEntries) => [nextActionMemoryEntry, ...currentEntries]);
    setSelectedHelpfulness(value);
    setActiveActionView('list');
    setActionRunState('completed');
    scrollToTop();
  };

  const openEditTranscript = () => {
    setReflectionInputMode('speak');
    setReflectionReviewStep('capture');
    setDraftTranscript(savedTranscript);
    setDraftTraceResult(traceResult);
    setDraftReviewExtraction(traceResult.extraction.map(normalizeDraftReviewExtractionItem));
    setDraftAiTraceResponse(null);
    setEditingTraceId(currentTraceRecord?.id || null);
    resetRecordedAudio();
    setIsRecordingReviewOpen(true);
  };

  const closeRecordingReview = () => {
    stopMoodPromptSpeech();

    if (voiceCaptureState === 'recording') {
      void finishVoiceCapture();
    }

    setIsRecordingReviewOpen(false);
  };

  const prepareDraftReview = async () => {
    let nextTranscript = draftTranscript.trim();
    let nextAudioBase64 = recordedAudioBase64;
    let nextAudioMimeType = recordedAudioMimeType;

    if (!nextTranscript && reflectionInputMode !== 'speak') {
      setDraftTranscript('');
      return;
    }

    try {
      if (reflectionInputMode === 'speak') {
        setReflectionReviewStep('recording');
        const finishedAudio =
          voiceCaptureState === 'recording'
            ? await finishVoiceCapture()
            : nextAudioBase64 && nextAudioMimeType
              ? { base64: nextAudioBase64, mimeType: nextAudioMimeType }
              : null;

        if (finishedAudio) {
          nextAudioBase64 = finishedAudio.base64;
          nextAudioMimeType = finishedAudio.mimeType;
        }

        setReflectionReviewStep('transcribing');
        await waitForAiStage(240);

        if (!nextTranscript && nextAudioBase64 && nextAudioMimeType) {
          const transcription = await transcribeRecordedAudio({
            audioBase64: nextAudioBase64,
            audioMimeType: nextAudioMimeType,
          });

          nextTranscript = transcription.transcript.trim();
          setDraftTranscript(nextTranscript);
        }

        if (!nextAudioBase64 && !nextTranscript) {
          setDraftTranscript('');
          setReflectionReviewStep('capture');
          return;
        }
      }

      setReflectionReviewStep('thinking');
      await waitForAiStage(180);

      const aiTraceResponse = await runOpenAiTraceExtraction({
        transcript: nextTranscript,
        selectedMood,
        selectedBodySignals,
        inputMode: reflectionInputMode,
        audioBase64: nextTranscript ? null : nextAudioBase64,
        audioMimeType: nextTranscript ? null : nextAudioMimeType,
        wantsVoiceReply: reflectionInputMode === 'speak',
      });

      setDraftAiTraceResponse(aiTraceResponse);
      setDraftTranscript(aiTraceResponse.transcript.cleanedText);
      setDraftTraceResult(aiTraceResponse.traceResult);
      setEditingDraftFieldLabel(null);
      setDraftReviewExtraction(
        aiTraceResponse.traceDraft.fields.map((field) => ({
          label: field.label,
          value: field.value,
        })).map(normalizeDraftReviewExtractionItem).sort(
          (left, right) =>
            getDraftExtractionSortRank(left.label) - getDraftExtractionSortRank(right.label),
        ),
      );
      setReflectionReviewStep(aiTraceResponse.safety.canRecommendAction ? 'review' : 'safety');
      playAiVoiceReply(aiTraceResponse);
    } catch {
      setReflectionReviewStep('error');
    }
  };

  const returnToCaptureStep = () => {
    setReflectionReviewStep('capture');
  };

  const startDraftOver = () => {
    stopMoodPromptSpeech();
    setDraftTranscript('');
    setDraftReviewExtraction([]);
    setEditingDraftFieldLabel(null);
    setDraftAiTraceResponse(null);
    resetRecordedAudio();
    setReflectionReviewStep('capture');
    setVoiceCaptureState('preparing');
    speakMoodPromptThenStart(reflectionPrompt);
  };

  const deleteDraft = () => {
    stopMoodPromptSpeech();
    setDraftTranscript('');
    setDraftReviewExtraction([]);
    setEditingDraftFieldLabel(null);
    setDraftAiTraceResponse(null);
    setEditingTraceId(null);
    resetRecordedAudio();
    setReflectionReviewStep('capture');
    setIsRecordingReviewOpen(false);
  };

  const removeDraftExtraction = (label: string) => {
    setDraftReviewExtraction((currentExtraction) =>
      currentExtraction.filter((item) => item.label !== label),
    );
  };

  const updateDraftExtractionValue = (label: string, value: string) => {
    setDraftReviewExtraction((currentExtraction) =>
      currentExtraction.map((item) => (item.label === label ? { ...item, value } : item)),
    );
  };

  const toggleBodySignal = (bodySignalLabel: string) => {
    setSelectedBodySignals((currentSignals) => {
      if (currentSignals.includes(bodySignalLabel)) {
        return currentSignals.filter((signal) => signal !== bodySignalLabel);
      }

      if (currentSignals.length >= 3) {
        return [...currentSignals.slice(1), bodySignalLabel];
      }

      return [...currentSignals, bodySignalLabel];
    });
  };

  const submitTranscript = () => {
    const nextTranscript = draftTranscript.trim();

    if (!nextTranscript) {
      setIsRecordingReviewOpen(false);
      return;
    }

    const nextTraceResult = buildFinalTraceResultFromReview({
      draftTraceResult,
      draftReviewExtraction,
      selectedBodySignalLabels: selectedBodySignals,
    });
    const nextBodySignalLabels = getConfirmedBodySignalLabels(nextTraceResult);
    const editedRecord = editingTraceId
      ? savedTraceRecords.find((record) => record.id === editingTraceId) || null
      : null;
    const nextNormalizedFields = buildNormalizedTraceFields({
      traceResult: nextTraceResult,
      transcript: nextTranscript,
      selectedMood,
    });
    const savedAt = new Date().toISOString();
    const nextTraceRecord = buildMoodTraceRecord({
      transcript: nextTranscript,
      selectedMood,
      selectedBodySignalLabels: nextBodySignalLabels,
      traceResult: nextTraceResult,
      source:
        reflectionInputMode === 'speak'
          ? 'voice_transcript'
          : draftAiTraceResponse
            ? 'mock_ai_assisted_input'
            : 'manual_text',
      createdAt: editedRecord?.createdAt || savedAt,
      savedAt,
      safetyAssessment: draftAiTraceResponse?.safety || editedRecord?.safetyAssessment,
      actionRoutingFeatures: draftAiTraceResponse?.actionRoutingFeatures || editedRecord?.actionRoutingFeatures || null,
      occurrenceCount:
        savedTraceRecords.filter(
          (record) =>
            record.id !== editingTraceId &&
            record.safetyAssessment.canShowPattern &&
            getLoopIdentityKey(record) === nextNormalizedFields.loopCandidateKey,
        ).length + 1,
    });

    setSavedTranscript(nextTranscript);
    setTraceResult(nextTraceResult);
    setSelectedBodySignals(nextBodySignalLabels);
    setSavedTraceRecords((currentRecords) => {
      if (!editingTraceId) {
        return [nextTraceRecord, ...currentRecords];
      }

      const hasExistingRecord = currentRecords.some((record) => record.id === editingTraceId);

      if (!hasExistingRecord) {
        return [nextTraceRecord, ...currentRecords];
      }

      return currentRecords.map((record) => (record.id === editingTraceId ? nextTraceRecord : record));
    });
    setLastSavedAtLabel('Saved to today’s trace');
    setNoticingState('today_trace');
    setIsNoticingCardFlipped(false);
    resetRecordedAudio();
    setEditingTraceId(null);
    setIsRecordingReviewOpen(false);
  };

  const toggleNoticingCard = () => {
    if (!canFlipNoticingCard) {
      return;
    }

    setIsNoticingCardFlipped((currentValue) => !currentValue);
  };

  const handleWebNoticingCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickedElement = event.target as Element | null;

    if (clickedElement?.closest('button')) {
      return;
    }

    toggleNoticingCard();
  };

  const handleWebNoticingCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    toggleNoticingCard();
  };

  const noticingCardContent = isNoticingCardFlipped ? (
    <>
      <View style={styles.noticingBackHeader}>
        <Text style={styles.noticingTitle}>Why Rora noticed this</Text>
        <View style={styles.savedPill}>
          <Feather name="check" size={11} color="#5b6f41" />
          <Text style={styles.savedPillText}>{lastSavedAtLabel}</Text>
        </View>
      </View>

      <View style={styles.noticingBackSection}>
        <Text style={styles.noticingBackLabel}>Based on your words</Text>
        <Text style={styles.transcriptExcerpt}>“{getTranscriptExcerpt(savedTranscript)}”</Text>
      </View>

      <View style={styles.noticingBackSection}>
        <Text style={styles.noticingBackLabel}>Rora noticed</Text>
        <View style={styles.extractionList}>
          {traceResult.extraction.map((item) => (
            <View key={item.label} style={styles.extractionRow}>
              <Text style={styles.extractionLabel}>{item.label}</Text>
              <Text style={styles.extractionValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel="Edit today’s trace transcript"
        onPress={openEditTranscript}
        style={styles.editTraceButton}
      >
        <Feather name="edit-3" size={14} color={colors.softText} />
        <Text style={styles.editTraceButtonText}>Edit</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <View style={styles.noticingTitleRow}>
        <Text style={styles.noticingTitle}>{currentNoticingContent.title}</Text>
        {canFlipNoticingCard ? (
          <View style={styles.detailsHint}>
            <Feather name="info" size={11} color={colors.mutedText} />
            <Text style={styles.detailsHintText}>Details</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.noticingChain}>
        {currentNoticingContent.chain.map((item, index) => (
          <React.Fragment key={item}>
            <View style={styles.noticingNode}>
              <Image
                source={traceIconDictionary[item].image}
                style={styles.noticingIcon}
                resizeMode="contain"
              />
              <Text style={styles.noticingNodeLabel}>{traceIconDictionary[item].label}</Text>
            </View>
            {index < currentNoticingContent.chain.length - 1 ? (
              <View style={styles.noticingArrowSlot}>
                <Feather name="arrow-right" size={15} color="#8f806e" />
              </View>
            ) : null}
          </React.Fragment>
        ))}
      </View>
      {currentNoticingContent.note ? (
        <Text style={styles.noticingNote}>{currentNoticingContent.note}</Text>
      ) : null}
    </>
  );

  return (
    <ImageBackground source={assets.paper} resizeMode="cover" style={styles.appBackground}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.phoneFrame}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {activeTab === 'patterns' ? (
              <PatternsScreen
                currentTraceRecord={currentTraceRecord}
                loopSignatures={loopSignatures}
                savedTraceRecords={savedTraceRecords}
                recommendedAction={loopRecommendedAction}
                recommendedActionDefinition={loopRecommendedActionDefinition}
                weeklyReflectionPreview={displayWeeklyReflectionPreview}
                onTryLoopAction={() => openActionDetail(loopRecommendedActionDefinition.id, 'loop_action')}
              />
            ) : activeTab === 'actions' ? (
              <ActionsScreenV2
                activeActionView={activeActionView}
                actionRunState={actionRunState}
                actionAnswers={actionAnswers}
                selectedHelpfulness={selectedHelpfulness}
                latestActionRewardEntry={selectedHelpfulness ? actionMemoryEntries[0] || null : null}
                selectedAction={selectedAction}
                selectedActionRecommendationMode={selectedActionRecommendationMode}
                recommendedAction={dailyRecommendedAction}
                recommendedActionDefinition={dailyRecommendedActionDefinition}
                loopRecommendedAction={loopRecommendedAction}
                loopRecommendedActionDefinition={loopRecommendedActionDefinition}
                canShowLoopAction={currentPatternVisibility.canShowLoopAction}
                actionLoopContextKeys={actionLoopContextKeys}
                whatHelpedActions={whatHelpedActions}
                onOpenActionDetail={openActionDetail}
                onOpenActionBrowse={openActionBrowse}
                onBackToActions={openActionsList}
                onStartAction={startAction}
                onCompleteAction={completeAction}
                onSelectHelpfulness={saveActionHelpfulness}
                onChangeActionAnswer={updateActionAnswer}
              />
            ) : (
              <>
                <Text style={styles.title}>Today</Text>

                <View style={styles.heroCard}>
                  <View style={styles.heroCopy}>
                    <Text style={styles.heroTitle}>{todayHeroVariant.title}</Text>
                    <Text style={styles.heroSubtitle}>{todayHeroVariant.weekday}</Text>
                  </View>
                  <Image
                    source={todayHeroVariant.image}
                    style={[styles.heroImage, todayHeroVariant.imageStyle]}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>What we’re noticing</Text>
                  {currentNoticingContent.badge ? (
                    <View style={styles.noticingBadge}>
                      <Text style={styles.noticingBadgeText}>{currentNoticingContent.badge}</Text>
                    </View>
                  ) : null}
                </View>

                {Platform.OS === 'web' ? (
                  <div
                    aria-expanded={isNoticingCardFlipped}
                    aria-label={noticingCardAccessibilityLabel}
                    role={canFlipNoticingCard ? 'button' : undefined}
                    tabIndex={canFlipNoticingCard ? 0 : -1}
                    onClick={handleWebNoticingCardClick}
                    onKeyDown={handleWebNoticingCardKeyDown}
                    style={webNoticingCardStyle}
                  >
                    {noticingCardContent}
                  </div>
                ) : (
                  <TouchableOpacity
                    activeOpacity={canFlipNoticingCard ? 0.88 : 1}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isNoticingCardFlipped }}
                    accessibilityLabel={noticingCardAccessibilityLabel}
                    onPress={toggleNoticingCard}
                    style={noticingCardStyle}
                  >
                    {noticingCardContent}
                  </TouchableOpacity>
                )}

                {currentTraceRecord?.safetyAssessment.canRecommendAction ? (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    accessibilityRole="button"
                    accessibilityLabel="Open recommended small action"
                    onPress={() => openActionDetail(dailyRecommendedActionDefinition.id, 'daily_action')}
                    style={styles.todayActionBridgeCard}
                  >
                    <View style={styles.todayActionBridgeIconWrap}>
                      <Image
                        source={dailyRecommendedActionDefinition.image}
                        style={styles.todayActionBridgeIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.todayActionBridgeCopy}>
                      <Text style={styles.todayActionBridgeKicker}>Today’s small step</Text>
                      <Text style={styles.todayActionBridgeTitle}>{dailyRecommendedActionDefinition.title}</Text>
                      <Text style={styles.todayActionBridgeReason}>{dailyRecommendedAction.evidenceLine}</Text>
                    </View>
                    <Feather name="arrow-right" size={18} color="#5b6f41" />
                  </TouchableOpacity>
                ) : null}

                <Text style={[styles.sectionTitle, styles.moodSectionTitle]}>
                  How are you feeling?
                </Text>
                <View style={styles.moodRow}>
                  {moodItems.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <MoodButton
                        item={item}
                        selected={selectedMood === item.label}
                        onSelect={() => setSelectedMood(item.label)}
                      />
                      {index < moodItems.length - 1 ? <View style={styles.moodDivider} /> : null}
                    </React.Fragment>
                  ))}
                </View>

                <Text style={[styles.sectionTitle, styles.bodySectionTitle]}>
                  Where do you feel it?
                </Text>
                <View style={styles.bodyGrid}>
                  {bodyItems.map((item) => (
                    <BodyButton
                      key={item.label}
                      item={item}
                      selected={selectedBodySignals.includes(item.label)}
                      onSelect={() => toggleBodySignal(item.label)}
                    />
                  ))}
                </View>

                <View style={styles.recordSection}>
                  <Text style={styles.recordTitle}>What else did you notice?</Text>
                  <RecordButton onStart={openRecordingReview} />
                </View>
              </>
            )}

          </ScrollView>

          <View style={styles.bottomNavOuter}>
            <View style={styles.bottomNav}>
              <TouchableOpacity
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel="Today"
                accessibilityState={{ selected: activeTab === 'today' }}
                onPress={() => setActiveTab('today')}
                style={activeTab === 'today' ? styles.navActive : styles.navItem}
              >
                <Feather name="home" size={20} color={activeTab === 'today' ? '#5b6f41' : '#897c6c'} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel="Patterns"
                accessibilityState={{ selected: activeTab === 'patterns' }}
                onPress={() => setActiveTab('patterns')}
                style={activeTab === 'patterns' ? styles.navActive : styles.navItem}
              >
                <Feather
                  name="bar-chart-2"
                  size={20}
                  color={activeTab === 'patterns' ? '#5b6f41' : '#897c6c'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel="Actions"
                accessibilityState={{ selected: activeTab === 'actions' }}
                onPress={openActionsList}
                style={activeTab === 'actions' ? styles.navActive : styles.navItem}
              >
                <Feather name="star" size={21} color={activeTab === 'actions' ? '#5b6f41' : '#897c6c'} />
              </TouchableOpacity>
              <View style={styles.navItem}>
                <Feather name="user" size={20} color="#897c6c" />
              </View>
            </View>
          </View>

          {shouldShowDevSeedPanel ? (
            <View style={styles.devSeedPanel}>
              <TouchableOpacity
                activeOpacity={0.76}
                accessibilityRole="button"
                accessibilityLabel="Seed learning state"
                onPress={() => applyDevSeed('learning')}
                style={styles.devSeedButton}
              >
                <Text style={styles.devSeedButtonText}>Learning</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.76}
                accessibilityRole="button"
                accessibilityLabel="Seed possible thread state"
                onPress={() => applyDevSeed('possible-thread')}
                style={styles.devSeedButton}
              >
                <Text style={styles.devSeedButtonText}>Thread</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.76}
                accessibilityRole="button"
                accessibilityLabel="Seed loop action state"
                onPress={() => applyDevSeed('loop-action')}
                style={styles.devSeedButton}
              >
                <Text style={styles.devSeedButtonText}>Loop action</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.76}
                accessibilityRole="button"
                accessibilityLabel="Clear seeded memory"
                onPress={() => applyDevSeed('clear')}
                style={[styles.devSeedButton, styles.devSeedButtonGhost]}
              >
                <Text style={styles.devSeedButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {activePatternMilestone ? (
            <TouchableOpacity
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="Dismiss Rora pattern milestone"
              onPress={dismissPatternMilestone}
              style={styles.patternMilestoneOverlay}
            >
              <View pointerEvents="none" style={styles.patternConfettiLayer}>
                {patternConfettiPieces.map((piece, index) => {
                  const opacity = patternConfettiProgress.interpolate({
                    inputRange: [0, piece.delay, piece.delay + 0.1, 0.9, 1],
                    outputRange: [0, 0, 1, 1, 0],
                    extrapolate: 'clamp',
                  });
                  const translateX = patternConfettiProgress.interpolate({
                    inputRange: [0, piece.delay, 1],
                    outputRange: [0, 0, piece.driftX],
                    extrapolate: 'clamp',
                  });
                  const translateY = patternConfettiProgress.interpolate({
                    inputRange: [0, piece.delay, 1],
                    outputRange: [-16, -16, piece.fallY],
                    extrapolate: 'clamp',
                  });
                  const rotate = patternConfettiProgress.interpolate({
                    inputRange: [0, piece.delay, 1],
                    outputRange: ['0deg', '0deg', piece.rotate],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      key={`${piece.left}-${index}`}
                      style={[
                        styles.patternConfettiPiece,
                        {
                          left: `${piece.left}%`,
                          top: piece.top,
                          width: piece.width,
                          height: piece.height,
                          borderRadius: piece.radius,
                          backgroundColor: piece.color,
                          opacity,
                          transform: [{ translateX }, { translateY }, { rotate }],
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <View style={styles.patternMilestoneModalCard}>
                <Image
                  source={assets.roraThreadDiscoveryMascot}
                  style={styles.patternMilestoneModalMascot}
                  resizeMode="contain"
                />
                <Text style={styles.patternMilestoneModalTitle}>
                  {getPatternMilestoneTitle(activePatternMilestone)}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {isRecordingReviewOpen ? (
            <View
              style={[
                styles.recordOverlay,
                reflectionReviewStep === 'capture' && styles.recordSpotlightOverlay,
              ]}
            >
              <View
                style={[
                  styles.recordSheet,
                  reflectionReviewStep === 'capture' && styles.recordSpotlightSheet,
                ]}
              >
                {reflectionReviewStep === 'capture' ? (
                  <>
                    <View
                      style={[
                        styles.voiceConversationStage,
                        (voiceCaptureState === 'ready' || voiceCaptureState === 'unsupported') &&
                          styles.voiceConversationStageEditing,
                      ]}
                    >
                      <View style={styles.moodBubbleRow}>
                        <View style={styles.moodAvatarWrap}>
                          <Image
                            source={assets.moodAiMark}
                            style={styles.moodAvatarImage}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.moodSpeechBubble}>
                          <View style={styles.moodSpeechMetaRow}>
                            <Text style={styles.moodSpeechName}>Mood</Text>
                            {voiceCaptureState === 'preparing' || voiceCaptureState === 'speaking' ? (
                              <View style={styles.moodSpeakingDots}>
                                <View style={styles.moodSpeakingDot} />
                                <View style={styles.moodSpeakingDot} />
                                <View style={styles.moodSpeakingDot} />
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.moodSpeechText}>{reflectionPrompt}</Text>
                        </View>
                      </View>
                      {voiceCaptureState === 'ready' || voiceCaptureState === 'unsupported' ? (
                        <View style={styles.userTranscriptEditCard}>
                          <Text style={styles.userTranscriptEditLabel}>Your words</Text>
                          <TextInput
                            multiline
                            value={draftTranscript}
                            onChangeText={setDraftTranscript}
                            placeholder={getReflectionInputPlaceholder()}
                            placeholderTextColor="#9a8b77"
                            style={styles.userTranscriptEditInput}
                            textAlignVertical="top"
                          />
                        </View>
                      ) : voiceCaptureState === 'transcribing' || draftTranscript.trim() ? (
                        <View style={styles.userBubbleRow}>
                          <View
                            style={[
                              styles.userSpeechBubble,
                              !draftTranscript.trim() &&
                                voiceCaptureState === 'transcribing' &&
                                styles.userSpeechBubbleListening,
                            ]}
                          >
                            <Text
                              style={[
                                styles.userSpeechText,
                                !draftTranscript.trim() &&
                                  voiceCaptureState === 'transcribing' &&
                                  styles.userSpeechPlaceholderText,
                              ]}
                            >
                              {draftTranscript.trim() ||
                                (voiceCaptureState === 'transcribing' ? 'Turning your words into text...' : '')}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.spotlightBottomDock}>
                      <View style={styles.spotlightDockHandle} />
                      {voiceCaptureState === 'ready' || voiceCaptureState === 'unsupported' ? (
                        <Text style={styles.spotlightReadyText}>
                          {voiceCaptureState === 'unsupported'
                            ? 'Microphone access is not available here. You can still type above.'
                            : 'Edit anything above before saving.'}
                        </Text>
                      ) : (
                        <>
                          <Text style={styles.spotlightTimer}>
                            {voiceCaptureState === 'preparing'
                              ? 'Getting ready...'
                              : voiceCaptureState === 'speaking'
                              ? 'Rora is speaking...'
                              : voiceCaptureState === 'transcribing'
                              ? 'Transcribing'
                              : formatRecordingElapsed(recordingElapsedMs)}
                          </Text>
                          <View style={styles.voiceWaveBars}>
                            {voiceWaveLevels.map((height, index) => (
                              <View
                                key={`${height}-${index}`}
                                style={[styles.voiceWaveBar, { height }]}
                              />
                            ))}
                          </View>
                          <TouchableOpacity
                            activeOpacity={0.78}
                            accessibilityRole="button"
                            accessibilityLabel={
                              voiceCaptureState === 'recording'
                                ? 'Stop recording voice reflection'
                                : 'Start recording voice reflection'
                            }
                            disabled={
                              voiceCaptureState === 'preparing' ||
                              voiceCaptureState === 'speaking' ||
                              voiceCaptureState === 'transcribing'
                            }
                            onPress={toggleVoiceCapture}
                            style={[
                              styles.voiceStopButton,
                              (voiceCaptureState === 'preparing' ||
                                voiceCaptureState === 'speaking' ||
                                voiceCaptureState === 'transcribing') &&
                                styles.voiceStopButtonDisabled,
                            ]}
                          >
                            {voiceCaptureState === 'preparing' || voiceCaptureState === 'speaking' ? (
                              <Feather name="volume-2" size={32} color="#fff8ef" />
                            ) : (
                              <View style={styles.voiceStopSquare} />
                            )}
                          </TouchableOpacity>
                        </>
                      )}
                      {voiceCaptureState === 'ready' || voiceCaptureState === 'unsupported' ? (
                        <View style={styles.spotlightActions}>
                          <TouchableOpacity
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel reflection input"
                            onPress={deleteDraft}
                            style={styles.spotlightCancelButton}
                          >
                            <Text style={styles.spotlightCancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          {voiceCaptureState === 'ready' || draftTranscript.trim() ? (
                            <TouchableOpacity
                              activeOpacity={0.75}
                              accessibilityRole="button"
                              accessibilityLabel="Save voice reflection"
                              onPress={prepareDraftReview}
                              style={styles.spotlightSaveButton}
                            >
                              <Text style={styles.spotlightSaveButtonText}>Save</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  </>
                ) : isAiProgressStep(reflectionReviewStep) ? (
                  (() => {
                    const progressCopy = getAiProgressCopy(reflectionReviewStep);

                    return (
                      <>
                        <View style={styles.aiProgressPanel}>
                          <View style={styles.aiProgressIcon}>
                            <Image
                              source={assets.moodThinkingMascot}
                              style={styles.aiProgressMascot}
                              resizeMode="contain"
                            />
                          </View>
                          <Text style={styles.recordSheetTitle}>{progressCopy.title}</Text>
                          <Text style={styles.recordSheetSubtitle}>{progressCopy.note}</Text>
                          <View style={styles.aiProgressDots}>
                            <View style={styles.aiProgressDot} />
                            <View style={[styles.aiProgressDot, styles.aiProgressDotMuted]} />
                            <View style={[styles.aiProgressDot, styles.aiProgressDotSoft]} />
                          </View>
                        </View>
                      </>
                    );
                  })()
                ) : reflectionReviewStep === 'safety' ? (
                  (() => {
                    const safetyCopy = getSafetySupportCopy(draftAiTraceResponse);

                    return (
                      <>
                        <View style={styles.recordSheetModePill}>
                          <Feather name="shield" size={13} color="#5b6f41" />
                          <Text style={styles.recordSheetModePillText}>Support first</Text>
                        </View>
                        <Text style={styles.recordSheetTitle}>{safetyCopy.title}</Text>
                        <Text style={styles.recordSheetSubtitle}>{safetyCopy.note}</Text>
                        <View style={styles.safetySupportBox}>
                          <Feather name="alert-circle" size={17} color="#8d6540" />
                          <Text style={styles.safetySupportText}>{safetyCopy.detail}</Text>
                        </View>
                        <View style={styles.draftReviewExcerpt}>
                          <Text style={styles.draftReviewExcerptLabel}>Your words</Text>
                          <Text style={styles.draftReviewExcerptText}>“{getTranscriptExcerpt(draftTranscript)}”</Text>
                        </View>
                        <View style={styles.reviewActions}>
                          <TouchableOpacity
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel="Delete support draft"
                            onPress={deleteDraft}
                            style={styles.cancelButton}
                          >
                            <Text style={styles.cancelButtonText}>Delete</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel="Save private note"
                            onPress={submitTranscript}
                            style={styles.okButton}
                          >
                            <Text style={styles.okButtonText}>Save note</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    );
                  })()
                ) : reflectionReviewStep === 'error' ? (
                  <>
                    <Text style={styles.recordSheetTitle}>That did not come through</Text>
                    <Text style={styles.recordSheetSubtitle}>
                      You can try again, or save a few words manually.
                    </Text>
                    <View style={styles.reviewActions}>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel reflection input"
                        onPress={closeRecordingReview}
                        style={styles.cancelButton}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel="Try reflection input again"
                        onPress={returnToCaptureStep}
                        style={styles.okButton}
                      >
                        <Text style={styles.okButtonText}>Try again</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.draftReviewMascotWrap}>
                      <Image
                        source={assets.draftReviewMascot}
                        style={styles.draftReviewMascot}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.recordSheetTitle}>Here’s a draft of your trace</Text>
                    <Text style={styles.recordSheetSubtitle}>
                      Tap anything to make it feel right before saving.
                    </Text>
                    <View style={styles.draftReviewSummaryCard}>
                      <View style={styles.draftReviewSummaryIcon}>
                        <Image
                          source={assets.draftTraceSummary}
                          style={styles.draftReviewSummaryIconImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.draftReviewSummaryText}>
                        {getDraftReviewSummary(draftAiTraceResponse)}
                      </Text>
                    </View>
                    <View style={styles.traceStackCard}>
                      {draftReviewExtraction.length > 0 ? (
                        draftReviewExtraction.map((item, index) => {
                          const isEditing = editingDraftFieldLabel === item.label;
                          const isLast = index === draftReviewExtraction.length - 1;

                          return (
                            <TouchableOpacity
                              key={`${item.label}-${index}`}
                              activeOpacity={0.82}
                              accessibilityRole="button"
                              accessibilityLabel={`Edit ${item.label}`}
                              onPress={() => setEditingDraftFieldLabel(item.label)}
                              style={[
                                styles.traceStackRow,
                                isLast && styles.traceStackRowLast,
                              ]}
                            >
                              <View style={styles.traceStackIconColumn}>
                                <View style={styles.traceStackIconWrap}>
                                  <Image
                                    source={getTraceStackIconSource(item.label)}
                                    style={styles.traceStackIconImage}
                                    resizeMode="contain"
                                  />
                                </View>
                                {!isLast ? <View style={styles.traceStackConnector} /> : null}
                              </View>
                              <View style={styles.traceStackCopy}>
                                <Text style={styles.traceStackLabel}>{item.label}</Text>
                                {isEditing ? (
                                  <TextInput
                                    value={item.value}
                                    onChangeText={(value) => updateDraftExtractionValue(item.label, value)}
                                    onBlur={() => setEditingDraftFieldLabel(null)}
                                    onSubmitEditing={() => setEditingDraftFieldLabel(null)}
                                    autoFocus
                                    returnKeyType="done"
                                    placeholder="Name this piece"
                                    placeholderTextColor="#a59683"
                                    style={styles.traceStackInput}
                                  />
                                ) : (
                                  <Text style={styles.traceStackValue}>{item.value}</Text>
                                )}
                              </View>
                              <Feather name="edit-2" size={13} color="#9a8b77" />
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <Text style={styles.draftReviewEmptyText}>
                          Mood only found a few things. That’s okay.
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.82}
                      accessibilityRole="button"
                      accessibilityLabel="Edit your words"
                      onPress={returnToCaptureStep}
                      style={styles.draftReviewExcerpt}
                    >
                      <View style={styles.draftReviewExcerptHeader}>
                        <Text style={styles.draftReviewExcerptLabel}>Your words</Text>
                        <Text style={styles.draftReviewExcerptEdit}>Edit</Text>
                      </View>
                      <Text style={styles.draftReviewExcerptText}>“{getTranscriptExcerpt(draftTranscript)}”</Text>
                    </TouchableOpacity>
                    <View style={styles.reviewPrimaryActions}>
                      <TouchableOpacity
                        activeOpacity={0.78}
                        accessibilityRole="button"
                        accessibilityLabel="Save my trace"
                        onPress={submitTranscript}
                        style={styles.saveTraceButton}
                      >
                        <Text style={styles.saveTraceButtonText}>Save my trace</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Start again"
                        onPress={startDraftOver}
                        style={styles.startOverButton}
                      >
                        <Text style={styles.startOverButtonText}>Start again</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const colors = {
  text: '#4a3f33',
  softText: '#6b5b4a',
  mutedText: '#8a7a68',
  paper: '#f3e8d3',
  card: '#f8f3e6',
  cardLight: '#fbf4e6',
  nav: '#efe2cc',
  navActive: '#fdf9f0',
  divider: '#d3c4b1',
};

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

const webRecordButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: 0,
  border: 0,
  margin: 0,
  background: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  font: 'inherit',
};

function getWebNoticingCardStyle({
  isBack,
  canFlip,
}: {
  isBack: boolean;
  canFlip: boolean;
}): React.CSSProperties {
  return {
    width: '100%',
    minHeight: isBack ? 258 : 158,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: isBack ? '#fff8ec' : colors.cardLight,
    padding: isBack ? '18px 20px 18px' : '17px 20px 16px',
    boxSizing: 'border-box',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    cursor: canFlip ? 'pointer' : 'default',
  };
}

const styles = StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: colors.paper,
    ...(Platform.OS === 'web'
      ? ({
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
        } as object)
      : {}),
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? ({ height: '100%' } as object) : {}),
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 390,
    flex: 1,
    position: 'relative',
    ...(Platform.OS === 'web' ? ({ height: '100%', overflow: 'hidden' } as object) : {}),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 156,
  },
  title: {
    color: '#2c3236',
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 38,
    letterSpacing: 0,
  },
  heroCard: {
    width: '100%',
    height: 175,
    marginTop: 24,
    borderRadius: 28,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.card,
    overflow: 'hidden',
    position: 'relative',
    ...shadow,
  },
  heroCopy: {
    width: 154,
    marginLeft: 24,
    marginTop: 28,
    zIndex: 2,
  },
  heroTitle: {
    color: '#2c3236',
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 23,
    fontWeight: '500',
    lineHeight: 27.6,
    letterSpacing: 0,
  },
  heroSubtitle: {
    marginTop: 12,
    color: '#4a5157',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22.5,
    letterSpacing: 0,
  },
  heroImage: {
    position: 'absolute',
  },
  sectionHeader: {
    marginTop: 24,
    height: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#2c3236',
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 31,
    letterSpacing: 0,
  },
  noticingBadge: {
    minWidth: 64,
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.nav,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  noticingBadgeText: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    lineHeight: 16,
  },
  noticingCard: {
    width: '100%',
    minHeight: 158,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: colors.cardLight,
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 16,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          WebkitTapHighlightColor: 'transparent',
        } as object)
      : {}),
  },
  noticingCardBack: {
    minHeight: 258,
    backgroundColor: '#fff8ec',
  },
  noticingCardStatic: {
    opacity: 1,
  },
  noticingTitleRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  noticingTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0,
  },
  detailsHint: {
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.nav,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsHintText: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  noticingChain: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  noticingNode: {
    width: 64,
    alignItems: 'center',
  },
  noticingIcon: {
    width: 46,
    height: 46,
  },
  noticingNodeLabel: {
    marginTop: 5,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
    letterSpacing: 0,
  },
  noticingArrowSlot: {
    width: 21,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticingNote: {
    marginTop: 12,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0,
  },
  todayActionBridgeCard: {
    width: '100%',
    minHeight: 86,
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadow,
  },
  todayActionBridgeIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 19,
    backgroundColor: '#edf0df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayActionBridgeIcon: {
    width: 38,
    height: 38,
  },
  todayActionBridgeCopy: {
    flex: 1,
  },
  todayActionBridgeKicker: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  todayActionBridgeTitle: {
    marginTop: 3,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
  },
  todayActionBridgeReason: {
    marginTop: 4,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  loopActionBridgeCard: {
    width: '100%',
    minHeight: 82,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: '#d7dfbd',
    backgroundColor: '#eef2e2',
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loopActionBridgeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff8ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopActionBridgeCopy: {
    flex: 1,
  },
  loopActionBridgeKicker: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  loopActionBridgeTitle: {
    marginTop: 2,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  loopActionBridgeReason: {
    marginTop: 2,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  noticingBackHeader: {
    gap: 9,
  },
  savedPill: {
    alignSelf: 'flex-start',
    minHeight: 22,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  savedPillText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  noticingBackSection: {
    marginTop: 15,
  },
  noticingBackLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  transcriptExcerpt: {
    marginTop: 5,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  extractionList: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eadcc8',
  },
  extractionRow: {
    minHeight: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#eadcc8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  extractionLabel: {
    width: 58,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  extractionValue: {
    flex: 1,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'right',
  },
  editTraceButton: {
    marginTop: 13,
    height: 34,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d8cbb8',
    backgroundColor: '#fbf4e6',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editTraceButtonText: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  moodRow: {
    marginTop: 12,
    marginBottom: 24,
    height: 96,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  moodSectionTitle: {
    marginTop: 24,
  },
  moodButton: {
    width: 86.75,
    alignItems: 'center',
  },
  moodHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  moodSelectionHalo: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.2,
    borderColor: 'rgba(143, 155, 105, 0.38)',
    backgroundColor: 'rgba(226, 232, 209, 0.46)',
    ...(Platform.OS === 'web' ? ({ pointerEvents: 'none' } as object) : {}),
  },
  moodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  moodLabel: {
    marginTop: 2,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  moodLabelSelected: {
    color: '#5b6f41',
  },
  moodDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
    marginTop: 20,
  },
  bodySectionTitle: {
    marginTop: 0,
  },
  bodyGrid: {
    marginTop: 12,
    width: '100%',
    height: 244,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bodyButton: {
    width: '33.3333%',
    height: 114,
    alignItems: 'center',
    marginBottom: 10,
  },
  bodyIconFrame: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bodySelectionHalo: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 27,
    backgroundColor: 'rgba(226, 232, 209, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(143, 155, 105, 0.38)',
    ...(Platform.OS === 'web' ? ({ pointerEvents: 'none' } as object) : {}),
  },
  bodyIcon: {
    width: 60,
    height: 60,
  },
  bodyLabel: {
    marginTop: 6,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0,
    width: 112,
  },
  bodyLabelSelected: {
    color: '#5b6f41',
  },
  recordSection: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'stretch',
  },
  recordButton: {
    width: '100%',
    alignItems: 'center',
  },
  recordTitle: {
    color: '#2c3236',
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 31,
    letterSpacing: 0,
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  recordIcon: {
    marginTop: 46,
    width: 72,
    height: 72,
    alignSelf: 'center',
    ...shadow,
  },
  recordLabel: {
    marginTop: 4,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0,
  },
  moodAiLaunchButton: {
    width: '100%',
    minHeight: 74,
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadow,
  },
  moodAiLaunchIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#edf0df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodAiLaunchCopy: {
    flex: 1,
  },
  moodAiLaunchTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  moodAiLaunchSubtitle: {
    marginTop: 3,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  reflectionAssistCard: {
    width: '100%',
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 15,
    ...shadow,
  },
  reflectionAssistHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reflectionAssistIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#edf0df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reflectionAssistCopy: {
    flex: 1,
  },
  reflectionAssistTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  reflectionAssistPrompt: {
    marginTop: 4,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  reflectionModeRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  reflectionModeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8cbb8',
    backgroundColor: '#fff8ec',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  reflectionModeButtonSelected: {
    borderColor: '#9aa977',
    backgroundColor: '#edf0df',
  },
  reflectionModeButtonText: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  reflectionCueLabel: {
    marginTop: 14,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  reflectionCueGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reflectionCueChip: {
    minHeight: 32,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reflectionCueChipSelected: {
    borderWidth: 1,
    borderColor: '#9aa977',
    backgroundColor: '#dfe8cc',
  },
  reflectionCueChipText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  patternCard: {
    width: '100%',
    marginTop: 20,
    borderRadius: 22,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 18,
    ...shadow,
  },
  patternLearningCard: {
    width: '100%',
    marginTop: 20,
    borderRadius: 26,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 28,
    alignItems: 'center',
    ...shadow,
  },
  patternLearningMascot: {
    width: 170,
    height: 132,
    marginBottom: 10,
    transform: [{ translateX: 14 }],
  },
  patternMilestoneOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 120,
    backgroundColor: 'rgba(38, 34, 28, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(7px)',
          WebkitBackdropFilter: 'blur(7px)',
        } as object)
      : {}),
  },
  patternMilestoneModalCard: {
    width: '100%',
    maxWidth: 336,
    zIndex: 1,
    borderRadius: 28,
    borderWidth: 0.8,
    borderColor: '#eadcc5',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: 'center',
    ...shadow,
  },
  patternConfettiLayer: {
    position: 'absolute',
    width: '100%',
    maxWidth: 430,
    height: 230,
    top: '50%',
    marginTop: -246,
    left: 22,
    right: 22,
    zIndex: 2,
  },
  patternConfettiPiece: {
    position: 'absolute',
  },
  patternMilestoneModalMascot: {
    width: 148,
    height: 160,
    marginBottom: 12,
  },
  patternMilestoneModalTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 21,
    fontWeight: '500',
    lineHeight: 27,
    letterSpacing: 0,
    textAlign: 'center',
  },
  patternLearningTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: 0,
    textAlign: 'center',
  },
  patternLearningBody: {
    marginTop: 8,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    textAlign: 'center',
  },
  patternHeaderRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  patternCardTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 25,
    letterSpacing: 0,
  },
  patternMetaPill: {
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.nav,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  patternMetaPillText: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  patternSubtext: {
    marginTop: 3,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  patternEvidenceLine: {
    marginTop: 8,
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  evidenceStripLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  evidenceChipRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  evidenceChip: {
    minHeight: 26,
    borderRadius: 999,
    backgroundColor: '#f3e5cd',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  evidenceChipText: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  loopList: {
    marginTop: 18,
    alignItems: 'center',
  },
  earlySignalCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d7dfbd',
    backgroundColor: '#eef3de',
    paddingHorizontal: 13,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  earlySignalIconShell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earlySignalPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#93a46b',
  },
  earlySignalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff8ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earlySignalCopy: {
    flex: 1,
  },
  earlySignalLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  earlySignalText: {
    marginTop: 3,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  evidenceToggleRow: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  evidenceToggleCopy: {
    flex: 1,
  },
  evidenceToggleText: {
    marginTop: 2,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  evidenceTogglePill: {
    minHeight: 30,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  evidenceTogglePillText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  evidenceStripExpanded: {
    marginTop: 8,
    borderRadius: 17,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  patternHelpedPanel: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: '#e2d4be',
    backgroundColor: '#fbf4e6',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  patternHelpedLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  patternHelpedTitle: {
    marginTop: 5,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  patternHelpedText: {
    marginTop: 5,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  loopRowWrap: {
    width: '100%',
    alignItems: 'center',
  },
  loopPill: {
    width: '88%',
    minHeight: 42,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0d1ba',
    backgroundColor: '#f7ecd8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  loopIcon: {
    width: 31,
    height: 31,
  },
  loopLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  loopArrow: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopArrowImage: {
    width: 19,
    height: 27,
    opacity: 0.9,
  },
  tryActionButton: {
    marginTop: 16,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 0.7,
    borderColor: '#d9c9ae',
    backgroundColor: '#eef2e2',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tryActionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5b6f41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryActionCopy: {
    flex: 1,
  },
  tryActionTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  tryActionSubtitle: {
    marginTop: 1,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  segmentedControl: {
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.nav,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  segmentActive: {
    minWidth: 35,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#5b6f41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActiveText: {
    color: '#fff8ef',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  moodStatsSubtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  moodChartToggle: {
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.nav,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  moodChartToggleButton: {
    width: 30,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodChartToggleButtonActive: {
    backgroundColor: '#5b6f41',
  },
  moodShapeWrap: {
    width: '100%',
    height: 316,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: '#fffaf0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  moodShapeSvg: {
    transform: [{ translateY: -10 }],
  },
  moodShapeLabel: {
    position: 'absolute',
    minWidth: 68,
    alignItems: 'center',
  },
  moodShapeLabelTop: {
    top: 8,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  moodShapeLabelRight: {
    right: 0,
    top: 126,
  },
  moodShapeLabelBottom: {
    bottom: 28,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  moodShapeLabelLeft: {
    left: 0,
    top: 126,
  },
  moodShapeFace: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 236, 0.82)',
  },
  moodShapeLabelText: {
    marginTop: 4,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 19,
  },
  moodShapeTodayPill: {
    position: 'absolute',
    left: 14,
    bottom: 18,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e9eedc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 5,
  },
  moodShapeTodayText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  moodTimelineWrap: {
    width: '100%',
    minHeight: 292,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: '#fffaf0',
    paddingTop: 17,
    paddingBottom: 18,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  moodTimelineHeader: {
    width: '100%',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  moodTimelineTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  moodTimelineSubtitle: {
    marginTop: 0,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  moodTimelineFullButton: {
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: '#f3eadb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 7,
    gap: 3,
  },
  moodTimelineFullButtonText: {
    color: '#8d7a61',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 14,
  },
  moodTimelineChartBody: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  moodTimelineMoodRail: {
    width: 27,
    height: 168,
    paddingTop: 6,
    paddingBottom: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodTimelineMoodDotRow: {
    width: 27,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodTimelineMoodFace: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 236, 0.86)',
  },
  moodTimelinePlotArea: {
    width: 238,
  },
  moodTimelineDayRow: {
    width: 238,
    minHeight: 18,
    marginTop: 6,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodTimelineDayItem: {
    width: 22,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodTimelineDayText: {
    color: '#9a8b75',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  moodEmptyChart: {
    minHeight: 128,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: '#fff8ec',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  moodSummaryGrid: {
    marginTop: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodSummaryPill: {
    minHeight: 30,
    borderRadius: 999,
    backgroundColor: '#f3e5cd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 9,
    paddingRight: 10,
    gap: 6,
  },
  moodSummaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodSummaryLabel: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  moodSummaryCount: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  moodStatsNote: {
    marginTop: 11,
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  signalWeekRow: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 10,
    paddingTop: 11,
    paddingBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signalDay: {
    width: 40,
    alignItems: 'center',
  },
  signalDaySlot: {
    width: 36,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#f3e5cd',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    position: 'relative',
  },
  signalDayEmpty: {
    backgroundColor: '#f8f0df',
    borderWidth: 1,
    borderColor: '#eadcc8',
  },
  signalDaySlotExpanded: {
    borderWidth: 1,
    borderColor: '#b9c7a2',
    backgroundColor: '#eef2e2',
  },
  signalDayIcon: {
    width: 24,
    height: 24,
  },
  signalDayMoreBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#f8f0df',
    backgroundColor: '#d94c37',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  signalDayMoreBadgeText: {
    color: '#fff8ef',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
  signalDayLabel: {
    marginTop: 5,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  signalDayDetails: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 0.7,
    borderColor: '#e5d6bf',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  signalDayDetailsTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 25,
    letterSpacing: 0,
  },
  signalDayDetailsList: {
    marginTop: 9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signalDayDetailChip: {
    minHeight: 31,
    borderRadius: 999,
    backgroundColor: '#f3e5cd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 11,
    gap: 6,
  },
  signalDayDetailIcon: {
    width: 20,
    height: 20,
  },
  signalDayDetailText: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  signalSummaryList: {
    marginTop: 14,
    gap: 11,
  },
  signalSummaryRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signalSummaryIcon: {
    width: 30,
    height: 30,
  },
  signalSummaryCopy: {
    flex: 1,
  },
  signalSummaryTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  signalSummaryLabel: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  signalSummaryCount: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  signalBarTrack: {
    height: 5,
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: '#eadcc8',
    overflow: 'hidden',
  },
  signalBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#8f9b69',
  },
  signalEmptyText: {
    marginTop: 14,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  reportCard: {
    width: '100%',
    marginTop: 20,
    borderRadius: 22,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.cardLight,
    paddingLeft: 18,
    paddingRight: 122,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 106,
    overflow: 'hidden',
    ...shadow,
  },
  reportCopy: {
    flex: 1,
    zIndex: 1,
  },
  reportSummary: {
    marginTop: 8,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  reportBookImage: {
    position: 'absolute',
    right: 4,
    bottom: -15,
    width: 128,
    height: 128,
  },
  weeklyReflectionCard: {
    width: '100%',
    marginTop: 20,
    borderRadius: 22,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 18,
    overflow: 'hidden',
    ...shadow,
  },
  weeklyReflectionHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weeklyStatsRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weeklyStatPill: {
    minHeight: 25,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  weeklyStatPillText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  weeklyNotePanel: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  weeklyNoteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  weeklyNoteIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyNoteAvatar: {
    width: 30,
    height: 30,
  },
  weeklyNoteCopy: {
    flex: 1,
  },
  weeklyNoteTitle: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  weeklyNoteText: {
    marginTop: 4,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  weeklyNoteEvidence: {
    marginTop: 6,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  weeklyAiSummaryCard: {
    marginTop: 12,
    borderRadius: 21,
    borderWidth: 0.7,
    borderColor: '#efe3d1',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 14,
  },
  weeklyAiSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  weeklyAiSummaryAvatar: {
    width: 31,
    height: 31,
  },
  weeklyAiSummaryHeaderCopy: {
    flex: 1,
  },
  weeklyAiSummaryLabel: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  weeklyAiSummaryTitle: {
    marginTop: 14,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  weeklyAiSummaryText: {
    marginTop: 8,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  weeklyAiSummaryEvidence: {
    marginTop: 13,
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#f2eadc',
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weeklyAiSummaryEvidenceText: {
    flex: 1,
    color: '#786955',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  weeklyAiSummaryNextStep: {
    marginTop: 12,
    borderTopWidth: 0.7,
    borderTopColor: '#eadcc8',
    paddingTop: 12,
  },
  weeklyAiSummaryNextLabel: {
    color: '#6f7b42',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  weeklyAiSummaryNextTitle: {
    marginTop: 4,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  weeklyAiSummaryNextDetail: {
    marginTop: 2,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  weeklyAiSummaryBoundary: {
    marginTop: 10,
    color: '#a0907a',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  weeklyInsightPanel: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  weeklySectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  weeklySectionMeta: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  weeklyChainRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  weeklyChainNode: {
    flex: 1,
    minHeight: 76,
    borderRadius: 16,
    backgroundColor: '#f5ead8',
    borderWidth: 0.7,
    borderColor: '#e4d2b9',
    paddingHorizontal: 7,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyChainIcon: {
    width: 30,
    height: 30,
  },
  weeklyChainText: {
    marginTop: 5,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    textAlign: 'center',
  },
  weeklyChainArrow: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  weeklyCuePanel: {
    marginTop: 12,
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d9e4c5',
    backgroundColor: '#edf5df',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  weeklyCueIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff8ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyMiniGrid: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  weeklyMiniPanel: {
    flex: 1,
    minHeight: 138,
    borderRadius: 19,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 11,
    paddingVertical: 12,
  },
  weeklyNextStepPanel: {
    marginTop: 12,
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: '#f3ead8',
    borderWidth: 0.7,
    borderColor: '#dfcfb8',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  weeklyNextStepIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#5b6f41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyPreviewPanel: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  weeklyPreviewPill: {
    alignSelf: 'flex-start',
    minHeight: 24,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  weeklyPreviewPillText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  weeklyPreviewText: {
    marginTop: 8,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  weeklyProgressTrack: {
    height: 9,
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: '#eadcc8',
    position: 'relative',
  },
  weeklyProgressFill: {
    width: '68%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#8f9b69',
  },
  weeklyProgressDot: {
    position: 'absolute',
    top: -4,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 2,
    borderColor: '#fff8ec',
    backgroundColor: '#8f9b69',
  },
  weeklyProgressDotOne: {
    left: '18%',
  },
  weeklyProgressDotTwo: {
    left: '44%',
  },
  weeklyProgressDotThree: {
    left: '66%',
  },
  weeklyReflectionList: {
    marginTop: 16,
    gap: 10,
  },
  weeklyReflectionItem: {
    minHeight: 58,
    borderRadius: 17,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weeklyReflectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyReflectionIcon: {
    width: 27,
    height: 27,
  },
  weeklyReflectionCopy: {
    flex: 1,
  },
  weeklyReflectionLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  weeklyReflectionValue: {
    marginTop: 2,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  weeklyReflectionDetail: {
    marginTop: 1,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  weeklyPaidPanel: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d8cbb8',
    backgroundColor: '#f7ecd8',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  weeklyPaidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weeklyPaidEyebrow: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  weeklyPaidTitle: {
    marginTop: 2,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  weeklyPaidNote: {
    marginTop: 3,
    maxWidth: 238,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  weeklyPaidLock: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#edf0df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyPaidRow: {
    marginTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#e2d4be',
    paddingTop: 9,
  },
  weeklyPaidLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  weeklyPaidValue: {
    marginTop: 3,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  actionsTopRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  actionDetailTopRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.nav,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDetailCard: {
    width: '100%',
    marginTop: 10,
    borderRadius: 24,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    ...shadow,
  },
  actionDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  actionDetailTitleCopy: {
    flex: 1,
  },
  actionDetailTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: 0,
  },
  actionDetailReason: {
    marginTop: 6,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  actionDetailEvidence: {
    marginTop: 6,
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  actionDetailTimePill: {
    minHeight: 28,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionDetailTimeText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  actionLoopContext: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionLoopContextLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  actionLoopMiniRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionLoopMiniNode: {
    flex: 1,
    minHeight: 38,
    borderRadius: 15,
    backgroundColor: '#f3e5cd',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  actionLoopMiniIcon: {
    width: 26,
    height: 26,
  },
  actionLoopMiniText: {
    flex: 1,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  actionDetailDescription: {
    marginTop: 10,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  actionDetailPreviewList: {
    marginTop: 12,
    gap: 8,
  },
  actionDetailPreviewRow: {
    minHeight: 53,
    borderRadius: 17,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  actionDetailStepIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3e5cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDetailStepImage: {
    width: 27,
    height: 27,
  },
  actionDetailStepCopy: {
    flex: 1,
  },
  actionDetailStepTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  actionDetailStepPrompt: {
    marginTop: 2,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  actionPrimaryButton: {
    minHeight: 48,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: '#5b6f41',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    ...(Platform.OS === 'web' ? ({ scrollMarginBottom: 128 } as object) : {}),
  },
  actionPrimaryButtonText: {
    color: '#fff8ef',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  actionInputList: {
    marginTop: 12,
    gap: 9,
  },
  actionInputBlock: {
    borderRadius: 18,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionInputLabel: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  actionInputPrompt: {
    marginTop: 1,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  actionInput: {
    minHeight: 50,
    marginTop: 6,
    borderRadius: 15,
    borderWidth: 0.8,
    borderColor: '#e1d2bb',
    backgroundColor: '#fbf4e6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  actionFeedbackPanel: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionFeedbackTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 27,
    letterSpacing: 0,
  },
  actionFeedbackGrid: {
    marginTop: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  actionFeedbackButton: {
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: '#d9c9ae',
    backgroundColor: '#fbf4e6',
    paddingLeft: 9,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionFeedbackButtonSelected: {
    borderColor: '#5b6f41',
    backgroundColor: '#eef2e2',
  },
  actionFeedbackButtonText: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionFeedbackButtonIcon: {
    width: 24,
    height: 24,
  },
  actionFeedbackButtonTextSelected: {
    color: '#5b6f41',
  },
  actionIntroCard: {
    width: '100%',
    height: 158,
    marginTop: 18,
    borderRadius: 28,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.card,
    overflow: 'hidden',
    position: 'relative',
    ...shadow,
  },
  actionIntroCopy: {
    width: 178,
    marginLeft: 24,
    marginTop: 25,
    zIndex: 2,
  },
  actionIntroImage: {
    position: 'absolute',
    right: 3,
    top: 8,
    width: 168,
    height: 144,
  },
  actionSectionLabel: {
    marginTop: 20,
    color: '#2c3236',
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 31,
    letterSpacing: 0,
  },
  actionRewardCard: {
    width: '100%',
    marginTop: 10,
    borderRadius: 22,
    borderWidth: 0.8,
    borderColor: '#d9c9ae',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 15,
    paddingVertical: 14,
    ...shadow,
  },
  actionRewardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionRewardStamp: {
    minHeight: 30,
    borderRadius: 999,
    backgroundColor: '#eef2e2',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionRewardStampText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionRewardActionTitle: {
    flex: 1,
    textAlign: 'right',
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionRewardHeadline: {
    marginTop: 12,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 27,
    letterSpacing: 0,
  },
  actionRewardBody: {
    marginTop: 7,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  actionRewardMemoryRow: {
    minHeight: 38,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eadcc8',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionRewardMemoryText: {
    flex: 1,
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  actionFocusCardV2: {
    width: '100%',
    marginTop: 10,
    borderRadius: 21,
    borderWidth: 0.8,
    borderColor: '#d9c9ae',
    backgroundColor: 'transparent',
    overflow: 'visible',
    ...shadow,
  },
  actionGreenHeader: {
    height: 128,
    borderRadius: 21,
    backgroundColor: '#5f704d',
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 18,
    paddingTop: 17,
    zIndex: 1,
  },
  actionGreenTexture: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  actionGreenContent: {
    zIndex: 2,
    width: 238,
  },
  actionFocusMode: {
    marginBottom: 4,
    color: '#dfe8cc',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  actionFocusTitle: {
    color: '#fff8ef',
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 21,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: 0,
  },
  actionTimePillV2: {
    marginTop: 12,
    alignSelf: 'flex-start',
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(67, 82, 49, 0.58)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionTimeTextV2: {
    color: '#fff8ef',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionLeafSprig: {
    position: 'absolute',
    right: 20,
    top: 12,
    width: 54,
    height: 92,
    opacity: 0.5,
    transform: [{ rotate: '4deg' }],
  },
  actionFocusEvidenceRow: {
    minHeight: 38,
    backgroundColor: '#fff8ec',
    borderBottomLeftRadius: 21,
    borderBottomRightRadius: 21,
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 8,
  },
  actionFocusEvidenceText: {
    color: '#6b5b4a',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionStepRow: {
    minHeight: 142,
    marginTop: -28,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 21,
    borderBottomRightRadius: 21,
    overflow: 'hidden',
    zIndex: 2,
  },
  actionStepCard: {
    flex: 1,
    minHeight: 142,
    backgroundColor: '#fff8ec',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingTop: 18,
    paddingBottom: 12,
    borderRightWidth: 1,
    borderRightColor: '#e1d2bb',
  },
  actionStepCardFirst: {
    borderTopLeftRadius: 18,
  },
  actionStepCardLast: {
    borderTopRightRadius: 18,
    borderRightWidth: 0,
  },
  actionStepTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  actionStepPrompt: {
    marginTop: 9,
    minHeight: 38,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    textAlign: 'center',
  },
  actionStepIcon: {
    marginTop: 13,
  },
  actionStepImage: {
    marginTop: 6,
    width: 60,
    height: 60,
  },
  recentActionsLabel: {
    marginTop: 25,
  },
  recentActionsCard: {
    width: '100%',
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 14,
    paddingVertical: 6,
    ...shadow,
  },
  recentActionRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  recentActionIconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentActionImage: {
    width: 36,
    height: 36,
  },
  recentActionCopy: {
    flex: 1,
    marginLeft: 10,
  },
  recentActionTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  recentActionTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  recentActionDate: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  whatHelpedOutcomeRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whatHelpedPill: {
    minHeight: 24,
    borderRadius: 999,
    backgroundColor: '#eef2e2',
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatHelpedPillNew: {
    backgroundColor: '#5b6f41',
  },
  whatHelpedPillText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  whatHelpedPillTextNew: {
    color: '#fff8ef',
  },
  whatHelpedSavedText: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  whatHelpedLoopText: {
    marginTop: 5,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  recentActionDots: {
    marginTop: 7,
    flexDirection: 'row',
    gap: 6,
  },
  recentActionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 0.8,
    borderColor: '#cfc1ad',
    backgroundColor: 'transparent',
  },
  recentActionDotFilled: {
    borderColor: '#6f7e55',
    backgroundColor: '#6f7e55',
  },
  recentActionDivider: {
    position: 'absolute',
    left: 52,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#eadcc8',
  },
  browseActionsCard: {
    width: '100%',
    minHeight: 66,
    marginTop: 32,
    borderRadius: 20,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    ...shadow,
  },
  browseActionsIconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseActionsText: {
    flex: 1,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  actionBrowseTitle: {
    marginTop: 18,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 31,
    letterSpacing: 0,
  },
  actionBrowseSubtitle: {
    marginTop: 6,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  actionBrowseList: {
    marginTop: 16,
    gap: 10,
  },
  actionBrowseRow: {
    minHeight: 78,
    borderRadius: 20,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    ...shadow,
  },
  actionBrowseRowPreview: {
    opacity: 0.82,
  },
  actionBrowseIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#f3e5cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBrowseIcon: {
    width: 42,
    height: 42,
  },
  actionBrowseCopy: {
    flex: 1,
  },
  actionBrowseTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBrowseRowTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionBrowseDuration: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  actionBrowseDescription: {
    marginTop: 4,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionBrowsePreviewLabel: {
    marginTop: 5,
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  actionFocusCard: {
    width: '100%',
    marginTop: 24,
    borderRadius: 24,
    borderWidth: 0.7,
    borderColor: '#e8dcc6',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 20,
    paddingVertical: 20,
    ...shadow,
  },
  actionFocusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionEyebrow: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionTimePill: {
    height: 24,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionTimeText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  actionTitle: {
    marginTop: 14,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 30,
    letterSpacing: 0,
  },
  actionDescription: {
    marginTop: 9,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  recordOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 54,
    backgroundColor: 'rgba(74, 63, 51, 0.16)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        } as object)
      : {}),
  },
  recordSpotlightOverlay: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingTop: 72,
    paddingBottom: 0,
    backgroundColor: 'rgba(18, 16, 14, 0.68)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as object)
      : {}),
  },
  recordSheet: {
    borderRadius: 24,
    borderWidth: 0.7,
    borderColor: '#e5d8c4',
    backgroundColor: '#fbf4e6',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    ...shadow,
  },
  recordSpotlightSheet: {
    flex: 1,
    width: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  voiceConversationStage: {
    width: '100%',
    minHeight: 300,
    paddingHorizontal: 22,
    justifyContent: 'center',
    gap: 18,
  },
  voiceConversationStageEditing: {
    minHeight: 394,
    justifyContent: 'flex-start',
  },
  moodBubbleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  moodAvatarWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 2,
  },
  moodAvatarImage: {
    width: 34,
    height: 34,
  },
  moodSpeechBubble: {
    maxWidth: 268,
    borderRadius: 18,
    borderTopLeftRadius: 8,
    backgroundColor: 'rgba(253, 247, 235, 0.96)',
    paddingHorizontal: 13,
    paddingVertical: 11,
    ...shadow,
  },
  moodSpeechMetaRow: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  moodSpeechName: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  moodSpeakingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  moodSpeakingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8b9b69',
    opacity: 0.86,
  },
  moodSpeechText: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    letterSpacing: 0,
  },
  userBubbleRow: {
    width: '100%',
    alignItems: 'flex-end',
  },
  userSpeechBubble: {
    maxWidth: 284,
    minHeight: 54,
    borderRadius: 18,
    borderTopRightRadius: 8,
    backgroundColor: 'rgba(255, 250, 240, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(229, 216, 196, 0.86)',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  userSpeechBubbleListening: {
    backgroundColor: 'rgba(255, 250, 240, 0.78)',
  },
  userSpeechText: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0,
  },
  userSpeechPlaceholderText: {
    color: '#a89b88',
    fontStyle: 'italic',
  },
  userTranscriptEditCard: {
    width: '100%',
    marginTop: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(229, 216, 196, 0.92)',
    backgroundColor: 'rgba(253, 247, 235, 0.98)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 15,
    ...shadow,
  },
  userTranscriptEditLabel: {
    marginBottom: 8,
    color: '#887b68',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  userTranscriptEditInput: {
    minHeight: 166,
    maxHeight: 212,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(218, 203, 179, 0.72)',
    backgroundColor: 'rgba(255, 251, 242, 0.78)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0,
  },
  spotlightTranscriptCard: {
    width: '84%',
    maxWidth: 360,
    maxHeight: 360,
    borderRadius: 28,
    borderWidth: 0.8,
    borderColor: 'rgba(247, 232, 207, 0.72)',
    backgroundColor: 'rgba(253, 247, 235, 0.98)',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    ...shadow,
  },
  spotlightTranscriptHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  spotlightHeartBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e7ebd7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  spotlightPromptText: {
    flex: 1,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  spotlightTranscriptInput: {
    minHeight: 210,
    maxHeight: 240,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(218, 203, 179, 0.72)',
    backgroundColor: 'rgba(255, 251, 242, 0.68)',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0,
  },
  spotlightBottomDock: {
    width: '100%',
    minHeight: 314,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: 'rgba(24, 22, 20, 0.88)',
    paddingHorizontal: 32,
    paddingTop: 14,
    paddingBottom: 38,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 22,
  },
  spotlightDockHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 248, 239, 0.28)',
  },
  spotlightTimer: {
    marginTop: 6,
    color: '#efe3cf',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 35,
    fontWeight: '500',
    lineHeight: 44,
    letterSpacing: 1,
    textAlign: 'center',
  },
  spotlightReadyText: {
    marginTop: 26,
    minHeight: 58,
    color: '#efe3cf',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    textAlign: 'center',
  },
  voiceStopButton: {
    width: 106,
    height: 106,
    marginTop: 10,
    borderRadius: 53,
    borderWidth: 5,
    borderColor: '#fff8ef',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceStopButtonDisabled: {
    opacity: 0.48,
  },
  voiceStopSquare: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ff4438',
  },
  voiceWaveBars: {
    width: '100%',
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  voiceWaveBar: {
    width: 3,
    borderRadius: 999,
    backgroundColor: '#ff4438',
  },
  spotlightHint: {
    color: 'rgba(255, 248, 239, 0.8)',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
  },
  spotlightActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  spotlightCancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 239, 0.52)',
    backgroundColor: 'rgba(255, 248, 239, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightCancelButtonText: {
    color: '#fff8ef',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  spotlightSaveButton: {
    flex: 1,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#fff8ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightSaveButtonText: {
    color: '#e9432b',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  recordSheetTitle: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 23,
    fontWeight: '500',
    lineHeight: 29,
    letterSpacing: 0,
  },
  recordSheetSubtitle: {
    marginTop: 6,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0,
  },
  moodAiBubble: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  moodAiBubbleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#edf0df',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  moodAiBubbleText: {
    flex: 1,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  recordSheetModePill: {
    alignSelf: 'flex-start',
    minHeight: 24,
    marginBottom: 10,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordSheetModePillIcon: {
    width: 18,
    height: 18,
    marginLeft: -2,
  },
  recordSheetModePillText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  selectedCuePill: {
    alignSelf: 'flex-start',
    minHeight: 26,
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d8cbb8',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 11,
    justifyContent: 'center',
  },
  selectedCuePillText: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  transcriptInput: {
    minHeight: 116,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dfd1bd',
    backgroundColor: '#fffaf0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  voiceCapturePanel: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4d6c0',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  voiceCaptureButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd6ba',
    backgroundColor: '#edf0df',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceCaptureButtonRecording: {
    borderColor: '#e9432b',
    backgroundColor: '#e9432b',
  },
  voiceCaptureButtonDisabled: {
    opacity: 0.68,
  },
  voiceCaptureButtonText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  voiceCaptureButtonTextRecording: {
    color: '#fff8ef',
  },
  voiceCaptureHint: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  aiProgressPanel: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  aiProgressIcon: {
    width: 94,
    height: 94,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiProgressMascot: {
    width: 94,
    height: 94,
  },
  aiProgressDots: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 7,
  },
  aiProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5b6f41',
  },
  aiProgressDotMuted: {
    backgroundColor: '#91a579',
  },
  aiProgressDotSoft: {
    backgroundColor: '#c7d2b9',
  },
  safetySupportBox: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0cfb8',
    backgroundColor: '#fff7e8',
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  safetySupportText: {
    flex: 1,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  draftReviewMascotWrap: {
    height: 60,
    marginTop: 0,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftReviewMascot: {
    width: 102,
    height: 72,
  },
  draftReviewSummaryCard: {
    marginTop: 13,
    borderRadius: 18,
    backgroundColor: '#fff8ec',
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  draftReviewSummaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#edf0df',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  draftReviewSummaryIconImage: {
    width: 21,
    height: 21,
  },
  draftReviewSummaryText: {
    flex: 1,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  draftReviewExcerpt: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 248, 236, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  draftReviewExcerptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  draftReviewExcerptLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  draftReviewExcerptEdit: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  draftReviewExcerptText: {
    marginTop: 5,
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  traceStackCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#fffaf0',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  traceStackRow: {
    minHeight: 58,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  traceStackRowLast: {
    paddingBottom: 9,
  },
  traceStackIconColumn: {
    width: 30,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  traceStackIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#edf0df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  traceStackIconImage: {
    width: 24,
    height: 24,
  },
  traceStackConnector: {
    width: 1,
    flex: 1,
    minHeight: 16,
    marginTop: 5,
    backgroundColor: '#e2d5bf',
  },
  traceStackCopy: {
    flex: 1,
    minWidth: 0,
  },
  traceStackLabel: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  traceStackValue: {
    marginTop: 4,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  traceStackInput: {
    minHeight: 30,
    marginTop: 2,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#d8cbb8',
    backgroundColor: '#fff8ec',
    paddingHorizontal: 9,
    paddingVertical: 4,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  draftReviewEmptyText: {
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  reviewPrimaryActions: {
    marginTop: 12,
    alignItems: 'center',
    gap: 6,
  },
  saveTraceButton: {
    width: '100%',
    height: 48,
    borderRadius: 18,
    backgroundColor: '#e9432b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTraceButtonText: {
    color: '#fff8ef',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  startOverButton: {
    minHeight: 22,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  startOverButtonText: {
    color: colors.mutedText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  reviewActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8cbb8',
    backgroundColor: '#fbf4e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.softText,
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  deleteDraftButton: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e1cabb',
    backgroundColor: '#fff1e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteDraftButtonText: {
    color: '#9b4a36',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  okButton: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#e9432b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    color: '#fff8ef',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  bottomNavOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    width: '100%',
    height: 56,
    borderRadius: 24,
    backgroundColor: colors.nav,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navActive: {
    width: 67,
    height: 36,
    borderRadius: 16,
    backgroundColor: colors.navActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItem: {
    width: 67,
    height: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devSeedPanel: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 92,
    zIndex: 80,
    minHeight: 42,
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: '#e1d2bb',
    backgroundColor: 'rgba(255, 248, 236, 0.95)',
    padding: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...shadow,
  },
  devSeedButton: {
    flex: 1,
    minHeight: 30,
    borderRadius: 999,
    backgroundColor: '#edf0df',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  devSeedButtonGhost: {
    backgroundColor: '#fff8ec',
  },
  devSeedButtonText: {
    color: '#5b6f41',
    fontFamily: Platform.select({ ios: 'Inter', default: 'sans-serif' }),
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
});
