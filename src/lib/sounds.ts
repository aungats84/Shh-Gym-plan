/**
 * Rest-timer alarm sounds, synthesised with the Web Audio API so there are no
 * audio files to ship or verify. The AudioContext must be unlocked by a real
 * user gesture (browsers block autoplay), so `primeAudio()` is called from the
 * button that starts the timer; the alarm that fires later then plays fine.
 */

import { readCache, writeCache } from '@/lib/storage';

export type SoundId = 'chime' | 'bells' | 'beep' | 'radar' | 'off';

export const SOUND_OPTIONS: { id: SoundId; label: string }[] = [
  { id: 'chime', label: 'Chime' },
  { id: 'bells', label: 'Bells' },
  { id: 'beep', label: 'Beep' },
  { id: 'radar', label: 'Radar' },
  { id: 'off', label: 'Off (silent)' },
];

export function getTimerSound(): SoundId {
  const v = readCache<SoundId>('timer_sound', 'chime');
  return SOUND_OPTIONS.some((o) => o.id === v) ? v : 'chime';
}

export function setTimerSound(id: SoundId): void {
  writeCache('timer_sound', id);
}

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Unlock audio on a user gesture. Call from the timer's start/expand tap. */
export function primeAudio(): void {
  audio();
}

/** One shaped note: quick attack, exponential decay. */
function tone(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  peak = 0.22,
): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);
  const t0 = c.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Play the finish alarm. Defaults to the saved preference. */
export function playAlarm(id: SoundId = getTimerSound()): void {
  if (id === 'off') return;
  const c = audio();
  if (!c) return;
  switch (id) {
    case 'chime':
      // two soft bell strikes, a fifth apart
      for (const s of [0, 0.55]) {
        tone(c, 880, s, 0.6, 'sine', 0.22);
        tone(c, 1318.5, s + 0.02, 0.55, 'sine', 0.13);
      }
      break;
    case 'bells': {
      // a little glockenspiel run
      const notes = [659.3, 830.6, 987.8, 1318.5];
      notes.forEach((f, i) => tone(c, f, i * 0.16, 0.55, 'sine', 0.2));
      break;
    }
    case 'beep':
      for (let i = 0; i < 3; i += 1) tone(c, 1000, i * 0.28, 0.16, 'square', 0.14);
      break;
    case 'radar':
      // four rising pulses, a touch of urgency
      for (let i = 0; i < 4; i += 1) tone(c, 720 + i * 90, i * 0.22, 0.2, 'triangle', 0.2);
      break;
  }
}
