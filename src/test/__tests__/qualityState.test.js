import { describe, it, expect } from 'vitest';
import { qualityState, computeQualityScore } from '../../lib/dataAnalysis';

describe('qualityState', () => {
  it('returns Excellent for >=90', () => {
    expect(qualityState(95).label).toBe('Excellent');
  });
  it('returns Good for 70-89', () => {
    expect(qualityState(75).label).toBe('Good');
  });
  it('returns Poor for <70 and >0', () => {
    expect(qualityState(40).label).toBe('Poor');
  });
  it('returns Neutral for 0', () => {
    expect(qualityState(0).label).toBe('Neutral');
  });
});

describe('computeQualityScore', () => {
  it('produces higher score for fewer missing values', () => {
    const statsA = { col1: { missing:0, unique:3, total:3, outliers:0, type:'number' } };
    const statsB = { col1: { missing:2, unique:1, total:3, outliers:0, type:'number' } };
    const scoreA = computeQualityScore(statsA, 3);
    const scoreB = computeQualityScore(statsB, 3);
    expect(scoreA).toBeGreaterThan(scoreB);
  });
});
