import type {
  ActionMemoryEntry,
  HelpfulnessMemory,
  MoodTraceRecord,
  SafetyLevel,
  TraceActionRoutingFeatures,
} from '../trace/dataFoundation';
import { getTraceIconPlainLabel } from '../trace/dataFoundation';
import {
  actionDefinitions,
  fallbackActionId,
  getActionDefinition,
  isActionId,
  type ActionBurdenLevel,
  type ActionDefinition,
  type ActionId,
  type ActionPrimaryNeed,
  type ActionRecommendationSource,
  type ActionStageFit,
  type RecommendedAction,
} from './actionLibrary';

type ActionRecommendationContext = {
  traceRecord: MoodTraceRecord | null;
  actionMemoryEntries: ActionMemoryEntry[];
  helpfulnessMemories: HelpfulnessMemory[];
  loopIsVisible?: boolean;
  loopEvidenceLine?: string;
};

type ActionEligibilityContext = {
  stage: ActionStageFit;
  safetyLevel: SafetyLevel;
  recentHelpfulness?: ActionMemoryEntry['helpfulness'] | null;
};

const burdenRank: Record<ActionBurdenLevel, number> = {
  very_low: 0,
  low: 1,
  medium: 2,
};

function getEarlyBodySignalLabel(traceRecord: MoodTraceRecord | null) {
  const bodyKey = traceRecord?.loopSignature.primaryBodyKey || 'stomach_tightness';

  return getTraceIconPlainLabel(bodyKey).toLowerCase();
}

function getLatestActionMemoryForLoop(entries: ActionMemoryEntry[], chainKey: string | null) {
  if (!chainKey) {
    return null;
  }

  return (
    entries
      .filter((entry) => entry.chainKey === chainKey)
      .sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0] || null
  );
}

export function getBestPositiveHelpfulnessMemoryForLoop(
  memories: HelpfulnessMemory[],
  chainKey: string | null,
) {
  if (!chainKey) {
    return null;
  }

  return (
    memories
      .filter((memory) => memory.chainKey === chainKey)
      .filter((memory) => memory.outcomeCounts.helped > 0 || memory.outcomeCounts.helped_a_little > 0)
      .sort((left, right) => {
        const leftScore = left.outcomeCounts.helped * 2 + left.outcomeCounts.helped_a_little;
        const rightScore = right.outcomeCounts.helped * 2 + right.outcomeCounts.helped_a_little;

        if (rightScore !== leftScore) {
          return rightScore - leftScore;
        }

        return right.lastCompletedAt.localeCompare(left.lastCompletedAt);
      })[0] || null
  );
}

function hasStrongBodySignal(traceRecord: MoodTraceRecord) {
  const selectedBodySignalCount = traceRecord.bodySignalLabels.filter(
    (label) => !label.toLowerCase().includes('not sure'),
  ).length;

  return selectedBodySignalCount >= 2 || traceRecord.chain[0] === traceRecord.loopSignature.primaryBodyKey;
}

function hasThoughtSortingSignal(traceRecord: MoodTraceRecord) {
  return (
    traceRecord.normalizedFields.thoughtFormCanonical === 'replaying_thought' ||
    traceRecord.loopSignature.signalKeys.includes('overthinking') ||
    traceRecord.transcript.toLowerCase().includes('worry')
  );
}

function isEligibleAction(action: ActionDefinition, context: ActionEligibilityContext) {
  const avoidsSafetyLevel = action.avoidWhen.safetyLevels.includes(context.safetyLevel);
  const avoidsRecentHelpfulness = context.recentHelpfulness
    ? action.avoidWhen.recentHelpfulness.includes(context.recentHelpfulness)
    : false;

  return action.fits.stages.includes(context.stage) && !avoidsSafetyLevel && !avoidsRecentHelpfulness;
}

function getEligibleActions(context: ActionEligibilityContext) {
  return actionDefinitions
    .filter((action) => isEligibleAction(action, context))
    .sort((left, right) => burdenRank[left.burdenLevel] - burdenRank[right.burdenLevel]);
}

function pickActionFromRoutingFeatures({
  routingFeatures,
  stage,
  safetyLevel,
  recentHelpfulness,
  allowedPrimaryNeeds,
}: {
  routingFeatures: TraceActionRoutingFeatures | null;
  stage: ActionStageFit;
  safetyLevel: SafetyLevel;
  recentHelpfulness?: ActionMemoryEntry['helpfulness'] | null;
  allowedPrimaryNeeds?: ActionPrimaryNeed[];
}) {
  if (!routingFeatures) {
    return null;
  }

  const eligibleActions = getEligibleActions({ stage, safetyLevel, recentHelpfulness });
  const burdenLimit = burdenRank[routingFeatures.burdenLevel];
  const burdenEligibleActions = eligibleActions.filter(
    (action) => burdenRank[action.burdenLevel] <= burdenLimit,
  );
  const primaryNeed = routingFeatures.primaryNeed === 'none' ? null : routingFeatures.primaryNeed;
  const recommendedFamily =
    routingFeatures.recommendedActionFamily === 'none' ? null : routingFeatures.recommendedActionFamily;

  if (allowedPrimaryNeeds && (!primaryNeed || !allowedPrimaryNeeds.includes(primaryNeed))) {
    return null;
  }

  if (primaryNeed && recommendedFamily) {
    const exactMatch = burdenEligibleActions.find(
      (action) => action.primaryNeed === primaryNeed && action.family === recommendedFamily,
    );

    if (exactMatch) {
      return exactMatch.id;
    }
  }

  if (primaryNeed) {
    const needMatch = burdenEligibleActions.find((action) => action.primaryNeed === primaryNeed);

    if (needMatch) {
      return needMatch.id;
    }
  }

  if (recommendedFamily) {
    const familyMatch = burdenEligibleActions.find((action) => action.family === recommendedFamily);

    if (familyMatch) {
      return familyMatch.id;
    }
  }

  return null;
}

function getRecommendedActionSource({
  routedActionId,
  defaultActionId,
  defaultSource,
}: {
  routedActionId: ActionId | null;
  defaultActionId: ActionId;
  defaultSource: ActionRecommendationSource;
}) {
  return routedActionId && routedActionId !== defaultActionId ? 'ai_routing' : defaultSource;
}

function pickActionByNeed({
  primaryNeed,
  stage,
  safetyLevel,
  recentHelpfulness,
  fallbackId,
}: {
  primaryNeed: ActionPrimaryNeed;
  stage: ActionStageFit;
  safetyLevel: SafetyLevel;
  recentHelpfulness?: ActionMemoryEntry['helpfulness'] | null;
  fallbackId: ActionId;
}) {
  return (
    getEligibleActions({ stage, safetyLevel, recentHelpfulness }).find(
      (action) => action.primaryNeed === primaryNeed,
    )?.id || fallbackId
  );
}

function pickLightestAction({
  stage,
  safetyLevel,
  recentHelpfulness,
  fallbackId,
}: {
  stage: ActionStageFit;
  safetyLevel: SafetyLevel;
  recentHelpfulness?: ActionMemoryEntry['helpfulness'] | null;
  fallbackId: ActionId;
}) {
  return getEligibleActions({ stage, safetyLevel, recentHelpfulness })[0]?.id || fallbackId;
}

function getTooMuchFallbackActionId(latestEntry: ActionMemoryEntry, safetyLevel: SafetyLevel) {
  if (isActionId(latestEntry.actionId)) {
    const fallbackForAction = getActionDefinition(latestEntry.actionId).completion.tooMuchFallbackActionId;

    if (fallbackForAction) {
      return pickActionByNeed({
        primaryNeed: getActionDefinition(fallbackForAction).primaryNeed,
        stage: 'lighter_step_after_too_much',
        safetyLevel,
        recentHelpfulness: latestEntry.helpfulness,
        fallbackId: fallbackForAction,
      });
    }
  }

  return pickLightestAction({
    stage: 'lighter_step_after_too_much',
    safetyLevel,
    recentHelpfulness: latestEntry.helpfulness,
    fallbackId: 'name-loop',
  });
}

function getLoopStage(traceRecord: MoodTraceRecord): ActionStageFit {
  return traceRecord.loopSignature.occurrenceCount <= 3 ? 'possible_thread' : 'possible_loop';
}

export function getRuleBasedRecommendedAction({
  traceRecord,
  actionMemoryEntries,
  helpfulnessMemories,
  loopIsVisible = false,
  loopEvidenceLine = 'Based on saved traces.',
}: ActionRecommendationContext): RecommendedAction {
  if (!traceRecord) {
    return {
      actionId: fallbackActionId,
      reason: getActionDefinition(fallbackActionId).reason,
      evidenceLine: 'For today: a small step can start from here.',
      mode: 'daily_action',
      source: 'daily_fallback',
    };
  }

  if (!traceRecord.safetyAssessment.canRecommendAction) {
    return {
      actionId: 'name-loop',
      reason: 'Saved for reflection first. A lighter naming step is safer than a regular action right now.',
      evidenceLine: 'For today: this trace is saved gently before regular actions.',
      mode: 'daily_action',
      source: 'fallback',
    };
  }

  const chainKey = traceRecord.loopSignature.chainKey;
  const bodySignal = getEarlyBodySignalLabel(traceRecord);
  const safetyLevel = traceRecord.safetyAssessment.level;
  const routingFeatures = traceRecord.actionRoutingFeatures;
  const dailyEvidenceLine = traceRecord.normalizedFields.bodySignalCanonical
    ? `For today: ${bodySignal} showed up in this trace.`
    : 'For today: based on the trace you saved.';

  if (!loopIsVisible) {
    if (hasStrongBodySignal(traceRecord) || traceRecord.normalizedFields.bodySignalCanonical) {
      const routedActionId = pickActionFromRoutingFeatures({
        routingFeatures,
        stage: 'daily_action',
        safetyLevel,
        allowedPrimaryNeeds: ['downshift_body'],
      });
      const defaultActionId = pickActionByNeed({
        primaryNeed: 'downshift_body',
        stage: 'daily_action',
        safetyLevel,
        fallbackId: 'body-scan',
      });
      const actionId = routedActionId || defaultActionId;

      return {
        actionId,
        reason: `${bodySignal} showed up today. A short body scan keeps this focused on the body first.`,
        evidenceLine: dailyEvidenceLine,
        mode: 'daily_action',
        source: getRecommendedActionSource({
          routedActionId,
          defaultActionId,
          defaultSource: 'daily_body_signal',
        }),
      };
    }

    if (hasThoughtSortingSignal(traceRecord)) {
      const routedActionId = pickActionFromRoutingFeatures({
        routingFeatures,
        stage: 'daily_action',
        safetyLevel,
        allowedPrimaryNeeds: ['separate_thoughts', 'tiny_next_step'],
      });
      const defaultActionId = pickActionByNeed({
        primaryNeed: 'tiny_next_step',
        stage: 'daily_action',
        safetyLevel,
        fallbackId: 'tiny-next-step',
      });
      const actionId = routedActionId || defaultActionId;

      return {
        actionId,
        reason: 'A thought kept replaying today. One tiny next step can make the moment feel less stuck.',
        evidenceLine: 'For today: replaying or worry showed up in this trace.',
        mode: 'daily_action',
        source: getRecommendedActionSource({
          routedActionId,
          defaultActionId,
          defaultSource: 'daily_overthinking',
        }),
      };
    }

    const routedActionId = pickActionFromRoutingFeatures({
      routingFeatures,
      stage: 'daily_action',
      safetyLevel,
    });
    const defaultActionId = pickActionByNeed({
      primaryNeed: 'tiny_next_step',
      stage: 'daily_action',
      safetyLevel,
      fallbackId: 'tiny-next-step',
    });

    return {
      actionId: routedActionId || defaultActionId,
      reason: 'This is a light action for today, before Rora has enough history to name a loop.',
      evidenceLine: dailyEvidenceLine,
      mode: 'daily_action',
      source: getRecommendedActionSource({
        routedActionId,
        defaultActionId,
        defaultSource: 'daily_fallback',
      }),
    };
  }

  const latestEntry = getLatestActionMemoryForLoop(actionMemoryEntries, chainKey);

  if (latestEntry?.helpfulness === 'too_much') {
    return {
      actionId: getTooMuchFallbackActionId(latestEntry, safetyLevel),
      reason: `Last time, ${latestEntry.actionTitle} felt like too much. Rora is choosing a lighter naming step for this loop.`,
      evidenceLine: loopEvidenceLine,
      mode: 'loop_action',
      source: 'too_much_lighter',
    };
  }

  const bestMemory = getBestPositiveHelpfulnessMemoryForLoop(helpfulnessMemories, chainKey);

  if (bestMemory && isActionId(bestMemory.actionId)) {
    return {
      actionId: bestMemory.actionId,
      reason: bestMemory.recommendationReason,
      evidenceLine: loopEvidenceLine,
      mode: 'loop_action',
      source: 'memory_helped',
    };
  }

  const loopStage = getLoopStage(traceRecord);

  if (traceRecord.loopSignature.occurrenceCount <= 3) {
    const routedActionId = pickActionFromRoutingFeatures({
      routingFeatures,
      stage: loopStage,
      safetyLevel,
      allowedPrimaryNeeds: ['name_loop'],
    });
    const defaultActionId = pickActionByNeed({
      primaryNeed: 'name_loop',
      stage: loopStage,
      safetyLevel,
      fallbackId: 'name-loop',
    });

    return {
      actionId: routedActionId || defaultActionId,
      reason: 'This possible loop is starting to repeat. Naming it can make it easier to spot next time.',
      evidenceLine: loopEvidenceLine,
      mode: 'loop_action',
      source: getRecommendedActionSource({
        routedActionId,
        defaultActionId,
        defaultSource: 'new_loop',
      }),
    };
  }

  if (hasStrongBodySignal(traceRecord)) {
    const routedActionId = pickActionFromRoutingFeatures({
      routingFeatures,
      stage: loopStage,
      safetyLevel,
      allowedPrimaryNeeds: ['downshift_body'],
    });
    const defaultActionId = pickActionByNeed({
      primaryNeed: 'downshift_body',
      stage: loopStage,
      safetyLevel,
      fallbackId: 'body-scan',
    });

    return {
      actionId: routedActionId || defaultActionId,
      reason: `${bodySignal} may be the early cue. A short body scan is the lightest next step.`,
      evidenceLine: loopEvidenceLine,
      mode: 'loop_action',
      source: getRecommendedActionSource({
        routedActionId,
        defaultActionId,
        defaultSource: 'body_signal',
      }),
    };
  }

  if (hasThoughtSortingSignal(traceRecord)) {
    const routedActionId = pickActionFromRoutingFeatures({
      routingFeatures,
      stage: loopStage,
      safetyLevel,
      allowedPrimaryNeeds: ['separate_thoughts'],
    });
    const defaultActionId = pickActionByNeed({
      primaryNeed: 'separate_thoughts',
      stage: loopStage,
      safetyLevel,
      fallbackId: 'fact-guess-worry-split',
    });

    return {
      actionId: routedActionId || defaultActionId,
      reason: 'This thread includes replaying or worry. Separating fact, guess, and worry may make it easier to hold.',
      evidenceLine: loopEvidenceLine,
      mode: 'loop_action',
      source: getRecommendedActionSource({
        routedActionId,
        defaultActionId,
        defaultSource: 'overthinking',
      }),
    };
  }

  const routedActionId = pickActionFromRoutingFeatures({
    routingFeatures,
    stage: loopStage,
    safetyLevel,
  });
  const defaultActionId = pickActionByNeed({
    primaryNeed: 'separate_thoughts',
    stage: loopStage,
    safetyLevel,
    fallbackId: fallbackActionId,
  });

  return {
    actionId: routedActionId || defaultActionId,
    reason: `This action fits the trace you saved around ${traceRecord.loopSignature.label.toLowerCase()}.`,
    evidenceLine: loopEvidenceLine,
    mode: 'loop_action',
    source: getRecommendedActionSource({
      routedActionId,
      defaultActionId,
      defaultSource: 'fallback',
    }),
  };
}
