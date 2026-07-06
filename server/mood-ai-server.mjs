import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '..');

loadEnvFile(path.join(__dirname, '.env.local'));
loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(workspaceRoot, '.env.local'));
loadEnvFile(path.join(workspaceRoot, '.env'));

const PORT = Number(process.env.MOOD_AI_SERVER_PORT || 8084);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STT_MODEL = process.env.MOOD_AI_STT_MODEL || 'gpt-4o-mini-transcribe';
const EXTRACTION_MODEL = process.env.MOOD_AI_EXTRACTION_MODEL || 'gpt-5.4-mini';
const MODERATION_MODEL = process.env.MOOD_AI_MODERATION_MODEL || 'omni-moderation-latest';
const TTS_MODEL = process.env.MOOD_AI_TTS_MODEL || 'gpt-4o-mini-tts';
const TTS_VOICE = process.env.MOOD_AI_TTS_VOICE || 'marin';
const TTS_RESPONSE_FORMAT = process.env.MOOD_AI_TTS_RESPONSE_FORMAT || 'wav';
const rawTtsSpeed = Number(process.env.MOOD_AI_TTS_SPEED || 1.1);
const TTS_SPEED = Number.isFinite(rawTtsSpeed) ? Math.min(1.25, Math.max(0.8, rawTtsSpeed)) : 1.1;
const TTS_INSTRUCTIONS_VERSION = 'opening_voice_v2_2026_06_18';
const TTS_OPENING_INSTRUCTIONS =
  'Speak like a gentle companion sitting nearby: warm, light, natural, and quietly present. Use a slightly brighter tone and avoid sounding deep, heavy, formal, or authoritative. Keep the pace relaxed and conversational, not slow and not rushed, even with speed set around 1.10. Let commas create tiny natural pauses, and soften the final phrase. Make the line feel like a small invitation, not an instruction, assessment, therapy prompt, app notification, customer service message, teacher voice, or coach voice. Do not sound clinical, corrective, cheerful, dramatic, whispery, robotic, or urgent. Do not over-enunciate UI-like words; treat calm and tightness in your chest as natural everyday language.';
const ttsCache = new Map();
const TTS_CACHE_MAX_ENTRIES = 80;
const WEEKLY_REFLECTION_SCHEMA_VERSION = 'rora_weekly_reflection_card_v2';

const TRACE_ICON_LABELS = {
  work_feedback: 'Work feedback',
  self_blame: 'Self-blame',
  overthinking: 'Overthinking',
  stomach_tightness: 'Stomach tightness',
  chest_tightness: 'Chest tightness',
  neck_shoulder_tension: 'Neck / shoulder tension',
  tired_heavy: 'Tired / heavy',
  short_sleep: 'Short sleep',
  head_pressure: 'Head pressure',
  relationship_replay: 'Relationship replay',
  phone_scrolling: 'Phone scrolling',
  generic_body: 'Body signal',
  stress_pressure: 'Stress pressure',
};

const TRACE_ICON_KEYS = Object.keys(TRACE_ICON_LABELS);
const BODY_SIGNAL_KEYS = [
  'stomach_tightness',
  'chest_tightness',
  'neck_shoulder_tension',
  'tired_heavy',
  'head_pressure',
  'generic_body',
];

const OPENAI_HEADERS = {
  Authorization: `Bearer ${OPENAI_API_KEY || ''}`,
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const text = fs.readFileSync(filePath, 'utf8');

  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const equalsIndex = trimmed.indexOf('=');

    if (equalsIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^"|"$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function jsonResponse(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;

      if (body.length > 12 * 1024 * 1024) {
        reject(new Error('Request body is too large.'));
        request.destroy();
      }
    });

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });

    request.on('error', reject);
  });
}

function makeRequestId() {
  return `ai-trace-${Date.now().toString(36)}`;
}

function normalizeText(text) {
  return String(text || '').trim().replace(/\s+/g, ' ');
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function getLanguage(transcript) {
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

function getPlainLabel(key) {
  return TRACE_ICON_LABELS[key] || 'Body signal';
}

function getAudioFilename(mimeType) {
  if (mimeType?.includes('mp4')) {
    return 'mood-reflection.m4a';
  }

  if (mimeType?.includes('mpeg')) {
    return 'mood-reflection.mp3';
  }

  if (mimeType?.includes('wav')) {
    return 'mood-reflection.wav';
  }

  return 'mood-reflection.webm';
}

function getTtsMimeType(format) {
  if (format === 'wav') {
    return 'audio/wav';
  }

  if (format === 'aac') {
    return 'audio/aac';
  }

  if (format === 'opus') {
    return 'audio/ogg';
  }

  if (format === 'flac') {
    return 'audio/flac';
  }

  if (format === 'pcm') {
    return 'audio/pcm';
  }

  return 'audio/mpeg';
}

function rememberCachedTts(cacheKey, value) {
  if (ttsCache.size >= TTS_CACHE_MAX_ENTRIES) {
    const oldestKey = ttsCache.keys().next().value;

    if (oldestKey) {
      ttsCache.delete(oldestKey);
    }
  }

  ttsCache.set(cacheKey, value);
}

async function callOpenAI(pathname, options) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const response = await fetch(`https://api.openai.com${pathname}`, {
    ...options,
    headers: {
      ...OPENAI_HEADERS,
      ...(options.headers || {}),
    },
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : await response.arrayBuffer();

  if (!response.ok) {
    const detail = isJson ? JSON.stringify(body).slice(0, 700) : `binary:${body.byteLength}`;
    throw new Error(`OpenAI ${pathname} failed with ${response.status}: ${detail}`);
  }

  return body;
}

async function transcribeAudio({ audioBase64, audioMimeType }) {
  if (!audioBase64) {
    return '';
  }

  const buffer = Buffer.from(audioBase64, 'base64');
  const form = new FormData();
  const blob = new Blob([buffer], { type: audioMimeType || 'audio/webm' });

  form.append('file', blob, getAudioFilename(audioMimeType));
  form.append('model', STT_MODEL);

  const data = await callOpenAI('/v1/audio/transcriptions', {
    method: 'POST',
    body: form,
  });

  return normalizeText(data.text || '');
}

async function moderateTranscript(transcript) {
  const data = await callOpenAI('/v1/moderations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODERATION_MODEL,
      input: transcript,
    }),
  });

  return data.results?.[0] || null;
}

function assessMoodSafety({ transcript, selectedBodySignalLabels, bodySignals, moderation }) {
  const normalizedTranscript = transcript.toLowerCase();
  const allBodyLabels = [
    ...(selectedBodySignalLabels || []),
    ...(bodySignals || []).map((signal) => signal.value),
  ].map((label) => String(label || '').toLowerCase());
  const hasChestSignal = allBodyLabels.some((label) => label.includes('chest'));
  const categories = moderation?.categories || {};
  const flags = [];

  if (
    includesAny(normalizedTranscript, [
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
    ]) ||
    categories['self-harm'] ||
    categories['self-harm/intent'] ||
    categories['self-harm/instructions']
  ) {
    flags.push({
      key: 'self_harm_language',
      label: 'Crisis language',
      evidence: 'Text includes self-harm or suicidal language.',
    });
  }

  if (
    includesAny(normalizedTranscript, [
      'hopeless',
      'unsafe',
      'unbearable',
      'panic',
      'spiraling',
      'cannot cope',
      "can't cope",
    ]) ||
    moderation?.flagged
  ) {
    flags.push({
      key: 'severe_distress_language',
      label: 'Severe distress language',
      evidence: 'Text includes severe distress or safety language.',
    });
  }

  if (
    hasChestSignal &&
    includesAny(normalizedTranscript, [
      'sudden',
      'severe',
      'crushing',
      'faint',
      'short of breath',
      'numb',
      'emergency',
    ])
  ) {
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

function getExtractionSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: [
      'language',
      'warm_reflection_text',
      'summary_one_liner',
      'fields',
      'chain_keys',
      'body_signals',
      'action_routing_features',
    ],
    properties: {
      language: { type: 'string', enum: ['en', 'zh', 'mixed', 'unknown'] },
      warm_reflection_text: { type: 'string' },
      summary_one_liner: { type: 'string' },
      fields: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'type', 'label', 'value', 'source', 'confidence', 'userEditable'],
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: ['trigger', 'thought', 'feeling', 'body', 'behavior', 'need'],
            },
            label: { type: 'string' },
            value: { type: 'string' },
            source: {
              type: 'string',
              enum: ['user_selected', 'transcript', 'ai_inferred'],
            },
            confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
            userEditable: { type: 'boolean' },
          },
        },
      },
      chain_keys: {
        type: 'array',
        items: { type: 'string', enum: TRACE_ICON_KEYS },
      },
      body_signals: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['key', 'value'],
          properties: {
            key: { type: 'string', enum: BODY_SIGNAL_KEYS },
            value: { type: 'string' },
          },
        },
      },
      action_routing_features: {
        type: 'object',
        additionalProperties: false,
        required: ['primaryNeed', 'recommendedActionFamily', 'burdenLevel', 'whyThis'],
        properties: {
          primaryNeed: {
            type: 'string',
            enum: [
              'downshift_body',
              'separate_thoughts',
              'name_loop',
              'tiny_next_step',
              'unload',
              'reframe',
              'none',
            ],
          },
          recommendedActionFamily: {
            type: 'string',
            enum: ['physiological', 'cognitive', 'labeling', 'behavioral', 'reflection', 'none'],
          },
          burdenLevel: { type: 'string', enum: ['very_low', 'low', 'medium'] },
          whyThis: { type: 'string' },
        },
      },
    },
  };
}

function getWeeklyReflectionSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['summary_card'],
    properties: {
      summary_card: {
        type: 'object',
        additionalProperties: false,
        required: [
          'card_mode',
          'eyebrow',
          'meta',
          'headline',
          'summary',
          'evidence_chip',
          'bottom_row',
          'boundary_line',
        ],
        properties: {
          card_mode: {
            type: 'string',
            enum: ['not_enough_data', 'learning', 'thread_summary', 'action_learning'],
          },
          eyebrow: { type: 'string' },
          meta: { type: 'string' },
          headline: { type: 'string' },
          summary: { type: 'string' },
          evidence_chip: { type: 'string' },
          bottom_row: {
            type: 'object',
            additionalProperties: false,
            required: ['label', 'title', 'detail', 'action_id'],
            properties: {
              label: { type: 'string' },
              title: { type: 'string' },
              detail: { type: 'string' },
              action_id: { type: ['string', 'null'] },
            },
          },
          boundary_line: { type: 'string' },
        },
      },
    },
  };
}

function getSystemPrompt() {
  return [
    "You are Rora, Rora Mood's reflection engine, not a therapist and not a chatbot.",
    'Your job is to turn a short user reflection into an editable wellness trace.',
    'Reflect only what the user provided. Do not diagnose, claim causes, or recommend treatment.',
    'Use warm but brief wording. The warm reflection must be one sentence and under 22 words.',
    'Frame the review as a user-owned draft, not as Rora judging, detecting, or analyzing the user.',
    'For draft fields, do not paste or truncate full user sentences. Turn each field into a compact trace node.',
    'Each field label must be a simple category such as Feeling, Body signal, Context, Thought, Need, or Response.',
    'Most field values must be compact trace nodes. Keep feeling/body/context to 1 to 3 words.',
    'Thought values can be one short phrase if needed, such as: A work thought kept replaying.',
    'The summary_one_liner should follow: [Feeling], with [something still present]. Keep it gentle and under 12 words.',
    'Prefer phrases like: Calm, with a work thought still replaying. Avoid clinical or causal wording.',
    'Do not invent new actions. Only provide routing features for the app to choose from its approved action library.',
    'Use only the provided canonical trace keys. If unsure, use generic_body or stress_pressure.',
    'For body signals like chest tightness, avoid interpreting them as anxiety or emotion.',
  ].join(' ');
}

function getWeeklyReflectionSystemPrompt() {
  return [
    "You are Rora Mood's Weekly Reflection wording layer.",
    'Rora Mood is not a therapist, not a diagnosis engine, and not an open-ended chatbot.',
    'Rora only learns from saved traces the user chose to save.',
    'You will receive a weeklyFacts object computed by the app. Treat weeklyFacts as the only source of truth.',
    'weeklyFacts.insightMode is computed by app rules. Do not reclassify trace counts, and do not call a possible_thread a loop.',
    'Use loop language only when insightMode is possible_loop, lighter_loop, or lighter_step.',
    'Use cue/signal language when insightMode is early_cue. Use action-learning language when insightMode is micro_win, lighter_loop, or lighter_step.',
    'Do not discover new patterns. Do not infer causes. Do not infer diagnoses, symptoms, disorders, risk scores, clinical states, personality traits, or worsening/improvement.',
    'Do not mention any fact that is not present in weeklyFacts.',
    'Write one warm, brief mobile card for Weekly Reflection.',
    'The card should help the user understand what is worth gently remembering from this week.',
    'It should synthesize what showed up, what Rora has learned or is still learning, and one small next step or action memory if available.',
    'Tone: warm, simple, grounded, non-clinical, user-owned, calm. Sound like a gentle notebook note, not a therapist, coach, doctor, dashboard, or productivity app.',
    'Allowed phrases: showed up, stayed with you, in your saved traces, Rora is still learning what helps, helped a little, one small thing to try, worth remembering, first cue.',
    'Avoid: this means, caused by, anxiety, depression, symptoms, diagnosis, risk, getting worse, you always, you tend to, you should, fix, treatment, intervention.',
    'Do not write raw plus-sign chains like "Work feedback + Overthinking + Chest tightness".',
    'headline must be under 8 words.',
    'summary must be 1 or 2 short sentences under 36 words total.',
    'evidence_chip must be under 8 words.',
    'bottom_row.title must be under 8 words.',
    'bottom_row.detail must be under 16 words.',
    'If completedActionCount is 0, do not mention "0 actions", "no action memory", or "waiting for helpfulness feedback". Say Rora is still learning what helps.',
    'If actionLearning.status is helped or helped_a_little, mention that action gently.',
    'If actionLearning.status is too_much, say Rora can keep next steps smaller.',
    'weeklyFacts.actionLearning.recommendedActionSource, bestActionFamily, bestPrimaryNeed, weeklyReflectionRole, and rewardStamp are action-schema facts. You may use them to choose wording, but do not print raw enum values.',
    'weeklyFacts.recommendedNextStep repeats the same action-schema facts for the suggested next step when one exists.',
    'Return JSON only.',
  ].join(' ');
}

function getUserPayload({ transcript, selectedMood, selectedBodySignals }) {
  return {
    selected_mood: selectedMood,
    selected_body_signals: selectedBodySignals,
    transcript,
    canonical_trace_keys: TRACE_ICON_LABELS,
    allowed_action_families: [
      'physiological',
      'cognitive',
      'labeling',
      'behavioral',
      'reflection',
      'none',
    ],
  };
}

function clampWeeklyText(text, fallback, maxLength) {
  const cleaned = normalizeText(text);

  if (!cleaned) {
    return fallback;
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const sentence = cleaned.split(/[.!?。！？]/)[0] || cleaned;
  const clipped = sentence.length <= maxLength ? sentence : `${sentence.slice(0, maxLength - 3).trim()}...`;

  return clipped || fallback;
}

const WEEKLY_BANNED_PHRASES = [
  'this means',
  'caused by',
  'anxiety',
  'depression',
  'symptom',
  'symptoms',
  'diagnosis',
  'risk',
  'getting worse',
  'you always',
  'you tend to',
  'you should',
  'treatment',
  'intervention',
];

function normalizeWeeklyCardMode(value, fallback) {
  return ['not_enough_data', 'learning', 'thread_summary', 'action_learning'].includes(value)
    ? value
    : fallback;
}

function hasUnsafeWeeklyLanguage(card) {
  const joined = [
    card.eyebrow,
    card.meta,
    card.headline,
    card.summary,
    card.evidenceChip,
    card.bottomRow?.label,
    card.bottomRow?.title,
    card.bottomRow?.detail,
    card.boundaryLine,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return WEEKLY_BANNED_PHRASES.some((phrase) => joined.includes(phrase)) || /\w+\s*\+\s*\w+/.test(joined);
}

function evidenceChipConflictsWithFacts(evidenceChip, weeklyFacts) {
  const normalizedEvidence = normalizeText(evidenceChip).toLowerCase();

  if (weeklyFacts?.completedActionCount === 0 && /\b0\s+(completed\s+)?actions?\b/.test(normalizedEvidence)) {
    return true;
  }

  if (weeklyFacts?.traceCount > 0 && /\bbased on\b/.test(normalizedEvidence)) {
    return !normalizedEvidence.includes(`${weeklyFacts.traceCount}`);
  }

  return false;
}

function actionIdConflictsWithFacts(actionId, weeklyFacts) {
  if (!actionId || !weeklyFacts) {
    return false;
  }

  const allowedActionIds = [
    weeklyFacts.actionLearning?.bestActionId,
    weeklyFacts.recommendedNextStep?.actionId,
  ].filter(Boolean);

  return allowedActionIds.length > 0 && !allowedActionIds.includes(actionId);
}

function getExpectedWeeklyCardMode(weeklyFacts) {
  const insightMode = weeklyFacts?.insightMode;

  if (insightMode === 'still_learning') {
    return 'learning';
  }

  if (['micro_win', 'lighter_loop', 'lighter_step'].includes(insightMode)) {
    return 'action_learning';
  }

  if (insightMode) {
    return 'thread_summary';
  }

  return weeklyFacts?.traceCount > 0 ? 'thread_summary' : 'learning';
}

function cardModeConflictsWithFacts(cardMode, weeklyFacts) {
  if (!weeklyFacts?.insightMode) {
    return false;
  }

  return cardMode !== getExpectedWeeklyCardMode(weeklyFacts);
}

function sanitizeWeeklySummaryCard({ extracted, fallbackPreview, weeklyFacts }) {
  const fallbackCard = fallbackPreview.summaryCard || {
    cardMode: getExpectedWeeklyCardMode(weeklyFacts),
    eyebrow: "Rora's note",
    meta: 'This week',
    headline: weeklyFacts?.traceCount > 0 ? 'A thread showed up this week.' : 'Rora is still gathering the week.',
    summary:
      fallbackPreview.weeklyNote?.text ||
      'Save a few more traces, and Rora will start connecting what repeats, shifts, and helps.',
    evidenceChip: fallbackPreview.weeklyNote?.evidenceLine || 'Saved traces only',
    bottomRow: {
      label: 'For now',
      title: fallbackPreview.gentleNextStep?.value || 'Keep it light',
      detail: fallbackPreview.gentleNextStep?.detail || 'One short trace is enough.',
      actionId: null,
    },
    boundaryLine: 'Based only on traces you saved.',
  };
  const rawCard = extracted.summary_card || {};
  const rawBottomRow = rawCard.bottom_row || {};
  const card = {
    cardMode: normalizeWeeklyCardMode(rawCard.card_mode, fallbackCard.cardMode),
    eyebrow: clampWeeklyText(rawCard.eyebrow, fallbackCard.eyebrow, 32),
    meta: clampWeeklyText(rawCard.meta, fallbackCard.meta, 24),
    headline: clampWeeklyText(rawCard.headline, fallbackCard.headline, 64),
    summary: clampWeeklyText(rawCard.summary, fallbackCard.summary, 220),
    evidenceChip: clampWeeklyText(rawCard.evidence_chip, fallbackCard.evidenceChip, 80),
    bottomRow: {
      label: clampWeeklyText(rawBottomRow.label, fallbackCard.bottomRow.label, 40),
      title: clampWeeklyText(rawBottomRow.title, fallbackCard.bottomRow.title, 64),
      detail: clampWeeklyText(rawBottomRow.detail, fallbackCard.bottomRow.detail, 120),
      actionId:
        typeof rawBottomRow.action_id === 'string' && rawBottomRow.action_id.trim()
          ? rawBottomRow.action_id.trim()
          : fallbackCard.bottomRow.actionId,
    },
    boundaryLine: clampWeeklyText(rawCard.boundary_line, fallbackCard.boundaryLine, 80),
  };

  if (
    hasUnsafeWeeklyLanguage(card) ||
    evidenceChipConflictsWithFacts(card.evidenceChip, weeklyFacts) ||
    actionIdConflictsWithFacts(card.bottomRow.actionId, weeklyFacts) ||
    cardModeConflictsWithFacts(card.cardMode, weeklyFacts)
  ) {
    return fallbackCard;
  }

  return card;
}

function sanitizeWeeklyReflectionSummary({ extracted, fallbackPreview }) {
  const weeklyFacts = fallbackPreview.weeklyFacts || null;
  const summaryCard = sanitizeWeeklySummaryCard({ extracted, fallbackPreview, weeklyFacts });

  return {
    weeklyFacts,
    summaryCard,
    weeklyNote: {
      title: summaryCard.eyebrow,
      text: summaryCard.summary,
      evidenceLine: summaryCard.evidenceChip,
    },
    freePreviewText: clampWeeklyText(
      summaryCard.summary,
      fallbackPreview.freePreviewText || summaryCard.summary,
      150,
    ),
    whatRepeated: fallbackPreview.whatRepeated || {
      value: fallbackPreview.primaryLoopLabel || 'No repeated loop yet',
      detail: weeklyFacts?.traceCount ? `${weeklyFacts.traceCount} saved traces` : 'Save a trace to begin',
    },
    whatShifted: fallbackPreview.whatShifted || {
      value: weeklyFacts?.completedActionCount ? `${weeklyFacts.completedActionCount} action notes` : 'Rora is still watching for a shift',
      detail: summaryCard.bottomRow.detail,
    },
    whatHelped: fallbackPreview.whatHelped || {
      value: summaryCard.bottomRow.title,
      detail: summaryCard.bottomRow.detail,
    },
    gentleNextStep: {
      value: summaryCard.bottomRow.title,
      detail: summaryCard.bottomRow.detail,
    },
  };
}

async function generateWeeklyReflectionSummary({ payload }) {
  const data = await callOpenAI('/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EXTRACTION_MODEL,
      input: [
        { role: 'system', content: getWeeklyReflectionSystemPrompt() },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      reasoning: { effort: 'none' },
      max_output_tokens: 520,
      text: {
        format: {
          type: 'json_schema',
          name: WEEKLY_REFLECTION_SCHEMA_VERSION,
          strict: true,
          schema: getWeeklyReflectionSchema(),
        },
      },
    }),
  });

  const text = extractResponseOutputText(data);

  if (!text) {
    throw new Error('OpenAI weekly reflection returned no output text.');
  }

  return JSON.parse(text);
}

function toReadableNodeLabel(text) {
  const cleaned = normalizeText(text).replace(/[.!?。！？]+$/g, '');

  if (!cleaned) {
    return '';
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

function getCompactFieldLabel(field) {
  const label = normalizeText(field.label).toLowerCase();

  if (field.type === 'feeling' || label.includes('feeling') || label.includes('mood')) {
    return 'Feeling';
  }

  if (field.type === 'body' || label.includes('body') || label.includes('chest') || label.includes('tightness')) {
    return 'Body signal';
  }

  if (
    field.type === 'trigger' ||
    label.includes('context') ||
    label.includes('trigger') ||
    label.includes('work') ||
    label.includes('situation')
  ) {
    return 'Context';
  }

  if (
    field.type === 'thought' ||
    label.includes('thought') ||
    label.includes('worry') ||
    label.includes('self') ||
    label.includes('wondering')
  ) {
    return 'Thought';
  }

  if (field.type === 'behavior' || label.includes('behavior') || label.includes('response')) {
    return 'Response';
  }

  if (field.type === 'need' || label.includes('need')) {
    return 'Need';
  }

  return toReadableNodeLabel(field.label || 'Trace');
}

function getCompactFieldValue({ label, type, value }) {
  const raw = normalizeText(value);
  const normalized = raw.toLowerCase();

  if (!raw) {
    return '';
  }

  if (type === 'body' || label === 'Body' || label === 'Body signal') {
    if (normalized.includes('chest')) return 'Chest tightness';
    if (normalized.includes('stomach')) return 'Stomach tightness';
    if (normalized.includes('neck') || normalized.includes('shoulder')) return 'Neck tension';
    if (normalized.includes('head')) return 'Head pressure';
    if (normalized.includes('tired') || normalized.includes('heavy')) return 'Tired heaviness';
    return 'Body signal';
  }

  if (normalized.includes('calm')) return 'Calm';
  if (normalized.includes('down')) return 'Down';
  if (normalized.includes('sad')) return 'Sad';
  if (normalized.includes('irritable')) return 'Irritable';

  if (normalized.includes('family')) return 'Family';
  if (normalized.includes('sleep')) return 'Sleep';
  if (normalized.includes('people') || normalized.includes('relationship')) return 'People';

  if (
    normalized.includes('did something wrong') ||
    normalized.includes('did wrong') ||
    normalized.includes('something wrong') ||
    normalized.includes('my fault') ||
    normalized.includes('fault') ||
    normalized === 'wrong' ||
    normalized.includes('self-doubt') ||
    normalized.includes('self doubt')
  ) {
    return 'Self-doubt';
  }

  if (normalized.includes('overthink') || normalized.includes('overthinking')) {
    return 'Overthinking';
  }

  if (
    normalized.includes('kept taking') ||
    normalized.includes('taking up space') ||
    normalized.includes('stayed with me') ||
    normalized.includes('still sitting') ||
    normalized.includes('replay') ||
    normalized.includes('loop')
  ) {
    return normalized.includes('work') ? 'A work thought kept replaying' : 'Thought kept replaying';
  }

  if (
    normalized.includes('work') ||
    normalized.includes('job') ||
    normalized.includes('meeting') ||
    normalized.includes('email') ||
    normalized.includes('boss') ||
    normalized.includes('coworker')
  ) {
    return label === 'Context' ? 'Work' : 'Work thought';
  }

  const compactWords = raw
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (compactWords.length <= 3 && raw.length <= 34) {
    return toReadableNodeLabel(raw);
  }

  return toReadableNodeLabel(compactWords.slice(0, 3).join(' ')) || 'Not sure';
}

function getCompactSummaryOneLiner(text) {
  const cleaned = normalizeText(text).replace(/^[\s.。,:;]+/, '');
  const normalized = cleaned.toLowerCase();

  if (!cleaned) {
    return 'Here’s a gentle draft of this trace.';
  }

  if (
    normalized.includes('work') &&
    (normalized.includes('stayed') ||
      normalized.includes('present') ||
      normalized.includes('sitting') ||
      normalized.includes('lingering') ||
      normalized.includes('replay'))
  ) {
    return normalized.includes('calm')
      ? 'Calm, with a work thought still replaying.'
      : 'A work thought still replaying.';
  }

  if (cleaned.length <= 84) {
    return cleaned;
  }

  if (normalized.includes('work')) {
    return normalized.includes('calm')
      ? 'Calm, with a work thought still replaying.'
      : 'A work thought still replaying.';
  }

  if (normalized.includes('chest')) {
    return 'Your body noticed something worth naming.';
  }

  if (normalized.includes('wrong') || normalized.includes('fault')) {
    return 'A self-doubt loop showed up today.';
  }

  const sentence = cleaned.split(/[.!?。！？]/)[0] || cleaned;
  return `${sentence.slice(0, 72).trim()}...`;
}

async function extractTrace({ transcript, selectedMood, selectedBodySignals }) {
  const data = await callOpenAI('/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EXTRACTION_MODEL,
      input: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: JSON.stringify(getUserPayload({ transcript, selectedMood, selectedBodySignals })) },
      ],
      reasoning: { effort: 'none' },
      max_output_tokens: 900,
      text: {
        format: {
          type: 'json_schema',
          name: 'mood_trace_extraction',
          strict: true,
          schema: getExtractionSchema(),
        },
      },
    }),
  });

  const text = extractResponseOutputText(data);

  if (!text) {
    throw new Error('OpenAI extraction returned no output text.');
  }

  return JSON.parse(text);
}

function extractResponseOutputText(data) {
  if (typeof data.output_text === 'string') {
    return data.output_text;
  }

  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === 'string') {
        return content.text;
      }
    }
  }

  return '';
}

function sanitizeExtraction({ extracted, selectedMood, selectedBodySignals, transcript = '' }) {
  const bodySignalMap = new Map();
  const normalizedTranscript = normalizeText(transcript).toLowerCase();

  selectedBodySignals.forEach((label) => {
    const normalizedLabel = String(label || '').replace(/\n/g, ' ');
    const matchKey =
      BODY_SIGNAL_KEYS.find((key) => normalizedLabel.toLowerCase().includes(getPlainLabel(key).toLowerCase().split(' ')[0])) ||
      null;

    if (matchKey) {
      bodySignalMap.set(matchKey, { key: matchKey, value: getPlainLabel(matchKey) });
    }
  });

  for (const signal of extracted.body_signals || []) {
    if (BODY_SIGNAL_KEYS.includes(signal.key)) {
      bodySignalMap.set(signal.key, {
        key: signal.key,
        value: normalizeText(signal.value) || getPlainLabel(signal.key),
      });
    }
  }

  if (bodySignalMap.size === 0) {
    bodySignalMap.set('generic_body', { key: 'generic_body', value: 'Body signal' });
  }

  const bodySignals = Array.from(bodySignalMap.values()).slice(0, 3);
  const chain = [];

  for (const key of extracted.chain_keys || []) {
    if (TRACE_ICON_KEYS.includes(key) && !chain.includes(key)) {
      chain.push(key);
    }
  }

  if (!chain.some((key) => BODY_SIGNAL_KEYS.includes(key))) {
    chain.push(bodySignals[0].key);
  }

  const fields = [];

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

  for (const field of extracted.fields || []) {
    const label = getCompactFieldLabel(field);
    const value = getCompactFieldValue({
      label,
      type: field.type,
      value: field.value,
    });

    if (!label || !value) {
      continue;
    }

    if (selectedMood && field.type === 'feeling') {
      continue;
    }

    if (fields.some((existing) => existing.label.toLowerCase() === label.toLowerCase())) {
      continue;
    }

    fields.push({
      id: normalizeText(field.id).toLowerCase().replace(/[^a-z0-9]+/g, '-') || `field-${fields.length}`,
      type: field.type,
      label,
      value,
      source: field.source,
      confidence: field.confidence,
      userEditable: true,
    });
  }

  if (
    !fields.some((field) => field.label === 'Context') &&
    (normalizedTranscript.includes('work') ||
      normalizedTranscript.includes('job') ||
      normalizedTranscript.includes('meeting') ||
      normalizedTranscript.includes('email') ||
      normalizedTranscript.includes('boss') ||
      normalizedTranscript.includes('coworker'))
  ) {
    fields.push({
      id: 'context-work',
      type: 'trigger',
      label: 'Context',
      value: 'Work',
      source: 'transcript',
      confidence: 'medium',
      userEditable: true,
    });
  }

  if (!fields.some((field) => field.type === 'body')) {
    fields.push({
      id: 'body',
      type: 'body',
      label: 'Body signal',
      value: bodySignals.map((signal) => signal.value).join(', '),
      source: selectedBodySignals.length > 0 ? 'user_selected' : 'ai_inferred',
      confidence: selectedBodySignals.length > 0 ? 'high' : 'medium',
      userEditable: true,
    });
  }

  const hasWorkContext = fields.some(
    (field) => field.label === 'Context' && field.value.toLowerCase().includes('work'),
  );

  if (hasWorkContext) {
    fields.forEach((field) => {
      if (field.type === 'thought' && field.value === 'Thought kept replaying') {
        field.value = 'A work thought kept replaying';
      }
    });
  }

  return {
    language: extracted.language || 'unknown',
    warmReflectionText: normalizeText(extracted.warm_reflection_text),
    summaryOneLiner: getCompactSummaryOneLiner(extracted.summary_one_liner || extracted.warm_reflection_text),
    fields: fields.slice(0, 6),
    traceResult: {
      chain: chain.slice(0, 4),
      extraction: fields
        .filter((field) => field.type !== 'feeling')
        .map((field) => ({ label: field.label, value: field.value }))
        .slice(0, 5),
      bodySignals,
    },
    actionRoutingFeatures: extracted.action_routing_features,
  };
}

async function synthesizeWarmReflection(text) {
  if (!text) {
    return null;
  }

  const cacheKey = JSON.stringify({
    model: TTS_MODEL,
    voice: TTS_VOICE,
    speed: TTS_SPEED,
    responseFormat: TTS_RESPONSE_FORMAT,
    instructionsVersion: TTS_INSTRUCTIONS_VERSION,
    text,
  });
  const cachedAudio = ttsCache.get(cacheKey);

  if (cachedAudio) {
    return { ...cachedAudio, cached: true };
  }

  try {
    const arrayBuffer = await callOpenAI('/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: text,
        voice: TTS_VOICE,
        speed: TTS_SPEED,
        instructions: TTS_OPENING_INSTRUCTIONS,
        response_format: TTS_RESPONSE_FORMAT,
      }),
    });

    const audioPayload = {
      base64: Buffer.from(arrayBuffer).toString('base64'),
      mimeType: getTtsMimeType(TTS_RESPONSE_FORMAT),
      voice: TTS_VOICE,
      speed: TTS_SPEED,
      responseFormat: TTS_RESPONSE_FORMAT,
      cached: false,
    };

    rememberCachedTts(cacheKey, audioPayload);

    return audioPayload;
  } catch (error) {
    console.warn('[mood-ai] TTS failed:', error.message);
    return null;
  }
}

async function handleSpeak(request, response) {
  const body = await readJsonBody(request);
  const text = normalizeText(body.text || '');
  const startedAt = Date.now();

  console.log(`[mood-ai] speak:start textChars=${text.length}`);

  if (!text) {
    jsonResponse(response, 400, { error: 'text_required' });
    return;
  }

  if (text.length > 500) {
    jsonResponse(response, 400, { error: 'text_too_long' });
    return;
  }

  const ttsAudio = await synthesizeWarmReflection(text);

  if (!ttsAudio?.base64) {
    jsonResponse(response, 502, { error: 'tts_failed' });
    return;
  }

  console.log(
    `[mood-ai] speak:done provider=openai voice=${ttsAudio.voice} speed=${ttsAudio.speed} format=${ttsAudio.responseFormat} cached=${ttsAudio.cached ? 'yes' : 'no'} audio=yes durationMs=${Date.now() - startedAt}`,
  );

  jsonResponse(response, 200, {
    ttsAudio,
    doNotStore: {
      promptTextAfterSynthesis: true,
    },
  });
}

async function handleWeeklyReflection(request, response) {
  const body = await readJsonBody(request);
  const startedAt = Date.now();
  const fallbackPreview = body.localPreview || {};
  const weeklyFacts = body.weeklyFacts || fallbackPreview.weeklyFacts || null;
  const payload = {
    schemaVersion: WEEKLY_REFLECTION_SCHEMA_VERSION,
    task: 'write_weekly_reflection_card',
    instruction: 'Rewrite only. Use weeklyFacts as the only source of truth.',
    weeklyFacts,
    localPreview: fallbackPreview,
    traces: Array.isArray(body.traces) ? body.traces.slice(0, 14) : [],
    actionMemory: Array.isArray(body.actionMemory) ? body.actionMemory.slice(0, 20) : [],
    helpfulnessMemory: Array.isArray(body.helpfulnessMemory) ? body.helpfulnessMemory.slice(0, 20) : [],
  };

  console.log(
    `[mood-ai] weekly:start traces=${weeklyFacts?.traceCount ?? payload.traces.length} actions=${weeklyFacts?.completedActionCount ?? payload.actionMemory.length}`,
  );

  if (!payload.traces.length && !payload.actionMemory.length) {
    jsonResponse(response, 200, {
      schemaVersion: WEEKLY_REFLECTION_SCHEMA_VERSION,
      provider: 'local',
      generatedAt: new Date().toISOString(),
      ...fallbackPreview,
      doNotStore: {
        modelReasoning: true,
      },
    });
    return;
  }

  const extracted = await generateWeeklyReflectionSummary({ payload });
  const sanitized = sanitizeWeeklyReflectionSummary({ extracted, fallbackPreview });

  console.log(
    `[mood-ai] weekly:done provider=openai durationMs=${Date.now() - startedAt}`,
  );

  jsonResponse(response, 200, {
    schemaVersion: WEEKLY_REFLECTION_SCHEMA_VERSION,
    provider: 'openai',
    generatedAt: new Date().toISOString(),
    ...sanitized,
    paidPlan: fallbackPreview.paidPlan || {
      label: 'Deeper reflection',
      note: 'Unlock the full weekly pattern, early cues, and what helped.',
    },
    doNotStore: {
      modelReasoning: true,
      rawTranscripts: true,
    },
  });
}

async function handleReflect(request, response) {
  const body = await readJsonBody(request);
  const selectedMood = body.selectedMood || null;
  const selectedBodySignals = Array.isArray(body.selectedBodySignals) ? body.selectedBodySignals : [];
  const startedAt = Date.now();
  const hadAudio = Boolean(body.audioBase64);

  console.log(
    `[mood-ai] reflect:start mode=${body.inputMode || 'unknown'} audio=${hadAudio ? 'yes' : 'no'} wantsVoice=${
      body.wantsVoiceReply ? 'yes' : 'no'
    }`,
  );

  const transcribedText = await transcribeAudio({
    audioBase64: body.audioBase64 || null,
    audioMimeType: body.audioMimeType || null,
  });
  const transcript = normalizeText(transcribedText || body.transcript || '');

  if (!transcript) {
    jsonResponse(response, 400, { error: 'transcript_or_audio_required' });
    return;
  }

  const moderation = await moderateTranscript(transcript);
  const extracted = await extractTrace({
    transcript,
    selectedMood,
    selectedBodySignals,
  });
  const sanitized = sanitizeExtraction({ extracted, selectedMood, selectedBodySignals, transcript });
  const safety = assessMoodSafety({
    transcript,
    selectedBodySignalLabels: selectedBodySignals,
    bodySignals: sanitized.traceResult.bodySignals,
    moderation,
  });
  const warmReflectionText = safety.level === 'high' || safety.level === 'urgent_medical'
    ? ''
    : sanitized.warmReflectionText;
  const ttsAudio = body.wantsVoiceReply && warmReflectionText
    ? await synthesizeWarmReflection(warmReflectionText)
    : null;

  console.log(
    `[mood-ai] reflect:done provider=openai transcriptChars=${transcript.length} safety=${safety.level} fields=${
      sanitized.fields.length
    } tts=${ttsAudio?.base64 ? 'yes' : 'no'} durationMs=${Date.now() - startedAt}`,
  );

  jsonResponse(response, 200, {
    schemaVersion: 'mood_ai_trace_extraction_v1',
    requestId: makeRequestId(),
    provider: 'openai',
    language: sanitized.language || getLanguage(transcript),
    transcript: {
      rawText: transcript,
      cleanedText: transcript,
      confidence: transcribedText ? 'high' : 'medium',
    },
    warmReflection: {
      text: warmReflectionText,
      shouldShow: Boolean(warmReflectionText),
    },
    traceDraft: {
      summaryOneLiner: sanitized.summaryOneLiner,
      fields: sanitized.fields,
    },
    traceResult: sanitized.traceResult,
    actionRoutingFeatures: sanitized.actionRoutingFeatures,
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
      base64: ttsAudio?.base64 || null,
      mimeType: ttsAudio?.mimeType || null,
      voice: ttsAudio?.voice || null,
    },
  });
}

async function handleTranscribe(request, response) {
  const body = await readJsonBody(request);
  const startedAt = Date.now();
  const hadAudio = Boolean(body.audioBase64);

  console.log(`[mood-ai] transcribe:start audio=${hadAudio ? 'yes' : 'no'}`);

  if (!hadAudio) {
    jsonResponse(response, 400, { error: 'audio_required' });
    return;
  }

  const transcript = await transcribeAudio({
    audioBase64: body.audioBase64 || null,
    audioMimeType: body.audioMimeType || null,
  });

  console.log(
    `[mood-ai] transcribe:done transcriptChars=${transcript.length} durationMs=${Date.now() - startedAt}`,
  );

  jsonResponse(response, 200, {
    transcript,
    confidence: transcript.length > 0 ? 'high' : 'low',
    doNotStore: {
      rawAudioAfterTranscription: true,
    },
  });
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') {
      jsonResponse(response, 204, {});
      return;
    }

    if (request.method === 'GET' && request.url === '/health') {
      jsonResponse(response, 200, {
        ok: true,
        hasOpenAiKey: Boolean(OPENAI_API_KEY),
        models: {
          stt: STT_MODEL,
          extraction: EXTRACTION_MODEL,
          weeklySummary: EXTRACTION_MODEL,
          moderation: MODERATION_MODEL,
          tts: TTS_MODEL,
          voice: TTS_VOICE,
          ttsSpeed: TTS_SPEED,
          ttsResponseFormat: TTS_RESPONSE_FORMAT,
          ttsInstructionsVersion: TTS_INSTRUCTIONS_VERSION,
        },
      });
      return;
    }

    if (request.method === 'POST' && request.url === '/api/mood-ai/reflect') {
      await handleReflect(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === '/api/mood-ai/weekly-reflection') {
      await handleWeeklyReflection(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === '/api/mood-ai/transcribe') {
      await handleTranscribe(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === '/api/mood-ai/speak') {
      await handleSpeak(request, response);
      return;
    }

    jsonResponse(response, 404, { error: 'not_found' });
  } catch (error) {
    console.error('[mood-ai] request failed:', error.message);
    jsonResponse(response, 500, { error: 'mood_ai_failed', message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Rora server listening on http://localhost:${PORT}`);
  console.log(`Models: STT=${STT_MODEL}, extraction=${EXTRACTION_MODEL}, moderation=${MODERATION_MODEL}, TTS=${TTS_MODEL}`);
});
