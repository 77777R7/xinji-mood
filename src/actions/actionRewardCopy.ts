import type {
  ActionRewardStamp,
  ActionWeeklyReflectionRole,
} from './actionLibrary';

type ActionRewardHelpfulnessSignal = 'helped' | 'helped_a_little' | 'did_not_help' | 'too_much';
type ActionRewardCompletionStatus = 'completed' | 'skipped';
type ActionRewardEffortSignal = 'easy' | 'okay' | 'too_much';
type ActionRewardSkipReason = 'not_today' | 'not_relevant' | 'no_time';
type ActionRewardLearningStatus =
  | 'no_action_tried'
  | 'helped'
  | 'helped_a_little'
  | 'did_not_help'
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
    helpedHeadline: 'You tried a body-first step.',
    helpedALittleHeadline: 'You noticed a small body signal.',
    didNotHelpHeadline: 'Rora learned this body step may not fit.',
    tooMuchHeadline: 'That asked more than your body had today.',
    positiveBody: 'Rora will remember the attempt, not expect a perfect result.',
    didNotHelpBody: 'This is useful feedback, not a failed attempt.',
    tooMuchBody: 'Rora can start with just naming the cue next time.',
  },
  sorted: {
    badge: 'Sorted',
    helpedHeadline: 'You tried separating the pieces.',
    helpedALittleHeadline: 'You noticed what was possible to sort.',
    didNotHelpHeadline: 'Rora learned sorting may not fit this moment.',
    tooMuchHeadline: 'Sorting asked too much of this thread today.',
    positiveBody: 'Rora can remember that this was worth trying for this thread.',
    didNotHelpBody: 'This helps future suggestions start from a different entry point.',
    tooMuchBody: 'Rora can keep the next step smaller and less mental.',
  },
  named_it: {
    badge: 'Named',
    helpedHeadline: 'You gave the loop a name.',
    helpedALittleHeadline: 'You noticed enough to name a piece of it.',
    didNotHelpHeadline: 'Rora learned this name may not fit yet.',
    tooMuchHeadline: 'Naming even this much was enough for today.',
    positiveBody: 'Rora can keep the label lightly, as a way back into the pattern.',
    didNotHelpBody: 'Leaving room for a better name is still useful data.',
    tooMuchBody: 'Rora can keep this as a tiny noticing step, not a task.',
  },
  noticed: {
    badge: 'Noticed',
    helpedHeadline: 'You tried one tiny step.',
    helpedALittleHeadline: 'You noticed what a tiny step felt like.',
    didNotHelpHeadline: 'Rora learned this step may be too far away.',
    tooMuchHeadline: 'Even a tiny step felt like too much today.',
    positiveBody: 'Rora can remember the attempt without turning it into pressure.',
    didNotHelpBody: 'This thread may need more room before action.',
    tooMuchBody: 'Rora can move back to noticing before asking for action.',
  },
  parked: {
    badge: 'Parked',
    helpedHeadline: 'You tried giving the thought a place to wait.',
    helpedALittleHeadline: 'You noticed what could be parked for now.',
    didNotHelpHeadline: 'Rora learned parking it may not be enough tonight.',
    tooMuchHeadline: 'Parking the thought asked too much today.',
    positiveBody: 'Rora can remember this as an option, not a requirement.',
    didNotHelpBody: 'This helps Rora look for another kind of support.',
    tooMuchBody: 'Rora can keep evening steps shorter next time.',
  },
  kind_shift: {
    badge: 'Kinder',
    helpedHeadline: 'You tried a kinder sentence.',
    helpedALittleHeadline: 'You noticed what kindness could reach today.',
    didNotHelpHeadline: 'Rora learned kindness may not feel reachable yet.',
    tooMuchHeadline: 'Reframing asked too much today.',
    positiveBody: 'Rora can remember this gently, without forcing it next time.',
    didNotHelpBody: 'This is useful feedback about what feels honest.',
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
  completionStatus = 'completed',
  helpfulness,
  effort,
  skipReason,
}: {
  rewardStamp: ActionRewardStamp | null;
  completionStatus?: ActionRewardCompletionStatus;
  helpfulness?: ActionRewardHelpfulnessSignal | null;
  effort?: ActionRewardEffortSignal | null;
  skipReason?: ActionRewardSkipReason | null;
}): ActionRewardCompletionCopy {
  const copy = rewardStamp ? rewardStampCopy[rewardStamp] : getFallbackRewardStampCopy();

  if (completionStatus === 'skipped' || skipReason) {
    return {
      badge: 'Saved gently',
      headline: 'Not today is useful feedback.',
      body: 'Rora learned this moment needed less demand, not more effort.',
      memoryLine: 'This helps future suggestions stay gentler.',
    };
  }

  if (helpfulness === 'helped') {
    return {
      badge: copy.badge,
      headline: copy.helpedHeadline,
      body: copy.positiveBody,
      memoryLine: 'This helps Rora learn what can fit.',
    };
  }

  if (helpfulness === 'helped_a_little') {
    return {
      badge: copy.badge,
      headline: copy.helpedALittleHeadline,
      body: copy.positiveBody,
      memoryLine: 'Small feedback is enough for Rora to learn from.',
    };
  }

  if (effort === 'too_much' || helpfulness === 'too_much') {
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
    memoryLine: 'This helps future recommendations get more precise.',
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

  if (context.status === 'not_today' || context.status === 'did_not_help' || context.status === 'mixed') {
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
