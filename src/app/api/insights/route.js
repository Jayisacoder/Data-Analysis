// OpenAI insights API route
// Expects POST { analysis: { score, stats } }
// Requires process.env.OPENAI_API_KEY

export async function POST(req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), { status: 400 });
    }
    const body = await req.json();
    const { analysis } = body || {};
    if (!analysis) {
      return new Response(JSON.stringify({ error: 'Missing analysis payload' }), { status: 400 });
    }
    const prompt = buildPrompt(analysis);
    const model = process.env.INSIGHTS_MODEL || 'gpt-4o-mini';
    const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You generate concise, prioritized data quality remediation insights.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });
    if (!completionRes.ok) {
      // Try to parse JSON error; fall back to text
      let detailText = '';
      let status = completionRes.status;
      try {
        const errJson = await completionRes.json();
        detailText = errJson.error?.message || JSON.stringify(errJson);
      } catch (_) {
        detailText = await completionRes.text();
      }
      return new Response(JSON.stringify({ error: 'OpenAI request failed', status, detail: detailText }), { status: 502 });
    }
    const json = await completionRes.json();
    const text = json.choices?.[0]?.message?.content || '';
    const insights = text
      .split(/\n+/)
      .map(l => l.replace(/^[-*\d.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 8);
    return new Response(JSON.stringify({ insights, model }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

function buildPrompt(analysis) {
  const { score, stats } = analysis;
  const cols = Object.entries(stats).map(([c,s]) => `${c}: missing=${s.missing}/${s.total}, unique=${s.unique}, type=${s.type}, outliers=${s.outliers}`).join('\n');
  return `Data quality score: ${score}. Columns detail:\n${cols}\nProvide prioritized remediation steps and quick win suggestions.`;
}
