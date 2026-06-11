import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Product } from '@core/models/product';
import { ProductSearchStore } from '@core/search/product-search-store';
import { SheetsData } from '@core/sheets/sheets-data';
import { Badge } from '@shared/ui/badge/badge';
import { resolveStockVariant } from '@shared/ui/badge/stock-status';
import { DataTable, DataTableRow } from '@shared/ui/data-table/data-table';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { LoadingOverlay } from '@shared/ui/loading-overlay/loading-overlay';
import { Logo } from '@shared/ui/logo/logo';
import { Modal } from '@shared/ui/modal/modal';
import { Toast } from '@shared/ui/toast/toast';
import { displayValue } from '@shared/util/display-value';

import { PRODUCT_COLUMNS, PRODUCT_FIELD_GROUPS } from './product-fields';

/**
 * Search-as-primary-UI orchestrator. Drives the two layout states (hero ↔
 * active) and composes the shared UI kit with product config. Holds only view
 * state; data triggers go to SheetsData, query filtering/validation to
 * ProductSearchStore.
 */
@Component({
  selector: 'app-product-search',
  imports: [
    ReactiveFormsModule,
    Logo,
    DataTable,
    Modal,
    EmptyState,
    LoadingOverlay,
    Badge,
    Toast,
  ],
  templateUrl: './product-search.html',
  styleUrl: './product-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearch {
  private readonly store = inject(SheetsData);
  private readonly search = inject(ProductSearchStore);

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  protected readonly columns = PRODUCT_COLUMNS;
  protected readonly groups = PRODUCT_FIELD_GROUPS;

  protected readonly loading = this.store.loading;
  protected readonly refreshing = this.store.refreshing;
  protected readonly error = this.store.error;
  protected readonly hasSearched = this.store.hasSearched;
  /** True once a search is active — drives hero ↔ active layout. */
  protected readonly isSearchActive = this.store.hasSearched;

  protected readonly message = this.search.message;
  protected readonly visibleProducts = this.search.visibleProducts;
  protected readonly resultCount = computed(() => this.visibleProducts().length);
  protected readonly rows = computed<readonly DataTableRow[]>(
    () => this.visibleProducts() as unknown as readonly DataTableRow[],
  );

  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly modalOpen = computed(() => this.selectedProduct() !== null);

  private readonly stockStatusTpl =
    viewChild.required<TemplateRef<unknown>>('stockStatusTpl');
  private readonly stockQtyTpl =
    viewChild.required<TemplateRef<unknown>>('stockQtyTpl');

  protected readonly cellTemplates = computed<Record<string, TemplateRef<unknown>>>(
    () => ({
      stockStatus: this.stockStatusTpl(),
      stockQty: this.stockQtyTpl(),
    }),
  );

  protected onInput(): void {
    this.store.onSearchInput(this.searchControl.value);
  }

  protected onSearch(): void {
    this.store.searchNow(this.searchControl.value);
  }

  protected onRefresh(): void {
    this.store.refresh();
  }

  protected onRowSelect(row: DataTableRow): void {
    this.selectedProduct.set(row as unknown as Product);
  }

  protected onModalClose(): void {
    this.selectedProduct.set(null);
  }

  protected onRetry(): void {
    this.store.retry();
  }

  protected onDismissError(): void {
    this.store.dismissError();
  }

  protected display(value: string | number | null): string {
    return displayValue(value);
  }

  protected qtyClass(row: DataTableRow): string {
    return `qty qty--${resolveStockVariant(row['stockStatus'] as string)}`;
  }
}
