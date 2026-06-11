import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '@env/environment';
import { SheetsData } from '@core/sheets/sheets-data';

import { ProductSearchStore } from './product-search-store';
import { SECONDARY_ONLY_MESSAGE } from './search-validation';

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
});
