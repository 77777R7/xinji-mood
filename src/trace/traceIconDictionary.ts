import type { BodySignalSelection, TraceIconItem, TraceIconKey } from './types';

const traceIconAssets = {
  workFeedback: require('../../assets/figma/today/trace-icons-v1/trace-work-feedback.png'),
  selfBlame: require('../../assets/figma/today/trace-icons-v1/trace-self-blame.png'),
  overthinking: require('../../assets/figma/today/trace-icons-v1/trace-overthinking.png'),
  stomachTightness: require('../../assets/figma/today/trace-icons-v1/trace-stomach-tightness.png'),
  chestTightness: require('../../assets/figma/today/trace-icons-v1/trace-chest-tightness.png'),
  neckShoulderTension: require('../../assets/figma/today/trace-icons-v1/trace-neck-shoulder-tension.png'),
  tiredHeavy: require('../../assets/figma/today/trace-icons-v1/trace-tired-heavy.png'),
  shortSleep: require('../../assets/figma/today/trace-icons-v1/trace-short-sleep.png'),
  headPressure: require('../../assets/figma/today/trace-icons-v1/trace-head-pressure.png'),
  relationshipReplay: require('../../assets/figma/today/trace-icons-v1/trace-relationship-replay.png'),
  phoneScrolling: require('../../assets/figma/today/trace-icons-v1/trace-phone-scrolling.png'),
  genericTrigger: require('../../assets/figma/today/trace-icons-v1/trace-generic-trigger.png'),
  genericBody: require('../../assets/figma/today/trace-icons-v1/trace-generic-body.png'),
};

export const traceIconDictionary: Record<TraceIconKey, TraceIconItem> = {
  work_feedback: { label: 'Work\nfeedback', image: traceIconAssets.workFeedback },
  self_blame: { label: 'Self-\nblame', image: traceIconAssets.selfBlame },
  overthinking: { label: 'Overthinking', image: traceIconAssets.overthinking },
  stomach_tightness: {
    label: 'Stomach\ntightness',
    image: traceIconAssets.stomachTightness,
  },
  chest_tightness: {
    label: 'Chest\ntightness',
    image: traceIconAssets.chestTightness,
  },
  neck_shoulder_tension: {
    label: 'Neck /\nshoulder',
    image: traceIconAssets.neckShoulderTension,
  },
  tired_heavy: {
    label: 'Tired /\nheavy',
    image: traceIconAssets.tiredHeavy,
  },
  short_sleep: { label: 'Short\nsleep', image: traceIconAssets.shortSleep },
  head_pressure: { label: 'Head\npressure', image: traceIconAssets.headPressure },
  relationship_replay: {
    label: 'Relationship\nreplay',
    image: traceIconAssets.relationshipReplay,
  },
  phone_scrolling: {
    label: 'Phone\nscrolling',
    image: traceIconAssets.phoneScrolling,
  },
  generic_body: {
    label: 'Body\nsignal',
    image: traceIconAssets.genericBody,
  },
  stress_pressure: {
    label: 'Stress\npressure',
    image: traceIconAssets.genericTrigger,
  },
};

export const bodySignalByLabel: Record<string, BodySignalSelection> = {
  'Stomach\ntightness': { key: 'stomach_tightness', value: 'Stomach tightness' },
  'Chest tightness': { key: 'chest_tightness', value: 'Chest tightness' },
  'Head pressure': { key: 'head_pressure', value: 'Head pressure' },
  'Neck / shoulder\ntension': {
    key: 'neck_shoulder_tension',
    value: 'Neck / shoulder tension',
  },
  'Tired / heavy': { key: 'tired_heavy', value: 'Tired / heavy' },
  'Not sure': { key: 'generic_body', value: 'Not sure yet' },
};
