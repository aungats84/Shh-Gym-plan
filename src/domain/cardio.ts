/**
 * Cardio and daily movement.
 *
 * Running is the preferred activity, so the plan builds it in slowly
 * from a sedentary starting point rather than assuming a base that is
 * not there.
 */

export interface CardioWeek {
  week: number;
  runs: number;
  minutes: number;
  description: string;
}

export const CARDIO_PLAN: CardioWeek[] = [
  { week: 1, runs: 0, minutes: 0, description: 'Walking only. Build the step habit first.' },
  { week: 2, runs: 0, minutes: 0, description: 'Walking only. Step goal rises.' },
  {
    week: 3,
    runs: 1,
    minutes: 12,
    description: 'First run. Alternate 2 minutes easy jog, 1 minute walk.',
  },
  { week: 4, runs: 1, minutes: 15, description: 'Alternate 3 minutes jog, 1 minute walk.' },
  { week: 5, runs: 1, minutes: 15, description: 'Easier week overall. Keep the run gentle.' },
  { week: 6, runs: 2, minutes: 18, description: 'Two runs. Try 5 minutes jog, 1 minute walk.' },
  { week: 7, runs: 2, minutes: 20, description: 'Two runs, mostly continuous if it feels easy.' },
  {
    week: 8,
    runs: 2,
    minutes: 24,
    description: 'Two runs. One can be continuous at an easy pace.',
  },
  { week: 9, runs: 1, minutes: 15, description: 'Deload week. One easy run only.' },
];

export function cardioForWeek(week: number): CardioWeek {
  const clamped = Math.min(Math.max(1, week), CARDIO_PLAN.length);
  return CARDIO_PLAN[clamped - 1];
}

export const TALK_TEST = [
  {
    level: 'Easy',
    detail: 'You can hold a full conversation in complete sentences. Most running should be here.',
  },
  {
    level: 'Moderate',
    detail: 'You can speak in short sentences but not comfortably chat.',
  },
  {
    level: 'Hard',
    detail:
      'You can only get a few words out. Use this sparingly, and not at all in the first month.',
  },
];

/** Indoor swaps for when it is raining or too hot. */
export const INDOOR_CARDIO = [
  {
    name: 'Stair climbing',
    detail: 'Up and down a stairwell at a steady pace. Walk down, never run down.',
    equipment: 'Stairs',
  },
  {
    name: 'Marching intervals',
    detail: 'March hard on the spot for 1 minute, easy for 1 minute. Repeat.',
    equipment: 'None',
  },
  {
    name: 'Dance or follow-along cardio',
    detail: 'Any video you enjoy at an easy-to-moderate effort. Enjoyment is the point.',
    equipment: 'Phone or laptop',
  },
  {
    name: 'Shadow boxing',
    detail: 'Light punches and footwork, 3 minutes on, 1 minute rest.',
    equipment: 'None',
  },
];

export const SITTING_BREAK_NOTE =
  'On desk days, stand up and move for 2-3 minutes every hour. This is separate from your workout and it matters on its own.';
