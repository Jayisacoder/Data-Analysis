import { buildHeuristicInsightsBundle, buildInsightBundle } from '../../../lib/insightsHeuristics';

// OpenAI insights API route
// Expects POST { analysis: { score, stats } }

export async function POST(req) {
  let analysis;
  try {
    const body = await req.json();
    analysis = body?.analysis;
    if (!analysis) {
      return new Response(JSON.stringify({ error: 'Missing analysis payload' }), { status: 400 });
    }

    const model = process.env.INSIGHTS_MODEL || 'gpt-4o-mini';
    const apiKey = resolveApiKey();
    if (!apiKey) {
      return respondWithFallback(analysis, 'OPENAI_API_KEY missing');
    }
    const bundle = await analyzeQualityInsights({ analysis, model, apiKey });
    if (!bundle?.insights?.length) {
      return respondWithFallback(analysis, 'No insights returned from model', { model: bundle?.model || model });
    }
    return new Response(JSON.stringify(bundle), { status: 200 });
  } catch (err) {
    if (analysis) {
      return respondWithFallback(analysis, err.message || 'Unexpected server error');
    }
    return new Response(JSON.stringify({ error: err.message || 'Unexpected server error' }), { status: 500 });
  }
}

function respondWithFallback(analysis, reason, extra = {}) {
  const payload = buildHeuristicInsightsBundle(analysis, { reason, ...extra });
  return new Response(JSON.stringify(payload), { status: 200 });
}

const SUPPORTED_KEY_NAMES = [
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_OPENAI_API_KEY',
  'VITE_OPENAI_API_KEY',
  'NEXT_PUBLIC_VITE_OPENAI_API_KEY'
];

function resolveApiKey() {
  if (typeof process === 'undefined') return undefined;
  for (const key of SUPPORTED_KEY_NAMES) {
    if (process.env[key]) return process.env[key];
  }
  return undefined;
}

async function analyzeQualityInsights({ analysis, model, apiKey }) {
  if (!analysis) throw new Error('Analysis payload is required.');
  const userContent = buildUserContent(analysis);
  const payload = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent }
    ],
    temperature: 0.2,
    max_tokens: 400
  };
  const data = await openaiChat(payload, apiKey);
  const assistantText = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? JSON.stringify(data);
  const parsed = tryParseJson(assistantText) || tryExtractJson(assistantText);
  // If model returned a parsed JSON with an empty insights array, prefer deterministic heuristics
  if (parsed && Array.isArray(parsed.insights) && parsed.insights.length === 0) {
    return buildHeuristicInsightsBundle(analysis, { reason: 'Model returned empty insights array', source: 'openai-empty' });
  }
  const cards = normalizeInsights(parsed, analysis);
  if (cards.length) {
    return buildInsightBundle({
      analysis,
      insights: cards,
      source: 'openai',
      model: data.model || model
    });
  }
  const rawLines = splitLines(assistantText);
  // Filter out lines that are purely JSON punctuation / tokens or too small to be meaningful
  const meaningfulLines = rawLines.filter(l => /\b[A-Za-z0-9]{3,}\b/.test(l));
  const lineCards = linesToCards(meaningfulLines, analysis);
  if (lineCards.length) {
    return buildInsightBundle({
      analysis,
      insights: lineCards,
      source: 'openai-text',
      model: data.model || model,
      reason: 'Model responded with free-form text'
    });
  }
  throw new Error('Model returned an empty response');
}

const SYSTEM_PROMPT = `You are the Data Quality Copilot. Given a dataset quality analysis summary, return concise remediation insights that a business analyst can act on.

Respond ONLY with JSON using this schema:
{
  "insights": [
    {
      "title": string,
      "recommendation": string
    }
  ]
}
`;

function buildUserContent(analysis) {
  const { score, stats = {} } = analysis;
  const columnSummaries = Object.entries(stats)
    .map(([col, detail]) => {
      const missingRate = detail.total ? ((detail.missing / detail.total) * 100).toFixed(1) : '0.0';
      return `${col}: missing ${detail.missing}/${detail.total} (${missingRate}%), type ${detail.type}, uniques ${detail.unique}, outliers ${detail.outliers}`;
    })
    .join('\n');
  return `Overall Score: ${score}\nColumns:\n${columnSummaries}\nReturn targeted remediation insights in the requested JSON schema.`;
}

async function openaiChat(payload, apiKey) {
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set.');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) {
    const detail = safeDetail(text) || res.statusText;
    throw new Error(`OpenAI request failed: ${detail}`);
  }
  try {
    return JSON.parse(text);
  } catch (_) {
    return { raw: text };
  }
}

function safeDetail(raw) {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message || parsed?.detail || raw;
  } catch (_) {
    return raw;
  }
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function tryExtractJson(text) {
  if (!text) return null;
  // Remove triple-backtick fenced blocks if present
  const stripped = text.replace(/```(?:json)?\n?|```/gi, '').trim();
  // Fast parse: if it looks like a JSON object in one piece, try parsing directly
  if (/^\{[\s\S]*\}$/.test(stripped)) {
    try { return JSON.parse(stripped); } catch (_) { /* fallthrough */ }
  }

  // Fallback: find the largest balanced JSON object by scanning for matching braces
  const start = stripped.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) {
      const candidate = stripped.slice(start, i + 1);
      try { return JSON.parse(candidate); } catch (_) { return null; }
    }
  }
  return null;
}

function normalizeInsights(json, analysis) {
  if (!json) return [];
  const nodes = Array.isArray(json.insights) ? json.insights : [];
  return nodes
    .map((node, idx) => normalizeInsightNode(node, idx, analysis))
    .filter(Boolean);
}

function normalizeInsightNode(node, idx, analysis) {
  const stats = analysis?.stats || {};
  if (!node) return null;
  if (typeof node === 'string') {
    return buildTextCard(node, idx, analysis);
  }
  if (typeof node === 'object') {
    const column = node.column || node.field || findColumnMention(node.title || node.recommendation, stats);
    return {
      id: node.id || `ai-${idx}`,
      title: node.title || fallbackTitle(column, idx),
      category: node.category || inferCategory(column, node.title),
      severity: normalizeSeverity(node.severity || node.impact),
      summary: node.summary || node.recommendation || node.detail || '',
      recommendation: node.recommendation || node.summary || node.detail || '',
      metric: column && stats[column] ? buildMetric(stats[column], column) : undefined,
      actions: normalizeActions(node.actions || node.nextSteps || node.recommendations)
    };
  }
  return null;
}

function linesToCards(lines, analysis) {
  return lines.map((line, idx) => buildTextCard(line, idx, analysis)).filter(Boolean);
}

function buildTextCard(line, idx, analysis) {
  if (!line) return null;
  const stats = analysis?.stats || {};
  const column = findColumnMention(line, stats);
  return {
    id: `ai-line-${idx}`,
    title: line.includes(':') ? line.split(':')[0].trim() : fallbackTitle(column, idx),
    category: inferCategory(column, line),
    severity: inferSeverityFromKeywords(line),
    summary: line,
    recommendation: line,
    metric: column && stats[column] ? buildMetric(stats[column], column) : undefined,
    actions: [line]
  };
}

function splitLines(text) {
  return text
    .split(/\n+/)
    .map(line => line.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean);
}

function normalizeSeverity(value) {
  if (!value) return 'medium';
  const normalized = String(value).toLowerCase();
  if (['high', 'critical', 'severe'].includes(normalized)) return 'high';
  if (['low', 'minor'].includes(normalized)) return 'low';
  return 'medium';
}

function normalizeActions(actions) {
  if (!actions) return [];
  if (typeof actions === 'string') return [actions];
  if (Array.isArray(actions)) {
    return actions
      .map(item => (typeof item === 'string' ? item.trim() : item?.description || item?.text))
      .filter(Boolean);
  }
  return [];
}

function buildMetric(stat, column) {
  return {
    column,
    missing: stat.missing,
    total: stat.total,
    unique: stat.unique,
    outliers: stat.outliers,
    type: stat.type
  };
}

function findColumnMention(text, stats) {
  if (!text || !stats) return null;
  const lower = text.toLowerCase();
  return Object.keys(stats).find(col => lower.includes(col.toLowerCase())) || null;
}

function fallbackTitle(column, idx) {
  if (column) return `Insight for ${column}`;
  return `Insight ${idx + 1}`;
}

function inferCategory(column, text) {
  if (column) {
    return 'Completeness';
  }
  if (!text) return 'Insight';
  const lower = text.toLowerCase();
  if (lower.includes('duplicate') || lower.includes('unique')) return 'Uniqueness';
  if (lower.includes('missing') || lower.includes('null')) return 'Completeness';
  if (lower.includes('outlier') || lower.includes('range')) return 'Validity';
  return 'Insight';
}

function inferSeverityFromKeywords(text) {
  if (!text) return 'medium';
  const lower = text.toLowerCase();
  if (lower.includes('critical') || lower.includes('urgent')) return 'high';
  if (lower.includes('minor') || lower.includes('monitor')) return 'low';
  return 'medium';
}
