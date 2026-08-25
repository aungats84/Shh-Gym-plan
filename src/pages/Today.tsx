import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Footprints, Moon, Play, Sun, Check } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Button, Card, Detail, Meter, Notice, Pill, Ring, Stepper } from '@/components/ui';
import { bangkokHour, minusHours, prettyDate, weekStart } from '@/lib/time';
import { WORKOUT_DAYS } from '@/data/program';
import { mealsForDay, findOption } from '@/data/meals';
import { totalsFor } from '@/domain/grocery';
import { sessionsInWeek } from '@/domain/progression';
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
  } else if (!trainedToday && done.length < profile.training_days_per_week) {
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
      {/* ---------------- greeting ---------------- */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-faint">{prettyDate(today)}</p>
          <h1 className="mt-0.5 font-display text-[26px] font-bold leading-tight">
            {profile.display_name ? `Hi, ${profile.display_name}` : 'Today'}
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

      {/* ---------------- the hero ---------------- */}
      <Card>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <Ring
            value={totals.protein_g}
            max={proteinTarget}
            label="Protein today"
            sub={`${totals.kcal} of ${plan.effectiveKcal} kcal`}
          />

          <div className="w-full flex-1">
            {!plan.parqDone ? (
              <>
                <p className="text-[14px] font-semibold">Workouts are locked</p>
                <p className="mt-1 text-[13px] text-muted">
                  Two minutes of health screening first — it&apos;s the standard step before
                  starting.
                </p>
                <div className="mt-3">
                  <Link to="/more/settings" className="inline-flex">
                    <Button size="md">Unlock workouts</Button>
                  </Link>
                </div>
              </>
            ) : trainedToday ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-win-wash">
                    <Check className="h-4 w-4 text-win" aria-hidden />
                  </span>
                  <p className="text-[15px] font-semibold">Trained today</p>
                </div>
                <p className="mt-2 text-[13px] text-muted">
                  Eat well tonight and get your sleep. That&apos;s the rest of the job.
                </p>
              </>
            ) : (
              <>
                <p className="text-[12px] font-medium uppercase tracking-wide text-faint">
                  Next session
                </p>
                <p className="mt-1 font-display text-[19px] font-bold">{nextDay.name}</p>
                <p className="text-[13px] text-muted">{nextDay.focus}</p>
                <div className="mt-3">
                  <Button size="lg" full onClick={() => navigate(`/train/session/${nextDay.key}`)}>
                    <Play className="h-4 w-4 fill-current" aria-hidden />
                    Start workout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-3.5">
          {WORKOUT_DAYS.map((d) => (
            <Pill key={d.key} tone={doneKeys.has(d.key) ? 'win' : 'plain'}>
              {doneKeys.has(d.key) && <Check className="h-3 w-3" aria-hidden />}
              {d.name}
            </Pill>
          ))}
        </div>
      </Card>

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
                <div key={m.id} className="rounded-[12px] border border-line bg-surface-2 p-3">
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

      {/* ---------------- heat ---------------- */}
      {profile.trains_outdoors && (
        <Link to="/train/heat" className="block">
          <div className="flex items-center gap-3 rounded-[14px] border border-warm/30 bg-warm-wash p-3.5">
            <Sun className="h-5 w-5 shrink-0 text-warm" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold">Running outside tonight?</p>
              <p className="text-[12.5px] text-muted">
                Check the heat first — after sunset is safest in Bangkok.
              </p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}

/** Stable day number so the meal rotation does not jump around. */
function dayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}
