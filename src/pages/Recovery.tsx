import { Card, Notice, SectionHeading } from '@/components/ui';
import { COOLDOWN } from '@/data/program';
import { EXTRAS } from '@/data/meals';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';

const WARNING_SIGNS = [
  'Sharp or stabbing pain, especially during a movement',
  'Joint pain that gets worse session by session',
  'Noticeable swelling around a joint',
  'Numbness, pins and needles, or weakness in a limb',
  'Very dark or cola-coloured urine after unusually hard exercise',
  'Dizziness, fainting, or chest discomfort',
  'Confusion, or unusual difficulty breathing',
];

export default function Recovery() {
  const { profile } = useData();
  const plan = usePlan();

  return (
    <div className="space-y-4">
      <SectionHeading sub="What to do in the hour after you finish.">
        Post-workout and recovery
      </SectionHeading>

      <Card title="Eat" subtitle="Your evening meal is the recovery meal.">
        <p className="text-sm">
          Aim for roughly{' '}
          <strong>
            {Math.round((plan.targets?.protein_g ?? 100) / (profile?.meals_per_day ?? 2))} g of
            protein
          </strong>{' '}
          and a decent portion of rice or another carbohydrate. The old idea of a 30 minute window
          is overstated - what matters is that you eat a proper meal within a couple of hours.
        </p>
        <p className="mt-2 text-sm font-medium">Three affordable options:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          <li>Tofu and egg stir-fry with morning glory and rice - about 40 THB, 44 g protein.</li>
          <li>Grilled pla thu with rice and vegetables - about 42 THB, 48 g protein.</li>
          <li>
            Tuna rice bowl with a boiled egg - about 42 THB, 46 g protein, ready in 7 minutes.
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted">Full recipes and prices are on the Meals page.</p>
      </Card>

      <Card title="Drink">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            Replace what you sweated out. Aim to finish the day at about {plan.waterGoal} litres.
          </li>
          <li>Plain water is enough after a normal indoor session.</li>
          <li>
            After a long, hot, heavy-sweating run, something with salt in it - or salty food with
            your meal - helps more than water alone.
          </li>
          <li>Do not force large amounts of water quickly. Steady is better than fast.</li>
        </ul>
      </Card>

      <Card title="Cooldown" subtitle="Five to ten minutes. Do it before you sit down.">
        <ol className="space-y-2 text-sm">
          {COOLDOWN.map((s, i) => (
            <li key={s.name} className="rounded-[8px] border border-border p-2">
              <p className="font-medium">
                {i + 1}. {s.name} <span className="font-normal text-muted">({s.hold})</span>
              </p>
              <p className="text-muted">{s.detail}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Optional extras">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong>Self-massage:</strong> a tennis ball against a wall on tight shoulders or glutes
            for 30-60 seconds. Uncomfortable is fine, painful is not.
          </li>
          <li>
            <strong>Active recovery:</strong> a 20 minute easy walk on a non-training day does more
            for soreness than complete rest.
          </li>
          <li>
            <strong>Foam rolling:</strong> useful if you have one, not worth buying. It relieves the
            feeling of tightness without changing the tissue.
          </li>
        </ul>
      </Card>

      <Card title="Sleep and stress">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            Sleep is the recovery tool that actually works. Everything else is small in comparison.
          </li>
          <li>Keep your sleep and wake times roughly consistent, including at weekends.</li>
          <li>Give yourself an hour between finishing training and going to bed.</li>
          <li>
            High stress raises how sore and tired a normal session feels. Adjust the plan, not your
            expectations of yourself.
          </li>
        </ul>
      </Card>

      <Card title="Normal soreness">
        <p className="text-sm">
          Muscle soreness after a new exercise is normal. It usually starts 12-24 hours later, peaks
          around 48 hours, spreads across the whole muscle rather than one point, and eases with
          gentle movement. It is worst in the first two weeks and then largely stops happening.
        </p>
        <p className="mt-2 text-sm">
          Being sore is not proof a session worked, and not being sore is not proof it failed.
        </p>
      </Card>

      <Card title="This is different - stop and get it checked" tone="danger">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {WARNING_SIGNS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="mt-3">
          <Notice tone="danger">
            Chest discomfort, fainting, confusion, or serious breathing difficulty is an emergency.
            In Thailand, call <strong>1669</strong>.
          </Notice>
        </div>
      </Card>

      <Card title="Quick post-workout options">
        <ul className="space-y-2 text-sm">
          {EXTRAS.filter((e) => e.timing === 'after').map((e) => (
            <li key={e.id} className="rounded-[8px] border border-border p-2">
              <p className="font-medium">{e.name}</p>
              <p className="text-muted">
                {e.portion} - {e.kcal} kcal, {e.protein_g} g protein, {e.cost_thb} THB
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
