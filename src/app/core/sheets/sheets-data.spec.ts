import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { SheetsData } from './sheets-data';

const URL = environment.sheets.gvizUrl;

const EMPTY_RAW =
  '/*O_o*/\ngoogle.visualization.Query.setResponse(' +
  JSON.stringify({
    version: '0.6',
    reqId: '0',
    status: 'ok',
    table: { cols: [], rows: [] },
  }) +
  ');';

describe('SheetsData', () => {
  let service: SheetsData;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SheetsData);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    httpMock.verify();
  });

  // RULE: the app is read-only — no code path may issue a non-GET request.
  it('only ever issues GET requests to the sheet', () => {
    service.searchNow('oximeter');
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('GET');
    req.flush(EMPTY_RAW);
  });

  it('fetches the whole sheet in a single call on an explicit search (AC-03/04)', () => {
    service.searchNow('oximeter');
    httpMock.expectOne(URL).flush(EMPTY_RAW);
    httpMock.expectNone(URL);
  });

  it('fetches on an explicit search with 1-2 characters (short-query override)', () => {
    service.searchNow('ox');
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('GET');
    req.flush(EMPTY_RAW);
    expect(service.hasSearched()).toBe(true);
  });

  it('does not fetch on an explicit search with an empty query', () => {
    service.searchNow('   ');
    httpMock.expectNone(URL);
    expect(service.hasSearched()).toBe(false);
  });

  it('debounces the typing-triggered fetch (AC-02)', () => {
    vi.useFakeTimers();
    service.onSearchInput('oximeter');
    httpMock.expectNone(URL); // still inside the debounce window
    vi.advanceTimersByTime(300);
    httpMock.expectOne(URL).flush(EMPTY_RAW);
  });

  it('does not fetch while the query is below the threshold (AC-10)', () => {
    vi.useFakeTimers();
    service.onSearchInput('ox');
    vi.advanceTimersByTime(300);
    httpMock.expectNone(URL);
    expect(service.hasSearched()).toBe(false);
  });

  it('does not re-fetch on subsequent typing within a session (AC-01)', () => {
    vi.useFakeTimers();
    service.onSearchInput('oxi');
    vi.advanceTimersByTime(300);
    httpMock.expectOne(URL).flush(EMPTY_RAW);

    service.onSearchInput('oxim');
    service.onSearchInput('oximet');
    vi.advanceTimersByTime(300);
    httpMock.expectNone(URL);
  });

  it('cancels the in-flight request when a newer trigger fires (AC-08)', () => {
    service.refresh();
    service.refresh();
    const reqs = httpMock.match(URL);
    expect(reqs).toHaveLength(2);
    expect(reqs[0].cancelled).toBe(true);
    reqs[1].flush(EMPTY_RAW);
  });

  it('always re-fetches on refresh (AC-09)', () => {
    service.searchNow('oximeter');
    httpMock.expectOne(URL).flush(EMPTY_RAW);
    service.refresh();
    httpMock.expectOne(URL).flush(EMPTY_RAW);
  });

  // US-06: initial fetch = full-page spinner (loading), not refreshing.
  it('uses the loading state for an initial search', () => {
    service.searchNow('oximeter');
    expect(service.loading()).toBe(true);
    expect(service.refreshing()).toBe(false);
    httpMock.expectOne(URL).flush(EMPTY_RAW);
    expect(service.loading()).toBe(false);
  });

  // US-06: refresh = inline spinner (refreshing), loading stays false so the
  // table remains visible.
  it('uses the refreshing state (not loading) on refresh', () => {
    service.searchNow('oximeter');
    httpMock.expectOne(URL).flush(EMPTY_RAW);

    service.refresh();
    expect(service.refreshing()).toBe(true);
    expect(service.loading()).toBe(false);
    httpMock.expectOne(URL).flush(EMPTY_RAW);
    expect(service.refreshing()).toBe(false);
  });

  it('exposes an empty state when the sheet has no rows (AC-11)', () => {
    service.searchNow('oximeter');
    httpMock.expectOne(URL).flush(EMPTY_RAW);
    expect(service.isEmpty()).toBe(true);
    expect(service.error()).toBeNull();
  });

  // US-07 AC-09: initial failure shows the error and reverts to the hero.
  it('reverts to the centered hero on initial-search failure', () => {
    service.searchNow('oximeter');
    httpMock
      .expectOne(URL)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(service.error()).not.toBeNull();
    expect(service.loading()).toBe(false);
    expect(service.hasSearched()).toBe(false);
    expect(service.products()).toEqual([]);
  });

  // US-07 AC-10: refresh failure keeps the stale table visible.
  it('keeps stale data and active state on refresh failure', () => {
    service.searchNow('oximeter');
    httpMock
      .expectOne(URL)
      .flush(rawWith([{ name: 'Pulse Oximeter', status: 'Active' }]));
    expect(service.results()).toHaveLength(1);

    service.refresh();
    httpMock
      .expectOne(URL)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    expect(service.error()).not.toBeNull();
    expect(service.hasSearched()).toBe(true);
    expect(service.results()).toHaveLength(1);
  });

  // US-07 AC-08: Retry re-attempts the same query.
  it('re-fetches on retry after a failure', () => {
    service.searchNow('oximeter');
    httpMock
      .expectOne(URL)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    service.retry();
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('GET');
    req.flush(EMPTY_RAW);
    expect(service.error()).toBeNull();
  });

  it('clears the error on dismiss (AC-05)', () => {
    service.searchNow('oximeter');
    httpMock
      .expectOne(URL)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    service.dismissError();
    expect(service.error()).toBeNull();
  });

  it('returns to the centered state only when the box is fully cleared', () => {
    service.searchNow('oximeter');
    httpMock.expectOne(URL).flush(EMPTY_RAW);
    service.onSearchInput('');
    expect(service.hasSearched()).toBe(false);
    expect(service.products()).toEqual([]);
  });

  // New behaviour: after searching, 1-2 chars stays in the results state
  // (filters locally) rather than dropping back to the hero.
  it('stays active when reduced to 1-2 chars after searching (no re-fetch)', () => {
    service.searchNow('oximeter');
    httpMock.expectOne(URL).flush(EMPTY_RAW);
    service.onSearchInput('ox');
    expect(service.hasSearched()).toBe(true);
    httpMock.expectNone(URL);
  });

  // US-03 AC-10: only Active products surface in `results`.
  it('exposes only Active products in results', () => {
    service.searchNow('oximeter');
    httpMock
      .expectOne(URL)
      .flush(
        rawWith([
          { name: 'Active A', status: 'Active' },
          { name: 'Inactive B', status: 'Inactive' },
          { name: 'Active C', status: 'active' },
        ]),
      );
    expect(service.results().map((p) => p.productName)).toEqual([
      'Active A',
      'Active C',
    ]);
  });

  // US-03 AC-11: products fetched but none Active -> empty state.
  it('is empty when fetched rows contain no Active products', () => {
    service.searchNow('oximeter');
    httpMock
      .expectOne(URL)
      .flush(rawWith([{ name: 'Inactive B', status: 'Inactive' }]));
    expect(service.isEmpty()).toBe(true);
    expect(service.results()).toEqual([]);
  });
});

/** Minimal gviz response with just the columns the Active-filter test needs. */
function rawWith(rows: ReadonlyArray<{ name: string; status: string }>): string {
  const table = {
    cols: [
      { id: 'A', label: 'id', type: 'number' },
      { id: 'B', label: 'product name', type: 'string' },
      { id: 'C', label: 'status', type: 'string' },
    ],
    rows: rows.map((r, i) => ({ c: [{ v: i + 1 }, { v: r.name }, { v: r.status }] })),
  };
  return (
    '/*O_o*/\ngoogle.visualization.Query.setResponse(' +
    JSON.stringify({ version: '0.6', reqId: '0', status: 'ok', table }) +
    ');'
  );
}
