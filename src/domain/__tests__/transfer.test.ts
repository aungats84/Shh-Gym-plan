import { describe, expect, it } from 'vitest';
import {
  countEntries,
  decodeTransfer,
  encodeTransfer,
  looksLikeBackup,
  QR_SAFE_LIMIT,
  TRANSFER_PREFIX,
} from '@/lib/transfer';

const sample = {
  profile: { user_id: 'local', display_name: 'San', age: 23, weight_kg: 52 },
  daily_logs: [
    { date: '2026-08-20', water_l: 1.5, steps: 4200 },
    { date: '2026-08-21', water_l: 2, steps: 5100 },
  ],
  workouts: [{ date: '2026-08-20', day_key: 'lower_a', status: 'completed' }],
  measurements: [],
};

describe('transfer codes', () => {
  it('survives a round trip unchanged', async () => {
    const code = await encodeTransfer(sample);
    expect(await decodeTransfer(code)).toEqual(sample);
  });

  it('is marked so it can be recognised when pasted', async () => {
    expect(await encodeTransfer(sample)).toMatch(new RegExp(`^${TRANSFER_PREFIX}`));
  });

  it('produces only characters that survive being pasted into a chat', async () => {
    const code = await encodeTransfer(sample);
    const body = code.slice(TRANSFER_PREFIX.length + 1);
    // No +, / or = which get mangled by URLs and some messaging apps.
    expect(body).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('tolerates line breaks and spaces added by a messaging app', async () => {
    const code = await encodeTransfer(sample);
    const mangled = code.slice(0, 20) + '\n  ' + code.slice(20, 40) + ' \n' + code.slice(40);
    expect(await decodeTransfer(mangled)).toEqual(sample);
  });

  it('compresses, so the code is smaller than the raw data', async () => {
    const big = {
      ...sample,
      daily_logs: Array.from({ length: 200 }, (_, i) => ({
        date: `2026-01-${i}`,
        water_l: 2,
        steps: 5000,
      })),
    };
    const code = await encodeTransfer(big);
    expect(code.length).toBeLessThan(JSON.stringify(big).length);
  });

  it('still works when the browser has no compression support', async () => {
    const original = globalThis.CompressionStream;
    // @ts-expect-error - deliberately removing it to exercise the fallback
    delete globalThis.CompressionStream;
    try {
      const code = await encodeTransfer(sample);
      expect(code.startsWith(`${TRANSFER_PREFIX}p`)).toBe(true);
      expect(await decodeTransfer(code)).toEqual(sample);
    } finally {
      globalThis.CompressionStream = original;
    }
  });

  it('rejects text that is not a transfer code', async () => {
    await expect(decodeTransfer('hello there')).rejects.toThrow(/SANTRAIN1/);
  });

  it('rejects a truncated code with a message that says what went wrong', async () => {
    const code = await encodeTransfer(sample);
    await expect(decodeTransfer(code.slice(0, code.length - 40))).rejects.toThrow(
      /incomplete|damaged/i,
    );
  });

  it('rejects an unknown version rather than guessing', async () => {
    await expect(decodeTransfer(`${TRANSFER_PREFIX}xABCD`)).rejects.toThrow();
  });

  it('keeps a small profile inside QR range', async () => {
    const code = await encodeTransfer({ profile: sample.profile });
    expect(code.length).toBeLessThan(QR_SAFE_LIMIT);
  });
});

describe('guarding against the wrong file', () => {
  it('accepts a real backup', () => {
    expect(looksLikeBackup(sample)).toBe(true);
  });

  it('accepts a backup holding only a profile', () => {
    expect(looksLikeBackup({ profile: { user_id: 'local' } })).toBe(true);
  });

  it('rejects unrelated JSON, so it cannot wipe someone by mistake', () => {
    expect(looksLikeBackup({ hello: 'world' })).toBe(false);
    expect(looksLikeBackup([1, 2, 3])).toBe(false);
    expect(looksLikeBackup('a string')).toBe(false);
    expect(looksLikeBackup(null)).toBe(false);
  });
});

describe('counting entries', () => {
  it('counts every row across the collections', () => {
    expect(countEntries(sample)).toBe(3);
  });

  it('is zero for nothing', () => {
    expect(countEntries({})).toBe(0);
    expect(countEntries(null)).toBe(0);
  });
});
