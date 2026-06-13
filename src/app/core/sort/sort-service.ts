import { Injectable, signal } from '@angular/core';

import { SortColumn, SortState } from './product-sort';

/**
 * Single source of truth for sort STATE (US-14): one column at a time, three
 * states (asc → desc → none). Holds no product data and does no sorting itself
 * (that is the pure `sortProducts`), and is independent of `FilterService` —
 * "Reset Filters" does not clear the sort; only a new search does (see the
 * store's reset effect).
 */
@Injectable({ providedIn: 'root' })
export class SortService {
  private readonly _sort = signal<SortState | null>(null);
  readonly sort = this._sort.asReadonly();

  /**
   * Advance the sort for `column`: a new column starts ascending; the active
   * column cycles asc → desc → none (AC-04/07).
   */
  cycle(column: SortColumn): void {
    this._sort.update((cur) => {
      if (cur === null || cur.column !== column) {
        return { column, direction: 'asc' };
      }
      return cur.direction === 'asc'
        ? { column, direction: 'desc' }
        : null;
    });
  }

  /** Clear the sort (sheet order). Triggered on a new search. */
  reset(): void {
    this._sort.set(null);
  }
}
