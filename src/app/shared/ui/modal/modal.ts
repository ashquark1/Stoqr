import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

/**
 * Themed, read-only modal — wraps PrimeNG `p-dialog`. Provides focus-trap,
 * Escape-to-close, backdrop, and body scroll-lock/restore (AC-15) out of the
 * box. Content is projected, so any feature supplies its own body. The only
 * control is the dialog's close button (read-only — AC-14).
 */
@Component({
  selector: 'stoqr-modal',
  imports: [DialogModule],
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  /** Two-way open state: `[(open)]`. */
  readonly open = model<boolean>(false);
  readonly header = input<string>('');
  readonly close = output<void>();

  protected onVisibleChange(visible: boolean): void {
    this.open.set(visible);
    if (!visible) {
      this.close.emit();
    }
  }
}
