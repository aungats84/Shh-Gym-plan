import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readCache, writeCache, clearAllCache } from '@/lib/storage';
import type {
  DailyLog,
  Measurement,
  MealSelection,
  PlanVersion,
  Profile,
  ReadinessCheck,
  SymptomLog,
  WeeklyReview,
  WorkoutSession,
} from '@/lib/types';

/**
 * All data lives in this browser, on this device.
 *
 * There is no account and no server. Everything is written to the
 * browser's local storage as soon as it changes. Moving data to another
 * device is done deliberately, from the Transfer page.
 */

type Collection =
  | 'daily_logs'
  | 'readiness_checks'
  | 'workouts'
  | 'meal_selections'
  | 'measurements'
  | 'symptoms'
  | 'weekly_reviews'
  | 'plan_versions';

/** What makes a row unique, so saving twice replaces rather than duplicates. */
const KEY_OF: Record<Collection, (row: Record<string, unknown>) => string> = {
  daily_logs: (r) => String(r.date),
  readiness_checks: (r) => String(r.date),
  workouts: (r) => `${r.date}|${r.day_key}`,
  meal_selections: (r) => `${r.date}|${r.slot}`,
  measurements: (r) => String(r.date),
  symptoms: (r) => `${r.date}|${r.kind}|${r.created_at ?? ''}`,
  weekly_reviews: (r) => String(r.week_start),
  plan_versions: (r) => String(r.version),
};

export interface DataState {
  profile: Profile | null;
  daily_logs: DailyLog[];
  readiness_checks: ReadinessCheck[];
  workouts: WorkoutSession[];
  meal_selections: MealSelection[];
  measurements: Measurement[];
  symptoms: SymptomLog[];
  weekly_reviews: WeeklyReview[];
  plan_versions: PlanVersion[];
}

export const EMPTY: DataState = {
  profile: null,
  daily_logs: [],
  readiness_checks: [],
  workouts: [],
  meal_selections: [],
  measurements: [],
  symptoms: [],
  weekly_reviews: [],
  plan_versions: [],
};

export type SaveState = 'saved' | 'unavailable';

interface DataValue extends DataState {
  loading: boolean;
  saveState: SaveState;
  lastSavedAt: string | null;
  /** True when the browser refuses to store anything (private mode, full disk). */
  storageBlocked: boolean;
  saveProfile: (patch: Partial<Profile>) => void;
  upsert: <K extends Collection>(collection: K, row: DataState[K][number]) => void;
  remove: (collection: Collection, key: string) => void;
  exportAll: () => DataState;
  /** Replace everything (used by "Replace" on the Transfer page). */
  importAll: (data: Partial<DataState>) => void;
  /** Keep both sides, newest wins per row (used by "Merge"). */
  mergeAll: (data: Partial<DataState>) => { added: number; updated: number };
  deleteEverything: () => void;
}

const DataContext = createContext<DataValue | null>(null);

const CACHE_KEY = 'data';
const SAVED_KEY = 'lastSaved';

/** Confirms the browser will actually keep what we write. */
function storageWorks(): boolean {
  try {
    const probe = '__san_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>(() => readCache<DataState>(CACHE_KEY, EMPTY));
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() =>
    readCache<string | null>(SAVED_KEY, null),
  );
  const [storageBlocked] = useState(() => !storageWorks());

  // Mirror every change to the device. No state is set here - the
  // "last saved" stamp is recorded by the action that caused the save.
  useEffect(() => {
    writeCache(CACHE_KEY, state);
  }, [state]);

  /** Called by each action, which runs from an event rather than an effect. */
  const stampSave = useCallback(() => {
    const now = new Date().toISOString();
    writeCache(SAVED_KEY, now);
    setLastSavedAt(now);
  }, []);

  const saveProfile = useCallback(
    (patch: Partial<Profile>) => {
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        profile: { ...(s.profile ?? ({} as Profile)), ...patch, updated_at: now } as Profile,
      }));
      stampSave();
    },
    [stampSave],
  );

  const upsert = useCallback(
    <K extends Collection>(collection: K, row: DataState[K][number]) => {
      const withStamp = {
        ...(row as object),
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>;
      setState((s) => {
        const keyFn = KEY_OF[collection];
        const key = keyFn(withStamp);
        const rows = (s[collection] as unknown as Record<string, unknown>[]).filter(
          (r) => keyFn(r) !== key,
        );
        return { ...s, [collection]: [...rows, withStamp] } as DataState;
      });
      stampSave();
    },
    [stampSave],
  );

  const remove = useCallback(
    (collection: Collection, key: string) => {
      setState((s) => {
        const keyFn = KEY_OF[collection];
        const rows = (s[collection] as unknown as Record<string, unknown>[]).filter(
          (r) => keyFn(r) !== key,
        );
        return { ...s, [collection]: rows } as DataState;
      });
      stampSave();
    },
    [stampSave],
  );

  const exportAll = useCallback(() => state, [state]);

  const importAll = useCallback(
    (data: Partial<DataState>) => {
      setState((s) => ({ ...s, ...data }));
      stampSave();
    },
    [stampSave],
  );

  /**
   * Merge, so transferring from the phone does not throw away what was
   * logged on the laptop. For each row the newer `updated_at` wins.
   */
  const mergeAll = useCallback(
    (incoming: Partial<DataState>) => {
      let added = 0;
      let updated = 0;

      setState((s) => {
        const next: DataState = { ...s };

        if (incoming.profile) {
          const mineAt = s.profile?.updated_at ?? '';
          const theirsAt = incoming.profile.updated_at ?? '';
          if (!s.profile || theirsAt > mineAt) next.profile = incoming.profile;
        }

        for (const collection of Object.keys(KEY_OF) as Collection[]) {
          const theirs = incoming[collection] as unknown as Record<string, unknown>[] | undefined;
          if (!theirs) continue;
          const keyFn = KEY_OF[collection];
          const merged = new Map<string, Record<string, unknown>>();

          for (const row of s[collection] as unknown as Record<string, unknown>[]) {
            merged.set(keyFn(row), row);
          }
          for (const row of theirs) {
            const key = keyFn(row);
            const mine = merged.get(key);
            if (!mine) {
              merged.set(key, row);
              added += 1;
              continue;
            }
            const mineAt = String(mine.updated_at ?? mine.created_at ?? '');
            const theirsAt = String(row.updated_at ?? row.created_at ?? '');
            if (theirsAt > mineAt) {
              merged.set(key, row);
              updated += 1;
            }
          }
          // @ts-expect-error - map values match this collection's row type
          next[collection] = [...merged.values()];
        }

        return next;
      });

      stampSave();
      return { added, updated };
    },
    [stampSave],
  );

  const deleteEverything = useCallback(() => {
    setState(EMPTY);
    clearAllCache();
    setLastSavedAt(null);
  }, []);

  const value = useMemo<DataValue>(
    () => ({
      ...state,
      loading: false,
      saveState: storageBlocked ? 'unavailable' : 'saved',
      lastSavedAt,
      storageBlocked,
      saveProfile,
      upsert,
      remove,
      exportAll,
      importAll,
      mergeAll,
      deleteEverything,
    }),
    [
      state,
      lastSavedAt,
      storageBlocked,
      saveProfile,
      upsert,
      remove,
      exportAll,
      importAll,
      mergeAll,
      deleteEverything,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
