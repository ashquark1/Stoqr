import { describe, expect, it } from 'vitest';

import { PRODUCT_COLUMNS, PRODUCT_FIELD_GROUPS } from './product-fields';

describe('product fields config', () => {
  it('exposes all 20 columns (AC-02)', () => {
    expect(PRODUCT_COLUMNS).toHaveLength(20);
  });

  it('has unique column keys', () => {
    const keys = PRODUCT_COLUMNS.map((c) => c.key);
    expect(new Set(keys).size).toBe(20);
  });

  it('groups fields as Product/Stock/Pricing/Additional with the spec counts (AC-13)', () => {
    expect(PRODUCT_FIELD_GROUPS.map((g) => g.title)).toEqual([
      'Product Info',
      'Stock Info',
      'Pricing Info',
      'Additional Info',
    ]);
    expect(PRODUCT_FIELD_GROUPS.map((g) => g.fields.length)).toEqual([8, 5, 4, 3]);
  });

  it('covers exactly 20 fields across all groups', () => {
    const total = PRODUCT_FIELD_GROUPS.reduce((n, g) => n + g.fields.length, 0);
    expect(total).toBe(20);
  });

  it('marks the SKU field as monospace', () => {
    const sku = PRODUCT_FIELD_GROUPS.flatMap((g) => g.fields).find(
      (f) => f.key === 'sku',
    );
    expect(sku?.mono).toBe(true);
  });

  it('flags the Stock Status field to render as a badge (AC-09)', () => {
    const stockStatus = PRODUCT_FIELD_GROUPS.flatMap((g) => g.fields).find(
      (f) => f.key === 'stockStatus',
    );
    expect(stockStatus?.badge).toBe(true);
  });
});
