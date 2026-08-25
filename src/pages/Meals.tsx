import { useMemo, useState } from 'react';
import { Check, Heart, ShoppingCart, X } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import {
  Button,
  Card,
  Field,
  Notice,
  Pill,
  ProgressBar,
  ScrollX,
  SectionHeading,
  TextInput,
} from '@/components/ui';
import {
  BATCH_COOKING_NOTE,
  EXTRAS,
  HOT_WEATHER_STORAGE,
  MEALS,
  NUTRITION_NOTE,
  PRICE_NOTE,
  PRICE_REVIEWED_ON,
  findOption,
  mealsForDay,
  type MealOption,
  type OptionKind,
} from '@/data/meals';
import { buildGroceryList, groceryTotal, totalsFor } from '@/domain/grocery';
import { mealVideoFor } from '@/data/tutorials';
import VideoLink from '@/components/VideoLink';
import { readCache, writeCache } from '@/lib/storage';
import { prettyDate, weekStart } from '@/lib/time';
import type { MealSlot } from '@/lib/types';

const KIND_LABEL: Record<OptionKind, string> = {
  quick: 'Quick',
  home: 'Home-cooked',
  outside: 'Buy outside',
};

export default function Meals() {
  const data = useData();
  const plan = usePlan();
  const [dayOffset, setDayOffset] = useState(0);
  const [favourites, setFavourites] = useState<string[]>(() =>
    readCache('favourites', [] as string[]),
  );
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');

  const dayNumber = ((dayOffset % 7) + 7) % 7 || 7;
  const meals = mealsForDay(dayNumber);
  const date = plan.today;

  const selections = data.meal_selections.filter((m) => m.date === date);
  const totals = totalsFor(selections);
  const grocery = useMemo(
    () => buildGroceryList(data.meal_selections.filter((m) => m.date >= weekStart(date))),
    [data.meal_selections, date],
  );

  function choose(slot: MealSlot, option: MealOption) {
    data.upsert('meal_selections', {
      date,
      slot,
      meal_id: option.id,
      option_kind: option.kind,
      logged: false,
      portion_multiplier: 1,
      custom_name: null,
      custom_kcal: null,
      custom_protein_g: null,
    });
  }

  /** Undo an accidental tap. Nothing about the day is kept. */
  function clearSlot(slot: MealSlot) {
    data.remove('meal_selections', `${date}|${slot}`);
  }

  function logIt(slot: MealSlot) {
    const sel = selections.find((s) => s.slot === slot);
    if (!sel) return;
    data.upsert('meal_selections', { ...sel, logged: !sel.logged });
  }

  function toggleFavourite(id: string) {
    setFavourites((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      writeCache('favourites', next);
      return next;
    });
  }

  function addCustom() {
    if (!customName.trim()) return;
    data.upsert('meal_selections', {
      date,
      slot: 'snack',
      meal_id: `custom:${customName.trim()}`,
      option_kind: 'quick',
      logged: true,
      portion_multiplier: 1,
      custom_name: customName.trim(),
      custom_kcal: Number(customKcal) || 0,
      custom_protein_g: Number(customProtein) || 0,
    });
    setCustomName('');
    setCustomKcal('');
    setCustomProtein('');
  }

  const overBudget = totals.cost_thb > (data.profile?.budget_thb_per_day ?? 100);

  return (
    <div className="space-y-4">
      <SectionHeading
        sub={`${prettyDate(date)} - budget ${data.profile?.budget_thb_per_day ?? 100} THB per day`}
      >
        Meals and cooking
      </SectionHeading>

      <Card title="Today's totals" subtitle={`Day ${dayNumber} of the seven day rotation`}>
        <ProgressBar label="Calories" value={totals.kcal} max={plan.effectiveKcal} unit=" kcal" />
        <ProgressBar
          label="Protein"
          value={totals.protein_g}
          max={plan.targets?.protein_g ?? 100}
          unit=" g"
          tone="good"
        />
        <ProgressBar
          label="Fibre"
          value={totals.fiber_g}
          max={plan.targets?.fiber_g ?? 25}
          unit=" g"
        />
        <ProgressBar
          label="Spending"
          value={totals.cost_thb}
          max={data.profile?.budget_thb_per_day ?? 100}
          unit=" THB"
          tone={overBudget ? 'warn' : 'accent'}
        />
        {selections.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
            {selections.map((sel) => {
              const f = findOption(sel.meal_id);
              const name = f?.option.name ?? sel.custom_name ?? 'Custom meal';
              const kcal = f ? f.option.kcal : (sel.custom_kcal ?? 0);
              return (
                <li key={sel.slot} className="flex items-center gap-2 text-[13px]">
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                  <span className="shrink-0 tabular-nums text-faint">{kcal} kcal</span>
                  <button
                    type="button"
                    onClick={() => clearSlot(sel.slot)}
                    aria-label={`Remove ${name}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line text-faint"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {overBudget && (
          <div className="mt-2">
            <Notice tone="warn">
              Today is over budget. The home-cooked options are usually the cheapest by a wide
              margin.
            </Notice>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => setDayOffset((d) => d - 1)}>
          Previous day
        </Button>
        <span className="text-sm text-muted">Plan day {dayNumber}</span>
        <Button size="sm" variant="secondary" onClick={() => setDayOffset((d) => d + 1)}>
          Next day
        </Button>
      </div>

      {meals.map((meal) => {
        const selected = selections.find((s) => s.slot === meal.slot);
        const ordered = [...meal.options].sort((a, b) =>
          a.kind === meal.recommended ? -1 : b.kind === meal.recommended ? 1 : 0,
        );
        return (
          <Card
            key={meal.id}
            title={meal.title.split(' - ')[1]}
            subtitle="Three ways to do it. Pick whichever suits today."
          >
            <div className="space-y-3">
              {ordered.map((o) => {
                const isSelected = selected?.meal_id === o.id;
                return (
                  <div
                    key={o.id}
                    className={`rounded-[8px] border p-3 ${
                      isSelected ? 'border-accent bg-accent-wash' : 'border-line'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {isSelected && (
                            <Pill tone="win">
                              <Check className="h-3 w-3" aria-hidden />
                              Chosen
                            </Pill>
                          )}
                          <Pill tone={o.kind === meal.recommended ? 'accent' : 'plain'}>
                            {KIND_LABEL[o.kind]}
                          </Pill>
                          {o.kind === meal.recommended && <Pill tone="good">Recommended</Pill>}
                          <Pill tone={o.confidence === 'low' ? 'warn' : 'plain'}>
                            {o.confidence} confidence
                          </Pill>
                        </div>
                        <p className="mt-1.5 font-medium">{o.name}</p>
                        {o.thai_name && <p className="text-sm text-muted">{o.thai_name}</p>}
                        <p className="mt-0.5 text-sm text-muted">{o.portion}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFavourite(o.id)}
                        aria-label={
                          favourites.includes(o.id) ? 'Remove favourite' : 'Add favourite'
                        }
                        aria-pressed={favourites.includes(o.id)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-line"
                      >
                        <Heart
                          className={`h-4 w-4 ${favourites.includes(o.id) ? 'fill-accent text-accent' : ''}`}
                          aria-hidden
                        />
                      </button>
                    </div>

                    <ScrollX>
                      <div className="mt-2 flex gap-3 whitespace-nowrap text-xs text-muted">
                        <span>{o.kcal} kcal</span>
                        <span>{o.protein_g} g protein</span>
                        <span>{o.carbs_g} g carbs</span>
                        <span>{o.fat_g} g fat</span>
                        <span>{o.fiber_g} g fibre</span>
                        <span className="font-medium text-text">{o.cost_thb} THB</span>
                        <span>{o.time_minutes} min</span>
                        <span>
                          {o.timing === 'before'
                            ? 'Good before training'
                            : o.timing === 'after'
                              ? 'Good after training'
                              : 'Either'}
                        </span>
                      </div>
                    </ScrollX>

                    {o.ingredients && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          Ingredients
                        </summary>
                        <ul className="mt-1 space-y-0.5 text-sm">
                          {o.ingredients.map((i) => (
                            <li key={i.name} className="flex justify-between gap-2">
                              <span>
                                {i.name} - {i.qty}
                              </span>
                              <span className="text-muted">{i.cost_thb} THB</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}

                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        {o.kind === 'outside' ? 'How to order it' : 'How to make it'}
                      </summary>
                      <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">
                        {o.steps.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                      {o.ordering_tips && (
                        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm">
                          {o.ordering_tips.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      )}
                      {o.substitutions.length > 0 && (
                        <p className="mt-2 text-sm">
                          <span className="font-medium">If something is unavailable:</span>{' '}
                          {o.substitutions.join('; ')}
                        </p>
                      )}
                      {o.storage && (
                        <p className="mt-2 text-sm">
                          <span className="font-medium">Storage:</span> {o.storage}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted">
                        Price estimate last reviewed {PRICE_REVIEWED_ON}.
                      </p>
                    </details>

                    {o.kind === 'home' && mealVideoFor(o.id) && (
                      <div className="mt-3">
                        <VideoLink
                          exerciseName={o.name}
                          searchPhrase={`${o.name} recipe`}
                          video={mealVideoFor(o.id)}
                        />
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {!isSelected ? (
                        <Button size="sm" onClick={() => choose(meal.slot, o)}>
                          Choose this
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant={selected?.logged ? 'secondary' : 'primary'}
                            onClick={() => logIt(meal.slot)}
                          >
                            {selected?.logged ? 'Eaten' : 'Mark as eaten'}
                          </Button>
                          {/* Chose the wrong thing by accident? Undo it. */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => clearSlot(meal.slot)}
                            ariaLabel={`Remove ${o.name} from this meal`}
                          >
                            <X className="h-3.5 w-3.5" aria-hidden />
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      <Card title="Add your own meal">
        <div className="grid gap-x-3 sm:grid-cols-3">
          <Field label="Name" htmlFor="cname">
            <TextInput
              id="cname"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </Field>
          <Field label="Calories" htmlFor="ckcal">
            <TextInput
              id="ckcal"
              type="number"
              inputMode="numeric"
              value={customKcal}
              onChange={(e) => setCustomKcal(e.target.value)}
            />
          </Field>
          <Field label="Protein (g)" htmlFor="cprot">
            <TextInput
              id="cprot"
              type="number"
              inputMode="numeric"
              value={customProtein}
              onChange={(e) => setCustomProtein(e.target.value)}
            />
          </Field>
        </div>
        <Button size="sm" onClick={addCustom} disabled={!customName.trim()}>
          Add to today
        </Button>
      </Card>

      <Card
        title="Shopping list"
        subtitle="Built only from the home-cooked meals you actually chose."
        action={<ShoppingCart className="h-4 w-4 text-muted" aria-hidden />}
      >
        {grocery.length === 0 ? (
          <p className="text-sm text-muted">
            Choose some home-cooked options and the ingredients will appear here.
          </p>
        ) : (
          <>
            <ul className="space-y-1 text-sm">
              {grocery.map((g) => (
                <li
                  key={g.name}
                  className="flex justify-between gap-2 border-b border-line pb-1 last:border-0"
                >
                  <span>
                    {g.name} <span className="text-muted">({g.quantity})</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">{g.est_cost_thb} THB</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm font-medium">Estimated total: {groceryTotal(grocery)} THB</p>
          </>
        )}
      </Card>

      <Card
        title="Extra options"
        subtitle="Available if you want them. The plan does not require snacks."
      >
        <ul className="space-y-2 text-sm">
          {EXTRAS.map((e) => (
            <li key={e.id} className="rounded-[8px] border border-line p-2">
              <p className="font-medium">{e.name}</p>
              <p className="text-muted">
                {e.portion} - {e.kcal} kcal, {e.protein_g} g protein, {e.cost_thb} THB
              </p>
              <p className="mt-0.5 text-xs text-muted">{e.steps[0]}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Storing food in Bangkok heat" tone="warn">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {HOT_WEATHER_STORAGE.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>

      <Card title="About these numbers">
        <p className="text-sm">{PRICE_NOTE}</p>
        <p className="mt-2 text-sm">{NUTRITION_NOTE}</p>
        <p className="mt-2 text-sm">{BATCH_COOKING_NOTE}</p>
        <p className="mt-2 text-xs text-muted">
          {MEALS.length} planned meals across seven days, each with three options.
        </p>
      </Card>
    </div>
  );
}
