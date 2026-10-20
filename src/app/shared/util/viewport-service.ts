import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

/** The tablet breakpoint — mobile is anything below it (matches `from(tablet)`). */
const TABLET_QUERY = '(min-width: 768px)';

/**
 * Reactive viewport state as signals. The one case CSS can't cover (reordering
 * table columns by screen size — US mobile-polish) needs the breakpoint in TS;
 * everything else stays mobile-first CSS. Observed via `min-width` so it mirrors
 * the `from()` mixin; `isMobile` is the negation.
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly breakpoints = inject(BreakpointObserver);

  /** True when the viewport is below the tablet breakpoint (< 768px). */
  readonly isMobile = toSignal(
    this.breakpoints.observe(TABLET_QUERY).pipe(map((state) => !state.matches)),
    { initialValue: !this.breakpoints.isMatched(TABLET_QUERY) },
  );
}
