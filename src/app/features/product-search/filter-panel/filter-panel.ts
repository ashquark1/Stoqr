import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FilterService } from '@core/filter/filter-service';
import { ProductSearchStore } from '@core/search/product-search-store';
import { FilterSelect } from '@shared/ui/filter-select/filter-select';
import { Toggle } from '@shared/ui/toggle/toggle';

/**
 * Collapsible filter panel. Renders one dropdown per facet (Stock Status,
 * Category, Sub-category, Brand), the Show-Inactive/Discontinued reveal toggles
 * (US-13), and Reset Filters. Reads option lists + toggle state from the search
 * store and writes selections/toggles to the FilterService (single source of truth).
 */
@Component({
  selector: 'app-filter-panel',
  imports: [FilterSelect, Toggle],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanel {
  private readonly store = inject(ProductSearchStore);
  private readonly filters = inject(FilterService);

  protected readonly statusOptions = this.store.statusOptions;
  protected readonly statusSelected = this.store.statusSelected;
  protected readonly categoryOptions = this.store.categoryOptions;
  protected readonly categorySelected = this.store.categorySelected;
  protected readonly subCategoryOptions = this.store.subCategoryOptions;
  protected readonly subCategorySelected = this.store.subCategorySelected;
  protected readonly brandOptions = this.store.brandOptions;
  protected readonly brandSelected = this.store.brandSelected;
  protected readonly showInactive = this.store.showInactive;
  protected readonly showDiscontinued = this.store.showDiscontinued;

  protected onStatus(values: string[]): void {
    this.filters.setSelected('status', values);
  }

  protected onCategory(values: string[]): void {
    this.filters.setSelected('category', values);
  }

  protected onSubCategory(values: string[]): void {
    this.filters.setSelected('subCategory', values);
  }

  protected onBrand(values: string[]): void {
    this.filters.setSelected('brand', values);
  }

  protected onShowInactive(show: boolean): void {
    this.filters.setShowInactive(show);
  }

  protected onShowDiscontinued(show: boolean): void {
    this.filters.setShowDiscontinued(show);
  }

  protected reset(): void {
    this.filters.reset();
  }
}
