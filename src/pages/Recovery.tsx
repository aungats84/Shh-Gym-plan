import { AlertTriangle, Phone } from 'lucide-react';
import { Card, Detail, Notice, PageTitle } from '@/components/ui';
import { COOLDOWN } from '@/data/program';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';

const RED_FLAGS = [
  'Sharp or stabbing pain during a movement',
  'Joint pain getting worse session by session',
  'Swelling around a joint',
  'Numbness, pins and needles, or weakness',
  'Very dark urine after unusually hard exercise',
  'Dizziness, fainting, or chest discomfort',
  'Confusion or unusual difficulty breathing',
];

export default function Recovery() {
  const { profile } = useData();
  const plan = usePlan();
  const perMeal = Math.round((plan.targets?.protein_g ?? 100) / (profile?.meals_per_day ?? 2));

  return (
    <div className="space-y-4">
      <PageTitle sub="The hour after you finish.">After training</PageTitle>

      <Card title="Eat" eyebrow="Within a couple of hours" tone="accent">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-[26px] font-bold">{perMeal} g</span>
          <span className="text-[13.5px] text-muted">protein, plus rice</span>
        </p>
        <p className="mt-2 text-[13px] text-muted">
          Your evening meal is the recovery meal. Three cheap options that hit it:
        </p>
        <ul className="mt-2 space-y-1.5 text-[13px]">
          <li>Tofu and egg stir-fry with morning glory — 40 ฿, 44 g</li>
          <li>Grilled pla thu with rice and veg — 42 ฿, 48 g</li>
          <li>Tuna rice bowl with an egg — 42 ฿, 46 g, 7 minutes</li>
        </ul>
        <Detail label="Is there a 30-minute window?">
          Not really — that idea is overstated. A proper meal within a couple of hours is what
          matters. Plain water is enough to rehydrate after a normal indoor session; after a long
          hot run, salty food with the meal does more than water alone.
        </Detail>
      </Card>

      <Card title="Cooldown" eyebrow="5 minutes, before you sit down">
        <ol className="space-y-2.5 text-[13.5px]">
          {COOLDOWN.map((s, i) => (
            <li key={s.name} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-wash text-[11px] font-bold text-accent">
                {i + 1}
              </span>
              <span>
                <strong>{s.name}</strong> <span className="text-faint">— {s.hold}</span>
                <br />
                <span className="text-muted">{s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Soreness is normal" eyebrow="What to expect">
        <p className="text-[13.5px]">
          Starts 12–24 hours later, peaks around 48, spreads across the whole muscle, eases with
          gentle movement. Worst in the first two weeks, then it mostly stops.
        </p>
        <p className="mt-2 text-[13px] text-muted">
          Being sore isn&apos;t proof a session worked. Not being sore isn&apos;t proof it failed.
        </p>
        <Detail label="What actually helps recovery">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong className="text-text">Sleep.</strong> Everything else is small next to it.
            </li>
            <li>
              <strong className="text-text">An easy 20-minute walk</strong> on a rest day does more
              for soreness than complete rest.
            </li>
            <li>
              <strong className="text-text">A tennis ball</strong> against a wall on tight glutes or
              shoulders, 30–60 seconds. Uncomfortable is fine, painful is not.
            </li>
            <li>
              Foam rolling is fine if you own one, not worth buying. It relieves the feeling of
              tightness without changing the tissue.
            </li>
          </ul>
        </Detail>
      </Card>

      <Card title="This is not normal soreness" tone="alert">
        <ul className="space-y-1.5 text-[13.5px]">
          {RED_FLAGS.map((f) => (
            <li key={f} className="flex gap-2.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-alert" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <Notice tone="alert">
            <Phone className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            Chest discomfort, fainting, confusion or serious breathing trouble is an emergency. In
            Thailand call <strong>1669</strong>.
          </Notice>
        </div>
      </Card>
    </div>
  );
}
