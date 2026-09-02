# Design — Atelier Dossier

<!-- impeccable:design · seed 7e557cbc · mode operate · code-led -->

The app is styled as **her personal training dossier**: one finely bound book,
warm blush paper, ink-brown text, hairline ledger rules, a rose ribbon that
marks the open section. It deliberately refuses the generic fitness-dashboard of
metric rings and same-size cards. Every screen is a ruled leaf of the same book.

This world is carried almost entirely by the shared layer — `src/index.css`,
`src/components/ui.tsx`, `src/components/Layout.tsx` — so all fourteen pages
inherit it without page-by-page restyling.

## Palette — "Blush" (unchanged, pinned)

The full token set lives in `src/index.css` under `@theme` and `.dark` and was
not altered by the redesign. Warm neutral ramp (no cool greys), pink carries the
brand, rose (`--color-accent-strong`) does the graphical work (bars, rings,
ribbons, focus), sage (`--color-win`) is the calm rest/recovery voice. Text and
button fills use pink 700 (`--color-accent`, 5.5:1); rose is graphics-only
because white-on-rose fails text contrast. Dark mode uses pink 400 for accents
and pink 200 for text, never rose 600. One rose action per screen; flat fills,
no gradients.

New token: `--color-rule` (`#d8c7c8` light, `#4f3d42` dark) — a warm hairline a
touch deeper than the panel line, so a ruled edge reads as ink on paper rather
than as a UI divider.

## Type

- **Bodoni Moda** (`--font-serif`) — the couture display voice. Used only at
  large sizes: day-page mastheads (`PageTitle`, Today greeting, page `<h1>`s),
  the hero next-session name, headline numbers (`Ring`, `Stat`, empty-state
  titles). High-contrast, so it is never used below ~17px.
- **Plus Jakarta Sans** (`--font-sans`) — all body, controls, and running UI.
- **Sora** (`--font-display`) — compact UI headings (`Card` titles) and labels.
- Numbers are tabular everywhere (`font-variant-numeric: tabular-nums` on
  `.tabular-nums`, `th`, `td`) so they line up like a ledger.
- `.label-caps` — small-caps, 0.16em tracking: the ledger/eyebrow label voice.

Fonts load from Google Fonts in `index.html` (Bodoni Moda + Plus Jakarta Sans +
Sora), with Noto Sans Thai in the sans fallback stack for dish names.

## Materials & surfaces

- **Paper grain:** a fixed, faint SVG fractal-noise layer over the whole page
  (`body::before`), behind app content (`#root` gets `z-index: 1`). Screen-blend
  in dark mode. Reads as tooth, not texture.
- **Ruled leaves:** `Card` is a hairline-bordered leaf with a soft two-part
  shadow; when it has a header, the header sits above a hairline rule (ledger
  header). `PageTitle` and `SegTabs` sit on `--color-rule` underlines.
- **The ribbon:** the open section in the desktop rail carries a rose
  `.ribbon-mark` (a 3px bar) that drops in with `animate-ribbon`; the mobile tab
  bar and section tabs mark the active item with a rose top/underline bar.
- **Browser surfaces themed** (craft floor): scrollbar in the paper palette,
  `caret-color` accent, `::selection` rose, links with a 3px underline offset.

## Composition rules (the raises)

- **Wayfinding — one unmissable action.** The Today hero leads with the single
  next thing at monumental serif scale (the session name) and a full-width rose
  action, airport-band clear; the protein ledger is quieter, to the side.
- **State by weight, not hue alone.** Selection, done, and progress read through
  fill, rule, and weight as well as colour (helps the two-accent contrast plan).
- **Empty states are drawn deliberately.** `Empty` is a ruled leaf with a serif
  title, treated as carefully as a full one.

## Components (`src/components/ui.tsx`)

All prop APIs are unchanged from before the redesign, so pages did not need
editing. Restyled to the dossier language: `Card`, `PageTitle`, `SegTabs`
(ruled index tabs with a rose underline), `Ring`/`Stat` (serif tabular
numbers), `Field` (small-caps labels), `Button`, `Empty`, `Meter`, `Stepper`,
`Scale`, inputs.

## Layout (`src/components/Layout.tsx`)

- Desktop: a 252px "dossier index" rail — serif wordmark, "Bangkok · her book"
  label, section list with the rose ribbon on the open section and ruled
  sub-pages.
- Mobile: a serif page-header (date/section) and a bottom tab bar with a rose
  ribbon over the active tab. `safe-x` keeps a 1rem gutter and grows it for a
  device notch.

## Constraints honored

HashRouter (GitHub Pages); local-only, no backend; the five-section nav; the
WCAG-measured two-accent split; `prefers-reduced-motion`; 44px tap targets; no
fabricated tutorials/sources; the screening gate. `npm run verify`
(format/lint/typecheck/140 tests/build) passes.
