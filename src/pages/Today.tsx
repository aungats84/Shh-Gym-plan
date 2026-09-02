import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Flame, Footprints, Moon, Play, RotateCcw, Check } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Button, Card, Detail, Meter, Notice, Pill, Ring, Stepper } from '@/components/ui';
import { bangkokHour, minusHours, prettyDate, weekStart } from '@/lib/time';
import { WORKOUT_DAYS } from '@/data/program';
import { mealsForDay, findOption } from '@/data/meals';
import { totalsFor } from '@/domain/grocery';
import { sessionsInWeek } from '@/domain/progression';
import { currentStreak } from '@/domain/streak';
import type { DailyLog } from '@/lib/types';

export default function Today() {
  const data = useData();
  const plan = usePlan();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const today = plan.today;
  const profile = data.profile!;

  const log: DailyLog = data.daily_logs.find((l) => l.date === today) ?? {
    date: today,
    water_l: 0,
    steps: 0,
    sleep_hours: null,
    sleep_quality: null,
    stress: null,
    energy: null,
    mood: null,
    caffeine_last_time: null,
    alcohol_units: null,
    daytime_sleepiness: false,
    notes: '',
  };

  const done = sessionsInWeek(data.workouts, weekStart(today));
  const doneKeys = new Set(done.map((s) => s.day_key));
  const nextDay = WORKOUT_DAYS.find((d) => !doneKeys.has(d.key)) ?? WORKOUT_DAYS[0];
  const trainedToday = data.workouts.find((w) => w.date === today && w.status === 'completed');
  const restToday = log.rest_day === true;
  const streak = currentStreak({
    today,
    daily_logs: data.daily_logs,
    workouts: data.workouts,
    meal_selections: data.meal_selections,
  });

  const selections = data.meal_selections.filter((m) => m.date === today);
  const totals = totalsFor(selections);
  const dayNumber = (Math.abs(dayIndex(today)) % 7) + 1;
  const planned = mealsForDay(dayNumber);

  const hour = bangkokHour();
  const evening = hour >= 17;
  const caffeineCutoff = minusHours(profile.bedtime || '03:00', 8);
  const proteinTarget = plan.targets?.protein_g ?? 100;

  function update(patch: Partial<DailyLog>) {
    setSaving(true);
    data.upsert('daily_logs', { ...log, ...patch });
    window.setTimeout(() => setSaving(false), 400);
  }

  /* The three things that actually matter today. */
  const tasks: { text: string; done: boolean }[] = [];
  if (!plan.parqDone) {
    tasks.push({ text: 'Finish the health check to unlock workouts', done: false });
  } else if (!trainedToday && !restToday && done.length < profile.training_days_per_week) {
    tasks.push({ text: `${nextDay.name} — ${nextDay.focus.toLowerCase()}`, done: false });
  }
  tasks.push({
    text: `Eat ${proteinTarget} g protein`,
    done: totals.protein_g >= proteinTarget * 0.9,
  });
  tasks.push({ text: `Drink ${plan.waterGoal} L water`, done: log.water_l >= plan.waterGoal });
  if (tasks.length < 3) {
    tasks.push({
      text: `Walk ${plan.stepGoal.toLocaleString()} steps`,
      done: log.steps >= plan.stepGoal,
    });
  }

  return (
    <div className="space-y-4">
      {/* ---------------- day-page masthead ---------------- */}
      <div className="mb-1 flex items-end justify-between gap-3 border-b border-rule pb-3.5">
        <div className="min-w-0">
          <p className="label-caps text-[10.5px] text-accent">{prettyDate(today)}</p>
          <h1 className="mt-1.5 font-serif text-[30px] font-semibold leading-[1.02] sm:text-[36px]">
            {profile.display_name ? `Hello, ${profile.display_name}` : 'Today'}
          </h1>
        </div>
        <Pill tone={done.length >= profile.training_days_per_week ? 'win' : 'accent'}>
          Week {plan.week} · {done.length}/{profile.training_days_per_week}
        </Pill>
      </div>

      {/* ---------------- under-fuelling: never hidden ---------------- */}
      {plan.energy.should_pause_deficit && (
        <Notice tone="alert" title="Eating target raised to maintenance">
          <p>Several signs of under-eating showed up together, so the deficit is paused.</p>
          <Detail label="What was noticed">
            <ul className="list-disc space-y-1 pl-4">
              {plan.energy.flags.map((f) => (
                <li key={f.id}>
                  <strong>{f.label}.</strong> {f.detail}
                </li>
              ))}
            </ul>
            <p className="mt-2">{plan.energy.message}</p>
          </Detail>
        </Notice>
      )}

      {/* ---------------- the hero: one unmissable next thing ---------------- */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* the protein ring — desktop only, on the left */}
          <div className="hidden shrink-0 justify-center sm:flex">
            <Ring
              value={totals.protein_g}
              max={proteinTarget}
              label="Protein today"
              sub={`${totals.kcal} of ${plan.effectiveKcal} kcal`}
              size={112}
            />
          </div>

          {/* the plate: monumental action */}
          <div className="min-w-0 flex-1 sm:border-l sm:border-rule sm:pl-6">
            {!plan.parqDone ? (
              <>
                <p className="label-caps text-[10.5px] text-warm">Locked</p>
                <p className="mt-1.5 font-serif text-[26px] font-semibold leading-tight sm:text-[30px]">
                  Health check first
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  Two minutes of screening before your first workout — the standard step before
                  starting.
                </p>
                <div className="mt-4">
                  <Link to="/more/settings" className="inline-flex">
                    <Button size="lg">Unlock workouts</Button>
                  </Link>
                </div>
              </>
            ) : trainedToday ? (
              <>
                <p className="label-caps flex items-center gap-2 text-[10.5px] text-win">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  Done today
                </p>
                <p className="mt-1.5 font-serif text-[26px] font-semibold leading-tight sm:text-[30px]">
                  Trained today
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  Eat well tonight and get your sleep. That&apos;s the rest of the job.
                </p>
              </>
            ) : restToday ? (
              <>
                <p className="label-caps flex items-center gap-2 text-[10.5px] text-win">
                  <Moon className="h-3.5 w-3.5" aria-hidden />
                  Rest day
                </p>
                <p className="mt-1.5 font-serif text-[26px] font-semibold leading-tight sm:text-[30px]">
                  Resting today
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  Recovery is part of the plan — your streak keeps going. {nextDay.name} is ready
                  whenever you are.
                </p>
                <div className="mt-4">
                  <Button size="md" variant="secondary" onClick={() => update({ rest_day: false })}>
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Actually, I&apos;ll train
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="label-caps text-[10.5px] text-accent">Next session</p>
                <p className="mt-1.5 font-serif text-[30px] font-semibold leading-[1.03] sm:text-[38px]">
                  {nextDay.name}
                </p>
                <p className="mt-1 text-[14px] text-muted">{nextDay.focus}</p>
                <div className="mt-4 space-y-2">
                  <Button size="lg" full onClick={() => navigate(`/train/session/${nextDay.key}`)}>
                    <Play className="h-4 w-4 fill-current" aria-hidden />
                    Start workout
                  </Button>
                  <Button
                    size="md"
                    variant="secondary"
                    full
                    onClick={() => update({ rest_day: true })}
                  >
                    <Moon className="h-4 w-4" aria-hidden />
                    Swap for rest day
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* protein today — compact strip on mobile, where the big ring would crowd */}
        <div className="mt-4 border-t border-rule pt-4 sm:hidden">
          <Meter
            value={totals.protein_g}
            max={proteinTarget}
            label="Protein today"
            unit=" g"
            tone="accent"
          />
          <p className="-mt-1 text-[12px] text-faint">
            {totals.kcal} of {plan.effectiveKcal} kcal
          </p>
        </div>

        {/* the week, as ruled ticks */}
        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-rule pt-4">
          {WORKOUT_DAYS.map((d) => (
            <Pill key={d.key} tone={doneKeys.has(d.key) ? 'win' : 'plain'}>
              {doneKeys.has(d.key) && <Check className="h-3 w-3" aria-hidden />}
              {d.name}
            </Pill>
          ))}
        </div>
      </Card>

      {/* ---------------- streak + consistency ---------------- */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] border border-accent/20 bg-accent-wash p-4">
          <div className="label-caps flex items-center gap-1.5 text-[10px] text-accent">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            Day streak
          </div>
          <p className="mt-2 font-serif text-[30px] font-semibold leading-none text-accent-2 tabular-nums">
            {streak}
          </p>
          <p className="mt-1.5 text-[12px] text-muted">
            {streak === 0
              ? 'Log anything today to start'
              : streak === 1
                ? 'day in a row — keep it going'
                : 'days in a row — keep it going'}
          </p>
        </div>
        <div className="rounded-[16px] border border-win/25 bg-win-wash p-4">
          <div className="label-caps flex items-center gap-1.5 text-[10px] text-win">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
            This week
          </div>
          <p className="mt-2 font-serif text-[30px] font-semibold leading-none tabular-nums text-[color:var(--color-win)]">
            {done.length}
            <span className="text-[18px] text-faint"> / {profile.training_days_per_week}</span>
          </p>
          <p className="mt-1.5 text-[12px] text-muted">
            {done.length >= profile.training_days_per_week
              ? 'week complete — well done'
              : 'sessions done'}
          </p>
        </div>
      </div>

      {/* ---------------- three things ---------------- */}
      <Card title="Three things today">
        <ul className="space-y-2.5">
          {tasks.slice(0, 3).map((t) => (
            <li key={t.text} className="flex items-start gap-3">
              <span
                aria-hidden
                className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  t.done ? 'border-win bg-win text-white' : 'border-line'
                }`}
              >
                {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className={`text-[14px] ${t.done ? 'text-faint line-through' : ''}`}>
                {t.text}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ---------------- quick log ---------------- */}
      <Card title="Quick log" right={saving ? <Pill tone="win">Saved</Pill> : undefined}>
        <div className="space-y-2.5">
          <Stepper
            Icon={Droplets}
            label="Water"
            value={log.water_l}
            unit=" L"
            goal={plan.waterGoal}
            step={0.25}
            onChange={(v) => update({ water_l: Math.max(0, Math.round(v * 100) / 100) })}
          />
          <Stepper
            Icon={Footprints}
            label="Steps"
            value={log.steps}
            unit=""
            goal={plan.stepGoal}
            step={500}
            onChange={(v) => update({ steps: Math.max(0, v) })}
          />
          <Stepper
            Icon={Moon}
            label="Sleep"
            value={log.sleep_hours ?? 0}
            unit=" h"
            goal={8}
            step={0.5}
            onChange={(v) => update({ sleep_hours: Math.max(0, Math.round(v * 2) / 2) })}
          />
        </div>
      </Card>

      {/* ---------------- food ---------------- */}
      <Card
        title="Food"
        right={
          <Link to="/food" className="inline-flex">
            <Button size="sm" variant="secondary">
              Choose
            </Button>
          </Link>
        }
      >
        <Meter label="Calories" value={totals.kcal} max={plan.effectiveKcal} unit="" />
        <Meter label="Protein" value={totals.protein_g} max={proteinTarget} unit=" g" tone="win" />
        <Meter
          label="Spending"
          value={totals.cost_thb}
          max={profile.budget_thb_per_day}
          unit=" ฿"
          tone={totals.cost_thb > profile.budget_thb_per_day ? 'warm' : 'accent'}
        />

        {selections.length === 0 ? (
          <div className="mt-3 space-y-2">
            {planned.map((m) => {
              const rec = m.options.find((o) => o.kind === m.recommended) ?? m.options[0];
              return (
                <div key={m.id} className="rounded-[16px] border border-line bg-surface-2 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
                    {m.slot === 'meal_1' ? 'Afternoon' : 'Evening'}
                  </p>
                  <p className="mt-0.5 text-[14px] font-semibold">{rec.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {rec.kcal} kcal · {rec.protein_g} g protein · {rec.cost_thb} ฿
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {selections.map((s) => {
              const f = findOption(s.meal_id);
              return (
                <li key={s.slot} className="flex items-baseline justify-between gap-2 text-[13px]">
                  <span className="truncate">{f?.option.name ?? s.custom_name ?? 'Custom'}</span>
                  <span className="shrink-0 tabular-nums text-faint">
                    {f ? f.option.kcal : (s.custom_kcal ?? 0)} kcal
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ---------------- timing ---------------- */}
      <Card title={evening ? 'After you train' : 'Before you train'}>
        <ul className="space-y-1.5 text-[13.5px]">
          {evening ? (
            <>
              <li>Eat within a couple of hours — protein and rice.</li>
              <li>Five-minute cooldown before you sit down.</li>
              <li>Finish your water.</li>
            </>
          ) : (
            <>
              <li>First meal 3–4 hours before training.</li>
              <li>No caffeine after {caffeineCutoff}.</li>
              <li>Warm up for 5 minutes. It changes the whole session.</li>
            </>
          )}
        </ul>
        <Detail label={evening ? 'More on recovery' : 'More on timing'}>
          {evening ? (
            <p>
              The 30-minute window is overstated — a proper meal within a couple of hours is what
              matters. Sleep does more for recovery than anything else on this list.
            </p>
          ) : (
            <p>
              You eat twice a day and train in the evening, so meal timing does the work a snack
              would normally do. Caffeine halves roughly every five hours, so an afternoon coffee is
              still active at bedtime.
            </p>
          )}
        </Detail>
      </Card>
    </div>
  );
}

/** Stable day number so the meal rotation does not jump around. */
function dayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}
