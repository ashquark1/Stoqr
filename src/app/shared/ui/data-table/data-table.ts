import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  input,
  output,
} from '@angular/core';
import { TableModule } from 'primeng/table';

import { ColumnDef } from '@shared/models/column-def';
import { displayValue } from '@shared/util/display-value';

/** Row shape the table renders: a plain key→value bag. */
export type DataTableRow = Record<string, unknown>;

/**
 * Generic, themed results table — the app's single table component. Wraps
 * PrimeNG `p-table` (paginator, page-size, current-page report, horizontal
 * scroll) so features never depend on PrimeNG directly. Styling comes from the
 * Stoqr preset + `_primeng-overrides.scss`.
 *
 * Columns are declarative (`ColumnDef[]`), so any entity can reuse this. An
 * optional `cellTemplates` map lets a feature override how a specific column
 * renders (e.g. US-04's stock-status badge) without changing this wrapper.
 */
@Component({
  selector: 'stoqr-data-table',
  imports: [TableModule, NgTemplateOutlet],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'stoqr-data-table' },
})
export class DataTable {
  readonly columns = input.required<readonly ColumnDef[]>();
  readonly rows = input.required<readonly DataTableRow[]>();
  readonly pageSize = input(25);
  readonly pageSizeOptions = input<readonly number[]>([10, 25, 50]);
  /** Optional per-column custom cell templates, keyed by column key. */
  readonly cellTemplates = input<Record<string, TemplateRef<unknown>>>({});

  readonly rowSelect = output<DataTableRow>();

  protected display(value: unknown): string {
    return displayValue(value as string | number | null | undefined);
  }

  protected cellClass(col: ColumnDef): string {
    switch (col.cellType) {
      case 'mono':
        return 'td-mono';
      case 'number':
        return 'td-number';
      case 'timestamp':
        return 'td-timestamp';
      default:
        return col.cssClass ?? '';
    }
  }

  protected templateFor(key: string): TemplateRef<unknown> | null {
    return this.cellTemplates()[key] ?? null;
  }
}
