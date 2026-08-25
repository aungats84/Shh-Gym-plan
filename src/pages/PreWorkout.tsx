import { Clock, Coffee, Droplets, Brain } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Card, Detail, Notice, PageTitle } from '@/components/ui';
import { EXTRAS } from '@/data/meals';
import { minusHours } from '@/lib/time';

export default function PreWorkout() {
  const { profile } = useData();
  const plan = usePlan();
  const bedtime = profile?.bedtime ?? '03:00';
  const cutoff = minusHours(bedtime, 8);

  return (
    <div className="space-y-4">
      <PageTitle sub="The hour before matters more than any supplement.">Before training</PageTitle>

      <Card title="Eat at 3–4 PM" eyebrow="Timing" tone="accent">
        <p className="text-[13.5px]">
          That puts a full meal 3–4 hours before an evening session. Close enough for energy, far
          enough to digest.
        </p>
        <Detail label="Why not a snack?">
          You eat twice a day and would rather not add a third. Moving meal 1 later does the same
          job. If the gap still feels long, these help:
          <ul className="mt-2 space-y-1.5">
            {EXTRAS.filter((e) => e.timing === 'before').map((e) => (
              <li key={e.id}>
                <strong className="text-text">{e.name}</strong> — {e.kcal} kcal, {e.protein_g} g
                protein, {e.cost_thb} ฿
              </li>
            ))}
          </ul>
        </Detail>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Water" eyebrow="Hydration">
          <p className="flex items-baseline gap-2">
            <Droplets className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span className="font-display text-[22px] font-bold">{plan.waterGoal} L</span>
            <span className="text-[13px] text-muted">across the day</span>
          </p>
          <p className="mt-2 text-[13px] text-muted">300–500 ml in the hour before you start.</p>
          <Detail label="Electrolytes?">
            Not for a normal indoor session in air conditioning — plain water is enough. Electrolyte
            drinks are for long, heavy-sweating sessions in the heat.
          </Detail>
        </Card>

        <Card title="Caffeine" eyebrow={`Cut off by ${cutoff}`}>
          <p className="flex items-baseline gap-2">
            <Coffee className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span className="font-display text-[22px] font-bold">{cutoff}</span>
          </p>
          <p className="mt-2 text-[13px] text-muted">
            You sleep at {bedtime}. Caffeine halves about every 5 hours.
          </p>
          <Detail label="Do I need pre-workout?">
            No. There is no benefit here worth the cost. If you already drink coffee and it does not
            wreck your sleep, having one before training is fine.
          </Detail>
        </Card>
      </div>

      <Card title="Warm up" eyebrow="5 minutes">
        <ol className="space-y-2 text-[13.5px]">
          {[
            'March or walk briskly until you feel warm — 3 min',
            'Arm circles and hip circles — 1 min',
            'Ten bodyweight squats, or ten shoulder rolls',
            'One easy set of the first exercise, no weight',
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-wash text-[11px] font-bold text-accent">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-3">
          <Notice tone="info">
            <Clock className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            That last easy set is a rehearsal, not a working set. It should feel easy.
          </Notice>
        </div>
      </Card>

      <Card
        title="On a low-motivation day"
        eyebrow={
          <>
            <Brain className="mr-1 inline h-3 w-3" aria-hidden />
            Head
          </>
        }
      >
        <p className="text-[13.5px]">
          Commit to the warm-up only. If you still want to stop after five minutes, stop.
        </p>
        <p className="mt-2 text-[13px] text-muted">You usually won&apos;t.</p>
        <Detail label="More on getting started">
          <ul className="list-disc space-y-1 pl-4">
            <li>Decide the number of sets before you begin. Vague sessions get cut short.</li>
            <li>Put the phone where it can&apos;t interrupt. The rest timer is in the workout.</li>
            <li>A session at 70% that happened beats a perfect one that didn&apos;t.</li>
          </ul>
        </Detail>
      </Card>
    </div>
  );
}
