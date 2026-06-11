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
});
