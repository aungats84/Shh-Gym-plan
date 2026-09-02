import { Link } from 'react-router-dom';
import { Check, ChevronRight, Lock } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Card, Detail, Notice, PageTitle, Pill, ScrollX } from '@/components/ui';
import { RETURN_GUIDANCE, WEEK_PLAN, WORKOUT_DAYS } from '@/data/program';
import { scaleSets, sessionsInWeek, weeklySetsPerMuscle } from '@/domain/progression';
import { MUSCLE_LABELS, type MuscleGroup } from '@/data/exercises';
import { weekStart } from '@/lib/time';

export default function Workouts() {
  const data = useData();
  const plan = usePlan();
  const done = new Set(sessionsInWeek(data.workouts, weekStart(plan.today)).map((s) => s.day_key));
  const volume = weeklySetsPerMuscle(plan.week);

  return (
    <div className="space-y-4">
      <PageTitle sub={plan.weekPlan.label.replace(/^Week \d+ - /, '')}>
        Week {plan.week} of 9
      </PageTitle>

      {!plan.parqDone && (
        <Notice tone="warm" title="Locked until the health check is done">
          <Link to="/more/settings" className="font-semibold underline">
            Open Settings to finish it
          </Link>
        </Notice>
      )}

      {/* ---------------- the four sessions ---------------- */}
      <div className="space-y-2.5">
        {WORKOUT_DAYS.map((d) => {
          const isDone = done.has(d.key);
          const sets = scaleSets(d.main, plan.week).reduce((n, e) => n + e.sets, 0);
          return (
            <Link
              key={d.key}
              to={plan.parqDone ? `/train/session/${d.key}` : '/more/settings'}
              className={`flex items-center gap-3 rounded-[16px] border p-4 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[var(--shadow-lift)] active:scale-[0.99] ${
                isDone ? 'border-win/30 bg-win-wash' : 'border-line bg-surface'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isDone ? 'bg-win text-white' : 'bg-accent-wash text-accent'
                }`}
              >
                {!plan.parqDone ? (
                  <Lock className="h-4 w-4" aria-hidden />
                ) : isDone ? (
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                ) : (
                  <span className="font-serif text-[16px] font-semibold">
                    {d.name.replace(/\D/g, '')}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{d.name}</span>
                <span className="block text-[12.5px] text-muted">
                  {d.focus} · {d.main.length} moves · {sets} sets
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
            </Link>
          );
        })}
      </div>

      {/* ---------------- this week's focus ---------------- */}
      <Card title="What changes this week" tone="accent">
        <p className="text-[13.5px]">{plan.weekPlan.focus}</p>
        <p className="mt-2 text-[13px] text-muted">
          <strong className="text-text">Cardio:</strong> {plan.weekPlan.cardio}
        </p>
      </Card>

      {/* ---------------- everything else, folded away ---------------- */}
      <Card title="The full 9 weeks">
        <Detail label="See every week">
          <ol className="space-y-2">
            {WEEK_PLAN.map((w) => (
              <li
                key={w.week}
                className={`rounded-[16px] border p-2.5 ${
                  w.week === plan.week ? 'border-accent bg-accent-wash' : 'border-line'
                }`}
              >
                <p className="font-semibold text-text">
                  {w.label}
                  {w.week === plan.week && ' · you are here'}
                </p>
                <p className="mt-0.5">{w.focus}</p>
              </li>
            ))}
          </ol>
        </Detail>

        <Detail label="How to make it harder">
          <ol className="list-decimal space-y-1 pl-4">
            <li>Reach the top of the rep range on every set.</li>
            <li>Slow the lowering to 3–4 seconds.</li>
            <li>Add a pause at the hardest point.</li>
            <li>Switch to one leg or one arm at a time.</li>
            <li>Add weight — a loaded backpack for leg work.</li>
          </ol>
          <p className="mt-2">
            Change one thing at a time. Change three and you won&apos;t know which one worked.
          </p>
        </Detail>

        <Detail label="Sets per muscle each week">
          <ScrollX>
            <table className="w-full min-w-[300px]">
              <tbody>
                {Object.entries(volume)
                  .sort((a, b) => b[1] - a[1])
                  .map(([muscle, sets]) => (
                    <tr key={muscle} className="border-b border-line last:border-0">
                      <td className="py-1.5 pr-3">{MUSCLE_LABELS[muscle as MuscleGroup]}</td>
                      <td className="py-1.5 pr-3 tabular-nums text-text">{sets}</td>
                      <td className="py-1.5 text-[12px]">
                        {['glutes', 'biceps', 'triceps'].includes(muscle) ? (
                          <Pill tone="accent">priority</Pill>
                        ) : null}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ScrollX>
          <p className="mt-2">
            Around 10 sets per muscle per week is the usual guide for growth, every group trained
            twice. Arms and glutes sit above that on purpose.
          </p>
        </Detail>

        <Detail label="If you miss a week">
          <ul className="space-y-1.5">
            {RETURN_GUIDANCE.map((r) => (
              <li key={r.situation}>
                <strong className="text-text">{r.situation}:</strong> {r.advice}
              </li>
            ))}
          </ul>
        </Detail>
      </Card>

      <p className="px-1 text-center text-[12.5px] text-muted">
        Form videos for every exercise are under{' '}
        <Link to="/more/howto" className="font-semibold text-accent">
          More → How to
        </Link>
      </p>
    </div>
  );
}
