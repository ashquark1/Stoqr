import { Product } from '@core/models/product';
import { CellType, ColumnDef } from '@shared/models/column-def';
import { FieldGroup } from '@shared/models/field-group';

type GroupId = 'product' | 'stock' | 'pricing' | 'additional';

interface ProductField {
  readonly key: keyof Product & string;
  readonly label: string;
  readonly group: GroupId;
  readonly cellType: CellType;
  /** Render this field as a stock-status badge (table + modal). */
  readonly badge?: boolean;
  /** Render this field as a product-status badge (table + modal — US-13). */
  readonly statusBadge?: boolean;
  /** Whether the results-table header for this field is sortable (US-14). */
  readonly sortable?: boolean;
}

/**
 * Single source for product presentation: drives BOTH the results-table columns
 * (AC-02) and the detail-modal field groups (AC-13). Order here = column order.
 */
const PRODUCT_FIELDS: readonly ProductField[] = [
  // Product Info
  { key: 'productName', label: 'Product Name', group: 'product', cellType: 'text', sortable: true },
  { key: 'brand', label: 'Brand', group: 'product', cellType: 'text' },
  { key: 'category', label: 'Category', group: 'product', cellType: 'text' },
  { key: 'subCategory', label: 'Sub-category', group: 'product', cellType: 'text' },
  { key: 'sku', label: 'SKU', group: 'product', cellType: 'mono' },
  { key: 'size', label: 'Size', group: 'product', cellType: 'text' },
  { key: 'color', label: 'Color', group: 'product', cellType: 'text' },
  { key: 'status', label: 'Status', group: 'product', cellType: 'text', statusBadge: true },
  // Stock Info
  { key: 'stockQty', label: 'Stock Qty', group: 'stock', cellType: 'number', sortable: true },
  { key: 'lowStockThreshold', label: 'Low Stock Threshold', group: 'stock', cellType: 'number' },
  { key: 'stockStatus', label: 'Stock Status', group: 'stock', cellType: 'text', badge: true },
  { key: 'unitOfMeasure', label: 'Unit of Measure', group: 'stock', cellType: 'text' },
  { key: 'packing', label: 'Packing', group: 'stock', cellType: 'text' },
  // Pricing Info
  { key: 'mrp', label: 'MRP', group: 'pricing', cellType: 'number' },
  { key: 'sellingPrice', label: 'Selling Price', group: 'pricing', cellType: 'number' },
  { key: 'purchasePrice', label: 'Purchase Price', group: 'pricing', cellType: 'number' },
  { key: 'taxRate', label: 'Tax Rate', group: 'pricing', cellType: 'number' },
  // Additional Info
  { key: 'notes', label: 'Notes', group: 'additional', cellType: 'text' },
  { key: 'lastUpdated', label: 'Last Updated', group: 'additional', cellType: 'timestamp' },
  { key: 'createdAt', label: 'Created At', group: 'additional', cellType: 'timestamp' },
];

const GROUP_TITLES: Record<GroupId, string> = {
  product: 'Product Info',
  stock: 'Stock Info',
  pricing: 'Pricing Info',
  additional: 'Additional Info',
};

/** Table columns (AC-02): all 20 fields, in declaration order. */
export const PRODUCT_COLUMNS: readonly ColumnDef[] = PRODUCT_FIELDS.map((f) => ({
  key: f.key,
  header: f.label,
  cellType: f.cellType,
  sortable: f.sortable ?? false,
}));

/** Modal field groups (AC-13): Product / Stock / Pricing / Additional. */
export const PRODUCT_FIELD_GROUPS: readonly FieldGroup<Product>[] = (
  ['product', 'stock', 'pricing', 'additional'] as const
).map((g) => ({
  title: GROUP_TITLES[g],
  fields: PRODUCT_FIELDS.filter((f) => f.group === g).map((f) => ({
    key: f.key,
    label: f.label,
    mono: f.cellType === 'mono',
    badge: f.badge ?? false,
    statusBadge: f.statusBadge ?? false,
  })),
}));
