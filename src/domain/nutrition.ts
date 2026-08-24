/**
 * Energy and macronutrient targets.
 *
 * Deliberately conservative. Every number here has a floor, and the
 * floors are not adjustable from the interface, because the failure
 * mode of a fat-loss tool is under-eating, not over-eating.
 *
 * Method: Mifflin-St Jeor for resting energy, an activity multiplier
 * built from daily steps plus training load, then a percentage
 * adjustment for the goal.
 */

import type { Goal, Profile, Sex } from '@/lib/types';

/** Energy in 1 kg of body fat, kcal. Used only for pace estimates. */
export const KCAL_PER_KG_FAT = 7700;

/** Hard minimum daily energy. The site will not target below this. */
export const KCAL_FLOOR: Record<Sex, number> = {
  female: 1200,
  male: 1500,
  unspecified: 1200,
};

/** The fastest weekly loss the site will ever aim for, as a share of bodyweight. */
export const MAX_WEEKLY_LOSS_FRACTION = 0.0075;

export interface EnergyTargets {
  bmr: number;
  maintenance: number;
  target_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  /** Positive number = deficit, negative = surplus. */
  daily_adjustment: number;
  expected_weekly_change_kg: number;
  /** True when the floor stopped us going lower. */
  floored: boolean;
  /** True when the target sits below resting energy needs. */
  below_bmr: boolean;
}

export function bmrMifflinStJeor(
  p: Pick<Profile, 'weight_kg' | 'height_cm' | 'age' | 'sex'>,
): number {
  const base = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age;
  if (p.sex === 'male') return Math.round(base + 5);
  if (p.sex === 'female') return Math.round(base - 161);
  // No sex given: use the midpoint rather than assuming.
  return Math.round(base - 78);
}

/**
 * Activity multiplier from real inputs rather than a vague
 * "lightly active" dropdown: daily steps set the base, training
 * sessions add on top.
 */
export function activityFactor(
  p: Pick<Profile, 'baseline_steps' | 'training_days_per_week' | 'session_minutes'>,
): number {
  const steps = Math.max(0, p.baseline_steps);
  // 1.20 at zero steps, rising to about 1.42 at 12,000 steps.
  const stepPart = 1.2 + Math.min(steps, 12_000) * 0.0000183;
  const sessionHours = (p.training_days_per_week * p.session_minutes) / 60;
  // Roughly 0.012 of maintenance per weekly training hour.
  const trainingPart = Math.min(sessionHours * 0.012, 0.12);
  return Math.round((stepPart + trainingPart) * 1000) / 1000;
}

/** Percentage adjustment applied to maintenance for each goal. */
function goalAdjustmentFraction(goal: Goal): number {
  switch (goal) {
    case 'fat_loss':
      return 0.17;
    case 'recomposition':
      return 0.1;
    case 'muscle_gain':
      return -0.08;
    default:
      return 0;
  }
}

/** Protein target in g/kg bodyweight, per ISSN position stand ranges. */
export function proteinPerKg(goal: Goal, experience: Profile['experience']): number {
  if (goal === 'fat_loss') return 2.0;
  if (goal === 'recomposition') return 2.0;
  if (goal === 'muscle_gain') return experience === 'none' ? 1.6 : 1.8;
  return 1.6;
}

export function computeTargets(p: Profile): EnergyTargets {
  const bmr = bmrMifflinStJeor(p);
  const maintenance = Math.round(bmr * activityFactor(p));
  const primaryGoal = p.goals[0] ?? 'general_health';

  let adjustment = Math.round(maintenance * goalAdjustmentFraction(primaryGoal));

  // Never aim to lose faster than MAX_WEEKLY_LOSS_FRACTION of bodyweight.
  const maxDailyDeficit = Math.round(
    (p.weight_kg * MAX_WEEKLY_LOSS_FRACTION * KCAL_PER_KG_FAT) / 7,
  );
  if (adjustment > maxDailyDeficit) adjustment = maxDailyDeficit;

  let target = maintenance - adjustment;
  const floor = KCAL_FLOOR[p.sex];
  let floored = false;
  if (target < floor) {
    target = floor;
    adjustment = maintenance - target;
    floored = true;
  }

  const protein = Math.round(p.weight_kg * proteinPerKg(primaryGoal, p.experience));
  // Fat: 25% of energy, but never below 0.8 g/kg (hormonal health).
  const fatFromPercent = (target * 0.25) / 9;
  const fatFloor = p.weight_kg * 0.8;
  const fat = Math.round(Math.max(fatFromPercent, fatFloor));
  const carbs = Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4));
  // 14 g per 1000 kcal is the common public-health rule; 25 g is the
  // usual adult minimum, so take whichever is higher.
  const fiber = Math.min(38, Math.max(25, Math.round((target / 1000) * 14)));

  return {
    bmr,
    maintenance,
    target_kcal: target,
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
    fiber_g: fiber,
    daily_adjustment: adjustment,
    expected_weekly_change_kg: Math.round(((adjustment * 7) / KCAL_PER_KG_FAT) * 100) / 100,
    floored,
    below_bmr: target < bmr,
  };
}

/** How protein should be spread when there are only a few eating occasions. */
export function proteinPerMeal(totalProtein: number, meals: number): number {
  if (meals <= 0) return totalProtein;
  return Math.round(totalProtein / meals);
}

/** Daily water target in litres. */
export function waterTargetL(
  p: Pick<Profile, 'weight_kg' | 'has_aircon' | 'trains_outdoors'>,
  opts: { trainingDay: boolean } = { trainingDay: false },
): number {
  let litres = p.weight_kg * 0.033;
  if (opts.trainingDay) litres += 0.5;
  // Bangkok: sweat losses are higher year round, more so without aircon.
  litres += p.has_aircon ? 0.15 : 0.3;
  if (p.trains_outdoors && opts.trainingDay) litres += 0.2;
  return Math.round(litres * 10) / 10;
}

/**
 * Ramp the water goal up from what the person actually drinks now,
 * rather than dropping the full target on them in week 1.
 */
export function waterGoalForWeek(baselineL: number, targetL: number, week: number): number {
  if (baselineL >= targetL) return targetL;
  const step = 0.2;
  return Math.min(targetL, Math.round((baselineL + step * Math.max(0, week - 1)) * 10) / 10);
}

/** Step goal for a given week, ramping gradually from the baseline. */
export function stepGoalForWeek(baselineSteps: number, week: number): number {
  const target = Math.min(10_000, Math.max(7000, Math.round(baselineSteps * 2)));
  const start = Math.max(baselineSteps, 2000);
  if (start >= target) return target;
  const weeks = 8;
  const perWeek = (target - start) / weeks;
  const value = start + perWeek * Math.max(0, week - 1);
  return Math.min(target, Math.round(value / 250) * 250);
}

/** Simple projection used on the Progress page. */
export function projectWeight(
  startKg: number,
  weeklyChangeKg: number,
  weeks: number,
): { week: number; kg: number }[] {
  return Array.from({ length: weeks + 1 }, (_, i) => ({
    week: i,
    kg: Math.round((startKg - weeklyChangeKg * i) * 10) / 10,
  }));
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}
