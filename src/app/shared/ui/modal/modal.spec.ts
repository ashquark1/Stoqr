import { TestBed } from '@angular/core/testing';
import { providePrimeNG } from 'primeng/config';
import { describe, expect, it } from 'vitest';

import { Modal } from './modal';

describe('Modal', () => {
  it('creates', () => {
    TestBed.configureTestingModule({ providers: [providePrimeNG({})] });
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('header', 'Details');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits close when visibility turns off', () => {
    TestBed.configureTestingModule({ providers: [providePrimeNG({})] });
    const fixture = TestBed.createComponent(Modal);
    const instance = fixture.componentInstance;
    let closed = false;
    instance.close.subscribe(() => (closed = true));

    // Simulate the dialog closing (X / Escape / mask).
    (instance as unknown as { onVisibleChange(v: boolean): void }).onVisibleChange(
      false,
    );
    expect(closed).toBe(true);
    expect(instance.open()).toBe(false);
  });
});
