import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  MoreHorizontal,
  Timer,
  HeartPulse,
  Footprints,
  Moon,
  ClipboardCheck,
  BookOpen,
  Smartphone,
  Settings as SettingsIcon,
  type LucideIcon,
} from 'lucide-react';

/**
 * Five sections, each holding its related pages.
 *
 * The phone bar has room for five things, so nothing lives outside a
 * section - otherwise pages become unreachable on mobile, which is
 * exactly what went wrong in the first version.
 */

export interface SubPage {
  path: string;
  label: string;
  Icon: LucideIcon;
}

export interface Section {
  key: string;
  root: string;
  label: string;
  Icon: LucideIcon;
  pages: SubPage[];
}

export const SECTIONS: Section[] = [
  {
    key: 'today',
    root: '/',
    label: 'Today',
    Icon: Home,
    pages: [],
  },
  {
    key: 'train',
    root: '/train',
    label: 'Train',
    Icon: Dumbbell,
    pages: [
      { path: '/train', label: 'Workouts', Icon: Dumbbell },
      { path: '/train/before', label: 'Before', Icon: Timer },
      { path: '/train/after', label: 'After', Icon: HeartPulse },
      { path: '/train/cardio', label: 'Cardio', Icon: Footprints },
    ],
  },
  {
    key: 'food',
    root: '/food',
    label: 'Food',
    Icon: UtensilsCrossed,
    pages: [],
  },
  {
    key: 'progress',
    root: '/progress',
    label: 'Progress',
    Icon: TrendingUp,
    pages: [],
  },
  {
    key: 'more',
    root: '/more',
    label: 'More',
    Icon: MoreHorizontal,
    pages: [
      { path: '/more/howto', label: 'How to', Icon: BookOpen },
      { path: '/more/sleep', label: 'Sleep', Icon: Moon },
      { path: '/more/weekly', label: 'Weekly', Icon: ClipboardCheck },
      { path: '/more/transfer', label: 'Transfer', Icon: Smartphone },
      { path: '/more/settings', label: 'Settings', Icon: SettingsIcon },
    ],
  },
];

/** Which section a path belongs to, longest match first. */
export function sectionFor(pathname: string): Section {
  const match = [...SECTIONS]
    .filter((s) => s.root !== '/')
    .find((s) => pathname === s.root || pathname.startsWith(`${s.root}/`));
  return match ?? SECTIONS[0];
}
