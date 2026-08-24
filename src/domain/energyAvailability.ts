/**
 * Watches for signs that food intake is too low for the training load.
 *
 * This never names a condition and never diagnoses. The IOC's 2023
 * consensus on Relative Energy Deficiency in Sport is explicit that
 * diagnosis requires a clinician; what software can usefully do is
 * notice a pattern, stop pushing a deficit, and say who to talk to.
 */

import type { DailyLog, Measurement, ReadinessCheck, WorkoutSession } from '@/lib/types';

export interface EnergyFlag {
  id: string;
  label: string;
  detail: string;
}

export interface EnergyAssessment {
  flags: EnergyFlag[];
  /** 0 = nothing noticed, 3+ = stop the deficit. */
  level: 0 | 1 | 2 | 3;
  should_pause_deficit: boolean;
  message: string;
}

export interface EnergyInputs {
  logs: DailyLog[];
  readiness: ReadinessCheck[];
  sessions: WorkoutSession[];
  measurements: Measurement[];
  /** kg per week the plan intends to lose. */
  intended_weekly_change_kg: number;
  /** Set only when the person opted into cycle tracking. */
  cycle_change_reported?: boolean;
  low_libido_reported?: boolean;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function assessEnergyAvailability(input: EnergyInputs): EnergyAssessment {
  const flags: EnergyFlag[] = [];
  const recentReadiness = input.readiness.slice(-10);
  const recentLogs = input.logs.slice(-14);
  const recentSessions = input.sessions.slice(-10);

  // Persistent fatigue: energy consistently low across many days.
  const energies = recentReadiness.map((r) => r.energy).filter((n) => Number.isFinite(n));
  if (energies.length >= 5 && mean(energies) <= 2.2) {
    flags.push({
      id: 'fatigue',
      label: 'Persistent low energy',
      detail: 'Your energy rating has been low on most recent check-ins.',
    });
  }

  // Declining performance: more sessions marked too hard than about right.
  const tooHard = recentSessions.filter((s) => s.difficulty === 'too_hard').length;
  if (recentSessions.length >= 4 && tooHard >= Math.ceil(recentSessions.length * 0.6)) {
    flags.push({
      id: 'performance',
      label: 'Sessions feeling harder',
      detail: 'Most of your recent workouts were marked as too hard at the same planned volume.',
    });
  }

  // Poor recovery: soreness staying high.
  const soreness = recentReadiness.map((r) => r.soreness).filter((n) => Number.isFinite(n));
  if (soreness.length >= 5 && mean(soreness) >= 4) {
    flags.push({
      id: 'recovery',
      label: 'Soreness not settling',
      detail: 'Muscle soreness has stayed high between sessions.',
    });
  }

  // Sleep disruption despite enough time in bed.
  const quality = recentLogs.map((l) => l.sleep_quality).filter((n): n is number => n != null);
  if (quality.length >= 5 && mean(quality) <= 2.2) {
    flags.push({
      id: 'sleep',
      label: 'Sleep quality dropping',
      detail:
        'Your sleep quality ratings have fallen compared with what you reported at the start.',
    });
  }

  // Mood changes.
  const moods = recentLogs.map((l) => l.mood).filter((n): n is number => n != null);
  if (moods.length >= 5 && mean(moods) <= 2.2) {
    flags.push({
      id: 'mood',
      label: 'Mood consistently low',
      detail: 'Low mood is a recognised sign of under-fuelling, not only of stress.',
    });
  }

  // Weight falling much faster than intended.
  const weights = input.measurements
    .filter((m) => m.weight_kg != null)
    .slice(-6)
    .map((m) => ({ date: m.date, kg: m.weight_kg as number }));
  if (weights.length >= 3 && input.intended_weekly_change_kg > 0) {
    const first = weights[0];
    const last = weights[weights.length - 1];
    const days = Math.max(
      1,
      (Date.parse(`${last.date}T00:00:00Z`) - Date.parse(`${first.date}T00:00:00Z`)) / 86_400_000,
    );
    const perWeek = ((first.kg - last.kg) / days) * 7;
    if (perWeek > input.intended_weekly_change_kg * 2) {
      flags.push({
        id: 'rapid_loss',
        label: 'Weight falling faster than planned',
        detail: `Recent trend is about ${perWeek.toFixed(2)} kg per week against a plan of ${input.intended_weekly_change_kg.toFixed(2)} kg.`,
      });
    }
  }

  if (input.cycle_change_reported) {
    flags.push({
      id: 'cycle',
      label: 'Menstrual cycle change reported',
      detail:
        'A cycle that becomes irregular or stops during a diet is a signal to eat more, not less.',
    });
  }

  if (input.low_libido_reported) {
    flags.push({
      id: 'libido',
      label: 'Reduced libido reported',
      detail: 'This can accompany low energy availability.',
    });
  }

  const level = Math.min(3, flags.length) as 0 | 1 | 2 | 3;
  const should_pause_deficit = flags.length >= 3;

  let message: string;
  if (flags.length === 0) {
    message = 'Nothing unusual in your recent data.';
  } else if (flags.length < 3) {
    message =
      'A couple of things are worth watching. Make sure you are hitting your calorie and protein targets rather than under-eating on busy days, and keep an eye on how the next week feels.';
  } else {
    message =
      'Several signs of under-fuelling are showing at once. The calorie deficit has been paused and your target has been set to maintenance. This is not a diagnosis - it is a pattern worth taking seriously. Please speak to a doctor or a sports dietitian before continuing to diet.';
  }

  return { flags, level, should_pause_deficit, message };
}
