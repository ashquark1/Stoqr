/** The four stock-status badge variants (match the theme's `.stoqr-badge--*`). */
export type StockVariant = 'in-stock' | 'low-stock' | 'out-of-stock' | 'unknown';

/**
 * Single source mapping a sheet stock-status string to a badge variant. Keyed by
 * the normalized (trimmed, lower-cased) status so casing/spacing don't matter.
 * Anything blank or not listed resolves to `unknown` (AC-05). Reused by both the
 * badge and the Stock Qty colour-coding so they never disagree.
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
