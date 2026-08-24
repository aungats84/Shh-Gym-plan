# San Training

A personal training, nutrition, recovery and progress website. It runs in a
normal web browser on a laptop and on an iPhone.

**No account. No database. No server.** Everything you enter is stored in the
browser on the device you entered it on. That makes setup very simple — you
only need GitHub — but it means moving data between your phone and your laptop
is something you do deliberately, from the **Transfer** page.

---

## Part 1 — Put it on GitHub (about 10 minutes)

### 1.1 Create the repository

1. Go to **https://github.com** and sign in, or create a free account.
2. Click the **+** in the top right, then **New repository**.
3. **Repository name**: `san-training`
   - If you pick a different name, use that name everywhere below instead.
4. Choose **Public**. (GitHub Pages needs a paid plan for private repositories.)
5. Do **not** tick "Add a README".
6. Click **Create repository**.

### 1.2 Upload the code

Without using the command line:

1. On your new empty repository page, click **uploading an existing file**.
2. Drag in **all** the files and folders from this project.
3. Wait for the upload to finish.
4. In the "Commit changes" box type `First upload`, then click **Commit changes**.

> **Important:** the hidden `.github` folder must upload too — it contains the
> instructions that publish the site. If your computer hides files that start
> with a dot, turn on hidden files first. On Windows: File Explorer → View →
> Show → **Hidden items**. On a Mac: press **Cmd + Shift + .** in Finder.

If you prefer the command line:

```bash
git init
git add .
git commit -m "First upload"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/san-training.git
git push -u origin main
```

### 1.3 Turn on GitHub Pages

1. In your repository, click **Settings** (the tab along the top).
2. Click **Pages** in the left sidebar.
3. Under **Source**, choose **GitHub Actions** from the dropdown.
4. That is all — this page has no Save button.

### 1.4 Publish

1. Click the **Actions** tab at the top of your repository.
2. A workflow should already be running (an orange dot). If nothing is there,
   click **Deploy to GitHub Pages** on the left, then **Run workflow**.
3. Wait two or three minutes for a green tick.
4. Your site is live at:
   **https://YOUR-USERNAME.github.io/san-training/**

There are no secrets to set up and nothing else to configure. That is the whole
setup.

---

## Part 2 — First use

1. Open your new web address.
2. Fill in the setup form. It already has sensible starting values — change
   anything that is not right.
3. **Before the first workout**, go to **https://eparmedx.com** and complete the
   free PAR-Q+ questionnaire, then tick the box in **Settings**. Workouts stay
   locked until then. This is the standard screening step, and this site cannot
   assess anyone itself.

### Add it to the iPhone home screen

1. Open the site in **Safari** — this does not work in Chrome on iOS.
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**.

It then opens full screen like an app and works with no signal.

---

## Part 3 — Moving data between phone and laptop

Because there is no server, the two devices do not know about each other. The
**Transfer** page gives you three ways to move data across. All three carry
exactly the same information.

### Option 1 — Backup file (works for any amount of data)

On the device that has the data:

1. Open **Transfer** → **Download backup file**.
2. On an iPhone this saves into **Files**. On a laptop it goes to Downloads.
3. Send it to your other device however suits you — AirDrop, LINE, email,
   Google Drive, iCloud Drive, or a USB stick.

On the other device:

4. Open **Transfer**, leave **Merge** selected, and click **Choose a backup
   file**.

This is the option to use for anything serious. It has no size limit.

### Option 2 — Transfer code (no file handling)

1. On the first device: **Transfer** → **Create transfer code** → **Copy**.
2. Paste it into a message to yourself — LINE, Notes, WhatsApp, email. Anything
   that syncs between your devices.
3. Open that message on the other device, copy the code.
4. On the other device: **Transfer** → paste it into the box → **Apply transfer
   code**.

The code is compressed, so it is much shorter than the raw data, but with
several months of logs it becomes a long block of text. Copy **all** of it.

### Option 3 — QR code (fastest, small data only)

1. On the laptop: **Transfer** → **Create transfer code**. A QR code appears.
2. Point your iPhone camera at it and open the result.
3. Paste it in on the phone.

A QR code can only physically hold about 1,800 characters, so this works while
your data is small — typically your profile and the first week or two. After
that the page tells you plainly that the data is too big and to use the backup
file instead. It will not silently produce a broken code.

### Merge or Replace?

- **Merge** (recommended) keeps everything from both devices. Where the same
  day exists on both, the newer entry wins. Nothing is lost, and running the
  same merge twice changes nothing the second time.
- **Replace** throws away what is on the receiving device. Only use it when
  restoring onto a fresh device or a cleared browser.

### A routine that works

Use whichever device is nearest during the day. Before switching, create a
transfer code and paste it into a message to yourself. Merge it on the other
side. Once a week, download a backup file and keep it somewhere safe.

---

## Important: your data can be lost

This is the trade-off for having no account.

Your information lives in the browser's storage on each device. It survives
closing the tab, restarting the browser, and restarting the device. It does
**not** survive:

- clearing your browsing data, cookies, or site data
- "Clear History and Website Data" in Safari settings
- deleting the app from your home screen on iOS, in some versions
- using a Private or Incognito window (nothing is saved at all — the site will
  warn you)
- a different browser on the same device (each browser has its own storage)

**So: download a backup file now and again and keep it somewhere safe.** It is
the only way back.

---

## Making changes later

1. Edit the file on GitHub (click the file, then the pencil icon), or upload a
   new version.
2. Click **Commit changes**.
3. The site rebuilds and republishes in a couple of minutes.

Updating the site does **not** affect saved data — that lives in the browser,
not in the code. When a new version is published, anyone with the site open
sees a small "A new version is ready" box with a Reload button.

---

## Running it on your own laptop (optional)

Only needed if you want to change the code and see the result immediately.

```bash
npm install       # once
npm run dev       # open the address it prints, usually localhost:5173
```

Other commands:

```bash
npm test          # run the tests
npm run verify    # formatting, linting, types, tests and a full build
npm run build     # build the production site into dist/
npm run preview   # look at the built site locally
```

---

## Troubleshooting

**The site loads as a blank white page.**
The base path does not match the repository name. The workflow sets this
automatically from the repository's own name, so this usually means the
repository was renamed after publishing. Push any change to rebuild it.

**"This browser will not save anything."**
You are in a Private/Incognito window, or site data is blocked for this site.
Open it in a normal window, or allow cookies and site data for it.

**My data disappeared.**
Almost always browsing data was cleared. If you have a backup file, open
**Transfer**, choose **Replace**, and load it. If not, it is gone — which is
why the backup matters.

**My phone and laptop show different things.**
That is expected. They are separate stores. Use the Transfer page.

**Refreshing the page gives a 404.**
This should not happen: the site uses hash addresses (`#/workouts`) precisely
because GitHub Pages cannot handle refreshes otherwise. If you see it, the link
probably lost its `#`.

**The workflow fails on "Check formatting" or "Check types".**
Something in the code was edited into an invalid state. Open the failed step in
the Actions tab — the message names the file and line.

---

## What is in this project

```
src/
  domain/        The calculations - calories, readiness, progression, heat,
                 under-fuelling. Kept separate from the screens so they can
                 be tested on their own.
  data/          The plan content - exercises, the 9-week programme, the
                 7-day meal plan, the evidence sources, and sample data.
  pages/         One file per section of the site.
  components/    Shared pieces - buttons, cards, the readiness check, charts.
  state/         The local store that saves everything to this device.
  lib/           Bangkok time handling, browser storage, transfer codes.
.github/
  workflows/     The instructions that build and publish the site.
```

---

## Honest limitations

- **This is not a medical device and does not diagnose anything.** Where
  something needs a professional, it says so and stops.
- **Nothing syncs automatically.** That is the cost of having no account.
- **Data lives only in the browser** and can be cleared. Keep backups.
- **Calorie and price figures are estimates** — good enough for trends, not
  precise. Bangkok food prices will drift from what is written.
- **Exercise videos are not pre-checked.** Rather than link a video nobody has
  watched, each exercise gives an exact YouTube search phrase.
- **There is no weather service.** Heat advice uses conditions you type in from
  your own phone.
- **There is no Apple Health connection.** Steps are entered by hand.
- **Anyone who can unlock the device can open the site.** There is no password,
  because there is no account. Use a screen lock.

---

## Where the advice comes from

Every source below was opened and checked on 24 August 2026. The full list,
with what each one is used for, is on the **Tutorials and sources** page inside
the site.

- ACSM Position Stand on Resistance Training (2026), *Medicine & Science in
  Sports & Exercise*
- PAR-Q+ and ePARmed-X+ — eparmedx.com
- IOC consensus statement on Relative Energy Deficiency in Sport (2023), *BJSM*
- Sleep and the athlete: 2021 expert consensus recommendations, *BJSM*
- CDC — Heat and Athletes
- Thailand food-based dietary guidelines (the Nutrition Flag), FAO
- ISSN Position Stand: protein and exercise (2017)
