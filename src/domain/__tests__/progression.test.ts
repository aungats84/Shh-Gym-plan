import { describe, expect, it } from 'vitest';
import {
  bestSetsByExercise,
  buildSetLogs,
  isPersonalRecord,
  progressionAdvice,
  scaleSets,
  sessionsInWeek,
  weeklySetsPerMuscle,
} from '@/domain/progression';
import { WORKOUT_DAYS } from '@/data/program';
import { EXERCISES } from '@/data/exercises';
import type { SetLog, WorkoutSession } from '@/lib/types';

describe('the written plan', () => {
  it('trains four days a week', () => {
    expect(WORKOUT_DAYS).toHaveLength(4);
  });

  it('only uses exercises that exist in the library', () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const day of WORKOUT_DAYS) {
      for (const item of [...day.main, ...day.short]) {
        expect(ids.has(item.exercise_id)).toBe(true);
      }
    }
  });

  it('gives every exercise cues, mistakes and a tutorial search phrase', () => {
    for (const ex of EXERCISES) {
      expect(ex.cues.length).toBeGreaterThanOrEqual(3);
      expect(ex.cues.length).toBeLessThanOrEqual(5);
      expect(ex.mistakes.length).toBeGreaterThanOrEqual(2);
      expect(ex.breathing.length).toBeGreaterThan(10);
      expect(ex.starting_load.length).toBeGreaterThan(10);
      expect(ex.tutorial.search_phrase.length).toBeGreaterThan(5);
    }
  });

  it('never claims a tutorial is verified without a real link', () => {
    for (const ex of EXERCISES) {
      if (ex.tutorial.verified) {
        expect(ex.tutorial.url).toMatch(/^https:\/\//);
        expect(ex.tutorial.title).toBeTruthy();
        expect(ex.tutorial.channel).toBeTruthy();
      } else {
        expect(ex.tutorial.url).toBeUndefined();
      }
    }
  });

  it('has a short version of every session', () => {
    for (const day of WORKOUT_DAYS) {
      expect(day.short.length).toBeGreaterThan(0);
      const shortSets = day.short.reduce((n, e) => n + e.sets, 0);
      const fullSets = day.main.reduce((n, e) => n + e.sets, 0);
      expect(shortSets).toBeLessThan(fullSets);
    }
  });
});

describe('weekly volume', () => {
  const volume = weeklySetsPerMuscle(2);

  it('trains every major muscle group', () => {
    for (const m of [
      'quads',
      'hamstrings',
      'glutes',
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'core',
    ]) {
      expect(volume[m] ?? 0).toBeGreaterThan(0);
    }
  });

  it('gives the priority muscles more volume than a non-priority one', () => {
    expect(volume.glutes).toBeGreaterThan(volume.calves ?? 0);
    expect(volume.biceps).toBeGreaterThan(volume.calves ?? 0);
  });

  it('keeps volume inside a sane range for a returning beginner', () => {
    for (const [muscle, sets] of Object.entries(volume)) {
      expect(sets, `${muscle} volume`).toBeLessThanOrEqual(26);
    }
  });
});

describe('weekly scaling', () => {
  it('reduces volume in week 1', () => {
    const w1 = scaleSets(WORKOUT_DAYS[0].main, 1).reduce((n, e) => n + e.sets, 0);
    const w2 = scaleSets(WORKOUT_DAYS[0].main, 2).reduce((n, e) => n + e.sets, 0);
    expect(w1).toBeLessThan(w2);
  });

  it('reduces volume again in the deload week', () => {
    const w8 = scaleSets(WORKOUT_DAYS[0].main, 8).reduce((n, e) => n + e.sets, 0);
    const w9 = scaleSets(WORKOUT_DAYS[0].main, 9).reduce((n, e) => n + e.sets, 0);
    expect(w9).toBeLessThan(w8);
  });

  it('adds the extra week 7 set only to priority exercises', () => {
    const base = WORKOUT_DAYS[1].main;
    const scaled = scaleSets(base, 7);
    for (let i = 0; i < base.length; i += 1) {
      const isPriority = /Priority/i.test(base[i].note ?? '');
      if (isPriority) expect(scaled[i].sets).toBeGreaterThanOrEqual(base[i].sets);
      else expect(scaled[i].sets).toBe(base[i].sets);
    }
  });

  it('never drops an exercise to zero sets', () => {
    for (let week = 1; week <= 9; week += 1) {
      for (const day of WORKOUT_DAYS) {
        for (const item of scaleSets(day.main, week)) {
          expect(item.sets).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it('applies the readiness volume factor on top', () => {
    const full = buildSetLogs('lower_a', 3, false, 1).length;
    const reduced = buildSetLogs('lower_a', 3, false, 0.7).length;
    expect(reduced).toBeLessThan(full);
    expect(reduced).toBeGreaterThan(0);
  });
});

describe('personal records', () => {
  const previous = { reps: 10, weight_kg: 2, volume: 20, date: '2026-08-01' };

  it('recognises a heavier set as a record', () => {
    const set: SetLog = {
      exercise_id: 'bicep_curl',
      set_index: 0,
      target_reps: '12-15',
      reps: 12,
      weight_kg: 2,
      rir: 2,
      done: true,
    };
    expect(isPersonalRecord(set, previous)).toBe(true);
  });

  it('does not count an unfinished set', () => {
    const set: SetLog = {
      exercise_id: 'bicep_curl',
      set_index: 0,
      target_reps: '12-15',
      reps: 20,
      weight_kg: 2,
      rir: 2,
      done: false,
    };
    expect(isPersonalRecord(set, previous)).toBe(false);
  });

  it('does not call the very first set a record', () => {
    const set: SetLog = {
      exercise_id: 'bicep_curl',
      set_index: 0,
      target_reps: '12-15',
      reps: 12,
      weight_kg: 2,
      rir: 2,
      done: true,
    };
    expect(isPersonalRecord(set, undefined)).toBe(false);
  });

  it('finds the best set across sessions', () => {
    const sessions: WorkoutSession[] = [
      {
        date: '2026-08-01',
        day_key: 'upper_a',
        week: 1,
        mode: 'full',
        status: 'completed',
        session_rpe: 6,
        difficulty: 'about_right',
        pain_reported: false,
        pain_note: '',
        notes: '',
        duration_minutes: 50,
        sets: [
          {
            exercise_id: 'bicep_curl',
            set_index: 0,
            target_reps: '12',
            reps: 10,
            weight_kg: 2,
            rir: 2,
            done: true,
          },
          {
            exercise_id: 'bicep_curl',
            set_index: 1,
            target_reps: '12',
            reps: 14,
            weight_kg: 2,
            rir: 1,
            done: true,
          },
        ],
      },
    ];
    expect(bestSetsByExercise(sessions).bicep_curl.reps).toBe(14);
  });
});

describe('progression advice', () => {
  it('asks for a starting point when there is no history', () => {
    expect(progressionAdvice('10-12', null, null, true).headline).toMatch(/starting point/i);
  });

  it('tells someone to back off after going to failure', () => {
    expect(progressionAdvice('10-12', 12, 0, true).headline).toMatch(/ease off/i);
  });

  it('suggests more weight when weight is available', () => {
    expect(progressionAdvice('10-12', 12, 3, true).headline).toMatch(/add weight/i);
  });

  it('suggests tempo instead when no heavier weight exists', () => {
    const advice = progressionAdvice('10-12', 12, 3, false);
    expect(advice.headline).toMatch(/slow it down/i);
    expect(advice.detail).toMatch(/3-4 seconds|pause/i);
  });

  it('asks for one more rep when short of the range', () => {
    expect(progressionAdvice('10-12', 10, 3, true).detail).toContain('11');
  });
});

describe('week filtering', () => {
  it('counts only completed sessions inside the week', () => {
    const make = (date: string, status: WorkoutSession['status']): WorkoutSession => ({
      date,
      day_key: 'lower_a',
      week: 1,
      mode: 'full',
      status,
      sets: [],
      session_rpe: null,
      difficulty: null,
      pain_reported: false,
      pain_note: '',
      notes: '',
      duration_minutes: null,
    });
    const sessions = [
      make('2026-08-24', 'completed'),
      make('2026-08-26', 'completed'),
      make('2026-08-27', 'skipped'),
      make('2026-08-31', 'completed'),
    ];
    expect(sessionsInWeek(sessions, '2026-08-24')).toHaveLength(2);
  });
});
