import { Product } from '@core/models/product';

/**
 * Product lifecycle status — distinct from stock status (`stock-status.ts`).
 * `active` is the only status shown by default; `inactive`/`discontinued` are
 * hidden unless their toggle is on; anything else (blank/unknown) stays hidden.
 */
export type ProductStatusVariant = 'active' | 'inactive' | 'discontinued' | 'other';

const STATUS_MAP: Readonly<Record<string, ProductStatusVariant>> = {
  active: 'active',
  inactive: 'inactive',
  discontinued: 'discontinued',
};

/** Canonical variant for a sheet `status` string (trimmed, case-insensitive). */
export function resolveProductStatus(
  status: string | null | undefined,
): ProductStatusVariant {
  const key = (status ?? '').trim().toLowerCase();
  return STATUS_MAP[key] ?? 'other';
}

/** Display label for a product status (verbatim, or "Unknown" when blank). */
export function statusLabel(status: string | null | undefined): string {
  const text = (status ?? '').trim();
  return text === '' ? 'Unknown' : text;
}

/** The two reveal toggles (US-13). Both default off. */
export interface StatusToggles {
  readonly showInactive: boolean;
  readonly showDiscontinued: boolean;
}

/**
 * Pure status-visibility filter (US-13). Active is always kept; Inactive and
 * Discontinued only when their toggle is on; any other/blank status is always
 * hidden (preserves the Active-only default of AC-01). With both toggles off this
 * is exactly the legacy Active-only filter.
 */
export function applyStatusVisibility(
  products: readonly Product[],
  toggles: StatusToggles,
): Product[] {
  return products.filter((p) => {
    switch (resolveProductStatus(p.status)) {
      case 'active':
        return true;
      case 'inactive':
        return toggles.showInactive;
      case 'discontinued':
        return toggles.showDiscontinued;
      default:
        return false;
    }
  });
}
