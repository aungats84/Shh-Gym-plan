import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

export default function RestTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [lastSeconds, setLastSeconds] = useState(seconds);

  // When the rest length changes (a different exercise), reset during
  // render rather than in an effect - React handles this without an
  // extra pass, and it avoids a frame showing the previous exercise's time.
  if (seconds !== lastSeconds) {
    setLastSeconds(seconds);
    setRemaining(seconds);
    setRunning(false);
  }

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 0;

  return (
    <div className="rounded-[8px] border border-line bg-surface-2 p-3">
      <div className="flex items-center gap-3">
        <span className="tabular-nums text-lg font-semibold" aria-live="polite">
          {mins}:{String(secs).padStart(2, '0')}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? 'Pause rest timer' : 'Start rest timer'}
          className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-line bg-surface"
        >
          {running ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setRemaining(seconds);
            setRunning(false);
          }}
          aria-label="Reset rest timer"
          className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-line bg-surface"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Rest {seconds} seconds. Resting properly is part of the workout, not a break from it.
      </p>
    </div>
  );
}
