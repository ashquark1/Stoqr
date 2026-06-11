import { Injectable, computed, inject } from '@angular/core';

import { FilterService } from '@core/filter/filter-service';
import { FilterOption, applyFilters } from '@core/filter/product-filter';
import { Product } from '@core/models/product';
import { SheetsData } from '@core/sheets/sheets-data';
import { STOCK_VARIANTS, resolveStockVariant } from '@core/stock-status';

import { filterProducts } from './product-matcher';
import { SearchValidation } from './search-validation';

/**
 * Search/view layer over the data-access service. Owns query-driven filtering,
 * facet filtering, and validation — all derived from `SheetsData` (term + cache)
 * and `FilterService` (filter state). Components read `visibleProducts`/`message`
 * and the facet option lists here; data triggers stay in `SheetsData`.
 */
@Injectable({ providedIn: 'root' })
export class ProductSearchStore {
  private readonly sheets = inject(SheetsData);
  private readonly validation = inject(SearchValidation);
  private readonly filters = inject(FilterService);

  /** Validation message for the current query (e.g. secondary-only), or null. */
  readonly message = computed<string | null>(() =>
    this.validation.validate(this.sheets.searchTerm(), this.sheets.results()),
  );

  /**
   * Active products narrowed by the query, BEFORE facet filters. Drives the
   * option lists and their zero-result greying (US-08/09/10).
   */
  readonly searchResults = computed<readonly Product[]>(() =>
    this.message()
      ? []
      : filterProducts(this.sheets.results(), this.sheets.searchTerm()),
  );

  /** Final list shown in the table: search results narrowed by facet filters. */
  readonly visibleProducts = computed<readonly Product[]>(() =>
    applyFilters(this.searchResults(), this.filters.selectedFilters()),
  );

  /** Whether any facet filter is currently narrowing results. */
  readonly hasActiveFilters = computed(() => this.filters.activeCount() > 0);

  // ----- Stock Status facet (US-08) -----
  /** Fixed four options (AC-05); greyed when absent from the current search. */
  readonly statusOptions = computed<FilterOption[]>(() => {
    const present = new Set(
      this.searchResults().map((p) => resolveStockVariant(p.stockStatus)),
    );
    return STOCK_VARIANTS.map((v) => ({
      label: v.label,
      value: v.value,
      disabled: !present.has(v.value),
    }));
  });

  /** Real selected values (empty = "All"). */
  readonly statusSelected = computed<string[]>(() => [
    ...this.filters.selectedFor('status')(),
  ]);
}
