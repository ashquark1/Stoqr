/** The four stock-status variants (match the theme's `.stoqr-badge--*`). */
export type StockVariant = 'in-stock' | 'low-stock' | 'out-of-stock' | 'unknown';

/**
 * Single source mapping a sheet stock-status string to a canonical variant.
 * Keyed by the normalized (trimmed, lower-cased) status. Anything blank or not
 * listed resolves to `unknown`. Used by the badge (presentation) and the status
 * filter (US-08), so it lives in core.
 */
const STOCK_VARIANT_MAP: Readonly<Record<string, StockVariant>> = {
  'in stock': 'in-stock',
  'low stock': 'low-stock',
  'out of stock': 'out-of-stock',
};

export function resolveStockVariant(status: string | null | undefined): StockVariant {
  const key = (status ?? '').trim().toLowerCase();
  return STOCK_VARIANT_MAP[key] ?? 'unknown';
}

/** Badge text: the original status, or "Unknown" when blank. */
export function stockLabel(status: string | null | undefined): string {
  const text = (status ?? '').trim();
  return text === '' ? 'Unknown' : text;
}

export interface StockVariantOption {
  readonly value: StockVariant;
  readonly label: string;
}

/** The fixed, ordered Stock Status filter options (US-08 AC-05). */
export const STOCK_VARIANTS: readonly StockVariantOption[] = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
  { value: 'unknown', label: 'Unknown' },
];
