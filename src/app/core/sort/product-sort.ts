import { Product } from '@core/models/product';

/** Columns the results can be sorted by (US-14 AC-01/02). */
export type SortColumn = 'productName' | 'stockQty';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  readonly column: SortColumn;
  readonly direction: SortDirection;
}

/**
 * Pure, stable sort of the (already-filtered) products. `null` returns the list
 * unchanged (sheet order — AC-13). Product Name is case-insensitive
 * alphabetical; Stock Qty is numeric with empty stock (`null`) always last in
 * both directions (so "empty" is never read as a real low/high quantity).
 *
 * Stable: equal keys keep their incoming (sheet) order, so ties are deterministic.
 */
export function sortProducts(
  products: readonly Product[],
  sort: SortState | null,
): readonly Product[] {
  if (sort === null) {
    return products;
  }
  const dir = sort.direction === 'asc' ? 1 : -1;

  if (sort.column === 'productName') {
    return [...products].sort(
      (a, b) =>
        dir *
        a.productName.localeCompare(b.productName, undefined, {
          sensitivity: 'base',
        }),
    );
  }

  // Stock Qty: numeric, but empty (`null`) is always last — the null check is
  // applied BEFORE the direction factor, so nulls stay at the bottom either way.
  return [...products].sort((a, b) => {
    const av = a.stockQty;
    const bv = b.stockQty;
    if (av === null && bv === null) return 0;
    if (av === null) return 1; // a (empty) sorts after b
    if (bv === null) return -1; // b (empty) sorts after a
    return dir * (av - bv);
  });
}
