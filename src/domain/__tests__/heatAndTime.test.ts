import { describe, expect, it } from 'vitest';
import { cardioForWeek, CARDIO_PLAN } from '@/domain/cardio';
import {
  addDays,
  daysBetween,
  last7Days,
  minusHours,
  sleepWindowHours,
  timeAgo,
  todayISO,
  weekStart,
} from '@/lib/time';

describe('cardio build-up', () => {
  it('starts with no running', () => {
    expect(cardioForWeek(1).runs).toBe(0);
    expect(cardioForWeek(2).runs).toBe(0);
  });

  it('introduces running in week 3', () => {
    expect(cardioForWeek(3).runs).toBe(1);
  });

  it('never jumps by more than one run per week', () => {
    for (let i = 1; i < CARDIO_PLAN.length; i += 1) {
      expect(CARDIO_PLAN[i].runs - CARDIO_PLAN[i - 1].runs).toBeLessThanOrEqual(1);
    }
  });

  it('never increases duration by more than about a third in one week', () => {
    for (let i = 1; i < CARDIO_PLAN.length; i += 1) {
      const prev = CARDIO_PLAN[i - 1].minutes;
      const next = CARDIO_PLAN[i].minutes;
      if (prev > 0 && next > prev) {
        expect(next / prev).toBeLessThanOrEqual(1.35);
      }
    }
  });

  it('clamps out-of-range weeks instead of crashing', () => {
    expect(cardioForWeek(0)).toEqual(CARDIO_PLAN[0]);
    expect(cardioForWeek(99)).toEqual(CARDIO_PLAN[CARDIO_PLAN.length - 1]);
  });
});

describe('dates in Bangkok time', () => {
  it('produces a YYYY-MM-DD string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('uses Bangkok time, not the machine time zone', () => {
    // 2026-08-24T20:00:00Z is already 25 August in Bangkok (UTC+7).
    expect(todayISO(new Date('2026-08-24T20:00:00Z'))).toBe('2026-08-25');
  });

  it('adds and subtracts days across month ends', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts days between dates', () => {
    expect(daysBetween('2026-08-01', '2026-08-24')).toBe(23);
  });

  it('starts the week on Monday', () => {
    expect(weekStart('2026-08-24')).toBe('2026-08-24'); // a Monday
    expect(weekStart('2026-08-30')).toBe('2026-08-24'); // the Sunday after
    expect(weekStart('2026-08-31')).toBe('2026-08-31'); // the next Monday
  });

  it('lists the last seven days ending today', () => {
    const days = last7Days('2026-08-24');
    expect(days).toHaveLength(7);
    expect(days[6]).toBe('2026-08-24');
    expect(days[0]).toBe('2026-08-18');
  });

  it('handles a sleep window that crosses midnight', () => {
    expect(sleepWindowHours('03:00', '12:00')).toBe(9);
    expect(sleepWindowHours('23:00', '07:00')).toBe(8);
  });

  it('subtracts hours from a clock time, wrapping past midnight', () => {
    expect(minusHours('03:00', 8)).toBe('19:00');
    expect(minusHours('12:00', 2)).toBe('10:00');
  });

  it('describes how long ago something happened', () => {
    const now = new Date('2026-08-24T12:00:00Z');
    expect(timeAgo(null, now)).toBe('never');
    expect(timeAgo('2026-08-24T11:59:30Z', now)).toBe('just now');
    expect(timeAgo('2026-08-24T11:30:00Z', now)).toBe('30 minutes ago');
    expect(timeAgo('2026-08-24T09:00:00Z', now)).toBe('3 hours ago');
    expect(timeAgo('2026-08-23T12:00:00Z', now)).toBe('yesterday');
  });
});
