/**
 * A single labelled field within a modal group. Generic over the row type so
 * `key` is constrained to real properties of `T`.
 */
export interface FieldDef<T = unknown> {
  readonly key: keyof T & string;
  readonly label: string;
  /** Render the value in a monospace style (e.g. SKUs). */
  readonly mono?: boolean;
  /** Render the value as a stock-status badge instead of plain text. */
  readonly badge?: boolean;
}

/** A titled group of fields, used to lay out a read-only detail modal. */
export interface FieldGroup<T = unknown> {
  readonly title: string;
  readonly fields: readonly FieldDef<T>[];
}
