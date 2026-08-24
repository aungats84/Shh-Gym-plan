import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Card, Notice, SectionHeading } from '@/components/ui';
import { EXTRAS } from '@/data/meals';
import {
  GENERAL_WARMUP,
  LOWER_MOBILITY,
  UPPER_MOBILITY,
  SPECIFIC_WARMUP_RULE,
} from '@/data/program';
import { minusHours } from '@/lib/time';

export default function PreWorkout() {
  const { profile } = useData();
  const plan = usePlan();
  const bedtime = profile?.bedtime ?? '03:00';
  const caffeineCutoff = minusHours(bedtime, 8);
  const mealsPerDay = profile?.meals_per_day ?? 2;

  return (
    <div className="space-y-4">
      <SectionHeading sub="What to eat, drink and do before you train.">Pre-workout</SectionHeading>

      <Card title="Timing your food" tone="accent">
        <p className="text-sm">
          You eat <strong>{mealsPerDay} meals a day</strong> and train in the evening. That means
          meal timing does the work a snack would normally do.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong>Meal 1 at about 3-4 PM.</strong> That puts a full meal three to four hours
            before training - enough time to digest, close enough to still have energy.
          </li>
          <li>
            <strong>Meal 2 after training.</strong> This becomes your recovery meal.
          </li>
          <li>
            If meal 1 ends up much earlier, you will feel flat. Move the meal rather than adding
            food.
          </li>
        </ul>
      </Card>

      <Card title="If you do want something small">
        <p className="text-sm text-muted">
          You said you would rather stick to two meals. These are here only for the days when the
          gap gets long - they are optional, not part of the plan.
        </p>
        <ul className="mt-2 space-y-2 text-sm">
          {EXTRAS.filter((e) => e.timing === 'before').map((e) => (
            <li key={e.id} className="rounded-[8px] border border-border p-2">
              <p className="font-medium">{e.name}</p>
              <p className="text-muted">
                {e.portion} - {e.kcal} kcal, {e.protein_g} g protein, {e.cost_thb} THB
              </p>
              <p className="mt-0.5 text-xs text-muted">{e.steps[0]}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Hydration">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            Aim for about <strong>{plan.waterGoal} litres</strong> across the day, not all at once
            before training.
          </li>
          <li>Have 300-500 ml in the hour or two before you start.</li>
          <li>
            For a normal indoor session in air conditioning, plain water is all you need.
            Electrolyte drinks are for long, heavy-sweating sessions in the heat.
          </li>
          <li>
            Dark yellow urine before training usually means you started behind. Drink earlier next
            time.
          </li>
        </ul>
      </Card>

      <Card title="Caffeine">
        <p className="text-sm">
          You go to bed around <strong>{bedtime}</strong>, so your caffeine cutoff is about{' '}
          <strong>{caffeineCutoff}</strong>. Caffeine has a half-life of roughly five hours, which
          means a coffee at 8 PM is still working at midnight.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            You do not need a pre-workout supplement. There is no benefit worth the cost here.
          </li>
          <li>
            If you already drink coffee and it does not affect your sleep, it is fine before
            training.
          </li>
          <li>If you sleep badly on a day you had caffeine late, that is your answer.</li>
        </ul>
        {(profile?.age ?? 30) < 18 && (
          <div className="mt-3">
            <Notice tone="warn">Caffeine is not recommended before exercise for under-18s.</Notice>
          </div>
        )}
      </Card>

      <Card title="Getting your head into it">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            Decide before you start how many sets you are doing. Vague sessions get cut short.
          </li>
          <li>
            Put the phone somewhere it cannot interrupt sets. Rest timers are on the workout page.
          </li>
          <li>
            On a low-motivation day, commit to the warm-up only. If you still want to stop after
            that, stop - but you usually will not.
          </li>
          <li>A session at 70 percent that happened beats a perfect session that did not.</li>
        </ul>
      </Card>

      <Card title="Warm-up checklist">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {GENERAL_WARMUP.map((s) => (
            <li key={s.name}>
              {s.name} - {s.detail} ({s.duration})
            </li>
          ))}
          <li>
            Then, for a lower body day: {LOWER_MOBILITY.map((s) => s.name.toLowerCase()).join(', ')}
            .
          </li>
          <li>
            Or, for an upper body day: {UPPER_MOBILITY.map((s) => s.name.toLowerCase()).join(', ')}.
          </li>
          <li>{SPECIFIC_WARMUP_RULE}</li>
        </ol>
      </Card>
    </div>
  );
}
