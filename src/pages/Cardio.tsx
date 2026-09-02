import { useState } from 'react';
import { Check, Footprints, Home, MoreHorizontal, Wind, X } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import {
  Button,
  Card,
  Detail,
  Empty,
  Notice,
  Pill,
  ScrollX,
  SectionHeading,
  TextInput,
} from '@/components/ui';
import { CARDIO_PLAN, INDOOR_CARDIO, SITTING_BREAK_NOTE, TALK_TEST } from '@/domain/cardio';
import { stepGoalForWeek } from '@/domain/nutrition';
import { prettyDate, todayISO, weekStart } from '@/lib/time';
import type { CardioSession } from '@/lib/types';

const KINDS: { id: CardioSession['kind']; label: string; Icon: typeof Footprints }[] = [
  { id: 'walk', label: 'Walk', Icon: Footprints },
  { id: 'run', label: 'Run', Icon: Wind },
  { id: 'indoor', label: 'Indoor', Icon: Home },
  { id: 'other', label: 'Other', Icon: MoreHorizontal },
];

const EFFORTS: { id: CardioSession['effort']; label: string; hint: string }[] = [
  { id: 'easy', label: 'Easy', hint: 'Can hold a full conversation.' },
  { id: 'moderate', label: 'Moderate', hint: 'Short sentences only.' },
  { id: 'hard', label: 'Hard', hint: 'A few words at a time.' },
];

const MINUTE_CHIPS = [10, 15, 20, 30, 45, 60];

export default function Cardio() {
  const { profile, cardio_sessions, upsert, remove } = useData();
  const plan = usePlan();
  const baseline = profile?.baseline_steps ?? 3000;

  const [kind, setKind] = useState<CardioSession['kind']>('walk');
  const [minutes, setMinutes] = useState(30);
  const [effort, setEffort] = useState<CardioSession['effort']>('easy');
  const [note, setNote] = useState('');

  const today = todayISO();
  const ws = weekStart(today);
  const sessions = [...(cardio_sessions ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const week = sessions.filter((s) => s.date >= ws);
  const runsThisWeek = week.filter((s) => s.kind === 'run').length;
  const minutesThisWeek = week.reduce((n, s) => n + s.minutes, 0);
  const runTarget = plan.cardio.runs;

  function logCardio() {
    upsert('cardio_sessions', {
      date: today,
      kind,
      minutes,
      effort,
      note: note.trim() || undefined,
      created_at: new Date().toISOString(),
    });
    setNote('');
  }

  const kindLabel = (k: CardioSession['kind']) => KINDS.find((x) => x.id === k)?.label ?? k;

  return (
    <div className="space-y-4">
      <SectionHeading sub="Log a walk or a run, and see the week add up.">
        Cardio &amp; movement
      </SectionHeading>

      {/* ---------------- this week, at a glance ---------------- */}
      <Card>
        <p className="label-caps text-[10.5px] text-accent">This week</p>
        <p className="mt-1.5 font-serif text-[24px] font-semibold leading-tight sm:text-[28px]">
          {runTarget === 0
            ? 'Walking only — no runs yet'
            : `${runTarget} run${runTarget > 1 ? 's' : ''} · about ${plan.cardio.minutes} min each`}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{plan.cardio.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[16px] border border-line bg-surface-2 p-3 text-center">
            <p className="font-serif text-[22px] font-semibold leading-none tabular-nums text-accent-2">
              {runsThisWeek}
              {runTarget > 0 && <span className="text-[15px] text-faint"> / {runTarget}</span>}
            </p>
            <p className="label-caps mt-1.5 text-[9px] text-faint">Runs</p>
          </div>
          <div className="rounded-[16px] border border-line bg-surface-2 p-3 text-center">
            <p className="font-serif text-[22px] font-semibold leading-none tabular-nums">
              {minutesThisWeek}
            </p>
            <p className="label-caps mt-1.5 text-[9px] text-faint">Minutes</p>
          </div>
          <div className="rounded-[16px] border border-line bg-surface-2 p-3 text-center">
            <p className="font-serif text-[22px] font-semibold leading-none tabular-nums">
              {(plan.stepGoal / 1000).toFixed(0)}k
            </p>
            <p className="label-caps mt-1.5 text-[9px] text-faint">Step goal</p>
          </div>
        </div>
      </Card>

      {/* ---------------- log a session ---------------- */}
      <Card title="Log a session">
        <p className="label-caps mb-2 text-[10px] text-faint">Type</p>
        <div className="grid grid-cols-4 gap-2">
          {KINDS.map(({ id, label, Icon }) => {
            const on = kind === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setKind(id)}
                aria-pressed={on}
                className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-[16px] border text-[12px] font-semibold transition-colors active:scale-95 ${
                  on
                    ? 'border-accent bg-accent-wash text-accent'
                    : 'border-line bg-surface-2 text-muted hover:border-accent/40'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        <p className="label-caps mb-2 mt-4 text-[10px] text-faint">Minutes</p>
        <div className="flex flex-wrap gap-2">
          {MINUTE_CHIPS.map((m) => {
            const on = minutes === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                aria-pressed={on}
                className={`min-h-[40px] min-w-[52px] rounded-full border px-3 text-[14px] font-semibold tabular-nums transition-colors active:scale-95 ${
                  on
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-line bg-surface-2 text-muted hover:border-accent/40'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        <p className="label-caps mb-2 mt-4 text-[10px] text-faint">How hard was it?</p>
        <div className="grid grid-cols-3 gap-2">
          {EFFORTS.map((e) => {
            const on = effort === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setEffort(e.id)}
                aria-pressed={on}
                className={`min-h-[44px] rounded-[16px] border text-[13px] font-semibold transition-colors active:scale-95 ${
                  on
                    ? 'border-accent bg-accent-wash text-accent'
                    : 'border-line bg-surface-2 text-muted hover:border-accent/40'
                }`}
              >
                {e.label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[12px] text-faint">
          {EFFORTS.find((e) => e.id === effort)?.hint}
        </p>

        <div className="mt-4">
          <TextInput
            aria-label="Note (optional)"
            placeholder="Note (optional) — where, how it felt…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <Button full onClick={logCardio}>
            <Check className="h-4 w-4" aria-hidden />
            Log {minutes} min {kindLabel(kind).toLowerCase()}
          </Button>
        </div>
      </Card>

      {/* ---------------- history ---------------- */}
      <Card
        title="Recent sessions"
        subtitle={week.length > 0 ? `${week.length} this week` : undefined}
      >
        {sessions.length === 0 ? (
          <Empty
            title="Nothing logged yet"
            detail="Log your first walk or run above — even a 10-minute walk counts."
          />
        ) : (
          <ul className="divide-y divide-line/70">
            {sessions.slice(0, 12).map((s) => (
              <li key={`${s.date}|${s.created_at}`} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-accent-wash text-accent">
                  {(() => {
                    const I = KINDS.find((k) => k.id === s.kind)?.Icon ?? Footprints;
                    return <I className="h-[17px] w-[17px]" aria-hidden />;
                  })()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">
                    {s.minutes} min {kindLabel(s.kind).toLowerCase()}
                  </span>
                  <span className="block text-[12px] text-muted">
                    {prettyDate(s.date)} · {s.effort}
                    {s.note ? ` · ${s.note}` : ''}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove('cardio_sessions', `${s.date}|${s.created_at}`)}
                  aria-label="Remove session"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-faint transition-colors hover:border-alert/40 hover:text-alert"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ---------------- guidance, short by default ---------------- */}
      <Card title="Cardio guide" subtitle="Open only what you need.">
        <div className="space-y-1">
          <Detail label="How hard should it feel?">
            <ul className="space-y-2">
              {TALK_TEST.map((t) => (
                <li key={t.level}>
                  <strong className="text-text">{t.level}.</strong> {t.detail}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Nearly all of your running should be easy. Running easy feels too slow and works
              better than it looks.
            </p>
          </Detail>

          <Detail label="Why running waits until week 3">
            You are starting from about {baseline.toLocaleString()} steps a day. Adding four
            strength sessions and running at once is how people end up with sore shins and a plan
            they abandon. Walking first, running third week, builds the same fitness without the
            injury risk.
          </Detail>

          <Detail label="The 9-week build-up">
            <ScrollX>
              <table className="w-full min-w-[380px] text-[13px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] text-muted">
                    <th className="py-1.5 pr-3 font-medium">Week</th>
                    <th className="py-1.5 pr-3 font-medium">Runs</th>
                    <th className="py-1.5 pr-3 font-medium">Min</th>
                    <th className="py-1.5 pr-3 font-medium">Steps/day</th>
                  </tr>
                </thead>
                <tbody>
                  {CARDIO_PLAN.map((w) => (
                    <tr
                      key={w.week}
                      className={`border-b border-line/60 last:border-0 ${
                        w.week === plan.week ? 'font-semibold text-accent' : ''
                      }`}
                    >
                      <td className="py-1.5 pr-3">
                        {w.week} {w.week === plan.week && <Pill tone="accent">Now</Pill>}
                      </td>
                      <td className="py-1.5 pr-3 tabular-nums">{w.runs}</td>
                      <td className="py-1.5 pr-3 tabular-nums">{w.minutes || '–'}</td>
                      <td className="py-1.5 tabular-nums">
                        {stepGoalForWeek(baseline, w.week).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollX>
          </Detail>

          <Detail label="Fitting cardio around strength">
            <ul className="list-disc space-y-1 pl-4">
              <li>Strength keeps muscle while you lose fat — it comes first.</li>
              <li>Run on a non-training day, or after weights rather than before.</li>
              <li>Leave a day between a run and a lower-body session if you can.</li>
              <li>More cardio is not better here while you are eating less.</li>
              <li>Walking is the exception — it barely costs recovery and adds up.</li>
            </ul>
          </Detail>

          <Detail label="Rain or heat? Swap indoors">
            <ul className="space-y-2">
              {INDOOR_CARDIO.map((c) => (
                <li key={c.name}>
                  <strong className="text-text">{c.name}.</strong> {c.detail}
                </li>
              ))}
            </ul>
          </Detail>

          <Detail label="Get out of the chair">
            <p>{SITTING_BREAK_NOTE}</p>
            <p className="mt-2">
              A hybrid office job means long unbroken sitting on desk days. Standing every hour is
              its own health target, separate from your workouts.
            </p>
          </Detail>
        </div>
      </Card>

      {runsThisWeek === 0 && runTarget > 0 && (
        <Notice tone="info">
          No runs logged this week yet. Even one easy {plan.cardio.minutes}-minute run keeps the
          build-up on track.
        </Notice>
      )}
    </div>
  );
}
