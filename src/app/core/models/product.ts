/**
 * Typed product model — the V1 frontend schema.
 *
 * Source of truth: a single Google Sheet (read-only in V1). Raw sheet rows are
 * mapped into this shape by `core/sheets/gviz-parse.ts`.
 *
 * Domain rules (see docs/AI_CONTRACT.md and docs/projectmap.md):
 * - The internal sheet column `id` (`_row_id`) is NEVER part of this model and
 *   never reaches the frontend (US-02).
 * - Numeric fields are nullable: a missing/empty cell maps to `null`, not `0`,
 *   so the UI can show it as "empty" without misrepresenting a real zero.
 * - Stock status is read verbatim from the sheet — never derived client-side.
 */
export interface Product {
  readonly productName: string;
  readonly brand: string;
  readonly category: string;
  readonly subCategory: string;
  readonly sku: string;
  readonly size: string;
  readonly color: string;
  readonly unitOfMeasure: string;
  readonly packing: string;
  readonly stockQty: number | null;
  readonly lowStockThreshold: number | null;
  readonly stockStatus: string;
  readonly mrp: number | null;
  readonly sellingPrice: number | null;
  readonly purchasePrice: number | null;
  readonly taxRate: number | null;
  readonly status: string;
  readonly notes: string;
  readonly lastUpdated: string;
  readonly createdAt: string;
}
