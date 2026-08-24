/**
 * Moving data between devices without a server.
 *
 * Three ways out, in order of how much data they carry:
 *   1. A backup file  - everything, any size. The reliable one.
 *   2. A transfer code - text you can paste into a chat to yourself.
 *   3. A QR code       - point the phone camera at the laptop screen.
 *
 * All three carry the same content. The code and the QR are the same
 * compressed string; the QR simply refuses politely when the data is
 * larger than a QR code can physically hold.
 */

export const TRANSFER_PREFIX = 'SANTRAIN1:';

/** Roughly the most a dense QR code can hold and still scan reliably. */
export const QR_SAFE_LIMIT = 1800;

/* ------------------------------------------------------------------ */
/* base64 that survives being pasted into a chat message               */
/* ------------------------------------------------------------------ */

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64ToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

/* ------------------------------------------------------------------ */
/* compression - halves the size, and every current browser has it     */
/* ------------------------------------------------------------------ */

function hasCompression(): boolean {
  return typeof globalThis.CompressionStream === 'function';
}

/**
 * Feeds bytes through a compression stream directly. Deliberately avoids
 * Blob.stream(), which is missing in some environments.
 */
async function pipe(bytes: Uint8Array, transform: TransformStream): Promise<Uint8Array> {
  const writer = transform.writable.getWriter();
  // The write side rejects too when the data is damaged. Swallow it here
  // and let the read side below report the failure, otherwise the same
  // error surfaces twice and one copy is unhandled.
  const writing = (async () => {
    await writer.write(bytes);
    await writer.close();
  })().catch(() => undefined);

  const chunks: Uint8Array[] = [];
  const reader = transform.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value as Uint8Array);
  }
  await writing;
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

async function gzip(text: string): Promise<Uint8Array> {
  return pipe(new TextEncoder().encode(text), new CompressionStream('gzip'));
}

async function gunzip(bytes: Uint8Array): Promise<string> {
  return new TextDecoder().decode(await pipe(bytes, new DecompressionStream('gzip')));
}

/* ------------------------------------------------------------------ */
/* the public bits                                                     */
/* ------------------------------------------------------------------ */

/** Turn the data into a single line of text. */
export async function encodeTransfer(data: unknown): Promise<string> {
  const json = JSON.stringify(data);
  if (hasCompression()) {
    return TRANSFER_PREFIX + 'z' + bytesToBase64(await gzip(json));
  }
  return TRANSFER_PREFIX + 'p' + bytesToBase64(new TextEncoder().encode(json));
}

/** Read a transfer code back. Throws a readable message if it is not one. */
export async function decodeTransfer(code: string): Promise<unknown> {
  const cleaned = code.trim().replace(/\s+/g, '');
  if (!cleaned.startsWith(TRANSFER_PREFIX)) {
    throw new Error(
      'That does not look like a San Training transfer code. It should start with SANTRAIN1:',
    );
  }
  const body = cleaned.slice(TRANSFER_PREFIX.length);
  const mode = body[0];
  const payload = body.slice(1);

  let json: string;
  try {
    const bytes = base64ToBytes(payload);
    if (mode === 'z') {
      if (!hasCompression()) {
        throw new Error('This browser is too old to read a compressed transfer code.');
      }
      json = await gunzip(bytes);
    } else if (mode === 'p') {
      json = new TextDecoder().decode(bytes);
    } else {
      throw new Error('Unknown transfer code version.');
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('browser')) throw err;
    throw new Error('The code is incomplete or was copied with something missing.', {
      cause: err,
    });
  }

  try {
    return JSON.parse(json);
  } catch {
    throw new Error('The code was read but the contents were damaged.');
  }
}

/** Basic shape check, so a random JSON file cannot wipe someone's data. */
export function looksLikeBackup(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const collections = [
    'daily_logs',
    'workouts',
    'meal_selections',
    'measurements',
    'readiness_checks',
  ];
  const hasAnyCollection = collections.some((c) => Array.isArray(v[c]));
  const hasProfile = typeof v.profile === 'object';
  return hasAnyCollection || hasProfile;
}

/** How many entries a backup holds, for the confirmation message. */
export function countEntries(value: unknown): number {
  if (typeof value !== 'object' || value === null) return 0;
  return Object.values(value as Record<string, unknown>).reduce<number>(
    (n, v) => n + (Array.isArray(v) ? v.length : 0),
    0,
  );
}
