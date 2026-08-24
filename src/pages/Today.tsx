import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Footprints, Moon, Plus, Minus } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Button, Card, Notice, Pill, ProgressBar, SectionHeading, Stat } from '@/components/ui';
import { bangkokHour, minusHours, prettyDate, timeAgo, weekStart } from '@/lib/time';
import { WORKOUT_DAYS } from '@/data/program';
import { mealsForDay, findOption } from '@/data/meals';
import { totalsFor } from '@/domain/grocery';
import { sessionsInWeek } from '@/domain/progression';
import type { DailyLog } from '@/lib/types';

export default function Today() {
  const data = useData();
  const plan = usePlan();
  const navigate = useNavigate();
  const [savingLog, setSavingLog] = useState(false);

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

  const wkStart = weekStart(today);
  const completedThisWeek = sessionsInWeek(data.workouts, wkStart);
  const doneKeys = new Set(completedThisWeek.map((s) => s.day_key));
  const nextDay = WORKOUT_DAYS.find((d) => !doneKeys.has(d.key)) ?? WORKOUT_DAYS[0];
  const alreadyToday = data.workouts.find((w) => w.date === today && w.status === 'completed');

  const todaysSelections = data.meal_selections.filter((m) => m.date === today);
  const totals = totalsFor(todaysSelections);
  const dayNumber = (Math.abs(hashDate(today)) % 7) + 1;
  const plannedMeals = mealsForDay(dayNumber);

  const hour = bangkokHour();
  const caffeineCutoff = minusHours(profile.bedtime || '03:00', 8);

  function updateLog(patch: Partial<DailyLog>) {
    setSavingLog(true);
    data.upsert('daily_logs', { ...log, ...patch });
    window.setTimeout(() => setSavingLog(false), 300);
  }

  /* --------------- the three things that matter today ------------- */
  const actions: { text: string; done: boolean }[] = [];
  if (!plan.parqDone) {
    actions.push({
      text: 'Complete the PAR-Q+ questionnaire and confirm it in Settings',
      done: false,
    });
  } else if (!alreadyToday && completedThisWeek.length < profile.training_days_per_week) {
    actions.push({ text: `Do ${nextDay.name} - ${nextDay.focus}`, done: false });
  }
  actions.push({
    text: `Hit ${plan.targets?.protein_g ?? 100} g of protein`,
    done: totals.protein_g >= (plan.targets?.protein_g ?? 100) * 0.9,
  });
  actions.push({
    text: `Drink ${plan.waterGoal} litres of water`,
    done: log.water_l >= plan.waterGoal,
  });
  if (actions.length < 3) {
    actions.push({
      text: `Walk ${plan.stepGoal.toLocaleString()} steps`,
      done: log.steps >= plan.stepGoal,
    });
  }

  return (
    <div className="space-y-4">
      <SectionHeading sub={prettyDate(today)}>
        {profile.display_name ? `Hello, ${profile.display_name}` : 'Today'}
      </SectionHeading>

      {/* ------------------ under-fuelling warning ------------------ */}
      {plan.energy.should_pause_deficit && (
        <Notice tone="danger" title="Your calorie deficit has been paused">
          <p>{plan.energy.message}</p>
          <ul className="mt-2 list-disc pl-5">
            {plan.energy.flags.map((f) => (
              <li key={f.id}>
                <strong>{f.label}:</strong> {f.detail}
              </li>
            ))}
          </ul>
        </Notice>
      )}

      {/* ------------------ the three actions ----------------------- */}
      <Card title="Three things today">
        <ul className="space-y-2">
          {actions.slice(0, 3).map((a) => (
            <li key={a.text} className="flex items-start gap-3 text-sm">
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                  a.done ? 'border-good bg-good text-white' : 'border-border'
                }`}
              >
                {a.done ? '✓' : ''}
              </span>
              <span className={a.done ? 'text-muted line-through' : ''}>{a.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ------------------ today's training ------------------------ */}
      <Card
        title="Training"
        subtitle={`${plan.weekPlan.label} - ${completedThisWeek.length} of ${profile.training_days_per_week} sessions done this week`}
        action={
          alreadyToday ? (
            <Pill tone="good">Done today</Pill>
          ) : (
            <Button
              size="sm"
              disabled={!plan.parqDone}
              onClick={() => navigate(`/workouts/${nextDay.key}`)}
            >
              Start workout
            </Button>
          )
        }
      >
        {!plan.parqDone ? (
          <Notice tone="warn">
            Workouts unlock once you have completed the PAR-Q+ and confirmed it in Settings.
          </Notice>
        ) : alreadyToday ? (
          <p className="text-sm text-muted">
            You trained today. Rest, eat well, and come back tomorrow.
          </p>
        ) : (
          <>
            <p className="text-sm">
              Next up: <strong>{nextDay.name}</strong> - {nextDay.focus}
            </p>
            <p className="mt-1 text-sm text-muted">{plan.weekPlan.focus}</p>
          </>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {WORKOUT_DAYS.map((d) => (
            <Pill key={d.key} tone={doneKeys.has(d.key) ? 'good' : 'plain'}>
              {d.name}
            </Pill>
          ))}
        </div>

        {plan.cardio.runs > 0 && (
          <p className="mt-3 text-sm text-muted">
            Cardio this week: {plan.cardio.runs} run{plan.cardio.runs > 1 ? 's' : ''} of about{' '}
            {plan.cardio.minutes} minutes. {plan.cardio.description}
          </p>
        )}
      </Card>

      {/* ------------------ timing guidance ------------------------- */}
      <Card title={hour < 17 ? 'Before training' : 'After training'}>
        {hour < 17 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>
              Eat your first meal 3 to 4 hours before you train so you are not training empty.
            </li>
            <li>Drink water steadily through the afternoon rather than all at once.</li>
            <li>
              No caffeine after {caffeineCutoff} - it will still be in your system at bedtime.
            </li>
            <li>Warm up properly. It takes 5 minutes and changes how the session feels.</li>
          </ul>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Eat your evening meal with protein and carbohydrate within a couple of hours.</li>
            <li>Do the 5 minute cooldown before you sit down - it is on the Recovery page.</li>
            <li>Replace what you sweated out. Water first, food second.</li>
            <li>Give yourself an hour to wind down before bed.</li>
          </ul>
        )}
      </Card>

      {/* ------------------ nutrition ------------------------------- */}
      <Card
        title="Food today"
        subtitle={`Budget ${profile.budget_thb_per_day} THB - spent about ${totals.cost_thb} THB`}
        action={
          <Link to="/meals" className="inline-flex">
            <Button size="sm" variant="secondary">
              Log meal
            </Button>
          </Link>
        }
      >
        <ProgressBar
          label="Calories"
          value={totals.kcal}
          max={plan.effectiveKcal}
          unit=" kcal"
          tone={totals.kcal > plan.effectiveKcal * 1.15 ? 'warn' : 'accent'}
        />
        <ProgressBar
          label="Protein"
          value={totals.protein_g}
          max={plan.targets?.protein_g ?? 100}
          unit=" g"
          tone="good"
        />
        <ProgressBar
          label="Fibre"
          value={totals.fiber_g}
          max={plan.targets?.fiber_g ?? 25}
          unit=" g"
        />

        {todaysSelections.length === 0 ? (
          <div className="mt-3 text-sm text-muted">
            <p className="mb-1 font-medium text-text">Nothing chosen yet. Today&apos;s plan:</p>
            <ul className="list-disc pl-5">
              {plannedMeals.map((m) => {
                const rec = m.options.find((o) => o.kind === m.recommended) ?? m.options[0];
                return (
                  <li key={m.id}>
                    {m.title.split(' - ')[1]}: {rec.name} ({rec.kcal} kcal, {rec.protein_g} g
                    protein, {rec.cost_thb} THB)
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {todaysSelections.map((s) => {
              const f = findOption(s.meal_id);
              return (
                <li key={s.slot} className="flex items-baseline justify-between gap-2">
                  <span className="truncate">
                    {f?.option.name ?? s.custom_name ?? 'Custom meal'}
                  </span>
                  <span className="shrink-0 text-muted">
                    {f ? `${f.option.kcal} kcal` : `${s.custom_kcal ?? 0} kcal`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ------------------ quick logging --------------------------- */}
      <Card title="Quick log" subtitle={savingLog ? 'Saving...' : 'Tap to record'}>
        <div className="space-y-4">
          <QuickCounter
            Icon={Droplets}
            label="Water"
            value={log.water_l}
            unit=" L"
            goal={plan.waterGoal}
            step={0.25}
            onChange={(v) => updateLog({ water_l: Math.max(0, Math.round(v * 100) / 100) })}
          />
          <QuickCounter
            Icon={Footprints}
            label="Steps"
            value={log.steps}
            unit=""
            goal={plan.stepGoal}
            step={500}
            onChange={(v) => updateLog({ steps: Math.max(0, v) })}
          />
          <QuickCounter
            Icon={Moon}
            label="Sleep"
            value={log.sleep_hours ?? 0}
            unit=" h"
            goal={8}
            step={0.5}
            onChange={(v) => updateLog({ sleep_hours: Math.max(0, Math.round(v * 2) / 2) })}
          />
        </div>
      </Card>

      {/* ------------------ heat reminder --------------------------- */}
      {profile.trains_outdoors && (
        <Card title="Running outside?" tone="warn">
          <p className="text-sm">
            This site does not know the weather. Check your phone before you go, and enter the
            conditions on the Heat safety page to get advice for tonight.
          </p>
          <p className="mt-2 text-sm">
            In Bangkok, running after sunset is the single biggest safety improvement you can make.
          </p>
          <div className="mt-3">
            <Link to="/heat" className="inline-flex">
              <Button size="sm" variant="secondary">
                Open heat safety
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Week" value={plan.week} sub="of 9" />
        <Stat
          label="Sessions"
          value={`${completedThisWeek.length}/${profile.training_days_per_week}`}
          sub="this week"
        />
        <Stat label="Weight" value={`${profile.weight_kg} kg`} sub="starting" />
        <Stat label="Saved" value={timeAgo(data.lastSavedAt)} />
      </div>
    </div>
  );
}

function QuickCounter({
  Icon,
  label,
  value,
  unit,
  goal,
  step,
  onChange,
}: {
  Icon: typeof Droplets;
  label: string;
  value: number;
  unit: string;
  goal: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-muted" aria-hidden />
        <span className="font-medium">{label}</span>
        <span className="ml-auto tabular-nums text-muted">
          {value}
          {unit} / {goal.toLocaleString()}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(value - step)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-border bg-surface"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={Math.min(100, Math.round((value / goal) * 100))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress`}
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(100, (value / goal) * 100)}%` }}
          />
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-border bg-surface"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Stable day-of-plan number so the meal rotation does not jump about. */
function hashDate(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}
