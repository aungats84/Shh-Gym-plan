import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Button, Card, Notice, Pill, ScrollX, SectionHeading } from '@/components/ui';
import {
  COOLDOWN,
  GENERAL_WARMUP,
  LOWER_MOBILITY,
  RETURN_GUIDANCE,
  SPECIFIC_WARMUP_RULE,
  UPPER_MOBILITY,
  WEEK_PLAN,
  WORKOUT_DAYS,
} from '@/data/program';
import { scaleSets, sessionsInWeek, weeklySetsPerMuscle } from '@/domain/progression';
import { getExercise, MUSCLE_LABELS, type MuscleGroup } from '@/data/exercises';
import { weekStart } from '@/lib/time';

export default function Workouts() {
  const data = useData();
  const plan = usePlan();
  const done = new Set(sessionsInWeek(data.workouts, weekStart(plan.today)).map((s) => s.day_key));
  const volume = weeklySetsPerMuscle(plan.week);

  return (
    <div className="space-y-4">
      <SectionHeading sub={`${plan.weekPlan.label}. Four sessions a week, any days that suit you.`}>
        Workouts
      </SectionHeading>

      {!plan.parqDone && (
        <Notice tone="warn" title="Workouts are locked">
          Complete the PAR-Q+ at{' '}
          <a className="underline" href="https://eparmedx.com/" target="_blank" rel="noreferrer">
            eparmedx.com
          </a>{' '}
          and confirm it in Settings first.
        </Notice>
      )}

      <Card title="This week" subtitle={plan.weekPlan.focus}>
        <div className="space-y-2">
          {WORKOUT_DAYS.map((d) => {
            const isDone = done.has(d.key);
            const sets = scaleSets(d.main, plan.week).reduce((n, e) => n + e.sets, 0);
            return (
              <div
                key={d.key}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {isDone && <Check className="h-4 w-4 text-good" aria-hidden />}
                    {d.name}
                  </p>
                  <p className="text-xs text-muted">
                    {d.focus} - {d.main.length} exercises, {sets} sets
                  </p>
                </div>
                <Link to={`/workouts/${d.key}`} className="inline-flex shrink-0">
                  <Button
                    size="sm"
                    variant={isDone ? 'secondary' : 'primary'}
                    disabled={!plan.parqDone}
                  >
                    {isDone ? 'Repeat' : 'Open'}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="Weekly sets per muscle"
        subtitle="A set counts fully for the main muscle and half for supporting ones."
      >
        <ScrollX>
          <table className="w-full min-w-[380px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-1.5 pr-3 font-medium">Muscle</th>
                <th className="py-1.5 pr-3 font-medium">Sets</th>
                <th className="py-1.5 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(volume)
                .sort((a, b) => b[1] - a[1])
                .map(([muscle, sets]) => {
                  const priority =
                    muscle === 'glutes' || muscle === 'biceps' || muscle === 'triceps';
                  return (
                    <tr key={muscle} className="border-b border-border last:border-0">
                      <td className="py-1.5 pr-3">{MUSCLE_LABELS[muscle as MuscleGroup]}</td>
                      <td className="py-1.5 pr-3 tabular-nums">{sets}</td>
                      <td className="py-1.5 text-xs text-muted">
                        {priority
                          ? 'Priority muscle - extra volume'
                          : sets < 6
                            ? 'Maintenance'
                            : 'On target'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </ScrollX>
        <p className="mt-3 text-xs text-muted">
          Around 10 sets per muscle per week is the usual guide for growth, with every major group
          trained at least twice a week. Arms and glutes sit above that on purpose because they are
          your priorities.
        </p>
      </Card>

      <Card title="Warm-up" subtitle="Five minutes. Do not skip it.">
        <h3 className="mb-1 text-sm font-semibold">General</h3>
        <ul className="mb-3 space-y-1 text-sm">
          {GENERAL_WARMUP.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> ({s.duration}) - {s.detail}
            </li>
          ))}
        </ul>
        <h3 className="mb-1 text-sm font-semibold">Before a lower body day</h3>
        <ul className="mb-3 space-y-1 text-sm">
          {LOWER_MOBILITY.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> ({s.duration}) - {s.detail}
            </li>
          ))}
        </ul>
        <h3 className="mb-1 text-sm font-semibold">Before an upper body day</h3>
        <ul className="mb-3 space-y-1 text-sm">
          {UPPER_MOBILITY.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> ({s.duration}) - {s.detail}
            </li>
          ))}
        </ul>
        <Notice tone="info" title="Warm-up sets">
          {SPECIFIC_WARMUP_RULE}
        </Notice>
      </Card>

      <Card title="Cooldown" subtitle="Five to ten minutes after every session.">
        <ul className="space-y-1 text-sm">
          {COOLDOWN.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> ({s.hold}) - {s.detail}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="The nine week plan">
        <ol className="space-y-2 text-sm">
          {WEEK_PLAN.map((w) => (
            <li
              key={w.week}
              className={`rounded-[8px] border p-3 ${
                w.week === plan.week ? 'border-accent bg-accent-soft' : 'border-border'
              }`}
            >
              <p className="font-medium">
                {w.label} {w.week === plan.week && <Pill tone="accent">You are here</Pill>}
              </p>
              <p className="mt-0.5 text-muted">{w.focus}</p>
              <p className="mt-0.5 text-xs text-muted">Cardio: {w.cardio}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="How to progress">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Reach the top of the rep range on every set.</li>
          <li>Then slow the lowering phase to 3-4 seconds.</li>
          <li>Then add a pause at the hardest point.</li>
          <li>Then use a harder version, or one leg or arm at a time.</li>
          <li>Then add weight - a loaded backpack for lower body work.</li>
        </ol>
        <p className="mt-2 text-sm text-muted">
          Change one thing at a time. If you change reps, weight and tempo together you will not
          know what worked.
        </p>
      </Card>

      <Card title="After a break">
        <ul className="space-y-2 text-sm">
          {RETURN_GUIDANCE.map((r) => (
            <li key={r.situation}>
              <strong>{r.situation}:</strong> {r.advice}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Exercise library" subtitle="Every exercise used in the plan.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {WORKOUT_DAYS.flatMap((d) => d.main.map((m) => m.exercise_id))
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((id) => {
              const ex = getExercise(id);
              return (
                <li key={id} className="rounded-[8px] border border-border p-2 text-sm">
                  <p className="font-medium">{ex.name}</p>
                  <p className="text-xs text-muted">
                    {ex.primary.map((m) => MUSCLE_LABELS[m]).join(', ')}
                  </p>
                </li>
              );
            })}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Full cues, common mistakes and tutorials are on the Tutorials page.
        </p>
      </Card>
    </div>
  );
}
