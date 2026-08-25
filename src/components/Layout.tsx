import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HardDriveDownload, ShieldAlert } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { timeAgo } from '@/lib/time';
import { SECTIONS, sectionFor } from '@/components/nav';
import { SegTabs } from '@/components/ui';

function SaveBadge({ compact = false }: { compact?: boolean }) {
  const { saveState, lastSavedAt } = useData();

  if (saveState === 'unavailable') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-alert/30 bg-alert-wash px-2.5 py-1 text-[11px] font-semibold text-alert">
        <ShieldAlert className="h-3 w-3" aria-hidden />
        Not saving
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-faint">
      <HardDriveDownload className="h-3 w-3" aria-hidden />
      {compact ? 'Saved' : `Saved ${timeAgo(lastSavedAt)}`}
    </span>
  );
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const section = sectionFor(location.pathname);

  // A session screen is a focused task, so the section tabs step aside.
  const inSession = location.pathname.includes('/session/');
  const showTabs = section.pages.length > 0 && !inSession;
  const activeTab =
    [...section.pages]
      .sort((a, b) => b.path.length - a.path.length)
      .find((p) => location.pathname.startsWith(p.path))?.path ?? section.pages[0]?.path;

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-[10px] focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>

      {/* ---------------- desktop rail ---------------- */}
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 pb-4 pt-6">
          <p className="font-display text-[17px] font-bold">San Training</p>
          <p className="mt-0.5 text-[11px] text-faint">Bangkok time</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3" aria-label="Main">
          {SECTIONS.map((s) => (
            <div key={s.key} className="mb-1">
              <NavLink
                to={s.root}
                end={s.root === '/'}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center gap-3 rounded-[12px] px-3 text-[14px] font-semibold transition-colors ${
                    isActive || section.key === s.key
                      ? 'bg-accent-wash text-accent'
                      : 'text-muted hover:bg-surface-2'
                  }`
                }
              >
                <s.Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {s.label}
              </NavLink>

              {section.key === s.key && s.pages.length > 0 && (
                <div className="ml-[26px] mt-0.5 border-l border-line pl-3">
                  {s.pages.map((p) => (
                    <NavLink
                      key={p.path}
                      to={p.path}
                      end={p.path === s.root}
                      className={({ isActive }) =>
                        `flex min-h-[38px] items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] ${
                          isActive ? 'font-semibold text-text' : 'text-muted hover:text-text'
                        }`
                      }
                    >
                      <p.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {p.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="px-5 py-4">
          <SaveBadge />
        </div>
      </aside>

      {/* ---------------- content ---------------- */}
      <div className="lg:pl-[248px]">
        <header className="safe-top safe-x sticky top-0 z-20 border-b border-line bg-bg/85 px-4 py-2.5 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-[15px] font-bold">
              {section.key === 'today' ? 'San Training' : section.label}
            </p>
            <SaveBadge compact />
          </div>
        </header>

        <main
          id="main"
          className="safe-x mx-auto w-full max-w-3xl px-4 pb-28 pt-4 lg:pb-12 lg:pt-8"
        >
          {showTabs && (
            <SegTabs
              items={section.pages.map((p) => ({ key: p.path, label: p.label }))}
              active={activeTab ?? ''}
              onPick={(key) => navigate(key)}
            />
          )}
          <div key={location.pathname} className="animate-rise">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ---------------- phone bar ---------------- */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden"
        aria-label="Main"
      >
        <ul className="flex">
          {SECTIONS.map((s) => {
            const on = section.key === s.key;
            return (
              <li key={s.key} className="flex-1">
                <NavLink
                  to={s.root}
                  end={s.root === '/'}
                  className="flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 pb-1 pt-1.5"
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      on ? 'bg-accent-wash' : ''
                    }`}
                  >
                    <s.Icon
                      className={`h-[18px] w-[18px] ${on ? 'text-accent' : 'text-faint'}`}
                      aria-hidden
                    />
                  </span>
                  <span
                    className={`text-[10.5px] ${on ? 'font-semibold text-accent' : 'text-faint'}`}
                  >
                    {s.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
