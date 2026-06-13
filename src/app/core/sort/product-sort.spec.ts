import { describe, expect, it } from 'vitest';

import { Product } from '@core/models/product';

import { SortState, sortProducts } from './product-sort';

function p(productName: string, stockQty: number | null): Product {
  return { productName, stockQty } as Product;
}

const names = (list: readonly Product[]) => list.map((x) => x.productName);

describe('sortProducts', () => {
  it('returns the list unchanged when sort is null (sheet order)', () => {
    const list = [p('Banana', 1), p('apple', 2)];
    const out = sortProducts(list, null);
    expect(out).toBe(list); // same reference, untouched
  });

  it('sorts Product Name case-insensitively ascending', () => {
    const list = [p('Banana', 1), p('apple', 2), p('Cherry', 3)];
    const sort: SortState = { column: 'productName', direction: 'asc' };
    expect(names(sortProducts(list, sort))).toEqual(['apple', 'Banana', 'Cherry']);
  });

  it('sorts Product Name descending', () => {
    const list = [p('Banana', 1), p('apple', 2), p('Cherry', 3)];
    const sort: SortState = { column: 'productName', direction: 'desc' };
    expect(names(sortProducts(list, sort))).toEqual(['Cherry', 'Banana', 'apple']);
  });

  it('sorts Stock Qty numerically ascending', () => {
    const list = [p('a', 30), p('b', 5), p('c', 100)];
    const sort: SortState = { column: 'stockQty', direction: 'asc' };
    expect(names(sortProducts(list, sort))).toEqual(['b', 'a', 'c']);
  });

  it('sorts Stock Qty numerically descending', () => {
    const list = [p('a', 30), p('b', 5), p('c', 100)];
    const sort: SortState = { column: 'stockQty', direction: 'desc' };
    expect(names(sortProducts(list, sort))).toEqual(['c', 'a', 'b']);
  });

  it('keeps empty stock (null) last when ascending', () => {
    const list = [p('a', null), p('b', 5), p('c', null), p('d', 1)];
    const sort: SortState = { column: 'stockQty', direction: 'asc' };
    expect(names(sortProducts(list, sort))).toEqual(['d', 'b', 'a', 'c']);
  });

  it('keeps empty stock (null) last when descending too', () => {
    const list = [p('a', null), p('b', 5), p('c', null), p('d', 1)];
    const sort: SortState = { column: 'stockQty', direction: 'desc' };
    expect(names(sortProducts(list, sort))).toEqual(['b', 'd', 'a', 'c']);
  });

  it('is stable — equal keys keep their incoming (sheet) order', () => {
    const list = [p('x', 5), p('y', 5), p('z', 5)];
    const sort: SortState = { column: 'stockQty', direction: 'asc' };
    expect(names(sortProducts(list, sort))).toEqual(['x', 'y', 'z']);
  });

  it('does not mutate the input array', () => {
    const list = [p('b', 2), p('a', 1)];
    sortProducts(list, { column: 'productName', direction: 'asc' });
    expect(names(list)).toEqual(['b', 'a']);
  });
});
