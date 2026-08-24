/**
 * Everything on the site runs on Bangkok time, regardless of where the
 * device thinks it is. All dates are stored as "YYYY-MM-DD" strings.
 */

export const BANGKOK_TZ = 'Asia/Bangkok';

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: BANGKOK_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: BANGKOK_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** Today in Bangkok, as YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return dateFmt.format(now);
}

/** Current Bangkok wall-clock time as HH:MM. */
export function nowTimeHHMM(now: Date = new Date()): string {
  return timeFmt.format(now);
}

/** Hour of day (0-23) in Bangkok. */
export function bangkokHour(now: Date = new Date()): number {
  return Number(nowTimeHHMM(now).slice(0, 2));
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = Date.parse(`${fromISO}T00:00:00Z`);
  const b = Date.parse(`${toISO}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Monday of the week containing the given date. */
export function weekStart(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay(); // 0 = Sunday
  const back = dow === 0 ? 6 : dow - 1;
  return addDays(iso, -back);
}

export function last7Days(endISO: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(endISO, i - 6));
}

/** "Mon 24 Aug" - short and unambiguous. */
export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Relative wording for the last-sync line. */
export function timeAgo(isoTimestamp: string | null, now: Date = new Date()): string {
  if (!isoTimestamp) return 'never';
  const diff = now.getTime() - new Date(isoTimestamp).getTime();
  if (Number.isNaN(diff)) return 'never';
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/**
 * Hours between a bedtime and wake time written as "HH:MM",
 * handling the normal case where bedtime is after midnight.
 */
export function sleepWindowHours(bedtime: string, waketime: string): number {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  let diff = toMin(waketime) - toMin(bedtime);
  if (diff <= 0) diff += 24 * 60;
  return Math.round((diff / 60) * 10) / 10;
}

/** Subtract hours from an "HH:MM" clock time, wrapping at midnight. */
export function minusHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  let total = h * 60 + m - Math.round(hours * 60);
  total = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}
