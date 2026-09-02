/** Shared data shapes for the whole site. */

export type Units = 'metric' | 'imperial';
export type Sex = 'female' | 'male' | 'unspecified';
export type Goal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'recomposition'
  | 'stamina'
  | 'performance'
  | 'mobility'
  | 'general_health';
export type Experience = 'none' | 'returning' | 'consistent' | 'experienced';
export type Intensity = 'gentle' | 'moderate' | 'challenging';
export type TrackingStyle = 'numbers' | 'portions';
export type ThemeChoice = 'light' | 'dark' | 'system';

export type EquipmentId =
  'dumbbells' | 'mat' | 'furniture' | 'bands' | 'kettlebell' | 'pullup_bar' | 'bench' | 'backpack';

/** Answers that shape every calculation on the site. */
export interface Profile {
  user_id: string;
  display_name: string;
  age: number;
  sex: Sex;
  height_cm: number;
  weight_kg: number;
  waist_cm: number | null;
  units: Units;
  area: string;
  /** Goals, most important first. */
  goals: Goal[];
  priority_muscles: string[];
  timeline_weeks: number;
  experience: Experience;
  intensity: Intensity;
  training_days_per_week: number;
  session_minutes: number;
  preferred_time: 'morning' | 'midday' | 'evening' | 'varies';
  flexible_schedule: boolean;
  equipment: EquipmentId[];
  dumbbell_kg: number | null;
  can_buy_equipment: boolean;
  /** Steps on a normal day before the plan starts. */
  baseline_steps: number;
  enjoys: string[];
  dislikes: string[];
  /** Food */
  budget_thb_per_day: number;
  meals_per_day: number;
  allows_snacks: boolean;
  cooking_skill: 'none' | 'basic' | 'comfortable' | 'confident';
  kitchen: string[];
  batch_cooks: boolean;
  dietary_notes: string[];
  allergies: string[];
  tracking_style: TrackingStyle;
  baseline_water_l: number;
  /** Sleep */
  bedtime: string;
  waketime: string;
  /** Heat */
  trains_outdoors: boolean;
  has_aircon: boolean;
  heat_tolerance: 'poor' | 'average' | 'good';
  /** Safety gate */
  parq_confirmed_at: string | null;
  parq_flagged_yes: boolean;
  doctor_restrictions: string | null;
  /** Preferences */
  theme: ThemeChoice;
  track_cycle: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DailyLog {
  id?: string;
  user_id?: string;
  /** YYYY-MM-DD in Bangkok time. */
  date: string;
  water_l: number;
  steps: number;
  sleep_hours: number | null;
  sleep_quality: number | null;
  stress: number | null;
  energy: number | null;
  mood: number | null;
  caffeine_last_time: string | null;
  alcohol_units: number | null;
  daytime_sleepiness: boolean;
  /** She chose to rest today instead of training. Keeps her streak alive. */
  rest_day?: boolean;
  notes: string;
  updated_at?: string;
}

export interface CardioSession {
  id?: string;
  user_id?: string;
  /** YYYY-MM-DD in Bangkok time. */
  date: string;
  kind: 'walk' | 'run' | 'indoor' | 'other';
  minutes: number;
  effort: 'easy' | 'moderate' | 'hard';
  note?: string;
  /** Makes each session unique within a day. */
  created_at: string;
  updated_at?: string;
}

export type ReadinessAction = 'full' | 'reduced' | 'short' | 'light' | 'rest' | 'stop_seek_advice';

export interface ReadinessCheck {
  id?: string;
  user_id?: string;
  date: string;
  sleep_quality: number;
  energy: number;
  soreness: number;
  stress: number;
  motivation: number;
  has_pain: boolean;
  pain_note: string;
  warning_symptom: boolean;
  minutes_available: number;
  /** What the site suggested. */
  recommended: ReadinessAction;
  /** What the person actually chose - they always confirm. */
  accepted: ReadinessAction | null;
  created_at?: string;
}

export interface SetLog {
  exercise_id: string;
  set_index: number;
  target_reps: string;
  reps: number | null;
  weight_kg: number | null;
  rir: number | null;
  done: boolean;
}

export interface WorkoutSession {
  id?: string;
  user_id?: string;
  date: string;
  day_key: string;
  week: number;
  mode: ReadinessAction;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  sets: SetLog[];
  session_rpe: number | null;
  difficulty: 'too_easy' | 'about_right' | 'too_hard' | null;
  pain_reported: boolean;
  pain_note: string;
  notes: string;
  duration_minutes: number | null;
  updated_at?: string;
}

export type MealSlot = 'meal_1' | 'meal_2' | 'snack' | 'pre_workout' | 'post_workout';
export type MealOptionKind = 'quick' | 'home' | 'outside';

export interface MealSelection {
  id?: string;
  user_id?: string;
  date: string;
  slot: MealSlot;
  meal_id: string;
  option_kind: MealOptionKind;
  logged: boolean;
  /** Set when the person edits portions. */
  portion_multiplier: number;
  custom_name: string | null;
  custom_kcal: number | null;
  custom_protein_g: number | null;
  updated_at?: string;
}

export interface Measurement {
  id?: string;
  user_id?: string;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  note: string;
  photo_note: string;
  updated_at?: string;
}

export interface SymptomLog {
  id?: string;
  user_id?: string;
  date: string;
  kind: string;
  severity: number;
  note: string;
  during_exercise: boolean;
  created_at?: string;
}

export interface WeeklyReview {
  id?: string;
  user_id?: string;
  /** Monday of the reviewed week, Bangkok time. */
  week_start: string;
  workouts_completed: number;
  improved: string;
  had_pain: boolean;
  energy_recovery: number;
  sleep_rating: number;
  hunger_manageable: boolean;
  meals_affordable: boolean;
  favourite_meals: string;
  difficulty: 'too_easy' | 'about_right' | 'too_hard';
  smallest_adjustment: string;
  applied_change: string | null;
  created_at?: string;
}

export interface PlanVersion {
  id?: string;
  user_id?: string;
  version: number;
  reason: string;
  /** Frozen copy of the targets that were active. */
  snapshot: Record<string, unknown>;
  created_at?: string;
}

export interface GroceryItem {
  id?: string;
  user_id?: string;
  week_start: string;
  name: string;
  quantity: string;
  est_cost_thb: number;
  checked: boolean;
  from_meal_ids: string[];
  updated_at?: string;
}

export interface CustomMeal {
  id?: string;
  user_id?: string;
  name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  cost_thb: number;
  updated_at?: string;
}

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';
