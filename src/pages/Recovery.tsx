import { useState } from 'react';
import { AlertTriangle, Check, Phone } from 'lucide-react';
import { Card, Detail, Notice, PageTitle } from '@/components/ui';
import VideoLink from '@/components/VideoLink';
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

  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (k: string) =>
    setDone((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const items = [
    { k: 'cool', label: 'Cooled down for 5 minutes' },
    { k: 'eat', label: `Eat ${perMeal} g protein and rice within a couple of hours` },
    { k: 'water', label: 'Finish your water' },
    { k: 'sleep', label: 'Plan an early-enough night' },
  ];

  return (
    <div className="space-y-4">
      <PageTitle sub="The hour after you finish.">After training</PageTitle>

      {/* ---------------- the wind-down checklist ---------------- */}
      <Card title="After you finish" subtitle="Tick these off.">
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

      {/* ---------------- the cooldown itself ---------------- */}
      <Card title="5-minute cooldown" eyebrow="Before you sit down">
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
        <div className="mt-3">
          <p className="label-caps mb-2 text-[10px] text-faint">Watch how</p>
          <VideoLink
            exerciseName="a 5-minute cooldown"
            searchPhrase="5 minute cool down stretch after workout"
          />
        </div>
      </Card>

      {/* ---------------- safety: never folded away ---------------- */}
      <Card title="Stop and check — not normal soreness" tone="alert">
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

      {/* ---------------- the reading, folded away ---------------- */}
      <Card title="Good to know" subtitle="Open only what you need.">
        <div className="space-y-1">
          <Detail label="Cheap recovery meals that hit the protein">
            <ul className="space-y-1.5">
              <li>Tofu and egg stir-fry with morning glory — 40 ฿, 44 g</li>
              <li>Grilled pla thu with rice and veg — 42 ฿, 48 g</li>
              <li>Tuna rice bowl with an egg — 42 ฿, 46 g, 7 minutes</li>
            </ul>
            <p className="mt-2 text-muted">
              There is no strict 30-minute window — a proper meal within a couple of hours is what
              matters.
            </p>
          </Detail>

          <Detail label="Is this soreness normal?">
            Normal soreness starts 12–24 hours later, peaks around 48, spreads across the whole
            muscle, and eases with gentle movement. It is worst in the first two weeks, then mostly
            stops. Being sore is not proof a session worked, and not being sore is not proof it
            failed.
          </Detail>

          <Detail label="What actually helps recovery">
            <ul className="list-disc space-y-1 pl-4">
              <li>
                <strong className="text-text">Sleep.</strong> Everything else is small next to it.
              </li>
              <li>
                <strong className="text-text">An easy 20-minute walk</strong> on a rest day does
                more for soreness than complete rest.
              </li>
              <li>
                <strong className="text-text">A tennis ball</strong> against a wall on tight glutes
                or shoulders, 30–60 seconds. Uncomfortable is fine, painful is not.
              </li>
              <li>Foam rolling is fine if you own one, not worth buying.</li>
            </ul>
          </Detail>
        </div>
      </Card>
    </div>
  );
}
