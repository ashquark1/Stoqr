import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { Product } from '../models/product';
import { DataMapping, mapTableToProducts } from './data-mapping';
import { GvizTable } from './gviz-types';

const COLS = [
  { id: 'A', label: 'id', type: 'number' },
  { id: 'B', label: 'brand', type: 'string' },
  { id: 'C', label: 'product name', type: 'string' },
  { id: 'D', label: 'category', type: 'string' },
  { id: 'E', label: 'sub category', type: 'string' },
  { id: 'F', label: 'sku', type: 'string' },
  { id: 'G', label: 'size', type: 'string' },
  { id: 'H', label: 'color', type: 'string' },
  { id: 'I', label: 'unit of measure', type: 'string' },
  { id: 'J', label: 'packing', type: 'number' },
  { id: 'K', label: 'stock qty', type: 'number' },
  { id: 'L', label: 'low stock threshold', type: 'number' },
  { id: 'M', label: 'stock status', type: 'string' },
  { id: 'N', label: 'mrp', type: 'number' },
  { id: 'O', label: 'selling price', type: 'number' },
  { id: 'P', label: 'purchase price', type: 'number' },
  { id: 'Q', label: 'tax rate', type: 'number' },
  { id: 'R', label: 'status', type: 'string' },
  { id: 'S', label: 'notes', type: 'string' },
  { id: 'T', label: 'last updated', type: 'datetime' },
  { id: 'U', label: 'created at', type: 'datetime' },
];

const SAMPLE_ROW = {
  c: [
    { v: 1.0, f: '1' },
    { v: 'Dr Trust' },
    { v: 'Pulse Oximeter' },
    { v: 'Devices' },
    { v: 'Monitoring' },
    { v: 'DTPO' },
    { v: '-' },
    { v: '-' },
    { v: 'pc' },
    { v: 1.0, f: '1' },
    { v: 10.0, f: '10' },
    { v: 5.0, f: '5' },
    { v: 'In Stock' },
    { v: 3999.0, f: '3999' },
    { v: 1000.0, f: '1000' },
    { v: 800.0, f: '800' },
    { v: 5.0, f: '5' },
    { v: 'Active' },
    { v: '-' },
    { v: 'Date(2026,5,7,22,3,54)', f: '07/06/2026 22:03:54' },
    { v: 'Date(2026,5,7,22,3,54)', f: '07/06/2026 22:03:54' },
  ],
};

function table(rows: unknown[], cols: unknown[] = COLS): GvizTable {
  return { cols, rows } as unknown as GvizTable;
}

describe('mapTableToProducts', () => {
  it('maps every field with the correct runtime type', () => {
    const [p] = mapTableToProducts(table([SAMPLE_ROW]));

    const expected: Product = {
      brand: 'Dr Trust',
      productName: 'Pulse Oximeter',
      category: 'Devices',
      subCategory: 'Monitoring',
      sku: 'DTPO',
      size: '-',
      color: '-',
      unitOfMeasure: 'pc',
      packing: '1',
      stockQty: 10,
      lowStockThreshold: 5,
      stockStatus: 'In Stock',
      mrp: 3999,
      sellingPrice: 1000,
      purchasePrice: 800,
      taxRate: 5,
      status: 'Active',
      notes: '-',
      lastUpdated: '07/06/2026 22:03:54',
      createdAt: '07/06/2026 22:03:54',
    };
    expect(p).toEqual(expected);
  });

  it('coerces the number-typed packing column to a string', () => {
    const [p] = mapTableToProducts(table([SAMPLE_ROW]));
    expect(typeof p.packing).toBe('string');
  });

  it('uses the formatted value for datetime columns', () => {
    const [p] = mapTableToProducts(table([SAMPLE_ROW]));
    expect(p.lastUpdated).toBe('07/06/2026 22:03:54');
  });

  // RULE (US-02, AC-02/04/05): the internal id column must never reach a Product.
  it('strips the internal id/_row_id column and emits exactly 20 fields', () => {
    const [p] = mapTableToProducts(table([SAMPLE_ROW]));
    expect('id' in p).toBe(false);
    expect('_row_id' in p).toBe(false);
    expect(Object.keys(p)).toHaveLength(20);
  });

  // RULE (#4): a missing numeric cell becomes null, never 0.
  it('maps missing numeric cells to null, not zero', () => {
    const cells: Array<{ v: unknown; f?: string }> = SAMPLE_ROW.c.map(
      (cell) => ({ ...cell }),
    );
    cells[10] = { v: null }; // stock qty blank
    const [p] = mapTableToProducts(table([{ c: cells }]));
    expect(p.stockQty).toBeNull();
  });

  it('returns an empty array when the sheet has no rows', () => {
    expect(mapTableToProducts(table([]))).toEqual([]);
  });

  it('returns an empty array when the table is absent', () => {
    expect(mapTableToProducts(undefined)).toEqual([]);
  });

  it('maps by label, not column position', () => {
    const cols = [COLS[2], COLS[1], ...COLS.slice(3), COLS[0]]; // product name, brand, …, id
    const c = SAMPLE_ROW.c;
    const reordered = { c: [c[2], c[1], ...c.slice(3), c[0]] };
    const [p] = mapTableToProducts(table([reordered], cols));
    expect(p.productName).toBe('Pulse Oximeter');
    expect(p.brand).toBe('Dr Trust');
    expect('id' in p).toBe(false);
  });

  // RULE (AC-06): the strip list is data-driven — adding a label strips it,
  // without touching any other code. Demonstrated on a real column here.
  it('strips any column named in the configurable internal list', () => {
    const [p] = mapTableToProducts(table([SAMPLE_ROW]), ['id', 'stock status']);
    expect(p.stockStatus).toBe(''); // column removed via the list
    expect('id' in p).toBe(false);
  });
});

describe('DataMapping (injectable service)', () => {
  it('is injectable and strips internal fields (AC-01/AC-02)', () => {
    const mapping = TestBed.inject(DataMapping);
    const [p] = mapping.toProducts(table([SAMPLE_ROW]));
    expect('id' in p).toBe(false);
    expect(Object.keys(p)).toHaveLength(20);
    expect(p.productName).toBe('Pulse Oximeter');
  });
});
