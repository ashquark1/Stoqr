import { describe, expect, it } from 'vitest';

import { Product } from '@core/models/product';

import {
  applyStatusVisibility,
  resolveProductStatus,
  statusLabel,
} from './product-status';

function product(status: string): Product {
  return { productName: status, status } as Product;
}

describe('resolveProductStatus', () => {
  it('buckets the three known statuses case/space-insensitively', () => {
    expect(resolveProductStatus(' Active ')).toBe('active');
    expect(resolveProductStatus('INACTIVE')).toBe('inactive');
    expect(resolveProductStatus('Discontinued')).toBe('discontinued');
  });

  it('treats blank or unrecognized statuses as "other"', () => {
    expect(resolveProductStatus('')).toBe('other');
    expect(resolveProductStatus('   ')).toBe('other');
    expect(resolveProductStatus(null)).toBe('other');
    expect(resolveProductStatus('Archived')).toBe('other');
  });
});

describe('statusLabel', () => {
  it('returns the verbatim status, or "Unknown" when blank', () => {
    expect(statusLabel('Discontinued')).toBe('Discontinued');
    expect(statusLabel('  ')).toBe('Unknown');
  });
});

describe('applyStatusVisibility', () => {
  const products = [
    product('Active'),
    product('Inactive'),
    product('Discontinued'),
    product(''), // other / blank
  ];

  it('shows only Active by default (both toggles off)', () => {
    const visible = applyStatusVisibility(products, {
      showInactive: false,
      showDiscontinued: false,
    });
    expect(visible.map((p) => p.status)).toEqual(['Active']);
  });

  it('reveals Inactive only when its toggle is on', () => {
    const visible = applyStatusVisibility(products, {
      showInactive: true,
      showDiscontinued: false,
    });
    expect(visible.map((p) => p.status)).toEqual(['Active', 'Inactive']);
  });

  it('reveals Discontinued only when its toggle is on', () => {
    const visible = applyStatusVisibility(products, {
      showInactive: false,
      showDiscontinued: true,
    });
    expect(visible.map((p) => p.status)).toEqual(['Active', 'Discontinued']);
  });

  it('never reveals blank/other status, even with both toggles on', () => {
    const visible = applyStatusVisibility(products, {
      showInactive: true,
      showDiscontinued: true,
    });
    expect(visible.map((p) => p.status)).toEqual([
      'Active',
      'Inactive',
      'Discontinued',
    ]);
  });
});
