import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../../app/api/insights/route';

describe('insights API route', () => {
  const simpleAnalysis = { score: 80, stats: { a: { missing: 1, total: 3, unique: 2, outliers: 0, type: 'number' } } };
  const realEnv = { ...process.env };

  beforeEach(() => {
    // reset environment & fetch mock
    process.env.OPENAI_API_KEY = undefined;
    global.fetch = undefined;
  });

  afterEach(() => {
    process.env = { ...realEnv };
    vi.restoreAllMocks();
  });

  it('falls back when OPENAI_API_KEY missing', async () => {
    const req = new Request('http://localhost/api/insights', { method: 'POST', body: JSON.stringify({ analysis: simpleAnalysis }), headers: { 'Content-Type': 'application/json' } });
    const res = await POST(req);
    expect(res).toBeInstanceOf(Response);
    const payload = JSON.parse(await res.text());
    expect(Array.isArray(payload.insights)).toBe(true);
    expect(payload.source).toBe('heuristic-fallback');
    expect(payload.score).toBe(simpleAnalysis.score);
  });

  it('returns model generated bundle when OpenAI responds with structured JSON', async () => {
    // provide key so route attempts chat call
    process.env.OPENAI_API_KEY = 'fake-key-xyz';

    const fakeOpenAi = {
      choices: [
        { message: { content: JSON.stringify({ insights: [{ title: 'Fix A', recommendation: 'Set default' }] }) } }
      ],
      model: 'test-model'
    };

    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify(fakeOpenAi) });

    const req = new Request('http://localhost/api/insights', { method: 'POST', body: JSON.stringify({ analysis: simpleAnalysis }), headers: { 'Content-Type': 'application/json' } });
    const res = await POST(req);
    const payload = JSON.parse(await res.text());
    expect(payload.source).toBe('openai');
    expect(payload.model).toBe('test-model');
    expect(Array.isArray(payload.insights)).toBe(true);
    expect(payload.insights[0].title).toContain('Fix A');
  });
});
