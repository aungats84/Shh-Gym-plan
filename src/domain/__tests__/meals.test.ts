import { describe, expect, it } from 'vitest';
import { MEALS, EXTRAS, findOption, mealsForDay } from '@/data/meals';
import { buildGroceryList, groceryTotal, totalsFor } from '@/domain/grocery';
import { SOURCES } from '@/data/sources';
import type { MealSelection } from '@/lib/types';

describe('the meal plan', () => {
  it('covers seven days with two meals each', () => {
    expect(MEALS).toHaveLength(14);
    for (let day = 1; day <= 7; day += 1) {
      expect(mealsForDay(day)).toHaveLength(2);
    }
  });

  it('gives exactly three options for every meal', () => {
    for (const meal of MEALS) {
      expect(meal.options).toHaveLength(3);
      const kinds = meal.options.map((o) => o.kind).sort();
      expect(kinds).toEqual(['home', 'outside', 'quick']);
    }
  });

  it('gives every option a price, macros and a confidence label', () => {
    for (const meal of MEALS) {
      for (const o of meal.options) {
        expect(o.kcal).toBeGreaterThan(300);
        expect(o.protein_g).toBeGreaterThan(20);
        expect(o.cost_thb).toBeGreaterThan(0);
        expect(o.portion.length).toBeGreaterThan(5);
        expect(o.steps.length).toBeGreaterThan(0);
        expect(['high', 'medium', 'low']).toContain(o.confidence);
      }
    }
  });

  it('gives every home-cooked option numbered steps and costed ingredients', () => {
    for (const meal of MEALS) {
      const home = meal.options.find((o) => o.kind === 'home')!;
      expect(home.ingredients?.length ?? 0).toBeGreaterThan(2);
      expect(home.steps.length).toBeGreaterThanOrEqual(3);
      for (const i of home.ingredients ?? []) {
        expect(i.cost_thb).toBeGreaterThan(0);
        expect(i.qty.length).toBeGreaterThan(0);
      }
    }
  });

  it('gives every buy-outside option a Thai name and ordering tips', () => {
    for (const meal of MEALS) {
      const out = meal.options.find((o) => o.kind === 'outside')!;
      expect(out.thai_name, `${out.name} needs a Thai name`).toBeTruthy();
      expect(out.ordering_tips?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('keeps the three options within a similar calorie range', () => {
    for (const meal of MEALS) {
      const kcals = meal.options.map((o) => o.kcal);
      const spread = Math.max(...kcals) - Math.min(...kcals);
      expect(spread, `${meal.id} calorie spread`).toBeLessThan(250);
    }
  });

  it('recommends the home-cooked option, which is what the budget requires', () => {
    for (const meal of MEALS) {
      expect(meal.recommended).toBe('home');
    }
  });

  it('keeps a full day of home-cooked meals inside the 100 THB budget', () => {
    for (let day = 1; day <= 7; day += 1) {
      const cost = mealsForDay(day)
        .map((m) => m.options.find((o) => o.kind === 'home')!.cost_thb)
        .reduce((a, b) => a + b, 0);
      expect(cost, `day ${day} home-cooked cost`).toBeLessThanOrEqual(100);
    }
  });

  it('reaches roughly the daily protein target on home-cooked days', () => {
    for (let day = 1; day <= 7; day += 1) {
      const protein = mealsForDay(day)
        .map((m) => m.options.find((o) => o.kind === 'home')!.protein_g)
        .reduce((a, b) => a + b, 0);
      expect(protein, `day ${day} protein`).toBeGreaterThanOrEqual(78);
    }
  });

  it('lands near the calorie target on home-cooked days', () => {
    for (let day = 1; day <= 7; day += 1) {
      const kcal = mealsForDay(day)
        .map((m) => m.options.find((o) => o.kind === 'home')!.kcal)
        .reduce((a, b) => a + b, 0);
      expect(kcal, `day ${day} calories`).toBeGreaterThan(1250);
      expect(kcal, `day ${day} calories`).toBeLessThan(1500);
    }
  });

  it('uses unique option ids', () => {
    const ids = MEALS.flatMap((m) => m.options.map((o) => o.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('can find any option by id', () => {
    const id = MEALS[0].options[0].id;
    expect(findOption(id)?.option.id).toBe(id);
    expect(findOption('does-not-exist')).toBeNull();
  });
});

describe('daily totals', () => {
  const selection = (mealId: string, slot: MealSelection['slot']): MealSelection => ({
    date: '2026-08-24',
    slot,
    meal_id: mealId,
    option_kind: 'home',
    logged: true,
    portion_multiplier: 1,
    custom_name: null,
    custom_kcal: null,
    custom_protein_g: null,
  });

  it('adds up the chosen options', () => {
    const totals = totalsFor([
      selection('d1_m1_home', 'meal_1'),
      selection('d1_m2_home', 'meal_2'),
    ]);
    expect(totals.kcal).toBe(705 + 715);
    expect(totals.protein_g).toBe(52 + 44);
    expect(totals.cost_thb).toBe(38 + 40);
  });

  it('is zero when nothing is chosen', () => {
    expect(totalsFor([]).kcal).toBe(0);
  });

  it('scales with the portion multiplier', () => {
    const half = totalsFor([{ ...selection('d1_m1_home', 'meal_1'), portion_multiplier: 0.5 }]);
    expect(half.kcal).toBe(Math.round(705 * 0.5));
  });

  it('counts custom meals', () => {
    const totals = totalsFor([
      {
        ...selection('custom:Toast', 'snack'),
        custom_name: 'Toast',
        custom_kcal: 200,
        custom_protein_g: 8,
      },
    ]);
    expect(totals.kcal).toBe(200);
    expect(totals.protein_g).toBe(8);
  });

  it('ignores an option id that no longer exists', () => {
    expect(totalsFor([selection('deleted_option', 'meal_1')]).kcal).toBe(0);
  });
});

describe('shopping list', () => {
  const sel = (mealId: string, slot: MealSelection['slot']): MealSelection => ({
    date: '2026-08-24',
    slot,
    meal_id: mealId,
    option_kind: 'home',
    logged: false,
    portion_multiplier: 1,
    custom_name: null,
    custom_kcal: null,
    custom_protein_g: null,
  });

  it('only includes home-cooked meals', () => {
    const lines = buildGroceryList([sel('d1_m1_out', 'meal_1')]);
    expect(lines).toHaveLength(0);
  });

  it('lists ingredients from the meals actually chosen', () => {
    const lines = buildGroceryList([sel('d1_m1_home', 'meal_1')]);
    expect(lines.length).toBeGreaterThan(3);
    expect(lines.some((l) => l.name.toLowerCase().includes('chicken'))).toBe(true);
  });

  it('merges the same ingredient across meals instead of repeating it', () => {
    const lines = buildGroceryList([sel('d1_m1_home', 'meal_1'), sel('d7_m1_home', 'meal_2')]);
    const rice = lines.filter((l) => l.name.toLowerCase().includes('rice, dry'));
    expect(rice).toHaveLength(1);
    expect(rice[0].from_meal_ids.length).toBe(2);
  });

  it('totals the estimated cost', () => {
    const lines = buildGroceryList([sel('d1_m1_home', 'meal_1')]);
    expect(groceryTotal(lines)).toBe(38);
  });
});

describe('extras', () => {
  it('offers pre and post workout options', () => {
    expect(EXTRAS.some((e) => e.timing === 'before')).toBe(true);
    expect(EXTRAS.some((e) => e.timing === 'after')).toBe(true);
  });

  it('keeps them small enough to be snacks', () => {
    for (const e of EXTRAS) expect(e.kcal).toBeLessThan(300);
  });
});

describe('sources', () => {
  it('has no fabricated placeholder links', () => {
    for (const s of SOURCES) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.url).not.toMatch(/example\.com|placeholder|TODO/i);
      expect(s.title.length).toBeGreaterThan(10);
      expect(s.organisation.length).toBeGreaterThan(3);
      expect(s.used_for.length).toBeGreaterThan(0);
      expect(s.reviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('covers training, screening, nutrition, sleep and heat', () => {
    const ids = SOURCES.map((s) => s.id);
    expect(ids).toContain('acsm_rt_2026');
    expect(ids).toContain('parq_plus');
    expect(ids).toContain('ioc_reds_2023');
    expect(ids).toContain('sleep_consensus_2021');
    expect(ids).toContain('cdc_heat_athletes');
    expect(ids).toContain('thai_fbdg');
    expect(ids).toContain('issn_protein');
  });
});
