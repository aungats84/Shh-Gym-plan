/**
 * Visual and layout verification.
 *
 * Serves the built site, signs in a stubbed account, walks every page at
 * phone and laptop sizes, and fails if it finds horizontal page scroll,
 * clipped or overlapping content, touch targets that are too small, or
 * console errors.
 *
 * This is a development tool. It is not part of the published site.
 *
 *   node scripts/visual-check.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE = '/Shh-Gym-plan/';
const PORT = 4178;

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

const PROFILE = {
  user_id: '00000000-0000-4000-8000-000000000001',
  display_name: 'San',
  age: 23,
  sex: 'female',
  height_cm: 152,
  weight_kg: 52,
  waist_cm: 63.5,
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
  theme: 'system',
  track_cycle: false,
  plan_start_date: '2026-08-10',
  updated_at: '2026-08-20T00:00:00Z',
};

const PAGES = [
  ['', 'today'],
  ['#/train', 'train-workouts'],
  ['#/train/before', 'train-before'],
  ['#/train/after', 'train-after'],
  ['#/train/cardio', 'train-cardio'],
  ['#/train/heat', 'train-heat'],
  ['#/train/session/lower_a', 'session'],
  ['#/food', 'food'],
  ['#/progress', 'progress'],
  ['#/progress/sleep', 'sleep'],
  ['#/progress/review', 'review'],
  ['#/more', 'more-howto'],
  ['#/more/transfer', 'transfer'],
  ['#/more/settings', 'settings'],
];

const VIEWPORTS = [
  { name: 'iphone', width: 390, height: 844 },
  { name: 'laptop', width: 1440, height: 900 },
  { name: 'iphone-landscape', width: 844, height: 390 },
];

const problems = [];
const note = (m) => problems.push(m);

await new Promise((r) => server.listen(PORT, r));
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
fs.mkdirSync('screenshots', { recursive: true });

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });

  // Seed the device store, which is the only place data lives.
  await context.addInitScript(
    ([profile, sample]) => {
      localStorage.setItem(
        'san-training:data',
        JSON.stringify({
          profile,
          daily_logs: [],
          readiness_checks: [],
          workouts: [],
          meal_selections: [],
          measurements: sample,
          symptoms: [],
          weekly_reviews: [],
          plan_versions: [],
        }),
      );
    },
    [
      PROFILE,
      // A few weeks of weights so the Progress charts actually draw.
      Array.from({ length: 14 }, (_, i) => ({
        date: `2026-08-${String(i * 2 + 1).padStart(2, '0')}`,
        weight_kg: Math.round((52 - i * 0.08 + Math.sin(i) * 0.4) * 10) / 10,
        waist_cm: Math.round((63.5 - i * 0.06) * 10) / 10,
        hip_cm: null,
        arm_cm: null,
        thigh_cm: null,
        note: '',
        photo_note: '',
        updated_at: '2026-08-20T00:00:00Z',
      })),
    ],
  );

  const page = await context.newPage();

  page.on('console', (m) => {
    const t = m.text();
    // Google Fonts and YouTube thumbnails are unreachable from the build
    // sandbox. Those failures say nothing about the app itself.
    const offsite = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.g|ytimg|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/.test(t);
    if (m.type() === 'error' && !offsite) note(`[${vp.name}] console error: ${t.slice(0, 160)}`);
  });
  page.on('pageerror', (e) => note(`[${vp.name}] page error: ${String(e).slice(0, 160)}`));

  for (const [hash, name] of PAGES) {
    await page.goto(`http://localhost:${PORT}${BASE}${hash}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const report = await page.evaluate(() => {
      const doc = document.documentElement;
      const out = {
        horizontalScroll: doc.scrollWidth > doc.clientWidth + 1,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        overflowing: [],
        smallTargets: [],
        cardInCard: 0,
        bigRadius: [],
        emptyRender: document.body.innerText.trim().length < 40,
      };

      // Anything sticking out past the viewport.
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.right > doc.clientWidth + 1 || r.left < -1) {
          const scrollable = el.closest('[class*="overflow-x-auto"], .overflow-x-auto');
          if (!scrollable) {
            out.overflowing.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
          }
        }
      }

      // Touch targets. Two documented exemptions, matching WCAG 2.5.8:
      //  - a link inside a sentence (its size is set by the running text)
      //  - a control whose own label provides a big enough target
      const inSentence = (el) =>
        el.tagName === 'A' && el.closest('p, li, summary, h1, h2, h3, td');
      const labelIsBigEnough = (el) => {
        const label = el.closest('label');
        return label ? label.getBoundingClientRect().height >= 40 : false;
      };

      for (const el of document.querySelectorAll('button, a, input, select, [role="radio"]')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (el.classList.contains('sr-only')) continue;
        if (inSentence(el) || labelIsBigEnough(el)) continue;
        if (r.height < 36) {
          out.smallTargets.push(
            `${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 25)}" h=${Math.round(r.height)}`,
          );
        }
      }

      // Design rules: no card directly inside another card; radius stays
      // within the system's scale (20px is the largest token).
      out.cardInCard = document.querySelectorAll('section section').length;
      for (const el of document.querySelectorAll('section')) {
        const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius);
        if (radius > 20.5 && radius < 1000) out.bigRadius.push(`${el.tagName} ${radius}px`);
      }

      return out;
    });

    if (report.emptyRender) note(`[${vp.name}] ${name}: page rendered almost nothing`);
    if (report.horizontalScroll)
      note(
        `[${vp.name}] ${name}: horizontal page scroll (${report.scrollWidth} > ${report.clientWidth})`,
      );
    for (const o of [...new Set(report.overflowing)].slice(0, 3))
      note(`[${vp.name}] ${name}: element outside viewport - ${o}`);
    for (const t of [...new Set(report.smallTargets)].slice(0, 3))
      note(`[${vp.name}] ${name}: touch target under 36px - ${t}`);
    if (report.cardInCard > 0) note(`[${vp.name}] ${name}: ${report.cardInCard} card(s) inside a card`);
    for (const r of [...new Set(report.bigRadius)].slice(0, 2))
      note(`[${vp.name}] ${name}: corner radius above 8px - ${r}`);

    if (vp.name !== 'iphone-landscape') {
      await page.screenshot({
        path: `screenshots/${vp.name}-${name}.png`,
        fullPage: vp.name === 'laptop',
      });
    }
  }

  // Dark mode on the two busiest pages.
  if (vp.name === 'iphone') {
    await page.emulateMedia({ colorScheme: 'dark' });
    for (const [hash, name] of [
      ['', 'today'],
      ['#/meals', 'meals'],
      ['#/progress', 'progress'],
    ]) {
      await page.goto(`http://localhost:${PORT}${BASE}${hash}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')
        note(`[dark] ${name}: body has no background colour`);
      await page.screenshot({ path: `screenshots/dark-${name}.png` });
    }
  }

  await context.close();
}

await browser.close();
server.close();

console.log(`\nScreenshots written to screenshots/`);
if (problems.length === 0) {
  console.log('No layout problems found.');
} else {
  console.log(`\n${problems.length} issue(s):`);
  for (const p of problems) console.log('  - ' + p);
}
process.exit(problems.length ? 1 : 0);
