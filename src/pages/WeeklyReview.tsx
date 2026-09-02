import { useState } from 'react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import {
  Button,
  Card,
  Field,
  Notice,
  Scale,
  SectionHeading,
  Select,
  TextArea,
} from '@/components/ui';
import { addDays, prettyDate, weekStart } from '@/lib/time';
import { sessionsInWeek } from '@/domain/progression';
import type { WeeklyReview as Review } from '@/lib/types';

export default function WeeklyReviewPage() {
  const data = useData();
  const plan = usePlan();
  const thisWeek = weekStart(plan.today);
  const lastWeek = addDays(thisWeek, -7);
  const [week, setWeek] = useState(lastWeek);

  const existing = data.weekly_reviews.find((r) => r.week_start === week);
  const completed = sessionsInWeek(data.workouts, week);

  const [form, setForm] = useState<Review>(
    existing ?? {
      week_start: week,
      workouts_completed: completed.length,
      improved: '',
      had_pain: false,
      energy_recovery: 3,
      sleep_rating: 3,
      hunger_manageable: true,
      meals_affordable: true,
      favourite_meals: '',
      difficulty: 'about_right',
      smallest_adjustment: '',
      applied_change: null,
    },
  );
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Review>(k: K, v: Review[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  /**
   * One change at a time, in priority order. Safety outranks recovery,
   * recovery outranks adherence, adherence outranks progression.
   */
  function buildRecommendation(): { change: string; why: string } {
    if (form.had_pain) {
      return {
        change:
          'Keep the same plan, but swap any exercise that caused pain for its easier alternative.',
        why: 'Pain is the one thing that outranks progress. Nothing else changes until it settles.',
      };
    }
    if ((form.energy_recovery ?? 3) <= 2 || (form.sleep_rating ?? 3) <= 2) {
      return {
        change: 'Repeat this week at the same volume instead of progressing.',
        why: 'Recovery was poor. Adding volume on top of a bad week is how people end up stopping altogether.',
      };
    }
    if (!form.hunger_manageable) {
      return {
        change:
          'Raise your daily calories by about 100 and add more protein and vegetables to meal 1.',
        why: 'Constant hunger means the deficit is too aggressive to keep up. A smaller deficit you can sustain beats a bigger one you cannot.',
      };
    }
    if (!form.meals_affordable) {
      return {
        change: 'Switch two "buy outside" meals to home-cooked options next week.',
        why: 'The home-cooked options cost roughly half as much and hit the protein target more reliably.',
      };
    }
    if ((form.workouts_completed ?? 0) < (data.profile?.training_days_per_week ?? 4) - 1) {
      return {
        change:
          'Drop to three planned sessions a week and use the short workouts when time is tight.',
        why: 'Three sessions you actually complete beats four you plan and miss. You can add the fourth back once three feels easy.',
      };
    }
    if (form.difficulty === 'too_easy') {
      return {
        change:
          'Add one rep per set on the main exercises, or slow the lowering phase to 3 seconds.',
        why: 'You have more capacity than the plan is asking for. Change one variable, not several.',
      };
    }
    if (form.difficulty === 'too_hard') {
      return {
        change: 'Cut one set from each exercise and keep everything else the same.',
        why: 'Reducing volume is the fastest way to bring a session back into a range you recover from.',
      };
    }
    return {
      change: 'Carry on as planned. Aim for one more rep than last time on each exercise.',
      why: 'Everything is in a reasonable place. Small, steady progression is the whole game.',
    };
  }

  function saveReview(applied: string | null) {
    data.upsert('weekly_reviews', { ...form, week_start: week, applied_change: applied });
    if (applied) {
      const version = (data.plan_versions.at(-1)?.version ?? 0) + 1;
      data.upsert('plan_versions', {
        version,
        reason: applied,
        snapshot: {
          week: plan.week,
          target_kcal: plan.effectiveKcal,
          protein_g: plan.targets?.protein_g ?? null,
          training_days: data.profile?.training_days_per_week ?? 4,
        },
        created_at: new Date().toISOString(),
      });
    }
    setSaved(true);
    setPreview(false);
  }

  const rec = buildRecommendation();

  return (
    <div className="space-y-4">
      <SectionHeading sub="Ten questions once a week. This is what keeps the plan honest.">
        Weekly review
      </SectionHeading>

      <Card title="Which week?">
        <Select
          value={week}
          onChange={(e) => {
            setWeek(e.target.value);
            setSaved(false);
          }}
          aria-label="Week to review"
        >
          {[0, 1, 2, 3].map((i) => {
            const w = addDays(thisWeek, -7 * i);
            return (
              <option key={w} value={w}>
                Week of {prettyDate(w)}
                {i === 0 ? ' (this week)' : i === 1 ? ' (last week)' : ''}
              </option>
            );
          })}
        </Select>
        <p className="mt-2 text-sm text-muted">
          Recorded: {completed.length} completed session{completed.length === 1 ? '' : 's'}.
        </p>
      </Card>

      <Card title="How did it go?">
        <Field label="Which exercises improved?">
          <TextArea
            rows={2}
            value={form.improved}
            onChange={(e) => set('improved', e.target.value)}
            placeholder="More reps, better form, felt easier..."
          />
        </Field>

        <label className="mb-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={form.had_pain}
            onChange={(e) => set('had_pain', e.target.checked)}
          />
          <span>I had pain at some point this week</span>
        </label>

        <Field label="Energy and recovery">
          <Scale
            name="Energy and recovery"
            value={form.energy_recovery ?? 3}
            onChange={(v) => set('energy_recovery', v)}
            lowLabel="Drained"
            highLabel="Great"
          />
        </Field>
        <Field label="Sleep">
          <Scale
            name="Sleep"
            value={form.sleep_rating ?? 3}
            onChange={(v) => set('sleep_rating', v)}
            lowLabel="Poor"
            highLabel="Great"
          />
        </Field>

        <label className="mb-2 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={form.hunger_manageable}
            onChange={(e) => set('hunger_manageable', e.target.checked)}
          />
          <span>Hunger was manageable</span>
        </label>
        <label className="mb-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={form.meals_affordable}
            onChange={(e) => set('meals_affordable', e.target.checked)}
          />
          <span>Meals were affordable and available</span>
        </label>

        <Field label="Which meals did you like most?">
          <TextArea
            rows={2}
            value={form.favourite_meals}
            onChange={(e) => set('favourite_meals', e.target.value)}
          />
        </Field>

        <Field label="Was the plan too difficult or too easy?">
          <Select
            value={form.difficulty ?? 'about_right'}
            onChange={(e) => set('difficulty', e.target.value as Review['difficulty'])}
          >
            <option value="too_easy">Too easy</option>
            <option value="about_right">About right</option>
            <option value="too_hard">Too hard</option>
          </Select>
        </Field>

        <Field label="What is the smallest useful change for next week?">
          <TextArea
            rows={2}
            value={form.smallest_adjustment}
            onChange={(e) => set('smallest_adjustment', e.target.value)}
            placeholder="In your own words"
          />
        </Field>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setPreview(true)}>
            See the recommendation
          </Button>
          <Button size="sm" variant="secondary" onClick={() => saveReview(null)}>
            {saved ? 'Saved' : 'Save without changing the plan'}
          </Button>
        </div>
      </Card>

      {preview && (
        <Card title="Recommended change" tone="accent">
          <p className="text-sm font-medium">{rec.change}</p>
          <p className="mt-1 text-sm text-muted">{rec.why}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => saveReview(rec.change)}>
              Apply this change
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setPreview(false)}>
              No thanks
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Applying saves a new plan version, so you can look back at what changed and when.
          </p>
        </Card>
      )}

      {data.plan_versions.length > 0 && (
        <Card title="Plan history" subtitle="Every change is kept, so you can roll back.">
          <ul className="space-y-2 text-sm">
            {[...data.plan_versions]
              .sort((a, b) => b.version - a.version)
              .map((v) => (
                <li key={v.version} className="rounded-[16px] border border-line p-2">
                  <p className="font-medium">Version {v.version}</p>
                  <p className="text-muted">{v.reason}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Target was {String(v.snapshot.target_kcal ?? '-')} kcal,{' '}
                    {String(v.snapshot.protein_g ?? '-')} g protein
                  </p>
                </li>
              ))}
          </ul>
        </Card>
      )}

      <Notice tone="info" title="Why only one change at a time">
        If you change calories, sets and cardio in the same week and things get worse, you will have
        no idea which one caused it. Changing one thing is slower to feel and far faster to learn
        from.
      </Notice>
    </div>
  );
}
