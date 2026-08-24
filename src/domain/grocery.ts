/**
 * Builds the shopping list from the meals actually selected,
 * not from the whole 7-day plan.
 */

import { findOption } from '@/data/meals';
import type { MealSelection } from '@/lib/types';

export interface GroceryLine {
  name: string;
  quantity: string;
  est_cost_thb: number;
  from_meal_ids: string[];
}

export function buildGroceryList(selections: MealSelection[]): GroceryLine[] {
  const lines = new Map<string, GroceryLine>();

  for (const sel of selections) {
    const found = findOption(sel.meal_id);
    if (!found) continue;
    const { option } = found;
    // Only home-cooked options need shopping.
    if (option.kind !== 'home' || !option.ingredients) continue;

    for (const ing of option.ingredients) {
      const key = ing.name.toLowerCase();
      const existing = lines.get(key);
      if (existing) {
        existing.quantity = `${existing.quantity} + ${ing.qty}`;
        existing.est_cost_thb += ing.cost_thb;
        if (!existing.from_meal_ids.includes(option.id)) existing.from_meal_ids.push(option.id);
      } else {
        lines.set(key, {
          name: ing.name,
          quantity: ing.qty,
          est_cost_thb: ing.cost_thb,
          from_meal_ids: [option.id],
        });
      }
    }
  }

  return [...lines.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function groceryTotal(lines: GroceryLine[]): number {
  return Math.round(lines.reduce((sum, l) => sum + l.est_cost_thb, 0));
}

/** Daily totals from whatever has been selected for that date. */
export interface DayTotals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  cost_thb: number;
}

export const EMPTY_TOTALS: DayTotals = {
  kcal: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fiber_g: 0,
  cost_thb: 0,
};

export function totalsFor(selections: MealSelection[]): DayTotals {
  return selections.reduce<DayTotals>((acc, sel) => {
    if (sel.custom_name) {
      return {
        ...acc,
        kcal: acc.kcal + (sel.custom_kcal ?? 0),
        protein_g: acc.protein_g + (sel.custom_protein_g ?? 0),
      };
    }
    const found = findOption(sel.meal_id);
    if (!found) return acc;
    const o = found.option;
    const m = sel.portion_multiplier || 1;
    return {
      kcal: acc.kcal + Math.round(o.kcal * m),
      protein_g: acc.protein_g + Math.round(o.protein_g * m),
      carbs_g: acc.carbs_g + Math.round(o.carbs_g * m),
      fat_g: acc.fat_g + Math.round(o.fat_g * m),
      fiber_g: acc.fiber_g + Math.round(o.fiber_g * m),
      cost_thb: acc.cost_thb + Math.round(o.cost_thb * m),
    };
  }, EMPTY_TOTALS);
}
