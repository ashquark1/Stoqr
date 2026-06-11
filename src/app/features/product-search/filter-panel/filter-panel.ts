import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FilterService } from '@core/filter/filter-service';
import { ProductSearchStore } from '@core/search/product-search-store';
import { FilterSelect } from '@shared/ui/filter-select/filter-select';

/**
 * Collapsible filter panel. Renders one dropdown per facet (Stock Status here;
 * Category/Sub-category/Brand and the Show-Inactive/Discontinued toggles land in
 * US-09/10/13) plus Reset Filters. Reads option lists from the search store and
 * writes selections to the FilterService (single source of truth).
 */
@Component({
  selector: 'app-filter-panel',
  imports: [FilterSelect],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanel {
  private readonly store = inject(ProductSearchStore);
  private readonly filters = inject(FilterService);

  protected readonly statusOptions = this.store.statusOptions;
  protected readonly statusSelected = this.store.statusSelected;

  protected onStatus(values: string[]): void {
    this.filters.setSelected('status', values);
  }

  protected reset(): void {
    this.filters.reset();
  }
}
