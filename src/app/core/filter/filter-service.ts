import { Injectable, Signal, computed, signal } from '@angular/core';

import { StatusToggles } from '@core/product-status';

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

  /**
   * Reveal toggles for hidden product statuses (US-13). Both default OFF — only
   * Active is shown — and are reset on every new search/refresh (AC-12). Distinct
   * from the facet selections above: they relax the default hide rather than
   * narrow, so they are NOT counted in `activeCount`.
   */
  private readonly _showInactive = signal(false);
  private readonly _showDiscontinued = signal(false);
  readonly showInactive = this._showInactive.asReadonly();
  readonly showDiscontinued = this._showDiscontinued.asReadonly();

  /** The two toggles bundled for `applyStatusVisibility`. */
  readonly statusToggles = computed<StatusToggles>(() => ({
    showInactive: this._showInactive(),
    showDiscontinued: this._showDiscontinued(),
  }));

  setShowInactive(show: boolean): void {
    this._showInactive.set(show);
  }

  setShowDiscontinued(show: boolean): void {
    this._showDiscontinued.set(show);
  }

  /** Reset both reveal toggles to off (on a new search/refresh — AC-12). */
  resetStatusToggles(): void {
    this._showInactive.set(false);
    this._showDiscontinued.set(false);
  }

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

  /** Clear every facet back to "All" and turn off the reveal toggles. */
  reset(): void {
    for (const f of FACET_KEYS) {
      this.selected[f].set(new Set());
    }
    this.resetStatusToggles();
  }
}
