import { useState } from 'react';
import { useData } from '@/state/DataContext';
import { Button, Card, Field, Notice, Select, TextInput } from '@/components/ui';
import { computeTargets } from '@/domain/nutrition';
import { todayISO } from '@/lib/time';
import type { Profile, Sex } from '@/lib/types';

/**
 * Sensible starting values taken from the planning interview.
 * Everything is editable, and Settings can change all of it later.
 */
const DEFAULTS: Omit<Profile, 'user_id'> = {
  display_name: '',
  age: 23,
  sex: 'female',
  height_cm: 152,
  weight_kg: 52,
  waist_cm: 63.5,
  units: 'metric',
  area: 'Rangsit',
  goals: ['fat_loss', 'recomposition'],
  priority_muscles: ['arms', 'glutes'],
  timeline_weeks: 9,
  experience: 'returning',
  intensity: 'moderate',
  training_days_per_week: 4,
  session_minutes: 60,
  preferred_time: 'evening',
  flexible_schedule: true,
  equipment: ['dumbbells', 'mat', 'furniture'],
  dumbbell_kg: 2,
  can_buy_equipment: false,
  baseline_steps: 3000,
  enjoys: ['running'],
  dislikes: [],
  budget_thb_per_day: 100,
  meals_per_day: 2,
  allows_snacks: false,
  cooking_skill: 'confident',
  kitchen: ['fridge', 'stove', 'rice cooker'],
  batch_cooks: false,
  dietary_notes: [],
  allergies: [],
  tracking_style: 'numbers',
  baseline_water_l: 1,
  bedtime: '03:00',
  waketime: '12:00',
  trains_outdoors: true,
  has_aircon: true,
  heat_tolerance: 'average',
  parq_confirmed_at: null,
  parq_flagged_yes: false,
  doctor_restrictions: null,
  theme: 'light',
  track_cycle: false,
};

export default function Onboarding() {
  const { saveProfile } = useData();
  const [form, setForm] = useState(DEFAULTS);
  const [error, setError] = useState<string | null>(null);

  const preview = computeTargets({ ...form, user_id: 'local' } as Profile);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.age || form.age < 13) {
      setError('Please enter an age of 13 or above. This site is not designed for children.');
      return;
    }
    if (!form.height_cm || !form.weight_kg) {
      setError('Height and weight are needed to work out your calorie and protein targets.');
      return;
    }
    saveProfile({
      ...form,
      user_id: 'local',
      plan_start_date: todayISO(),
    } as Partial<Profile>);
  }

  return (
    <div className="safe-x mx-auto max-w-2xl p-4 pb-16">
      <h1 className="text-xl font-semibold sm:text-2xl">Set up your plan</h1>
      <p className="mt-1 text-sm text-muted">
        These answers set your calorie, protein and training targets. Everything can be changed
        later in Settings. Nothing is sent anywhere - it is saved on this device only.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <Card title="About you">
          <Field label="Name (optional)" htmlFor="name">
            <TextInput
              id="name"
              value={form.display_name}
              onChange={(e) => set('display_name', e.target.value)}
              placeholder="What should the site call you?"
            />
          </Field>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Age" htmlFor="age">
              <TextInput
                id="age"
                type="number"
                inputMode="numeric"
                min={13}
                max={100}
                value={form.age}
                onChange={(e) => set('age', Number(e.target.value))}
              />
            </Field>
            <Field label="Sex" htmlFor="sex" hint="Used only for the calorie estimate.">
              <Select id="sex" value={form.sex} onChange={(e) => set('sex', e.target.value as Sex)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="unspecified">Prefer not to say</option>
              </Select>
            </Field>
            <Field label="Height (cm)" htmlFor="height">
              <TextInput
                id="height"
                type="number"
                inputMode="decimal"
                value={form.height_cm}
                onChange={(e) => set('height_cm', Number(e.target.value))}
              />
            </Field>
            <Field label="Weight (kg)" htmlFor="weight">
              <TextInput
                id="weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => set('weight_kg', Number(e.target.value))}
              />
            </Field>
            <Field
              label="Waist (cm, optional)"
              htmlFor="waist"
              hint="Measure at the navel each time."
            >
              <TextInput
                id="waist"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form.waist_cm ?? ''}
                onChange={(e) => set('waist_cm', e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field label="Area of Bangkok" htmlFor="area" hint="Only used for food suggestions.">
              <TextInput
                id="area"
                value={form.area}
                onChange={(e) => set('area', e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Your goal">
          <Field label="Main goal" htmlFor="goal">
            <Select
              id="goal"
              value={form.goals[0]}
              onChange={(e) =>
                set('goals', [e.target.value, ...form.goals.slice(1)] as Profile['goals'])
              }
            >
              <option value="fat_loss">Lose fat</option>
              <option value="recomposition">Body recomposition</option>
              <option value="muscle_gain">Gain muscle</option>
              <option value="stamina">Improve stamina</option>
              <option value="general_health">General health</option>
            </Select>
          </Field>
          <Field label="Current daily steps" htmlFor="steps" hint="A rough number is fine.">
            <TextInput
              id="steps"
              type="number"
              inputMode="numeric"
              value={form.baseline_steps}
              onChange={(e) => set('baseline_steps', Number(e.target.value))}
            />
          </Field>
          <Field label="Training days per week" htmlFor="days">
            <Select
              id="days"
              value={form.training_days_per_week}
              onChange={(e) => set('training_days_per_week', Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} days
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        <Card title="Food" subtitle="Used for the meal plan and shopping list.">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Daily food budget (THB)" htmlFor="budget">
              <TextInput
                id="budget"
                type="number"
                inputMode="numeric"
                value={form.budget_thb_per_day}
                onChange={(e) => set('budget_thb_per_day', Number(e.target.value))}
              />
            </Field>
            <Field label="Meals per day" htmlFor="meals">
              <Select
                id="meals"
                value={form.meals_per_day}
                onChange={(e) => set('meals_per_day', Number(e.target.value))}
              >
                {[2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} meals
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Water you drink now (litres)" htmlFor="water">
              <TextInput
                id="water"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form.baseline_water_l}
                onChange={(e) => set('baseline_water_l', Number(e.target.value))}
              />
            </Field>
            <Field label="Bedtime" htmlFor="bed">
              <TextInput
                id="bed"
                type="time"
                value={form.bedtime}
                onChange={(e) => set('bedtime', e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Your starting targets" tone="accent">
          <ul className="space-y-1 text-sm">
            <li>
              Estimated maintenance: <strong>{preview.maintenance} kcal</strong> per day
            </li>
            <li>
              Daily target: <strong>{preview.target_kcal} kcal</strong>
            </li>
            <li>
              Protein: <strong>{preview.protein_g} g</strong>, carbs {preview.carbs_g} g, fat{' '}
              {preview.fat_g} g, fibre {preview.fiber_g} g
            </li>
            <li>
              Expected pace:{' '}
              <strong>about {preview.expected_weekly_change_kg.toFixed(2)} kg per week</strong>
            </li>
          </ul>
          {preview.floored && (
            <div className="mt-3">
              <Notice tone="warn">
                The calculation wanted to go lower, but the site will not target below{' '}
                {preview.target_kcal} kcal. Losing weight more slowly with enough food works better
                and is safer.
              </Notice>
            </div>
          )}
        </Card>

        <Notice tone="warn" title="Before your first workout">
          Complete the free PAR-Q+ questionnaire at{' '}
          <a className="underline" href="https://eparmedx.com/" target="_blank" rel="noreferrer">
            eparmedx.com
          </a>
          . If you answer yes to anything, speak to a doctor before starting. This site does not
          give medical clearance and cannot assess you.
        </Notice>

        {error && <Notice tone="danger">{error}</Notice>}

        <Button type="submit" full>
          Save and start
        </Button>
      </form>
    </div>
  );
}
