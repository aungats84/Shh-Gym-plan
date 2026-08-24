import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import { Card, Notice, Pill, ScrollX, SectionHeading } from '@/components/ui';
import { CARDIO_PLAN, INDOOR_CARDIO, SITTING_BREAK_NOTE, TALK_TEST } from '@/domain/cardio';
import { stepGoalForWeek } from '@/domain/nutrition';

export default function Cardio() {
  const { profile } = useData();
  const plan = usePlan();
  const baseline = profile?.baseline_steps ?? 3000;

  return (
    <div className="space-y-4">
      <SectionHeading sub="Running, walking, and getting out of the chair.">
        Cardio and daily movement
      </SectionHeading>

      <Card title="This week" tone="accent">
        <p className="text-sm">
          <strong>
            {plan.cardio.runs === 0
              ? 'No runs yet - walking only'
              : `${plan.cardio.runs} run${plan.cardio.runs > 1 ? 's' : ''} of about ${plan.cardio.minutes} minutes`}
          </strong>
        </p>
        <p className="mt-1 text-sm text-muted">{plan.cardio.description}</p>
        <p className="mt-2 text-sm">
          Step goal: <strong>{plan.stepGoal.toLocaleString()} a day</strong>
        </p>
      </Card>

      <Notice tone="info" title="Why running starts in week 3">
        You are starting from about {baseline.toLocaleString()} steps a day. Adding four strength
        sessions and running at the same time is how people end up with sore shins and a plan they
        abandon. Walking first, running third week, builds the same fitness without the injury risk.
      </Notice>

      <Card title="The running build-up">
        <ScrollX>
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-1.5 pr-3 font-medium">Week</th>
                <th className="py-1.5 pr-3 font-medium">Runs</th>
                <th className="py-1.5 pr-3 font-medium">Minutes</th>
                <th className="py-1.5 pr-3 font-medium">Steps/day</th>
                <th className="py-1.5 font-medium">How</th>
              </tr>
            </thead>
            <tbody>
              {CARDIO_PLAN.map((w) => (
                <tr
                  key={w.week}
                  className={`border-b border-border last:border-0 ${w.week === plan.week ? 'bg-accent-soft' : ''}`}
                >
                  <td className="py-1.5 pr-3">
                    {w.week} {w.week === plan.week && <Pill tone="accent">Now</Pill>}
                  </td>
                  <td className="py-1.5 pr-3 tabular-nums">{w.runs}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{w.minutes || '-'}</td>
                  <td className="py-1.5 pr-3 tabular-nums">
                    {stepGoalForWeek(baseline, w.week).toLocaleString()}
                  </td>
                  <td className="py-1.5 text-muted">{w.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollX>
      </Card>

      <Card
        title="How hard should it feel?"
        subtitle="The talk test needs no watch and no heart rate monitor."
      >
        <ul className="space-y-2 text-sm">
          {TALK_TEST.map((t) => (
            <li key={t.level} className="rounded-[8px] border border-border p-2">
              <p className="font-medium">{t.level}</p>
              <p className="text-muted">{t.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">
          Nearly all of your running should be in the easy band. Running easy feels too slow and
          works better than it looks.
        </p>
      </Card>

      <Card title="Balancing cardio with the strength work">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Strength training is what keeps muscle while you lose fat. It comes first.</li>
          <li>Run on a non-training day, or after the weights rather than before them.</li>
          <li>Leave a day between a run and a lower body session if you can.</li>
          <li>
            More cardio is not better here. Adding an hour of running while eating less is how
            recovery falls apart.
          </li>
          <li>Walking is the exception - it barely costs recovery and adds up quickly.</li>
        </ul>
      </Card>

      <Card
        title="Rain and heat swaps"
        subtitle="You said weather is a reason sessions get missed. These remove the excuse."
      >
        <ul className="space-y-2 text-sm">
          {INDOOR_CARDIO.map((c) => (
            <li key={c.name} className="rounded-[8px] border border-border p-2">
              <p className="font-medium">{c.name}</p>
              <p className="text-muted">{c.detail}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Sitting" tone="warn">
        <p className="text-sm">{SITTING_BREAK_NOTE}</p>
        <p className="mt-2 text-sm">
          A hybrid office job means long unbroken sitting on desk days. Standing up every hour is a
          separate health target from your workouts, and it is worth its own attention.
        </p>
      </Card>
    </div>
  );
}
