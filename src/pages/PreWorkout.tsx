import { useState } from 'react';
import { Check, Clock, Coffee, Droplets } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Card, Detail, Notice, PageTitle } from '@/components/ui';
import VideoLink from '@/components/VideoLink';
import { EXTRAS } from '@/data/meals';
import { minusHours } from '@/lib/time';

export default function PreWorkout() {
  const { profile } = useData();
  const plan = usePlan();
  const bedtime = profile?.bedtime ?? '03:00';
  const cutoff = minusHours(bedtime, 8);

  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (k: string) =>
    setDone((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const items = [
    { k: 'meal', label: 'First meal was 3–4 hours ago' },
    { k: 'water', label: `Had some water (aim ${plan.waterGoal} L across today)` },
    { k: 'caffeine', label: `No caffeine after ${cutoff}` },
    { k: 'warmup', label: 'Warmed up for 5 minutes' },
  ];

  return (
    <div className="space-y-4">
      <PageTitle sub="A quick ritual before you start.">Before training</PageTitle>

      {/* ---------------- the pre-flight checklist ---------------- */}
      <Card title="Before you start" subtitle="Tick these off as you go.">
        <ul className="divide-y divide-line/70">
          {items.map(({ k, label }) => {
            const on = done.has(k);
            return (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => toggle(k)}
                  aria-pressed={on}
                  className="flex w-full items-center gap-3 py-3 text-left transition-transform active:scale-[0.99]"
                >
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      on ? 'border-win bg-win text-white' : 'border-line'
                    }`}
                  >
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className={`text-[14px] ${on ? 'text-faint line-through' : ''}`}>
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* ---------------- the warm-up itself ---------------- */}
      <Card title="5-minute warm-up" eyebrow="Do this">
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
        <div className="mt-3">
          <p className="label-caps mb-2 text-[10px] text-faint">Watch how</p>
          <VideoLink
            exerciseName="a 5-minute warm-up"
            searchPhrase="5 minute full body warm up before workout no equipment"
          />
        </div>
      </Card>

      {/* ---------------- the reading, folded away ---------------- */}
      <Card title="Good to know" subtitle="Open only what you need.">
        <div className="space-y-1">
          <Detail label="Water & caffeine, in numbers">
            <p className="flex items-baseline gap-2">
              <Droplets className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span className="font-serif text-[20px] font-semibold tabular-nums">
                {plan.waterGoal} L
              </span>
              across the day — 300–500 ml in the hour before you start.
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <Coffee className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              No caffeine after{' '}
              <span className="font-serif text-[20px] font-semibold tabular-nums">{cutoff}</span> —
              you sleep at {bedtime}, and caffeine halves about every 5 hours.
            </p>
          </Detail>

          <Detail label="Why eat at 3–4 PM, not a snack?">
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

          <Detail label="Do I need pre-workout or electrolytes?">
            No. Plain water is enough for a normal indoor session in air conditioning. Electrolyte
            drinks are for long, heavy-sweating sessions in the heat. If you already drink coffee
            and it does not wreck your sleep, one before training is fine.
          </Detail>

          <Detail label="On a low-motivation day">
            Commit to the warm-up only. If you still want to stop after five minutes, stop. You
            usually won&apos;t. Decide the number of sets before you begin — vague sessions get cut
            short.
          </Detail>
        </div>
      </Card>
    </div>
  );
}
