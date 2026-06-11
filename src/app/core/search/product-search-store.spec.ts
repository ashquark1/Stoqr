import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '@env/environment';
import { FilterService } from '@core/filter/filter-service';
import { SheetsData } from '@core/sheets/sheets-data';

import { ProductSearchStore } from './product-search-store';
import { SECONDARY_ONLY_MESSAGE } from './search-validation';

function rawWithCats(
  rows: ReadonlyArray<{ name: string; category: string; subCategory: string }>,
): string {
  const table = {
    cols: [
      { id: 'A', label: 'id', type: 'number' },
      { id: 'B', label: 'product name', type: 'string' },
      { id: 'C', label: 'category', type: 'string' },
      { id: 'D', label: 'sub category', type: 'string' },
      { id: 'E', label: 'status', type: 'string' },
    ],
    rows: rows.map((r, i) => ({
      c: [{ v: i + 1 }, { v: r.name }, { v: r.category }, { v: r.subCategory }, { v: 'Active' }],
    })),
  };
  return (
    '/*O_o*/\ngoogle.visualization.Query.setResponse(' +
    JSON.stringify({ version: '0.6', reqId: '0', status: 'ok', table }) +
    ');'
  );
}

function rawWithStock(
  rows: ReadonlyArray<{ name: string; stockStatus: string }>,
): string {
  const table = {
    cols: [
      { id: 'A', label: 'id', type: 'number' },
      { id: 'B', label: 'product name', type: 'string' },
      { id: 'C', label: 'stock status', type: 'string' },
      { id: 'D', label: 'status', type: 'string' },
    ],
    rows: rows.map((r, i) => ({
      c: [{ v: i + 1 }, { v: r.name }, { v: r.stockStatus }, { v: 'Active' }],
    })),
  };
  return (
    '/*O_o*/\ngoogle.visualization.Query.setResponse(' +
    JSON.stringify({ version: '0.6', reqId: '0', status: 'ok', table }) +
    ');'
  );
}

const URL = environment.sheets.gvizUrl;

interface Row {
  name: string;
  color: string;
  status: string;
}

function rawWith(rows: readonly Row[]): string {
  const table = {
    cols: [
      { id: 'A', label: 'id', type: 'number' },
      { id: 'B', label: 'product name', type: 'string' },
      { id: 'C', label: 'color', type: 'string' },
      { id: 'D', label: 'status', type: 'string' },
    ],
    rows: rows.map((r, i) => ({ c: [{ v: i + 1 }, { v: r.name }, { v: r.color }, { v: r.status }] })),
  };
  return (
    '/*O_o*/\ngoogle.visualization.Query.setResponse(' +
    JSON.stringify({ version: '0.6', reqId: '0', status: 'ok', table }) +
    ');'
  );
}

describe('ProductSearchStore', () => {
  let sheets: SheetsData;
  let store: ProductSearchStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    sheets = TestBed.inject(SheetsData);
    store = TestBed.inject(ProductSearchStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('filters cached active products by the query (AC-11/14)', () => {
    sheets.searchNow('oximeter');
    httpMock.expectOne(URL).flush(
      rawWith([
        { name: 'Pulse Oximeter', color: 'Blue', status: 'Active' },
        { name: 'Bandage Roll', color: 'White', status: 'Active' },
      ]),
    );
    expect(store.visibleProducts().map((p) => p.productName)).toEqual([
      'Pulse Oximeter',
    ]);
    expect(store.message()).toBeNull();
  });

  it('surfaces the secondary-only message and hides results (AC-13)', () => {
    sheets.searchNow('blue');
    httpMock.expectOne(URL).flush(
      rawWith([{ name: 'Pulse Oximeter', color: 'Blue', status: 'Active' }]),
    );
    expect(store.message()).toBe(SECONDARY_ONLY_MESSAGE);
    expect(store.visibleProducts()).toEqual([]);
  });

  // US-08: the Stock Status facet narrows visible products locally.
  it('narrows visible products by the Stock Status facet', () => {
    const filters = TestBed.inject(FilterService);
    sheets.searchNow('oximeter');
    httpMock.expectOne(URL).flush(
      rawWithStock([
        { name: 'Oximeter A', stockStatus: 'In Stock' },
        { name: 'Oximeter B', stockStatus: 'Low Stock' },
      ]),
    );
    expect(store.visibleProducts()).toHaveLength(2);

    filters.setSelected('status', ['low-stock']);
    expect(store.visibleProducts().map((p) => p.productName)).toEqual([
      'Oximeter B',
    ]);
    expect(store.statusSelected()).toEqual(['low-stock']);
  });

  // US-09: category/sub-category options derive from data; sub-category cascades.
  it('derives category options and cascades sub-category on selected categories', () => {
    const filters = TestBed.inject(FilterService);
    sheets.searchNow('item');
    httpMock.expectOne(URL).flush(
      rawWithCats([
        { name: 'item 1', category: 'Devices', subCategory: 'Monitoring' },
        { name: 'item 2', category: 'Devices', subCategory: 'Imaging' },
        { name: 'item 3', category: 'Consumables', subCategory: 'Gauze' },
      ]),
    );

    expect(store.categoryOptions().map((o) => o.value)).toEqual([
      'Consumables',
      'Devices',
    ]);
    // No category selected → all sub-categories available.
    expect(store.subCategoryOptions().map((o) => o.value)).toEqual([
      'Gauze',
      'Imaging',
      'Monitoring',
    ]);

    // Select Devices → sub-category scoped to Devices, results narrowed.
    filters.setSelected('category', ['Devices']);
    expect(store.subCategoryOptions().map((o) => o.value)).toEqual([
      'Imaging',
      'Monitoring',
    ]);
    expect(store.visibleProducts().map((p) => p.productName)).toEqual([
      'item 1',
      'item 2',
    ]);
  });
});
