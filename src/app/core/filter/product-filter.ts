import { Product } from '@core/models/product';
import { resolveStockVariant } from '@core/stock-status';

/** The facets a product can be filtered by. */
export type FacetKey = 'status' | 'category' | 'subCategory' | 'brand';

export const FACET_KEYS: readonly FacetKey[] = [
  'status',
  'category',
  'subCategory',
  'brand',
];

/**
 * The filter value of a product for each facet. Status is matched by its
 * canonical variant (so "In Stock"/blank map consistently); the rest by raw
 * field value.
 */
export const facetValue: Readonly<Record<FacetKey, (p: Product) => string>> = {
  status: (p) => resolveStockVariant(p.stockStatus),
  category: (p) => p.category,
  subCategory: (p) => p.subCategory,
  brand: (p) => p.brand,
};

/** Selected values per facet (EMPTY set = "All" = facet not filtering). */
export type SelectedFilters = Readonly<Record<FacetKey, ReadonlySet<string>>>;

/** A selectable filter option; `disabled` greys out values absent from results. */
export interface FilterOption {
  readonly label: string;
  readonly value: string;
  readonly disabled: boolean;
}

/** Distinct, non-empty values of a field across the given products. */
export function distinctValues(
  products: readonly Product[],
  value: (p: Product) => string,
): string[] {
  const seen = new Set<string>();
  for (const p of products) {
    const v = value(p);
    if (v.trim() !== '') {
      seen.add(v);
    }
  }
  return [...seen];
}

/**
 * Pure facet filtering: a product passes when, for every facet, the facet is
 * either unset (empty = "All") or its value is one of the selected values.
 */
export function applyFilters(
  products: readonly Product[],
  selected: SelectedFilters,
): Product[] {
  return products.filter((p) =>
    FACET_KEYS.every((facet) => {
      const sel = selected[facet];
      return sel.size === 0 || sel.has(facetValue[facet](p));
    }),
  );
}
