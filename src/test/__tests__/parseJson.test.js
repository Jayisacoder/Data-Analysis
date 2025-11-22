import { describe, it, expect } from 'vitest';
import { parseFile } from '../../lib/dataAnalysis';

describe('parseFile JSON', () => {
  it('parses column-major JSON object-of-arrays into rows', async () => {
    const json = JSON.stringify({
      id: [1,2,3,4],
      name: ['Alice','Bob','Charlie','Diana'],
      score: [85,92,78,90]
    });
    const blob = new File([json], 'sample.json', { type: 'application/json' });
    const parsed = await parseFile(blob);
    expect(parsed.rows.length).toBe(4);
    expect(parsed.meta.fields).toEqual(['id','name','score']);
    expect(parsed.rows[0]).toEqual({ id: 1, name: 'Alice', score: 85 });
  });

  it('parses array-of-objects JSON unchanged', async () => {
    const arr = JSON.stringify([
      { a: 1, b: 'x' },
      { a: 2, b: 'y' }
    ]);
    const blob = new File([arr], 'rows.json', { type: 'application/json' });
    const parsed = await parseFile(blob);
    expect(parsed.rows.length).toBe(2);
    expect(parsed.meta.fields).toEqual(['a','b']);
  });
});
