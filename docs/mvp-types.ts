export const CURRENT_SCHEMA_VERSION = 1;

export type Locale = 'en-US' | 'zh-CN';

export type CheckInSource = 'voice' | 'text';

export type DraftStatus =
  | 'recording'
  | 'transcribing'
  | 'transcribe_failed'
  | 'analyzing'
  | 'analysis_failed'
  | 'ready_for_review'
  | 'editing'
  | 'safety_hold'
  | 'saving'
  | 'saved'
  | 'discarded';

export type RecordingStatus = 'recording' | 'transcribing' | 'failed' | 'complete';

export type TranscriptReviewStatus = 'pending' | 'confirmed' | 'edited' | 'rejected';

export type ConfidenceLabel = 'strong_signal' | 'possible_pattern' | 'needs_more_entries';

export type PatternFeedbackRating = 'feels_right' | 'not_quite' | 'wrong';

export type MicroActionStatus = 'offered' | 'started' | 'completed' | 'skipped';

export type MicroActionHelpfulness = 'helped' | 'helped_a_little' | 'did_not_help' | 'unsure';

export type MicroActionEffort = 'easy' | 'okay' | 'too_much';

export type IntensityLevel = 'light' | 'medium' | 'strong';

export type ChainNodeKind = 'context' | 'trigger' | 'thought' | 'emotion' | 'body' | 'behavior';

export type ChainKey = string;

export type RiskLevel = 'low' | 'medium' | 'high' | 'urgent_medical';

export type SafetySupport = 'none' | 'gentle_note' | 'resources_panel' | 'medical_note';

export type Trend = 'rising' | 'stable' | 'falling' | 'insufficient_data';

export interface Versioned {
  schemaVersion: number;
}

export interface UserPrivacyState extends Versioned {
  localModeEnabled: boolean;
  cloudSyncEnabled: boolean;
  saveRawAudioEnabled: boolean;
  allowModelImprovement: boolean;
  aiProcessingEnabled: boolean;
  transcriptRetentionDays: number | null;
  dataRetentionDays: number | null;
  exportRequestedAt: string | null;
  deleteRequestedAt: string | null;
  locale: Locale;
}

export interface RecordingSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  status: RecordingStatus;
  transcriptionProvider: 'mock' | 'openai' | 'apple' | 'other';
  audioStorage: 'ephemeral' | 'saved_by_user';
  localAudioUri: string | null;
}

export interface TranscriptReview {
  originalText: string;
  editedText: string | null;
  language: Locale;
  confidence: number;
  reviewStatus: TranscriptReviewStatus;
  confirmedAt: string | null;
}

export interface PatternSignal {
  id: string;
  key: string;
  label: string;
  confidence: number;
  evidenceText?: string;
}

export interface ChainNode {
  kind: ChainNodeKind;
  key: string;
  label: string;
  confidence: number;
}

export type PatternChain = ChainNode[];

export interface RiskAssessment {
  level: RiskLevel;
  signalKeys: string[];
  confidence: number;
  assessedAt: string;
}

export interface SafetyDirective {
  showPatternCard: boolean;
  recommendAction: boolean;
  support: SafetySupport;
  allowSave: true;
}

export const SAFETY_DIRECTIVES: Record<RiskLevel, SafetyDirective> = {
  low: {
    showPatternCard: true,
    recommendAction: true,
    support: 'none',
    allowSave: true,
  },
  medium: {
    showPatternCard: true,
    recommendAction: true,
    support: 'gentle_note',
    allowSave: true,
  },
  high: {
    showPatternCard: false,
    recommendAction: false,
    support: 'resources_panel',
    allowSave: true,
  },
  urgent_medical: {
    showPatternCard: false,
    recommendAction: false,
    support: 'medical_note',
    allowSave: true,
  },
};

export const DRAFT_TRANSITIONS: Record<DraftStatus, DraftStatus[]> = {
  recording: ['transcribing', 'discarded'],
  transcribing: ['analyzing', 'transcribe_failed', 'discarded'],
  transcribe_failed: ['transcribing', 'analyzing', 'discarded'],
  analyzing: ['ready_for_review', 'analysis_failed', 'safety_hold', 'discarded'],
  analysis_failed: ['analyzing', 'saving', 'discarded'],
  ready_for_review: ['editing', 'saving', 'discarded'],
  editing: ['ready_for_review', 'saving', 'discarded'],
  safety_hold: ['saving', 'discarded'],
  saving: ['saved', 'ready_for_review'],
  saved: [],
  discarded: [],
};

export interface DraftError {
  stage: 'transcribe' | 'analyze' | 'save';
  code: 'network' | 'timeout' | 'parse' | 'permission' | 'unknown';
  retryCount: number;
  occurredAt: string;
}

export interface PatternAnalysis extends Versioned {
  id: string;
  checkInDraftId: string;
  checkInId: string | null;
  model: string;
  analyzedAt: string;
  inputText: string;
  emotions: PatternSignal[];
  bodySignals: PatternSignal[];
  triggers: PatternSignal[];
  thoughtPatterns: PatternSignal[];
  behaviors: PatternSignal[];
  sleepSignals: PatternSignal[];
  intensity: IntensityLevel;
  confidence: number;
  evidence: string[];
  riskAssessment: RiskAssessment;
  possiblePatternChain: PatternChain;
}

export interface UserPatternFeedback extends Versioned {
  patternCardId: string;
  checkInId: string | null;
  rating: PatternFeedbackRating;
  correctedChain: PatternChain | null;
  notes: string | null;
  createdAt: string;
}

export interface PatternCard extends Versioned {
  id: string;
  chainKey: ChainKey;
  sourceCheckInIds: string[];
  title: string;
  summary: string;
  chain: PatternChain;
  whyWeThinkThis: string[];
  confidenceLabel: ConfidenceLabel;
  similarPastCheckInIds: string[];
  microActionId: string | null;
  feedback: UserPatternFeedback | null;
}

export interface MicroAction extends Versioned {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  steps: string[];
  bestForPatternTypes: string[];
  contraindicationSignalKeys: string[];
}

export interface MicroActionRecommendation extends Versioned {
  id: string;
  checkInId: string | null;
  patternCardId: string;
  actionId: string;
  reason: string;
  estimatedMinutes: number;
  status: MicroActionStatus;
  createdAt: string;
}

export interface MicroActionCompletion extends Versioned {
  recommendationId: string;
  actionId: string;
  completedAt: string;
  helpfulness: MicroActionHelpfulness;
  effort: MicroActionEffort;
  notes: string | null;
}

export interface CheckInDraft extends Versioned {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: DraftStatus;
  source: CheckInSource;
  recordingSessionId: string | null;
  localAudioUri: string | null;
  transcriptReview: TranscriptReview | null;
  patternAnalysis: PatternAnalysis | null;
  patternCard: PatternCard | null;
  recommendedAction: MicroActionRecommendation | null;
  riskAssessment: RiskAssessment | null;
  lastError: DraftError | null;
  privacySnapshot: UserPrivacyState;
}

export interface SavedCheckIn extends Versioned {
  id: string;
  createdAt: string;
  savedAt: string;
  source: CheckInSource;
  finalText: string;
  transcriptReview: TranscriptReview;
  patternAnalysis: PatternAnalysis | null;
  patternCard: PatternCard | null;
  recommendedAction: MicroActionRecommendation | null;
  riskAssessment: RiskAssessment;
  privacySnapshot: UserPrivacyState;
}

export interface PatternChainStats extends Versioned {
  chainKey: ChainKey;
  chain: PatternChain;
  windowStart: string;
  windowEnd: string;
  occurrenceCount: number;
  sourceCheckInIds: string[];
  lastSeenAt: string;
  topTriggers: Array<{ key: string; count: number }>;
  topBodySignals: Array<{ key: string; count: number }>;
  intensityBreakdown: Record<IntensityLevel, number>;
  feedbackSummary: {
    feelsRight: number;
    notQuite: number;
    wrong: number;
  };
  actionEffectiveness: Array<{
    microActionId: string;
    timesCompleted: number;
    averageHelpfulness: number;
  }>;
  trend: Trend;
  computedAt: string;
}

export interface WeeklyReportLoop extends Versioned {
  chainKey: ChainKey;
  title: string;
  chain: PatternChain;
  occurrenceCount: number;
  sourceCheckInIds: string[];
}

export interface WeeklyReport extends Versioned {
  id: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  status: 'ready' | 'not_enough_data';
  mainLoops: WeeklyReportLoop[];
  topBodySignals: PatternSignal[];
  topTriggers: PatternSignal[];
  actionsThatHelped: MicroActionCompletion[];
  nextWeekFocus: string | null;
  sourceCheckInIds: string[];
}

export interface DraftSaveGuardResult {
  canSave: boolean;
  reasons: Array<
    | 'transcript_not_reviewed'
    | 'draft_discarded'
    | 'draft_is_recording'
    | 'draft_is_processing'
    | 'save_in_progress'
  >;
}

export function getFinalTranscriptText(review: TranscriptReview): string {
  return review.editedText?.trim() || review.originalText.trim();
}

export function toChainKey(chain: PatternChain): ChainKey {
  return chain.map((node) => node.key).join('>');
}

export function getSafetyDirective(riskAssessment: RiskAssessment): SafetyDirective {
  return SAFETY_DIRECTIVES[riskAssessment.level];
}

export function isValidDraftTransition(from: DraftStatus, to: DraftStatus): boolean {
  return DRAFT_TRANSITIONS[from].includes(to);
}

export function canSaveDraft(draft: CheckInDraft): DraftSaveGuardResult {
  const reasons: DraftSaveGuardResult['reasons'] = [];

  if (draft.status === 'discarded') {
    reasons.push('draft_discarded');
  }

  if (['recording'].includes(draft.status)) {
    reasons.push('draft_is_recording');
  }

  if (['transcribing', 'analyzing'].includes(draft.status)) {
    reasons.push('draft_is_processing');
  }

  if (draft.status === 'saving') {
    reasons.push('save_in_progress');
  }

  if (
    !draft.transcriptReview ||
    !['confirmed', 'edited'].includes(draft.transcriptReview.reviewStatus)
  ) {
    reasons.push('transcript_not_reviewed');
  }

  return {
    canSave: reasons.length === 0,
    reasons,
  };
}
