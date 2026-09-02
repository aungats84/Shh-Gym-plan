import { Link } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Moon,
  Settings as SettingsIcon,
  Smartphone,
} from 'lucide-react';
import { PageTitle } from '@/components/ui';

const ITEMS = [
  {
    to: '/more/howto',
    Icon: BookOpen,
    label: 'How to',
    desc: 'Exercise and cooking videos, warm-ups, and the evidence behind the plan',
  },
  {
    to: '/more/sleep',
    Icon: Moon,
    label: 'Sleep & stress',
    desc: 'Log how you slept and how the day felt',
  },
  {
    to: '/more/weekly',
    Icon: ClipboardCheck,
    label: 'Weekly review',
    desc: 'Look back on the week and set the next one',
  },
  {
    to: '/more/transfer',
    Icon: Smartphone,
    label: 'Transfer',
    desc: 'Move your data between your phone and laptop',
  },
  {
    to: '/more/settings',
    Icon: SettingsIcon,
    label: 'Settings',
    desc: 'Profile, targets, rest-timer sound, appearance, and your data',
  },
];

export default function More() {
  return (
    <div className="space-y-4">
      <PageTitle sub="Guides, your data, and settings.">More</PageTitle>

      <div className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-[var(--shadow-soft)]">
        <ul className="divide-y divide-line/70">
          {ITEMS.map(({ to, Icon, label, desc }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-3.5 px-4 py-4 transition-colors hover:bg-surface-2 active:bg-surface-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-accent-wash text-accent">
                  <Icon className="h-[19px] w-[19px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{label}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                    {desc}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
