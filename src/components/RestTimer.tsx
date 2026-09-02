import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Pause, Play, Plus, RotateCcw, X } from 'lucide-react';
import { playAlarm, primeAudio } from '@/lib/sounds';

/**
 * Two views of one countdown:
 *  - a compact inline timer inside each exercise card;
 *  - a full-screen, iOS-clock-style view you can read across the room.
 * A finish alarm plays the sound chosen in Settings (silent if "Off"), and the
 * screen is kept awake while the full-screen timer runs.
 */
export default function RestTimer({ seconds }: { seconds: number }) {
  const [base, setBase] = useState(seconds); // countdown length, grows with +15
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [full, setFull] = useState(false);
  const [lastSeconds, setLastSeconds] = useState(seconds);
  const wakeRef = useRef<WakeLockSentinel | null>(null);

  // A different exercise = a different rest length: reset during render.
  if (seconds !== lastSeconds) {
    setLastSeconds(seconds);
    setBase(seconds);
    setRemaining(seconds);
    setRunning(false);
    setDone(false);
  }

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setDone(true);
          playAlarm();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Keep the screen on while a full-screen timer is counting down.
  useEffect(() => {
    async function acquire() {
      try {
        if (full && running && 'wakeLock' in navigator) {
          wakeRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {
        /* wake lock is a nice-to-have; ignore failures */
      }
    }
    void acquire();
    return () => {
      try {
        void wakeRef.current?.release();
      } catch {
        /* ignore */
      }
      wakeRef.current = null;
    };
  }, [full, running]);

  // Lock background scroll while the full-screen timer is open.
  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [full]);

  function toggle() {
    primeAudio();
    if (done) {
      setBase(seconds);
      setRemaining(seconds);
      setDone(false);
      setRunning(true);
      return;
    }
    setRunning((r) => !r);
  }
  function reset() {
    setBase(seconds);
    setRemaining(seconds);
    setRunning(false);
    setDone(false);
  }
  function extend() {
    setBase((b) => b + 15);
    setRemaining((r) => r + 15);
    setDone(false);
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const label = `${mins}:${String(secs).padStart(2, '0')}`;
  const pct = done ? 100 : base > 0 ? Math.min(100, ((base - remaining) / base) * 100) : 0;

  const iconBtn =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-text transition-[transform,border-color] duration-150 hover:border-accent/40 active:scale-90';

  return (
    <>
      {/* ---------------- inline ---------------- */}
      <div className="rounded-[16px] border border-line bg-surface-2 p-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-[3.4rem] shrink-0 font-serif text-[22px] font-semibold tabular-nums ${
              done ? 'text-win' : ''
            }`}
            aria-live="polite"
          >
            {label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                done ? 'bg-win' : 'bg-accent-strong'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label={running ? 'Pause' : 'Start rest timer'}
            className={iconBtn}
          >
            {running ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
          </button>
          <button type="button" onClick={reset} aria-label="Reset rest timer" className={iconBtn}>
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              primeAudio();
              setFull(true);
            }}
            aria-label="Full-screen timer"
            className={iconBtn}
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <p className="mt-2 text-[12px] text-muted">
          {done
            ? 'Rest over — start your next set.'
            : `Rest ${seconds} seconds. Resting properly is part of the workout, not a break from it.`}
        </p>
      </div>

      {/* ---------------- full screen (focus mode) ---------------- */}
      {/* Portalled to <body> so no animated/transformed ancestor can trap the
          fixed overlay inside the content column. */}
      {full &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#140d0f] px-6 text-center"
            role="dialog"
            aria-modal="true"
            aria-label="Rest timer"
          >
            <button
              type="button"
              onClick={() => setFull(false)}
              aria-label="Close full-screen timer"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full text-[#c3b2b4] transition-colors hover:bg-white/5 hover:text-[#fbf7f6]"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <p className="label-caps text-[12px] text-[#c3b2b4]">
              {done ? 'Rest complete' : 'Resting'}
            </p>

            <div className="relative mt-8 flex items-center justify-center">
              <svg
                width="288"
                height="288"
                viewBox="0 0 288 288"
                className="-rotate-90"
                aria-hidden
              >
                <circle cx="144" cy="144" r="132" fill="none" stroke="#35252a" strokeWidth="8" />
                <circle
                  cx="144"
                  cy="144"
                  r="132"
                  fill="none"
                  stroke={done ? '#aebf92' : '#ffc9d8'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 132}
                  strokeDashoffset={2 * Math.PI * 132 * (1 - pct / 100)}
                  style={{ transition: 'stroke-dashoffset 300ms linear, stroke 300ms ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`font-serif text-[86px] font-semibold leading-none tabular-nums ${
                    done ? 'text-[#aebf92]' : 'text-[#fbf7f6]'
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-5">
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-[#fbf7f6] transition-transform active:scale-90"
              >
                <RotateCcw className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={running ? 'Pause' : 'Start'}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fbaac0] text-[#4f1b25] shadow-[0_10px_40px_-10px_rgba(251,170,192,0.6)] transition-transform active:scale-95"
              >
                {running ? (
                  <Pause className="h-8 w-8 fill-current" aria-hidden />
                ) : (
                  <Play className="h-8 w-8 fill-current" aria-hidden />
                )}
              </button>
              <button
                type="button"
                onClick={extend}
                aria-label="Add 15 seconds"
                className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-white/15 text-[#fbf7f6] transition-transform active:scale-90"
              >
                <Plus className="h-5 w-5" aria-hidden />
                <span className="text-[10px] font-semibold tabular-nums">15</span>
              </button>
            </div>

            <p className="mt-10 text-[13px] text-[#a49093]">
              {done ? 'Start your next set.' : `${seconds}s rest · resting is part of the workout`}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
