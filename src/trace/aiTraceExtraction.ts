import {
  assessMoodSafety,
  type MoodSafetyAssessment,
  type ActionMemoryEntry,
  type HelpfulnessMemory,
  type MoodTraceRecord,
  type TraceActionRoutingFeatures,
  type WeeklyReflectionPreview,
} from './dataFoundation';
import { buildMockTraceFromInput } from './mockTrace';
import type { MockTraceResult, TraceExtraction } from './types';

export const AI_TRACE_EXTRACTION_SCHEMA_VERSION = 'mood_ai_trace_extraction_v1';

export type AiTraceLanguage = 'en' | 'zh' | 'mixed' | 'unknown';
export type AiTraceConfidence = 'low' | 'medium' | 'high';
export type AiTraceDraftFieldSource = 'user_selected' | 'transcript' | 'ai_inferred';
export type AiTraceDraftFieldType = 'trigger' | 'thought' | 'feeling' | 'body' | 'behavior' | 'need';
export type AiTraceProvider = 'mock' | 'openai';
export type AiTraceInputMode = 'type' | 'speak' | 'cue';

export type AiTraceDraftField = {
  id: string;
  type: AiTraceDraftFieldType;
  label: string;
  value: string;
  source: AiTraceDraftFieldSource;
  confidence: AiTraceConfidence;
  userEditable: true;
};

export type AiActionRoutingFeatures = TraceActionRoutingFeatures;

export type AiTraceExtractionResponse = {
  schemaVersion: typeof AI_TRACE_EXTRACTION_SCHEMA_VERSION;
  requestId: string;
  provider: AiTraceProvider;
  language: AiTraceLanguage;
  transcript: {
    rawText: string;
    cleanedText: string;
    confidence: AiTraceConfidence;
  };
  warmReflection: {
    text: string;
    shouldShow: boolean;
  };
  traceDraft: {
    summaryOneLiner: string;
    fields: AiTraceDraftField[];
  };
  traceResult: MockTraceResult;
  actionRoutingFeatures: AiActionRoutingFeatures;
  safety: MoodSafetyAssessment;
  draftReviewUi: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  doNotStore: {
    rawAudioAfterTranscription: true;
    modelReasoning: true;
    safetyInternalNotes: true;
  };
  ttsAudio: {
    base64: string | null;
    mimeType: string | null;
    voice: string | null;
  };
};

export type AiTraceExtractionRequest = {
  transcript: string;
  selectedMood: string | null;
  selectedBodySignals: string[];
  inputMode: AiTraceInputMode;
  audioBase64?: string | null;
  audioMimeType?: string | null;
  wantsVoiceReply?: boolean;
};

export type MoodAiSpeechResponse = {
  ttsAudio: {
    base64: string | null;
    mimeType: string | null;
    voice: string | null;
  };
  doNotStore?: {
    promptTextAfterSynthesis: true;
  };
};

export const aiTraceExtractionJsonSchema = {
  name: 'mood_ai_trace_extraction_v1',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'schemaVersion',
      'requestId',
      'language',
      'transcript',
      'warmReflection',
      'traceDraft',
      'actionRoutingFeatures',
      'safety',
      'draftReviewUi',
      'doNotStore',
      'ttsAudio',
    ],
    properties: {
      schemaVersion: { const: AI_TRACE_EXTRACTION_SCHEMA_VERSION },
      requestId: { type: 'string' },
      language: { enum: ['en', 'zh', 'mixed', 'unknown'] },
      transcript: {
        type: 'object',
        additionalProperties: false,
        required: ['rawText', 'cleanedText', 'confidence'],
        properties: {
          rawText: { type: 'string' },
          cleanedText: { type: 'string' },
          confidence: { enum: ['low', 'medium', 'high'] },
        },
      },
      warmReflection: {
        type: 'object',
        additionalProperties: false,
        required: ['text', 'shouldShow'],
        properties: {
          text: { type: 'string' },
          shouldShow: { type: 'boolean' },
        },
      },
      traceDraft: {
        type: 'object',
        additionalProperties: false,
        required: ['summaryOneLiner', 'fields'],
        properties: {
          summaryOneLiner: { type: 'string' },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'type', 'label', 'value', 'source', 'confidence', 'userEditable'],
              properties: {
                id: { type: 'string' },
                type: { enum: ['trigger', 'thought', 'feeling', 'body', 'behavior', 'need'] },
                label: { type: 'string' },
                value: { type: 'string' },
                source: { enum: ['user_selected', 'transcript', 'ai_inferred'] },
                confidence: { enum: ['low', 'medium', 'high'] },
                userEditable: { const: true },
              },
            },
          },
        },
      },
      actionRoutingFeatures: {
        type: 'object',
        additionalProperties: false,
        required: ['primaryNeed', 'recommendedActionFamily', 'burdenLevel', 'whyThis'],
        properties: {
          primaryNeed: {
            enum: ['downshift_body', 'separate_thoughts', 'name_loop', 'tiny_next_step', 'unload', 'reframe', 'none'],
          },
          recommendedActionFamily: {
            enum: ['physiological', 'cognitive', 'labeling', 'behavioral', 'reflection', 'none'],
          },
          burdenLevel: { enum: ['very_low', 'low', 'medium'] },
          whyThis: { type: 'string' },
        },
      },
      safety: { type: 'object' },
      draftReviewUi: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'subtitle', 'primaryCta', 'secondaryCta'],
        properties: {
          title: { type: 'string' },
          subtitle: { type: 'string' },
          primaryCta: { type: 'string' },
          secondaryCta: { type: 'string' },
        },
      },
      doNotStore: {
        type: 'object',
        additionalProperties: false,
        required: ['rawAudioAfterTranscription', 'modelReasoning', 'safetyInternalNotes'],
        properties: {
          rawAudioAfterTranscription: { const: true },
          modelReasoning: { const: true },
          safetyInternalNotes: { const: true },
        },
      },
      ttsAudio: {
        type: 'object',
        additionalProperties: false,
        required: ['base64', 'mimeType', 'voice'],
        properties: {
          base64: { type: ['string', 'null'] },
          mimeType: { type: ['string', 'null'] },
          voice: { type: ['string', 'null'] },
        },
      },
    },
  },
} as const;

function makeRequestId() {
  return `ai-trace-${Date.now().toString(36)}`;
}

function getLanguage(transcript: string): AiTraceLanguage {
  const hasCjk = /[\u3400-\u9fff]/.test(transcript);
  const hasLatin = /[a-z]/i.test(transcript);

  if (hasCjk && hasLatin) {
    return 'mixed';
  }

  if (hasCjk) {
    return 'zh';
  }

  if (hasLatin) {
    return 'en';
  }

  return 'unknown';
}

function getDraftFieldType(label: string): AiTraceDraftFieldType {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('trigger') || normalizedLabel.includes('focus')) {
    return 'trigger';
  }

  if (normalizedLabel.includes('body')) {
    return 'body';
  }

  if (normalizedLabel.includes('feeling') || normalizedLabel.includes('mood')) {
    return 'feeling';
  }

  return 'thought';
}

function normalizeDraftFieldCopy(item: TraceExtraction): TraceExtraction {
  const normalizedLabel = item.label.toLowerCase();
  const normalizedValue = item.value.toLowerCase();
  let label = item.label;
  let value = item.value;

  if (normalizedLabel.includes('body')) {
    label = 'Body signal';
  }

  if (normalizedLabel.includes('trigger') && normalizedValue.includes('work')) {
    label = 'Context';
    value = 'Work';
  }

  if (
    normalizedLabel.includes('thought') &&
    (normalizedValue.includes('work') ||
      normalizedValue.includes('lingering') ||
      normalizedValue.includes('replay') ||
      normalizedValue.includes('stayed'))
  ) {
    value = 'A work thought kept replaying';
  }

  return { label, value };
}

function getMockDraftSummary(fields: AiTraceDraftField[]) {
  const fieldValue = (label: string) =>
    fields.find((field) => field.label.toLowerCase().includes(label))?.value.toLowerCase() || '';
  const feeling = fieldValue('feeling');
  const context = fieldValue('context');
  const thought = fieldValue('thought');

  if (feeling.includes('calm') && (context.includes('work') || thought.includes('work'))) {
    return 'Calm, with a work thought still replaying.';
  }

  if (context.includes('work') || thought.includes('work')) {
    return 'A work thought still replaying.';
  }

  return 'Here’s a gentle draft of this trace.';
}

function getWarmReflection({
  selectedMood,
  selectedBodySignals,
}: {
  selectedMood: string | null;
  selectedBodySignals: string[];
}) {
  const bodySignal = selectedBodySignals[0]?.replace(/\n/g, ' ').toLowerCase();

  if (selectedMood && bodySignal) {
    return `I hear ${selectedMood.toLowerCase()} with ${bodySignal}. We can keep this simple and only save what fits.`;
  }

  if (selectedMood) {
    return `I hear ${selectedMood.toLowerCase()}. Let’s turn this into a small trace you can edit.`;
  }

  if (bodySignal) {
    return `You noticed ${bodySignal}. We can name the moment without forcing a story.`;
  }

  return 'A few words are enough. Rora will keep this editable.';
}

function getActionRoutingFeatures(traceResult: MockTraceResult): AiActionRoutingFeatures {
  if (traceResult.bodySignals.length > 1) {
    return {
      primaryNeed: 'downshift_body',
      recommendedActionFamily: 'physiological',
      burdenLevel: 'very_low',
      whyThis: 'The trace includes a stronger body signal.',
    };
  }

  if (traceResult.chain.includes('overthinking')) {
    return {
      primaryNeed: 'separate_thoughts',
      recommendedActionFamily: 'cognitive',
      burdenLevel: 'low',
      whyThis: 'The trace includes overthinking or worry.',
    };
  }

  return {
    primaryNeed: 'name_loop',
    recommendedActionFamily: 'labeling',
    burdenLevel: 'very_low',
    whyThis: 'The trace is still forming, so naming it is the lightest first step.',
  };
}

export function buildAiDraftFields({
  extraction,
  selectedMood,
}: {
  extraction: TraceExtraction[];
  selectedMood: string | null;
}) {
  const fields: AiTraceDraftField[] = [];

  if (selectedMood) {
    fields.push({
      id: 'selected-mood',
      type: 'feeling',
      label: 'Feeling',
      value: selectedMood,
      source: 'user_selected',
      confidence: 'high',
      userEditable: true,
    });
  }

  extraction.map(normalizeDraftFieldCopy).forEach((item) => {
    fields.push({
      id: item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: getDraftFieldType(item.label),
      label: item.label,
      value: item.value,
      source: 'transcript',
      confidence: 'medium',
      userEditable: true,
    });
  });

  return fields;
}

export async function runMockAiTraceExtraction({
  transcript,
  selectedMood,
  selectedBodySignals,
}: {
  transcript: string;
  selectedMood: string | null;
  selectedBodySignals: string[];
}): Promise<AiTraceExtractionResponse> {
  const cleanedText = transcript.trim().replace(/\s+/g, ' ');
  const traceResult = buildMockTraceFromInput({
    transcript: cleanedText,
    selectedBodySignals,
  });
  const safety = assessMoodSafety({
    transcript: cleanedText,
    selectedBodySignalLabels: selectedBodySignals,
    bodySignals: traceResult.bodySignals,
  });
  const fields = buildAiDraftFields({
    extraction: traceResult.extraction,
    selectedMood,
  });

  return {
    schemaVersion: AI_TRACE_EXTRACTION_SCHEMA_VERSION,
    requestId: makeRequestId(),
    provider: 'mock',
    language: getLanguage(cleanedText),
    transcript: {
      rawText: transcript,
      cleanedText,
      confidence: cleanedText.length > 12 ? 'high' : 'medium',
    },
    warmReflection: {
      text: getWarmReflection({ selectedMood, selectedBodySignals }),
      shouldShow: safety.level === 'low' || safety.level === 'medium',
    },
    traceDraft: {
      summaryOneLiner: getMockDraftSummary(fields),
      fields,
    },
    traceResult,
    actionRoutingFeatures: getActionRoutingFeatures(traceResult),
    safety,
    draftReviewUi: {
      title: 'Here’s a draft of your trace',
      subtitle: 'Tap anything to make it feel right before saving.',
      primaryCta: 'Save my trace',
      secondaryCta: 'Start again',
    },
    doNotStore: {
      rawAudioAfterTranscription: true,
      modelReasoning: true,
      safetyInternalNotes: true,
    },
    ttsAudio: {
      base64: null,
      mimeType: null,
      voice: null,
    },
  };
}

export async function runOpenAiTraceExtraction({
  transcript,
  selectedMood,
  selectedBodySignals,
  inputMode,
  audioBase64 = null,
  audioMimeType = null,
  wantsVoiceReply = inputMode === 'speak',
}: AiTraceExtractionRequest): Promise<AiTraceExtractionResponse> {
  const response = await fetch('http://localhost:8084/api/mood-ai/reflect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcript,
      selectedMood,
      selectedBodySignals,
      inputMode,
      audioBase64,
      audioMimeType,
      wantsVoiceReply,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Rora request failed: ${response.status} ${errorText.slice(0, 180)}`);
  }

  return response.json();
}

export async function requestMoodPromptSpeech({
  text,
}: {
  text: string;
}): Promise<MoodAiSpeechResponse> {
  const response = await fetch('http://localhost:8084/api/mood-ai/speak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Rora speech failed: ${response.status} ${errorText.slice(0, 180)}`);
  }

  return response.json();
}

function toWeeklyTracePayload(record: MoodTraceRecord) {
  return {
    id: record.id,
    savedAt: record.savedAt || record.createdAt,
    moodLabel: record.moodLabel,
    bodySignalLabels: record.bodySignalLabels,
    chain: record.chain,
    normalizedFields: record.normalizedFields,
    actionRoutingFeatures: record.actionRoutingFeatures,
    loopSignature: {
      chainKey: record.loopSignature.chainKey,
      label: record.loopSignature.label,
      signalKeys: record.loopSignature.signalKeys,
      occurrenceCount: record.loopSignature.occurrenceCount,
      primaryBodyKey: record.loopSignature.primaryBodyKey,
    },
    safety: {
      level: record.safetyAssessment.level,
      canShowPattern: record.safetyAssessment.canShowPattern,
      canRecommendAction: record.safetyAssessment.canRecommendAction,
    },
  };
}

function toWeeklyActionPayload(entry: ActionMemoryEntry) {
  return {
    id: entry.id,
    completedAt: entry.completedAt,
    actionId: entry.actionId,
    actionTitle: entry.actionTitle,
    family: entry.family,
    primaryNeed: entry.primaryNeed,
    weeklyReflectionRole: entry.weeklyReflectionRole,
    rewardStamp: entry.rewardStamp,
    recommendationMode: entry.recommendationMode,
    recommendationSource: entry.recommendationSource,
    chainKey: entry.chainKey,
    helpfulness: entry.helpfulness,
    outcomeLabel: entry.outcomeLabel,
    evidenceLine: entry.evidenceLine,
  };
}

export async function runOpenAiWeeklyReflection({
  localPreview,
  traces,
  actionMemory,
  helpfulnessMemory,
}: {
  localPreview: WeeklyReflectionPreview;
  traces: MoodTraceRecord[];
  actionMemory: ActionMemoryEntry[];
  helpfulnessMemory: HelpfulnessMemory[];
}): Promise<WeeklyReflectionPreview> {
  const response = await fetch('http://localhost:8084/api/mood-ai/weekly-reflection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      localPreview,
      weeklyFacts: localPreview.weeklyFacts,
      traces: traces.filter((record) => record.safetyAssessment.canShowPattern).map(toWeeklyTracePayload),
      actionMemory: actionMemory.map(toWeeklyActionPayload),
      helpfulnessMemory,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Rora weekly reflection failed: ${response.status} ${errorText.slice(0, 180)}`);
  }

  const aiPreview = await response.json();

  return {
    ...localPreview,
    ...aiPreview,
    schemaVersion: localPreview.schemaVersion,
    paidPlan: aiPreview.paidPlan || localPreview.paidPlan,
  };
}
