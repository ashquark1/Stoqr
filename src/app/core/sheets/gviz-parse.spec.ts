import { describe, expect, it } from 'vitest';

import { SheetsParseError, unwrapGviz } from './gviz-parse';

/** Wraps a payload in the JSONP envelope the gviz endpoint actually returns. */
function buildRaw(payload: unknown): string {
  return `/*O_o*/\ngoogle.visualization.Query.setResponse(${JSON.stringify(
    payload,
  )});`;
}

describe('unwrapGviz', () => {
  it('strips the JSONP wrapper and parses the payload', () => {
    const raw = buildRaw({
      version: '0.6',
      reqId: '0',
      status: 'ok',
      table: { cols: [{ id: 'A', label: 'brand', type: 'string' }], rows: [] },
    });
    const result = unwrapGviz(raw);
    expect(result.status).toBe('ok');
    expect(result.table?.cols).toHaveLength(1);
  });

  it('throws on a malformed wrapper', () => {
    expect(() => unwrapGviz('not a gviz response')).toThrow(SheetsParseError);
  });

  it('throws when gviz reports an error status', () => {
    const raw = buildRaw({
      version: '0.6',
      reqId: '0',
      status: 'error',
      errors: [{ message: 'Bad query' }],
    });
    expect(() => unwrapGviz(raw)).toThrow(SheetsParseError);
  });
});
