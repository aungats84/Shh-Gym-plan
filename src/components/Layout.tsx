import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, HardDriveDownload, ShieldAlert } from 'lucide-react';
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
  // "More" drills in iOS-style (a menu, then a single page) rather than tabs.
  const inMoreSub = section.key === 'more' && location.pathname.startsWith('/more/');
  const showTabs = section.pages.length > 0 && !inSession && section.key !== 'more';
  const activeTab =
    [...section.pages]
      .sort((a, b) => b.path.length - a.path.length)
      .find((p) => location.pathname.startsWith(p.path))?.path ?? section.pages[0]?.path;

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-[14px] focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>

      {/* ---------------- desktop rail: the dossier index ---------------- */}
      <aside className="fixed inset-y-0 left-0 hidden w-[252px] flex-col border-r border-rule bg-surface/70 lg:flex">
        <div className="border-b border-rule px-6 pb-5 pt-7">
          <p className="font-serif text-[20px] font-semibold leading-none">San Training</p>
          <p className="label-caps mt-2 text-[10px] text-faint">Bangkok · her book</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
          {SECTIONS.map((s) => {
            const on = section.key === s.key;
            return (
              <div key={s.key} className="mb-0.5">
                <NavLink
                  to={s.root}
                  end={s.root === '/'}
                  className={`ribbon flex min-h-[46px] items-center gap-3 rounded-[16px] px-3.5 text-[14px] font-semibold transition-colors ${
                    on ? 'bg-accent-wash text-accent' : 'text-muted hover:bg-surface-2'
                  }`}
                >
                  {on && <span aria-hidden className="ribbon-mark animate-ribbon" />}
                  <s.Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  {s.label}
                </NavLink>

                {on && s.pages.length > 0 && (
                  <div className="ml-[28px] mt-1 border-l border-rule pl-3.5">
                    {s.pages.map((p) => (
                      <NavLink
                        key={p.path}
                        to={p.path}
                        end={p.path === s.root}
                        className={({ isActive }) =>
                          `flex min-h-[36px] items-center gap-2.5 rounded-[16px] px-2.5 text-[13px] transition-colors ${
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
            );
          })}
        </nav>

        <div className="border-t border-rule px-6 py-4">
          <SaveBadge />
        </div>
      </aside>

      {/* ---------------- content ---------------- */}
      <div className="lg:pl-[252px]">
        <header className="safe-top safe-x sticky top-0 z-20 border-b border-rule bg-bg/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-[16px] font-semibold">
              {section.key === 'today' ? 'San Training' : section.label}
            </p>
            <SaveBadge compact />
          </div>
        </header>

        <main
          id="main"
          className="safe-x mx-auto w-full max-w-3xl px-4 pb-28 pt-5 lg:pb-14 lg:pt-10"
        >
          {showTabs && (
            <SegTabs
              items={section.pages.map((p) => ({ key: p.path, label: p.label }))}
              active={activeTab ?? ''}
              onPick={(key) => navigate(key)}
            />
          )}
          {inMoreSub && (
            <Link
              to="/more"
              className="mb-4 inline-flex min-h-[40px] items-center gap-1 text-[15px] font-semibold text-accent"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
              More
            </Link>
          )}
          <div key={location.pathname} className="rise-stagger">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ---------------- phone bar ---------------- */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-surface/95 backdrop-blur-xl lg:hidden"
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
                  className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 pb-1 pt-2"
                >
                  {on && (
                    <span
                      aria-hidden
                      className="absolute inset-x-6 top-0 h-[2.5px] rounded-full bg-accent-strong"
                    />
                  )}
                  <s.Icon
                    className={`h-[19px] w-[19px] transition-colors ${on ? 'text-accent' : 'text-faint'}`}
                    aria-hidden
                  />
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
