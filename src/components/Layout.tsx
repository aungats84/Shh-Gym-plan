import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  Timer,
  HeartPulse,
  Sun,
  Footprints,
  Moon,
  TrendingUp,
  ClipboardCheck,
  BookOpen,
  Settings as SettingsIcon,
  Smartphone,
  HardDriveDownload,
  AlertCircle,
} from 'lucide-react';
import { useData } from '@/state/DataContext';
import { timeAgo } from '@/lib/time';

interface NavItem {
  to: string;
  label: string;
  short: string;
  Icon: typeof Home;
  /** Shown in the phone bottom bar. */
  primary?: boolean;
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Today', short: 'Today', Icon: Home, primary: true },
  { to: '/workouts', label: 'Workouts', short: 'Train', Icon: Dumbbell, primary: true },
  {
    to: '/meals',
    label: 'Meals and cooking',
    short: 'Meals',
    Icon: UtensilsCrossed,
    primary: true,
  },
  { to: '/progress', label: 'Progress', short: 'Progress', Icon: TrendingUp, primary: true },
  { to: '/pre-workout', label: 'Pre-workout', short: 'Pre', Icon: Timer },
  { to: '/recovery', label: 'Recovery', short: 'Recovery', Icon: HeartPulse },
  { to: '/heat', label: 'Heat safety', short: 'Heat', Icon: Sun },
  { to: '/cardio', label: 'Cardio and movement', short: 'Cardio', Icon: Footprints },
  { to: '/sleep', label: 'Sleep and stress', short: 'Sleep', Icon: Moon },
  { to: '/weekly-review', label: 'Weekly review', short: 'Review', Icon: ClipboardCheck },
  { to: '/tutorials', label: 'Tutorials and sources', short: 'Learn', Icon: BookOpen },
  { to: '/transfer', label: 'Transfer between devices', short: 'Transfer', Icon: Smartphone },
  { to: '/settings', label: 'Settings', short: 'Settings', Icon: SettingsIcon, primary: true },
];

function SaveBadge() {
  const { saveState, lastSavedAt } = useData();

  const map = {
    saved: {
      Icon: HardDriveDownload,
      text: `Saved on this device ${timeAgo(lastSavedAt)}`,
      cls: 'text-muted',
    },
    saving: { Icon: HardDriveDownload, text: 'Saving...', cls: 'text-accent' },
    unavailable: { Icon: AlertCircle, text: 'This browser will not save', cls: 'text-danger' },
  }[saveState];
  const { Icon } = map;

  return (
    <Link
      to="/transfer"
      className={`flex min-h-[38px] w-full items-center gap-2 rounded-[8px] border border-border px-2 py-1 text-left text-xs ${map.cls}`}
      title="Your data lives on this device. Tap to move it to another one."
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{map.text}</span>
    </Link>
  );
}

export default function Layout() {
  return (
    <div className="min-h-dvh">
      {/* Skip link - keyboard users should not have to tab the whole menu. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-[8px] focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-text"
      >
        Skip to content
      </a>

      {/* ---------------- desktop sidebar ---------------- */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface p-3 lg:flex">
        <div className="px-2 py-3">
          <p className="text-base font-semibold">San Training</p>
          <p className="text-xs text-muted">Bangkok time</p>
        </div>
        <nav className="flex-1 overflow-y-auto" aria-label="Main">
          <ul>
            {NAV.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `mb-0.5 flex min-h-[44px] items-center gap-3 rounded-[8px] px-3 text-sm ${
                      isActive
                        ? 'bg-accent-soft font-medium text-accent'
                        : 'text-text hover:bg-surface-2'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="pt-2">
          <SaveBadge />
        </div>
      </aside>

      {/* ---------------- main content ---------------- */}
      <div className="lg:pl-60">
        {/* Phone header */}
        <header className="safe-top safe-x sticky top-0 z-20 border-b border-border bg-bg/95 px-4 py-2 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">San Training</p>
            <div className="w-40">
              <SaveBadge />
            </div>
          </div>
        </header>

        <main
          id="main"
          className="safe-x mx-auto w-full max-w-3xl px-4 pb-28 pt-4 lg:pb-10 lg:pt-6"
        >
          <Outlet />
        </main>
      </div>

      {/* ---------------- phone bottom navigation ---------------- */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface lg:hidden"
        aria-label="Main"
      >
        <ul className="flex">
          {NAV.filter((n) => n.primary).map(({ to, short, Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="truncate">{short}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
