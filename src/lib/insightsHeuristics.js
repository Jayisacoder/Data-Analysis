const DEFAULT_STATUS = {
  source: 'idle',
  model: null,
  reason: null,
  generatedAt: null,
  score: null,
  columnsAnalyzed: 0,
  rowsEvaluated: 0,
  insights: []
};

export function createEmptyInsightsBundle() {
  return { ...DEFAULT_STATUS, insights: [] };
}

export function buildInsightBundle({ analysis, insights, source, model, reason }) {
  const statsEntries = Object.entries(analysis?.stats || {});
  return {
    source,
    model,
    reason: reason || null,
    generatedAt: new Date().toISOString(),
    score: analysis?.score ?? null,
    columnsAnalyzed: statsEntries.length,
    rowsEvaluated: deriveTotalRows(statsEntries),
    insights
  };
}

export function buildHeuristicInsightsBundle(analysis, { reason, source = 'heuristic-fallback', model = 'rule-based' } = {}) {
  const statsEntries = Object.entries(analysis?.stats || {});
  const insights = [];

  if (!statsEntries.length) {
    insights.push({
      id: 'no-columns',
      title: 'Upload data to unlock insights',
      category: 'Readiness',
      severity: 'info',
      summary: 'No profile statistics were detected. Provide at least one column so the engine can evaluate completeness, uniqueness, and validity.',
      recommendation: 'Upload a dataset with column headers in the first row or re-run the profiling step.',
      actions: [
        'Export a representative CSV or Excel sample with headers.',
        'Verify rows contain values for each column before uploading.'
      ]
    });
    return buildInsightBundle({ analysis, insights, source, model, reason });
  }

  const missingLeaders = statsEntries
    .map(([column, stat]) => ({ column, stat, missingRate: rate(stat.missing, stat.total) }))
    .filter(entry => entry.missingRate >= 0.1)
    .sort((a, b) => b.missingRate - a.missingRate)
    .slice(0, 2);

  missingLeaders.forEach(entry => {
    insights.push({
      id: `missing-${entry.column}`,
      title: `Missing data risk: ${entry.column}`,
      category: 'Completeness',
      severity: rateSeverity(entry.missingRate),
      summary: `${formatPercent(entry.missingRate)} of ${entry.column} is null or blank (${entry.stat.missing}/${entry.stat.total} rows).`,
      recommendation: `Clamp down on upstream capture for ${entry.column} and backfill using trusted reference systems.`,
      metric: {
        column: entry.column,
        missing: entry.stat.missing,
        total: entry.stat.total,
        missingRate: entry.missingRate
      },
      actions: [
        `Trace the ingestion pipeline for ${entry.column} to find the stage allowing blanks.`,
        `Introduce validation or defaulting rules so ${entry.column} is always populated.`
      ]
    });
  });

  const duplicateCandidates = statsEntries
    .map(([column, stat]) => ({ column, stat, uniquenessRate: rate(stat.unique, stat.total) }))
    .filter(entry => entry.uniquenessRate > 0 && entry.uniquenessRate <= 0.5)
    .sort((a, b) => a.uniquenessRate - b.uniquenessRate)
    .slice(0, 1);

  duplicateCandidates.forEach(entry => {
    insights.push({
      id: `uniqueness-${entry.column}`,
      title: `Potential duplicate identifiers: ${entry.column}`,
      category: 'Uniqueness',
      severity: entry.uniquenessRate < 0.25 ? 'high' : 'medium',
      summary: `${entry.column} only has ${formatPercent(entry.uniquenessRate)} distinct values.`,
      recommendation: `${entry.column} may not uniquely identify records. Combine with another key or enforce stricter uniqueness constraints.`,
      metric: {
        column: entry.column,
        unique: entry.stat.unique,
        total: entry.stat.total,
        uniquenessRate: entry.uniquenessRate
      },
      actions: [
        `Evaluate whether ${entry.column} should be combined with another field to form a compound key.`,
        `Deduplicate rows where ${entry.column} repeats to prevent downstream reporting skew.`
      ]
    });
  });

  const outlierCandidates = statsEntries
    .filter(([, stat]) => stat.type === 'number' && stat.outliers > 0)
    .map(([column, stat]) => ({ column, stat, outlierRate: rate(stat.outliers, stat.total) }))
    .filter(entry => entry.outlierRate >= 0.05)
    .sort((a, b) => b.outlierRate - a.outlierRate)
    .slice(0, 2);

  outlierCandidates.forEach(entry => {
    insights.push({
      id: `outliers-${entry.column}`,
      title: `Outlier monitoring: ${entry.column}`,
      category: 'Validity',
      severity: rateSeverity(entry.outlierRate),
      summary: `${entry.stat.outliers} rows (${formatPercent(entry.outlierRate)}) fall outside expected ranges for ${entry.column}.`,
      recommendation: `Set guardrails for ${entry.column} to keep numeric anomalies from polluting analytics.`,
      metric: {
        column: entry.column,
        outliers: entry.stat.outliers,
        total: entry.stat.total,
        outlierRate: entry.outlierRate
      },
      actions: [
        `Flag ${entry.column} values three standard deviations from the mean for manual review.`,
        `Implement automated caps/floors before loading ${entry.column} into analytics tables.`
      ]
    });
  });

  const score = analysis?.score ?? null;
  insights.push({
    id: 'quality-score',
    title: qualityTitle(score),
    category: 'Quality Index',
    severity: scoreSeverity(score),
    summary: score === null ? 'Overall score unavailable. Ensure profiling completed successfully.' : `Overall data quality score is ${score}/100.`,
    recommendation: recommendationForScore(score),
    actions: nextStepsForScore(score)
  });

  if (insights.length < 3) {
    insights.push({
      id: 'proactive-monitoring',
      title: 'Establish proactive monitoring',
      category: 'Operational Excellence',
      severity: 'medium',
      summary: 'Even when data looks healthy, automated freshness, volume, and schema checks prevent regressions.',
      recommendation: 'Instrument data quality monitors (e.g., Great Expectations, dbt tests) tied to deployment gates.',
      actions: [
        'Track daily row-volume deltas to catch silent pipeline drops.',
        'Publish a runbook outlining who triages data-quality incidents and within what SLA.'
      ]
    });
  }

  return buildInsightBundle({ analysis, insights, source, model, reason });
}

function rate(part, whole) {
  if (!whole) return 0;
  return Number((part / whole).toFixed(4));
}

function deriveTotalRows(statsEntries) {
  if (!statsEntries.length) return 0;
  const [, stat] = statsEntries[0];
  return stat?.total ?? 0;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function rateSeverity(value) {
  if (value >= 0.4) return 'high';
  if (value >= 0.2) return 'medium';
  return 'low';
}

function scoreSeverity(score) {
  if (score === null || score === undefined) return 'info';
  if (score >= 85) return 'low';
  if (score >= 65) return 'medium';
  return 'high';
}

function qualityTitle(score) {
  if (score === null || score === undefined) return 'Quality score unavailable';
  if (score >= 85) return 'Quality trending healthy';
  if (score >= 65) return 'Quality needs targeted fixes';
  return 'Quality remediation required';
}

function recommendationForScore(score) {
  if (score === null || score === undefined) return 'Re-run the profiler once a dataset is loaded to compute a score.';
  if (score >= 85) return 'Maintain active monitoring and share the score with business stakeholders as a KPI.';
  if (score >= 65) return 'Prioritize completeness and uniqueness issues called out above to lift the score above 80.';
  return 'Launch a remediation sprint focusing on the top three failing columns and codify acceptance thresholds.';
}

function nextStepsForScore(score) {
  if (score === null || score === undefined) {
    return [
      'Verify the profiler ran on the uploaded dataset and produced column statistics.',
      'Re-upload a clean sample if the original file was empty.'
    ];
  }
  if (score >= 85) {
    return [
      'Schedule monthly quality reviews to ensure the score remains above target.',
      'Publish the score to downstream teams so they trust the dataset.'
    ];
  }
  if (score >= 65) {
    return [
      'Assign owners to the columns flagged for missing data or uniqueness gaps.',
      'Track remediation progress in your project board and re-score after each fix.'
    ];
  }
  return [
    'Escalate the dataset to data governance leads for rapid triage.',
    'Add automated blockers so downstream pipelines fail when score < 70.'
  ];
}
