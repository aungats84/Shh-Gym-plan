/**
 * Daily readiness check.
 *
 * Turns five 1-5 ratings plus two safety flags into a suggestion.
 * The suggestion is never applied automatically - the interface always
 * shows the reason and asks the person to confirm.
 */

import type { ReadinessAction } from '@/lib/types';

export interface ReadinessInput {
  /** 1 = terrible, 5 = excellent */
  sleep_quality: number;
  /** 1 = exhausted, 5 = full of energy */
  energy: number;
  /** 1 = none, 5 = very sore */
  soreness: number;
  /** 1 = calm, 5 = very stressed */
  stress: number;
  /** 1 = none, 5 = very motivated */
  motivation: number;
  has_pain: boolean;
  /** Chest discomfort, dizziness, fainting, unusual breathlessness. */
  warning_symptom: boolean;
  minutes_available: number;
}

export interface ReadinessResult {
  score: number;
  /** 0-100, for the ring on the Today page. */
  percent: number;
  recommended: ReadinessAction;
  headline: string;
  reason: string;
  /** Shown as a red panel rather than a normal suggestion. */
  urgent: boolean;
}

export const ACTION_LABELS: Record<ReadinessAction, string> = {
  full: 'Do the planned workout',
  reduced: 'Same exercises, less volume',
  short: 'Do the short workout',
  light: 'Light cardio and mobility',
  rest: 'Take a recovery day',
  stop_seek_advice: 'Do not train today - get checked',
};

/** 5 (worst) to 25 (best). */
export function readinessScore(input: ReadinessInput): number {
  const inverted = (v: number) => 6 - clamp1to5(v);
  return (
    clamp1to5(input.sleep_quality) +
    clamp1to5(input.energy) +
    inverted(input.soreness) +
    inverted(input.stress) +
    clamp1to5(input.motivation)
  );
}

function clamp1to5(v: number): number {
  if (Number.isNaN(v)) return 3;
  return Math.min(5, Math.max(1, Math.round(v)));
}

export function assessReadiness(input: ReadinessInput): ReadinessResult {
  const score = readinessScore(input);
  const percent = Math.round(((score - 5) / 20) * 100);

  // 1. Safety first. Nothing below this point can override it.
  if (input.warning_symptom) {
    return {
      score,
      percent,
      recommended: 'stop_seek_advice',
      urgent: true,
      headline: 'Do not train today',
      reason:
        'You reported a warning symptom such as chest discomfort, dizziness, fainting or unusual breathlessness. These need to be checked by a health professional before you exercise again. If the symptom is happening now, or comes with sweating, nausea, or pain spreading to your arm, neck or jaw, call 1669 immediately.',
    };
  }

  // 2. Pain that is not ordinary muscle soreness.
  if (input.has_pain) {
    return {
      score,
      percent,
      recommended: 'light',
      urgent: false,
      headline: 'Skip loading the painful area',
      reason:
        'You reported pain rather than normal muscle soreness. Gentle movement is usually fine, but loading a painful joint is not. Do light cardio and mobility today and avoid anything that reproduces the pain. If it is sharp, swelling, spreading, or still there in a few days, get it looked at.',
    };
  }

  // 3. Not enough time. Nothing wrong - just be realistic.
  if (input.minutes_available > 0 && input.minutes_available < 25) {
    return {
      score,
      percent,
      recommended: 'short',
      urgent: false,
      headline: 'Short session today',
      reason: `You have about ${input.minutes_available} minutes. The short workout covers the most important movements and still counts towards your week.`,
    };
  }

  // 4. Otherwise use the score.
  if (score >= 20) {
    return {
      score,
      percent,
      recommended: 'full',
      urgent: false,
      headline: 'Good to go',
      reason: 'Sleep, energy and soreness all look fine. Do the planned session as written.',
    };
  }

  if (score >= 15) {
    return {
      score,
      percent,
      recommended: 'full',
      urgent: false,
      headline: 'Go ahead, adjust if needed',
      reason:
        'You are a little below your best but nothing stands out. Start the planned workout. If the first two working sets feel much harder than usual, drop one set from each exercise.',
    };
  }

  if (score >= 11) {
    return {
      score,
      percent,
      recommended: 'reduced',
      urgent: false,
      headline: 'Same exercises, less of them',
      reason:
        'Your readiness is low today. Keep the same exercises so you do not lose the pattern, but cut one set from each and stay two or three reps away from failure. This keeps the habit without digging a hole.',
    };
  }

  if (score >= 8) {
    return {
      score,
      percent,
      recommended: 'short',
      urgent: false,
      headline: 'Do the short version',
      reason:
        'Sleep, energy or stress are well below normal. The short workout keeps your week on track and is much easier to recover from than a full session.',
    };
  }

  return {
    score,
    percent,
    recommended: 'rest',
    urgent: false,
    headline: 'Rest today',
    reason:
      'Everything you reported is low. A recovery day now is more useful than a session you will not recover from. Walk, stretch, eat normally, and come back tomorrow. Missing one planned day does not undo your week.',
  };
}

/** Volume multiplier applied to the planned session for each action. */
export function volumeMultiplier(action: ReadinessAction): number {
  switch (action) {
    case 'full':
      return 1;
    case 'reduced':
      return 0.7;
    case 'short':
      return 0.5;
    default:
      return 0;
  }
}
