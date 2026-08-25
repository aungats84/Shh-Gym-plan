/**
 * Verified tutorial videos.
 *
 * Every entry below was checked against YouTube's oEmbed endpoint on
 * 25 August 2026, which is what returned the title and channel names
 * recorded here. Nothing in this file was guessed or constructed.
 *
 * If a video is later taken down, the app falls back to a YouTube
 * search for that exercise rather than showing a dead link.
 */

export interface VerifiedVideo {
  video_id: string;
  title: string;
  channel: string;
}

export const VERIFIED_ON = '2026-08-25';

export const VIDEOS: Record<string, VerifiedVideo> = {
  goblet_squat: {
    video_id: 'gCESNsDsbqk',
    title: 'Goblet Squats: Proper Form & Technique',
    channel: 'BuiltLean®',
  },
  split_squat: {
    video_id: 'yhMiMbc2O2M',
    title: 'Split Squat / Static Lunge Tutorial',
    channel: 'Jen Curtis Online Coaching',
  },
  bulgarian_split_squat: {
    video_id: '2C-uNgKwPLE',
    title: 'How To: Bulgarian Split Squat',
    channel: 'ScottHermanFitness',
  },
  step_up: {
    video_id: 'aKj-6hgiViA',
    title: 'How To PROPERLY Perform Dumbbell Step Ups (GLUTE FOCUSED)',
    channel: 'Colossus Fitness',
  },
  reverse_lunge: {
    video_id: 'u_zSfK5ZFU4',
    title: 'Reverse Lunge Exercise: Proper Form',
    channel: 'BuiltLean®',
  },
  hip_thrust: {
    video_id: 'j59jWsUbl8A',
    title: 'Exercise Tutorial: Bodyweight Hip Thrust On Bench',
    channel: 'Travis Tarrant',
  },
  glute_bridge: {
    video_id: 'nbjJjSa0cKo',
    title: 'How To Do a Glute Bridge Correctly',
    channel: 'Erin Stern',
  },
  single_leg_glute_bridge: {
    video_id: 'VUl8R0kn6v4',
    title: 'Single Leg Glute Bridge Tutorial - Proper Form and Technique',
    channel: 'Runna',
  },
  romanian_deadlift: {
    video_id: 'aa57T45iFSE',
    title: 'How to do a Dumbbell Romanian Deadlift | Proper Form & Technique | NASM',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  sl_romanian_deadlift: {
    video_id: 'Zfr6wizR8rs',
    title: 'The BEST Single-Leg RDL Tutorial (Romanian Deadlift)',
    channel: 'Squat University',
  },
  hip_abduction: {
    video_id: 'CTmFNSDJTR8',
    title: 'How to Do Side Lying Hip Abduction Correctly',
    channel: 'MOVE with Dr. Mike',
  },
  calf_raise: {
    video_id: 'k8ipHzKeAkQ',
    title: 'Exercises with an Athletic Trainer: Standing Calf Raises',
    channel: "Children's Hospital Colorado",
  },
  wall_sit: {
    video_id: 'JaZNYM3zAP0',
    title: 'How To Do a Wall Sit | The Right Way | Well+Good',
    channel: 'Well+Good',
  },
  push_up: {
    video_id: 'WDIpL0pjun0',
    title: 'How to do a Push-Up | Proper Form & Technique | NASM',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  floor_press: {
    video_id: 'T0Y3OBF1bNI',
    title: 'How To Do A Dumbbell Floor Press',
    channel: 'PureGym',
  },
  shoulder_press: {
    video_id: 'qEwKCR5JCog',
    title: 'How To: Dumbbell Shoulder Press',
    channel: 'ScottHermanFitness',
  },
  lateral_raise: {
    video_id: 'nnH63icHYXY',
    title: 'Dumbbell Lateral Raise | Proper Form Tutorial for Bigger Shoulders',
    channel: 'FIT.nl',
  },
  bent_over_row: {
    video_id: 'dfkco3keMns',
    title: 'Bent Over Dumbbell Row : Proper Form and Common Mistakes to Avoid',
    channel: 'Dr. Fitology',
  },
  single_arm_row: {
    video_id: 'fURsHPHgssI',
    title: 'Single-Arm Dumbbell Row on a Bench: Perfect Form Tutorial',
    channel: 'The Healthy Habit',
  },
  reverse_fly: {
    video_id: 'd1QEddtoOq0',
    title: 'How To Dumbbell Reverse Fly PROPERLY | MAXIMIZE REAR DELTS',
    channel: 'Colossus Fitness',
  },
  bicep_curl: {
    video_id: '6DeLZ6cbgWQ',
    title: 'How to Perform Standing Dumbbell Bicep Curls',
    channel: 'Chris McCarthy',
  },
  hammer_curl: {
    video_id: 'BRVDS6HVR9Q',
    title: 'How To Perform HAMMER CURLS | Biceps Exercise Tutorial',
    channel: 'Buff Dudes Workouts',
  },
  overhead_triceps: {
    video_id: 'O7e8j8K3cJo',
    title: 'Overhead Dumbbell Tricep Extension | Proper Form & Triceps Exercise Demo',
    channel: 'PrazeNation',
  },
  triceps_kickback: {
    video_id: 'm9me06UBPKc',
    title: 'How to Perform Dumbbell Triceps Kickback Exercise',
    channel: 'Buff Dudes',
  },
  chair_dip: {
    video_id: 'AWz_7B1cch0',
    title: 'How To Properly Do Tricep Chair Dips - 3 Common Mistakes',
    channel: 'Coach Nick Fitness',
  },
  superman: {
    video_id: 'BO1Xlqp5o90',
    title: 'How to Perform the Superman Exercise and Strengthen Your Lower Back',
    channel: 'Brian Moyle Fitness',
  },
  plank: {
    video_id: 'A2b2EmIg0dA',
    title: 'How To Plank (Proper Form | Cues | Progressions)',
    channel: 'E3 Rehab',
  },
  side_plank: {
    video_id: 'iNbH7_edNI8',
    title: 'Side Plank Tutorial - Proper Form and Technique',
    channel: 'Runna',
  },
  dead_bug: {
    video_id: 'bxn9FBrt4-A',
    title: 'How to do a Dead Bug | Proper Form & Technique | NASM',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
  bird_dog: {
    video_id: 'ZdAHe9_HeEw',
    title: 'How to do a Bird Dog | Proper Form & Technique | NASM',
    channel: 'National Academy of Sports Medicine (NASM)',
  },
};

export function videoFor(exerciseId: string): VerifiedVideo | null {
  return VIDEOS[exerciseId] ?? null;
}

/** Opens the YouTube app on a phone, the site on a laptop. */
export function watchUrl(v: VerifiedVideo): string {
  return `https://www.youtube.com/watch?v=${v.video_id}`;
}

/** Thumbnail served by YouTube itself - no image is stored in this project. */
export function thumbUrl(v: VerifiedVideo): string {
  return `https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg`;
}

/** Fallback when a video has been removed. */
export function searchUrl(phrase: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(phrase)}`;
}
