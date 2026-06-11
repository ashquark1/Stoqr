import { Injectable, computed, inject } from '@angular/core';

import { Product } from '@core/models/product';
import { SheetsData } from '@core/sheets/sheets-data';

import { filterProducts } from './product-matcher';
import { SearchValidation } from './search-validation';

/**
 * Search/view layer over the data-access service. Owns query-driven filtering
 * and validation, derived from `SheetsData` (which owns the term + cache).
 * Components read `visibleProducts`/`message` here; data triggers stay in
 * `SheetsData`. Keeping the filter here keeps it out of components and out of
 * the pure Sheets mapper (projectmap: search logic lives in a service).
 */
@Injectable({ providedIn: 'root' })
export class ProductSearchStore {
  private readonly sheets = inject(SheetsData);
  private readonly validation = inject(SearchValidation);

  /** Validation message for the current query (e.g. secondary-only), or null. */
  readonly message = computed<string | null>(() =>
    this.validation.validate(this.sheets.searchTerm(), this.sheets.results()),
  );

  /** Active products narrowed by the current query (empty when invalid). */
  readonly visibleProducts = computed<readonly Product[]>(() =>
    this.message()
      ? []
      : filterProducts(this.sheets.results(), this.sheets.searchTerm()),
  );
}
