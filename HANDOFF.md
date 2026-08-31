# San Training — session handoff

Everything a fresh session needs to pick this up. Written 26 August 2026.

---

## 1. What this is

A local-only fitness, nutrition, recovery and progress web app, built for one
person: a 23-year-old woman living in Rangsit, Bangkok, training at home.
Vivian commissioned it and relays her answers; the app is not for Vivian.

**No accounts, no server, no database.** Everything lives in the browser's
`localStorage`. Data moves between phone and laptop by exporting a JSON file
and importing it on the other device. This was a deliberate choice by the user
("for now please do local only and only github").

- **Live site:** https://aungats84.github.io/Shh-Gym-plan/
- **Repo:** https://github.com/aungats84/Shh-Gym-plan (owner `aungats84`, branch `main`)
- **Deploys:** GitHub Actions → GitHub Pages, on every push to `main`

---

## 2. Getting the code back

The cloud container from the last session is gone. The repo is the only copy.

```bash
git clone https://github.com/aungats84/Shh-Gym-plan.git
cd Shh-Gym-plan
npm install
npm run dev          # http://localhost:5173/Shh-Gym-plan/
```

74 files. Everything that matters is committed — local and remote were verified
byte-for-byte identical (git blob hashes) at the end of the last session.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run verify` | **format:check → lint → typecheck → test → build.** Must pass before any push; CI runs the same steps and fails the deploy otherwise. |
| `npm test` | 140 tests, 7 files |
| `node scripts/visual-check.mjs` | Playwright layout audit at 390 / 1440 / 844 px — catches horizontal scroll, clipped content, tap targets under 44 px, console errors |
| `node scripts/design-shots.mjs` | Regenerates the design handoff screenshots into `design-screenshots/` |
| `node scripts/transfer-check.mjs` | Round-trips the export/import file format |

---

## 3. Stack

React 19 · Vite 8 · TypeScript 6 · Tailwind CSS v4 (`@theme` / `@custom-variant` /
`@utility`, no config file) · React Router 7 · Recharts 3 · Lucide React ·
vite-plugin-pwa · Vitest + Testing Library · ESLint 10 · Prettier

**HashRouter, not BrowserRouter.** GitHub Pages has no server-side rewrite, so
`/progress` would 404 on refresh. URLs look like `/#/progress`. Do not "fix"
this to BrowserRouter.

---

## 4. Layout of the code

```
src/
  data/         Static content — no logic
    program.ts      4 workout days, 9-week progression, warm-ups, cooldowns
    exercises.ts    Every exercise: cues, mistakes, breathing, easier/harder
    meals.ts        7-day rotation × 2 meals × 3 options (home/quick/outside)
    tutorials.ts    44 verified YouTube videos (30 exercise, 14 cooking)
    sources.ts      7 evidence sources
    sampleData.ts   Demo data generator
  domain/       Pure functions, all unit-tested
    nutrition, progression, readiness, energyAvailability,
    heat, cardio, grocery
  state/
    DataContext.tsx   The whole local store: upsert, remove, export, import, merge
    usePlan.ts        Derives targets and the current week from the profile
  components/
    ui.tsx        Design system — Card, Detail, Button, Meter, Ring, Stat,
                  Pill, Stepper, SegTabs, Notice, Field, …
    Layout.tsx    Desktop rail + phone header + bottom tab bar
    nav.ts        The five sections and their sub-pages
    chartTheme.ts Recharts colours, light and dark
    VideoLink.tsx YouTube card with search fallback
  pages/        14 screens
  lib/          types, time (Bangkok), storage, transfer
```

### Navigation — five sections, tabs underneath

This structure exists because the user reported that on her phone **only five
of thirteen pages were reachable**. Do not flatten it back out.

| Section | Route | Tabs |
|---|---|---|
| Today | `/` | — |
| Train | `/train` | Workouts · Before · After · Cardio · Heat |
| Food | `/food` | — |
| Progress | `/progress` | Numbers · Sleep · Weekly |
| More | `/more` | How to · Transfer · Settings |

---

## 5. The person the app is for

From the Phase 1 interview. These values drive every calculation.

- Woman, 23, 152 cm, 52 kg, waist 25 in (~63.5 cm), Rangsit (Bangkok), English
- **Goals:** lose fat, look more toned. Priority areas: arms, hips. Timeline 2 months
- Wants to see it in: how clothes fit, the scale, waist measurement, arm/leg
  definition, photos
- **Experience:** tried before, no idea about form → every exercise needs a video
- **Trains at home.** Equipment: 2 × 2 kg dumbbells, yoga mat, chair/sofa/table.
  Not buying more
- **4 days a week, 1 hour, evenings.** Schedule is flexible
- Enjoys running. Baseline ~3,000 steps/day. Hybrid office job
- Barriers: weather, boredom
- **Food:** 2 meals a day, no snacks, cooks at home, confident cook, doesn't
  batch cook. Budget **100 THB/day**. Fridge, stove, rice cooker. Tracks by
  numbers. Some caffeine and alcohol. No allergies or dietary restrictions
- **Sleep:** 03:00 → 12:00. Rates it good. Moderate stress
- **Health screening completed and passed.** One item was raised, seen by a
  doctor, and resolved before the plan started. The screening gate in the app
  must stay: workouts stay locked until it is completed, and the app must
  never diagnose or grant medical clearance

---

## 6. Colour system — "Blush"

From a palette the user supplied (`shh/theme/Blush Palette.dc.html`, made by
Claude Design). Defined in `src/index.css` as Tailwind v4 `@theme` tokens.

| Role | Light | Dark |
|---|---|---|
| Background | `#fbf0ef` | `#1b1214` |
| Background deep | `#f0e8e7` | `#140d0f` |
| Card | `#ffffff` | `#2a1c1f` |
| Card raised | `#fff4f7` | `#35252a` |
| Line | `#ded1d2` | `#48383d` |
| Text | `#2a1c1f` | `#fbf7f6` |
| Muted | `#665358` | `#c3b2b4` |
| Faint | `#847074` | `#a49093` |
| **accent** — text, links, button fills | `#b04459` | `#fbaac0` |
| **accent-strong** — bars, rings, focus | `#d9637f` | `#ffc9d8` |
| Good / on target | `#56633f` | `#aebf92` |
| Caution | `#8a5a12` | `#e0a13a` |
| Alert | `#9c2b2b` | `#f0a0a0` |

**Why there are two accents.** The palette's rose `#d9637f` gives only 3.5:1
with white text — it fails WCAG AA for anything readable. So rose was kept for
the graphical work it does pass 3:1 on (progress bars, rings, focus outlines)
and `#b04459` (pink 700, 5.5:1) carries all text and button fills. Keep that
split. Same reason amber is `#8a5a12` in light mode rather than the palette's
`#e0a13a`, which fails 3:1 on white.

Palette rules from the source, still in force: warm neutral ramp, **no cool
greys**; flat fills, **no pink gradients**; one rose action per screen; in dark
mode use pink 400 for accents and pink 200 for text, **never rose 600**.

Type: Sora (display) · Plus Jakarta Sans (body), both with Noto Sans Thai in
the fallback stack.

**Charts** (`chartTheme.ts`) use a separately validated pair, because the brand
hues are too close for colour-blind separation:
light `#d9637f` + `#4f7a31`, dark `#db6c88` + `#79994a`. Only the weight chart
plots two series at once, so only that pair needed validating.

### Theme is light everywhere — deliberately

The app used to follow each device's own light/dark setting, which made the
phone and the laptop look like different apps. The user asked for them to
match. Now:

- Settings offers **Light** and **Dark** only. "Match my device" is gone
- `useTheme()` in `App.tsx` reads `profile.theme === 'dark'` and nothing else
- `withMatchingTheme()` in `DataContext.tsx` migrates any stored `'system'`
  to `'light'` on load, import and merge

Do not reintroduce `prefers-color-scheme` without asking her first.

---

## 7. Rules that must not be broken

From the original spec (`shh/gym prompt v2.txt`) and the work since:

1. **Never invent a tutorial link, title, channel, qualification or citation.**
   All 44 videos were verified against YouTube's oEmbed endpoint
   (`https://www.youtube.com/oembed?url=…&format=json`) on 25 Aug 2026 —
   that is where every title and channel name in `tutorials.ts` came from.
   If a video can't be verified, say so and give an exact search phrase instead.
   `VideoLink` falls back to a YouTube search when a video is missing.
2. **Never fabricate citations.** The 7 sources in `sources.ts` were each
   opened and checked. (The spec's own FAO Thailand URL was wrong — the real
   path includes `/countries/`.)
3. **No diagnosis, no medical clearance.** The screening gate stays.
4. **Do not reproduce the official PAR-Q+ questions** in the app without
   permission from its owner.
5. **No fake weather or heat integration.** The heat page is guidance only.
6. **Never ask for her exact home address.**
7. No secrets in frontend code. There is no backend and no key to leak; keep it
   that way.

---

## 8. Deploying — read this before you push

The repo has no local git remote set up from the last session; work was pushed
through **GitHub's web uploader**, which has two traps:

1. **Drag-and-drop silently drops folders** in a multi-file selection. Files
   just never arrive, with no error. Upload one directory at a time by going
   straight to `https://github.com/aungats84/Shh-Gym-plan/upload/main/<path>`.
2. **CI fails on `format:check`.** After any `prettier --write`, re-upload every
   file it rewrote or the build breaks.

If you can use `git push` instead, do — it avoids both.

After a deploy, GitHub Pages will keep serving the old bundle from the service
worker cache. To actually see the new version:

```js
(await navigator.serviceWorker.getRegistrations()).forEach(r => r.unregister());
(await caches.keys()).forEach(k => caches.delete(k));
```

then reload with a cache-busting query string.

CI status: run #35, success. `.github/workflows/deploy.yml` runs checkout →
node 22 → `npm ci` → format:check → lint → typecheck → test → build (with
`VITE_BASE_PATH: ${{ github.event.repository.name }}`) → deploy to Pages.

---

## 9. Bugs already found and fixed — don't reintroduce them

- **Shopping list counted rice twice** — one meal said "Jasmine rice, dry",
  others "Rice, dry". Ingredient names must match exactly to aggregate.
- **Weight chart showed "3.2" instead of "53.2"** — a narrow `YAxis width`
  plus negative left margin clipped the labels. Only visible in a screenshot,
  not in any test.
- **Stale colour tokens** — after the redesign renamed tokens, ten pages still
  used `border-border`, `bg-accent-soft`, `bg-good`. Tailwind silently emits
  nothing for an undefined token, so borders and backgrounds just vanished.
  **If you rename a token, grep every `(bg|text|border|stroke|fill)-<name>`
  class against the `--color-*` definitions in `index.css`.**
- **`SegTabs` caused 16 px of horizontal page scroll** from a `-mx-4 … px-4`
  bleed. Now `w-full overflow-x-auto` with `flex w-full min-w-max`.
- **`VideoLink` hid working videos** — a failed thumbnail triggered the whole
  search fallback. A broken image now only loses the picture.
- **Sample data zeroed the day's calories** — the generator wrote a tag into
  `custom_name`, which the app reads as "this is a custom meal".
- Three React correctness issues (refs written during render, `setState`
  synchronously in effects) — fixed properly, not silenced.

---

## 10. What she has asked for, in her words

Useful for judging any redesign:

- "too many words and make it feel boring make it simple and understandable"
- "if i want to read the explain or something can do" → hence the `Detail`
  disclosure component: short by default, expandable
- "make modern, premium, futuristic and better UI/UX"
- "make it the tutorial with the video or youtube so i can easily see how to do it"
- "dont seperate the tab move it below the workout, meal so i can easily access"
- "in food if i select one there is no deselect button what if i accidentally
  touch one and it record" → every meal option has Remove, and each logged
  meal has an × in the totals card
- "i dont like the color way use in the phone web but I like the one that use
  in laptop web" → the light-everywhere change in §6

---

## 11. Open items

Nothing is half-finished. Possible next steps, none started:

- Claude Design was going to look at the screenshots and propose a redesign.
  The screenshots are in `design-screenshots/` — regenerate with
  `node scripts/design-shots.mjs`. That folder is gitignored, so it is not in
  the repo; the zip was delivered to Vivian in the chat.
- The app has never been used for a real week. Nothing has been validated
  against how it actually feels day to day.

---

## 12. Source material

Both were uploaded by Vivian and are **not in the repo**. Ask her to re-attach
if needed:

- `shh/gym prompt v2.txt` — the original spec, including the Phase 1 interview
  script and the hard rules in §7
- `shh/theme/Blush Palette.dc.html` — the palette in §6
