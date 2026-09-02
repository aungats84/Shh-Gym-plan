import { describe, expect, it } from 'vitest';
import { currentStreak } from '@/domain/streak';
import type { DailyLog, MealSelection, WorkoutSession } from '@/lib/types';

const TODAY = '2026-09-01';

/** Only the fields currentStreak reads matter here. */
function log(date: string, patch: Partial<DailyLog> = {}): DailyLog {
  return {
    date,
    water_l: 0,
    steps: 0,
    sleep_hours: null,
    sleep_quality: null,
    stress: null,
    energy: null,
    mood: null,
    caffeine_last_time: null,
    alcohol_units: null,
    daytime_sleepiness: false,
    notes: '',
    ...patch,
  };
}

const noWork: WorkoutSession[] = [];
const noMeals: MealSelection[] = [];

describe('currentStreak', () => {
  it('is 0 with no activity at all', () => {
    expect(
      currentStreak({ today: TODAY, daily_logs: [], workouts: noWork, meal_selections: noMeals }),
    ).toBe(0);
  });

  it('counts consecutive active days ending today', () => {
    const daily_logs = [
      log('2026-08-30', { steps: 4000 }),
      log('2026-08-31', { water_l: 1.5 }),
      log(TODAY, { sleep_hours: 8 }),
    ];
    expect(
      currentStreak({ today: TODAY, daily_logs, workouts: noWork, meal_selections: noMeals }),
    ).toBe(3);
  });

  it('keeps an ongoing streak when today is still empty (pending)', () => {
    const daily_logs = [log('2026-08-30', { steps: 4000 }), log('2026-08-31', { water_l: 1.5 })];
    expect(
      currentStreak({ today: TODAY, daily_logs, workouts: noWork, meal_selections: noMeals }),
    ).toBe(2);
  });

  it('a chosen rest day keeps the streak alive', () => {
    const daily_logs = [log('2026-08-31', { steps: 3000 }), log(TODAY, { rest_day: true })];
    expect(
      currentStreak({ today: TODAY, daily_logs, workouts: noWork, meal_selections: noMeals }),
    ).toBe(2);
  });

  it('breaks on a fully empty gap day', () => {
    const daily_logs = [
      log('2026-08-29', { steps: 3000 }),
      // 2026-08-30 missing entirely
      log('2026-08-31', { water_l: 1 }),
      log(TODAY, { water_l: 1 }),
    ];
    expect(
      currentStreak({ today: TODAY, daily_logs, workouts: noWork, meal_selections: noMeals }),
    ).toBe(2);
  });

  it('a completed workout counts as an active day', () => {
    const workouts = [{ date: TODAY, status: 'completed' } as WorkoutSession];
    expect(
      currentStreak({ today: TODAY, daily_logs: [], workouts, meal_selections: noMeals }),
    ).toBe(1);
  });
});
