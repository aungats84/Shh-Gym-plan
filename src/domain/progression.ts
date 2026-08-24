/**
 * Volume counting, progression rules and personal-record detection.
 */

import { DAY_BY_KEY, WORKOUT_DAYS, weekPlanFor, type PlannedExercise } from '@/data/program';
import { getExercise, type MuscleGroup } from '@/data/exercises';
import type { SetLog, WorkoutSession } from '@/lib/types';

/** Apply the week's multiplier to the written plan. */
export function scaleSets(
  planned: PlannedExercise[],
  week: number,
  volumeFactor = 1,
): PlannedExercise[] {
  const wp = weekPlanFor(week);
  return planned.map((p) => {
    const isPriority = /Priority/i.test(p.note ?? '');
    // Week 7-8 add a set to priority work only.
    const multiplier = wp.set_multiplier > 1 && !isPriority ? 1 : wp.set_multiplier;
    const sets = Math.max(1, Math.round(p.sets * multiplier * volumeFactor));
    return { ...p, sets, rir: wp.rir };
  });
}

/**
 * Challenging sets per muscle group in a normal week.
 * A set counts fully for the primary muscles and as half for secondary
 * muscles, which is the usual way of counting weekly volume.
 */
export function weeklySetsPerMuscle(week = 2): Record<string, number> {
  const totals: Partial<Record<MuscleGroup, number>> = {};
  for (const day of WORKOUT_DAYS) {
    for (const item of scaleSets(day.main, week)) {
      const ex = getExercise(item.exercise_id);
      for (const m of ex.primary) totals[m] = (totals[m] ?? 0) + item.sets;
      for (const m of ex.secondary) totals[m] = (totals[m] ?? 0) + item.sets * 0.5;
    }
  }
  return Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [k, Math.round((v as number) * 10) / 10]),
  );
}

/** Build the empty set rows for a session. */
export function buildSetLogs(
  dayKey: string,
  week: number,
  short: boolean,
  volumeFactor = 1,
): SetLog[] {
  const day = DAY_BY_KEY[dayKey];
  if (!day) return [];
  const source = short ? day.short : scaleSets(day.main, week, volumeFactor);
  const rows: SetLog[] = [];
  for (const item of source) {
    for (let i = 0; i < item.sets; i += 1) {
      rows.push({
        exercise_id: item.exercise_id,
        set_index: i,
        target_reps: item.reps,
        reps: null,
        weight_kg: null,
        rir: null,
        done: false,
      });
    }
  }
  return rows;
}

export interface BestSet {
  reps: number;
  weight_kg: number;
  /** reps x weight, used only to compare like with like. */
  volume: number;
  date: string;
}

/** Best previous performance per exercise, for the "last time" line. */
export function bestSetsByExercise(sessions: WorkoutSession[]): Record<string, BestSet> {
  const best: Record<string, BestSet> = {};
  for (const s of sessions) {
    for (const set of s.sets) {
      if (!set.done || set.reps == null) continue;
      const weight = set.weight_kg ?? 0;
      const volume = set.reps * Math.max(weight, 1);
      const current = best[set.exercise_id];
      if (!current || volume > current.volume) {
        best[set.exercise_id] = { reps: set.reps, weight_kg: weight, volume, date: s.date };
      }
    }
  }
  return best;
}

/** True when this set beats everything recorded before it. */
export function isPersonalRecord(set: SetLog, previousBest: BestSet | undefined): boolean {
  if (!set.done || set.reps == null) return false;
  if (!previousBest) return false;
  const volume = set.reps * Math.max(set.weight_kg ?? 0, 1);
  return volume > previousBest.volume;
}

export interface ProgressionAdvice {
  headline: string;
  detail: string;
}

/**
 * What to change next time, based on the last session for this exercise.
 * Deliberately changes one thing at a time.
 */
export function progressionAdvice(
  targetReps: string,
  lastReps: number | null,
  lastRir: number | null,
  hasSpareLoad: boolean,
): ProgressionAdvice {
  const top = topOfRange(targetReps);
  if (lastReps == null) {
    return {
      headline: 'Find a starting point',
      detail: `Pick a weight you could do about ${top + 3} times, and stop at ${top}. Write down what you used.`,
    };
  }
  if (lastRir != null && lastRir <= 0) {
    return {
      headline: 'Ease off slightly',
      detail:
        'You went to failure last time. Keep 2-3 reps in reserve instead - you will recover better and progress faster.',
    };
  }
  if (lastReps >= top && (lastRir ?? 3) >= 2) {
    return hasSpareLoad
      ? {
          headline: 'Add weight',
          detail:
            'You hit the top of the rep range with reps to spare. Add the smallest increase you can and drop back to the bottom of the range.',
        }
      : {
          headline: 'Slow it down',
          detail:
            'You hit the top of the range. There is no heavier weight available, so take 3-4 seconds to lower each rep, or add a 2-second pause. That is a real progression.',
        };
  }
  if (lastReps >= top) {
    return {
      headline: 'Add a rep',
      detail: `You reached ${lastReps}. Aim for one more rep per set before changing anything else.`,
    };
  }
  return {
    headline: 'Repeat and add a rep',
    detail: `You did ${lastReps}. Use the same weight and aim for ${lastReps + 1} this time.`,
  };
}

function topOfRange(reps: string): number {
  const nums = reps.match(/\d+/g);
  if (!nums || nums.length === 0) return 12;
  return Number(nums[nums.length - 1]);
}

/** Sessions completed inside the week starting on weekStartISO. */
export function sessionsInWeek(sessions: WorkoutSession[], weekStartISO: string): WorkoutSession[] {
  const end = new Date(Date.parse(`${weekStartISO}T00:00:00Z`) + 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  return sessions.filter((s) => s.status === 'completed' && s.date >= weekStartISO && s.date < end);
}
