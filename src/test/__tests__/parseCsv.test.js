import { describe, it, expect } from 'vitest';
import { parseFile } from '../../lib/dataAnalysis';

describe('parseFile CSV', () => {
  it('parses CSV blob with header', async () => {
    const csv = 'a,b\n1,2\n3,4';
    const blob = new File([csv], 'test.csv', { type: 'text/csv' });
    const parsed = await parseFile(blob);
    expect(parsed.rows.length).toBe(2);
    expect(parsed.meta.fields).toEqual(['a','b']);
  });
});
