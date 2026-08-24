import type { ReactNode } from 'react';
import { AlertTriangle, Check, Info, Loader2, WifiOff } from 'lucide-react';

/* Card: the only container. Never put a Card inside another Card. */
export function Card({
  title,
  subtitle,
  action,
  children,
  tone = 'plain',
  className = '',
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  tone?: 'plain' | 'warn' | 'danger' | 'good' | 'accent';
  className?: string;
}) {
  const toneClass = {
    plain: 'bg-surface border-border',
    warn: 'bg-warn-soft border-warn/40',
    danger: 'bg-danger-soft border-danger/40',
    good: 'bg-good-soft border-good/40',
    accent: 'bg-accent-soft border-accent/30',
  }[tone];

  return (
    <section className={`rounded-[8px] border ${toneClass} p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold leading-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

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
  size?: 'sm' | 'md';
  ariaLabel?: string;
}) {
  const variants = {
    primary: 'bg-accent text-accent-text border-accent hover:opacity-90',
    secondary: 'bg-surface text-text border-border hover:bg-surface-2',
    ghost: 'bg-transparent text-text border-transparent hover:bg-surface-2',
    danger: 'bg-danger text-white border-danger hover:opacity-90',
  }[variant];
  // 44px minimum height keeps touch targets usable on a phone.
  const sizes = { sm: 'min-h-[38px] px-3 text-sm', md: 'min-h-[44px] px-4 text-sm' }[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 rounded-[8px] border font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${variants} ${sizes} ${full ? 'w-full' : ''}`}
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
    <div className="mb-3">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full min-h-[44px] rounded-[8px] border border-border bg-surface px-3 text-text placeholder:text-muted';

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
      className={`w-full rounded-[8px] border border-border bg-surface p-3 text-text placeholder:text-muted ${props.className ?? ''}`}
    />
  );
}

/** A 1-5 rating row. Large targets, works with keyboard. */
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
            className={`min-h-[44px] flex-1 rounded-[8px] border text-sm font-medium ${
              value === n
                ? 'border-accent bg-accent text-accent-text'
                : 'border-border bg-surface text-text hover:bg-surface-2'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  label,
  unit = '',
  tone = 'accent',
}: {
  value: number;
  max: number;
  label: string;
  unit?: string;
  tone?: 'accent' | 'good' | 'warn';
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const bar = { accent: 'bg-accent', good: 'bg-good', warn: 'bg-warn' }[tone];
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="truncate">{label}</span>
        <span className="shrink-0 tabular-nums text-muted">
          {value}
          {unit} / {max}
          {unit}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${pct} percent of target`}
      >
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-[8px] border border-border bg-surface-2 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums leading-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = 'plain',
}: {
  children: ReactNode;
  tone?: 'plain' | 'good' | 'warn' | 'danger' | 'accent';
}) {
  const tones = {
    plain: 'bg-surface-2 text-muted border-border',
    good: 'bg-good-soft text-good border-good/30',
    warn: 'bg-warn-soft text-warn border-warn/30',
    danger: 'bg-danger-soft text-danger border-danger/30',
    accent: 'bg-accent-soft text-accent border-accent/30',
  }[tone];
  return (
    <span className={`inline-block rounded-[6px] border px-2 py-0.5 text-xs font-medium ${tones}`}>
      {children}
    </span>
  );
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 p-6 text-sm text-muted" role="status">
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
    <div className="rounded-[8px] border border-dashed border-border p-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{detail}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

export function Notice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn' | 'danger' | 'good' | 'offline';
  title?: string;
  children: ReactNode;
}) {
  const map = {
    info: { cls: 'bg-accent-soft border-accent/30 text-text', Icon: Info },
    warn: { cls: 'bg-warn-soft border-warn/40 text-text', Icon: AlertTriangle },
    danger: { cls: 'bg-danger-soft border-danger/50 text-text', Icon: AlertTriangle },
    good: { cls: 'bg-good-soft border-good/40 text-text', Icon: Check },
    offline: { cls: 'bg-surface-2 border-border text-text', Icon: WifiOff },
  }[tone];
  const { Icon } = map;
  return (
    <div className={`flex gap-3 rounded-[8px] border p-3 text-sm ${map.cls}`} role="note">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Notice tone="danger" title="Something went wrong">
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

/** Horizontal-scroll wrapper so wide tables never scroll the page. */
export function ScrollX({ children }: { children: ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}

export function SectionHeading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-semibold sm:text-2xl">{children}</h1>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}
