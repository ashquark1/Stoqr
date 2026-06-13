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
import { SortService } from '@core/sort/sort-service';

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

function rawWithBrand(
  rows: ReadonlyArray<{ name: string; brand: string; category: string }>,
): string {
  const table = {
    cols: [
      { id: 'A', label: 'id', type: 'number' },
      { id: 'B', label: 'product name', type: 'string' },
      { id: 'C', label: 'brand', type: 'string' },
      { id: 'D', label: 'category', type: 'string' },
      { id: 'E', label: 'status', type: 'string' },
    ],
    rows: rows.map((r, i) => ({
      c: [{ v: i + 1 }, { v: r.name }, { v: r.brand }, { v: r.category }, { v: 'Active' }],
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

  // US-10: brand options are independent of category; brand facet filters.
  it('derives brand options independent of category and filters by brand', () => {
    const filters = TestBed.inject(FilterService);
    sheets.searchNow('item');
    httpMock.expectOne(URL).flush(
      rawWithBrand([
        { name: 'item 1', brand: 'Dr Trust', category: 'Devices' },
        { name: 'item 2', brand: 'BPL', category: 'Consumables' },
      ]),
    );
    expect(store.brandOptions().map((o) => o.value)).toEqual(['BPL', 'Dr Trust']);

    // Selecting a category must not change the brand options (AC-04).
    filters.setSelected('category', ['Devices']);
    expect(store.brandOptions().map((o) => o.value)).toEqual(['BPL', 'Dr Trust']);

    filters.reset();
    filters.setSelected('brand', ['BPL']);
    expect(store.visibleProducts().map((p) => p.productName)).toEqual(['item 2']);
  });

  // ----- US-13: status visibility -----

  it('shows only Active products by default; toggles reveal the rest (AC-01/02/03/08/09)', () => {
    const filters = TestBed.inject(FilterService);
    sheets.searchNow('item');
    httpMock.expectOne(URL).flush(
      rawWith([
        { name: 'item A', color: 'x', status: 'Active' },
        { name: 'item B', color: 'x', status: 'Inactive' },
        { name: 'item C', color: 'x', status: 'Discontinued' },
      ]),
    );
    // Default: Active only.
    expect(store.visibleProducts().map((p) => p.productName)).toEqual(['item A']);

    filters.setShowInactive(true);
    expect(store.visibleProducts().map((p) => p.productName)).toEqual([
      'item A',
      'item B',
    ]);

    filters.setShowDiscontinued(true);
    expect(store.visibleProducts().map((p) => p.productName)).toEqual([
      'item A',
      'item B',
      'item C',
    ]);
  });

  it('excludes hidden products from facet options and the count (AC-06/07)', () => {
    const filters = TestBed.inject(FilterService);
    sheets.searchNow('item');
    httpMock.expectOne(URL).flush(
      rawCatStatus([
        { name: 'item A', category: 'Devices', status: 'Active' },
        { name: 'item B', category: 'Legacy', status: 'Discontinued' },
      ]),
    );
    // Discontinued "Legacy" must not appear in options or the count by default.
    expect(store.categoryOptions().map((o) => o.value)).toEqual(['Devices']);
    expect(store.visibleProducts()).toHaveLength(1);

    filters.setShowDiscontinued(true);
    expect(store.categoryOptions().map((o) => o.value)).toEqual([
      'Devices',
      'Legacy',
    ]);
    expect(store.visibleProducts()).toHaveLength(2);
  });

  it('resets the reveal toggles on the next successful fetch (AC-12)', () => {
    const filters = TestBed.inject(FilterService);
    sheets.searchNow('item');
    httpMock
      .expectOne(URL)
      .flush(rawWith([{ name: 'item A', color: 'x', status: 'Active' }]));

    filters.setShowInactive(true);
    expect(filters.showInactive()).toBe(true);

    sheets.refresh();
    httpMock
      .expectOne(URL)
      .flush(rawWith([{ name: 'item A', color: 'x', status: 'Active' }]));
    TestBed.tick();
    expect(filters.showInactive()).toBe(false);
  });

  // ----- US-14: sort -----

  it('applies the sort to the filtered results, nulls last (AC-01/13)', () => {
    const sorting = TestBed.inject(SortService);
    sheets.searchNow('item');
    httpMock.expectOne(URL).flush(
      rawWithQty([
        { name: 'item a', qty: 30 },
        { name: 'item b', qty: 5 },
        { name: 'item c', qty: null },
      ]),
    );
    // Default: sheet order.
    expect(store.sortedProducts().map((p) => p.productName)).toEqual([
      'item a',
      'item b',
      'item c',
    ]);

    sorting.cycle('stockQty'); // ascending
    expect(store.sortedProducts().map((p) => p.productName)).toEqual([
      'item b',
      'item a',
      'item c',
    ]);
    // The count is the unsorted filtered set — unaffected by sort.
    expect(store.visibleProducts()).toHaveLength(3);
  });

  it('keeps the sort across a refresh (AC-11)', () => {
    const sorting = TestBed.inject(SortService);
    const rows = [
      { name: 'item a', qty: 30 },
      { name: 'item b', qty: 5 },
    ];
    sheets.searchNow('item');
    httpMock.expectOne(URL).flush(rawWithQty(rows));
    TestBed.tick(); // flush the new-search reset effect, as it would in the app
    sorting.cycle('stockQty');
    expect(store.sortedProducts().map((p) => p.productName)).toEqual([
      'item b',
      'item a',
    ]);

    sheets.refresh();
    httpMock.expectOne(URL).flush(rawWithQty(rows));
    TestBed.tick();
    expect(sorting.sort()).not.toBeNull();
    expect(store.sortedProducts().map((p) => p.productName)).toEqual([
      'item b',
      'item a',
    ]);
  });

  it('resets the sort on a new search (AC-12)', () => {
    const sorting = TestBed.inject(SortService);
    sheets.searchNow('item');
    httpMock.expectOne(URL).flush(rawWithQty([{ name: 'a', qty: 5 }]));
    sorting.cycle('stockQty');
    expect(sorting.sort()).not.toBeNull();

    // A new search session (clear, then search again) must clear the sort.
    sheets.onSearchInput('');
    sheets.searchNow('other');
    httpMock.expectOne(URL).flush(rawWithQty([{ name: 'x', qty: 1 }]));
    TestBed.tick();
    expect(sorting.sort()).toBeNull();
  });
});

/** Minimal gviz response with product name and numeric stock qty. */
function rawWithQty(
  rows: ReadonlyArray<{ name: string; qty: number | null }>,
): string {
  const table = {
    cols: [
      { id: 'A', label: 'id', type: 'number' },
      { id: 'B', label: 'product name', type: 'string' },
      { id: 'C', label: 'stock qty', type: 'number' },
      { id: 'D', label: 'status', type: 'string' },
    ],
    rows: rows.map((r, i) => ({
      c: [
        { v: i + 1 },
        { v: r.name },
        r.qty === null ? null : { v: r.qty },
        { v: 'Active' },
      ],
    })),
  };
  return (
    '/*O_o*/\ngoogle.visualization.Query.setResponse(' +
    JSON.stringify({ version: '0.6', reqId: '0', status: 'ok', table }) +
    ');'
  );
}

/** Minimal gviz response with product name, category and product status. */
function rawCatStatus(
  rows: ReadonlyArray<{ name: string; category: string; status: string }>,
): string {
  const table = {
    cols: [
      { id: 'A', label: 'id', type: 'number' },
      { id: 'B', label: 'product name', type: 'string' },
      { id: 'C', label: 'category', type: 'string' },
      { id: 'D', label: 'status', type: 'string' },
    ],
    rows: rows.map((r, i) => ({
      c: [{ v: i + 1 }, { v: r.name }, { v: r.category }, { v: r.status }],
    })),
  };
  return (
    '/*O_o*/\ngoogle.visualization.Query.setResponse(' +
    JSON.stringify({ version: '0.6', reqId: '0', status: 'ok', table }) +
    ');'
  );
}
