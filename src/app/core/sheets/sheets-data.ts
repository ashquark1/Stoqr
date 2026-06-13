import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, merge, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Product } from '../models/product';
import { DataMapping } from './data-mapping';
import { unwrapGviz } from './gviz-parse';

/** Minimum query length before a search triggers a fetch (AC-10). */
const MIN_QUERY_LENGTH = 3;

/** Debounce window for typing-driven fetches (AC-02). */
const DEBOUNCE_MS = 300;

/** Single friendly, technical-detail-free fetch error message (US-07 AC-01/06). */
const FETCH_ERROR_MESSAGE =
  "We couldn't fetch the products. Please check your connection and try again.";

interface FetchOutcome {
  readonly products: Product[];
  readonly error: string | null;
}

/**
 * The single data-access service for the product sheet.
 *
 * The ONLY place `HttpClient` is used (AI_CONTRACT.md). Read-only: it issues
 * GETs to the public gviz endpoint and exposes results as signals. All RxJS
 * (debounce + in-flight cancellation) is internal; components never subscribe.
 */
@Injectable({ providedIn: 'root' })
export class SheetsData {
  private readonly http = inject(HttpClient);
  private readonly mapping = inject(DataMapping);

  /** Full fetched sheet, cached for local filtering (US-05 consumes this). */
  private readonly _products = signal<readonly Product[]>([]);
  /** Initial fetch in flight → full-page spinner, table hidden (US-06). */
  private readonly _loading = signal(false);
  /** Refresh fetch in flight → inline spinner, table stays visible (US-06). */
  private readonly _refreshing = signal(false);
  private readonly _error = signal<string | null>(null);
  /** True once a search has been triggered — drives the centered→results view. */
  private readonly _hasSearched = signal(false);
  private readonly _searchTerm = signal('');
  /** When the sheet was last fetched successfully — drives the freshness label (US-11). */
  private readonly _fetchedAt = signal<Date | null>(null);
  /**
   * Increments each time a NEW search session starts (not on refresh). Lets
   * transient view state that must survive a refresh but reset on a new search
   * — e.g. the sort (US-14) — distinguish the two.
   */
  private readonly _searchSerial = signal(0);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly refreshing = this._refreshing.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasSearched = this._hasSearched.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly fetchedAt = this._fetchedAt.asReadonly();
  readonly searchSerial = this._searchSerial.asReadonly();

  /**
   * The product list the UI renders: Active products only (AC-10). The Active
   * filter lives here in the data-access layer, not in components or the pure
   * mapper. US-05 will further narrow this by the search query.
   */
  readonly results = computed<readonly Product[]>(() =>
    this._products().filter((p) => p.status.trim().toLowerCase() === 'active'),
  );

  /** Searched, settled, and nothing to show (no matching/active rows) — AC-11. */
  readonly isEmpty = computed(
    () =>
      this._hasSearched() &&
      !this._loading() &&
      this._error() === null &&
      this.results().length === 0,
  );

  /** Typing path — debounced. */
  private readonly debouncedTrigger$ = new Subject<void>();
  /** Enter / Search / Refresh path — immediate. Payload: is this a refresh? */
  private readonly immediateTrigger$ = new Subject<boolean>();

  /**
   * Whether a search session is active (query has been >= MIN_QUERY_LENGTH
   * without dropping back to the centered state). A fetch fires when a session
   * *starts*; subsequent typing within the session filters the cache locally
   * (US-05) rather than re-fetching (AC-01).
   */
  private sessionActive = false;
  /** Whether the most recent trigger was a refresh (for Retry — US-07). */
  private lastRefresh = false;

  constructor() {
    merge(
      // Typing-triggered fetches are never refreshes.
      this.debouncedTrigger$.pipe(debounceTime(DEBOUNCE_MS), map(() => false)),
      this.immediateTrigger$,
    )
      .pipe(
        tap((isRefresh) => {
          this.lastRefresh = isRefresh;
          // Refresh keeps the table visible (inline spinner); initial fetch
          // shows the full-page spinner with the table hidden (US-06).
          if (isRefresh) {
            this._refreshing.set(true);
          } else {
            this._loading.set(true);
          }
          this._error.set(null);
          this._hasSearched.set(true);
        }),
        // switchMap cancels any in-flight request when a newer trigger fires,
        // so only the latest fetch completes (AC-08).
        switchMap((isRefresh) =>
          this.fetchSheet().pipe(map((outcome) => ({ ...outcome, isRefresh }))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ products, error, isRefresh }) => {
        this._loading.set(false);
        this._refreshing.set(false);
        if (error) {
          this._error.set(error);
          if (!isRefresh) {
            // Initial failure: revert to the centered hero, no table (US-07 AC-09).
            this._hasSearched.set(false);
            this.sessionActive = false;
          }
          // Refresh failure: keep stale products + active state (AC-10).
        } else {
          this._products.set(products);
          this._error.set(null);
          // Stamp the successful fetch time (US-11 AC-02/05). Only the success
          // branch touches this, so a failed fetch leaves it unchanged (AC-06).
          this._fetchedAt.set(new Date());
        }
      });
  }

  /**
   * Typing in the search box.
   * - Empty/whitespace-only box → reset to the centered hero state.
   * - Crossing the length threshold (>= MIN_QUERY_LENGTH) with no active session
   *   → start a fetch.
   * - Otherwise (1-2 chars, or already in a session) → no reset, no re-fetch:
   *   once a search is active the layout stays in the results state and further
   *   typing only filters the cache locally. Only a fully cleared box returns to
   *   the hero.
   */
  onSearchInput(term: string): void {
    const trimmed = term.trim();
    this._searchTerm.set(term);

    if (trimmed.length === 0) {
      this.reset();
      return;
    }

    if (!this.sessionActive && trimmed.length >= MIN_QUERY_LENGTH) {
      this.sessionActive = true;
      this._searchSerial.update((n) => n + 1);
      this.debouncedTrigger$.next();
    }
  }

  /**
   * Enter key or Search button — fetches immediately (AC-03), no debounce.
   *
   * Unlike the typing path, an explicit search works for any non-empty query
   * (>= 1 char): pressing Enter/Search with 1-2 characters is a deliberate
   * action and should fetch. Only an empty query returns to the centered state.
   */
  searchNow(term: string): void {
    const trimmed = term.trim();
    this._searchTerm.set(term);

    if (trimmed.length === 0) {
      this.reset();
      return;
    }

    if (!this.sessionActive) {
      this.sessionActive = true;
      this._searchSerial.update((n) => n + 1);
      this.immediateTrigger$.next(false);
    }
  }

  /** Refresh Results button — always forces a fresh fetch (AC-09, US-18). */
  refresh(): void {
    this.sessionActive = true;
    this._error.set(null);
    this.immediateTrigger$.next(true);
  }

  /** Retry the last failed fetch with the same query (US-07 AC-08). */
  retry(): void {
    this._error.set(null);
    if (this.lastRefresh) {
      this.refresh();
    } else {
      this.searchNow(this._searchTerm());
    }
  }

  /** Manually dismiss the error toast (US-07 AC-05). */
  dismissError(): void {
    this._error.set(null);
  }

  /** Query dropped below threshold: clear results, return to centered state. */
  reset(): void {
    this.sessionActive = false;
    this._products.set([]);
    this._error.set(null);
    this._loading.set(false);
    this._refreshing.set(false);
    this._hasSearched.set(false);
  }

  /** Single GET of the whole sheet, mapped to products; errors are captured. */
  private fetchSheet() {
    return this.http
      .get(environment.sheets.gvizUrl, { responseType: 'text' })
      .pipe(
        map((raw): FetchOutcome => ({
          products: this.mapping.toProducts(unwrapGviz(raw).table),
          error: null,
        })),
        catchError(() =>
          of<FetchOutcome>({ products: [], error: FETCH_ERROR_MESSAGE }),
        ),
      );
  }
}
