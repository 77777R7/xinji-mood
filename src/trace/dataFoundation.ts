import type {
  BodySignalSelection,
  MockTraceResult,
  TraceChain,
  TraceExtraction,
  TraceIconKey,
} from './types';
import type {
  ActionBurdenLevel,
  ActionFamily,
  ActionPrimaryNeed,
  ActionRecommendationSource,
  ActionRewardStamp,
  ActionRoutingFamily,
  ActionRoutingPrimaryNeed,
  ActionWeeklyReflectionRole,
} from '../actions/actionLibrary';
import { getActionDefinition, isActionId } from '../actions/actionLibrary';
import { getWeeklyActionInsightCopy } from '../actions/actionRewardCopy';
import { bodySignalByLabel, traceIconDictionary } from './traceIconDictionary';

export const MOOD_DATA_SCHEMA_VERSION = 1;

export type MoodTraceSource = 'mock_ai_assisted_input' | 'manual_text' | 'voice_transcript';
export type SafetyLevel = 'low' | 'medium' | 'high' | 'urgent_medical';
export type SafetySupportSurface = 'none' | 'gentle_note' | 'resources_panel' | 'medical_note';
export type SafetyFlagKey =
  | 'self_harm_language'
  | 'severe_distress_language'
  | 'urgent_medical_body_signal';
export type LoopSignatureStage = 'starting_out' | 'pattern_seed' | 'repeating_loop';
export type ActionCompletionStatus = 'completed' | 'skipped';
export type ActionHelpfulnessSignal = 'helped' | 'helped_a_little' | 'did_not_help';
export type ActionEffortSignal = 'easy' | 'okay' | 'too_much';
export type ActionSkipReason = 'not_today' | 'not_relevant' | 'no_time';
export type ActionFeedbackSignal = ActionHelpfulnessSignal | 'too_much' | 'not_today';
export type ActionAnswerSnapshot = Record<string, string>;
export type ActionRecommendationMode = 'daily_action' | 'loop_action';
export type LoopPatternRuleStatus = 'learning' | 'possible_thread' | 'possible_loop';

export type TraceActionRoutingFeatures = {
  primaryNeed: ActionRoutingPrimaryNeed;
  recommendedActionFamily: ActionRoutingFamily;
  burdenLevel: ActionBurdenLevel;
  whyThis: string;
};

export type BodySignalDayItem = {
  day: string;
  signals: TraceIconKey[];
  signalCounts?: Partial<Record<TraceIconKey, number>>;
};

export type BodySignalSummaryItem = {
  key: TraceIconKey;
  label: string;
  count: string;
  width: number;
};

export type LoopPatternRuleState = {
  status: LoopPatternRuleStatus;
  canShowLoop: boolean;
  canShowLoopAction: boolean;
  traceCount: number;
  dayCount: number;
  windowDays: number;
};

export type NormalizedTraceFields = {
  schemaVersion: 'normalized_trace_v1';
  contextCanonical: TraceIconKey | null;
  bodySignalCanonical: TraceIconKey | null;
  thoughtFormCanonical: 'replaying_thought' | 'self_blame' | 'stress_pressure' | null;
  loopCandidateKey: string;
  semanticTraceText: string;
};

export type SafetyFlag = {
  key: SafetyFlagKey;
  label: string;
  evidence: string;
};

export type MoodSafetyAssessment = {
  level: SafetyLevel;
  flags: SafetyFlag[];
  support: SafetySupportSurface;
  canShowPattern: boolean;
  canRecommendAction: boolean;
  allowSave: true;
};

export type LoopSignature = {
  id: string;
  chainKey: string;
  label: string;
  stage: LoopSignatureStage;
  signalKeys: TraceIconKey[];
  primaryTriggerKey: TraceIconKey | null;
  primaryThoughtKey: TraceIconKey | null;
  primaryBodyKey: TraceIconKey | null;
  evidenceLabels: string[];
  occurrenceCount: number;
  lastSeenAt: string;
};

export type MoodTraceRecord = {
  schemaVersion: number;
  id: string;
  createdAt: string;
  savedAt: string | null;
  source: MoodTraceSource;
  moodLabel: string | null;
  bodySignalLabels: string[];
  transcript: string;
  chain: TraceChain;
  extraction: TraceExtraction[];
  bodySignals: BodySignalSelection[];
  actionRoutingFeatures: TraceActionRoutingFeatures | null;
  normalizedFields: NormalizedTraceFields;
  loopSignature: LoopSignature;
  safetyAssessment: MoodSafetyAssessment;
};

export type ActionMemoryEntry = {
  schemaVersion: number;
  id: string;
  traceId: string;
  loopSignatureId: string;
  chainKey: string;
  actionId: string;
  actionTitle: string;
  family: ActionFamily | null;
  primaryNeed: ActionPrimaryNeed | null;
  weeklyReflectionRole: ActionWeeklyReflectionRole | null;
  rewardStamp: ActionRewardStamp | null;
  recommendationMode: ActionRecommendationMode;
  recommendationSource: string;
  recommendationReason: string;
  evidenceLine: string;
  completedAt: string;
  completionStatus: ActionCompletionStatus;
  helpfulness: ActionHelpfulnessSignal | null;
  effort: ActionEffortSignal | null;
  skipReason: ActionSkipReason | null;
  answers: ActionAnswerSnapshot;
  notes: string | null;
  outcomeLabel: string;
  safetyLevel: SafetyLevel;
};

export type HelpfulnessMemory = {
  schemaVersion: number;
  id: string;
  loopSignatureId: string;
  chainKey: string;
  actionId: string;
  actionTitle: string;
  completions: number;
  lastCompletedAt: string;
  outcomeCounts: Record<ActionFeedbackSignal, number>;
  lastOutcome: ActionFeedbackSignal;
  lastOutcomeLabel: string;
  bestOutcomeLabel: string;
  recommendationReason: string;
};

export type WeeklyReflectionCardMode = 'not_enough_data' | 'learning' | 'thread_summary' | 'action_learning';

export type WeeklyInsightMode =
  | 'still_learning'
  | 'early_cue'
  | 'possible_thread'
  | 'possible_loop'
  | 'micro_win'
  | 'lighter_loop'
  | 'lighter_step';

export type WeeklyActionLearningStatus =
  | 'no_action_tried'
  | 'helped'
  | 'helped_a_little'
  | 'did_not_help'
  | 'not_today'
  | 'too_much'
  | 'mixed';

export type WeeklyReflectionFacts = {
  schemaVersion: 'weekly_reflection_facts_v1';
  weekStart: string;
  weekEnd: string;
  sourceTraceIds: string[];
  sourceActionMemoryIds: string[];
  traceCount: number;
  completedActionCount: number;
  actionNoteCount: number;
  patternRule: LoopPatternRuleState;
  insightMode: WeeklyInsightMode;
  primaryThread: null | {
    loopSignatureId: string;
    label: string;
    contextLabel: string | null;
    thoughtLabel: string | null;
    bodySignalLabel: string | null;
    traceCount: number;
    distinctDayCount: number;
    evidenceTraceIds: string[];
    confidenceLabel: 'learning' | 'possible_thread' | 'possible_loop' | 'familiar_loop';
  };
  actionLearning: {
    status: WeeklyActionLearningStatus;
    bestActionId: string | null;
    bestActionTitle: string | null;
    recommendedActionSource: ActionRecommendationSource | null;
    bestActionFamily: ActionFamily | null;
    bestPrimaryNeed: ActionPrimaryNeed | null;
    weeklyReflectionRole: ActionWeeklyReflectionRole | null;
    rewardStamp: ActionRewardStamp | null;
    outcomeLabel: string | null;
    count: number;
  };
  earlyCue: {
    bodySignalLabel: string | null;
    evidenceTraceIds: string[];
  };
  recommendedNextStep: {
    mode: ActionRecommendationMode | 'none';
    actionId: string | null;
    actionTitle: string | null;
    recommendedActionSource: ActionRecommendationSource | null;
    actionFamily: ActionFamily | null;
    primaryNeed: ActionPrimaryNeed | null;
    weeklyReflectionRole: ActionWeeklyReflectionRole | null;
    rewardStamp: ActionRewardStamp | null;
    reason: string | null;
  };
  safetyBoundary: {
    canShowReflection: boolean;
    canRecommendAction: boolean;
  };
};

export type WeeklySummaryCard = {
  cardMode: WeeklyReflectionCardMode;
  eyebrow: string;
  meta: string;
  headline: string;
  summary: string;
  evidenceChip: string;
  bottomRow: {
    label: string;
    title: string;
    detail: string;
    actionId: string | null;
  };
  boundaryLine: string;
};

export type WeeklyReflectionPreview = {
  schemaVersion: number;
  generatedAt: string;
  provider: 'local' | 'openai';
  weeklyFacts: WeeklyReflectionFacts;
  summaryCard: WeeklySummaryCard;
  freePreviewText: string;
  weeklyNote: {
    title: string;
    text: string;
    evidenceLine: string;
  };
  primaryLoopLabel: string;
  traceCount: number;
  completedActionCount: number;
  lighterMomentCount: number;
  whatRepeated: {
    value: string;
    detail: string;
  };
  whatShifted: {
    value: string;
    detail: string;
  };
  whatHelped: {
    value: string;
    detail: string;
  };
  gentleNextStep: {
    value: string;
    detail: string;
  };
  paidPlan: {
    label: string;
    note: string;
  };
};

const triggerKeys = new Set<TraceIconKey>([
  'work_feedback',
  'short_sleep',
  'relationship_replay',
  'phone_scrolling',
  'stress_pressure',
]);

const thoughtKeys = new Set<TraceIconKey>(['self_blame', 'overthinking']);

const bodyKeys = new Set<TraceIconKey>([
  'stomach_tightness',
  'chest_tightness',
  'neck_shoulder_tension',
  'tired_heavy',
  'head_pressure',
  'generic_body',
]);

const selfHarmKeywords = [
  'suicide',
  'kill myself',
  'end my life',
  'self harm',
  'hurt myself',
  'want to die',
  'do not want to live',
  "don't want to live",
  'cant go on',
  "can't go on",
];

const severeDistressKeywords = [
  'hopeless',
  'unsafe',
  'unbearable',
  'panic',
  'spiraling',
  'cannot cope',
  "can't cope",
];

const urgentMedicalKeywords = [
  'sudden',
  'severe',
  'crushing',
  'faint',
  'short of breath',
  'numb',
  'emergency',
];

const helpfulnessOutcomeLabels: Record<ActionHelpfulnessSignal, string> = {
  helped: 'Helped',
  helped_a_little: 'Helped a little',
  did_not_help: "Didn't help",
};

const actionFeedbackOutcomeLabels: Record<ActionFeedbackSignal, string> = {
  ...helpfulnessOutcomeLabels,
  too_much: 'Too much',
  not_today: 'Not today',
};

function makeId(prefix: string, timestamp: string) {
  const compactTimestamp = timestamp.replace(/[^0-9]/g, '').slice(0, 17);

  return `${prefix}-${compactTimestamp}`;
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function getPlainTraceLabel(key: TraceIconKey) {
  return traceIconDictionary[key].label.replace(/\n/g, ' ');
}

const bodySignalSortOrder: TraceIconKey[] = [
  'stomach_tightness',
  'chest_tightness',
  'head_pressure',
  'neck_shoulder_tension',
  'tired_heavy',
  'generic_body',
];

export function formatTraceCount(count: number) {
  return `${count} ${count === 1 ? 'trace' : 'traces'}`;
}

export function getTraceIconPlainLabel(key: TraceIconKey) {
  return getPlainTraceLabel(key);
}

export function getBodySignalSortRank(key: TraceIconKey) {
  const rank = bodySignalSortOrder.indexOf(key);

  return rank === -1 ? bodySignalSortOrder.length : rank;
}

function normalizeFreeText(value: string | null | undefined) {
  return (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function getFirstMatchingKey(chain: TraceChain, keys: Set<TraceIconKey>) {
  return chain.find((key) => keys.has(key)) || null;
}

function getContextCanonical(chain: TraceChain, transcript: string, extraction: TraceExtraction[]) {
  const normalizedText = normalizeFreeText(
    [transcript, ...extraction.map((item) => `${item.label} ${item.value}`)].join(' '),
  );
  const triggerKey = getFirstMatchingKey(chain, triggerKeys);

  if (
    triggerKey === 'work_feedback' ||
    /\b(work|manager|boss|slack|feedback|message|performance|meeting)\b/.test(normalizedText)
  ) {
    return 'work_feedback';
  }

  return triggerKey;
}

function getThoughtFormCanonical(chain: TraceChain, transcript: string, extraction: TraceExtraction[]) {
  const normalizedText = normalizeFreeText(
    [transcript, ...extraction.map((item) => `${item.label} ${item.value}`)].join(' '),
  );

  if (chain.includes('self_blame') || /\b(self[- ]?blame|my fault|did something wrong)\b/.test(normalizedText)) {
    return 'self_blame';
  }

  if (
    chain.includes('overthinking') ||
    /\b(overthinking|replaying|replay|ruminating|can't stop thinking|kept thinking|worry|worried)\b/.test(
      normalizedText,
    )
  ) {
    return 'replaying_thought';
  }

  if (chain.includes('stress_pressure') || /\b(stress|pressure|overwhelmed)\b/.test(normalizedText)) {
    return 'stress_pressure';
  }

  return null;
}

export function buildNormalizedTraceFields({
  traceResult,
  transcript,
  selectedMood,
}: {
  traceResult: MockTraceResult;
  transcript: string;
  selectedMood: string | null;
}): NormalizedTraceFields {
  const contextCanonical = getContextCanonical(traceResult.chain, transcript, traceResult.extraction);
  const bodySignalCanonical =
    traceResult.bodySignals[0]?.key || getFirstMatchingKey(traceResult.chain, bodyKeys) || null;
  const thoughtFormCanonical = getThoughtFormCanonical(traceResult.chain, transcript, traceResult.extraction);
  const loopCandidateKey = [
    contextCanonical || 'unknown_context',
    bodySignalCanonical || 'unknown_body',
    thoughtFormCanonical || 'unknown_thought',
  ].join('|');
  const semanticPieces = [
    selectedMood ? `feeling ${selectedMood}` : null,
    contextCanonical ? getPlainTraceLabel(contextCanonical) : null,
    bodySignalCanonical ? getPlainTraceLabel(bodySignalCanonical) : null,
    thoughtFormCanonical ? thoughtFormCanonical.replace(/_/g, ' ') : null,
  ].filter((piece): piece is string => Boolean(piece));

  return {
    schemaVersion: 'normalized_trace_v1',
    contextCanonical,
    bodySignalCanonical,
    thoughtFormCanonical,
    loopCandidateKey,
    semanticTraceText: semanticPieces.join(', ').toLowerCase(),
  };
}

function getLoopStage(occurrenceCount: number): LoopSignatureStage {
  if (occurrenceCount >= 3) {
    return 'repeating_loop';
  }

  if (occurrenceCount >= 2) {
    return 'pattern_seed';
  }

  return 'starting_out';
}

function formatOccurrenceLabel(count: number) {
  return `Seen in ${count} saved ${count === 1 ? 'trace' : 'traces'}`;
}

export function toLoopChainKey(chain: TraceChain) {
  return chain.join('>');
}

export function assessMoodSafety({
  transcript,
  selectedBodySignalLabels,
  bodySignals,
}: {
  transcript: string;
  selectedBodySignalLabels: string[];
  bodySignals: BodySignalSelection[];
}): MoodSafetyAssessment {
  const normalizedTranscript = transcript.toLowerCase();
  const allBodyLabels = [
    ...selectedBodySignalLabels,
    ...bodySignals.map((signal) => signal.value),
  ].map((label) => label.toLowerCase());
  const hasChestSignal = allBodyLabels.some((label) => label.includes('chest'));
  const flags: SafetyFlag[] = [];

  if (includesAny(normalizedTranscript, selfHarmKeywords)) {
    flags.push({
      key: 'self_harm_language',
      label: 'Crisis language',
      evidence: 'Text includes self-harm or suicidal language.',
    });
  }

  if (includesAny(normalizedTranscript, severeDistressKeywords)) {
    flags.push({
      key: 'severe_distress_language',
      label: 'Severe distress language',
      evidence: 'Text includes severe distress language.',
    });
  }

  if (hasChestSignal && includesAny(normalizedTranscript, urgentMedicalKeywords)) {
    flags.push({
      key: 'urgent_medical_body_signal',
      label: 'Urgent body signal',
      evidence: 'Chest tightness appears with sudden, severe, or medical concern language.',
    });
  }

  if (flags.some((flag) => flag.key === 'urgent_medical_body_signal')) {
    return {
      level: 'urgent_medical',
      flags,
      support: 'medical_note',
      canShowPattern: false,
      canRecommendAction: false,
      allowSave: true,
    };
  }

  if (flags.some((flag) => flag.key === 'self_harm_language')) {
    return {
      level: 'high',
      flags,
      support: 'resources_panel',
      canShowPattern: false,
      canRecommendAction: false,
      allowSave: true,
    };
  }

  if (flags.length > 0) {
    return {
      level: 'medium',
      flags,
      support: 'gentle_note',
      canShowPattern: true,
      canRecommendAction: true,
      allowSave: true,
    };
  }

  return {
    level: 'low',
    flags: [],
    support: 'none',
    canShowPattern: true,
    canRecommendAction: true,
    allowSave: true,
  };
}

export function buildLoopSignature({
  chain,
  chainKey = toLoopChainKey(chain),
  createdAt,
  occurrenceCount = 1,
}: {
  chain: TraceChain;
  chainKey?: string;
  createdAt: string;
  occurrenceCount?: number;
}): LoopSignature {
  const primaryTriggerKey = getFirstMatchingKey(chain, triggerKeys);
  const primaryThoughtKey = getFirstMatchingKey(chain, thoughtKeys);
  const primaryBodyKey = getFirstMatchingKey(chain, bodyKeys);
  const labelKeys = [primaryTriggerKey, primaryThoughtKey, primaryBodyKey].filter(
    (key): key is TraceIconKey => Boolean(key),
  );
  const label =
    labelKeys.length > 0
      ? labelKeys.map(getPlainTraceLabel).join(' + ')
      : chain.slice(0, 3).map(getPlainTraceLabel).join(' + ');
  const evidenceLabels = [formatOccurrenceLabel(occurrenceCount)];

  if (primaryBodyKey) {
    evidenceLabels.push(`Usually includes ${getPlainTraceLabel(primaryBodyKey).toLowerCase()}`);
  }

  return {
    id: `loop-${chainKey.replace(/[^a-z0-9]+/g, '-')}`,
    chainKey,
    label,
    stage: getLoopStage(occurrenceCount),
    signalKeys: chain,
    primaryTriggerKey,
    primaryThoughtKey,
    primaryBodyKey,
    evidenceLabels,
    occurrenceCount,
    lastSeenAt: createdAt,
  };
}

export function getLoopIdentityKey(record: Pick<MoodTraceRecord, 'normalizedFields' | 'chain'>) {
  return record.normalizedFields?.loopCandidateKey || toLoopChainKey(record.chain);
}

export function buildLoopSignaturesFromTraces(traceRecords: MoodTraceRecord[]) {
  const groupedRecords = new Map<string, MoodTraceRecord[]>();

  traceRecords.filter((record) => record.safetyAssessment.canShowPattern).forEach((record) => {
    const chainKey = getLoopIdentityKey(record);
    groupedRecords.set(chainKey, [...(groupedRecords.get(chainKey) || []), record]);
  });

  return Array.from(groupedRecords.values())
    .map((records) => {
      const sortedRecords = [...records].sort((left, right) =>
        right.savedAt?.localeCompare(left.savedAt || '') || right.createdAt.localeCompare(left.createdAt),
      );
      const latestRecord = sortedRecords[0];

      return buildLoopSignature({
        chain: latestRecord.chain,
        chainKey: getLoopIdentityKey(latestRecord),
        createdAt: latestRecord.savedAt || latestRecord.createdAt,
        occurrenceCount: records.length,
      });
    })
    .sort((left, right) => {
      if (right.occurrenceCount !== left.occurrenceCount) {
        return right.occurrenceCount - left.occurrenceCount;
      }

      return right.lastSeenAt.localeCompare(left.lastSeenAt);
    });
}

export function buildMoodTraceRecord({
  transcript,
  selectedMood,
  selectedBodySignalLabels,
  traceResult,
  source = 'mock_ai_assisted_input',
  createdAt = new Date().toISOString(),
  savedAt = createdAt,
  occurrenceCount = 1,
  safetyAssessment,
  actionRoutingFeatures = null,
}: {
  transcript: string;
  selectedMood: string | null;
  selectedBodySignalLabels: string[];
  traceResult: MockTraceResult;
  source?: MoodTraceSource;
  createdAt?: string;
  savedAt?: string | null;
  occurrenceCount?: number;
  safetyAssessment?: MoodSafetyAssessment;
  actionRoutingFeatures?: TraceActionRoutingFeatures | null;
}): MoodTraceRecord {
  const normalizedFields = buildNormalizedTraceFields({
    traceResult,
    transcript,
    selectedMood,
  });
  const loopSignature = buildLoopSignature({
    chain: traceResult.chain,
    chainKey: normalizedFields.loopCandidateKey,
    createdAt,
    occurrenceCount,
  });
  const resolvedSafetyAssessment =
    safetyAssessment ||
    assessMoodSafety({
      transcript,
      selectedBodySignalLabels,
      bodySignals: traceResult.bodySignals,
    });

  return {
    schemaVersion: MOOD_DATA_SCHEMA_VERSION,
    id: makeId('trace', createdAt),
    createdAt,
    savedAt,
    source,
    moodLabel: selectedMood,
    bodySignalLabels: selectedBodySignalLabels,
    transcript,
    chain: traceResult.chain,
    extraction: traceResult.extraction,
    bodySignals: traceResult.bodySignals,
    actionRoutingFeatures,
    normalizedFields,
    loopSignature,
    safetyAssessment: resolvedSafetyAssessment,
  };
}

export function inferBodySignalSelectionFromText(text: string): BodySignalSelection | null {
  const normalizedText = text.toLowerCase();

  if (normalizedText.includes('chest')) {
    return { key: 'chest_tightness', value: 'Chest tightness' };
  }

  if (normalizedText.includes('stomach') || normalizedText.includes('belly') || normalizedText.includes('gut')) {
    return { key: 'stomach_tightness', value: 'Stomach tightness' };
  }

  if (normalizedText.includes('head')) {
    return { key: 'head_pressure', value: 'Head pressure' };
  }

  if (normalizedText.includes('neck') || normalizedText.includes('shoulder')) {
    return { key: 'neck_shoulder_tension', value: 'Neck / shoulder tension' };
  }

  if (normalizedText.includes('tired') || normalizedText.includes('heavy')) {
    return { key: 'tired_heavy', value: 'Tired / heavy' };
  }

  if (normalizedText.includes('not sure') || normalizedText.includes('body')) {
    return { key: 'generic_body', value: 'Not sure yet' };
  }

  return null;
}

export function inferTraceIconKeyFromEditedField(item: TraceExtraction): TraceIconKey | null {
  const normalizedLabel = item.label.toLowerCase();
  const normalizedValue = item.value.toLowerCase();
  const combinedText = `${normalizedLabel} ${normalizedValue}`;

  if (normalizedLabel.includes('feeling') || normalizedLabel.includes('mood')) {
    return null;
  }

  if (normalizedLabel.includes('body') || normalizedLabel.includes('signal')) {
    return inferBodySignalSelectionFromText(combinedText)?.key || 'generic_body';
  }

  if (
    normalizedLabel.includes('context') ||
    normalizedLabel.includes('trigger') ||
    /\b(work|manager|boss|meeting|message|feedback|slack)\b/.test(combinedText)
  ) {
    return 'work_feedback';
  }

  if (combinedText.includes('sleep')) {
    return 'short_sleep';
  }

  if (combinedText.includes('phone') || combinedText.includes('scroll')) {
    return 'phone_scrolling';
  }

  if (combinedText.includes('relationship') || combinedText.includes('friend') || combinedText.includes('partner')) {
    return 'relationship_replay';
  }

  if (
    combinedText.includes('self') ||
    combinedText.includes('blame') ||
    combinedText.includes('wrong') ||
    combinedText.includes('fault')
  ) {
    return 'self_blame';
  }

  if (
    combinedText.includes('thought') ||
    combinedText.includes('worry') ||
    combinedText.includes('replay') ||
    combinedText.includes('linger') ||
    combinedText.includes('kept thinking') ||
    combinedText.includes('overthink')
  ) {
    return 'overthinking';
  }

  if (combinedText.includes('stress') || combinedText.includes('pressure') || combinedText.includes('overwhelmed')) {
    return 'stress_pressure';
  }

  return inferBodySignalSelectionFromText(combinedText)?.key || null;
}

export function getSelectedBodySignalSelections(selectedBodySignalLabels: string[]) {
  return selectedBodySignalLabels
    .map((label) => bodySignalByLabel[label])
    .filter((signal): signal is BodySignalSelection => Boolean(signal));
}

export function buildFinalTraceResultFromReview({
  draftTraceResult,
  draftReviewExtraction,
  selectedBodySignalLabels,
}: {
  draftTraceResult: MockTraceResult;
  draftReviewExtraction: TraceExtraction[];
  selectedBodySignalLabels: string[];
}): MockTraceResult {
  const finalExtraction = draftReviewExtraction
    .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
    .filter((item) => item.label && item.value);
  const editedKeys = finalExtraction
    .map(inferTraceIconKeyFromEditedField)
    .filter((key): key is TraceIconKey => Boolean(key));
  const selectedBodySignals = getSelectedBodySignalSelections(selectedBodySignalLabels);
  const extractedBodySignals = finalExtraction
    .filter((item) => item.label.toLowerCase().includes('body') || item.label.toLowerCase().includes('signal'))
    .map((item) => inferBodySignalSelectionFromText(item.value))
    .filter((signal): signal is BodySignalSelection => Boolean(signal));
  const mergedBodySignals = new Map<TraceIconKey, BodySignalSelection>();
  const bodySignalSource =
    extractedBodySignals.length > 0
      ? extractedBodySignals
      : [...selectedBodySignals, ...draftTraceResult.bodySignals];

  bodySignalSource.forEach((signal) => {
    if (!mergedBodySignals.has(signal.key)) {
      mergedBodySignals.set(signal.key, signal);
    }
  });

  const mergedChain = Array.from(new Set([...editedKeys, ...Array.from(mergedBodySignals.keys())]));

  return {
    chain: (mergedChain.length > 0 ? mergedChain : draftTraceResult.chain).slice(0, 5),
    extraction: finalExtraction,
    bodySignals: Array.from(mergedBodySignals.values()),
  };
}

export function getConfirmedBodySignalLabels(traceResult: MockTraceResult) {
  return Array.from(
    new Set(
      traceResult.bodySignals.map((signal) => {
        const matchingSelectionLabel = Object.entries(bodySignalByLabel).find(
          ([, candidate]) => candidate.key === signal.key,
        )?.[0];

        return matchingSelectionLabel || signal.value;
      }),
    ),
  );
}

function getLocalDayKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTraceRecordIso(record: MoodTraceRecord) {
  return record.savedAt || record.createdAt;
}

function getIsoDayKey(isoDate: string) {
  return isoDate.slice(0, 10);
}

function getUtcDayStartMs(isoDate: string) {
  const [year, month, day] = getIsoDayKey(isoDate).split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return Date.UTC(year, month - 1, day);
}

function getDayDistance(laterIsoDate: string, earlierIsoDate: string) {
  const laterDay = getUtcDayStartMs(laterIsoDate);
  const earlierDay = getUtcDayStartMs(earlierIsoDate);

  if (laterDay === null || earlierDay === null) {
    return 0;
  }

  return Math.abs(Math.round((laterDay - earlierDay) / (24 * 60 * 60 * 1000)));
}

export function getLoopPatternRuleState(
  loopSignature: LoopSignature | null,
  traceRecords: MoodTraceRecord[],
  windowDays = 5,
): LoopPatternRuleState {
  if (!loopSignature) {
    return {
      status: 'learning',
      canShowLoop: false,
      canShowLoopAction: false,
      traceCount: 0,
      dayCount: 0,
      windowDays,
    };
  }

  const matchingRecords = traceRecords
    .filter(
      (record) =>
        record.safetyAssessment.canShowPattern && getLoopIdentityKey(record) === loopSignature.chainKey,
    )
    .sort((left, right) => getTraceRecordIso(right).localeCompare(getTraceRecordIso(left)));

  if (matchingRecords.length === 0) {
    return {
      status: 'learning',
      canShowLoop: false,
      canShowLoopAction: false,
      traceCount: 0,
      dayCount: 0,
      windowDays,
    };
  }

  const latestIso = getTraceRecordIso(matchingRecords[0]);
  const recentRecords = matchingRecords.filter(
    (record) => getDayDistance(latestIso, getTraceRecordIso(record)) <= windowDays,
  );
  const recentDayCount = new Set(recentRecords.map((record) => getIsoDayKey(getTraceRecordIso(record)))).size;
  const canShowLoop = recentRecords.length >= 3 && recentDayCount >= 2;
  const canShowLoopAction = recentRecords.length >= 4 && recentDayCount >= 2;

  return {
    status: !canShowLoop ? 'learning' : canShowLoopAction ? 'possible_loop' : 'possible_thread',
    canShowLoop,
    canShowLoopAction,
    traceCount: recentRecords.length,
    dayCount: recentDayCount,
    windowDays,
  };
}

export function getBodySignalKeysFromTraceRecord(record: MoodTraceRecord) {
  const keys = new Set<TraceIconKey>();

  record.bodySignals.forEach((signal) => {
    keys.add(signal.key);
  });

  if (record.normalizedFields.bodySignalCanonical) {
    keys.add(record.normalizedFields.bodySignalCanonical);
  }

  if (record.loopSignature.primaryBodyKey) {
    keys.add(record.loopSignature.primaryBodyKey);
  }

  return Array.from(keys).sort((left, right) => getBodySignalSortRank(left) - getBodySignalSortRank(right));
}

export function buildBodySignalDaysFromTraces(
  traceRecords: MoodTraceRecord[],
  referenceDate = new Date(),
): BodySignalDayItem[] {
  const todayStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const dayItems = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayStart);
    date.setDate(todayStart.getDate() - (6 - index));
    const dateKey = getLocalDayKey(date);

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateKey,
      signals: [] as TraceIconKey[],
      signalCounts: {} as Partial<Record<TraceIconKey, number>>,
    };
  });
  const dayByKey = new Map(dayItems.map((item) => [item.dateKey, item]));

  traceRecords
    .filter((record) => record.safetyAssessment.canShowPattern)
    .forEach((record) => {
      const recordDate = new Date(getTraceRecordIso(record));

      if (Number.isNaN(recordDate.getTime())) {
        return;
      }

      const recordDayKey = getLocalDayKey(recordDate);
      const dayItem = dayByKey.get(recordDayKey);

      if (!dayItem) {
        return;
      }

      const bodySignals = getBodySignalKeysFromTraceRecord(record);
      const mergedSignals = new Set([...dayItem.signals, ...bodySignals]);
      dayItem.signals = Array.from(mergedSignals).sort(
        (left, right) => getBodySignalSortRank(left) - getBodySignalSortRank(right),
      );
      bodySignals.forEach((signal) => {
        dayItem.signalCounts[signal] = (dayItem.signalCounts[signal] || 0) + 1;
      });
    });

  return dayItems.map(({ day, signals, signalCounts }) => ({ day, signals, signalCounts }));
}

export function buildBodySignalSummary(days: BodySignalDayItem[]): BodySignalSummaryItem[] {
  const counts = new Map<TraceIconKey, number>();

  days.forEach((day) => {
    if (day.signalCounts) {
      Object.entries(day.signalCounts).forEach(([signal, count]) => {
        const key = signal as TraceIconKey;
        counts.set(key, (counts.get(key) || 0) + (count || 0));
      });
      return;
    }

    day.signals.forEach((signal) => counts.set(signal, (counts.get(signal) || 0) + 1));
  });

  const maxCount = Math.max(...Array.from(counts.values()), 1);

  return Array.from(counts.entries())
    .sort(([leftKey, leftCount], [rightKey, rightCount]) => {
      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }

      return getBodySignalSortRank(leftKey) - getBodySignalSortRank(rightKey);
    })
    .slice(0, 3)
    .map(([key, count]) => ({
      key,
      label: getTraceIconPlainLabel(key),
      count: formatTraceCount(count),
      width: Math.max(54, Math.round((count / maxCount) * 112)),
    }));
}

export function hydrateMoodTraceRecord(record: MoodTraceRecord): MoodTraceRecord {
  const normalizedFields =
    record.normalizedFields?.schemaVersion === 'normalized_trace_v1'
      ? record.normalizedFields
      : buildNormalizedTraceFields({
          traceResult: {
            chain: record.chain,
            extraction: record.extraction,
            bodySignals: record.bodySignals,
          },
          transcript: record.transcript,
          selectedMood: record.moodLabel,
        });

  const loopSignature =
    record.loopSignature?.chainKey === normalizedFields.loopCandidateKey
      ? record.loopSignature
      : buildLoopSignature({
          chain: record.chain,
          chainKey: normalizedFields.loopCandidateKey,
          createdAt: record.savedAt || record.createdAt,
          occurrenceCount: record.loopSignature?.occurrenceCount || 1,
        });

  return {
    ...record,
    actionRoutingFeatures: record.actionRoutingFeatures || null,
    normalizedFields,
    loopSignature,
  };
}

export function hydrateActionMemoryEntry(entry: ActionMemoryEntry): ActionMemoryEntry {
  const actionSchemaSnapshot = getActionSchemaSnapshot(entry.actionId);
  const legacyHelpfulness = (entry as unknown as { helpfulness?: ActionFeedbackSignal }).helpfulness;
  const completionStatus =
    entry.completionStatus || (legacyHelpfulness === 'not_today' ? 'skipped' : 'completed');
  const helpfulness =
    legacyHelpfulness === 'too_much' || legacyHelpfulness === 'not_today'
      ? null
      : entry.helpfulness || legacyHelpfulness || null;
  const effort = entry.effort || (legacyHelpfulness === 'too_much' ? 'too_much' : deriveActionEffort(helpfulness));
  const skipReason = entry.skipReason || (completionStatus === 'skipped' ? 'not_today' : null);
  const hydratedEntry = {
    ...entry,
    completionStatus,
    helpfulness,
    effort: completionStatus === 'skipped' ? null : effort,
    skipReason,
  };

  return {
    ...hydratedEntry,
    family: hydratedEntry.family || actionSchemaSnapshot.family,
    primaryNeed: hydratedEntry.primaryNeed || actionSchemaSnapshot.primaryNeed,
    weeklyReflectionRole: hydratedEntry.weeklyReflectionRole || actionSchemaSnapshot.weeklyReflectionRole,
    rewardStamp: hydratedEntry.rewardStamp || actionSchemaSnapshot.rewardStamp,
    recommendationMode: hydratedEntry.recommendationMode || 'loop_action',
    recommendationSource: hydratedEntry.recommendationSource || 'fallback',
    recommendationReason:
      hydratedEntry.recommendationReason ||
      hydratedEntry.outcomeLabel ||
      'Saved before recommendation details were tracked.',
    evidenceLine: hydratedEntry.evidenceLine || 'Saved before evidence details were tracked.',
    outcomeLabel: hydratedEntry.outcomeLabel || getActionFeedbackOutcomeLabel(getActionFeedbackSignal(hydratedEntry)),
  };
}

export function deriveActionEffort(helpfulness: ActionHelpfulnessSignal | null): ActionEffortSignal | null {
  if (helpfulness === 'helped') {
    return 'easy';
  }

  if (helpfulness === 'helped_a_little' || helpfulness === 'did_not_help') {
    return 'okay';
  }

  return null;
}

export function getHelpfulnessOutcomeLabel(helpfulness: ActionHelpfulnessSignal) {
  return helpfulnessOutcomeLabels[helpfulness];
}

export function getActionFeedbackSignal(
  entry: Pick<ActionMemoryEntry, 'completionStatus' | 'helpfulness' | 'effort' | 'skipReason'>,
): ActionFeedbackSignal {
  if (entry.completionStatus === 'skipped' || entry.skipReason) {
    return 'not_today';
  }

  if (entry.effort === 'too_much') {
    return 'too_much';
  }

  return entry.helpfulness || 'did_not_help';
}

export function getActionFeedbackOutcomeLabel(feedback: ActionFeedbackSignal) {
  return actionFeedbackOutcomeLabels[feedback];
}

export function createActionMemoryEntry({
  traceRecord,
  actionId,
  actionTitle,
  recommendationMode,
  recommendationSource = 'fallback',
  recommendationReason,
  evidenceLine,
  completionStatus = 'completed',
  helpfulness,
  effort,
  skipReason = null,
  answers,
  completedAt = new Date().toISOString(),
  notes = null,
}: {
  traceRecord: MoodTraceRecord;
  actionId: string;
  actionTitle: string;
  recommendationMode: ActionRecommendationMode;
  recommendationSource?: string;
  recommendationReason: string;
  evidenceLine: string;
  completionStatus?: ActionCompletionStatus;
  helpfulness?: ActionHelpfulnessSignal | null;
  effort?: ActionEffortSignal | null;
  skipReason?: ActionSkipReason | null;
  answers: ActionAnswerSnapshot;
  completedAt?: string;
  notes?: string | null;
}): ActionMemoryEntry {
  const actionSchemaSnapshot = getActionSchemaSnapshot(actionId);
  const resolvedHelpfulness = completionStatus === 'skipped' ? null : helpfulness || null;
  const resolvedEffort =
    completionStatus === 'skipped' ? null : effort || deriveActionEffort(resolvedHelpfulness);
  const resolvedSkipReason = completionStatus === 'skipped' ? skipReason || 'not_today' : null;
  const feedbackSignal = getActionFeedbackSignal({
    completionStatus,
    helpfulness: resolvedHelpfulness,
    effort: resolvedEffort,
    skipReason: resolvedSkipReason,
  });

  return {
    schemaVersion: MOOD_DATA_SCHEMA_VERSION,
    id: makeId(`action-memory-${actionId}`, completedAt),
    traceId: traceRecord.id,
    loopSignatureId: traceRecord.loopSignature.id,
    chainKey: traceRecord.loopSignature.chainKey,
    actionId,
    actionTitle,
    family: actionSchemaSnapshot.family,
    primaryNeed: actionSchemaSnapshot.primaryNeed,
    weeklyReflectionRole: actionSchemaSnapshot.weeklyReflectionRole,
    rewardStamp: actionSchemaSnapshot.rewardStamp,
    recommendationMode,
    recommendationSource,
    recommendationReason,
    evidenceLine,
    completedAt,
    completionStatus,
    helpfulness: resolvedHelpfulness,
    effort: resolvedEffort,
    skipReason: resolvedSkipReason,
    answers,
    notes,
    outcomeLabel: actionFeedbackOutcomeLabels[feedbackSignal],
    safetyLevel: traceRecord.safetyAssessment.level,
  };
}

function getBestOutcomeLabel(outcomeCounts: Record<ActionFeedbackSignal, number>) {
  if (outcomeCounts.helped > 0) {
    return helpfulnessOutcomeLabels.helped;
  }

  if (outcomeCounts.helped_a_little > 0) {
    return helpfulnessOutcomeLabels.helped_a_little;
  }

  if (outcomeCounts.too_much > 0) {
    return 'Try a lighter version';
  }

  if (outcomeCounts.not_today > 0) {
    return actionFeedbackOutcomeLabels.not_today;
  }

  return helpfulnessOutcomeLabels.did_not_help;
}

export function buildHelpfulnessMemory(entries: ActionMemoryEntry[]): HelpfulnessMemory[] {
  const groupedEntries = new Map<string, ActionMemoryEntry[]>();

  entries.forEach((entry) => {
    const groupKey = `${entry.chainKey}::${entry.actionId}`;
    groupedEntries.set(groupKey, [...(groupedEntries.get(groupKey) || []), entry]);
  });

  return Array.from(groupedEntries.entries()).map(([groupKey, groupEntries]) => {
    const sortedEntries = [...groupEntries].sort((left, right) =>
      right.completedAt.localeCompare(left.completedAt),
    );
    const latestEntry = sortedEntries[0];
    const outcomeCounts: Record<ActionFeedbackSignal, number> = {
      helped: 0,
      helped_a_little: 0,
      did_not_help: 0,
      too_much: 0,
      not_today: 0,
    };

    groupEntries.forEach((entry) => {
      outcomeCounts[getActionFeedbackSignal(entry)] += 1;
    });

    const bestOutcomeLabel = getBestOutcomeLabel(outcomeCounts);
    const completedEntries = groupEntries.filter((entry) => entry.completionStatus === 'completed');
    const latestOutcome = getActionFeedbackSignal(latestEntry);

    return {
      schemaVersion: MOOD_DATA_SCHEMA_VERSION,
      id: `helpfulness-memory-${groupKey.replace(/[^a-z0-9]+/g, '-')}`,
      loopSignatureId: latestEntry.loopSignatureId,
      chainKey: latestEntry.chainKey,
      actionId: latestEntry.actionId,
      actionTitle: latestEntry.actionTitle,
      completions: completedEntries.length,
      lastCompletedAt: latestEntry.completedAt,
      outcomeCounts,
      lastOutcome: latestOutcome,
      lastOutcomeLabel: latestEntry.outcomeLabel,
      bestOutcomeLabel,
      recommendationReason:
        completedEntries.length === 0
          ? `Rora remembered that ${latestEntry.actionTitle} was skipped when this loop showed up.`
          : completedEntries.length === 1
          ? `Rora remembered that ${latestEntry.actionTitle} ${latestEntry.outcomeLabel.toLowerCase()} last time this loop showed up.`
          : `Rora has seen ${latestEntry.actionTitle} help this loop ${completedEntries.length} times. Best signal: ${bestOutcomeLabel.toLowerCase()}.`,
    };
  });
}

function getBestHelpfulnessMemory(memories: HelpfulnessMemory[]) {
  return [...memories].sort((left, right) => {
    const leftPositiveCount = left.outcomeCounts.helped * 2 + left.outcomeCounts.helped_a_little;
    const rightPositiveCount = right.outcomeCounts.helped * 2 + right.outcomeCounts.helped_a_little;

    if (rightPositiveCount !== leftPositiveCount) {
      return rightPositiveCount - leftPositiveCount;
    }

    if (right.completions !== left.completions) {
      return right.completions - left.completions;
    }

    return right.lastCompletedAt.localeCompare(left.lastCompletedAt);
  })[0] || null;
}

function capitalizeSentence(text: string) {
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : text;
}

function formatWeeklyCountPhrase(traceCount: number) {
  return traceCount === 1 ? 'once' : `${traceCount} times`;
}

function buildWeeklyLoopSentence(primaryLoop: LoopSignature | null, traceCount: number) {
  if (!primaryLoop || traceCount <= 0) {
    return 'Rora is still learning what tends to repeat.';
  }

  const triggerLabel = primaryLoop.primaryTriggerKey
    ? getPlainTraceLabel(primaryLoop.primaryTriggerKey).toLowerCase()
    : null;
  const thoughtLabel = primaryLoop.primaryThoughtKey
    ? getPlainTraceLabel(primaryLoop.primaryThoughtKey).toLowerCase()
    : null;
  const bodyLabel = primaryLoop.primaryBodyKey
    ? getPlainTraceLabel(primaryLoop.primaryBodyKey).toLowerCase()
    : null;
  const countPhrase = formatWeeklyCountPhrase(traceCount);
  const threadLead = thoughtLabel
    ? `${thoughtLabel} kept returning`
    : `${primaryLoop.label.toLowerCase()} kept showing up`;
  const triggerPhrase = triggerLabel ? ` after ${triggerLabel}` : '';
  const bodyPhrase = bodyLabel ? `, with ${bodyLabel} as the body cue` : '';

  return `${capitalizeSentence(threadLead)}${triggerPhrase}${bodyPhrase} ${countPhrase}.`;
}

function buildWeeklyPreviewLead(primaryLoop: LoopSignature | null) {
  if (!primaryLoop) {
    return 'a few saved traces';
  }

  const triggerLabel = primaryLoop.primaryTriggerKey
    ? getPlainTraceLabel(primaryLoop.primaryTriggerKey).toLowerCase()
    : null;
  const thoughtLabel = primaryLoop.primaryThoughtKey
    ? getPlainTraceLabel(primaryLoop.primaryThoughtKey).toLowerCase()
    : null;

  if (triggerLabel && thoughtLabel) {
    return `${thoughtLabel} after ${triggerLabel}`;
  }

  return primaryLoop.label.toLowerCase();
}

function getLocalWeekWindow(referenceDate: Date) {
  const weekEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekEnd.getDate() - 6);

  return {
    weekStart,
    weekEnd,
    weekStartKey: getLocalDayKey(weekStart),
    weekEndKey: getLocalDayKey(weekEnd),
  };
}

function isLocalDayInWindow(date: Date, weekStartKey: string, weekEndKey: string) {
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const dayKey = getLocalDayKey(date);

  return dayKey >= weekStartKey && dayKey <= weekEndKey;
}

function getTraceRecordLocalDate(record: MoodTraceRecord) {
  return new Date(getTraceRecordIso(record));
}

const actionRecommendationSources: ActionRecommendationSource[] = [
  'memory_helped',
  'too_much_lighter',
  'new_loop',
  'body_signal',
  'overthinking',
  'fallback',
  'daily_body_signal',
  'daily_overthinking',
  'daily_fallback',
  'ai_routing',
];

function getActionRecommendationSource(source: string | null | undefined): ActionRecommendationSource | null {
  return actionRecommendationSources.includes(source as ActionRecommendationSource)
    ? (source as ActionRecommendationSource)
    : null;
}

function getActionSchemaSnapshot(actionId: string | null | undefined) {
  if (!actionId || !isActionId(actionId)) {
    return {
      family: null,
      primaryNeed: null,
      weeklyReflectionRole: null,
      rewardStamp: null,
    };
  }

  const actionDefinition = getActionDefinition(actionId);

  return {
    family: actionDefinition.family,
    primaryNeed: actionDefinition.primaryNeed,
    weeklyReflectionRole: actionDefinition.memory.weeklyReflectionRole,
    rewardStamp: actionDefinition.completion.rewardStamp,
  };
}

function getWeeklyActionLearning(actionEntries: ActionMemoryEntry[]) {
  const sortedEntries = [...actionEntries].sort((left, right) => right.completedAt.localeCompare(left.completedAt));
  const outcomeCounts = sortedEntries.reduce(
    (counts, entry) => ({
      ...counts,
      [getActionFeedbackSignal(entry)]: counts[getActionFeedbackSignal(entry)] + 1,
    }),
    {
      helped: 0,
      helped_a_little: 0,
      did_not_help: 0,
      too_much: 0,
      not_today: 0,
    } as Record<ActionFeedbackSignal, number>,
  );
  const nonZeroOutcomeCount = Object.values(outcomeCounts).filter((count) => count > 0).length;
  const status: WeeklyActionLearningStatus =
    sortedEntries.length === 0
      ? 'no_action_tried'
      : nonZeroOutcomeCount > 1
        ? 'mixed'
        : outcomeCounts.helped > 0
          ? 'helped'
          : outcomeCounts.helped_a_little > 0
            ? 'helped_a_little'
            : outcomeCounts.too_much > 0
              ? 'too_much'
              : outcomeCounts.not_today > 0
                ? 'not_today'
                : 'did_not_help';
  const bestEntry =
    sortedEntries.find((entry) => entry.helpfulness === 'helped') ||
    sortedEntries.find((entry) => entry.helpfulness === 'helped_a_little') ||
    sortedEntries.find((entry) => entry.effort === 'too_much') ||
    sortedEntries.find((entry) => entry.completionStatus === 'completed') ||
    sortedEntries[0] ||
    null;
  const bestEntrySchemaSnapshot = getActionSchemaSnapshot(bestEntry?.actionId);

  return {
    status,
    bestActionId: bestEntry?.actionId || null,
    bestActionTitle: bestEntry?.actionTitle || null,
    recommendedActionSource: getActionRecommendationSource(bestEntry?.recommendationSource),
    bestActionFamily: bestEntry?.family || bestEntrySchemaSnapshot.family,
    bestPrimaryNeed: bestEntry?.primaryNeed || bestEntrySchemaSnapshot.primaryNeed,
    weeklyReflectionRole: bestEntry?.weeklyReflectionRole || bestEntrySchemaSnapshot.weeklyReflectionRole,
    rewardStamp: bestEntry?.rewardStamp || bestEntrySchemaSnapshot.rewardStamp,
    outcomeLabel: bestEntry?.outcomeLabel || null,
    count: sortedEntries.length,
  };
}

function getPrimaryThreadConfidence(
  traceCount: number,
  distinctDayCount: number,
): NonNullable<WeeklyReflectionFacts['primaryThread']>['confidenceLabel'] {
  if (traceCount >= 5 && distinctDayCount >= 3) {
    return 'familiar_loop';
  }

  if (traceCount >= 4 && distinctDayCount >= 2) {
    return 'possible_loop';
  }

  if (traceCount >= 3 && distinctDayCount >= 2) {
    return 'possible_thread';
  }

  return 'learning';
}

export function getWeeklyInsightMode({
  patternRule,
  actionLearningStatus,
  actionLearningCount,
  hasEarlyCue,
}: {
  patternRule: LoopPatternRuleState;
  actionLearningStatus: WeeklyActionLearningStatus;
  actionLearningCount: number;
  hasEarlyCue: boolean;
}): WeeklyInsightMode {
  const hasPositiveAction =
    actionLearningStatus === 'helped' || actionLearningStatus === 'helped_a_little';

  if (actionLearningStatus === 'too_much') {
    return 'lighter_step';
  }

  if (patternRule.status === 'possible_loop' && hasPositiveAction && actionLearningCount >= 2) {
    return 'lighter_loop';
  }

  if (hasPositiveAction) {
    return 'micro_win';
  }

  if (patternRule.status !== 'possible_loop' && hasEarlyCue) {
    return 'early_cue';
  }

  if (patternRule.status === 'possible_loop') {
    return 'possible_loop';
  }

  if (patternRule.status === 'possible_thread') {
    return 'possible_thread';
  }

  return 'still_learning';
}

function formatEvidenceChip(traceCount: number, actionNoteCount: number) {
  if (traceCount <= 0) {
    return 'Saved traces only';
  }

  if (actionNoteCount > 0) {
    return `${traceCount} ${traceCount === 1 ? 'trace' : 'traces'} · ${actionNoteCount} ${
      actionNoteCount === 1 ? 'action note' : 'action notes'
    }`;
  }

  return `Based on ${traceCount} saved ${traceCount === 1 ? 'trace' : 'traces'}.`;
}

export function buildWeeklyReflectionFacts({
  traceRecords,
  actionMemoryEntries,
  generatedAt = new Date().toISOString(),
}: {
  traceRecords: MoodTraceRecord[];
  actionMemoryEntries: ActionMemoryEntry[];
  generatedAt?: string;
}): WeeklyReflectionFacts {
  const referenceDate = new Date(generatedAt);
  const safeReferenceDate = Number.isNaN(referenceDate.getTime()) ? new Date() : referenceDate;
  const { weekStartKey, weekEndKey } = getLocalWeekWindow(safeReferenceDate);
  const weeklyTraceRecords = traceRecords.filter((record) => {
    if (!record.safetyAssessment.canShowPattern) {
      return false;
    }

    return isLocalDayInWindow(getTraceRecordLocalDate(record), weekStartKey, weekEndKey);
  });
  const weeklyActionMemory = actionMemoryEntries.filter((entry) =>
    isLocalDayInWindow(new Date(entry.completedAt), weekStartKey, weekEndKey),
  );
  const completedWeeklyActionMemory = weeklyActionMemory.filter(
    (entry) => entry.completionStatus === 'completed',
  );
  const loopSignatures = buildLoopSignaturesFromTraces(weeklyTraceRecords);
  const primaryLoop = loopSignatures[0] || null;
  const primaryThreadRecords = primaryLoop
    ? weeklyTraceRecords.filter((record) => getLoopIdentityKey(record) === primaryLoop.chainKey)
    : [];
  const distinctDayKeys = Array.from(
    new Set(primaryThreadRecords.map((record) => getLocalDayKey(getTraceRecordLocalDate(record)))),
  );
  const primaryBodyKey = primaryLoop?.primaryBodyKey || primaryThreadRecords[0]?.normalizedFields.bodySignalCanonical || null;
  const bodyEvidenceTraceIds = primaryBodyKey
    ? primaryThreadRecords
        .filter((record) => getBodySignalKeysFromTraceRecord(record).includes(primaryBodyKey))
        .map((record) => record.id)
    : [];
  const actionLearning = getWeeklyActionLearning(weeklyActionMemory);
  const patternRule = getLoopPatternRuleState(primaryLoop, weeklyTraceRecords);
  const insightMode = getWeeklyInsightMode({
    patternRule,
    actionLearningStatus: actionLearning.status,
    actionLearningCount: actionLearning.count,
    hasEarlyCue: Boolean(primaryBodyKey && bodyEvidenceTraceIds.length > 0),
  });

  return {
    schemaVersion: 'weekly_reflection_facts_v1',
    weekStart: weekStartKey,
    weekEnd: weekEndKey,
    sourceTraceIds: weeklyTraceRecords.map((record) => record.id),
    sourceActionMemoryIds: weeklyActionMemory.map((entry) => entry.id),
    traceCount: primaryLoop?.occurrenceCount || weeklyTraceRecords.length,
    completedActionCount: completedWeeklyActionMemory.length,
    actionNoteCount: weeklyActionMemory.length,
    patternRule,
    insightMode,
    primaryThread: primaryLoop
      ? {
          loopSignatureId: primaryLoop.id,
          label: primaryLoop.label,
          contextLabel: primaryLoop.primaryTriggerKey ? getPlainTraceLabel(primaryLoop.primaryTriggerKey) : null,
          thoughtLabel: primaryLoop.primaryThoughtKey ? getPlainTraceLabel(primaryLoop.primaryThoughtKey) : null,
          bodySignalLabel: primaryBodyKey ? getPlainTraceLabel(primaryBodyKey) : null,
          traceCount: primaryLoop.occurrenceCount,
          distinctDayCount: distinctDayKeys.length,
          evidenceTraceIds: primaryThreadRecords.map((record) => record.id),
          confidenceLabel: getPrimaryThreadConfidence(primaryLoop.occurrenceCount, distinctDayKeys.length),
        }
      : null,
    actionLearning,
    earlyCue: {
      bodySignalLabel: primaryBodyKey ? getPlainTraceLabel(primaryBodyKey) : null,
      evidenceTraceIds: bodyEvidenceTraceIds,
    },
    recommendedNextStep: {
      mode: actionLearning.bestActionId ? 'loop_action' : 'none',
      actionId: actionLearning.bestActionId,
      actionTitle: actionLearning.bestActionTitle,
      recommendedActionSource: actionLearning.recommendedActionSource,
      actionFamily: actionLearning.bestActionFamily,
      primaryNeed: actionLearning.bestPrimaryNeed,
      weeklyReflectionRole: actionLearning.weeklyReflectionRole,
      rewardStamp: actionLearning.rewardStamp,
      reason: actionLearning.bestActionTitle ? 'Based on an action note from this week.' : null,
    },
    safetyBoundary: {
      canShowReflection: weeklyTraceRecords.length > 0,
      canRecommendAction: weeklyTraceRecords.every((record) => record.safetyAssessment.canRecommendAction),
    },
  };
}

function buildWeeklySummarySentence(facts: WeeklyReflectionFacts) {
  const thread = facts.primaryThread;

  if (!thread) {
    return 'Save a few more traces, and Rora will start connecting what repeats, shifts, and helps.';
  }

  const contextText = thread.contextLabel || 'This thread';
  const thoughtText = thread.thoughtLabel?.toLowerCase();
  const bodyText = thread.bodySignalLabel?.toLowerCase();
  const details = [thoughtText, bodyText].filter((item): item is string => Boolean(item));
  const detailPhrase =
    details.length === 2
      ? `${details[0]} and ${details[1]}`
      : details[0] || 'a repeating thread';

  return `${contextText} showed up with ${detailPhrase} in a few saved traces. Rora is still learning what helps this thread feel lighter.`;
}

function buildWeeklyActionSummary(facts: WeeklyReflectionFacts) {
  const thread = facts.primaryThread;
  const actionTitle = facts.actionLearning.bestActionTitle || 'One small action';
  const threadText = thread?.contextLabel ? `${thread.contextLabel} still appeared in your saved traces` : 'This thread still appeared in your saved traces';
  const actionInsightCopy = getWeeklyActionInsightCopy({
    role: facts.actionLearning.weeklyReflectionRole,
    rewardStamp: facts.actionLearning.rewardStamp,
    actionTitle,
    threadText,
    bodyCue: facts.earlyCue.bodySignalLabel?.toLowerCase() || null,
    outcomeLabel: facts.actionLearning.outcomeLabel,
    status: facts.actionLearning.status,
  });

  return actionInsightCopy.summary;
}

function getWeeklyCardModeForInsight(insightMode: WeeklyInsightMode): WeeklyReflectionCardMode {
  if (insightMode === 'still_learning') {
    return 'learning';
  }

  if (insightMode === 'micro_win' || insightMode === 'lighter_loop' || insightMode === 'lighter_step') {
    return 'action_learning';
  }

  return 'thread_summary';
}

function buildWeeklyEarlyCueSummary(facts: WeeklyReflectionFacts) {
  const bodyCue = facts.earlyCue.bodySignalLabel?.toLowerCase() || 'a body signal';
  const context = facts.primaryThread?.contextLabel || 'This thread';

  return `${context} showed up in your saved traces, and ${bodyCue} is the first cue Rora can watch with you.`;
}

function buildWeeklyPossibleLoopSummary(facts: WeeklyReflectionFacts) {
  const thread = facts.primaryThread;
  const context = thread?.contextLabel || 'This thread';
  const bodyCue = facts.earlyCue.bodySignalLabel?.toLowerCase();
  const cuePhrase = bodyCue ? `, with ${bodyCue} as an early cue` : '';

  return `${context} is visible enough to name as a possible loop${cuePhrase}. Rora is still learning what helps.`;
}

function buildWeeklyLighterLoopSummary(facts: WeeklyReflectionFacts) {
  const actionTitle = facts.actionLearning.bestActionTitle || 'one small action';
  const threadText = facts.primaryThread?.contextLabel
    ? `${facts.primaryThread.contextLabel} still appeared in your saved traces`
    : 'This loop still appeared in your saved traces';
  const actionInsightCopy = getWeeklyActionInsightCopy({
    role: facts.actionLearning.weeklyReflectionRole,
    rewardStamp: facts.actionLearning.rewardStamp,
    actionTitle,
    threadText,
    bodyCue: facts.earlyCue.bodySignalLabel?.toLowerCase() || null,
    outcomeLabel: facts.actionLearning.outcomeLabel,
    status: facts.actionLearning.status,
  });

  return actionInsightCopy.summary;
}

function buildWeeklyInsightHeadline(facts: WeeklyReflectionFacts) {
  const actionTitle = facts.actionLearning.bestActionTitle || 'One small action';
  const threadText = facts.primaryThread?.contextLabel
    ? `${facts.primaryThread.contextLabel} still appeared in your saved traces`
    : 'This thread still appeared in your saved traces';
  const actionInsightCopy = getWeeklyActionInsightCopy({
    role: facts.actionLearning.weeklyReflectionRole,
    rewardStamp: facts.actionLearning.rewardStamp,
    actionTitle,
    threadText,
    bodyCue: facts.earlyCue.bodySignalLabel?.toLowerCase() || null,
    outcomeLabel: facts.actionLearning.outcomeLabel,
    status: facts.actionLearning.status,
  });

  switch (facts.insightMode) {
    case 'early_cue':
      return 'You caught the signal early.';
    case 'possible_thread':
      return 'This thread is starting to repeat.';
    case 'possible_loop':
      return 'Rora is still learning what helps.';
    case 'micro_win':
    case 'lighter_loop':
    case 'lighter_step':
      return actionInsightCopy.headline;
    case 'still_learning':
    default:
      return facts.traceCount > 0 ? 'Rora is still learning this pattern.' : 'Rora is still gathering the week.';
  }
}

function buildWeeklyInsightSummary(facts: WeeklyReflectionFacts) {
  switch (facts.insightMode) {
    case 'early_cue':
      return buildWeeklyEarlyCueSummary(facts);
    case 'possible_loop':
      return buildWeeklyPossibleLoopSummary(facts);
    case 'micro_win':
    case 'lighter_step':
      return buildWeeklyActionSummary(facts);
    case 'lighter_loop':
      return buildWeeklyLighterLoopSummary(facts);
    case 'possible_thread':
      return buildWeeklySummarySentence(facts);
    case 'still_learning':
    default:
      return 'Save a few more traces, and Rora will start connecting what repeats, shifts, and helps.';
  }
}

function buildLocalWeeklySummaryCard(facts: WeeklyReflectionFacts): WeeklySummaryCard {
  const cardMode = getWeeklyCardModeForInsight(facts.insightMode);
  const headline = buildWeeklyInsightHeadline(facts);
  const summary = buildWeeklyInsightSummary(facts);
  const bodyCue = facts.earlyCue.bodySignalLabel?.toLowerCase();
  const actionTitle = facts.actionLearning.bestActionTitle || 'One small action';
  const threadText = facts.primaryThread?.contextLabel
    ? `${facts.primaryThread.contextLabel} still appeared in your saved traces`
    : 'This thread still appeared in your saved traces';
  const actionInsightCopy = getWeeklyActionInsightCopy({
    role: facts.actionLearning.weeklyReflectionRole,
    rewardStamp: facts.actionLearning.rewardStamp,
    actionTitle,
    threadText,
    bodyCue: bodyCue || null,
    outcomeLabel: facts.actionLearning.outcomeLabel,
    status: facts.actionLearning.status,
  });
  const bottomRow =
    facts.insightMode === 'still_learning'
      ? {
          label: 'For now',
          title: 'Keep it light',
          detail: 'One short trace is enough.',
          actionId: null,
        }
      : facts.actionLearning.status === 'helped' || facts.actionLearning.status === 'helped_a_little'
        ? {
            label: actionInsightCopy.bottomRowLabel,
            title: facts.actionLearning.bestActionTitle || 'One small action',
            detail: actionInsightCopy.bottomRowDetail,
            actionId: facts.actionLearning.bestActionId,
          }
        : facts.actionLearning.status === 'too_much'
          ? {
              label: actionInsightCopy.bottomRowLabel,
              title: 'Keep next steps smaller',
              detail: actionInsightCopy.bottomRowDetail,
              actionId: facts.actionLearning.bestActionId,
            }
          : facts.actionLearning.status === 'not_today' || facts.actionLearning.status === 'mixed'
            ? {
                label: actionInsightCopy.bottomRowLabel,
                title: 'Keep the bar low',
                detail: actionInsightCopy.bottomRowDetail,
                actionId: facts.actionLearning.bestActionId,
              }
            : {
                label: 'Next week’s focus',
                title: facts.insightMode === 'early_cue' ? 'Notice the first cue' : 'Name the Loop',
                detail: bodyCue ? `Use it when ${bodyCue} first shows up.` : 'Use it when this thread shows up.',
                actionId: facts.recommendedNextStep.actionId,
              };

  return {
    cardMode,
    eyebrow: "Rora's note",
    meta: 'This week',
    headline,
    summary,
    evidenceChip: formatEvidenceChip(facts.traceCount, facts.actionNoteCount),
    bottomRow,
    boundaryLine: 'Based only on traces you saved.',
  };
}

export function buildWeeklyReflectionPreview({
  traceRecords,
  actionMemoryEntries,
  helpfulnessMemories,
  generatedAt = new Date().toISOString(),
}: {
  traceRecords: MoodTraceRecord[];
  actionMemoryEntries: ActionMemoryEntry[];
  helpfulnessMemories: HelpfulnessMemory[];
  generatedAt?: string;
}): WeeklyReflectionPreview {
  const weeklyFacts = buildWeeklyReflectionFacts({ traceRecords, actionMemoryEntries, generatedAt });
  const summaryCard = buildLocalWeeklySummaryCard(weeklyFacts);
  const patternableTraceRecords = traceRecords.filter(
    (record) => weeklyFacts.sourceTraceIds.includes(record.id) && record.safetyAssessment.canShowPattern,
  );
  const loopSignatures = buildLoopSignaturesFromTraces(patternableTraceRecords);
  const primaryLoop = loopSignatures[0] || null;
  const traceCount = weeklyFacts.traceCount;
  const completedActionCount = weeklyFacts.completedActionCount;
  const lighterMomentCount = actionMemoryEntries.filter(
    (entry) =>
      weeklyFacts.sourceActionMemoryIds.includes(entry.id) &&
      (entry.helpfulness === 'helped' || entry.helpfulness === 'helped_a_little'),
  ).length;
  const bestMemory = getBestHelpfulnessMemory(helpfulnessMemories);
  const primaryLoopLabel = primaryLoop?.label || 'No saved loop yet';
  const primaryLoopSummaryLead = buildWeeklyPreviewLead(primaryLoop);
  const repeatedDetail =
    traceCount > 0 ? `${traceCount} ${traceCount === 1 ? 'trace' : 'traces'}` : 'Save a trace to begin';
  const shiftedValue =
    completedActionCount > 0
      ? `${completedActionCount} ${completedActionCount === 1 ? 'action' : 'actions'} completed`
      : 'Rora is still watching for a shift';
  const shiftedDetail =
    lighterMomentCount > 0
      ? `${lighterMomentCount} lighter ${lighterMomentCount === 1 ? 'moment' : 'moments'}`
      : 'Try one small action so Rora can learn what helps.';
  const helpedValue = bestMemory?.actionTitle || 'Still learning what helps';
  const helpedDetail = bestMemory
    ? `${bestMemory.bestOutcomeLabel.toLowerCase()} · ${bestMemory.completions} ${
        bestMemory.completions === 1 ? 'time' : 'times'
      }`
    : 'Rora has not learned a reliable helper for this thread yet.';
  const earlyCueLabel = primaryLoop?.primaryBodyKey
    ? getPlainTraceLabel(primaryLoop.primaryBodyKey).toLowerCase()
    : 'your body signal';
  const weeklyNoteText =
    traceCount > 0
      ? summaryCard.summary
      : 'Save a few traces and Rora will start connecting what repeats.';
  const nextStepValue = bestMemory?.actionTitle || 'Try one small action';
  const nextStepDetail = primaryLoop
    ? `Use it when ${earlyCueLabel} first shows up.`
    : 'Rora will personalize this as more traces build up.';

  return {
    schemaVersion: MOOD_DATA_SCHEMA_VERSION,
    generatedAt,
    provider: 'local',
    weeklyFacts,
    summaryCard,
    freePreviewText:
      traceCount > 0
        ? `This week, ${primaryLoopSummaryLead} appeared ${traceCount} ${
            traceCount === 1 ? 'time' : 'times'
          }, and Rora is learning what helps.`
        : 'Save a few traces and Rora will start showing what repeats, shifts, and helps.',
    weeklyNote: {
      title: summaryCard.eyebrow,
      text: weeklyNoteText,
      evidenceLine: summaryCard.evidenceChip,
    },
    primaryLoopLabel,
    traceCount,
    completedActionCount,
    lighterMomentCount,
    whatRepeated: {
      value: primaryLoop ? primaryLoop.label : 'No repeated loop yet',
      detail: repeatedDetail,
    },
    whatShifted: {
      value: shiftedValue,
      detail: shiftedDetail,
    },
    whatHelped: {
      value: helpedValue,
      detail: helpedDetail,
    },
    gentleNextStep: {
      value: summaryCard.bottomRow.title || (bestMemory ? nextStepValue : 'Try one small action this week'),
      detail: summaryCard.bottomRow.detail || nextStepDetail,
    },
    paidPlan: {
      label: 'Deeper reflection',
      note: 'Unlock the full weekly pattern, early cues, and what helped.',
    },
  };
}

export function findHelpfulnessMemory({
  memories,
  chainKey,
  actionId,
}: {
  memories: HelpfulnessMemory[];
  chainKey: string;
  actionId: string;
}) {
  return memories.find((memory) => memory.chainKey === chainKey && memory.actionId === actionId) || null;
}

export function getActionRecommendationReason({
  traceRecord,
  memory,
  fallbackReason,
}: {
  traceRecord: MoodTraceRecord | null;
  memory: HelpfulnessMemory | null;
  fallbackReason: string;
}) {
  if (traceRecord && !traceRecord.safetyAssessment.canRecommendAction) {
    return 'Saved for reflection first. This trace needs support before a regular action.';
  }

  if (memory) {
    return memory.recommendationReason;
  }

  if (traceRecord) {
    const readableSignals = traceRecord.loopSignature.signalKeys
      .slice(0, 3)
      .map(getPlainTraceLabel)
      .join(', ')
      .toLowerCase();

    return `Suggested because today’s trace includes ${readableSignals}.`;
  }

  return fallbackReason;
}
