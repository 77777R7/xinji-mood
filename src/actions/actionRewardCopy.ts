import type {
  ActionRewardStamp,
  ActionWeeklyReflectionRole,
} from './actionLibrary';

type ActionRewardHelpfulnessSignal = 'helped' | 'helped_a_little' | 'did_not_help' | 'too_much';
type ActionRewardLearningStatus =
  | 'no_action_tried'
  | 'helped'
  | 'helped_a_little'
  | 'not_today'
  | 'too_much'
  | 'mixed';

export type ActionRewardCompletionCopy = {
  badge: string;
  headline: string;
  body: string;
  memoryLine: string;
};

export type WeeklyActionInsightCopy = {
  headline: string;
  summary: string;
  bottomRowLabel: string;
  bottomRowDetail: string;
};

type RewardStampCopy = {
  badge: string;
  helpedHeadline: string;
  helpedALittleHeadline: string;
  didNotHelpHeadline: string;
  tooMuchHeadline: string;
  positiveBody: string;
  didNotHelpBody: string;
  tooMuchBody: string;
};

type WeeklyRoleCopy = {
  headline: string;
  summary: (context: WeeklyActionInsightContext) => string;
  bottomRowDetail: (context: WeeklyActionInsightContext) => string;
};

export type WeeklyActionInsightContext = {
  role: ActionWeeklyReflectionRole | null;
  rewardStamp: ActionRewardStamp | null;
  actionTitle: string;
  threadText: string;
  bodyCue: string | null;
  outcomeLabel: string | null;
  status: ActionRewardLearningStatus;
};

export const rewardStampCopy: Record<ActionRewardStamp, RewardStampCopy> = {
  softened: {
    badge: 'Softened',
    helpedHeadline: 'That cue felt a little easier to hold.',
    helpedALittleHeadline: 'A small softening is worth remembering.',
    didNotHelpHeadline: 'This may not be the right body step yet.',
    tooMuchHeadline: 'That asked more than your body had today.',
    positiveBody: 'Rora can remember this as a gentle body-first helper.',
    didNotHelpBody: 'Rora learned to keep watching for a better fit.',
    tooMuchBody: 'Rora can start with just naming the cue next time.',
  },
  sorted: {
    badge: 'Sorted',
    helpedHeadline: 'The thought got a little more sorted.',
    helpedALittleHeadline: 'Some of the thought became easier to separate.',
    didNotHelpHeadline: 'Sorting may not fit this moment yet.',
    tooMuchHeadline: 'Sorting asked too much of this thread today.',
    positiveBody: 'Rora can remember that separating the pieces helped.',
    didNotHelpBody: 'Rora learned this thread may need a different entry point.',
    tooMuchBody: 'Rora can keep the next step smaller and less mental.',
  },
  named_it: {
    badge: 'Named',
    helpedHeadline: 'The loop has a name now.',
    helpedALittleHeadline: 'Naming it made the pattern a little easier to see.',
    didNotHelpHeadline: 'This name may not fit yet.',
    tooMuchHeadline: 'Naming even this much was enough for today.',
    positiveBody: 'Rora can remember this label as a way back into the pattern.',
    didNotHelpBody: 'Rora learned to leave room for a better name later.',
    tooMuchBody: 'Rora can keep this as a tiny noticing step, not a task.',
  },
  noticed: {
    badge: 'Noticed',
    helpedHeadline: 'The next step became small enough to notice.',
    helpedALittleHeadline: 'A tiny next step started to appear.',
    didNotHelpHeadline: 'This next step may still be too far away.',
    tooMuchHeadline: 'Even a tiny step felt like too much today.',
    positiveBody: 'Rora can remember that shrinking the move helped.',
    didNotHelpBody: 'Rora learned this thread may need more room before action.',
    tooMuchBody: 'Rora can move back to noticing before asking for action.',
  },
  parked: {
    badge: 'Parked',
    helpedHeadline: 'The thought found somewhere to wait.',
    helpedALittleHeadline: 'Part of the thought felt a little more parked.',
    didNotHelpHeadline: 'Parking it may not be enough tonight.',
    tooMuchHeadline: 'Parking the thought asked too much today.',
    positiveBody: 'Rora can remember this as an evening release helper.',
    didNotHelpBody: 'Rora learned this thread may need another kind of support.',
    tooMuchBody: 'Rora can keep evening steps shorter next time.',
  },
  kind_shift: {
    badge: 'Kinder',
    helpedHeadline: 'The self-talk got a little kinder.',
    helpedALittleHeadline: 'A softer sentence showed up.',
    didNotHelpHeadline: 'A kinder sentence may not feel reachable yet.',
    tooMuchHeadline: 'Reframing asked too much today.',
    positiveBody: 'Rora can remember this gentler line as useful evidence.',
    didNotHelpBody: 'Rora learned not to force kindness before it feels honest.',
    tooMuchBody: 'Rora can start by naming what showed up, without reframing it.',
  },
};

export const weeklyRoleCopy: Record<ActionWeeklyReflectionRole, WeeklyRoleCopy> = {
  early_cue_practice: {
    headline: 'You caught the signal earlier.',
    summary: ({ actionTitle, bodyCue, threadText }) =>
      `${threadText}, but ${actionTitle} gave Rora a small clue: ${bodyCue || 'your body signal'} may be where this loop first shows up.`,
    bottomRowDetail: ({ bodyCue }) =>
      bodyCue
        ? `Rora can keep this close for the next time ${bodyCue} appears.`
        : 'Rora can keep this close for the next early cue.',
  },
  thought_sorting: {
    headline: 'The thought got easier to separate.',
    summary: ({ actionTitle, threadText }) =>
      `${threadText}, but ${actionTitle} helped split the thread into smaller pieces Rora can remember.`,
    bottomRowDetail: () => 'Rora can suggest this when facts and worries start blending again.',
  },
  loop_labeling: {
    headline: 'The loop has a name now.',
    summary: ({ actionTitle, threadText }) =>
      `${threadText}, but ${actionTitle} made the pattern easier to point to without solving it all at once.`,
    bottomRowDetail: () => 'Rora can use this name as the first light step next time.',
  },
  behavioral_nudge: {
    headline: 'The next move got smaller.',
    summary: ({ actionTitle, threadText }) =>
      `${threadText}, but ${actionTitle} helped shrink the next moment into something easier to start.`,
    bottomRowDetail: () => 'Rora can bring this back when thinking needs one tiny move.',
  },
  evening_release: {
    headline: 'Something unfinished found a place to wait.',
    summary: ({ actionTitle, threadText }) =>
      `${threadText}, but ${actionTitle} gave the unfinished part somewhere to sit for now.`,
    bottomRowDetail: () => 'Rora can keep this as a nighttime release option.',
  },
  self_compassion: {
    headline: 'The self-talk softened a little.',
    summary: ({ actionTitle, threadText }) =>
      `${threadText}, but ${actionTitle} helped keep the truth without turning it into punishment.`,
    bottomRowDetail: () => 'Rora can remember this when the thread gets harsh.',
  },
};

function getFallbackRewardStampCopy(): RewardStampCopy {
  return rewardStampCopy.noticed;
}

function getFallbackWeeklyRoleCopy(): WeeklyRoleCopy {
  return weeklyRoleCopy.loop_labeling;
}

export function getActionRewardCompletionCopy({
  rewardStamp,
  helpfulness,
}: {
  rewardStamp: ActionRewardStamp | null;
  helpfulness: ActionRewardHelpfulnessSignal;
}): ActionRewardCompletionCopy {
  const copy = rewardStamp ? rewardStampCopy[rewardStamp] : getFallbackRewardStampCopy();

  if (helpfulness === 'helped') {
    return {
      badge: copy.badge,
      headline: copy.helpedHeadline,
      body: copy.positiveBody,
      memoryLine: 'Rora will remember this as a helpful action note.',
    };
  }

  if (helpfulness === 'helped_a_little') {
    return {
      badge: copy.badge,
      headline: copy.helpedALittleHeadline,
      body: copy.positiveBody,
      memoryLine: 'Rora will remember this small shift.',
    };
  }

  if (helpfulness === 'too_much') {
    return {
      badge: 'Lighter next time',
      headline: copy.tooMuchHeadline,
      body: copy.tooMuchBody,
      memoryLine: 'Rora will keep the next suggestion lighter.',
    };
  }

  return {
    badge: 'Still learning',
    headline: copy.didNotHelpHeadline,
    body: copy.didNotHelpBody,
    memoryLine: 'Rora will keep looking for a better fit.',
  };
}

export function getWeeklyActionInsightCopy(context: WeeklyActionInsightContext): WeeklyActionInsightCopy {
  if (context.status === 'too_much') {
    return {
      headline: 'This needs a lighter step.',
      summary: `${context.threadText}, and one action felt like too much. Rora can keep the next step smaller.`,
      bottomRowLabel: 'Worth adjusting',
      bottomRowDetail: 'Rora can make this lighter next time.',
    };
  }

  if (context.status === 'not_today' || context.status === 'mixed') {
    return {
      headline: 'Rora is still learning what fits.',
      summary: `${context.threadText}, and Rora is still learning which action feels light enough.`,
      bottomRowLabel: 'Rora is still learning',
      bottomRowDetail: 'One lighter step may fit better.',
    };
  }

  const roleCopy = context.role ? weeklyRoleCopy[context.role] : getFallbackWeeklyRoleCopy();

  return {
    headline: roleCopy.headline,
    summary: roleCopy.summary(context),
    bottomRowLabel: 'Worth remembering',
    bottomRowDetail: roleCopy.bottomRowDetail(context),
  };
}
