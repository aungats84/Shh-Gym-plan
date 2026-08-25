import { useRef, useState } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import {
  Button,
  Card,
  Field,
  Notice,
  SectionHeading,
  Select,
  TextArea,
  TextInput,
} from '@/components/ui';
import { computeTargets } from '@/domain/nutrition';
import { buildSampleData, sampleKeys, type SampleKey } from '@/data/sampleData';
import { readCache, removeCache, writeCache } from '@/lib/storage';
import { Link } from 'react-router-dom';
import { prettyDate, timeAgo, todayISO } from '@/lib/time';
import type { Profile, ThemeChoice } from '@/lib/types';

type Collection =
  'daily_logs' | 'readiness_checks' | 'workouts' | 'meal_selections' | 'measurements';

export default function Settings() {
  const data = useData();
  const plan = usePlan();
  const profile = data.profile!;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [sampleKeysLoaded, setSampleKeysLoaded] = useState<SampleKey[]>(() =>
    readCache<SampleKey[]>('sampleKeys', []),
  );
  const [sampleMsg, setSampleMsg] = useState<string | null>(null);

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function save() {
    data.saveProfile(form);
    setSaved(true);
  }

  const preview = computeTargets(form);

  /* ------------------------------ export ------------------------------ */
  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    download(
      `san-training-${todayISO()}.json`,
      JSON.stringify({ exported_at: new Date().toISOString(), ...data.exportAll() }, null, 2),
      'application/json',
    );
  }

  function exportCsv() {
    const rows: string[] = ['type,date,field,value'];
    const push = (type: string, date: string, field: string, value: unknown) => {
      if (value === null || value === undefined || value === '') return;
      rows.push(`${type},${date},${field},"${String(value).replace(/"/g, '""')}"`);
    };
    data.daily_logs.forEach((l) => {
      push('daily', l.date, 'water_l', l.water_l);
      push('daily', l.date, 'steps', l.steps);
      push('daily', l.date, 'sleep_hours', l.sleep_hours);
      push('daily', l.date, 'sleep_quality', l.sleep_quality);
      push('daily', l.date, 'stress', l.stress);
      push('daily', l.date, 'mood', l.mood);
    });
    data.measurements.forEach((m) => {
      push('measurement', m.date, 'weight_kg', m.weight_kg);
      push('measurement', m.date, 'waist_cm', m.waist_cm);
    });
    data.workouts.forEach((w) => {
      push('workout', w.date, 'day', w.day_key);
      push('workout', w.date, 'status', w.status);
      push('workout', w.date, 'sets_completed', w.sets.filter((s) => s.done).length);
      push('workout', w.date, 'difficulty', w.difficulty);
    });
    data.readiness_checks.forEach((r) => {
      push('readiness', r.date, 'recommended', r.recommended);
      push('readiness', r.date, 'accepted', r.accepted);
    });
    download(`san-training-${todayISO()}.csv`, rows.join('\n'), 'text/csv');
  }

  /** A plain-language page a trainer, dietitian or doctor can actually read. */
  function exportSummary() {
    const t = plan.targets;
    const recentWeights = data.measurements
      .filter((m) => m.weight_kg != null)
      .slice(-5)
      .map((m) => `${m.date}: ${m.weight_kg} kg`)
      .join('\n  ');
    const symptoms = data.symptoms
      .slice(-10)
      .map(
        (s) => `${s.date}: ${s.kind}${s.during_exercise ? ' (during exercise)' : ''} - ${s.note}`,
      )
      .join('\n  ');

    const text = `SAN TRAINING - SUMMARY FOR A HEALTH PROFESSIONAL
Generated ${prettyDate(todayISO())}

This is a self-managed training and nutrition plan produced by a
website. It is not a medical assessment and contains no diagnosis.

PERSON
  Age: ${form.age}
  Height: ${form.height_cm} cm
  Starting weight: ${form.weight_kg} kg
  Goal: ${form.goals.join(', ')}
  Training: ${form.training_days_per_week} home sessions per week, ${form.session_minutes} minutes, evenings
  Equipment: ${form.equipment.join(', ')}${form.dumbbell_kg ? ` (${form.dumbbell_kg} kg dumbbells)` : ''}

READINESS SCREENING
  PAR-Q+ confirmed: ${form.parq_confirmed_at ? prettyDate(form.parq_confirmed_at.slice(0, 10)) : 'NOT COMPLETED'}
  Answered yes to any PAR-Q+ item: ${form.parq_flagged_yes ? 'YES' : 'no'}
  Restrictions given by a clinician: ${form.doctor_restrictions || 'none recorded'}

CURRENT TARGETS
  Estimated maintenance: ${t?.maintenance ?? '-'} kcal/day
  Daily target: ${plan.effectiveKcal} kcal/day${plan.energy.should_pause_deficit ? ' (deficit currently paused by the site)' : ''}
  Protein: ${t?.protein_g ?? '-'} g   Carbs: ${t?.carbs_g ?? '-'} g   Fat: ${t?.fat_g ?? '-'} g   Fibre: ${t?.fiber_g ?? '-'} g
  Planned rate of change: ${t?.expected_weekly_change_kg.toFixed(2) ?? '-'} kg/week

ADHERENCE
  Workouts recorded: ${data.workouts.filter((w) => w.status === 'completed').length}
  Days with food logged: ${new Set(data.meal_selections.map((m) => m.date)).size}
  Readiness check-ins: ${data.readiness_checks.length}

RECENT WEIGHTS
  ${recentWeights || 'none recorded'}

SYMPTOMS LOGGED
  ${symptoms || 'none recorded'}

UNDER-FUELLING MONITOR
  Status: ${plan.energy.flags.length === 0 ? 'nothing flagged' : plan.energy.flags.map((f) => f.label).join('; ')}
  ${plan.energy.message}

EVIDENCE BASE
  ACSM Position Stand on Resistance Training (2026)
  PAR-Q+ / ePARmed-X+ (eparmedx.com)
  IOC consensus statement on REDs (2023)
  Sleep and the athlete, BJSM expert consensus (2021)
  CDC Heat and Athletes guidance
  Thailand food-based dietary guidelines (FAO)
  ISSN position stand on protein and exercise (2017)
`;
    download(`san-training-summary-${todayISO()}.txt`, text, 'text/plain');
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        data.importAll(parsed);
        setImportMsg('Imported. Your data will sync on the next connection.');
      } catch {
        setImportMsg(
          'That file could not be read. It needs to be a JSON file exported from this site.',
        );
      }
    };
    reader.readAsText(file);
  }

  /* --------------------------- sample data --------------------------- */
  function loadSample() {
    const sample = buildSampleData(form.weight_kg || 52);
    sample.daily_logs.forEach((r) => data.upsert('daily_logs', r));
    sample.readiness_checks.forEach((r) => data.upsert('readiness_checks', r));
    sample.workouts.forEach((r) => data.upsert('workouts', r));
    sample.meal_selections.forEach((r) => data.upsert('meal_selections', r));
    sample.measurements.forEach((r) => data.upsert('measurements', r));

    const keys = sampleKeys(sample);
    writeCache('sampleKeys', keys);
    setSampleKeysLoaded(keys);
    setSampleMsg(`Added ${keys.length} example entries covering the last four weeks.`);
  }

  function removeSample() {
    // Deletes exactly the rows the sample created, by key. Anything you
    // logged yourself on the same day is left alone.
    for (const [collection, key] of sampleKeysLoaded) {
      data.remove(collection as Collection, key);
    }
    removeCache('sampleKeys');
    setSampleKeysLoaded([]);
    setSampleMsg('Example entries removed. Anything you logged yourself is untouched.');
  }

  function handleDelete() {
    if (deleteConfirm !== 'DELETE') {
      setDeleteMsg('Type DELETE in the box to confirm.');
      return;
    }
    data.deleteEverything();
    setDeleteMsg('Everything has been deleted from this device.');
  }

  return (
    <div className="space-y-4">
      <SectionHeading sub="Everything here is stored on this device only.">Settings</SectionHeading>

      {/* -------------------- safety gate -------------------- */}
      <Card
        title="Exercise readiness"
        tone={form.parq_confirmed_at ? 'good' : 'warn'}
        subtitle="Workouts stay locked until this is confirmed."
      >
        <p className="text-sm">
          The PAR-Q+ is the standard pre-exercise screening questionnaire. It is free, takes about
          two minutes, and lives at{' '}
          <a className="underline" href="https://eparmedx.com/" target="_blank" rel="noreferrer">
            eparmedx.com
          </a>
          .
        </p>
        <p className="mt-2 text-sm">
          This site deliberately does not reproduce the PAR-Q+ questions - they are the property of
          the PAR-Q+ Collaboration, and a half-copied version of a screening tool is worse than no
          version at all.
        </p>
        <div className="mt-3 space-y-2">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={Boolean(form.parq_confirmed_at)}
              onChange={(e) =>
                set('parq_confirmed_at', e.target.checked ? new Date().toISOString() : null)
              }
            />
            <span>I have completed the PAR-Q+</span>
          </label>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={form.parq_flagged_yes}
              onChange={(e) => set('parq_flagged_yes', e.target.checked)}
            />
            <span>I answered yes to one or more questions</span>
          </label>
          {form.parq_flagged_yes && (
            <Notice tone="warn">
              A yes answer means the PAR-Q+ itself directs you to speak with a health professional
              before increasing your activity. This site cannot clear you and will not try. Record
              anything they tell you below.
            </Notice>
          )}
          <Field label="Restrictions or advice from a health professional">
            <TextArea
              rows={2}
              value={form.doctor_restrictions ?? ''}
              onChange={(e) => set('doctor_restrictions', e.target.value || null)}
              placeholder="For example: build up gradually, avoid heavy overhead lifting"
            />
          </Field>
        </div>
      </Card>

      {/* -------------------- profile -------------------- */}
      <Card title="Profile and goals">
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="dn">
            <TextInput
              id="dn"
              value={form.display_name}
              onChange={(e) => set('display_name', e.target.value)}
            />
          </Field>
          <Field label="Age" htmlFor="ag">
            <TextInput
              id="ag"
              type="number"
              inputMode="numeric"
              value={form.age}
              onChange={(e) => set('age', Number(e.target.value))}
            />
          </Field>
          <Field label="Height (cm)" htmlFor="ht">
            <TextInput
              id="ht"
              type="number"
              inputMode="decimal"
              value={form.height_cm}
              onChange={(e) => set('height_cm', Number(e.target.value))}
            />
          </Field>
          <Field label="Weight (kg)" htmlFor="wt">
            <TextInput
              id="wt"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={form.weight_kg}
              onChange={(e) => set('weight_kg', Number(e.target.value))}
            />
          </Field>
          <Field label="Units" htmlFor="un">
            <Select
              id="un"
              value={form.units}
              onChange={(e) => set('units', e.target.value as Profile['units'])}
            >
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, inches)</option>
            </Select>
          </Field>
          <Field label="Main goal" htmlFor="gl">
            <Select
              id="gl"
              value={form.goals[0]}
              onChange={(e) =>
                set('goals', [e.target.value, ...form.goals.slice(1)] as Profile['goals'])
              }
            >
              <option value="fat_loss">Lose fat</option>
              <option value="recomposition">Body recomposition</option>
              <option value="muscle_gain">Gain muscle</option>
              <option value="stamina">Improve stamina</option>
              <option value="general_health">General health</option>
            </Select>
          </Field>
          <Field label="Training days per week" htmlFor="td">
            <Select
              id="td"
              value={form.training_days_per_week}
              onChange={(e) => set('training_days_per_week', Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Session length (minutes)" htmlFor="sl">
            <TextInput
              id="sl"
              type="number"
              inputMode="numeric"
              value={form.session_minutes}
              onChange={(e) => set('session_minutes', Number(e.target.value))}
            />
          </Field>
          <Field label="Food budget (THB per day)" htmlFor="bd">
            <TextInput
              id="bd"
              type="number"
              inputMode="numeric"
              value={form.budget_thb_per_day}
              onChange={(e) => set('budget_thb_per_day', Number(e.target.value))}
            />
          </Field>
          <Field label="Bedtime" htmlFor="bt">
            <TextInput
              id="bt"
              type="time"
              value={form.bedtime}
              onChange={(e) => set('bedtime', e.target.value)}
            />
          </Field>
          <Field label="Wake time" htmlFor="wk">
            <TextInput
              id="wk"
              type="time"
              value={form.waketime}
              onChange={(e) => set('waketime', e.target.value)}
            />
          </Field>
          <Field label="Appearance" htmlFor="th">
            <Select
              id="th"
              value={form.theme}
              onChange={(e) => set('theme', e.target.value as ThemeChoice)}
            >
              <option value="system">Match my device</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </Field>
        </div>

        <Field label="Dietary requirements" hint="Separate with commas. Leave empty if none.">
          <TextInput
            value={form.dietary_notes.join(', ')}
            onChange={(e) =>
              set(
                'dietary_notes',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="halal, vegetarian, no pork"
          />
        </Field>
        <Field label="Allergies" hint="Separate with commas.">
          <TextInput
            value={form.allergies.join(', ')}
            onChange={(e) =>
              set(
                'allergies',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>

        <label className="mb-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={form.track_cycle}
            onChange={(e) => set('track_cycle', e.target.checked)}
          />
          <span>
            Track menstrual cycle changes (optional - it is an early signal of under-eating)
          </span>
        </label>

        <div className="rounded-[8px] border border-line bg-surface-2 p-3 text-sm">
          <p className="font-medium">With these settings your targets would be:</p>
          <p className="mt-1">
            {preview.target_kcal} kcal, {preview.protein_g} g protein, {preview.carbs_g} g carbs,{' '}
            {preview.fat_g} g fat, {preview.fiber_g} g fibre
          </p>
          <p className="mt-1 text-muted">
            About {preview.expected_weekly_change_kg.toFixed(2)} kg per week.
          </p>
        </div>

        <div className="mt-3">
          <Button onClick={save}>{saved ? 'Saved' : 'Save changes'}</Button>
        </div>
      </Card>

      {/* -------------------- language -------------------- */}
      <Card title="Language">
        <p className="text-sm">
          The interface is in English. Thai dish names are shown next to every &quot;buy
          outside&quot; option, together with the exact phrases for asking for less oil, less sugar
          or extra vegetables - that is where Thai is actually needed.
        </p>
        <p className="mt-2 text-sm text-muted">
          The site is built so a full Thai translation can be added later without changing any of
          the calculations.
        </p>
      </Card>

      {/* -------------------- saving -------------------- */}
      <Card title="Where your data is kept">
        <ul className="space-y-1 text-sm">
          <li>
            Status: <strong>{data.saveState === 'saved' ? 'saved' : data.saveState}</strong>
          </li>
          <li>Last saved: {timeAgo(data.lastSavedAt)}</li>
        </ul>
        <p className="mt-2 text-sm">
          Everything lives in this browser, on this device. There is no account and no server, so
          nothing is uploaded anywhere and nothing syncs on its own.
        </p>
        <div className="mt-3">
          <Link to="/more/transfer" className="inline-flex">
            <Button size="sm" variant="secondary">
              Move data to another device
            </Button>
          </Link>
        </div>
        <p className="mt-2 text-xs text-muted">
          Because it is only here, clearing your browsing data would delete it. Download a backup
          file from the Transfer page now and again.
        </p>
      </Card>

      {/* -------------------- installing -------------------- */}
      <Card title="Add to your iPhone home screen">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Open this site in Safari (it must be Safari, not Chrome).</li>
          <li>Tap the Share button - the square with an arrow pointing up.</li>
          <li>Scroll down and tap &quot;Add to Home Screen&quot;.</li>
          <li>Tap Add.</li>
        </ol>
        <p className="mt-2 text-sm text-muted">
          It then opens like an app, full screen, and still shows your last saved data when you have
          no signal.
        </p>
        <p className="mt-2 text-sm text-muted">
          There is no Apple Health connection. If that matters to you, enter steps manually - the
          Today page has a quick control for it.
        </p>
      </Card>

      {/* -------------------- data -------------------- */}
      <Card title="Your data">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={exportJson}>
            <Download className="h-4 w-4" aria-hidden /> Export JSON
          </Button>
          <Button size="sm" variant="secondary" onClick={exportCsv}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={exportSummary}>
            <Download className="h-4 w-4" aria-hidden /> Summary for a professional
          </Button>
          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden /> Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {importMsg && (
          <div className="mt-3">
            <Notice tone="info">{importMsg}</Notice>
          </div>
        )}
        <p className="mt-3 text-sm text-muted">
          The summary export is a plain text page you can hand to a trainer, dietitian,
          physiotherapist or doctor. It contains your targets, adherence and anything flagged - and
          it says clearly that it is not a medical assessment.
        </p>
      </Card>

      {/* -------------------- sample data -------------------- */}
      <Card
        title="Example data"
        subtitle="Useful for seeing what the charts look like before you have weeks of your own."
      >
        <p className="text-sm">
          This adds four weeks of made-up workouts, meals, weights and daily logs so the Progress
          page has something to draw. It is clearly example data and removing it deletes exactly
          those entries - nothing you logged yourself.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={loadSample}
            disabled={sampleKeysLoaded.length > 0}
          >
            Load example data
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={removeSample}
            disabled={sampleKeysLoaded.length === 0}
          >
            Remove example data
          </Button>
        </div>
        {sampleKeysLoaded.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            {sampleKeysLoaded.length} example entries are currently loaded.
          </p>
        )}
        {sampleMsg && (
          <div className="mt-3">
            <Notice tone="info">{sampleMsg}</Notice>
          </div>
        )}
      </Card>

      {/* -------------------- privacy -------------------- */}
      <Card title="Privacy">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Your information never leaves this device unless you export it yourself.</li>
          <li>There is no account, no server, and no analytics.</li>
          <li>Nobody else can see it, because there is nowhere else for it to be.</li>
          <li>Progress photos are never uploaded. The site only stores a note you type.</li>
          <li>Anyone who can unlock this device can open the site, so use a screen lock.</li>
        </ul>
      </Card>

      {/* -------------------- delete -------------------- */}
      <Card title="Delete everything" tone="danger">
        <p className="text-sm">
          This permanently deletes your profile, workouts, meals, measurements and every other
          record. It cannot be undone.
        </p>
        <Field label="Type DELETE to confirm" htmlFor="del">
          <TextInput
            id="del"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
        </Field>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" aria-hidden /> Delete all my data
        </Button>
        {deleteMsg && (
          <div className="mt-3">
            <Notice tone="danger">{deleteMsg}</Notice>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          Your sign-in email is removed separately from the Supabase dashboard. A website key is not
          allowed to delete login accounts, which is the correct behaviour - otherwise anyone who
          got hold of the key could delete accounts.
        </p>
      </Card>
    </div>
  );
}
