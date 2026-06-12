import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Toggle } from './toggle';

describe('Toggle', () => {
  function setup(checked = false) {
    const fixture = TestBed.createComponent(Toggle);
    fixture.componentRef.setInput('label', 'Show Inactive Products');
    fixture.componentRef.setInput('checked', checked);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input.stoqr-toggle__input',
    ) as HTMLInputElement;
    return { fixture, input };
  }

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders the label and reflects the checked input', () => {
    const { fixture, input } = setup(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Show Inactive Products',
    );
    expect(input.checked).toBe(true);
    expect(input.getAttribute('role')).toBe('switch');
  });

  it('emits the new state on change', () => {
    const { fixture, input } = setup(false);
    let emitted: boolean | undefined;
    fixture.componentInstance.checkedChange.subscribe((v: boolean) => (emitted = v));

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(emitted).toBe(true);
  });
});
