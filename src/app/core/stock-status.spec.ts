import { describe, expect, it } from 'vitest';

import { resolveStockVariant, stockLabel } from './stock-status';

describe('resolveStockVariant', () => {
  it('maps known statuses regardless of case/whitespace', () => {
    expect(resolveStockVariant('In Stock')).toBe('in-stock');
    expect(resolveStockVariant('  low stock ')).toBe('low-stock');
    expect(resolveStockVariant('OUT OF STOCK')).toBe('out-of-stock');
  });

  it('maps blank and unrecognised values to unknown (AC-05)', () => {
    expect(resolveStockVariant('')).toBe('unknown');
    expect(resolveStockVariant('   ')).toBe('unknown');
    expect(resolveStockVariant('Backordered')).toBe('unknown');
    expect(resolveStockVariant(null)).toBe('unknown');
    expect(resolveStockVariant(undefined)).toBe('unknown');
  });
});

describe('stockLabel', () => {
  it('returns the trimmed status, or "Unknown" when blank', () => {
    expect(stockLabel('In Stock')).toBe('In Stock');
    expect(stockLabel('  Low Stock ')).toBe('Low Stock');
    expect(stockLabel('')).toBe('Unknown');
    expect(stockLabel(null)).toBe('Unknown');
  });
});
