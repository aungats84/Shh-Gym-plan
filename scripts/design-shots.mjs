/**
 * Design handoff screenshots.
 *
 * Serves the built site, seeds a lived-in account (a few weeks of
 * training, meals chosen, sleep logged) and captures every screen
 * full-page at phone and laptop width.
 *
 * The point is to show a designer the real thing, so the seed data is
 * deliberately "mid-plan" rather than empty - empty states hide most of
 * the layout.
 *
 *   node scripts/design-shots.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE = '/Shh-Gym-plan/';
const PORT = 4179;
const OUT = path.resolve('design-screenshots');

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url.startsWith(BASE)) url = url.slice(BASE.length - 1);
  let file = path.join(DIST, url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

/* The app works in Bangkok time, so seed whatever day it is there now -
   a hard-coded date silently turns every screen into an empty state. */
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
const dayBefore = (iso, back) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
};

const PLAN_START = dayBefore(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date()), 15);

const PROFILE = {
  user_id: '00000000-0000-4000-8000-000000000001',
  display_name: 'San',
  age: 23,
  sex: 'female',
  height_cm: 152,
  weight_kg: 51.2,
  waist_cm: 62.5,
  units: 'metric',
  area: 'Rangsit',
  goals: ['fat_loss', 'recomposition'],
  priority_muscles: ['arms', 'glutes'],
  timeline_weeks: 9,
  experience: 'returning',
  intensity: 'moderate',
  training_days_per_week: 4,
  session_minutes: 60,
  preferred_time: 'evening',
  flexible_schedule: true,
  equipment: ['dumbbells', 'mat', 'furniture'],
  dumbbell_kg: 2,
  can_buy_equipment: false,
  baseline_steps: 3000,
  enjoys: ['running'],
  dislikes: [],
  budget_thb_per_day: 100,
  meals_per_day: 2,
  allows_snacks: false,
  cooking_skill: 'confident',
  kitchen: ['fridge', 'stove', 'rice cooker'],
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
  parq_confirmed_at: '2026-08-20T00:00:00Z',
  parq_flagged_yes: false,
  doctor_restrictions: null,
  theme: 'light',
  track_cycle: false,
  plan_start_date: PLAN_START,
  updated_at: `${TODAY}T11:20:00Z`,
};

const STAMP = `${TODAY}T12:00:00Z`;

/* Three weeks of weights and waist, trending gently down. */
const measurements = Array.from({ length: 15 }, (_, i) => {
  return {
    date: dayBefore(TODAY, (14 - i) * 2),
    weight_kg: Math.round((52 - i * 0.055 + Math.sin(i * 1.3) * 0.35) * 10) / 10,
    waist_cm: Math.round((63.5 - i * 0.07) * 10) / 10,
    hip_cm: null,
    arm_cm: null,
    thigh_cm: null,
    note: '',
    photo_note: '',
    updated_at: STAMP,
  };
});

/* Two weeks of daily logs so sleep and steps charts have shape. */
const daily_logs = Array.from({ length: 16 }, (_, i) => {
  const date = dayBefore(TODAY, 15 - i);
  return {
    date,
    water_l: date === TODAY ? 0.75 : Math.round((1 + (i % 4) * 0.25) * 100) / 100,
    steps: date === TODAY ? 4200 : 3000 + (i % 5) * 900,
    sleep_hours: Math.round((7 + Math.sin(i) * 1.2) * 2) / 2,
    sleep_quality: 3 + (i % 3),
    stress: 2 + (i % 3),
    energy: 3 + (i % 3),
    mood: 3 + (i % 2),
    caffeine_last_time: i % 3 === 0 ? '18:30' : null,
    alcohol_units: null,
    daytime_sleepiness: i % 6 === 0,
    notes: '',
    updated_at: STAMP,
  };
});

/* A completed session earlier this week, so Progress and Train have history. */
const SETS = (exercise_id, reps, weight) =>
  Array.from({ length: 3 }, (_, s) => ({
    exercise_id,
    set_index: s,
    target_reps: reps,
    reps: Number(reps.split('-')[0]) + (s === 2 ? -1 : 0),
    weight_kg: weight,
    rir: 2,
    done: true,
  }));

const workout = (date, day_key, week) => ({
  date,
  day_key,
  week,
  mode: 'full',
  status: 'completed',
  sets: [
    ...SETS('goblet_squat', '10-12', 4),
    ...SETS('romanian_deadlift', '10-12', 4),
    ...SETS('glute_bridge', '12-15', 0),
    ...SETS('plank', '30-45', 0),
  ],
  session_rpe: 7,
  difficulty: 'about_right',
  pain_reported: false,
  pain_note: '',
  notes: '',
  duration_minutes: 52,
  updated_at: STAMP,
});

const workouts = [
  workout(dayBefore(TODAY, 8), 'lower_a', 2),
  workout(dayBefore(TODAY, 6), 'upper_a', 2),
  workout(dayBefore(TODAY, 4), 'lower_b', 2),
  workout(dayBefore(TODAY, 1), 'lower_a', 3),
];

/* One meal already chosen today, one still to pick - shows both states. */
const meal_selections = [
  {
    date: TODAY,
    slot: 'meal_1',
    meal_id: 'd1_m1_home',
    option_kind: 'home',
    logged: true,
    portion_multiplier: 1,
    custom_name: null,
    custom_kcal: null,
    custom_protein_g: null,
    updated_at: STAMP,
  },
];

const weekly_reviews = [
  {
    week_start: dayBefore(TODAY, 8),
    workouts_completed: 3,
    improved: 'Squats felt easier and I finished every set.',
    had_pain: false,
    energy_recovery: 4,
    sleep_rating: 3,
    hunger_manageable: true,
    meals_affordable: true,
    favourite_meals: 'Chicken and basil rice',
    difficulty: 'about_right',
    smallest_adjustment: 'Add one more set on hip thrusts',
    applied_change: null,
    created_at: STAMP,
  },
];

const SEED = {
  profile: PROFILE,
  daily_logs,
  readiness_checks: [],
  workouts,
  meal_selections,
  measurements,
  symptoms: [],
  weekly_reviews,
  plan_versions: [],
};

const PAGES = [
  ['', '01-today', 'Today - the home screen'],
  ['#/train', '02-train', 'Train - this week’s four sessions'],
  ['#/train/session/lower_a', '03-train-session', 'Inside a workout - set logging and rest timer'],
  ['#/train/before', '04-train-before', 'Before you train - readiness check'],
  ['#/train/after', '05-train-after', 'After you train - recovery'],
  ['#/train/cardio', '06-train-cardio', 'Cardio - running and walking'],
  ['#/train/heat', '07-train-heat', 'Heat safety - training in Bangkok'],
  ['#/food', '08-food', 'Food - choosing the day’s two meals'],
  ['#/progress', '09-progress', 'Progress - weight, waist and charts'],
  ['#/progress/sleep', '10-progress-sleep', 'Sleep and stress'],
  ['#/progress/review', '11-progress-review', 'Weekly review'],
  ['#/more', '12-more-howto', 'More - exercise videos and evidence'],
  ['#/more/transfer', '13-more-transfer', 'Transfer - moving data between phone and laptop'],
  ['#/more/settings', '14-more-settings', 'Settings'],
];

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'laptop', width: 1440, height: 900 },
];

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const FOLDERS = ['phone-full', 'phone-screen', 'laptop-full', 'laptop-screen', 'phone-dark-full'];
fs.rmSync(OUT, { recursive: true, force: true });
for (const f of FOLDERS) fs.mkdirSync(path.join(OUT, f), { recursive: true });

const written = [];

/**
 * `full` captures the whole scrollable screen. The bottom tab bar is
 * position:fixed, which in a full-page shot renders stranded in the middle
 * of the image and reads as a broken layout, so it is hidden there and
 * shown properly in the viewport shots instead.
 */
async function capture(vp, seed, folder, { full }) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  await context.addInitScript((s) => {
    localStorage.setItem('san-training:data', JSON.stringify(s));
    // Without this the sidebar reads "Saved never", which looks like a bug
    // rather than the seeded account it is.
    localStorage.setItem('san-training:lastSaved', JSON.stringify(s.profile.updated_at));
  }, seed);

  const page = await context.newPage();
  for (const [hash, name] of PAGES) {
    await page.goto(`http://localhost:${PORT}${BASE}${hash}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    // Let charts finish their entry animation before the shutter.
    await page.waitForTimeout(500);

    if (full) {
      await page.addStyleTag({
        content: 'nav.fixed, .fixed.inset-x-0.bottom-0 { display: none !important; }',
      });
      await page.waitForTimeout(120);
    }

    const file = path.join(OUT, folder, `${name}.png`);
    await page.screenshot({ path: file, fullPage: Boolean(full) });
    written.push(path.relative(OUT, file));
  }
  await context.close();
}

const PHONE = VIEWPORTS[0];
const LAPTOP = VIEWPORTS[1];

await capture(PHONE, SEED, 'phone-full', { full: true });
await capture(PHONE, SEED, 'phone-screen', { full: false });
await capture(LAPTOP, SEED, 'laptop-full', { full: true });
await capture(LAPTOP, SEED, 'laptop-screen', { full: false });

// Dark is still available in Settings, so show the designer what it looks like.
const DARK = { ...SEED, profile: { ...PROFILE, theme: 'dark' } };
await capture(PHONE, DARK, 'phone-dark-full', { full: true });

await browser.close();
server.close();

console.log(`Wrote ${written.length} screenshots to ${OUT}`);
