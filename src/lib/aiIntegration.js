import { buildHeuristicInsightsBundle } from './insightsHeuristics';

const INSIGHTS_ENDPOINT = process.env.NEXT_PUBLIC_INSIGHTS_ENDPOINT || '/api/insights';

export async function generateInsights(analysis) {
  if (!analysis) throw new Error('Analysis payload missing');
  try {
    const response = await fetch(INSIGHTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis })
    });

    const text = await response.text();
    if (!response.ok) {
      const reason = safeExtractError(text);
      return buildHeuristicInsightsBundle(analysis, { reason, source: 'client-fallback' });
    }

    let payload;
    try {
      payload = JSON.parse(text);
    } catch (parseErr) {
      return buildHeuristicInsightsBundle(analysis, { reason: parseErr.message || 'Invalid JSON from insights API', source: 'client-fallback' });
    }

    if (isValidBundle(payload)) {
      return normalizeBundle(payload, analysis);
    }

    const detail = payload?.error || 'No insights returned';
    return buildHeuristicInsightsBundle(analysis, { reason: detail, source: 'client-fallback' });
  } catch (err) {
    return buildHeuristicInsightsBundle(analysis, { reason: err.message || 'Unexpected client error', source: 'client-fallback' });
  }
}

function safeExtractError(raw) {
  if (!raw) return 'Insights endpoint returned an empty response';
  try {
    const parsed = JSON.parse(raw);
    return parsed?.detail || parsed?.error || JSON.stringify(parsed);
  } catch (_) {
    return raw;
  }
}

function isValidBundle(payload) {
  return !!payload && Array.isArray(payload.insights);
}

function normalizeBundle(payload, analysis) {
  const statsEntries = Object.entries(analysis?.stats || {});
  return {
    source: payload.source || 'api',
    model: payload.model || null,
    reason: payload.reason || null,
    generatedAt: payload.generatedAt || new Date().toISOString(),
    score: payload.score ?? analysis?.score ?? null,
    columnsAnalyzed: payload.columnsAnalyzed ?? statsEntries.length,
    rowsEvaluated: payload.rowsEvaluated ?? deriveTotalRows(statsEntries),
    insights: payload.insights || []
  };
}

function deriveTotalRows(statsEntries) {
  if (!statsEntries.length) return 0;
  const [, stat] = statsEntries[0];
  return stat?.total ?? 0;
}
