import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SortService } from './sort-service';

describe('SortService', () => {
  let svc: SortService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(SortService);
  });

  it('defaults to no sort', () => {
    expect(svc.sort()).toBeNull();
  });

  it('cycles a column asc → desc → none (AC-04)', () => {
    svc.cycle('productName');
    expect(svc.sort()).toEqual({ column: 'productName', direction: 'asc' });
    svc.cycle('productName');
    expect(svc.sort()).toEqual({ column: 'productName', direction: 'desc' });
    svc.cycle('productName');
    expect(svc.sort()).toBeNull();
  });

  it('starts a different column at ascending, clearing the previous (AC-07)', () => {
    svc.cycle('productName');
    svc.cycle('productName'); // desc
    svc.cycle('stockQty'); // switch column
    expect(svc.sort()).toEqual({ column: 'stockQty', direction: 'asc' });
  });

  it('reset clears the sort', () => {
    svc.cycle('stockQty');
    svc.reset();
    expect(svc.sort()).toBeNull();
  });
});
