import { describe, expect, it } from 'vitest';
import { assessEnergyAvailability, type EnergyInputs } from '@/domain/energyAvailability';
import type { DailyLog, Measurement, ReadinessCheck, WorkoutSession } from '@/lib/types';

function log(date: string, over: Partial<DailyLog> = {}): DailyLog {
  return {
    date,
    water_l: 2,
    steps: 6000,
    sleep_hours: 8,
    sleep_quality: 4,
    stress: 2,
    energy: 4,
    mood: 4,
    caffeine_last_time: null,
    alcohol_units: 0,
    daytime_sleepiness: false,
    notes: '',
    ...over,
  };
}

function readiness(date: string, over: Partial<ReadinessCheck> = {}): ReadinessCheck {
  return {
    date,
    sleep_quality: 4,
    energy: 4,
    soreness: 2,
    stress: 2,
    motivation: 4,
    has_pain: false,
    pain_note: '',
    warning_symptom: false,
    minutes_available: 60,
    recommended: 'full',
    accepted: 'full',
    ...over,
  };
}

function session(date: string, over: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    date,
    day_key: 'lower_a',
    week: 2,
    mode: 'full',
    status: 'completed',
    sets: [],
    session_rpe: 6,
    difficulty: 'about_right',
    pain_reported: false,
    pain_note: '',
    notes: '',
    duration_minutes: 55,
    ...over,
  };
}

const days = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06'];

const healthy: EnergyInputs = {
  logs: days.map((d) => log(d)),
  readiness: days.map((d) => readiness(d)),
  sessions: days.map((d) => session(d)),
  measurements: [],
  intended_weekly_change_kg: 0.27,
};

describe('when everything is fine', () => {
  it('flags nothing', () => {
    const r = assessEnergyAvailability(healthy);
    expect(r.flags).toHaveLength(0);
    expect(r.should_pause_deficit).toBe(false);
    expect(r.level).toBe(0);
  });

  it('does not flag on a tiny amount of data', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      logs: [log('2026-08-01', { mood: 1, sleep_quality: 1 })],
      readiness: [readiness('2026-08-01', { energy: 1, soreness: 5 })],
    });
    expect(r.flags).toHaveLength(0);
  });
});

describe('individual signals', () => {
  it('notices persistent low energy', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      readiness: days.map((d) => readiness(d, { energy: 2 })),
    });
    expect(r.flags.map((f) => f.id)).toContain('fatigue');
  });

  it('notices soreness that will not settle', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      readiness: days.map((d) => readiness(d, { soreness: 5 })),
    });
    expect(r.flags.map((f) => f.id)).toContain('recovery');
  });

  it('notices sessions consistently feeling too hard', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      sessions: days.map((d) => session(d, { difficulty: 'too_hard' })),
    });
    expect(r.flags.map((f) => f.id)).toContain('performance');
  });

  it('notices falling sleep quality', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      logs: days.map((d) => log(d, { sleep_quality: 2 })),
    });
    expect(r.flags.map((f) => f.id)).toContain('sleep');
  });

  it('notices low mood', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      logs: days.map((d) => log(d, { mood: 2 })),
    });
    expect(r.flags.map((f) => f.id)).toContain('mood');
  });

  it('notices weight falling far faster than planned', () => {
    const measurements: Measurement[] = [
      {
        date: '2026-08-01',
        weight_kg: 52,
        waist_cm: null,
        hip_cm: null,
        arm_cm: null,
        thigh_cm: null,
        note: '',
        photo_note: '',
      },
      {
        date: '2026-08-08',
        weight_kg: 50.5,
        waist_cm: null,
        hip_cm: null,
        arm_cm: null,
        thigh_cm: null,
        note: '',
        photo_note: '',
      },
      {
        date: '2026-08-15',
        weight_kg: 49,
        waist_cm: null,
        hip_cm: null,
        arm_cm: null,
        thigh_cm: null,
        note: '',
        photo_note: '',
      },
    ];
    const r = assessEnergyAvailability({ ...healthy, measurements });
    expect(r.flags.map((f) => f.id)).toContain('rapid_loss');
  });

  it('does not flag weight loss that matches the plan', () => {
    const measurements: Measurement[] = [
      {
        date: '2026-08-01',
        weight_kg: 52,
        waist_cm: null,
        hip_cm: null,
        arm_cm: null,
        thigh_cm: null,
        note: '',
        photo_note: '',
      },
      {
        date: '2026-08-08',
        weight_kg: 51.75,
        waist_cm: null,
        hip_cm: null,
        arm_cm: null,
        thigh_cm: null,
        note: '',
        photo_note: '',
      },
      {
        date: '2026-08-15',
        weight_kg: 51.5,
        waist_cm: null,
        hip_cm: null,
        arm_cm: null,
        thigh_cm: null,
        note: '',
        photo_note: '',
      },
    ];
    const r = assessEnergyAvailability({ ...healthy, measurements });
    expect(r.flags.map((f) => f.id)).not.toContain('rapid_loss');
  });

  it('respects an opt-in cycle report', () => {
    const r = assessEnergyAvailability({ ...healthy, cycle_change_reported: true });
    expect(r.flags.map((f) => f.id)).toContain('cycle');
  });
});

describe('pausing the deficit', () => {
  it('does not pause on one or two signals', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      readiness: days.map((d) => readiness(d, { energy: 2 })),
    });
    expect(r.should_pause_deficit).toBe(false);
    expect(r.message).toContain('worth watching');
  });

  it('pauses once three or more signals appear together', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      logs: days.map((d) => log(d, { sleep_quality: 2, mood: 2 })),
      readiness: days.map((d) => readiness(d, { energy: 2, soreness: 5 })),
    });
    expect(r.should_pause_deficit).toBe(true);
    expect(r.level).toBe(3);
  });

  it('recommends a professional rather than diagnosing anything', () => {
    const r = assessEnergyAvailability({
      ...healthy,
      logs: days.map((d) => log(d, { sleep_quality: 2, mood: 2 })),
      readiness: days.map((d) => readiness(d, { energy: 2, soreness: 5 })),
    });
    expect(r.message).toMatch(/dietitian|doctor/i);
    expect(r.message).toContain('not a diagnosis');
    // It must never name the condition it is watching for.
    expect(r.message).not.toMatch(/RED-?s\b/);
  });
});
