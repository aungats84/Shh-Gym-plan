/**
 * End-to-end check of moving data between two devices.
 *
 * Opens two separate browser profiles ("phone" and "laptop"), logs
 * different things on each, moves data across with a transfer code, and
 * confirms nothing was lost. Then repeats with the backup file.
 *
 * Development tool. Not part of the published site.
 *
 *   node scripts/transfer-check.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const DIST = path.resolve('dist');
const BASE = '/san-training/';
const PORT = 4180;
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u.startsWith(BASE)) u = u.slice(BASE.length - 1);
  let f = path.join(DIST, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

const PROFILE = {
  user_id: 'local',
  display_name: 'San',
  age: 23,
  sex: 'female',
  height_cm: 152,
  weight_kg: 52,
  waist_cm: 63.5,
  units: 'metric',
  area: 'Rangsit',
  goals: ['fat_loss'],
  priority_muscles: ['arms', 'glutes'],
  timeline_weeks: 9,
  experience: 'returning',
  intensity: 'moderate',
  training_days_per_week: 4,
  session_minutes: 60,
  preferred_time: 'evening',
  flexible_schedule: true,
  equipment: ['dumbbells'],
  dumbbell_kg: 2,
  can_buy_equipment: false,
  baseline_steps: 3000,
  enjoys: ['running'],
  dislikes: [],
  budget_thb_per_day: 100,
  meals_per_day: 2,
  allows_snacks: false,
  cooking_skill: 'confident',
  kitchen: ['stove'],
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
  theme: 'system',
  track_cycle: false,
  plan_start_date: '2026-08-10',
  updated_at: '2026-08-20T00:00:00Z',
};

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' - ' + detail : ''}`);
};

function seed(logs) {
  return {
    profile: PROFILE,
    daily_logs: logs,
    readiness_checks: [],
    workouts: [],
    meal_selections: [],
    measurements: [],
    symptoms: [],
    weekly_reviews: [],
    plan_versions: [],
  };
}

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

/**
 * `data` is written once, not on every navigation, so that reloading
 * genuinely tests whether the site kept it rather than the test
 * re-seeding it behind the scenes.
 */
async function device(name, data) {
  const context = await browser.newContext({
    viewport: { width: 420, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => check(`${name}: no page errors`, false, String(e).slice(0, 120)));
  await page.goto(`http://localhost:${PORT}${BASE}#/transfer`, { waitUntil: 'domcontentloaded' });
  if (data) {
    await page.evaluate((d) => {
      localStorage.setItem('san-training:data', JSON.stringify(d));
      localStorage.setItem('san-training:lastSaved', JSON.stringify(new Date().toISOString()));
    }, data);
    // A full reload, so the site starts from what is on the device.
    await page.reload({ waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(600);
  return { context, page };
}

const readStore = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('san-training:data') ?? '{}'));

/* ---------------- 1. transfer code, phone -> laptop ---------------- */

const phoneLogs = [
  { date: '2026-08-20', water_l: 2, steps: 5000, notes: 'from phone', updated_at: '2026-08-20T10:00:00Z' },
  { date: '2026-08-21', water_l: 1.5, steps: 4000, notes: 'from phone', updated_at: '2026-08-21T10:00:00Z' },
];
const laptopLogs = [
  // Same day as the phone but edited later, so this one should win.
  { date: '2026-08-21', water_l: 2.5, steps: 9999, notes: 'from laptop', updated_at: '2026-08-21T20:00:00Z' },
  { date: '2026-08-22', water_l: 1.8, steps: 6000, notes: 'from laptop', updated_at: '2026-08-22T10:00:00Z' },
];

const phone = await device('phone', seed(phoneLogs));
await phone.page.getByRole('button', { name: 'Create transfer code' }).click();
await phone.page.waitForTimeout(800);

const code = await phone.page.locator('textarea[aria-label="Transfer code"]').inputValue();
check('a transfer code is produced', code.startsWith('SANTRAIN1:'), `${code.length} chars`);

const qrDrawn = await phone.page.evaluate(() => {
  const c = document.querySelector('canvas');
  if (!c) return false;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let dark = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] < 128) dark += 1;
  return dark > 500;
});
check('a QR code is actually drawn for small data', qrDrawn);

const laptop = await device('laptop', seed(laptopLogs));
await laptop.page.locator('textarea[placeholder="SANTRAIN1:..."]').fill(code);
await laptop.page.getByRole('button', { name: 'Apply transfer code' }).click();
await laptop.page.waitForTimeout(600);

const merged = await readStore(laptop.page);
const byDate = Object.fromEntries((merged.daily_logs ?? []).map((l) => [l.date, l]));

check('merge keeps entries unique to the phone', byDate['2026-08-20']?.notes === 'from phone');
check('merge keeps entries unique to the laptop', byDate['2026-08-22']?.notes === 'from laptop');
check(
  'on a clash the newer entry wins',
  byDate['2026-08-21']?.notes === 'from laptop' && byDate['2026-08-21']?.steps === 9999,
);
check('nothing was lost', Object.keys(byDate).length === 3, `${Object.keys(byDate).length} days`);

const banner = await laptop.page.locator('text=/Merged the transfer code/').first().textContent();
check('the result is reported to the user', Boolean(banner), banner?.trim().slice(0, 60));

/* ---------------- 2. running the same merge twice is harmless ------ */
await laptop.page.locator('textarea[placeholder="SANTRAIN1:..."]').fill(code);
await laptop.page.getByRole('button', { name: 'Apply transfer code' }).click();
await laptop.page.waitForTimeout(500);
const twice = await readStore(laptop.page);
check(
  'applying the same code twice changes nothing',
  (twice.daily_logs ?? []).length === 3,
  `${(twice.daily_logs ?? []).length} days`,
);

/* ---------------- 3. a bad code is refused safely ------------------ */
await laptop.page.locator('textarea[placeholder="SANTRAIN1:..."]').fill('this is not a code');
await laptop.page.getByRole('button', { name: 'Apply transfer code' }).click();
await laptop.page.waitForTimeout(400);
const afterBad = await readStore(laptop.page);
check('a bad code does not destroy existing data', (afterBad.daily_logs ?? []).length === 3);
check(
  'a bad code shows a readable message',
  await laptop.page.locator('text=/does not look like a San Training transfer code/').isVisible(),
);

/* ---------------- 4. a truncated code is refused ------------------- */
await laptop.page.locator('textarea[placeholder="SANTRAIN1:..."]').fill(code.slice(0, code.length - 50));
await laptop.page.getByRole('button', { name: 'Apply transfer code' }).click();
await laptop.page.waitForTimeout(600);
check(
  'a truncated code is refused rather than half-applied',
  (await readStore(laptop.page)).daily_logs.length === 3,
);

/* ---------------- 5. backup file round trip ------------------------ */
const [download] = await Promise.all([
  laptop.page.waitForEvent('download'),
  laptop.page.getByRole('button', { name: 'Download backup file' }).click(),
]);
const file = path.join(os.tmpdir(), 'san-backup.json');
await download.saveAs(file);
const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
check('the backup file downloads', fs.existsSync(file));
check('the backup names the app so it can be recognised', parsed.app === 'san-training');
check('the backup contains the merged data', parsed.daily_logs.length === 3);

// A device that has been set up but has no entries yet.
const fresh = await device('fresh', seed([]));
await fresh.page.locator('input[type="radio"]').nth(1).check(); // Replace
await fresh.page.locator('input[type="file"]').setInputFiles(file);
await fresh.page.waitForTimeout(600);
const restored = await readStore(fresh.page);
check('a fresh device restores from the backup file', (restored.daily_logs ?? []).length === 3);
check('the profile comes across too', restored.profile?.display_name === 'San');

/* ---------------- 6. a wrong file is refused ----------------------- */
const junk = path.join(os.tmpdir(), 'junk.json');
fs.writeFileSync(junk, JSON.stringify({ hello: 'world' }));
await fresh.page.locator('input[type="file"]').setInputFiles(junk);
await fresh.page.waitForTimeout(500);
check(
  'an unrelated JSON file cannot wipe the device',
  (await readStore(fresh.page)).daily_logs.length === 3,
);

/* ---------------- 7. data really persists across a reload ---------- */
await fresh.page.goto(`http://localhost:${PORT}${BASE}`, { waitUntil: 'networkidle' });
await fresh.page.waitForTimeout(500);
check(
  'data survives closing and reopening the page',
  (await readStore(fresh.page)).daily_logs.length === 3,
);

/* ---------------- 8. QR refuses politely when data is too big ------ */
const bigLogs = Array.from({ length: 400 }, (_, i) => ({
  date: `2026-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}-${i}`,
  water_l: 2,
  steps: 5000 + i,
  notes: 'padding to make this exceed what a QR code can hold',
  updated_at: '2026-08-01T00:00:00Z',
}));
const bulky = await device('bulky', seed(bigLogs));
await bulky.page.getByRole('button', { name: 'Create transfer code' }).click();
await bulky.page.waitForTimeout(1200);
check(
  'too much data for a QR is explained, not silently broken',
  await bulky.page.locator('text=/Too much data for a QR code/').isVisible(),
);
const bigCode = await bulky.page.locator('textarea[aria-label="Transfer code"]').inputValue();
check('the transfer code still works at that size', bigCode.startsWith('SANTRAIN1:'), `${bigCode.length} chars`);

await browser.close();
server.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
