import { TestBed } from '@angular/core/testing';
import { providePrimeNG } from 'primeng/config';
import { describe, expect, it } from 'vitest';

import { FilterSelect } from './filter-select';

describe('FilterSelect', () => {
  it('renders its label', () => {
    TestBed.configureTestingModule({ providers: [providePrimeNG({})] });
    const fixture = TestBed.createComponent(FilterSelect);
    fixture.componentRef.setInput('label', 'Stock Status');
    fixture.componentRef.setInput('options', [
      { label: 'In Stock', value: 'in-stock', disabled: false },
    ]);
    fixture.componentRef.setInput('selected', ['in-stock']);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Stock Status',
    );
  });
});
