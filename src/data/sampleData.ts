/**
 * Sample data, so the Progress charts and weekly review have something
 * to show before three weeks of real logging exist.
 *
 * Every row it creates is tagged, and "Remove sample data" in Settings
 * deletes exactly those rows and nothing else. It never touches
 * anything you logged yourself.
 */

import { addDays, todayISO } from '@/lib/time';
import { WORKOUT_DAYS } from '@/data/program';
import { buildSetLogs } from '@/domain/progression';
import { mealsForDay } from '@/data/meals';
import type {
  DailyLog,
  MealSelection,
  Measurement,
  ReadinessCheck,
  WorkoutSession,
} from '@/lib/types';

/** Written into the notes field so the rows can be found and removed again. */
export const SAMPLE_TAG = '[sample]';

export interface SampleData {
  daily_logs: DailyLog[];
  readiness_checks: ReadinessCheck[];
  workouts: WorkoutSession[];
  meal_selections: MealSelection[];
  measurements: Measurement[];
}

/** A repeatable pseudo-random number, so the sample looks the same every time. */
function wobble(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function buildSampleData(startWeightKg = 52, days = 28): SampleData {
  const today = todayISO();
  const out: SampleData = {
    daily_logs: [],
    readiness_checks: [],
    workouts: [],
    meal_selections: [],
    measurements: [],
  };

  for (let i = days; i >= 1; i -= 1) {
    const date = addDays(today, -i);
    const dayIndex = days - i;
    const week = Math.floor(dayIndex / 7) + 1;
    const r = wobble(dayIndex);

    out.daily_logs.push({
      date,
      water_l: Math.round((1.2 + r * 0.9) * 10) / 10,
      steps: Math.round(3500 + dayIndex * 90 + r * 1800),
      sleep_hours: Math.round((7.5 + r * 1.6) * 2) / 2,
      sleep_quality: r > 0.75 ? 5 : r > 0.3 ? 4 : 3,
      stress: r > 0.8 ? 4 : 2,
      energy: r > 0.7 ? 4 : 3,
      mood: r > 0.6 ? 4 : 3,
      caffeine_last_time: null,
      alcohol_units: null,
      daytime_sleepiness: false,
      notes: SAMPLE_TAG,
    });

    // Weight drifts down with day-to-day noise, which is the whole point
    // of showing a weekly average line rather than the raw dots.
    if (dayIndex % 2 === 0) {
      out.measurements.push({
        date,
        weight_kg: Math.round((startWeightKg - dayIndex * 0.04 + (r - 0.5) * 0.8) * 10) / 10,
        waist_cm: Math.round((63.5 - dayIndex * 0.03) * 10) / 10,
        hip_cm: null,
        arm_cm: null,
        thigh_cm: null,
        note: SAMPLE_TAG,
        photo_note: '',
      });
    }

    // Four sessions a week, on the days most people actually manage.
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const trainingDay = [1, 2, 4, 5].includes(weekday);
    if (trainingDay && r > 0.15) {
      const day = WORKOUT_DAYS[[1, 2, 4, 5].indexOf(weekday)];
      const sets = buildSetLogs(day.key, week, false, 1).map((s, idx) => ({
        ...s,
        reps: 10 + Math.round(wobble(dayIndex * 7 + idx) * 4),
        weight_kg: 2,
        rir: 2,
        done: true,
      }));
      out.workouts.push({
        date,
        day_key: day.key,
        week,
        mode: 'full',
        status: 'completed',
        sets,
        session_rpe: 6 + Math.round(r * 2),
        difficulty: r > 0.85 ? 'too_hard' : 'about_right',
        pain_reported: false,
        pain_note: '',
        notes: SAMPLE_TAG,
        duration_minutes: 50 + Math.round(r * 12),
      });

      out.readiness_checks.push({
        date,
        sleep_quality: r > 0.5 ? 4 : 3,
        energy: r > 0.6 ? 4 : 3,
        soreness: r > 0.7 ? 3 : 2,
        stress: r > 0.8 ? 4 : 2,
        motivation: r > 0.4 ? 4 : 3,
        has_pain: false,
        pain_note: SAMPLE_TAG,
        warning_symptom: false,
        minutes_available: 60,
        recommended: 'full',
        accepted: 'full',
      });
    }

    // Food logged on most days, using the home-cooked option.
    if (r > 0.2) {
      for (const meal of mealsForDay((dayIndex % 7) + 1)) {
        const option = meal.options.find((o) => o.kind === 'home') ?? meal.options[0];
        out.meal_selections.push({
          date,
          slot: meal.slot,
          meal_id: option.id,
          option_kind: option.kind,
          logged: true,
          portion_multiplier: 1,
          // custom_name must stay null: a value here means "this is a
          // custom meal", and the daily totals would then read the
          // custom calorie fields instead of the real option's.
          custom_name: null,
          custom_kcal: null,
          custom_protein_g: null,
        });
      }
    }
  }

  return out;
}

/**
 * The exact rows the sample created, as (collection, key) pairs.
 * Settings saves this list so "Remove sample data" deletes precisely
 * these rows and never anything logged for real.
 */
export type SampleKey = [collection: string, key: string];

export function sampleKeys(data: SampleData): SampleKey[] {
  return [
    ...data.daily_logs.map((r) => ['daily_logs', r.date] as SampleKey),
    ...data.readiness_checks.map((r) => ['readiness_checks', r.date] as SampleKey),
    ...data.workouts.map((r) => ['workouts', `${r.date}|${r.day_key}`] as SampleKey),
    ...data.meal_selections.map((r) => ['meal_selections', `${r.date}|${r.slot}`] as SampleKey),
    ...data.measurements.map((r) => ['measurements', r.date] as SampleKey),
  ];
}
