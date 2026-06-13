/** Cell rendering hints for the generic data table. */
export type CellType = 'text' | 'mono' | 'number' | 'timestamp';

/**
 * Declarative column definition for `<stoqr-data-table>`. Features supply an
 * array of these; the table renders generically. Keeps "which columns" (feature
 * concern) separate from "how to render a table" (shared concern).
 */
export interface ColumnDef {
  /** Property key read from each row object. */
  readonly key: string;
  /** Column header text. */
  readonly header: string;
  /** Drives the themed cell class; defaults to plain text. */
  readonly cellType?: CellType;
  /** Optional extra class applied to the cell. */
  readonly cssClass?: string;
  /** Whether this column's header is clickable to sort (US-14). */
  readonly sortable?: boolean;
}
