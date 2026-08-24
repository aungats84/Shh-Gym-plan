/**
 * The 9-week training plan.
 *
 * Shape: 4 sessions a week on flexible days (Lower A, Upper A, Lower B,
 * Upper B). Arms and glutes carry extra direct volume because they are
 * the stated priorities, but every major muscle group is trained twice
 * a week, which is the ACSM 2026 position stand's core recommendation.
 *
 * Load is deliberately light: the plan assumes 2 kg dumbbells, so it
 * progresses through reps, tempo, range and unilateral work before it
 * ever asks for more weight, and suggests a loaded backpack when
 * bodyweight alone stops being challenging.
 */

export interface PlannedExercise {
  exercise_id: string;
  sets: number;
  /** Displayed as written, e.g. "10-12" or "20-40 sec". */
  reps: string;
  rest_seconds: number;
  /** Reps in reserve - how many you should have left at the end of a set. */
  rir: number;
  tempo?: string;
  note?: string;
  per_side?: boolean;
}

export interface WorkoutDay {
  key: string;
  name: string;
  focus: string;
  main: PlannedExercise[];
  /** Cut-down version for busy days, travel, or a low readiness score. */
  short: PlannedExercise[];
}

export interface WarmupStep {
  name: string;
  detail: string;
  duration: string;
}

export const GENERAL_WARMUP: WarmupStep[] = [
  {
    name: 'Raise the temperature',
    detail: 'March on the spot, or walk briskly around the room, until you feel slightly warm.',
    duration: '3 min',
  },
  {
    name: 'Arm circles',
    detail: 'Ten small circles forwards, ten backwards, then ten big ones each way.',
    duration: '1 min',
  },
  {
    name: 'Hip circles',
    detail: 'Hands on hips, draw ten slow circles each direction.',
    duration: '1 min',
  },
];

export const LOWER_MOBILITY: WarmupStep[] = [
  {
    name: 'Bodyweight squats',
    detail: 'Ten slow reps, going a little deeper each time.',
    duration: '1 min',
  },
  {
    name: 'Leg swings',
    detail: 'Ten forward and back, ten side to side, each leg. Hold a wall.',
    duration: '1 min',
  },
  {
    name: 'Glute bridges',
    detail: 'Fifteen reps to wake the glutes up before they do the work.',
    duration: '1 min',
  },
];

export const UPPER_MOBILITY: WarmupStep[] = [
  { name: 'Shoulder rolls', detail: 'Ten backwards, ten forwards.', duration: '30 sec' },
  {
    name: 'Wall slides',
    detail: 'Back to a wall, slide the arms up and down ten times.',
    duration: '1 min',
  },
  {
    name: 'Band-free pull-aparts',
    detail: 'Squeeze the shoulder blades together fifteen times.',
    duration: '1 min',
  },
];

export const SPECIFIC_WARMUP_RULE =
  'Before the first working set of each exercise, do one set of 8-10 easy reps with no weight (or lighter weight). This is a rehearsal, not a working set - it should feel easy.';

export interface CooldownStretch {
  name: string;
  detail: string;
  hold: string;
}

export const COOLDOWN: CooldownStretch[] = [
  {
    name: 'Slow breathing',
    detail: 'Sit or lie down. Breathe in for 4 seconds, out for 6.',
    hold: '1 min',
  },
  {
    name: 'Quad stretch',
    detail: 'Standing, hold one ankle behind you. Hold a wall for balance.',
    hold: '30 sec each side',
  },
  {
    name: 'Hamstring stretch',
    detail: 'One heel on the floor in front, hinge forward from the hips.',
    hold: '30 sec each side',
  },
  {
    name: 'Figure-4 glute stretch',
    detail:
      'Lying on your back, cross one ankle over the opposite knee and pull the thigh towards you.',
    hold: '30 sec each side',
  },
  {
    name: 'Chest doorway stretch',
    detail: 'Forearm on a door frame, turn gently away.',
    hold: '30 sec each side',
  },
  {
    name: 'Child pose',
    detail: 'Kneel and reach forward along the floor, letting the back relax.',
    hold: '45 sec',
  },
];

export const WORKOUT_DAYS: WorkoutDay[] = [
  {
    key: 'lower_a',
    name: 'Lower A',
    focus: 'Glutes and quads',
    main: [
      { exercise_id: 'goblet_squat', sets: 3, reps: '10-12', rest_seconds: 90, rir: 3 },
      {
        exercise_id: 'hip_thrust',
        sets: 3,
        reps: '10-12',
        rest_seconds: 90,
        rir: 2,
        note: 'Priority: hips and glutes. Squeeze hard for 1 second at the top of every rep.',
      },
      {
        exercise_id: 'romanian_deadlift',
        sets: 3,
        reps: '10-12',
        rest_seconds: 90,
        rir: 3,
        tempo: '3 seconds down',
      },
      {
        exercise_id: 'hip_abduction',
        sets: 2,
        reps: '15-20',
        rest_seconds: 45,
        rir: 2,
        per_side: true,
      },
      { exercise_id: 'plank', sets: 2, reps: '20-40 sec', rest_seconds: 45, rir: 2 },
    ],
    short: [
      { exercise_id: 'goblet_squat', sets: 2, reps: '12', rest_seconds: 60, rir: 3 },
      { exercise_id: 'hip_thrust', sets: 2, reps: '12', rest_seconds: 60, rir: 2 },
      { exercise_id: 'plank', sets: 1, reps: '30 sec', rest_seconds: 30, rir: 2 },
    ],
  },
  {
    key: 'upper_a',
    name: 'Upper A',
    focus: 'Push and arms',
    main: [
      {
        exercise_id: 'push_up',
        sets: 3,
        reps: '8-12',
        rest_seconds: 90,
        rir: 3,
        note: 'Start with hands on a table. Move lower as it gets easier.',
      },
      {
        exercise_id: 'single_arm_row',
        sets: 3,
        reps: '10-12',
        rest_seconds: 75,
        rir: 3,
        per_side: true,
      },
      { exercise_id: 'shoulder_press', sets: 3, reps: '10-12', rest_seconds: 75, rir: 3 },
      {
        exercise_id: 'bicep_curl',
        sets: 3,
        reps: '12-15',
        rest_seconds: 60,
        rir: 2,
        tempo: '3 seconds down',
        note: 'Priority: arms. The slow lowering is what makes 2 kg work.',
      },
      {
        exercise_id: 'overhead_triceps',
        sets: 3,
        reps: '12-15',
        rest_seconds: 60,
        rir: 2,
        note: 'Priority: arms.',
      },
      { exercise_id: 'dead_bug', sets: 2, reps: '8', rest_seconds: 45, rir: 2, per_side: true },
    ],
    short: [
      { exercise_id: 'push_up', sets: 2, reps: '10', rest_seconds: 60, rir: 3 },
      {
        exercise_id: 'single_arm_row',
        sets: 2,
        reps: '12',
        rest_seconds: 60,
        rir: 3,
        per_side: true,
      },
      { exercise_id: 'bicep_curl', sets: 2, reps: '15', rest_seconds: 45, rir: 2 },
    ],
  },
  {
    key: 'lower_b',
    name: 'Lower B',
    focus: 'Single leg and glutes',
    main: [
      {
        exercise_id: 'bulgarian_split_squat',
        sets: 3,
        reps: '8-10',
        rest_seconds: 90,
        rir: 3,
        per_side: true,
      },
      {
        exercise_id: 'single_leg_glute_bridge',
        sets: 3,
        reps: '10-12',
        rest_seconds: 60,
        rir: 2,
        per_side: true,
        note: 'Priority: hips and glutes.',
      },
      { exercise_id: 'step_up', sets: 2, reps: '10-12', rest_seconds: 75, rir: 3, per_side: true },
      { exercise_id: 'calf_raise', sets: 2, reps: '15-20', rest_seconds: 45, rir: 2 },
      {
        exercise_id: 'side_plank',
        sets: 2,
        reps: '15-30 sec',
        rest_seconds: 45,
        rir: 2,
        per_side: true,
      },
    ],
    short: [
      {
        exercise_id: 'bulgarian_split_squat',
        sets: 2,
        reps: '10',
        rest_seconds: 60,
        rir: 3,
        per_side: true,
      },
      {
        exercise_id: 'single_leg_glute_bridge',
        sets: 2,
        reps: '12',
        rest_seconds: 45,
        rir: 2,
        per_side: true,
      },
      {
        exercise_id: 'side_plank',
        sets: 1,
        reps: '20 sec',
        rest_seconds: 30,
        rir: 2,
        per_side: true,
      },
    ],
  },
  {
    key: 'upper_b',
    name: 'Upper B',
    focus: 'Pull and arms',
    main: [
      {
        exercise_id: 'floor_press',
        sets: 3,
        reps: '10-12',
        rest_seconds: 90,
        rir: 3,
        tempo: '3 seconds down',
      },
      { exercise_id: 'bent_over_row', sets: 3, reps: '12-15', rest_seconds: 75, rir: 3 },
      { exercise_id: 'lateral_raise', sets: 3, reps: '12-20', rest_seconds: 60, rir: 2 },
      {
        exercise_id: 'hammer_curl',
        sets: 3,
        reps: '12-15',
        rest_seconds: 60,
        rir: 2,
        note: 'Priority: arms.',
      },
      {
        exercise_id: 'triceps_kickback',
        sets: 3,
        reps: '15-20',
        rest_seconds: 60,
        rir: 2,
        note: 'Priority: arms.',
      },
      { exercise_id: 'bird_dog', sets: 2, reps: '8', rest_seconds: 45, rir: 2, per_side: true },
    ],
    short: [
      { exercise_id: 'floor_press', sets: 2, reps: '12', rest_seconds: 60, rir: 3 },
      { exercise_id: 'bent_over_row', sets: 2, reps: '15', rest_seconds: 60, rir: 3 },
      { exercise_id: 'hammer_curl', sets: 2, reps: '15', rest_seconds: 45, rir: 2 },
    ],
  },
];

export const DAY_BY_KEY: Record<string, WorkoutDay> = Object.fromEntries(
  WORKOUT_DAYS.map((d) => [d.key, d]),
);

/** What changes each week, and why. Shown on the Workouts page. */
export interface WeekPlan {
  week: number;
  label: string;
  /** Multiplier applied to the planned set count. */
  set_multiplier: number;
  /** Reps in reserve target for this week. */
  rir: number;
  focus: string;
  cardio: string;
}

export const WEEK_PLAN: WeekPlan[] = [
  {
    week: 1,
    label: 'Week 1 - Learn the movements',
    set_multiplier: 0.7,
    rir: 4,
    focus:
      'Fewer sets than the plan shows. The job this week is learning each exercise and finding a weight you can control, not being sore.',
    cardio: 'Walking only. No running yet.',
  },
  {
    week: 2,
    label: 'Week 2 - Full sets, easy effort',
    set_multiplier: 1,
    rir: 4,
    focus: 'Full set count now. Still stop about 4 reps short of failure on everything.',
    cardio: 'Walking only. Step goal rises slightly.',
  },
  {
    week: 3,
    label: 'Week 3 - Add reps',
    set_multiplier: 1,
    rir: 3,
    focus: 'Aim for the top of each rep range before making anything harder.',
    cardio: 'First run: 10-15 minutes, easy pace, after sunset.',
  },
  {
    week: 4,
    label: 'Week 4 - Add tempo',
    set_multiplier: 1,
    rir: 3,
    focus:
      'Slow the lowering phase to 3 seconds on the main exercises. This is how light dumbbells stay challenging.',
    cardio: 'One run, 15 minutes. Keep it conversational.',
  },
  {
    week: 5,
    label: 'Week 5 - Easier week',
    set_multiplier: 0.7,
    rir: 4,
    focus:
      'A planned lighter week. Cutting volume now is what lets weeks 6-8 work. This is not falling behind.',
    cardio: 'One easy run, 15 minutes.',
  },
  {
    week: 6,
    label: 'Week 6 - Add load',
    set_multiplier: 1,
    rir: 2,
    focus:
      'Start using a loaded backpack on squats, hip thrusts, split squats and step-ups. Add 2-3 kg at a time.',
    cardio: 'Two runs, 15-20 minutes.',
  },
  {
    week: 7,
    label: 'Week 7 - Add a set to priorities',
    set_multiplier: 1.15,
    rir: 2,
    focus: 'One extra set on the arm and glute exercises only. Everything else stays the same.',
    cardio: 'Two runs, 20 minutes.',
  },
  {
    week: 8,
    label: 'Week 8 - Hardest week',
    set_multiplier: 1.15,
    rir: 2,
    focus: 'Highest volume of the plan. Push close to, but not to, failure on the last set.',
    cardio: 'Two runs, 20-25 minutes.',
  },
  {
    week: 9,
    label: 'Week 9 - Deload and reassess',
    set_multiplier: 0.6,
    rir: 4,
    focus:
      'Half the volume, easy effort. Take measurements at the end of this week and decide what comes next.',
    cardio: 'One easy run, 15 minutes.',
  },
];

export function weekPlanFor(week: number): WeekPlan {
  const clamped = Math.min(Math.max(1, week), WEEK_PLAN.length);
  return WEEK_PLAN[clamped - 1];
}

/** Rest-of-plan guidance for interruptions. */
export const RETURN_GUIDANCE = [
  {
    situation: 'Missed 1-3 days',
    advice: 'Carry on where you left off. Nothing is lost in three days.',
  },
  {
    situation: 'Missed about a week',
    advice: 'Repeat the last week you completed rather than jumping ahead.',
  },
  {
    situation: 'Missed two weeks or more',
    advice:
      'Drop back two weeks in the plan and rebuild. You will catch up faster than you expect.',
  },
  {
    situation: 'After a cold or flu',
    advice:
      'Wait until you have been symptom-free for a full day. Come back at about half your usual sets for the first two sessions. If you had a fever, chest symptoms, or felt very unwell, get advice before training again.',
  },
  {
    situation: 'After travel',
    advice: 'Use the short workouts while away, then rejoin the plan at the week you were on.',
  },
];
