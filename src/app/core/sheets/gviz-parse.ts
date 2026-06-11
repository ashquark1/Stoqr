import { GvizResponse } from './gviz-types';

/**
 * Pure parsing of the gviz transport envelope. Turning the raw text into a typed
 * `Product[]` is split in two: this module unwraps the JSONP envelope, and
 * `data-mapping.ts` maps the table to products (and strips internal fields).
 */

/** Thrown when the gviz payload cannot be unwrapped/parsed or reports failure. */
export class SheetsParseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'SheetsParseError';
  }
}

const GVIZ_PREFIX = 'google.visualization.Query.setResponse(';

/**
 * Strips the JSONP wrapper (`/*O_o*\/ ... setResponse( {…} );`) and parses the
 * inner JSON. Throws SheetsParseError on malformed input or a non-ok status.
 */
export function unwrapGviz(raw: string): GvizResponse {
  const start = raw.indexOf(GVIZ_PREFIX);
  const end = raw.lastIndexOf(')');
  if (start === -1 || end === -1 || end <= start) {
    throw new SheetsParseError('Unrecognised gviz response wrapper.');
  }

  const json = raw.slice(start + GVIZ_PREFIX.length, end);

  let parsed: GvizResponse;
  try {
    parsed = JSON.parse(json) as GvizResponse;
  } catch (cause) {
    throw new SheetsParseError('Failed to parse gviz JSON payload.', { cause });
  }

  if (parsed.status === 'error') {
    const reason =
      parsed.errors?.[0]?.detailed_message ??
      parsed.errors?.[0]?.message ??
      'unknown error';
    throw new SheetsParseError(`gviz query failed: ${reason}`);
  }

  return parsed;
}
