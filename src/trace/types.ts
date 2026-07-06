import type { ImageSourcePropType } from 'react-native';

export type TraceIconKey =
  | 'work_feedback'
  | 'self_blame'
  | 'overthinking'
  | 'stomach_tightness'
  | 'chest_tightness'
  | 'neck_shoulder_tension'
  | 'tired_heavy'
  | 'short_sleep'
  | 'head_pressure'
  | 'relationship_replay'
  | 'phone_scrolling'
  | 'generic_body'
  | 'stress_pressure';

export type TraceChain = TraceIconKey[];

export type TraceIconItem = {
  label: string;
  image: ImageSourcePropType;
};

export type NoticingState = 'starting_focus' | 'today_trace' | 'trace_echo';

export type NoticingContent = {
  badge: string;
  title: string;
  chain: TraceChain;
  note: string;
};

export type TraceExtraction = {
  label: string;
  value: string;
};

export type BodySignalSelection = {
  key: TraceIconKey;
  value: string;
};

export type MockTraceResult = {
  chain: TraceChain;
  extraction: TraceExtraction[];
  bodySignals: BodySignalSelection[];
};
