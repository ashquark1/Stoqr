import { TestBed } from '@angular/core/testing';
import { providePrimeNG } from 'primeng/config';
import { describe, expect, it } from 'vitest';

import { DataTable } from './data-table';

describe('DataTable', () => {
  it('renders column headers and cell values via displayValue', () => {
    TestBed.configureTestingModule({ providers: [providePrimeNG({})] });
    const fixture = TestBed.createComponent(DataTable);
    fixture.componentRef.setInput('columns', [
      { key: 'productName', header: 'Product Name' },
      { key: 'stockQty', header: 'Stock Qty', cellType: 'number' },
    ]);
    fixture.componentRef.setInput('rows', [{ productName: 'Oximeter', stockQty: null }]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Product Name');
    expect(text).toContain('Oximeter');
    expect(text).toContain('empty'); // null stockQty rendered as "empty"
  });

  // US-14: only sortable headers are clickable and emit; indicators reflect state.
  it('marks sortable headers, emits sortChange on click, and shows aria-sort', () => {
    TestBed.configureTestingModule({ providers: [providePrimeNG({})] });
    const fixture = TestBed.createComponent(DataTable);
    fixture.componentRef.setInput('columns', [
      { key: 'productName', header: 'Product Name', sortable: true },
      { key: 'sku', header: 'SKU' },
    ]);
    fixture.componentRef.setInput('rows', [{ productName: 'Oximeter', sku: 'X1' }]);
    fixture.componentRef.setInput('sort', { column: 'productName', direction: 'asc' });
    fixture.detectChanges();

    const ths = (fixture.nativeElement as HTMLElement).querySelectorAll('th');
    const [nameTh, skuTh] = Array.from(ths) as HTMLElement[];
    expect(nameTh.classList).toContain('is-sortable');
    expect(nameTh.getAttribute('aria-sort')).toBe('ascending');
    // Non-sortable header is inert.
    expect(skuTh.classList).not.toContain('is-sortable');
    expect(skuTh.getAttribute('aria-sort')).toBeNull();

    let emitted: string | undefined;
    fixture.componentInstance.sortChange.subscribe((k: string) => (emitted = k));
    nameTh.click();
    expect(emitted).toBe('productName');
    skuTh.click(); // inert — must not emit
    expect(emitted).toBe('productName');
  });
});
