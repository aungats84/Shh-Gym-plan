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
/* Surfaces                                                            */
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

  return (
    <section
      className={`rounded-[16px] border ${tones} ${flush ? '' : 'p-4 sm:p-5'} shadow-[var(--shadow-soft)] ${className}`}
    >
      {(title || right || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="text-[15px] font-semibold leading-tight">{title}</h2>}
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
    <div className={tone === 'card' ? 'rounded-[12px] border border-line bg-surface-2' : ''}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={`flex min-h-[40px] w-full items-center gap-1.5 text-left text-[13px] font-medium text-accent ${
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
    secondary: 'bg-surface-2 text-text border-line',
    ghost: 'bg-transparent text-muted border-transparent',
    danger: 'bg-alert text-white border-transparent',
  }[variant];

  const sizes = {
    sm: 'min-h-[38px] px-3 text-[13px] rounded-[10px]',
    md: 'min-h-[46px] px-4 text-[14px] rounded-[12px]',
    lg: 'min-h-[54px] px-5 text-[15px] rounded-[14px]',
  }[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 border font-semibold transition-[transform,opacity] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${variants} ${sizes} ${full ? 'w-full' : ''}`}
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
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-faint">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full min-h-[46px] rounded-[12px] border border-line bg-surface-2 px-3.5 text-text placeholder:text-faint transition-colors focus:border-accent';

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
      className={`w-full rounded-[12px] border border-line bg-surface-2 p-3.5 text-text placeholder:text-faint focus:border-accent ${props.className ?? ''}`}
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
    <label className="mb-2 flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[12px] border border-line bg-surface-2 px-3 text-[14px]">
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
            className={`min-h-[52px] flex-1 rounded-[12px] border text-[15px] font-semibold transition-all duration-150 active:scale-95 ${
              value === n
                ? 'border-accent bg-accent text-on-accent'
                : 'border-line bg-surface-2 text-muted'
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
/* Readouts                                                            */
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
    { accent: 'bg-accent', win: 'bg-win', warm: 'bg-warm', alert: 'bg-alert', plain: 'bg-accent' }[
      tone(toneProp, 'accent')
    ] ?? 'bg-accent';
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
            className="animate-sweep stroke-accent"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ ['--dash-from' as string]: `${c}` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[26px] font-bold leading-none tabular-nums">
            {value}
          </span>
          <span className="mt-0.5 text-[11px] text-faint">of {max}</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-semibold">{label}</p>
      {sub && <p className="text-[12px] text-faint">{sub}</p>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-surface p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-1 font-display text-[19px] font-semibold leading-none tabular-nums">
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
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones}`}
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
    <div className="rounded-[14px] border border-line bg-surface-2 p-3">
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-line bg-surface active:scale-95"
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
            className={`h-full rounded-full transition-[width] duration-500 ${done ? 'bg-win' : 'bg-accent'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          aria-label={`More ${label}`}
          onClick={() => onChange(value + step)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-line bg-surface active:scale-95"
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
    <div className="rounded-[14px] border border-dashed border-line px-4 py-7 text-center">
      <p className="text-[14px] font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">{detail}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
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
    <div className={`flex gap-3 rounded-[14px] border p-3.5 text-[13px] ${map.cls}`} role="note">
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

export function PageTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h1 className="font-display text-[22px] font-bold sm:text-[26px]">{children}</h1>
      {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
    </div>
  );
}

/** Horizontal tabs used at the top of a grouped section. */
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
    <div className="mb-4 w-full overflow-x-auto">
      <div
        role="tablist"
        className="flex w-full min-w-max gap-1 rounded-[14px] border border-line bg-surface p-1"
      >
        {items.map((it) => {
          const on = it.key === active;
          return (
            <button
              key={it.key}
              role="tab"
              aria-selected={on}
              type="button"
              onClick={() => onPick(it.key)}
              className={`min-h-[40px] flex-1 whitespace-nowrap rounded-[10px] px-3 text-[13px] font-semibold transition-colors ${
                on ? 'bg-accent text-on-accent' : 'text-muted'
              }`}
            >
              {it.label}
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
