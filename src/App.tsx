import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Layout from '@/components/Layout';
import { useData } from '@/state/DataContext';
import { Button, Card, Loading, Notice } from '@/components/ui';

import Onboarding from '@/pages/Onboarding';
import Today from '@/pages/Today';
import Workouts from '@/pages/Workouts';
import WorkoutSession from '@/pages/WorkoutSession';
import Meals from '@/pages/Meals';
import PreWorkout from '@/pages/PreWorkout';
import Recovery from '@/pages/Recovery';
import HeatSafety from '@/pages/HeatSafety';
import Cardio from '@/pages/Cardio';
import SleepStress from '@/pages/SleepStress';
import WeeklyReviewPage from '@/pages/WeeklyReview';
import Tutorials from '@/pages/Tutorials';
import Settings from '@/pages/Settings';

// These two pull in large libraries (charts, and the QR code drawer) and
// are not needed on first load, so they arrive on demand instead.
const Progress = lazy(() => import('@/pages/Progress'));
const Transfer = lazy(() => import('@/pages/Transfer'));

/**
 * Applies the light/dark choice to the <html> element.
 *
 * Light unless dark is chosen deliberately. Following the device's own
 * setting is what made the phone and the laptop look like two different
 * apps, so 'system' is treated as light and is no longer offered.
 */
function useTheme() {
  const { profile } = useData();
  const dark = profile?.theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
}

function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  if (!needRefresh) return null;
  return (
    <div className="safe-bottom fixed inset-x-3 bottom-20 z-40 lg:bottom-4 lg:left-auto lg:right-4 lg:w-80">
      <Card tone="accent">
        <p className="text-sm font-medium">A new version is ready</p>
        <p className="mt-1 text-sm text-muted">
          Reload to get it. Your saved data is not affected.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => void updateServiceWorker(true)}>
            Reload
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setNeedRefresh(false)}>
            Later
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const { profile, loading, storageBlocked } = useData();
  useTheme();

  if (loading) return <Loading label="Opening your plan" />;

  // The whole site depends on the browser being allowed to store things.
  if (storageBlocked) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Card title="This browser will not save anything" tone="danger">
          <p className="text-sm">
            San Training keeps all of your information in this browser, and this browser is
            currently refusing to store it. Nothing you enter would survive closing the tab.
          </p>
          <p className="mt-2 text-sm">Usually this means one of:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            <li>You are in a Private or Incognito window - open the site in a normal window.</li>
            <li>Cookies and site data are blocked for this site in your browser settings.</li>
            <li>The device is completely out of storage space.</li>
          </ul>
        </Card>
      </div>
    );
  }

  // First run: collect the profile before anything else can be used.
  const needsSetup = !profile || !profile.age || !profile.height_cm || !profile.weight_kg;
  if (needsSetup) return <Onboarding />;

  return (
    <>
      {profile.parq_confirmed_at === null && (
        <div className="safe-x mx-auto w-full max-w-3xl px-4 pt-4">
          <Notice tone="warn" title="One step before your first workout">
            Please complete the free PAR-Q+ readiness questionnaire at{' '}
            <a className="underline" href="https://eparmedx.com/" target="_blank" rel="noreferrer">
              eparmedx.com
            </a>
            , then confirm it in Settings. Workouts stay locked until then.
          </Notice>
        </div>
      )}
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Today />} />

          <Route path="train" element={<Workouts />} />
          <Route path="train/before" element={<PreWorkout />} />
          <Route path="train/after" element={<Recovery />} />
          <Route path="train/cardio" element={<Cardio />} />
          <Route path="train/heat" element={<HeatSafety />} />
          <Route path="train/session/:dayKey" element={<WorkoutSession />} />

          <Route path="food" element={<Meals />} />

          <Route
            path="progress"
            element={
              <Suspense fallback={<Loading label="Loading your charts" />}>
                <Progress />
              </Suspense>
            }
          />
          <Route path="progress/sleep" element={<SleepStress />} />
          <Route path="progress/review" element={<WeeklyReviewPage />} />

          <Route path="more" element={<Tutorials />} />
          <Route path="more/transfer" element={<Transfer />} />
          <Route path="more/settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <UpdatePrompt />
    </>
  );
}
