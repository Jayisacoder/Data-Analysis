import { openaiChat } from './openaiClient';

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

export async function analyzeQualityInsights({ analysis, model = 'gpt-4o-mini' }) {
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

  const data = await openaiChat(payload);
  const assistantText = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? JSON.stringify(data);

  const parsed = tryParseJson(assistantText) || tryExtractJson(assistantText);
  const structuredInsights = normalizeInsights(parsed);

  if (structuredInsights.length) {
    return { insights: structuredInsights, model: data.model || model };
  }
  return { insights: splitLines(assistantText), model: data.model || model };
}

function buildUserContent(analysis) {
  const { score, stats = {} } = analysis;
  const columnSummaries = Object.entries(stats)
    .map(([col, detail]) => {
      const missingRate = detail.total ? (detail.missing / detail.total * 100).toFixed(1) : '0.0';
      return `${col}: missing ${detail.missing}/${detail.total} (${missingRate}%), type ${detail.type}, uniques ${detail.unique}, outliers ${detail.outliers}`;
    })
    .join('\n');
  return `Overall Score: ${score}\nColumns:\n${columnSummaries}\nReturn targeted remediation insights in the requested JSON schema.`;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function tryExtractJson(text) {
  const match = text?.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (_) {
    return null;
  }
}

function normalizeInsights(json) {
  if (!json) return [];
  const nodes = Array.isArray(json.insights) ? json.insights : [];
  return nodes
    .map((node) => {
      if (typeof node === 'string') {
        return node;
      }
      if (node && typeof node === 'object') {
        const title = node.title || 'Insight';
        const recommendation = node.recommendation || node.detail || '';
        return `${title}: ${recommendation}`.trim();
      }
      return null;
    })
    .filter(Boolean);
}

function splitLines(text) {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean);
}
