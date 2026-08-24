import { describe, expect, it } from 'vitest';
import {
  activityFactor,
  bmi,
  bmrMifflinStJeor,
  computeTargets,
  KCAL_FLOOR,
  proteinPerKg,
  proteinPerMeal,
  stepGoalForWeek,
  waterGoalForWeek,
  waterTargetL,
} from '@/domain/nutrition';
import type { Profile } from '@/lib/types';

const base: Profile = {
  user_id: 'test',
  display_name: 'Test',
  age: 23,
  sex: 'female',
  height_cm: 152,
  weight_kg: 52,
  waist_cm: 63.5,
  units: 'metric',
  area: 'Rangsit',
  goals: ['fat_loss'],
  priority_muscles: ['arms', 'glutes'],
  timeline_weeks: 9,
  experience: 'returning',
  intensity: 'moderate',
  training_days_per_week: 4,
  session_minutes: 60,
  preferred_time: 'evening',
  flexible_schedule: true,
  equipment: ['dumbbells'],
  dumbbell_kg: 2,
  can_buy_equipment: false,
  baseline_steps: 3000,
  enjoys: ['running'],
  dislikes: [],
  budget_thb_per_day: 100,
  meals_per_day: 2,
  allows_snacks: false,
  cooking_skill: 'confident',
  kitchen: ['stove'],
  batch_cooks: false,
  dietary_notes: [],
  allergies: [],
  tracking_style: 'numbers',
  baseline_water_l: 1,
  bedtime: '03:00',
  waketime: '12:00',
  trains_outdoors: true,
  has_aircon: true,
  heat_tolerance: 'average',
  parq_confirmed_at: null,
  parq_flagged_yes: false,
  doctor_restrictions: null,
  theme: 'system',
  track_cycle: false,
};

describe('resting energy', () => {
  it('matches the Mifflin-St Jeor formula for a female', () => {
    // 10*52 + 6.25*152 - 5*23 - 161 = 520 + 950 - 115 - 161 = 1194
    expect(bmrMifflinStJeor(base)).toBe(1194);
  });

  it('is higher for a male at the same size', () => {
    expect(bmrMifflinStJeor({ ...base, sex: 'male' })).toBeGreaterThan(bmrMifflinStJeor(base));
  });

  it('uses a midpoint when sex is not given', () => {
    const unspecified = bmrMifflinStJeor({ ...base, sex: 'unspecified' });
    expect(unspecified).toBeGreaterThan(bmrMifflinStJeor(base));
    expect(unspecified).toBeLessThan(bmrMifflinStJeor({ ...base, sex: 'male' }));
  });
});

describe('activity factor', () => {
  it('rises with steps', () => {
    expect(activityFactor({ ...base, baseline_steps: 10_000 })).toBeGreaterThan(
      activityFactor(base),
    );
  });

  it('rises with training volume', () => {
    expect(activityFactor({ ...base, training_days_per_week: 6 })).toBeGreaterThan(
      activityFactor(base),
    );
  });

  it('stays within a believable range', () => {
    const high = activityFactor({
      ...base,
      baseline_steps: 20_000,
      training_days_per_week: 7,
      session_minutes: 120,
    });
    expect(high).toBeGreaterThan(1.2);
    expect(high).toBeLessThan(1.7);
  });
});

describe('targets', () => {
  it('produces a modest deficit for fat loss', () => {
    const t = computeTargets(base);
    expect(t.target_kcal).toBeLessThan(t.maintenance);
    expect(t.expected_weekly_change_kg).toBeGreaterThan(0.15);
    expect(t.expected_weekly_change_kg).toBeLessThan(0.5);
  });

  it('never targets below the floor, however extreme the inputs', () => {
    const tiny = computeTargets({ ...base, weight_kg: 38, height_cm: 140, baseline_steps: 0 });
    expect(tiny.target_kcal).toBeGreaterThanOrEqual(KCAL_FLOOR.female);
  });

  it('caps the rate of loss at 0.75 percent of bodyweight per week', () => {
    const heavy = computeTargets({ ...base, weight_kg: 120, baseline_steps: 12_000 });
    expect(heavy.expected_weekly_change_kg).toBeLessThanOrEqual(120 * 0.0075 + 0.01);
  });

  it('adds calories rather than removing them for muscle gain', () => {
    const t = computeTargets({ ...base, goals: ['muscle_gain'] });
    expect(t.target_kcal).toBeGreaterThan(t.maintenance);
  });

  it('leaves maintenance alone for general health', () => {
    const t = computeTargets({ ...base, goals: ['general_health'] });
    expect(t.target_kcal).toBe(t.maintenance);
  });

  it('gives about 2 g of protein per kg when dieting', () => {
    const t = computeTargets(base);
    expect(t.protein_g).toBe(104);
  });

  it('keeps fat at or above 0.8 g per kg', () => {
    const t = computeTargets(base);
    expect(t.fat_g).toBeGreaterThanOrEqual(Math.round(base.weight_kg * 0.8));
  });

  it('macros add up to roughly the calorie target', () => {
    const t = computeTargets(base);
    const fromMacros = t.protein_g * 4 + t.carbs_g * 4 + t.fat_g * 9;
    expect(Math.abs(fromMacros - t.target_kcal)).toBeLessThan(20);
  });

  it('reports when the floor was applied', () => {
    const t = computeTargets({ ...base, weight_kg: 35, height_cm: 140, baseline_steps: 0 });
    expect(t.floored).toBe(true);
  });

  it('sets fibre to at least 25 g', () => {
    expect(computeTargets(base).fiber_g).toBeGreaterThanOrEqual(25);
  });
});

describe('protein spread', () => {
  it('divides across the number of meals', () => {
    expect(proteinPerMeal(104, 2)).toBe(52);
  });

  it('does not divide by zero', () => {
    expect(proteinPerMeal(104, 0)).toBe(104);
  });

  it('asks for more protein when dieting than when maintaining', () => {
    expect(proteinPerKg('fat_loss', 'returning')).toBeGreaterThan(
      proteinPerKg('general_health', 'returning'),
    );
  });
});

describe('water and steps', () => {
  it('sets a water target around 2 litres for a 52 kg trainee', () => {
    const target = waterTargetL(base, { trainingDay: true });
    expect(target).toBeGreaterThan(1.8);
    expect(target).toBeLessThan(2.8);
  });

  it('ramps water up from the baseline rather than jumping', () => {
    expect(waterGoalForWeek(1, 2.2, 1)).toBe(1);
    expect(waterGoalForWeek(1, 2.2, 3)).toBeGreaterThan(1);
    expect(waterGoalForWeek(1, 2.2, 20)).toBe(2.2);
  });

  it('never lowers a water goal below what someone already drinks', () => {
    expect(waterGoalForWeek(3, 2.2, 5)).toBe(2.2);
  });

  it('builds steps gradually and stops at the target', () => {
    const w1 = stepGoalForWeek(3000, 1);
    const w9 = stepGoalForWeek(3000, 9);
    expect(w1).toBeLessThan(w9);
    expect(w9).toBeLessThanOrEqual(10_000);
    expect(stepGoalForWeek(3000, 40)).toBe(stepGoalForWeek(3000, 9));
  });
});

describe('bmi', () => {
  it('calculates correctly', () => {
    expect(bmi(52, 152)).toBe(22.5);
  });
});
