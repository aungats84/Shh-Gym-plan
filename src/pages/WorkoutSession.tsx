import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import ReadinessCheck from '@/components/ReadinessCheck';
import RestTimer from '@/components/RestTimer';
import {
  Button,
  Card,
  Field,
  Notice,
  Pill,
  Scale,
  SectionHeading,
  Select,
  TextArea,
  TextInput,
} from '@/components/ui';
import { DAY_BY_KEY } from '@/data/program';
import { getExercise, MUSCLE_LABELS } from '@/data/exercises';
import {
  buildSetLogs,
  bestSetsByExercise,
  isPersonalRecord,
  progressionAdvice,
} from '@/domain/progression';
import { volumeMultiplier, ACTION_LABELS, type ReadinessInput } from '@/domain/readiness';
import type { ReadinessAction, SetLog, WorkoutSession as Session } from '@/lib/types';

export default function WorkoutSession() {
  const { dayKey = '' } = useParams();
  const data = useData();
  const plan = usePlan();
  const navigate = useNavigate();
  const day = DAY_BY_KEY[dayKey];

  const existing = data.workouts.find(
    (w) => w.date === plan.today && w.day_key === dayKey && w.status !== 'completed',
  );

  const [stage, setStage] = useState<'readiness' | 'session'>(existing ? 'session' : 'readiness');
  const [mode, setMode] = useState<ReadinessAction>(existing?.mode ?? 'full');
  const [sets, setSets] = useState<SetLog[]>(existing?.sets ?? []);
  const [open, setOpen] = useState<string | null>(null);
  const [sessionRpe, setSessionRpe] = useState(5);
  const [difficulty, setDifficulty] = useState<Session['difficulty']>('about_right');
  const [painReported, setPainReported] = useState(false);
  const [painNote, setPainNote] = useState('');
  const [notes, setNotes] = useState('');
  const [substitutions, setSubstitutions] = useState<Record<string, string>>({});

  const previousBest = useMemo(() => bestSetsByExercise(data.workouts), [data.workouts]);

  if (!day) {
    return (
      <div>
        <Notice tone="danger">That workout does not exist.</Notice>
      </div>
    );
  }

  /* ---------------- readiness step ---------------- */
  function handleReadiness(check: ReadinessInput, action: ReadinessAction) {
    data.upsert('readiness_checks', {
      date: plan.today,
      sleep_quality: check.sleep_quality,
      energy: check.energy,
      soreness: check.soreness,
      stress: check.stress,
      motivation: check.motivation,
      has_pain: check.has_pain,
      pain_note: '',
      warning_symptom: check.warning_symptom,
      minutes_available: check.minutes_available,
      recommended: action,
      accepted: action,
    });

    if (check.warning_symptom) {
      data.upsert('symptoms', {
        date: plan.today,
        kind: 'Warning symptom reported at readiness check',
        severity: 5,
        note: 'Chest discomfort, dizziness, fainting, breathlessness or palpitations.',
        during_exercise: false,
        created_at: new Date().toISOString(),
      });
    }

    if (action === 'stop_seek_advice' || action === 'rest') {
      data.upsert('workouts', {
        date: plan.today,
        day_key: dayKey,
        week: plan.week,
        mode: action,
        status: 'skipped',
        sets: [],
        session_rpe: null,
        difficulty: null,
        pain_reported: check.has_pain,
        pain_note: '',
        notes: 'Recovery day taken after the readiness check.',
        duration_minutes: null,
      });
      navigate('/');
      return;
    }

    setMode(action);
    setSets(buildSetLogs(dayKey, plan.week, action === 'short', volumeMultiplier(action)));
    setStage('session');
  }

  /* ---------------- session step ---------------- */
  const grouped = sets.reduce<Record<string, SetLog[]>>((acc, s) => {
    (acc[s.exercise_id] ??= []).push(s);
    return acc;
  }, {});
  const totalSets = sets.length;
  const doneSets = sets.filter((s) => s.done).length;

  function updateSet(exerciseId: string, index: number, patch: Partial<SetLog>) {
    setSets((prev) =>
      prev.map((s) =>
        s.exercise_id === exerciseId && s.set_index === index ? { ...s, ...patch } : s,
      ),
    );
  }

  function finish() {
    data.upsert('workouts', {
      date: plan.today,
      day_key: dayKey,
      week: plan.week,
      mode,
      status: 'completed',
      sets,
      session_rpe: sessionRpe,
      difficulty,
      pain_reported: painReported,
      pain_note: painNote,
      notes,
      duration_minutes: null,
    });
    if (painReported && painNote.trim()) {
      data.upsert('symptoms', {
        date: plan.today,
        kind: 'Pain during exercise',
        severity: 3,
        note: painNote,
        during_exercise: true,
        created_at: new Date().toISOString(),
      });
    }
    navigate('/');
  }

  if (stage === 'readiness') {
    return (
      <div className="space-y-4">
        <SectionHeading sub={day.focus}>{day.name}</SectionHeading>
        <ReadinessCheck onConfirm={handleReadiness} onCancel={() => navigate('/workouts')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeading sub={`${ACTION_LABELS[mode]} - ${doneSets} of ${totalSets} sets done`}>
        {day.name}
      </SectionHeading>

      {mode !== 'full' && (
        <Notice tone="info" title="Adjusted session">
          You chose &quot;{ACTION_LABELS[mode]}&quot; after the readiness check, so the set count
          below is lower than the written plan. That was your choice, not an automatic change.
        </Notice>
      )}

      {Object.entries(grouped).map(([exerciseId, rows]) => {
        const ex = getExercise(exerciseId);
        const planned = (mode === 'short' ? day.short : day.main).find(
          (p) => p.exercise_id === exerciseId,
        );
        const best = previousBest[exerciseId];
        const lastDone = rows.filter((r) => r.done).at(-1);
        const advice = progressionAdvice(
          rows[0]?.target_reps ?? '10-12',
          best?.reps ?? null,
          lastDone?.rir ?? null,
          Boolean(data.profile?.equipment.includes('backpack')) ||
            ex.primary.some((m) => m === 'glutes' || m === 'quads'),
        );
        const isOpen = open === exerciseId;

        return (
          <Card
            key={exerciseId}
            title={substitutions[exerciseId] || ex.name}
            subtitle={`${ex.primary.map((m) => MUSCLE_LABELS[m]).join(', ')}${
              planned?.per_side ? ' - each side' : ''
            }`}
            action={
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : exerciseId)}
                aria-expanded={isOpen}
                className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-border"
                aria-label={isOpen ? 'Hide details' : 'Show details'}
              >
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            }
          >
            {planned?.note && <p className="mb-2 text-sm text-muted">{planned.note}</p>}
            {best && (
              <p className="mb-2 text-xs text-muted">
                Last time: {best.reps} reps at {best.weight_kg} kg ({best.date})
              </p>
            )}

            <div className="space-y-2">
              {rows.map((row) => {
                const pr = isPersonalRecord(row, best);
                return (
                  <div
                    key={row.set_index}
                    className="flex flex-wrap items-center gap-2 rounded-[8px] border border-border p-2"
                  >
                    <span className="w-12 shrink-0 text-xs text-muted">
                      Set {row.set_index + 1}
                    </span>
                    <span className="w-16 shrink-0 text-xs text-muted">{row.target_reps}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="reps"
                      aria-label={`Reps for set ${row.set_index + 1}`}
                      value={row.reps ?? ''}
                      onChange={(e) =>
                        updateSet(exerciseId, row.set_index, {
                          reps: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-11 w-16 rounded-[8px] border border-border bg-surface px-2 text-sm"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      placeholder="kg"
                      aria-label={`Weight for set ${row.set_index + 1}`}
                      value={row.weight_kg ?? ''}
                      onChange={(e) =>
                        updateSet(exerciseId, row.set_index, {
                          weight_kg: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-11 w-16 rounded-[8px] border border-border bg-surface px-2 text-sm"
                    />
                    <select
                      aria-label={`Reps in reserve for set ${row.set_index + 1}`}
                      value={row.rir ?? ''}
                      onChange={(e) =>
                        updateSet(exerciseId, row.set_index, {
                          rir: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="h-11 w-20 rounded-[8px] border border-border bg-surface px-1 text-sm"
                    >
                      <option value="">RIR</option>
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} left
                        </option>
                      ))}
                    </select>
                    {pr && (
                      <span className="flex items-center gap-1 text-xs text-good">
                        <Award className="h-3.5 w-3.5" aria-hidden /> Best yet
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => updateSet(exerciseId, row.set_index, { done: !row.done })}
                      aria-pressed={row.done}
                      className={`ml-auto h-11 shrink-0 rounded-[8px] border px-3 text-sm font-medium ${
                        row.done ? 'border-good bg-good text-white' : 'border-border bg-surface'
                      }`}
                    >
                      {row.done ? 'Done' : 'Mark done'}
                    </button>
                  </div>
                );
              })}
            </div>

            {planned && (
              <div className="mt-3">
                <RestTimer seconds={planned.rest_seconds} />
              </div>
            )}

            <div className="mt-3 rounded-[8px] border border-border bg-surface-2 p-3 text-sm">
              <p className="font-medium">{advice.headline}</p>
              <p className="mt-0.5 text-muted">{advice.detail}</p>
            </div>

            {isOpen && (
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="font-medium">Form cues</p>
                  <ul className="mt-1 list-disc pl-5">
                    {ex.cues.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Common mistakes</p>
                  <ul className="mt-1 list-disc pl-5">
                    {ex.mistakes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <p>
                  <span className="font-medium">Breathing:</span> {ex.breathing}
                </p>
                <p>
                  <span className="font-medium">Starting weight:</span> {ex.starting_load}
                </p>
                <p>
                  <span className="font-medium">Easier:</span> {ex.easier}
                </p>
                <p>
                  <span className="font-medium">Harder:</span> {ex.harder}
                </p>
                <Field label="Swap this exercise">
                  <Select
                    value={substitutions[exerciseId] ?? ''}
                    onChange={(e) =>
                      setSubstitutions((s) => ({ ...s, [exerciseId]: e.target.value }))
                    }
                  >
                    <option value="">Keep {ex.name}</option>
                    {ex.substitutions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
                <p className="text-xs text-muted">
                  Tutorial: search YouTube for &quot;{ex.tutorial.search_phrase}&quot;. This site
                  does not link a specific video because it has not checked one for you.
                </p>
              </div>
            )}
          </Card>
        );
      })}

      <Card title="Finish the session">
        <Field label="How hard was the whole session? (1 easy, 10 maximum)">
          <Scale
            name="Session effort"
            value={Math.min(5, Math.round(sessionRpe / 2))}
            onChange={(v) => setSessionRpe(v * 2)}
            lowLabel="Very easy"
            highLabel="Maximum"
          />
        </Field>
        <Field label="Overall difficulty">
          <Select
            value={difficulty ?? 'about_right'}
            onChange={(e) => setDifficulty(e.target.value as Session['difficulty'])}
          >
            <option value="too_easy">Too easy</option>
            <option value="about_right">About right</option>
            <option value="too_hard">Too hard</option>
          </Select>
        </Field>

        <label className="mb-2 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={painReported}
            onChange={(e) => setPainReported(e.target.checked)}
          />
          <span>I had pain or discomfort during this session</span>
        </label>
        {painReported && (
          <>
            <Field label="What and where?">
              <TextInput value={painNote} onChange={(e) => setPainNote(e.target.value)} />
            </Field>
            <div className="mb-3">
              <Notice tone="warn">
                Normal muscle soreness is dull, spread out, and settles in a couple of days. Sharp
                pain, joint pain that gets worse, swelling, numbness or weakness is different - stop
                loading that area and get it looked at if it does not settle.
              </Notice>
            </div>
          </>
        )}

        <Field label="Anything else worth remembering?">
          <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div className="flex gap-2">
          <Button full onClick={finish}>
            Save workout
          </Button>
          <Button variant="secondary" onClick={() => navigate('/workouts')}>
            Cancel
          </Button>
        </div>
        {doneSets === 0 && (
          <p className="mt-2 text-xs text-muted">
            Nothing is marked done yet. You can still save - a partly finished session counts for
            more than a skipped one.
          </p>
        )}
      </Card>

      <Pill tone="accent">Cooldown stretches are on the Recovery page</Pill>
    </div>
  );
}
