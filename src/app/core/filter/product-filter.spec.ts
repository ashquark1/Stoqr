import { describe, expect, it } from 'vitest';

import { Product } from '@core/models/product';

import {
  SelectedFilters,
  applyFilters,
  distinctValues,
  facetValue,
} from './product-filter';

function product(p: Partial<Product>): Product {
  return {
    productName: '', brand: '', category: '', subCategory: '', sku: '', size: '',
    color: '', unitOfMeasure: '', packing: '', stockQty: null, lowStockThreshold: null,
    stockStatus: '', mrp: null, sellingPrice: null, purchasePrice: null, taxRate: null,
    status: 'Active', notes: '', lastUpdated: '', createdAt: '', ...p,
  };
}

const PRODUCTS: Product[] = [
  product({ productName: 'A', brand: 'Dr Trust', category: 'Devices', stockStatus: 'In Stock' }),
  product({ productName: 'B', brand: 'BPL', category: 'Devices', stockStatus: 'Low Stock' }),
  product({ productName: 'C', brand: '', category: 'Consumables', stockStatus: '' }),
];

function selected(partial: Partial<SelectedFilters>): SelectedFilters {
  return {
    status: new Set(),
    category: new Set(),
    subCategory: new Set(),
    brand: new Set(),
    ...partial,
  };
}

describe('distinctValues', () => {
  it('returns unique values', () => {
    expect(distinctValues(PRODUCTS, facetValue.category).sort()).toEqual([
      'Consumables',
      'Devices',
    ]);
  });

  it('skips blank values', () => {
    expect(distinctValues(PRODUCTS, facetValue.brand).sort()).toEqual([
      'BPL',
      'Dr Trust',
    ]);
  });
});

describe('applyFilters', () => {
  it('is a no-op when every selected set is empty ("All")', () => {
    expect(applyFilters(PRODUCTS, selected({}))).toHaveLength(3);
  });

  it('keeps only the selected Stock Status variants (blank → unknown)', () => {
    const res = applyFilters(
      PRODUCTS,
      selected({ status: new Set(['in-stock', 'low-stock']) }),
    );
    expect(res.map((p) => p.productName)).toEqual(['A', 'B']); // C is unknown → excluded
  });

  it('keeps only the selected raw values for a facet', () => {
    const res = applyFilters(
      PRODUCTS,
      selected({ category: new Set(['Devices']) }),
    );
    expect(res.map((p) => p.productName)).toEqual(['A', 'B']);
  });

  it('ANDs across facets', () => {
    const res = applyFilters(
      PRODUCTS,
      selected({ category: new Set(['Devices']), status: new Set(['low-stock']) }),
    );
    expect(res.map((p) => p.productName)).toEqual(['B']);
  });
});
