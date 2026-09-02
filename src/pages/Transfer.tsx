import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, QrCode, Upload } from 'lucide-react';
import { useData } from '@/state/DataContext';
import { Button, Card, Field, Notice, SectionHeading, TextArea } from '@/components/ui';
import {
  countEntries,
  encodeTransfer,
  decodeTransfer,
  looksLikeBackup,
  QR_SAFE_LIMIT,
} from '@/lib/transfer';
import { todayISO } from '@/lib/time';

type Mode = 'merge' | 'replace';

export default function Transfer() {
  const data = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [code, setCode] = useState('');
  const [codeBusy, setCodeBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);

  // Derived, not stored: whether the data is simply too big for a QR.
  const qrTooBig = code.length > QR_SAFE_LIMIT;

  const [pasted, setPasted] = useState('');
  const [mode, setMode] = useState<Mode>('merge');
  const [result, setResult] = useState<{ tone: 'good' | 'danger'; text: string } | null>(null);

  const entries = countEntries(data.exportAll());

  /* ----------------------------- sending ----------------------------- */

  function downloadBackup() {
    const payload = {
      app: 'san-training',
      exported_at: new Date().toISOString(),
      ...data.exportAll(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `san-training-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function makeCode() {
    setCodeBusy(true);
    setCopied(false);
    setQrFailed(false);
    try {
      const text = await encodeTransfer(data.exportAll());
      setCode(text);
    } finally {
      setCodeBusy(false);
    }
  }

  // Draw the QR whenever a code exists and is small enough to scan.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!code || qrTooBig) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    QRCode.toCanvas(canvas, code, {
      width: 260,
      margin: 2,
      errorCorrectionLevel: 'L',
      color: { dark: '#000000', light: '#ffffff' },
    }).catch(() => setQrFailed(true));
  }, [code, qrTooBig]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  /* ---------------------------- receiving ---------------------------- */

  function applyIncoming(incoming: unknown, source: string) {
    if (!looksLikeBackup(incoming)) {
      setResult({
        tone: 'danger',
        text: 'That file does not look like a San Training backup, so nothing was changed.',
      });
      return;
    }
    const count = countEntries(incoming);
    if (mode === 'replace') {
      data.importAll(incoming as Record<string, never>);
      setResult({
        tone: 'good',
        text: `Replaced everything on this device with ${count.toLocaleString()} entries from ${source}.`,
      });
    } else {
      const { added, updated } = data.mergeAll(incoming as Record<string, never>);
      setResult({
        tone: 'good',
        text: `Merged ${source}: ${added} new entries added, ${updated} updated. Nothing was lost.`,
      });
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        applyIncoming(JSON.parse(String(reader.result)), 'the backup file');
      } catch {
        setResult({ tone: 'danger', text: 'That file could not be read as a backup.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handlePastedCode() {
    setResult(null);
    try {
      applyIncoming(await decodeTransfer(pasted), 'the transfer code');
      setPasted('');
    } catch (err) {
      setResult({
        tone: 'danger',
        text: err instanceof Error ? err.message : 'Could not read that code.',
      });
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading sub="Everything is stored on this device only. This page is how you move it to another one.">
        Transfer between devices
      </SectionHeading>

      <Notice tone="info" title="How this works">
        There is no account and no server, so nothing syncs by itself. To move your data you send it
        from one device and receive it on the other. Do it whenever you switch, or once a week as a
        backup.
      </Notice>

      {/* ============================ SEND ============================ */}
      <Card title="1. Backup file" subtitle="The reliable option. Works for any amount of data.">
        <p className="text-sm">
          Downloads a single file holding all {entries.toLocaleString()} of your entries. On an
          iPhone it saves to Files, and you can then send it to yourself however you like - AirDrop,
          email, LINE, or iCloud Drive.
        </p>
        <div className="mt-3">
          <Button onClick={downloadBackup}>
            <Download className="h-4 w-4" aria-hidden /> Download backup file
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Keep one of these somewhere safe. If the browser data is ever cleared, this file is the
          only way back.
        </p>
      </Card>

      <Card title="2. Transfer code" subtitle="Copy and paste it into a message to yourself.">
        <p className="text-sm">
          Turns your data into one long line of text. Paste it into LINE, Notes, or an email to
          yourself, then open that on the other device and paste it into the box below.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => void makeCode()} disabled={codeBusy}>
            {codeBusy ? 'Preparing...' : 'Create transfer code'}
          </Button>
          {code && (
            <Button variant="secondary" onClick={() => void copyCode()}>
              <Copy className="h-4 w-4" aria-hidden /> {copied ? 'Copied' : 'Copy'}
            </Button>
          )}
        </div>

        {code && (
          <>
            <div className="mt-3">
              <TextArea
                readOnly
                rows={4}
                value={code}
                aria-label="Transfer code"
                onFocus={(e) => e.currentTarget.select()}
                className="font-mono text-xs"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {code.length.toLocaleString()} characters. Copy all of it - a code missing its ending
              cannot be read.
            </p>
          </>
        )}
      </Card>

      <Card title="3. QR code" subtitle="Fastest for laptop to phone.">
        <p className="text-sm">
          Create the transfer code above, then point your phone camera at the square below. It only
          works while your data is small, so it is best early on or for moving your settings across.
        </p>
        <div className="mt-3 flex justify-center">
          {/* White background always, because a QR on a dark card will not scan. */}
          <div className="rounded-[16px] bg-white p-3">
            <canvas ref={canvasRef} width={260} height={260} aria-label="Transfer QR code" />
          </div>
        </div>
        {!code && (
          <p className="mt-2 text-center text-sm text-muted">
            Create a transfer code first and the QR will appear here.
          </p>
        )}
        {code && qrTooBig && (
          <div className="mt-3">
            <Notice tone="warn" title="Too much data for a QR code">
              Your data is {code.length.toLocaleString()} characters, which is more than a QR code
              can hold (about {QR_SAFE_LIMIT.toLocaleString()}). Use the backup file instead - it
              has no size limit.
            </Notice>
          </div>
        )}
        {qrFailed && (
          <div className="mt-3">
            <Notice tone="warn">
              The QR code could not be drawn. Use the backup file or the transfer code instead.
            </Notice>
          </div>
        )}
        {code && !qrTooBig && !qrFailed && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted">
            <QrCode className="h-3.5 w-3.5" aria-hidden /> Scan, then open the link and paste the
            code below.
          </p>
        )}
      </Card>

      {/* =========================== RECEIVE =========================== */}
      <Card
        title="Receive on this device"
        subtitle="Use the file or the code from your other device."
      >
        <Field label="What should happen to what is already on this device?">
          <div className="space-y-2">
            <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[16px] border border-line p-2 text-sm">
              <input
                type="radio"
                name="mode"
                className="mt-1 h-4 w-4"
                checked={mode === 'merge'}
                onChange={() => setMode('merge')}
              />
              <span>
                <strong>Merge</strong> - keep both. Where the same day exists on both devices, the
                newer version wins. Nothing is lost. <em>Recommended.</em>
              </span>
            </label>
            <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[16px] border border-line p-2 text-sm">
              <input
                type="radio"
                name="mode"
                className="mt-1 h-4 w-4"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
              />
              <span>
                <strong>Replace</strong> - throw away what is on this device and use the incoming
                data instead. Only for restoring onto a fresh device.
              </span>
            </label>
          </div>
        </Field>

        {mode === 'replace' && (
          <div className="mb-3">
            <Notice tone="warn">
              Replace deletes anything logged on this device that is not in the incoming data. If
              you are unsure, download a backup file first.
            </Notice>
          </div>
        )}

        <div className="mb-4">
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden /> Choose a backup file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <Field label="Or paste a transfer code">
          <TextArea
            rows={4}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="SANTRAIN1:..."
            className="font-mono text-xs"
          />
        </Field>
        <Button onClick={() => void handlePastedCode()} disabled={!pasted.trim()}>
          Apply transfer code
        </Button>

        {result && (
          <div className="mt-3">
            <Notice tone={result.tone === 'good' ? 'good' : 'danger'}>{result.text}</Notice>
          </div>
        )}
      </Card>

      <Card title="A routine that works">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Use whichever device is nearest during the day.</li>
          <li>Before switching, open this page and create a transfer code.</li>
          <li>Paste it into a message to yourself.</li>
          <li>
            On the other device, paste it in above with <strong>Merge</strong> selected.
          </li>
          <li>Once a week, download a backup file and keep it somewhere safe.</li>
        </ol>
        <p className="mt-2 text-sm text-muted">
          Merge is safe to run as often as you like. Running it twice with the same code changes
          nothing the second time.
        </p>
      </Card>
    </div>
  );
}
