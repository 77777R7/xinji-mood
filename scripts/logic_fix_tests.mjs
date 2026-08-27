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
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  module._compile(output.outputText, filename);
};

const {
  assessMoodSafety,
  buildPatternFeedbackState,
  createPatternFeedbackEntry,
  buildActionEffectFollowUp,
  buildHelpfulnessMemory,
  getHelpfulnessMemoryScore,
  isDeprioritizedHelpfulnessMemory,
  getLoopPatternRuleState,
  LOOP_PATTERN_WINDOW_DAYS,
} = require('../src/trace/dataFoundation.ts');

const { getBestPositiveHelpfulnessMemoryForLoop } = require('../src/actions/actionRecommendation.ts');

const noBody = { transcript: '', selectedBodySignalLabels: [], bodySignals: [] };

// --- Chinese crisis language ---
for (const phrase of ['我不想活了', '真的活不下去了', '想自杀', '想结束自己的生命', '撑不下去了']) {
  const result = assessMoodSafety({ ...noBody, transcript: phrase });
  assert.equal(result.level, 'high', `"${phrase}" should grade high`);
  assert.equal(result.canRecommendAction, false, `"${phrase}" must not get an action`);
  assert.equal(result.canShowPattern, false, `"${phrase}" must not show a pattern`);
}

// English still works.
assert.equal(assessMoodSafety({ ...noBody, transcript: 'I want to die' }).level, 'high');

// Colloquial degree complements are not crisis language.
for (const phrase of ['累得想死', '今天忙得想死', '疼的想死']) {
  const result = assessMoodSafety({ ...noBody, transcript: phrase });
  assert.notEqual(result.level, 'high', `"${phrase}" is hyperbole, not a crisis`);
}

// But a real crisis phrase in the same sentence still trips it.
assert.equal(assessMoodSafety({ ...noBody, transcript: '累得想死，而且我不想活了' }).level, 'high');

// Chinese severe distress.
assert.equal(assessMoodSafety({ ...noBody, transcript: '我快崩溃了' }).level, 'medium');

// Chinese urgent medical with a Chinese body label.
const urgent = assessMoodSafety({
  transcript: '胸口突然很痛，呼吸困难',
  selectedBodySignalLabels: ['胸闷'],
  bodySignals: [],
});
assert.equal(urgent.level, 'urgent_medical');

// --- Helpfulness scoring: negative signals count ---
assert.equal(
  getHelpfulnessMemoryScore({ helped: 1, helped_a_little: 0, did_not_help: 0, too_much: 2, not_today: 0 }),
  -2,
  'too_much should subtract 2 each per the action-system contract',
);
assert.equal(
  getHelpfulnessMemoryScore({ helped: 0, helped_a_little: 0, did_not_help: 5, too_much: 0, not_today: 9 }),
  0,
  'did_not_help and not_today are weight 0, not negative',
);

assert.equal(
  isDeprioritizedHelpfulnessMemory({
    outcomeCounts: { helped: 1, helped_a_little: 0, did_not_help: 3, too_much: 0, not_today: 0 },
  }),
  true,
  'repeated did_not_help outweighing wins should deprioritize',
);
assert.equal(
  isDeprioritizedHelpfulnessMemory({
    outcomeCounts: { helped: 3, helped_a_little: 1, did_not_help: 2, too_much: 0, not_today: 0 },
  }),
  false,
  'a mostly-helpful action should not be deprioritized',
);

// The audit case: 1 helped + 3 did_not_help must not be recommended as "this worked last time".
function entry(actionId, index, { completionStatus = 'completed', helpfulness = null, effort = 'okay' } = {}) {
  return {
    id: `entry-${actionId}-${index}`,
    schemaVersion: 1,
    loopSignatureId: 'loop-1',
    chainKey: 'work_feedback|head_pressure|self_blame',
    actionId,
    actionTitle: actionId,
    completedAt: `2026-06-1${index}T09:00:00.000Z`,
    completionStatus,
    helpfulness,
    effort,
    skipReason: null,
    outcomeLabel: helpfulness || 'Skipped',
    answers: [],
    notes: null,
    safetyLevel: 'low',
    family: 'physiological',
    primaryNeed: 'downshift_body',
    weeklyReflectionRole: 'early_cue_practice',
    rewardStamp: 'softened',
    recommendationMode: 'loop_action',
    recommendationSource: 'body_signal',
    evidenceLine: '',
  };
}

const mostlyUnhelpful = buildHelpfulnessMemory([
  entry('body-scan', 1, { helpfulness: 'helped' }),
  entry('body-scan', 2, { helpfulness: 'did_not_help' }),
  entry('body-scan', 3, { helpfulness: 'did_not_help' }),
  entry('body-scan', 4, { helpfulness: 'did_not_help' }),
]);
assert.equal(
  getBestPositiveHelpfulnessMemoryForLoop(mostlyUnhelpful, 'work_feedback|head_pressure|self_blame'),
  null,
  '1 helped vs 3 did_not_help must not resurface as a remembered-helpful action',
);

// An action the user called "too much" twice must not outrank a single genuine win.
const tooMuchMemories = buildHelpfulnessMemory([
  entry('body-scan', 1, { helpfulness: 'helped', effort: 'too_much' }),
  entry('body-scan', 2, { helpfulness: 'helped', effort: 'too_much' }),
  entry('name-loop', 3, { helpfulness: 'helped' }),
]);
const best = getBestPositiveHelpfulnessMemoryForLoop(
  tooMuchMemories,
  'work_feedback|head_pressure|self_blame',
);
assert.equal(best?.actionId, 'name-loop', 'too_much should push an action below a clean win');

// A genuinely helpful action is still recommended.
const helpful = buildHelpfulnessMemory([
  entry('body-scan', 1, { helpfulness: 'helped' }),
  entry('body-scan', 2, { helpfulness: 'helped' }),
  entry('body-scan', 3, { helpfulness: 'did_not_help' }),
]);
assert.equal(
  getBestPositiveHelpfulnessMemoryForLoop(helpful, 'work_feedback|head_pressure|self_blame')?.actionId,
  'body-scan',
);

// C7: the recommendation reason counts positive outcomes, not completions, and reads naturally.
const mixedOutcomeReason = buildHelpfulnessMemory([
  entry('body-scan', 1, { helpfulness: 'helped' }),
  entry('body-scan', 2, { helpfulness: 'did_not_help' }),
  entry('body-scan', 3, { helpfulness: 'did_not_help' }),
])[0].recommendationReason;
assert.equal(
  mixedOutcomeReason,
  'Rora has seen body-scan help this loop 1 time since it showed up.',
  'one win among two misses must count 1 positive, not 3 completions',
);
assert.doesNotMatch(mixedOutcomeReason, /Best signal/, 'reason must not read like logspeak');

const twoWinsReason = buildHelpfulnessMemory([
  entry('body-scan', 1, { helpfulness: 'helped' }),
  entry('body-scan', 2, { helpfulness: 'helped_a_little' }),
  entry('body-scan', 3, { helpfulness: 'did_not_help' }),
])[0].recommendationReason;
assert.equal(
  twoWinsReason,
  'Rora has seen body-scan help this loop 2 times since it showed up.',
  'helped and helped_a_little should both count as wins',
);

const noWinsReason = buildHelpfulnessMemory([
  entry('body-scan', 1, { helpfulness: 'did_not_help' }),
  entry('body-scan', 2, { helpfulness: 'did_not_help' }),
])[0].recommendationReason;
assert.equal(
  noWinsReason,
  "Rora remembered that body-scan didn't quite land the last few times this loop showed up.",
  'all-miss completions must not claim the action helped',
);

// --- C2: action-effect follow-up compares recurrence against completedAt ---
// The completed action's chainKey matches trace()'s loopCandidateKey below.
const followUpChainKey = 'work_feedback|head_pressure|self_blame';

function followUpEntry(day, overrides = {}) {
  return {
    ...entry('body-scan', 0, { helpfulness: 'helped' }),
    chainKey: followUpChainKey,
    completedAt: `2026-06-${day}T09:00:00.000Z`,
    ...overrides,
  };
}

// Loop recurred 2 days after the action: name the interval, no verdict language.
const recurred = buildActionEffectFollowUp({
  actionMemoryEntries: [followUpEntry('10')],
  traceRecords: [trace('f1', '12'), trace('f2', '13')],
});
assert.equal(recurred?.outcome, 'recurred');
assert.equal(recurred?.daysAfterAction, 2);
assert.equal(
  recurred?.sentence,
  'This loop came back 2 days later after you tried body-scan.',
  'recurrence is stated as an observation with the real interval',
);

// No recurrence and 3 quiet days of other traces: the honest "stayed quiet" line.
function otherChainTrace(id, day) {
  return { ...trace(id, day), normalizedFields: { loopCandidateKey: 'other-chain' } };
}
const stayedQuiet = buildActionEffectFollowUp({
  actionMemoryEntries: [followUpEntry('10')],
  traceRecords: [otherChainTrace('q1', '11'), otherChainTrace('q2', '13')],
});
assert.equal(stayedQuiet?.outcome, 'stayed_quiet');
assert.equal(
  stayedQuiet?.sentence,
  'Since you tried body-scan, this loop has not shown up in 3 days of saved traces.',
  'quiet claim states the observed window, nothing more',
);

// One quiet day is silence, not evidence.
assert.equal(
  buildActionEffectFollowUp({
    actionMemoryEntries: [followUpEntry('10')],
    traceRecords: [otherChainTrace('q1', '11')],
  }),
  null,
  'a single quiet day must not produce a claim',
);

// Skips never anchor a follow-up.
assert.equal(
  buildActionEffectFollowUp({
    actionMemoryEntries: [
      followUpEntry('10', { completionStatus: 'skipped', helpfulness: null, skipReason: 'not_today' }),
    ],
    traceRecords: [trace('f1', '12'), trace('f2', '13')],
  }),
  null,
  'a skipped action has no effect to follow up on',
);

// A recurrence the user has long since traced past is stale — no follow-up.
assert.equal(
  buildActionEffectFollowUp({
    actionMemoryEntries: [followUpEntry('01')],
    traceRecords: [trace('f1', '02'), otherChainTrace('f2', '13')],
  }),
  null,
  'an 11-day-old recurrence must not keep resurfacing',
);

// --- Hard rejection must not revive on new evidence ---
const hardReject = createPatternFeedbackEntry({
  chainKey: 'chain-a',
  rating: 'not_quite',
  mismatchReason: 'not_a_pattern',
  createdAt: '2026-06-10T09:00:00.000Z',
});
const afterNewEvidence = buildPatternFeedbackState([hardReject], 'chain-a', '2026-06-12T09:00:00.000Z');
assert.equal(afterNewEvidence.status, 'cooldown', '"not a pattern" must stay rejected despite new traces');
assert.equal(afterNewEvidence.canPromptAgain, false, 'a rejected pattern must not re-prompt');

// C6: 3 fresh records for the same chain AND 2+ days together reopen the hard rejection.
function chainTrace(id, day) {
  return { ...trace(id, day), normalizedFields: { loopCandidateKey: 'chain-a' } };
}
const postRejectTraces = [chainTrace('r1', '12'), chainTrace('r2', '13'), chainTrace('r3', '14')];
const rejectReopen = buildPatternFeedbackState(
  [hardReject],
  'chain-a',
  chainTrace('r3', '14').savedAt,
  postRejectTraces,
);
assert.equal(rejectReopen.status, 'watching', 'cooldown AND 3 fresh records should reopen a hard rejection');
assert.equal(rejectReopen.canPromptAgain, true, 'a reopened rejection may prompt again');

const rejectOneDayNoReopen = buildPatternFeedbackState(
  [hardReject],
  'chain-a',
  chainTrace('r1', '12').savedAt,
  [chainTrace('r1', '12')],
);
assert.equal(
  rejectOneDayNoReopen.status,
  'cooldown',
  'hard rejection must not reopen on a single fresh record',
);

const rejectTooSoonNoReopen = buildPatternFeedbackState(
  [hardReject],
  'chain-a',
  chainTrace('r9', '11').savedAt,
  [chainTrace('r7', '11'), chainTrace('r8', '11'), chainTrace('r9', '11')],
);
assert.equal(
  rejectTooSoonNoReopen.status,
  'cooldown',
  '3 fresh records on one day must not reopen before the cooldown passes',
);

// A mild single correction still reopens on new evidence.
const mild = createPatternFeedbackEntry({
  chainKey: 'chain-b',
  rating: 'not_quite',
  mismatchReason: 'feeling_mismatch',
  createdAt: '2026-06-10T09:00:00.000Z',
});
assert.equal(buildPatternFeedbackState([mild], 'chain-b', '2026-06-12T09:00:00.000Z').status, 'watching');

// Two consecutive mild corrections cool down, but reopen with new evidence.
const mild2 = createPatternFeedbackEntry({
  chainKey: 'chain-b',
  rating: 'not_quite',
  mismatchReason: 'context_mismatch',
  createdAt: '2026-06-11T09:00:00.000Z',
});
assert.equal(buildPatternFeedbackState([mild, mild2], 'chain-b', null).status, 'cooldown');
assert.equal(
  buildPatternFeedbackState([mild, mild2], 'chain-b', '2026-06-12T09:00:00.000Z').status,
  'watching',
);

// --- Window anchoring: a stale loop must not resurface ---
function trace(id, day) {
  return {
    id,
    savedAt: `2026-06-${day}T09:00:00.000Z`,
    createdAt: `2026-06-${day}T09:00:00.000Z`,
    safetyAssessment: { canShowPattern: true },
    normalizedFields: {
      loopCandidateKey: 'work_feedback|head_pressure|self_blame',
      contextCanonical: 'work_feedback',
      bodySignalCanonical: 'head_pressure',
      thoughtFormCanonical: 'self_blame',
    },
    loopSignature: { chainKey: 'work_feedback|head_pressure|self_blame' },
    chain: ['work_feedback', 'head_pressure', 'self_blame'],
  };
}

const signature = { chainKey: 'work_feedback|head_pressure|self_blame' };
const staleTraces = [trace('t1', '10'), trace('t2', '11'), trace('t3', '12'), trace('t4', '13')];

const stale = getLoopPatternRuleState(signature, staleTraces, LOOP_PATTERN_WINDOW_DAYS, '2026-06-30T09:00:00.000Z');
assert.equal(stale.canShowLoop, false, 'a loop from 3 weeks ago must not show under "Last 5 days"');
assert.equal(stale.traceCount, 0);

const fresh = getLoopPatternRuleState(signature, staleTraces, LOOP_PATTERN_WINDOW_DAYS, '2026-06-13T09:00:00.000Z');
assert.equal(fresh.canShowLoop, true, 'a current loop must still show');
assert.equal(fresh.traceCount, 4);
assert.equal(fresh.dayCount, 4);

// The window is exactly N calendar days including today.
const boundary = getLoopPatternRuleState(signature, staleTraces, LOOP_PATTERN_WINDOW_DAYS, '2026-06-14T09:00:00.000Z');
assert.equal(boundary.traceCount, 4, 'day 10 is 4 days before day 14, still inside a 5-day window');
const justOutside = getLoopPatternRuleState(signature, staleTraces, LOOP_PATTERN_WINDOW_DAYS, '2026-06-15T09:00:00.000Z');
assert.equal(justOutside.traceCount, 3, 'day 10 falls out on day 15');

console.log('OK: safety, helpfulness scoring, pattern cooldown, and window anchoring are correct.');
