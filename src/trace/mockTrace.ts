import { bodySignalByLabel } from './traceIconDictionary';
import type {
  BodySignalSelection,
  MockTraceResult,
  NoticingContent,
  NoticingState,
  TraceIconKey,
} from './types';

export const noticingContentByState: Record<NoticingState, NoticingContent> = {
  starting_focus: {
    badge: 'Starting out',
    title: 'Your starting focus',
    chain: ['stress_pressure', 'overthinking', 'stomach_tightness'],
    note: '',
  },
  today_trace: {
    badge: '',
    title: "Today’s trace",
    chain: ['work_feedback', 'self_blame', 'overthinking', 'stomach_tightness'],
    note: '',
  },
  trace_echo: {
    badge: 'Seen again',
    title: "Today’s trace",
    chain: ['work_feedback', 'self_blame', 'overthinking', 'stomach_tightness'],
    note: 'Similar to a recent saved trace. Still based on this check-in.',
  },
};

export const defaultTranscript =
  'I felt tense after a meeting, and my stomach tightened when I kept replaying what I said.';

export const defaultTraceResult: MockTraceResult = {
  chain: ['work_feedback', 'self_blame', 'overthinking', 'stomach_tightness'],
  bodySignals: [{ key: 'stomach_tightness', value: 'Stomach tightness' }],
  extraction: [
    { label: 'Trigger', value: 'Work feedback' },
    { label: 'Thought', value: 'Self-blame, Overthinking' },
    { label: 'Body', value: 'Stomach tightness' },
  ],
};

export const startingFocusTraceResult: MockTraceResult = {
  chain: noticingContentByState.starting_focus.chain,
  bodySignals: [{ key: 'stomach_tightness', value: 'Stomach tightness' }],
  extraction: [
    { label: 'Focus', value: 'Stress pressure' },
    { label: 'Thought', value: 'Overthinking' },
    { label: 'Body', value: 'Stomach tightness' },
  ],
};

export const todayTraceContent: NoticingContent = {
  badge: '',
  title: "Today’s trace",
  chain: defaultTraceResult.chain,
  note: '',
};

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function uniqueTraceChain(items: TraceIconKey[]) {
  return items.filter((item, index) => items.indexOf(item) === index).slice(0, 4);
}

function uniqueBodySignals(items: BodySignalSelection[]) {
  return items.filter((item, index) => items.findIndex((candidate) => candidate.key === item.key) === index);
}

function getBodySignalsFromTranscript(normalizedTranscript: string) {
  const bodySignals: BodySignalSelection[] = [];

  if (includesAny(normalizedTranscript, ['neck', 'shoulder'])) {
    bodySignals.push({ key: 'neck_shoulder_tension', value: 'Neck / shoulder tension' });
  }

  if (includesAny(normalizedTranscript, ['head', 'headache'])) {
    bodySignals.push({ key: 'head_pressure', value: 'Head pressure' });
  }

  if (includesAny(normalizedTranscript, ['stomach', 'gut', 'belly'])) {
    bodySignals.push({ key: 'stomach_tightness', value: 'Stomach tightness' });
  }

  if (includesAny(normalizedTranscript, ['chest'])) {
    bodySignals.push({ key: 'chest_tightness', value: 'Chest tightness' });
  }

  if (includesAny(normalizedTranscript, ['tired', 'heavy', 'fatigue', 'exhausted'])) {
    bodySignals.push({ key: 'tired_heavy', value: 'Tired / heavy' });
  }

  return uniqueBodySignals(bodySignals);
}

function getSelectedBodySignals(selectedBodySignals: string[]) {
  return uniqueBodySignals(
    selectedBodySignals
      .map((selectedBodySignal) => bodySignalByLabel[selectedBodySignal])
      .filter((bodySignal): bodySignal is BodySignalSelection => Boolean(bodySignal)),
  ).slice(0, 3);
}

export function buildMockTraceFromInput({
  transcript,
  selectedBodySignals,
}: {
  transcript: string;
  selectedBodySignals: string[];
}): MockTraceResult {
  const normalizedTranscript = transcript.toLowerCase();
  const chain: TraceIconKey[] = [];
  const thoughtValues: string[] = [];
  let triggerValue = '';

  if (includesAny(normalizedTranscript, ['meeting', 'feedback', 'boss', 'work'])) {
    chain.push('work_feedback');
    triggerValue = 'Work feedback';
  }

  if (includesAny(normalizedTranscript, ['replaying', 'replay', 'kept replaying'])) {
    chain.push('relationship_replay');
    thoughtValues.push('Relationship replay');
  }

  if (includesAny(normalizedTranscript, ['blame', 'my fault', 'fault'])) {
    chain.push('self_blame');
    thoughtValues.push('Self-blame');
  }

  if (includesAny(normalizedTranscript, ['overthinking', 'thinking', 'replaying', 'replay', 'worry'])) {
    chain.push('overthinking');
    thoughtValues.push('Overthinking');
  }

  if (!triggerValue && chain[0] === 'relationship_replay') {
    triggerValue = 'Relationship replay';
  }

  const selectedBodies = getSelectedBodySignals(selectedBodySignals);
  const transcriptBodies = getBodySignalsFromTranscript(normalizedTranscript);
  const bodySignals =
    selectedBodies.length > 0
      ? selectedBodies
      : transcriptBodies.length > 0
        ? transcriptBodies
        : [bodySignalByLabel['Stomach\ntightness']];
  const primaryBodySignal = bodySignals[0];

  chain.push(primaryBodySignal.key);

  const finalChain = uniqueTraceChain(chain);
  const extraction = [];

  if (triggerValue) {
    extraction.push({ label: 'Trigger', value: triggerValue });
  }

  extraction.push({
    label: 'Thought',
    value: Array.from(new Set(thoughtValues)).join(', ') || 'Overthinking',
  });

  extraction.push({ label: 'Body', value: bodySignals.map((bodySignal) => bodySignal.value).join(', ') });

  return {
    chain: finalChain,
    extraction,
    bodySignals,
  };
}
