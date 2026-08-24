import { useState } from 'react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Button, Card, Field, Notice, Scale, SectionHeading, TextInput } from '@/components/ui';
import { minusHours, prettyDate, sleepWindowHours } from '@/lib/time';
import type { DailyLog } from '@/lib/types';

export default function SleepStress() {
  const data = useData();
  const plan = usePlan();
  const profile = data.profile!;
  const today = plan.today;

  const existing = data.daily_logs.find((l) => l.date === today);
  const [log, setLog] = useState<DailyLog>(
    existing ?? {
      date: today,
      water_l: 0,
      steps: 0,
      sleep_hours: sleepWindowHours(profile.bedtime, profile.waketime),
      sleep_quality: 3,
      stress: 3,
      energy: 3,
      mood: 3,
      caffeine_last_time: null,
      alcohol_units: null,
      daytime_sleepiness: false,
      notes: '',
    },
  );
  const [saved, setSaved] = useState(false);

  const window = sleepWindowHours(profile.bedtime, profile.waketime);
  const caffeineCutoff = minusHours(profile.bedtime, 8);

  function set<K extends keyof DailyLog>(k: K, v: DailyLog[K]) {
    setLog((l) => ({ ...l, [k]: v }));
    setSaved(false);
  }

  function save() {
    data.upsert('daily_logs', log);
    setSaved(true);
  }

  const recent = data.daily_logs
    .filter((l) => l.sleep_hours != null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  const avgSleep =
    recent.length > 0
      ? Math.round((recent.reduce((s, l) => s + (l.sleep_hours ?? 0), 0) / recent.length) * 10) / 10
      : null;

  // Plenty of time in bed, poor quality, and daytime sleepiness together is
  // the pattern that needs a clinician rather than another sleep-hygiene tip.
  const flagAssessment =
    log.daytime_sleepiness && (log.sleep_hours ?? 0) >= 7 && (log.sleep_quality ?? 5) <= 2;

  return (
    <div className="space-y-4">
      <SectionHeading sub="Sleep is the recovery tool that actually moves the needle.">
        Sleep and stress
      </SectionHeading>

      <Card title="Your usual pattern" tone="accent">
        <p className="text-sm">
          {profile.bedtime} to {profile.waketime} - about <strong>{window} hours</strong> in bed.
        </p>
        <p className="mt-1 text-sm text-muted">
          That is a good amount. A late schedule is not a problem in itself as long as it is
          consistent and you wake up rested. Consistency matters more than the clock time.
        </p>
        {avgSleep && (
          <p className="mt-2 text-sm">
            Logged average over your last {recent.length} entries: <strong>{avgSleep} hours</strong>
          </p>
        )}
      </Card>

      <Card title={`Log for ${prettyDate(today)}`}>
        <Field label="Hours slept" htmlFor="hrs">
          <TextInput
            id="hrs"
            type="number"
            inputMode="decimal"
            step="0.5"
            min={0}
            max={16}
            value={log.sleep_hours ?? ''}
            onChange={(e) => set('sleep_hours', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field label="Sleep quality">
          <Scale
            name="Sleep quality"
            value={log.sleep_quality ?? 3}
            onChange={(v) => set('sleep_quality', v)}
            lowLabel="Poor"
            highLabel="Excellent"
          />
        </Field>
        <Field label="Stress today">
          <Scale
            name="Stress"
            value={log.stress ?? 3}
            onChange={(v) => set('stress', v)}
            lowLabel="Calm"
            highLabel="Very stressed"
          />
        </Field>
        <Field label="Mood today">
          <Scale
            name="Mood"
            value={log.mood ?? 3}
            onChange={(v) => set('mood', v)}
            lowLabel="Low"
            highLabel="Great"
          />
        </Field>
        <Field
          label="Last caffeine (time)"
          htmlFor="caf"
          hint={`Your cutoff is about ${caffeineCutoff}.`}
        >
          <TextInput
            id="caf"
            type="time"
            value={log.caffeine_last_time ?? ''}
            onChange={(e) => set('caffeine_last_time', e.target.value || null)}
          />
        </Field>
        <Field label="Alcohol (drinks)" htmlFor="alc">
          <TextInput
            id="alc"
            type="number"
            inputMode="numeric"
            min={0}
            value={log.alcohol_units ?? ''}
            onChange={(e) => set('alcohol_units', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <label className="mb-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={log.daytime_sleepiness}
            onChange={(e) => set('daytime_sleepiness', e.target.checked)}
          />
          <span>I felt sleepy during the day even though I slept enough</span>
        </label>

        <Button size="sm" onClick={save}>
          {saved ? 'Saved' : 'Save'}
        </Button>
      </Card>

      {flagAssessment && (
        <Notice tone="warn" title="Worth mentioning to a doctor">
          You are getting plenty of time in bed but still rating your sleep as poor and feeling
          sleepy during the day. That pattern - especially alongside loud snoring or anyone noticing
          pauses in your breathing - is worth a proper assessment rather than more sleep hygiene
          tips. General advice will not fix a sleep disorder.
        </Notice>
      )}

      <Card title="What actually helps">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong>Consistency first.</strong> The same bedtime and wake time every day, weekends
            included, does more than anything else on this list.
          </li>
          <li>
            <strong>Caffeine cutoff around {caffeineCutoff}.</strong> Caffeine halves roughly every
            five hours, so an afternoon coffee is still active at bedtime.
          </li>
          <li>
            <strong>Finish training at least an hour before bed.</strong> You train in the evening
            and go to bed at {profile.bedtime}, so this is comfortable for you.
          </li>
          <li>
            <strong>Alcohol makes sleep worse,</strong> even when it helps you fall asleep. It
            suppresses the deep stages and you wake less recovered.
          </li>
          <li>
            <strong>Cool and dark.</strong> In Bangkok, air conditioning is worth the electricity if
            you have it.
          </li>
          <li>
            <strong>Under-eating disrupts sleep.</strong> If you start waking in the night during a
            diet, that is a signal to eat more, not to try harder at sleeping.
          </li>
        </ul>
      </Card>

      <Card title="About sleep trackers">
        <p className="text-sm">
          If you use a watch or a phone app, treat its numbers as rough estimates. Consumer trackers
          are reasonable at telling how long you were in bed and unreliable at sleep stages. They
          are not medical measurements, and chasing a sleep score is a good way to sleep worse.
        </p>
      </Card>

      <Card title="Stress and training">
        <p className="text-sm">
          High stress raises how hard a normal session feels and slows recovery. Your readiness
          check already accounts for it, which is why a stressful week produces a lower suggested
          volume rather than the same plan and a worse outcome.
        </p>
      </Card>
    </div>
  );
}
