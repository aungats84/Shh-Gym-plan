import { useMemo } from 'react';
import { useData } from '@/state/DataContext';
import {
  computeTargets,
  stepGoalForWeek,
  waterGoalForWeek,
  waterTargetL,
} from '@/domain/nutrition';
import { assessEnergyAvailability } from '@/domain/energyAvailability';
import { weekPlanFor } from '@/data/program';
import { cardioForWeek } from '@/domain/cardio';
import { daysBetween, todayISO } from '@/lib/time';
import type { Profile } from '@/lib/types';

/** Everything derived from the profile plus logged data, in one place. */
export function usePlan() {
  const data = useData();
  const profile = data.profile;

  return useMemo(() => {
    const today = todayISO();
    const start = (profile as (Profile & { plan_start_date?: string }) | null)?.plan_start_date;
    const week = start ? Math.floor(daysBetween(start, today) / 7) + 1 : 1;
    const safeWeek = Math.min(Math.max(1, week), 9);

    const targets = profile ? computeTargets(profile) : null;

    const energy = assessEnergyAvailability({
      logs: data.daily_logs,
      readiness: data.readiness_checks,
      sessions: data.workouts,
      measurements: data.measurements,
      intended_weekly_change_kg: targets?.expected_weekly_change_kg ?? 0,
    });

    // If several under-fuelling signs show up, the deficit is paused.
    const effectiveKcal =
      targets && energy.should_pause_deficit ? targets.maintenance : (targets?.target_kcal ?? 0);

    const waterTarget = profile ? waterTargetL(profile, { trainingDay: true }) : 2;
    const waterGoal = profile
      ? waterGoalForWeek(profile.baseline_water_l || 1, waterTarget, safeWeek)
      : waterTarget;
    const stepGoal = profile ? stepGoalForWeek(profile.baseline_steps || 3000, safeWeek) : 7000;

    return {
      today,
      week: safeWeek,
      weekPlan: weekPlanFor(safeWeek),
      cardio: cardioForWeek(safeWeek),
      targets,
      effectiveKcal,
      energy,
      waterGoal,
      waterTarget,
      stepGoal,
      /** The first workout stays locked until the PAR-Q+ step is done. */
      parqDone: Boolean(profile?.parq_confirmed_at),
    };
  }, [profile, data.daily_logs, data.readiness_checks, data.workouts, data.measurements]);
}
