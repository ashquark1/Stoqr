import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FilterService } from './filter-service';

describe('FilterService', () => {
  let svc: FilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(FilterService);
  });

  it('defaults to empty ("All"), zero active filters', () => {
    expect(svc.activeCount()).toBe(0);
    expect(svc.selectedFor('status')().size).toBe(0);
  });

  it('stores the selected values and counts the facet as active', () => {
    svc.setSelected('status', ['in-stock', 'low-stock']);
    expect([...svc.selectedFor('status')()].sort()).toEqual([
      'in-stock',
      'low-stock',
    ]);
    expect(svc.activeCount()).toBe(1);
  });

  it('treats an empty selection ("All") as no active filter', () => {
    svc.setSelected('status', ['in-stock']);
    expect(svc.activeCount()).toBe(1);
    svc.setSelected('status', []);
    expect(svc.activeCount()).toBe(0);
  });

  it('counts each filtering facet and resets them all', () => {
    svc.setSelected('status', ['in-stock']);
    svc.setSelected('category', ['Devices']);
    expect(svc.activeCount()).toBe(2);

    svc.reset();
    expect(svc.activeCount()).toBe(0);
    expect(svc.selectedFor('category')().size).toBe(0);
  });
});
