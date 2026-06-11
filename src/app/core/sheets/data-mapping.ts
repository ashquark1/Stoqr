import { Injectable } from '@angular/core';

import { Product } from '../models/product';
import { GvizCell, GvizTable } from './gviz-types';

/**
 * Internal sheet columns that must never reach the frontend (US-02).
 *
 * Single, configurable strip list: add a sheet column LABEL here to exclude it
 * from every mapped Product without touching any other code. The internal row
 * identifier (the `_row_id` concept) is the sheet column labelled `id`.
 */
export const INTERNAL_FIELDS = ['id'] as const;

/** How a sheet column maps onto a Product field. */
type FieldKind = 'string' | 'number' | 'date';
interface FieldDef {
  readonly key: keyof Product;
  /** Sheet header label (case-/whitespace-insensitive). */
  readonly label: string;
  readonly kind: FieldKind;
}

/**
 * The mapping contract: sheet header label -> Product field.
 *
 * Mapping is by LABEL (not column position), so reordering sheet columns does
 * not corrupt data. This is an allowlist: any column not listed here — including
 * the internal `id` — can never appear on a Product. `INTERNAL_FIELDS` is the
 * explicit, configurable second line of defence on top of that.
 */
const FIELD_DEFS: readonly FieldDef[] = [
  { key: 'brand', label: 'brand', kind: 'string' },
  { key: 'productName', label: 'product name', kind: 'string' },
  { key: 'category', label: 'category', kind: 'string' },
  { key: 'subCategory', label: 'sub category', kind: 'string' },
  { key: 'sku', label: 'sku', kind: 'string' },
  { key: 'size', label: 'size', kind: 'string' },
  { key: 'color', label: 'color', kind: 'string' },
  { key: 'unitOfMeasure', label: 'unit of measure', kind: 'string' },
  // Sheet type is number, interface type is string -> coerced to string.
  { key: 'packing', label: 'packing', kind: 'string' },
  { key: 'stockQty', label: 'stock qty', kind: 'number' },
  { key: 'lowStockThreshold', label: 'low stock threshold', kind: 'number' },
  // Read verbatim from the sheet — never derived from quantity (AI_CONTRACT).
  { key: 'stockStatus', label: 'stock status', kind: 'string' },
  { key: 'mrp', label: 'mrp', kind: 'number' },
  { key: 'sellingPrice', label: 'selling price', kind: 'number' },
  { key: 'purchasePrice', label: 'purchase price', kind: 'number' },
  { key: 'taxRate', label: 'tax rate', kind: 'number' },
  { key: 'status', label: 'status', kind: 'string' },
  { key: 'notes', label: 'notes', kind: 'string' },
  // datetime columns -> use the human-readable formatted value as a string.
  { key: 'lastUpdated', label: 'last updated', kind: 'date' },
  { key: 'createdAt', label: 'created at', kind: 'date' },
];

function normalizeLabel(label: string | undefined): string {
  return (label ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** String cells (and the number-typed `packing`) -> string, blank -> ''. */
function toStringField(cell: GvizCell | null | undefined): string {
  const v = cell?.v;
  if (v == null) {
    return '';
  }
  return typeof v === 'string' ? v : cell?.f ?? String(v);
}

/** Numeric cells -> number; missing/blank/unparseable -> null (never 0). */
function toNumberField(cell: GvizCell | null | undefined): number | null {
  const v = cell?.v;
  if (v == null) {
    return null;
  }
  if (typeof v === 'number') {
    return v;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** datetime cells -> formatted string (`f`), blank -> ''. */
function toDateField(cell: GvizCell | null | undefined): string {
  if (cell?.f != null) {
    return cell.f;
  }
  return typeof cell?.v === 'string' ? cell.v : '';
}

/**
 * Pure mapping of a gviz table into typed products, stripping internal columns.
 *
 * @param internalLabels columns to strip (defaults to INTERNAL_FIELDS). Passing
 * a custom list lets callers/tests verify the strip list is data-driven (AC-06).
 * @returns one Product per row; an absent table or zero rows yields `[]`.
 */
export function mapTableToProducts(
  table: GvizTable | undefined,
  internalLabels: readonly string[] = INTERNAL_FIELDS,
): Product[] {
  if (!table || table.rows.length === 0) {
    return [];
  }

  const internal = new Set(internalLabels.map(normalizeLabel));

  // Resolve each non-internal column to its index once, up front. Internal
  // columns are dropped here, so they are never even addressable during mapping.
  const indexByLabel = new Map<string, number>();
  table.cols.forEach((col, i) => {
    const label = normalizeLabel(col.label);
    if (internal.has(label)) {
      return;
    }
    indexByLabel.set(label, i);
  });

  return table.rows.map((row) => {
    const cellFor = (label: string): GvizCell | null | undefined => {
      const i = indexByLabel.get(label);
      return i === undefined ? undefined : row.c[i];
    };

    const product: Record<keyof Product, string | number | null> = {} as Record<
      keyof Product,
      string | number | null
    >;

    for (const def of FIELD_DEFS) {
      const cell = cellFor(def.label);
      product[def.key] =
        def.kind === 'number'
          ? toNumberField(cell)
          : def.kind === 'date'
            ? toDateField(cell)
            : toStringField(cell);
    }

    return product as unknown as Product;
  });
}

/**
 * Injectable mapping service: the single seam between the raw gviz response and
 * all product consumers. Strips internal fields (US-02) and maps rows to the
 * typed `Product` model. Stateless and reusable (`providedIn: 'root'`).
 */
@Injectable({ providedIn: 'root' })
export class DataMapping {
  /** Map a parsed gviz table into typed products with internal fields stripped. */
  toProducts(table: GvizTable | undefined): Product[] {
    return mapTableToProducts(table, INTERNAL_FIELDS);
  }
}
