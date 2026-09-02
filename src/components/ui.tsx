import { useId, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, ChevronDown, Info, Loader2, Minus, Plus } from 'lucide-react';

/** Tone names used across the app, including the earlier spellings. */
type Tone = 'plain' | 'warm' | 'alert' | 'win' | 'accent' | 'warn' | 'danger' | 'good' | 'info';

function tone(t: Tone | undefined, fallback: string): string {
  const map: Record<string, string> = {
    warn: 'warm',
    danger: 'alert',
    good: 'win',
    info: 'accent',
  };
  return map[t ?? ''] ?? t ?? fallback;
}

/* ------------------------------------------------------------------ */
/* Surfaces - a card is a ruled leaf of the dossier.                   */
/* ------------------------------------------------------------------ */

export function Card({
  title,
  eyebrow,
  subtitle,
  right,
  action,
  children,
  tone: toneProp = 'plain',
  flush,
  className = '',
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  /** Sits under the title. `eyebrow` sits above it. */
  subtitle?: ReactNode;
  right?: ReactNode;
  /** Older name for `right`. */
  action?: ReactNode;
  children?: ReactNode;
  tone?: Tone;
  flush?: boolean;
  className?: string;
}) {
  const tones =
    {
      plain: 'bg-surface border-line',
      warm: 'bg-warm-wash border-warm/30',
      alert: 'bg-alert-wash border-alert/40',
      win: 'bg-win-wash border-win/30',
      accent: 'bg-accent-wash border-accent/25',
      info: 'bg-accent-wash border-accent/25',
    }[tone(toneProp, 'plain')] ?? 'bg-surface border-line';

  const hasHeader = title || right || action || eyebrow;

  return (
    <section
      className={`rounded-[22px] border ${tones} ${flush ? '' : 'p-4 sm:p-5'} shadow-[var(--shadow-soft)] ${className}`}
    >
      {hasHeader && (
        <header className="mb-3.5 flex items-start justify-between gap-3 border-b border-line/70 pb-3">
          <div className="min-w-0">
            {eyebrow && <p className="label-caps mb-1 text-[10.5px] text-accent">{eyebrow}</p>}
            {title && (
              <h2 className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{subtitle}</p>
            )}
          </div>
          {(right ?? action) && <div className="shrink-0">{right ?? action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Progressive detail: the screen stays short, the reasoning stays     */
/* one tap away rather than being deleted.                             */
/* ------------------------------------------------------------------ */

export function Detail({
  label = 'Why?',
  children,
  tone = 'quiet',
}: {
  label?: string;
  children: ReactNode;
  tone?: 'quiet' | 'card';
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={tone === 'card' ? 'rounded-[16px] border border-line bg-surface-2' : ''}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={`flex min-h-[40px] w-full items-center gap-1.5 text-left text-[13px] font-semibold text-accent ${
          tone === 'card' ? 'px-3' : ''
        }`}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <div
          id={id}
          className={`animate-rise pb-3 text-[13px] leading-relaxed text-muted ${tone === 'card' ? 'px-3' : ''}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  full,
  size = 'md',
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}) {
  const variants = {
    primary: 'bg-accent text-on-accent border-transparent shadow-[var(--shadow-soft)]',
    secondary: 'bg-surface text-text border-line hover:bg-surface-2',
    ghost: 'bg-transparent text-muted border-transparent hover:text-text',
    danger: 'bg-alert text-white border-transparent',
  }[variant];

  const sizes = {
    sm: 'min-h-[38px] px-3.5 text-[13px] rounded-[14px]',
    md: 'min-h-[46px] px-5 text-[14px] rounded-[16px]',
    lg: 'min-h-[54px] px-6 text-[15px] rounded-[18px]',
  }[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 border font-semibold tracking-[0.01em] transition-[transform,background-color,opacity] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${variants} ${sizes} ${full ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="mb-3.5">
      <label htmlFor={htmlFor} className="label-caps mb-1.5 block text-[10.5px] text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-faint">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full min-h-[46px] rounded-[16px] border border-line bg-surface-2 px-3.5 text-text placeholder:text-faint transition-colors focus:border-accent focus:bg-surface';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-[16px] border border-line bg-surface-2 p-3.5 text-text placeholder:text-faint transition-colors focus:border-accent focus:bg-surface ${props.className ?? ''}`}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="mb-2 flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[16px] border border-line bg-surface-2 px-3 text-[14px]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          checked ? 'border-accent bg-accent' : 'border-line bg-surface'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform duration-200 ${
            checked ? 'translate-x-[22px] bg-on-accent' : 'translate-x-[3px] bg-faint'
          }`}
        />
      </button>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

/** 1-5 rating. Big targets, keyboard accessible. */
export function Scale({
  value,
  onChange,
  lowLabel,
  highLabel,
  name,
}: {
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  name: string;
}) {
  return (
    <div>
      <div role="radiogroup" aria-label={name} className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${name}: ${n} out of 5`}
            onClick={() => onChange(n)}
            className={`min-h-[52px] flex-1 rounded-[16px] border text-[15px] font-semibold tabular-nums transition-all duration-150 active:scale-95 ${
              value === n
                ? 'border-accent bg-accent text-on-accent shadow-[var(--shadow-soft)]'
                : 'border-line bg-surface-2 text-muted hover:border-accent/40'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-faint">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Readouts - ledger entries.                                          */
/* ------------------------------------------------------------------ */

export function Meter({
  value,
  max,
  label,
  unit = '',
  tone: toneProp = 'accent',
}: {
  value: number;
  max: number;
  label: string;
  unit?: string;
  tone?: Tone;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const bar =
    {
      accent: 'bg-accent-strong',
      win: 'bg-win',
      warm: 'bg-warm',
      alert: 'bg-alert',
      plain: 'bg-accent-strong',
    }[tone(toneProp, 'accent')] ?? 'bg-accent-strong';
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="truncate text-[13px] font-medium">{label}</span>
        <span className="shrink-0 text-[13px] tabular-nums text-muted">
          <span className="font-semibold text-text">
            {value}
            {unit}
          </span>{' '}
          / {max}
          {unit}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${pct} percent of target`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** The headline number on the Today screen. */
export function Ring({
  value,
  max,
  label,
  sub,
  size = 132,
}: {
  value: number;
  max: number;
  label: string;
  sub?: string;
  size?: number;
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth="9"
            className="stroke-surface-2"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            className="animate-sweep stroke-accent-strong"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ ['--dash-from' as string]: `${c}` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-[30px] font-semibold leading-none tabular-nums">
            {value}
          </span>
          <span className="mt-1 text-[11px] text-faint">of {max}</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-semibold">{label}</p>
      {sub && <p className="text-[12px] text-faint">{sub}</p>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-3">
      <div className="label-caps text-[10px] text-faint">{label}</div>
      <div className="mt-1.5 font-serif text-[22px] font-semibold leading-none tabular-nums">
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-faint">{sub}</div>}
    </div>
  );
}

export function Pill({ children, tone: toneProp = 'plain' }: { children: ReactNode; tone?: Tone }) {
  const tones =
    {
      plain: 'bg-surface-2 text-muted border-line',
      win: 'bg-win-wash text-win border-win/25',
      warm: 'bg-warm-wash text-warm border-warm/25',
      alert: 'bg-alert-wash text-alert border-alert/25',
      accent: 'bg-accent-wash text-accent border-accent/25',
      info: 'bg-accent-wash text-accent border-accent/25',
    }[tone(toneProp, 'plain')] ?? 'bg-surface-2 text-muted border-line';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums ${tones}`}
    >
      {children}
    </span>
  );
}

/** Counter used all over the Today screen. */
export function Stepper({
  Icon,
  label,
  value,
  unit,
  goal,
  step,
  onChange,
}: {
  Icon: typeof Plus;
  label: string;
  value: number;
  unit: string;
  goal: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const done = value >= goal;
  return (
    <div className="rounded-[18px] border border-line bg-surface-2 p-3">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${done ? 'text-win' : 'text-faint'}`} aria-hidden />
        <span className="text-[13px] font-semibold">{label}</span>
        <span className="ml-auto text-[13px] tabular-nums text-muted">
          <span className={`font-semibold ${done ? 'text-win' : 'text-text'}`}>
            {value}
            {unit}
          </span>{' '}
          / {goal.toLocaleString()}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label={`Less ${label}`}
          onClick={() => onChange(value - step)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-accent/40 active:scale-95"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress`}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${done ? 'bg-win' : 'bg-accent-strong'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          aria-label={`More ${label}`}
          onClick={() => onChange(value + step)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-accent/40 active:scale-95"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* States and messages                                                 */
/* ------------------------------------------------------------------ */

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 p-6 text-[14px] text-muted" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}...
    </div>
  );
}

export function Empty({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-dashed border-rule bg-surface-2/40 px-4 py-8 text-center">
      <p className="font-serif text-[17px] font-semibold">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{detail}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Notice({
  tone: toneProp = 'info',
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}) {
  const table: Record<string, { cls: string; ic: string; Icon: typeof Info }> = {
    accent: { cls: 'bg-accent-wash border-accent/25', ic: 'text-accent', Icon: Info },
    info: { cls: 'bg-accent-wash border-accent/25', ic: 'text-accent', Icon: Info },
    plain: { cls: 'bg-surface-2 border-line', ic: 'text-faint', Icon: Info },
    warm: { cls: 'bg-warm-wash border-warm/30', ic: 'text-warm', Icon: AlertTriangle },
    alert: { cls: 'bg-alert-wash border-alert/40', ic: 'text-alert', Icon: AlertTriangle },
    win: { cls: 'bg-win-wash border-win/30', ic: 'text-win', Icon: Check },
  };
  const map = table[tone(toneProp, 'accent')] ?? table.accent;
  const { Icon } = map;
  return (
    <div className={`flex gap-3 rounded-[18px] border p-3.5 text-[13px] ${map.cls}`} role="note">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${map.ic}`} aria-hidden />
      <div className="min-w-0 leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  );
}

export function ScrollX({ children }: { children: ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}

/** The masthead that opens every leaf: a dateline-style page title. */
export function PageTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-5 border-b border-rule pb-3.5">
      <h1 className="font-serif text-[27px] font-semibold leading-[1.05] sm:text-[32px]">
        {children}
      </h1>
      {sub && <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{sub}</p>}
    </div>
  );
}

/** Ruled index tabs at the top of a grouped section. */
export function SegTabs({
  items,
  active,
  onPick,
}: {
  items: { key: string; label: string }[];
  active: string;
  onPick: (key: string) => void;
}) {
  return (
    <div className="mb-5 w-full overflow-x-auto border-b border-rule">
      <div role="tablist" className="flex w-full min-w-max gap-1">
        {items.map((it) => {
          const on = it.key === active;
          return (
            <button
              key={it.key}
              role="tab"
              aria-selected={on}
              type="button"
              onClick={() => onPick(it.key)}
              className={`relative min-h-[42px] whitespace-nowrap px-3.5 pb-2.5 pt-1 text-[13px] font-semibold transition-colors ${
                on ? 'text-accent' : 'text-faint hover:text-muted'
              }`}
            >
              {it.label}
              {on && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-[2.5px] rounded-full bg-accent-strong"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Names kept from the earlier version so every page keeps working.     */
/* ------------------------------------------------------------------ */

export const ProgressBar = Meter;
export const SectionHeading = PageTitle;

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Notice tone="alert" title="Something went wrong">
      <p>{message}</p>
      {onRetry && (
        <div className="mt-2">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </Notice>
  );
}
