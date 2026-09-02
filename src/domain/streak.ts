/**
 * A "showing up" streak: consecutive days, ending today, on which she did
 * anything that counts as engaging with the plan. Rest days she chose count,
 * so taking a planned rest never breaks the streak - the point is consistency,
 * not punishing recovery.
 */

import { addDays } from '@/lib/time';
import type { DailyLog, MealSelection, WorkoutSession } from '@/lib/types';

export interface StreakInput {
  /** YYYY-MM-DD, Bangkok time. */
  today: string;
  daily_logs: DailyLog[];
  workouts: WorkoutSession[];
  meal_selections: MealSelection[];
}

export function currentStreak(input: StreakInput): number {
  const logs = new Map(input.daily_logs.map((l) => [l.date, l]));
  const trained = new Set(
    input.workouts.filter((w) => w.status === 'completed').map((w) => w.date),
  );
  const ate = new Set(input.meal_selections.map((m) => m.date));

  const active = (d: string): boolean => {
    if (trained.has(d) || ate.has(d)) return true;
    const l = logs.get(d);
    return !!l && (l.rest_day === true || l.water_l > 0 || l.steps > 0 || l.sleep_hours != null);
  };

  // Before she logs anything today the day is still "pending": count from
  // yesterday so an ongoing streak does not read 0 all morning.
  let cursor = active(input.today) ? input.today : addDays(input.today, -1);
  let streak = 0;
  while (active(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
