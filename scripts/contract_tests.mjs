#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

require.extensions['.png'] = (module, filename) => {
  module.exports = { uri: filename, width: 1, height: 1 };
};

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  module._compile(output.outputText, filename);
};

const {
  buildBodySignalDaysFromTraces,
  buildBodySignalSummary,
  buildFinalTraceResultFromReview,
  buildHelpfulnessMemory,
  buildLoopSignaturesFromTraces,
  buildMoodTraceRecord,
  buildNormalizedTraceFields,
  buildWeeklyReflectionPreview,
  createActionMemoryEntry,
  getConfirmedBodySignalLabels,
  getLoopIdentityKey,
  getLoopPatternRuleState,
  getWeeklyInsightMode,
  hydrateActionMemoryEntry,
} = require('../src/trace/dataFoundation.ts');

const {
  actionDefinitions,
  actionDefinitionById,
  fallbackActionId,
  getActionDefinition,
} = require('../src/actions/actionLibrary.ts');
const {
  getActionRewardCompletionCopy,
  getWeeklyActionInsightCopy,
  rewardStampCopy,
  weeklyRoleCopy,
} = require('../src/actions/actionRewardCopy.ts');
const {
  getRuleBasedRecommendedAction,
} = require('../src/actions/actionRecommendation.ts');

const allowedActionFamilies = new Set([
  'physiological',
  'cognitive',
  'labeling',
  'behavioral',
  'reflection',
  'self_compassion',
]);
const allowedActionNeeds = new Set([
  'downshift_body',
  'separate_thoughts',
  'name_loop',
  'tiny_next_step',
  'unload',
  'reframe',
]);
const allowedBurdenLevels = new Set(['very_low', 'low', 'medium']);
const allowedRewardStamps = new Set(['noticed', 'named_it', 'softened', 'sorted', 'parked', 'kind_shift']);
const allowedWeeklyRoles = new Set([
  'early_cue_practice',
  'thought_sorting',
  'loop_labeling',
  'behavioral_nudge',
  'evening_release',
  'self_compassion',
]);
const allowedStageFits = new Set([
  'daily_action',
  'possible_thread',
  'possible_loop',
  'familiar_loop',
  'micro_win_followup',
  'lighter_step_after_too_much',
]);
const allowedSafetyLevels = new Set(['low', 'medium', 'high', 'urgent_medical']);

assert.equal(actionDefinitions.length, 6, 'action library should expose the six canonical MVP actions');
assert.equal(getActionDefinition(fallbackActionId).id, fallbackActionId, 'fallback action should resolve');
assert.equal(
  new Set(actionDefinitions.map((action) => action.id)).size,
  actionDefinitions.length,
  'action ids should be unique',
);

actionDefinitions.forEach((action) => {
  assert.equal(action.schemaVersion, 'action_definition_v1', `${action.id} should use action_definition_v1`);
  assert.equal(actionDefinitionById[action.id], action, `${action.id} should be addressable by id`);
  assert.ok(action.title, `${action.id} should have a title`);
  assert.ok(action.shortTitle, `${action.id} should have a short title`);
  assert.ok(action.estimatedMinutes > 0, `${action.id} should have an estimated duration`);
  assert.ok(allowedActionFamilies.has(action.family), `${action.id} should have a valid family`);
  assert.ok(allowedActionNeeds.has(action.primaryNeed), `${action.id} should have a valid primary need`);
  assert.ok(allowedBurdenLevels.has(action.burdenLevel), `${action.id} should have a valid burden level`);
  assert.ok(action.reasonTemplate, `${action.id} should have a recommendation reason template`);
  assert.ok(action.assets.imageKey, `${action.id} should have a stable image key`);
  assert.ok(action.fits.stages.length > 0, `${action.id} should declare stage fit`);
  action.fits.stages.forEach((stage) => {
    assert.ok(allowedStageFits.has(stage), `${action.id} has an unknown stage fit: ${stage}`);
  });
  action.avoidWhen.safetyLevels.forEach((safetyLevel) => {
    assert.ok(allowedSafetyLevels.has(safetyLevel), `${action.id} has an unknown safety level: ${safetyLevel}`);
  });
  assert.ok(Array.isArray(action.avoidWhen.recentHelpfulness), `${action.id} should define helpfulness avoidance`);
  assert.ok(action.steps.length > 0, `${action.id} should have steps`);
  action.steps.forEach((step) => {
    assert.ok(step.key, `${action.id} step should have a key`);
    assert.ok(step.title, `${action.id} step ${step.key} should have a title`);
    assert.ok(step.prompt, `${action.id} step ${step.key} should have a prompt`);
    assert.ok(step.detailPrompt, `${action.id} step ${step.key} should have a detail prompt`);
    assert.ok(step.placeholder, `${action.id} step ${step.key} should have a placeholder`);
    assert.ok(['short_text', 'long_text', 'single_choice', 'none'].includes(step.inputKind));
    assert.equal(typeof step.optional, 'boolean', `${action.id} step ${step.key} should declare optional`);
    assert.ok(step.imageKey || step.icon, `${action.id} step ${step.key} should have an image key or icon`);
  });
  assert.ok(allowedRewardStamps.has(action.completion.rewardStamp), `${action.id} should have a reward stamp`);
  if (action.completion.tooMuchFallbackActionId) {
    assert.ok(
      actionDefinitionById[action.completion.tooMuchFallbackActionId],
      `${action.id} too-much fallback should resolve`,
    );
  } else {
    assert.equal(action.burdenLevel, 'very_low', `${action.id} can omit fallback only when already very low burden`);
  }
  assert.equal(action.memory.storeAnswers, true, `${action.id} should persist answers for learning`);
  assert.ok(allowedWeeklyRoles.has(action.memory.weeklyReflectionRole), `${action.id} should have a weekly role`);
  assert.ok(action.memory.positiveOutcomeWeight > 0, `${action.id} should have a positive outcome weight`);

  const rewardCopy = rewardStampCopy[action.completion.rewardStamp];
  assert.ok(rewardCopy, `${action.id} should have reward-stamp copy`);
  ['helped', 'helped_a_little', 'did_not_help', 'too_much'].forEach((helpfulness) => {
    const completionCopy = getActionRewardCompletionCopy({
      rewardStamp: action.completion.rewardStamp,
      helpfulness,
    });
    assert.ok(completionCopy.badge, `${action.id} ${helpfulness} should have a reward badge`);
    assert.ok(completionCopy.headline, `${action.id} ${helpfulness} should have a reward headline`);
    assert.ok(completionCopy.body, `${action.id} ${helpfulness} should have a reward body`);
    assert.ok(completionCopy.memoryLine, `${action.id} ${helpfulness} should have a reward memory line`);
    assert.equal(
      /great job|crushed it|score|streak|diagnos|treat|heal/i.test(
        `${completionCopy.headline} ${completionCopy.body} ${completionCopy.memoryLine}`,
      ),
      false,
      `${action.id} ${helpfulness} reward copy should avoid generic praise, gamification, and clinical claims`,
    );
  });

  const weeklyCopy = weeklyRoleCopy[action.memory.weeklyReflectionRole];
  assert.ok(weeklyCopy, `${action.id} should have weekly-role copy`);
  const weeklyInsightCopy = getWeeklyActionInsightCopy({
    role: action.memory.weeklyReflectionRole,
    rewardStamp: action.completion.rewardStamp,
    actionTitle: action.title,
    threadText: 'Work feedback still appeared in your saved traces',
    bodyCue: 'head pressure',
    outcomeLabel: 'Helped a little',
    status: 'helped_a_little',
  });
  assert.ok(weeklyInsightCopy.headline, `${action.id} should have a weekly headline`);
  assert.ok(weeklyInsightCopy.summary, `${action.id} should have a weekly summary`);
  assert.ok(weeklyInsightCopy.bottomRowLabel, `${action.id} should have a weekly bottom-row label`);
  assert.ok(weeklyInsightCopy.bottomRowDetail, `${action.id} should have a weekly bottom-row detail`);
  assert.equal(
    /completed \d|source action|schema|great job|diagnos|treat|heal/i.test(
      `${weeklyInsightCopy.headline} ${weeklyInsightCopy.summary} ${weeklyInsightCopy.bottomRowDetail}`,
    ),
    false,
    `${action.id} weekly copy should avoid system-log, generic praise, and clinical claims`,
  );
});

const dataFoundationSource = readFileSync(require.resolve('../src/trace/dataFoundation.ts'), 'utf8');
assert.match(
  dataFoundationSource,
  /ActionHelpfulnessSignal = 'helped' \| 'helped_a_little' \| 'did_not_help' \| 'too_much'/,
  'runtime helpfulness contract should use too_much instead of legacy unsure',
);

const lowServerSafety = {
  level: 'low',
  flags: [],
  support: 'none',
  canShowPattern: true,
  canRecommendAction: true,
  allowSave: true,
};

const highServerSafety = {
  level: 'high',
  flags: [
    {
      key: 'self_harm_language',
      label: 'Crisis language',
      evidence: 'Server-side moderation flagged this trace.',
    },
  ],
  support: 'resources_panel',
  canShowPattern: false,
  canRecommendAction: false,
  allowSave: true,
};

const originalTranscript =
  'Something at work stayed with me today. I felt calm, but my chest felt tight and I kept replaying it.';
const originalDraftTrace = {
  chain: ['work_feedback', 'overthinking', 'chest_tightness'],
  bodySignals: [{ key: 'chest_tightness', value: 'Chest tightness' }],
  extraction: [
    { label: 'Context', value: 'Work feedback' },
    { label: 'Thought', value: 'Replaying thought' },
    { label: 'Body signal', value: 'Chest tightness' },
  ],
};

let savedTraces = [
  buildMoodTraceRecord({
    transcript: originalTranscript,
    selectedMood: 'Calm',
    selectedBodySignalLabels: ['Chest tightness'],
    traceResult: originalDraftTrace,
    source: 'voice_transcript',
    createdAt: '2026-06-19T09:00:00.000Z',
    savedAt: '2026-06-19T09:00:00.000Z',
    safetyAssessment: lowServerSafety,
  }),
];

assert.equal(savedTraces.length, 1, 'initial save should create one trace');
assert.equal(savedTraces[0].safetyAssessment, lowServerSafety, 'trace should preserve server safety object');
assert.equal(savedTraces[0].normalizedFields.loopCandidateKey, 'work_feedback|chest_tightness|replaying_thought');

const editedTranscript =
  'Something from work stayed with me. I feel calm, but my head has pressure and I kept wondering if I did something wrong.';
const editedTraceResult = buildFinalTraceResultFromReview({
  draftTraceResult: originalDraftTrace,
  selectedBodySignalLabels: ['Chest tightness'],
  draftReviewExtraction: [
    { label: 'Feeling', value: 'Calm' },
    { label: 'Context', value: 'Work feedback' },
    { label: 'Body signal', value: 'Head pressure' },
    { label: 'Thought', value: 'I kept wondering if I did something wrong.' },
  ],
});
const editedBodyLabels = getConfirmedBodySignalLabels(editedTraceResult);
const editedNormalizedFields = buildNormalizedTraceFields({
  traceResult: editedTraceResult,
  transcript: editedTranscript,
  selectedMood: 'Calm',
});
const editingTraceId = savedTraces[0].id;
const editedTraceRecord = buildMoodTraceRecord({
  transcript: editedTranscript,
  selectedMood: 'Calm',
  selectedBodySignalLabels: editedBodyLabels,
  traceResult: editedTraceResult,
  source: 'voice_transcript',
  createdAt: savedTraces[0].createdAt,
  savedAt: '2026-06-19T09:05:00.000Z',
  safetyAssessment: savedTraces[0].safetyAssessment,
  occurrenceCount:
    savedTraces.filter(
      (record) =>
        record.id !== editingTraceId &&
        record.safetyAssessment.canShowPattern &&
        getLoopIdentityKey(record) === editedNormalizedFields.loopCandidateKey,
    ).length + 1,
});

savedTraces = savedTraces.map((record) => (record.id === editingTraceId ? editedTraceRecord : record));

assert.equal(savedTraces.length, 1, 'editing a trace should update the original instead of adding another');
assert.equal(savedTraces[0].id, editingTraceId, 'edited trace should keep the original id');
assert.deepEqual(editedBodyLabels, ['Head pressure'], 'edited body signal should replace selected chest signal');
assert.equal(savedTraces[0].normalizedFields.loopCandidateKey, 'work_feedback|head_pressure|self_blame');
assert.equal(savedTraces[0].loopSignature.chainKey, savedTraces[0].normalizedFields.loopCandidateKey);
assert.equal(savedTraces[0].bodySignals[0].key, 'head_pressure');

const similarTraceA = buildMoodTraceRecord({
  transcript: 'After work feedback, my head felt pressured and I wondered if I did something wrong.',
  selectedMood: 'Down',
  selectedBodySignalLabels: ['Head pressure'],
  traceResult: {
    chain: ['head_pressure', 'work_feedback', 'self_blame'],
    bodySignals: [{ key: 'head_pressure', value: 'Head pressure' }],
    extraction: [
      { label: 'Body signal', value: 'Head pressure' },
      { label: 'Context', value: 'Work feedback' },
      { label: 'Thought', value: 'Self-blame' },
    ],
  },
  createdAt: '2026-06-18T09:00:00.000Z',
  savedAt: '2026-06-18T09:00:00.000Z',
  safetyAssessment: lowServerSafety,
});
const similarTraceB = buildMoodTraceRecord({
  transcript: 'A work message stayed with me. My head felt pressure and I thought it was my fault.',
  selectedMood: 'Sad',
  selectedBodySignalLabels: ['Head pressure'],
  traceResult: {
    chain: ['self_blame', 'head_pressure', 'work_feedback'],
    bodySignals: [{ key: 'head_pressure', value: 'Head pressure' }],
    extraction: [
      { label: 'Thought', value: 'My fault' },
      { label: 'Body signal', value: 'Head pressure' },
      { label: 'Context', value: 'Work message' },
    ],
  },
  createdAt: '2026-06-17T09:00:00.000Z',
  savedAt: '2026-06-17T09:00:00.000Z',
  safetyAssessment: lowServerSafety,
});
const highSafetyTrace = buildMoodTraceRecord({
  transcript: 'My chest felt crushing and unsafe.',
  selectedMood: 'Irritable',
  selectedBodySignalLabels: ['Chest tightness'],
  traceResult: originalDraftTrace,
  createdAt: '2026-06-19T11:00:00.000Z',
  savedAt: '2026-06-19T11:00:00.000Z',
  safetyAssessment: highServerSafety,
});

savedTraces = [savedTraces[0], similarTraceA, similarTraceB, highSafetyTrace];

const loopSignatures = buildLoopSignaturesFromTraces(savedTraces);
assert.equal(loopSignatures[0].chainKey, 'work_feedback|head_pressure|self_blame');
assert.equal(loopSignatures[0].occurrenceCount, 3);
assert.equal(loopSignatures[0].stage, 'repeating_loop');
assert.equal(
  loopSignatures.some((signature) => signature.chainKey === 'work_feedback|chest_tightness|replaying_thought'),
  false,
  'high safety trace should not enter pattern aggregation',
);

const learningPatternState = getLoopPatternRuleState(loopSignatures[0], savedTraces.slice(0, 2));
assert.equal(learningPatternState.status, 'learning');
assert.equal(learningPatternState.canShowLoop, false);
assert.equal(learningPatternState.canShowLoopAction, false);

const possibleThreadPatternState = getLoopPatternRuleState(loopSignatures[0], savedTraces);
assert.equal(possibleThreadPatternState.status, 'possible_thread');
assert.equal(possibleThreadPatternState.canShowLoop, true);
assert.equal(possibleThreadPatternState.canShowLoopAction, false);
assert.equal(possibleThreadPatternState.traceCount, 3);
assert.equal(possibleThreadPatternState.dayCount, 3);
assert.equal(
  getWeeklyInsightMode({
    patternRule: learningPatternState,
    actionLearningStatus: 'no_action_tried',
    actionLearningCount: 0,
    hasEarlyCue: false,
  }),
  'still_learning',
);
assert.equal(
  getWeeklyInsightMode({
    patternRule: learningPatternState,
    actionLearningStatus: 'no_action_tried',
    actionLearningCount: 0,
    hasEarlyCue: true,
  }),
  'early_cue',
);
assert.equal(
  getWeeklyInsightMode({
    patternRule: possibleThreadPatternState,
    actionLearningStatus: 'no_action_tried',
    actionLearningCount: 0,
    hasEarlyCue: false,
  }),
  'possible_thread',
);
assert.equal(
  getWeeklyInsightMode({
    patternRule: possibleThreadPatternState,
    actionLearningStatus: 'helped_a_little',
    actionLearningCount: 1,
    hasEarlyCue: true,
  }),
  'micro_win',
);

const similarTraceC = buildMoodTraceRecord({
  transcript: 'A work reply stayed with me, with head pressure and a thought that I had done something wrong.',
  selectedMood: 'Calm',
  selectedBodySignalLabels: ['Head pressure'],
  traceResult: {
    chain: ['work_feedback', 'head_pressure', 'self_blame'],
    bodySignals: [{ key: 'head_pressure', value: 'Head pressure' }],
    extraction: [
      { label: 'Context', value: 'Work feedback' },
      { label: 'Body signal', value: 'Head pressure' },
      { label: 'Thought', value: 'Self-blame' },
    ],
  },
  createdAt: '2026-06-16T09:00:00.000Z',
  savedAt: '2026-06-16T09:00:00.000Z',
  safetyAssessment: lowServerSafety,
});
const actionReadyPatternState = getLoopPatternRuleState(loopSignatures[0], [
  ...savedTraces,
  similarTraceC,
]);
assert.equal(actionReadyPatternState.status, 'possible_loop');
assert.equal(actionReadyPatternState.canShowLoop, true);
assert.equal(actionReadyPatternState.canShowLoopAction, true);
assert.equal(actionReadyPatternState.traceCount, 4);
assert.equal(
  getWeeklyInsightMode({
    patternRule: actionReadyPatternState,
    actionLearningStatus: 'no_action_tried',
    actionLearningCount: 0,
    hasEarlyCue: true,
  }),
  'possible_loop',
);
assert.equal(
  getWeeklyInsightMode({
    patternRule: actionReadyPatternState,
    actionLearningStatus: 'helped',
    actionLearningCount: 2,
    hasEarlyCue: true,
  }),
  'lighter_loop',
);
assert.equal(
  getWeeklyInsightMode({
    patternRule: actionReadyPatternState,
    actionLearningStatus: 'too_much',
    actionLearningCount: 1,
    hasEarlyCue: true,
  }),
  'lighter_step',
);

const actionMemoryEntry = createActionMemoryEntry({
  traceRecord: savedTraces[0],
  actionId: 'body-scan',
  actionTitle: '2-min Body Scan',
  recommendationMode: 'daily_action',
  recommendationSource: 'daily_body_signal',
  recommendationReason: 'Head pressure showed up today. Keep this focused on the body first.',
  evidenceLine: 'For today: head pressure showed up in this trace.',
  helpfulness: 'helped_a_little',
  answers: { notice: 'Head pressure softened a bit.' },
  completedAt: '2026-06-19T09:10:00.000Z',
});

assert.equal(actionMemoryEntry.chainKey, 'work_feedback|head_pressure|self_blame');
assert.equal(actionMemoryEntry.recommendationMode, 'daily_action');
assert.equal(actionMemoryEntry.recommendationSource, 'daily_body_signal');
assert.equal(actionMemoryEntry.recommendationReason, 'Head pressure showed up today. Keep this focused on the body first.');
assert.equal(actionMemoryEntry.evidenceLine, 'For today: head pressure showed up in this trace.');
assert.equal(actionMemoryEntry.family, 'physiological');
assert.equal(actionMemoryEntry.primaryNeed, 'downshift_body');
assert.equal(actionMemoryEntry.weeklyReflectionRole, 'early_cue_practice');
assert.equal(actionMemoryEntry.rewardStamp, 'softened');

const hydratedLegacyActionMemoryEntry = hydrateActionMemoryEntry({
  ...actionMemoryEntry,
  family: undefined,
  primaryNeed: undefined,
  weeklyReflectionRole: undefined,
  rewardStamp: undefined,
});
assert.equal(hydratedLegacyActionMemoryEntry.family, 'physiological');
assert.equal(hydratedLegacyActionMemoryEntry.primaryNeed, 'downshift_body');
assert.equal(hydratedLegacyActionMemoryEntry.weeklyReflectionRole, 'early_cue_practice');
assert.equal(hydratedLegacyActionMemoryEntry.rewardStamp, 'softened');

const helpfulnessMemory = buildHelpfulnessMemory([actionMemoryEntry]);
assert.equal(helpfulnessMemory.length, 1);
assert.equal(helpfulnessMemory[0].chainKey, 'work_feedback|head_pressure|self_blame');
assert.equal(helpfulnessMemory[0].outcomeCounts.helped_a_little, 1);

const dailyBodyRecommendation = getRuleBasedRecommendedAction({
  traceRecord: savedTraces[0],
  actionMemoryEntries: [],
  helpfulnessMemories: [],
  loopIsVisible: false,
});
assert.equal(dailyBodyRecommendation.actionId, 'body-scan');
assert.equal(dailyBodyRecommendation.source, 'daily_body_signal');
assert.equal(getActionDefinition(dailyBodyRecommendation.actionId).primaryNeed, 'downshift_body');
assert.ok(getActionDefinition(dailyBodyRecommendation.actionId).fits.stages.includes('daily_action'));

const aiRoutedCognitiveTrace = buildMoodTraceRecord({
  transcript: 'Work feedback kept replaying and I worried I had done something wrong.',
  selectedMood: 'Calm',
  selectedBodySignalLabels: [],
  traceResult: {
    chain: ['work_feedback', 'overthinking'],
    bodySignals: [],
    extraction: [
      { label: 'Context', value: 'Work feedback' },
      { label: 'Thought', value: 'Overthinking' },
    ],
  },
  createdAt: '2026-06-19T09:15:00.000Z',
  savedAt: '2026-06-19T09:15:00.000Z',
  safetyAssessment: lowServerSafety,
  actionRoutingFeatures: {
    primaryNeed: 'separate_thoughts',
    recommendedActionFamily: 'cognitive',
    burdenLevel: 'low',
    whyThis: 'AI saw replaying and worry.',
  },
});
assert.equal(aiRoutedCognitiveTrace.actionRoutingFeatures.primaryNeed, 'separate_thoughts');
const aiRoutedRecommendation = getRuleBasedRecommendedAction({
  traceRecord: aiRoutedCognitiveTrace,
  actionMemoryEntries: [],
  helpfulnessMemories: [],
  loopIsVisible: false,
});
assert.equal(aiRoutedRecommendation.actionId, 'fact-guess-worry-split');
assert.equal(aiRoutedRecommendation.source, 'ai_routing');
assert.equal(getActionDefinition(aiRoutedRecommendation.actionId).family, 'cognitive');

const loopReadyTraceRecord = {
  ...savedTraces[0],
  loopSignature: {
    ...savedTraces[0].loopSignature,
    occurrenceCount: 4,
  },
};
const rememberedRecommendation = getRuleBasedRecommendedAction({
  traceRecord: loopReadyTraceRecord,
  actionMemoryEntries: [actionMemoryEntry],
  helpfulnessMemories: helpfulnessMemory,
  loopIsVisible: true,
  loopEvidenceLine: 'Based on 4 saved traces.',
});
assert.equal(rememberedRecommendation.actionId, 'body-scan');
assert.equal(rememberedRecommendation.source, 'memory_helped');

const tooMuchActionMemoryEntry = createActionMemoryEntry({
  traceRecord: savedTraces[0],
  actionId: 'body-scan',
  actionTitle: '2-min Body Scan',
  recommendationMode: 'loop_action',
  recommendationSource: 'body_signal',
  recommendationReason: 'Head pressure may be the early cue.',
  evidenceLine: 'Based on 4 saved traces.',
  helpfulness: 'too_much',
  answers: { body_notice: 'It felt hard to stay with.' },
  completedAt: '2026-06-19T09:20:00.000Z',
});
const lighterRecommendation = getRuleBasedRecommendedAction({
  traceRecord: loopReadyTraceRecord,
  actionMemoryEntries: [tooMuchActionMemoryEntry, actionMemoryEntry],
  helpfulnessMemories: helpfulnessMemory,
  loopIsVisible: true,
  loopEvidenceLine: 'Based on 4 saved traces.',
});
assert.equal(lighterRecommendation.actionId, getActionDefinition('body-scan').completion.tooMuchFallbackActionId);
assert.equal(lighterRecommendation.actionId, 'name-loop');
assert.equal(lighterRecommendation.source, 'too_much_lighter');
assert.equal(getActionDefinition(lighterRecommendation.actionId).burdenLevel, 'very_low');

const weeklyPreviewWithoutAction = buildWeeklyReflectionPreview({
  traceRecords: savedTraces,
  actionMemoryEntries: [],
  helpfulnessMemories: [],
  generatedAt: '2026-06-19T12:00:00.000Z',
});
assert.equal(weeklyPreviewWithoutAction.weeklyFacts.traceCount, 3);
assert.equal(weeklyPreviewWithoutAction.weeklyFacts.patternRule.status, 'possible_thread');
assert.equal(weeklyPreviewWithoutAction.weeklyFacts.primaryThread.confidenceLabel, 'possible_thread');
assert.equal(weeklyPreviewWithoutAction.weeklyFacts.insightMode, 'early_cue');
assert.equal(weeklyPreviewWithoutAction.summaryCard.eyebrow, "Rora's note");
assert.equal(weeklyPreviewWithoutAction.summaryCard.cardMode, 'thread_summary');
assert.equal(weeklyPreviewWithoutAction.summaryCard.headline, 'You caught the signal early.');
assert.equal(weeklyPreviewWithoutAction.summaryCard.evidenceChip, 'Based on 3 saved traces.');
assert.equal(
  weeklyPreviewWithoutAction.summaryCard.evidenceChip.includes('0 completed actions'),
  false,
  'weekly reflection should not surface zero completed actions',
);

const weeklyPreviewWithAction = buildWeeklyReflectionPreview({
  traceRecords: savedTraces,
  actionMemoryEntries: [actionMemoryEntry],
  helpfulnessMemories: helpfulnessMemory,
  generatedAt: '2026-06-19T12:00:00.000Z',
});
assert.equal(weeklyPreviewWithAction.weeklyFacts.insightMode, 'micro_win');
assert.equal(weeklyPreviewWithAction.weeklyFacts.actionLearning.recommendedActionSource, 'daily_body_signal');
assert.equal(weeklyPreviewWithAction.weeklyFacts.actionLearning.bestActionFamily, 'physiological');
assert.equal(weeklyPreviewWithAction.weeklyFacts.actionLearning.bestPrimaryNeed, 'downshift_body');
assert.equal(weeklyPreviewWithAction.weeklyFacts.actionLearning.weeklyReflectionRole, 'early_cue_practice');
assert.equal(weeklyPreviewWithAction.weeklyFacts.actionLearning.rewardStamp, 'softened');
assert.equal(weeklyPreviewWithAction.weeklyFacts.recommendedNextStep.recommendedActionSource, 'daily_body_signal');
assert.equal(weeklyPreviewWithAction.weeklyFacts.recommendedNextStep.actionFamily, 'physiological');
assert.equal(weeklyPreviewWithAction.weeklyFacts.recommendedNextStep.primaryNeed, 'downshift_body');
assert.equal(weeklyPreviewWithAction.weeklyFacts.recommendedNextStep.weeklyReflectionRole, 'early_cue_practice');
assert.equal(weeklyPreviewWithAction.weeklyFacts.recommendedNextStep.rewardStamp, 'softened');
assert.equal(weeklyPreviewWithAction.summaryCard.cardMode, 'action_learning');
assert.equal(weeklyPreviewWithAction.summaryCard.headline, 'You caught the signal earlier.');
assert.equal(
  weeklyPreviewWithAction.summaryCard.summary,
  'Work feedback still appeared in your saved traces, but 2-min Body Scan gave Rora a small clue: head pressure may be where this loop first shows up.',
);
assert.equal(weeklyPreviewWithAction.summaryCard.bottomRow.label, 'Worth remembering');
assert.equal(weeklyPreviewWithAction.summaryCard.bottomRow.title, '2-min Body Scan');
assert.equal(
  weeklyPreviewWithAction.summaryCard.bottomRow.detail,
  'Rora can keep this close for the next time head pressure appears.',
);
assert.equal(weeklyPreviewWithAction.summaryCard.evidenceChip, '3 traces · 1 action note');

const bodySignalDays = buildBodySignalDaysFromTraces(savedTraces, new Date('2026-06-19T12:00:00.000Z'));
const bodySignalSummary = buildBodySignalSummary(bodySignalDays);
const topSignal = bodySignalSummary[0];

assert.equal(topSignal.key, 'head_pressure');
assert.equal(topSignal.count, '3 traces');
assert.equal(
  bodySignalSummary.some((item) => item.key === 'chest_tightness'),
  false,
  'body signal summary should ignore non-patternable high safety traces',
);

console.log('OK: trace/action memory data contract is stable.');
console.log(`Normalized loop key: ${loopSignatures[0].chainKey}`);
console.log(`Action memory mode: ${actionMemoryEntry.recommendationMode}`);
console.log(`Body signal summary: ${topSignal.label} · ${topSignal.count}`);
