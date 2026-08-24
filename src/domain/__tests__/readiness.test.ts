import { describe, expect, it } from 'vitest';
import {
  assessReadiness,
  readinessScore,
  volumeMultiplier,
  type ReadinessInput,
} from '@/domain/readiness';

const good: ReadinessInput = {
  sleep_quality: 5,
  energy: 5,
  soreness: 1,
  stress: 1,
  motivation: 5,
  has_pain: false,
  warning_symptom: false,
  minutes_available: 60,
};

const bad: ReadinessInput = {
  sleep_quality: 1,
  energy: 1,
  soreness: 5,
  stress: 5,
  motivation: 1,
  has_pain: false,
  warning_symptom: false,
  minutes_available: 60,
};

describe('readiness score', () => {
  it('gives 25 for a perfect day', () => {
    expect(readinessScore(good)).toBe(25);
  });

  it('gives 5 for the worst possible day', () => {
    expect(readinessScore(bad)).toBe(5);
  });

  it('treats soreness and stress as bad when high', () => {
    expect(readinessScore({ ...good, soreness: 5 })).toBeLessThan(readinessScore(good));
    expect(readinessScore({ ...good, stress: 5 })).toBeLessThan(readinessScore(good));
  });

  it('clamps values outside 1-5', () => {
    expect(readinessScore({ ...good, energy: 99 })).toBe(25);
    expect(readinessScore({ ...good, energy: -4 })).toBe(21);
  });
});

describe('safety takes priority', () => {
  it('a warning symptom always stops training, even on a perfect day', () => {
    const r = assessReadiness({ ...good, warning_symptom: true });
    expect(r.recommended).toBe('stop_seek_advice');
    expect(r.urgent).toBe(true);
    expect(r.reason).toContain('1669');
  });

  it('a warning symptom overrides a short time window', () => {
    const r = assessReadiness({ ...good, warning_symptom: true, minutes_available: 10 });
    expect(r.recommended).toBe('stop_seek_advice');
  });

  it('pain leads to light work rather than the planned session', () => {
    const r = assessReadiness({ ...good, has_pain: true });
    expect(r.recommended).toBe('light');
    expect(r.urgent).toBe(false);
  });

  it('pain outranks a good score but not a warning symptom', () => {
    expect(assessReadiness({ ...good, has_pain: true, warning_symptom: true }).recommended).toBe(
      'stop_seek_advice',
    );
  });
});

describe('normal recommendations', () => {
  it('suggests the full session when everything is good', () => {
    expect(assessReadiness(good).recommended).toBe('full');
  });

  it('suggests rest when everything is bad', () => {
    expect(assessReadiness(bad).recommended).toBe('rest');
  });

  it('suggests the short workout when time is tight', () => {
    expect(assessReadiness({ ...good, minutes_available: 15 }).recommended).toBe('short');
  });

  it('does not trigger the short workout at 25 minutes or more', () => {
    expect(assessReadiness({ ...good, minutes_available: 25 }).recommended).toBe('full');
  });

  it('reduces volume in the middle band', () => {
    const middling: ReadinessInput = {
      ...good,
      sleep_quality: 2,
      energy: 2,
      soreness: 4,
      stress: 4,
      motivation: 3,
    };
    expect(['reduced', 'short']).toContain(assessReadiness(middling).recommended);
  });

  it('always explains itself', () => {
    for (const input of [good, bad, { ...good, has_pain: true }]) {
      const r = assessReadiness(input);
      expect(r.reason.length).toBeGreaterThan(20);
      expect(r.headline.length).toBeGreaterThan(3);
    }
  });

  it('reports a percentage between 0 and 100', () => {
    expect(assessReadiness(good).percent).toBe(100);
    expect(assessReadiness(bad).percent).toBe(0);
  });
});

describe('volume multiplier', () => {
  it('keeps everything for a full session', () => {
    expect(volumeMultiplier('full')).toBe(1);
  });

  it('cuts volume progressively', () => {
    expect(volumeMultiplier('reduced')).toBeLessThan(volumeMultiplier('full'));
    expect(volumeMultiplier('short')).toBeLessThan(volumeMultiplier('reduced'));
  });

  it('is zero for anything that is not a workout', () => {
    expect(volumeMultiplier('rest')).toBe(0);
    expect(volumeMultiplier('light')).toBe(0);
    expect(volumeMultiplier('stop_seek_advice')).toBe(0);
  });
});
