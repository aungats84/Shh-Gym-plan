# Verification report — local-only version

Run on **24 August 2026**.

This version has no account, no database and no server. Everything is stored in
the browser on each device, and the Transfer page moves it between them.

---

## What passed

### Automated checks

| Check | Command | Result |
| --- | --- | --- |
| Formatting | `npm run format:check` | Pass |
| Linting | `npm run lint` | Pass, 0 problems |
| Type checking | `npm run typecheck` | Pass, 0 errors |
| Unit tests | `npm test` | **140 passed**, 0 failed |
| Production build | `npm run build` | Pass |

The 140 tests cover the calorie and macro maths and its safety floors, the
readiness logic, the under-fuelling monitor, the training programme and
progression rules, the meal plan (including that a full home-cooked day costs
≤ 100 THB and hits ≥ 78 g protein on all seven days), Bangkok time handling,
heat advice, and — new in this version — the transfer codes.

### Transfer: tested end to end in a real browser

`node scripts/transfer-check.mjs` opens **two separate browser profiles**, logs
different things on each, and moves data between them for real. **20 of 20
checks passed:**

| Check | Result |
| --- | --- |
| A transfer code is produced (946 characters for a small dataset) | Pass |
| A QR code is actually drawn — pixels verified, not just an element present | Pass |
| Merge keeps entries that exist only on the phone | Pass |
| Merge keeps entries that exist only on the laptop | Pass |
| When the same day exists on both, the newer entry wins | Pass |
| Nothing is lost in a merge | Pass |
| The result is reported ("1 new entry added, 0 updated") | Pass |
| Applying the same code twice changes nothing the second time | Pass |
| Nonsense text is refused and existing data survives | Pass |
| A refused code shows a readable message, not a stack trace | Pass |
| A **truncated** code is refused rather than half-applied | Pass |
| The backup file downloads and is tagged as belonging to this app | Pass |
| A fresh device restores fully from the backup file | Pass |
| The profile transfers along with the entries | Pass |
| An unrelated JSON file cannot wipe the device | Pass |
| **Data survives closing and reopening the page** | Pass |
| Too much data for a QR is explained plainly instead of producing a broken code | Pass |
| The transfer code still works at that size (5,645 characters) | Pass |

### Browser and layout checks

`node scripts/visual-check.mjs` walks **all 14 pages** at **390 × 844**
(iPhone), **1440 × 900** (laptop) and **844 × 390** (iPhone landscape).

Result: **no problems found**. Checked per page, per size: no horizontal page
scrolling, no element outside the viewport, no touch target under 36 px (bar
the two WCAG 2.5.8 exemptions — inline links in sentences, and controls whose
label is already large enough), no card nested inside a card, no corner radius
above 8 px, no console errors, and every page renders real content. Dark mode
was checked separately on the busiest pages.

### Build and deployment

| Check | Result |
| --- | --- |
| Assets use the `/san-training/` prefix from the repository name | Pass |
| PWA manifest `start_url` and `scope` match | Pass |
| Apple touch icon, theme colour, maskable icon present | Pass |
| `viewport-fit=cover` set, so iPhone safe areas work | Pass |
| Service worker generated | Pass |
| No secrets of any kind (there are none to leak) | Pass |

Routing uses hash addresses (`#/workouts`) because GitHub Pages cannot rewrite
unknown paths — this is what makes a page refresh work.

### Bundle size

| File | Size | Gzipped |
| --- | --- | --- |
| Main JavaScript | 446 KB | **136 KB** |
| Charts (loads only on Progress) | 390 KB | 111 KB |
| Transfer + QR (loads only on Transfer) | 35 KB | 13 KB |
| CSS | 23 KB | 5 KB |

Charts and the QR drawer are both loaded on demand, so opening the site
downloads 136 KB rather than 260 KB.

---

## Bugs found and fixed during verification

1. **Decoding a damaged transfer code left an unhandled promise rejection.**
   Both ends of the decompression stream fail, and only one failure was being
   caught. Found by the test runner flagging an unhandled error.
2. **Compression used `Blob.stream()`**, which does not exist everywhere. Now
   the bytes are fed through the compression stream directly, which is both
   more portable and testable.
3. **Sample data would have zeroed the day's calories** by writing a tag into a
   field that means "this is a custom meal". Caught before it shipped.
4. **Three React correctness violations** — refs written during render, state
   set synchronously inside effects. Fixed properly rather than silenced.
5. Carried over from the first build: the weight chart clipped its own axis
   labels (53.2 kg rendered as "3.2"), chart dates were too long for a phone,
   two links collapsed to a 19 px tap target, and the shopping list would have
   listed rice twice under two spellings. All fixed.

---

## What was NOT tested

- **Real devices.** Everything ran in headless Chromium. Safari on iOS behaves
  differently in places, particularly around Add to Home Screen and how long it
  keeps site data.
- **The GitHub Actions workflow has never run.** The YAML is valid and the steps
  are standard, but a workflow that has not run is a workflow that might fail.
- **Installing as a PWA on a real iPhone**, and whether the update prompt
  appears correctly there.
- **AirDrop, LINE and email as transfer routes.** The file downloads correctly
  and re-imports correctly; whether a particular messaging app mangles a long
  pasted code is untested. The code uses only `A–Z a–z 0–9 - _` precisely to
  survive that, and whitespace inserted by an app is stripped on the way in.
- **Scanning the QR code with a real phone camera.** The QR is drawn and its
  pixels verified, but nobody has pointed a camera at it.
- **Screen readers.** Semantic HTML, ARIA labels, a skip link, visible focus
  rings and radio-group semantics are in place. Nobody has listened to it.
- **Very large datasets.** Tested up to 400 entries. Browser storage limits are
  typically 5–10 MB, which is far more than this app will produce in a year,
  but the exact ceiling was not probed.

---

## The main risk with this version

**Your data exists in exactly one place per device, and browsers delete site
data.**

Clearing browsing history, "Clear History and Website Data" in Safari, or in
some cases removing the icon from the home screen, will erase everything. There
is no server copy, because there is no server.

The mitigation is entirely behavioural: **download a backup file regularly and
keep it somewhere that syncs** — iCloud Drive, Google Drive, or an email to
yourself. The Transfer page says this, the Settings page says this, and the
README says this, because it is the one way this version can lose someone's
work.

If that risk turns out to matter more than the simplicity, the accounts-and-sync
version of this project already exists and only needs a free Supabase project
to run.

---

## What to check first

1. Open the published site and complete the setup form.
2. Log some water, close the browser completely, reopen it — confirm it is
   still there.
3. Open **Transfer**, download a backup file, and confirm it lands somewhere
   you can find it.
4. On the second device, open the site, then load that backup with **Replace**.
5. Log something different on each device, then merge one into the other and
   confirm both survive.
6. Add to Home Screen from Safari and confirm it opens full screen.
