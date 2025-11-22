import { describe, it, expect } from 'vitest';
import { analyzeData, computeQualityScore } from '../../lib/dataAnalysis';

describe('dataAnalysis', () => {
  const rows = [
    { a: 1, b: 'x' },
    { a: 2, b: 'y' },
    { a: null, b: 'y' }
  ];
  it('analyzes basic stats', () => {
    const result = analyzeData(rows);
    // `columns` returns a detailed array of column objects; ensure the name 'a' exists
    expect(result.columns.map(c => c.name)).toContain('a');
    expect(result.stats.a.missing).toBe(1);
  });
  it('computes a quality score', () => {
    const result = analyzeData(rows);
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThan(0);
  });
  it('handles empty data', () => {
    const result = analyzeData([]);
    expect(result.score).toBe(0);
  });
  it('computeQualityScore returns 0 with no rows', () => {
    expect(computeQualityScore({}, 0)).toBe(0);
  });
});
