import { describe, it, expect } from 'vitest';
import { buildHeuristicInsightsBundle } from '../../lib/insightsHeuristics';

describe('insightsHeuristics', () => {
  it('returns readiness insight when no columns present', () => {
    const analysis = { score: null, stats: {} };
    const bundle = buildHeuristicInsightsBundle(analysis, { reason: 'no-data' });
    expect(bundle.insights.length).toBeGreaterThan(0);
    expect(bundle.insights[0].id).toBe('no-columns');
    expect(bundle.source).toBeDefined();
    expect(bundle.reason).toBe('no-data');
  });

  it('detects missing values and quality score', () => {
    const analysis = {
      score: 45,
      stats: {
        name: { missing: 5, total: 10, unique: 8, outliers: 0, type: 'text' },
        id: { missing: 0, total: 10, unique: 2, outliers: 0, type: 'text' },
        price: { missing: 0, total: 10, unique: 10, outliers: 2, type: 'number' }
      }
    };

    const bundle = buildHeuristicInsightsBundle(analysis, { reason: 'test' });
    // Should include a missing-data insight for 'name'
    const missing = bundle.insights.find(i => i.id?.startsWith('missing-') || (i.metric && i.metric.column === 'name'));
    expect(!!missing).toBe(true);

    // Should include uniqueness warning (id column only 2 unique of 10)
    const uniq = bundle.insights.find(i => i.id?.startsWith('uniqueness-') || (i.metric && i.metric.column === 'id'));
    expect(!!uniq).toBe(true);

    // Should always include a quality-score card
    const scoreCard = bundle.insights.find(i => i.id === 'quality-score');
    expect(scoreCard).toBeTruthy();
    expect(scoreCard.summary).toContain('45');
  });
});
