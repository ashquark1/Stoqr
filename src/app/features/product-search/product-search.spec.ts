import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '@env/environment';

import { ProductSearch } from './product-search';

const URL = environment.sheets.gvizUrl;

const RAW = (() => {
  const table = {
    cols: [
      { id: 'A', label: 'id', type: 'number' },
      { id: 'B', label: 'product name', type: 'string' },
      { id: 'C', label: 'status', type: 'string' },
    ],
    rows: [{ c: [{ v: 1 }, { v: 'Pulse Oximeter' }, { v: 'Active' }] }],
  };
  return (
    '/*O_o*/\ngoogle.visualization.Query.setResponse(' +
    JSON.stringify({ version: '0.6', reqId: '0', status: 'ok', table }) +
    ');'
  );
})();

/**
 * Locks the responsive toolbar STRUCTURE (US-12): the four controls live as
 * direct grid children of `.results__toolbar`, which the regrouping grid
 * (2×2 mobile → single row from tablet) places via grid-area. jsdom can't
 * compute layout, so we assert the DOM shape the CSS depends on, plus the
 * icon-only collapse contract (Filters text wrapped like Search/Refresh).
 */
describe('ProductSearch responsive toolbar', () => {
  let fixture: ComponentFixture<ProductSearch>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(ProductSearch);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function activateSearch(): void {
    // Drive a real search so the active toolbar renders (hero hides it).
    fixture.componentInstance['store'].searchNow('oximeter');
    httpMock.expectOne(URL).flush(RAW);
    fixture.detectChanges();
  }

  it('renders the four controls as direct children of the toolbar grid', () => {
    activateSearch();
    const toolbar = fixture.nativeElement.querySelector(
      '.results__toolbar',
    ) as HTMLElement;
    expect(toolbar).not.toBeNull();
    expect(toolbar.querySelector(':scope > .filter-toggle')).not.toBeNull();
    expect(toolbar.querySelector(':scope > .stoqr-results__count')).not.toBeNull();
    expect(toolbar.querySelector(':scope > .stoqr-refresh')).not.toBeNull();
    // fetchedAt is stamped on the successful fetch, so the label is present.
    expect(toolbar.querySelector(':scope > .results__updated')).not.toBeNull();
  });

  it('wraps the Filters label so it collapses to icon-only on mobile (AC-13)', () => {
    activateSearch();
    const label = fixture.nativeElement.querySelector(
      '.filter-toggle .icon-btn__label',
    ) as HTMLElement;
    expect(label).not.toBeNull();
    expect(label.textContent).toContain('Filters');
  });
});
