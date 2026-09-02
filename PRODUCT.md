# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One primary user: a 23-year-old woman living in Rangsit, Bangkok, who trains at
home in the evenings. She has tried fitness before but has no confidence about
form, so every exercise needs a demonstration video. She trains four days a
week for about an hour with minimal equipment (two 2 kg dumbbells, a yoga mat, a
chair). She cooks at home on a 100 THB/day budget, eats two meals a day, tracks
by numbers, and reads English (with some Thai dish names). She uses the app on
both her phone and her laptop and wants them to look like the same app. The
product was commissioned on her behalf by a third party who relays her answers;
it is built for her alone, not for accounts or a wider audience.

## Product Purpose

A private, single-person fitness, nutrition, recovery and progress companion.
It turns her goals (lose fat, look more toned, priority areas arms and hips, two
month timeline) into a concrete daily plan: what to train today, how to do each
move, what to eat within budget, and how her sleep, stress, heat and readiness
should shape the session. Success is that she can open it any evening, know
exactly what to do, do it with correct form, log it in a few taps, and watch
real progress (weight, waist, arm/leg definition, how clothes fit) over eight
weeks.

## Positioning

Not a generic fitness app. Every calculation is derived from one real person's
Phase 1 interview, and every piece of guidance is grounded: 44 tutorial videos
were each verified against YouTube's oEmbed endpoint, and 7 evidence sources
were each opened and checked. It runs with no account, no server and no
database — everything lives in the browser and moves between devices by
exporting and importing a JSON file. It is honest about medical limits: it
gates workouts behind a self-screening step and never diagnoses or grants
medical clearance.

## Operating Context

- Used in the evening at home, on a phone most nights and a laptop sometimes.
- Deployed to GitHub Pages from the `aungats84/Shh-Gym-plan` repo via GitHub
  Actions on push to `main`. Live at https://aungats84.github.io/Shh-Gym-plan/
- Because Pages has no server rewrite, routing uses HashRouter (`/#/route`);
  BrowserRouter would 404 on refresh and must not be reintroduced.
- Five top sections, each with sub-tabs underneath, because on the phone only
  five of thirteen flat pages were reachable: Today (`/`), Train (`/train`:
  Workouts, Before, After, Cardio, Heat), Food (`/food`), Progress
  (`/progress`: Numbers, Sleep, Weekly), More (`/more`: How-to, Transfer,
  Settings). Do not flatten this back out.

## Capabilities and Constraints

- Screens (14): Today, Workouts, Workout Session, Pre-Workout, Recovery,
  Cardio, Heat Safety, Meals, Progress, Sleep/Stress, Weekly Review, Tutorials
  (How-to), Transfer (export/import), Settings, plus Onboarding.
- Static content: 4-day program with a 9-week progression, full exercise
  library (cues, mistakes, breathing, easier/harder variants), a 7-day meal
  rotation (2 meals x 3 options: home/quick/outside), 44 verified tutorials,
  7 sources.
- Pure, unit-tested domain logic: nutrition, progression, readiness, energy
  availability, heat, cardio, grocery. 140 tests across 7 files.
- All state is local (`localStorage`); export/import a JSON file moves data
  between devices. No accounts, no backend, no secrets in frontend code.
- Stack: React 19, Vite 8, TypeScript 6, Tailwind CSS v4 (`@theme`, no config
  file), React Router 7 (HashRouter), Recharts 3, Lucide React,
  vite-plugin-pwa, Vitest + Testing Library. `npm run verify` = format:check ->
  lint -> typecheck -> test -> build and must pass before any push.

## Brand Commitments

- **Name:** "San Training" (repo/site "Shh-Gym-plan").
- **Palette:** "Blush", supplied by the user and pinned. Warm neutral ramp (no
  cool greys), pink carries the brand, rose does the graphical work (bars,
  rings, focus), sage is the calm second voice for rest/recovery. Two accents
  by design: pink 700 `#b04459` for text/buttons (5.5:1), rose `#d9637f` for
  graphics only (fails text contrast). Amber is `#8a5a12` in light for the same
  reason. Flat fills, no pink gradients, one rose action per screen. Dark mode
  uses pink 400 for accents and pink 200 for text, never rose 600. Full token
  set already in `src/index.css`. The user asked the phone and laptop to look
  identical and to use the laptop's colour treatment everywhere.
- **Type:** Sora (display), Plus Jakarta Sans (body), both with Noto Sans Thai
  in the fallback stack.
- **Voice (in her words):** "too many words... make it simple and
  understandable", but "if i want to read the explain or something can do" —
  short by default, expandable on demand (the `Detail` disclosure). "make
  modern, premium, futuristic and better UI/UX".
- **Hard rules that must never be broken:** never invent a tutorial link,
  title, channel, qualification or citation; never fabricate a source; no
  diagnosis or medical clearance and the screening gate stays; do not reproduce
  official PAR-Q+ questions; no fake weather/heat integration; never ask for her
  home address; no secrets in frontend code.

## Evidence on Hand

- `HANDOFF.md`, `README.md`, `VERIFICATION.md` — full project state.
- `src/data/tutorials.ts` — 44 real, verified YouTube videos.
- `src/data/sources.ts` — 7 checked evidence sources.
- `gym prompt v2.txt` (in parent `shh/`, not committed) — original spec and the
  Phase 1 interview.
- `theme/Blush Palette.dc.html` (in parent `shh/`) — the palette source.
- No testimonials, customers, benchmarks or commercial claims exist and none
  may be fabricated.

## Product Principles

1. **One person, one plan.** Every number and recommendation is derived from
   her real interview; keep it specific to her, never generic.
2. **Short by default, deep on demand.** Lead with the single next action;
   tuck explanation behind a disclosure for when she wants it.
3. **Grounded or silent.** Never invent a video, source, or clearance. If
   something cannot be verified, say so and give an exact search phrase.
4. **Local and portable.** No account, no server; her data is hers and moves by
   file. Keep it that way.
5. **Same app everywhere.** Phone and laptop must feel identical in colour and
   behaviour.

## Accessibility & Inclusion

- Colour pairings are measured against WCAG (AA for text); the two-accent split
  exists specifically to keep text contrast passing.
- Tap targets at least 44 px; no horizontal page scroll at 390 / 768 / 1440 px.
- Respect `prefers-reduced-motion`. Fields use 16 px on iOS to stop zoom.
- English primary with Noto Sans Thai for dish names.
