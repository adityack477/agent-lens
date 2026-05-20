export function calculateAIRScore(deterministicResults, aiResults) {
  const { aggregateScores } = deterministicResults;

  // Wt dim
  const dimensions = [
    {
      key: 'trustability',
      label: 'Trustability',
      description: 'Can AI agents trust this merchant?',
      icon: '🛡️',
      score: aggregateScores.trustability,
      weight: 25,
      color: '#6366f1',
    },
    {
      key: 'interpretability',
      label: 'Interpretability',
      description: 'Can AI clearly understand your products?',
      icon: '🔍',
      score: aggregateScores.interpretability,
      weight: 20,
      color: '#8b5cf6',
    },
    {
      key: 'comparability',
      label: 'Comparability',
      description: 'Can AI compare your products against competitors?',
      icon: '⚖️',
      score: aggregateScores.comparability,
      weight: 20,
      color: '#06b6d4',
    },
    {
      key: 'decisionCompleteness',
      label: 'Decision Completeness',
      description: 'Is there enough info for AI to recommend confidently?',
      icon: '✅',
      score: aggregateScores.decisionCompleteness,
      weight: 20,
      color: '#10b981',
    },
    {
      key: 'policyClarity',
      label: 'Policy Clarity',
      description: 'Are your policies machine-readable?',
      icon: '📋',
      score: aggregateScores.policyClarity,
      weight: 15,
      color: '#f59e0b',
    },
  ];

  // Calculate wt overall score
  const overallScore = Math.round(
    dimensions.reduce((total, dim) => total + (dim.score * dim.weight / 100), 0)
  );

  // Derive recommendation likelihood
  const recommendationLikelihood = deriveRecommendationLikelihood(overallScore, aiResults);

  // Grade
  const grade = deriveGrade(overallScore);

  // Headline insight
  const headlineInsight = deriveHeadlineInsight(dimensions, overallScore);

  return {
    overallScore,
    grade,
    recommendationLikelihood,
    headlineInsight,
    dimensions,
    summary: buildSummary(overallScore, deterministicResults),
  };
}

function deriveRecommendationLikelihood(score, aiResults) {
  // Use AI persona confidence if available
  if (!aiResults.aiUnavailable && aiResults.personaSimulations.length > 0) {
    const avgConfidence = aiResults.personaSimulations.reduce(
      (sum, p) => sum + (p.confidence || 0), 0
    ) / aiResults.personaSimulations.length;
    return Math.round(avgConfidence);
  }
  // Fallback: derive from deterministic score
  if (score >= 80) return 75;
  if (score >= 65) return 55;
  if (score >= 50) return 35;
  if (score >= 35) return 20;
  return 10;
}

function deriveGrade(score) {
  if (score >= 85) return { letter: 'A', label: 'AI Ready', color: '#10b981' };
  if (score >= 70) return { letter: 'B', label: 'Good', color: '#6366f1' };
  if (score >= 55) return { letter: 'C', label: 'Needs Work', color: '#f59e0b' };
  if (score >= 40) return { letter: 'D', label: 'At Risk', color: '#f97316' };
  return { letter: 'F', label: 'AI Invisible', color: '#ef4444' };
}

function deriveHeadlineInsight(dimensions, overallScore) {
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  if (overallScore < 40) {
    return `Your store is largely invisible to AI shopping agents. ${weakest.label} (${weakest.score}/100) is your most critical gap.`;
  }
  if (overallScore < 60) {
    return `AI agents are frequently skipping your products. ${weakest.label} is your biggest blocker at ${weakest.score}/100.`;
  }
  if (overallScore < 75) {
    return `Your store has moderate AI visibility. Improving ${weakest.label} (${weakest.score}/100) would unlock the most recommendations.`;
  }
  return `Your store has strong AI representation. Fine-tuning ${weakest.label} could push you into the top tier.`;
}

function buildSummary(score, deterministicResults) {
  const { stats, missingFieldsSummary } = deterministicResults;
  const topIssue = missingFieldsSummary[0];

  return {
    productsAnalyzed: stats.totalAnalyzed,
    productsAtRisk: stats.productsBelow50,
    topMissingField: topIssue ? `${topIssue.field} (missing in ${topIssue.percentage}% of products)` : 'None identified',
    avgProductScore: stats.avgScore,
  };
}