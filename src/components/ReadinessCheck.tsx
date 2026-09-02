import { useState } from 'react';
import { assessReadiness, ACTION_LABELS, type ReadinessInput } from '@/domain/readiness';
import { Button, Card, Field, Notice, Scale, TextInput } from '@/components/ui';
import type { ReadinessAction } from '@/lib/types';

/**
 * The check never changes the workout by itself. It shows what it
 * suggests and why, then waits for the person to choose.
 */
export default function ReadinessCheck({
  onConfirm,
  onCancel,
}: {
  onConfirm: (input: ReadinessInput, action: ReadinessAction) => void;
  onCancel?: () => void;
}) {
  const [input, setInput] = useState<ReadinessInput>({
    sleep_quality: 3,
    energy: 3,
    soreness: 2,
    stress: 3,
    motivation: 3,
    has_pain: false,
    warning_symptom: false,
    minutes_available: 60,
  });
  const [showResult, setShowResult] = useState(false);
  const [painNote, setPainNote] = useState('');

  const result = assessReadiness(input);

  function set<K extends keyof ReadinessInput>(k: K, v: ReadinessInput[K]) {
    setInput((s) => ({ ...s, [k]: v }));
  }

  if (showResult) {
    return (
      <Card
        title={result.headline}
        subtitle={`Readiness score ${result.score} out of 25`}
        tone={result.urgent ? 'danger' : 'plain'}
      >
        <p className="text-sm">{result.reason}</p>

        {result.urgent ? (
          <div className="mt-4 space-y-2">
            <Button
              full
              variant="danger"
              onClick={() => onConfirm({ ...input }, 'stop_seek_advice')}
            >
              I understand - do not train today
            </Button>
            <p className="text-xs text-muted">
              This is recorded in your symptom log so you can show it to a health professional.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm font-medium">What would you like to do?</p>
            <div className="mt-2 space-y-2">
              {(['full', 'reduced', 'short', 'light', 'rest'] as ReadinessAction[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onConfirm({ ...input }, a)}
                  className={`flex min-h-[48px] w-full items-center justify-between rounded-[16px] border px-3 text-left text-sm ${
                    a === result.recommended
                      ? 'border-accent bg-accent-wash font-medium'
                      : 'border-line bg-surface hover:bg-surface-2'
                  }`}
                >
                  <span>{ACTION_LABELS[a]}</span>
                  {a === result.recommended && (
                    <span className="ml-2 shrink-0 text-xs text-accent">Suggested</span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Button variant="ghost" size="sm" onClick={() => setShowResult(false)}>
                Change my answers
              </Button>
            </div>
          </>
        )}
      </Card>
    );
  }

  return (
    <Card title="Before you train" subtitle="Seven quick questions. It takes about 30 seconds.">
      <div className="space-y-4">
        <Field label="How was your sleep?">
          <Scale
            name="Sleep quality"
            value={input.sleep_quality}
            onChange={(v) => set('sleep_quality', v)}
            lowLabel="Terrible"
            highLabel="Excellent"
          />
        </Field>
        <Field label="Energy right now">
          <Scale
            name="Energy"
            value={input.energy}
            onChange={(v) => set('energy', v)}
            lowLabel="Exhausted"
            highLabel="Full of energy"
          />
        </Field>
        <Field label="Muscle soreness">
          <Scale
            name="Soreness"
            value={input.soreness}
            onChange={(v) => set('soreness', v)}
            lowLabel="None"
            highLabel="Very sore"
          />
        </Field>
        <Field label="Stress">
          <Scale
            name="Stress"
            value={input.stress}
            onChange={(v) => set('stress', v)}
            lowLabel="Calm"
            highLabel="Very stressed"
          />
        </Field>
        <Field label="Motivation">
          <Scale
            name="Motivation"
            value={input.motivation}
            onChange={(v) => set('motivation', v)}
            lowLabel="None"
            highLabel="Very motivated"
          />
        </Field>

        <Field label="Time available today (minutes)" htmlFor="mins">
          <TextInput
            id="mins"
            type="number"
            inputMode="numeric"
            min={5}
            max={180}
            value={input.minutes_available}
            onChange={(e) => set('minutes_available', Number(e.target.value))}
          />
        </Field>

        <div className="space-y-2 rounded-[16px] border border-line p-3">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={input.has_pain}
              onChange={(e) => set('has_pain', e.target.checked)}
            />
            <span>I have pain somewhere (not normal muscle soreness)</span>
          </label>
          {input.has_pain && (
            <TextInput
              placeholder="Where does it hurt?"
              value={painNote}
              onChange={(e) => setPainNote(e.target.value)}
            />
          )}

          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={input.warning_symptom}
              onChange={(e) => set('warning_symptom', e.target.checked)}
            />
            <span>
              I have chest discomfort, dizziness, fainting, unusual breathlessness, or a racing
              heart
            </span>
          </label>
        </div>

        {input.warning_symptom && (
          <Notice tone="danger" title="Please read">
            If any of this is happening now, or comes with sweating, nausea, or pain spreading to
            your arm, neck or jaw, stop and call <strong>1669</strong>.
          </Notice>
        )}

        <div className="flex gap-2">
          <Button full onClick={() => setShowResult(true)}>
            See what to do
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
