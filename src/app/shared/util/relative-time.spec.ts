import { describe, expect, it } from 'vitest';

import { relativeTime } from './relative-time';

/** Build a `now` that is `ms` after `from`. */
function ago(ms: number): { from: Date; now: Date } {
  const from = new Date('2026-06-12T12:00:00Z');
  return { from, now: new Date(from.getTime() + ms) };
}

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('relativeTime', () => {
  it('shows "just now" under a minute', () => {
    const { from, now } = ago(59 * SECOND);
    expect(relativeTime(from, now)).toBe('just now');
  });

  it('reads a future instant (clock skew) as "just now"', () => {
    const { from, now } = ago(-5 * SECOND);
    expect(relativeTime(from, now)).toBe('just now');
  });

  it('switches to minutes at exactly one minute (singular)', () => {
    const { from, now } = ago(MINUTE);
    expect(relativeTime(from, now)).toBe('1 minute ago');
  });

  it('pluralizes minutes', () => {
    const { from, now } = ago(2 * MINUTE);
    expect(relativeTime(from, now)).toBe('2 minutes ago');
  });

  it('floors to the lower minute', () => {
    const { from, now } = ago(2 * MINUTE + 59 * SECOND);
    expect(relativeTime(from, now)).toBe('2 minutes ago');
  });

  it('switches to hours at one hour (singular)', () => {
    const { from, now } = ago(HOUR);
    expect(relativeTime(from, now)).toBe('1 hour ago');
  });

  it('pluralizes hours', () => {
    const { from, now } = ago(5 * HOUR);
    expect(relativeTime(from, now)).toBe('5 hours ago');
  });

  it('switches to days at one day (singular)', () => {
    const { from, now } = ago(DAY);
    expect(relativeTime(from, now)).toBe('1 day ago');
  });

  it('pluralizes days', () => {
    const { from, now } = ago(3 * DAY);
    expect(relativeTime(from, now)).toBe('3 days ago');
  });
});
