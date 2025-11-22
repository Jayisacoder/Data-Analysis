// Stub AI integration. Replace with real OpenAI API calls.
export async function generateInsights(analysis) {
  try {
    const res = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis })
    });
    const json = await res.json();
    if (json.insights && json.insights.length) return json.insights;
    // Fallback stub if API key missing or error
    return fallbackInsights(analysis, json.error);
  } catch (e) {
    return fallbackInsights(analysis, e.message);
  }
}

function fallbackInsights(analysis, reason) {
  const { score, stats } = analysis;
  const topMissing = Object.entries(stats)
    .sort((a,b)=>b[1].missing - a[1].missing)
    .slice(0,3)
    .map(([col, st]) => `${col} (${st.missing})`);
  return [
    `Overall data quality score: ${score}. (Local heuristic insights; API unavailable: ${reason || 'unknown'})`,
    topMissing.length ? `Focus on reducing missing values in: ${topMissing.join(', ')}.` : 'No significant missing values detected.',
    'Standardize categorical text values to improve consistency.',
    'Review numeric outliers for potential data entry errors.'
  ];
}
