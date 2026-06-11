/**
 * Typed shapes for the raw Google Visualization API (gviz) response.
 *
 * The gviz endpoint returns JSONP-wrapped text:
 *   /*O_o*\/\ngoogle.visualization.Query.setResponse({ ... });
 *
 * These types describe the parsed payload only. They are internal to the
 * data-access layer and must never leak out as the public product shape.
 */

/** Column types reported by gviz. */
export type GvizColumnType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timeofday';

export interface GvizColumn {
  readonly id: string;
  /** Header label (present because the sheet has a header row). */
  readonly label?: string;
  readonly type: GvizColumnType;
  readonly pattern?: string;
}

export interface GvizCell {
  /** Raw value: number for numeric/typed cells, string for text, etc. */
  readonly v: string | number | boolean | null;
  /** Formatted display value, when gviz provides one. */
  readonly f?: string;
}

export interface GvizRow {
  /** Cells, positionally aligned to `cols`. May contain nulls for blanks. */
  readonly c: ReadonlyArray<GvizCell | null>;
}

export interface GvizTable {
  readonly cols: readonly GvizColumn[];
  readonly rows: readonly GvizRow[];
  readonly parsedNumHeaders?: number;
}

export interface GvizResponse {
  readonly version: string;
  readonly reqId: string;
  readonly status: 'ok' | 'warning' | 'error';
  readonly sig?: string;
  readonly table?: GvizTable;
  readonly errors?: ReadonlyArray<{
    readonly reason?: string;
    readonly message?: string;
    readonly detailed_message?: string;
  }>;
}
