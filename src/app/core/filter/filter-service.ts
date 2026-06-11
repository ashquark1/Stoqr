import { Injectable, Signal, computed, signal } from '@angular/core';

import { FACET_KEYS, FacetKey, SelectedFilters } from './product-filter';

/**
 * Single source of truth for filter STATE across US-08/09/10 (status, category,
 * sub-category, brand). Holds the SELECTED values per facet — default EMPTY,
 * which means "All" (no filter). Selecting real values narrows; an explicit
 * "All" in the UI clears back to empty. Selections persist across searches and
 * refresh.
 *
 * Holds no product data and applies no filtering itself (that's the pure
 * `applyFilters`), so it never forms a DI cycle with the search store.
 */
@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly selected: Readonly<
    Record<FacetKey, ReturnType<typeof signal<ReadonlySet<string>>>>
  > = {
    status: signal<ReadonlySet<string>>(new Set()),
    category: signal<ReadonlySet<string>>(new Set()),
    subCategory: signal<ReadonlySet<string>>(new Set()),
    brand: signal<ReadonlySet<string>>(new Set()),
  };

  /** The selected-values signal for a facet (read-only view). */
  selectedFor(facet: FacetKey): Signal<ReadonlySet<string>> {
    return this.selected[facet].asReadonly();
  }

  /** All selected sets, for `applyFilters`. */
  readonly selectedFilters = computed<SelectedFilters>(() => ({
    status: this.selected.status(),
    category: this.selected.category(),
    subCategory: this.selected.subCategory(),
    brand: this.selected.brand(),
  }));

  /** Record a facet's selection (empty = "All" = no filter). */
  setSelected(facet: FacetKey, selected: readonly string[]): void {
    this.selected[facet].set(new Set(selected));
  }

  /** Number of facets currently filtering (drives the "Filters (N)" badge). */
  readonly activeCount = computed(
    () => FACET_KEYS.filter((f) => this.selected[f]().size > 0).length,
  );

  /** Clear every facet back to "All". */
  reset(): void {
    for (const f of FACET_KEYS) {
      this.selected[f].set(new Set());
    }
  }
}
