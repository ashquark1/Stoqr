import { Injectable, computed, effect, inject } from '@angular/core';

import { FilterService } from '@core/filter/filter-service';
import {
  FacetKey,
  FilterOption,
  applyFilters,
  distinctValues,
  facetValue,
} from '@core/filter/product-filter';
import { Product } from '@core/models/product';
import { applyStatusVisibility } from '@core/product-status';
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

  constructor() {
    // US-13 AC-12: the reveal toggles default off and reset on every new
    // search/refresh. Each such action ends in a successful fetch (fetchedAt
    // advances); local typing within a session never fetches, so it preserves
    // the toggles. This is the single hook that captures exactly "new search
    // and refresh".
    effect(() => {
      this.sheets.fetchedAt();
      this.filters.resetStatusToggles();
    });
  }

  /**
   * The visible universe (US-13): Active products always, plus Inactive and/or
   * Discontinued when their toggle is on. This replaces the legacy Active-only
   * `SheetsData.results` as the base everything below derives from, so the
   * status filter is applied in the core layer before any component — and the
   * facet options + count below exclude hidden products automatically.
   */
  readonly statusVisible = computed<readonly Product[]>(() =>
    applyStatusVisibility(this.sheets.products(), this.filters.statusToggles()),
  );

  /** Validation message for the current query (e.g. secondary-only), or null. */
  readonly message = computed<string | null>(() =>
    this.validation.validate(this.sheets.searchTerm(), this.statusVisible()),
  );

  /**
   * Visible products narrowed by the query, BEFORE facet filters. Drives the
   * option lists and their zero-result greying (US-08/09/10).
   */
  readonly searchResults = computed<readonly Product[]>(() =>
    this.message()
      ? []
      : filterProducts(this.statusVisible(), this.sheets.searchTerm()),
  );

  /** Final list shown in the table: search results narrowed by facet filters. */
  readonly visibleProducts = computed<readonly Product[]>(() =>
    applyFilters(this.searchResults(), this.filters.selectedFilters()),
  );

  /** Whether any facet filter is currently narrowing results. */
  readonly hasActiveFilters = computed(() => this.filters.activeCount() > 0);

  // ----- Status reveal toggles (US-13): state lives in FilterService -----
  readonly showInactive = this.filters.showInactive;
  readonly showDiscontinued = this.filters.showDiscontinued;

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

  // ----- Category & Sub-category facets (US-09) -----
  /** Data-driven options for a facet, greyed when absent from the search. */
  private optionsFrom(facet: FacetKey, source: readonly Product[]): FilterOption[] {
    const value = facetValue[facet];
    const present = new Set(this.searchResults().map(value));
    return distinctValues(source, value)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ label: v, value: v, disabled: !present.has(v) }));
  }

  readonly categoryOptions = computed<FilterOption[]>(() =>
    this.optionsFrom('category', this.statusVisible()),
  );
  readonly categorySelected = computed<string[]>(() => [
    ...this.filters.selectedFor('category')(),
  ]);

  /** Sub-category options cascade on the selected categories (AC-04/05). */
  private readonly subCategoryScope = computed<readonly Product[]>(() => {
    const cats = this.filters.selectedFor('category')();
    const visible = this.statusVisible();
    return cats.size === 0 ? visible : visible.filter((p) => cats.has(p.category));
  });

  readonly subCategoryOptions = computed<FilterOption[]>(() =>
    this.optionsFrom('subCategory', this.subCategoryScope()),
  );
  readonly subCategorySelected = computed<string[]>(() => [
    ...this.filters.selectedFor('subCategory')(),
  ]);

  // ----- Brand facet (US-10): always all brands, independent of category -----
  readonly brandOptions = computed<FilterOption[]>(() =>
    this.optionsFrom('brand', this.statusVisible()),
  );
  readonly brandSelected = computed<string[]>(() => [
    ...this.filters.selectedFor('brand')(),
  ]);
}
