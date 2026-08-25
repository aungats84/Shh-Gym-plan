import { useState } from 'react';
import { useData } from '@/state/DataContext';
import { Button, Card, Field, Notice, Pill, SectionHeading, TextInput } from '@/components/ui';
import {
  assessHeat,
  HEAT_ADAPTATION_NOTE,
  HEAT_EMERGENCY_TEXT,
  HEAT_WARNING_SIGNS,
  OVERHYDRATION_NOTE,
} from '@/domain/heat';
import { INDOOR_CARDIO } from '@/domain/cardio';
import { readCache, writeCache } from '@/lib/storage';
import { timeAgo } from '@/lib/time';

export default function HeatSafety() {
  const { profile } = useData();
  const saved = readCache('heat', { temp_c: null, humidity_pct: null, entered_at: null } as {
    temp_c: number | null;
    humidity_pct: number | null;
    entered_at: string | null;
  });
  const [temp, setTemp] = useState(saved.temp_c?.toString() ?? '');
  const [humidity, setHumidity] = useState(saved.humidity_pct?.toString() ?? '');
  const [conditions, setConditions] = useState(saved);

  const advice = assessHeat(conditions);

  function save() {
    const next = {
      temp_c: temp === '' ? null : Number(temp),
      humidity_pct: humidity === '' ? null : Number(humidity),
      entered_at: new Date().toISOString(),
    };
    setConditions(next);
    writeCache('heat', next);
  }

  const tone =
    advice.band === 'extreme' || advice.band === 'high'
      ? 'danger'
      : advice.band === 'caution'
        ? 'warn'
        : advice.band === 'ok'
          ? 'good'
          : 'plain';

  return (
    <div className="space-y-4">
      <SectionHeading sub="For running and anything else outdoors in Bangkok.">
        Heat safety
      </SectionHeading>

      <Notice tone="info" title="No weather service is connected">
        This site cannot look up the weather, and it will not pretend to. Check the temperature and
        humidity on your phone, type them in below, and you will get advice based on real numbers
        instead of a guess.
      </Notice>

      <Card title="Enter tonight's conditions">
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Field label="Temperature (°C)" htmlFor="temp">
            <TextInput
              id="temp"
              type="number"
              inputMode="decimal"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              placeholder="32"
            />
          </Field>
          <Field label="Humidity (%)" htmlFor="hum">
            <TextInput
              id="hum"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              placeholder="70"
            />
          </Field>
        </div>
        <Button size="sm" onClick={save}>
          Get advice
        </Button>
        {conditions.entered_at && (
          <p className="mt-2 text-xs text-muted">Entered {timeAgo(conditions.entered_at)}.</p>
        )}
      </Card>

      <Card
        title={advice.label}
        tone={tone}
        subtitle={advice.heat_index_c ? `Feels like about ${advice.heat_index_c}°C` : undefined}
      >
        <p className="text-sm">{advice.summary}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {advice.actions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Card>

      <Card title="Best time to run">
        <p className="text-sm">
          You wake around {profile?.waketime ?? '12:00'}, which lands you in the hottest part of the
          Bangkok day. Running <strong>after sunset</strong> - roughly 7 PM onwards - is the single
          biggest safety improvement available, and it also fits your evening training preference.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill tone="danger">11 AM - 4 PM: avoid</Pill>
          <Pill tone="warn">4 PM - 6 PM: still hot</Pill>
          <Pill tone="good">After 7 PM: best</Pill>
        </div>
      </Card>

      <Card title="Getting used to the heat">
        <p className="text-sm">{HEAT_ADAPTATION_NOTE}</p>
        <p className="mt-2 text-sm">
          You train indoors with air conditioning, so your first outdoor runs will feel harder than
          the pace suggests. That is normal and it improves within two weeks.
        </p>
      </Card>

      <Card title="Drinking">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Thirst is a good enough guide for easy sessions under an hour.</li>
          <li>
            On long or hot sessions, thirst lags behind what you have lost - drink at intervals
            rather than waiting for it.
          </li>
          <li>Short easy runs do not need an electrolyte drink.</li>
          <li>Prolonged heavy sweating is where electrolytes start to matter.</li>
          <li className="font-medium">{OVERHYDRATION_NOTE}</li>
        </ul>
      </Card>

      <Card title="Stop immediately if you notice" tone="danger">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {HEAT_WARNING_SIGNS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="mt-3">
          <Notice tone="danger" title="What to do">
            {HEAT_EMERGENCY_TEXT}
          </Notice>
        </div>
      </Card>

      <Card title="If it is raining or too hot" subtitle="These count as your cardio session.">
        <ul className="space-y-2 text-sm">
          {INDOOR_CARDIO.map((c) => (
            <li key={c.name} className="rounded-[8px] border border-line p-2">
              <p className="font-medium">{c.name}</p>
              <p className="text-muted">{c.detail}</p>
              <p className="mt-0.5 text-xs text-muted">Needs: {c.equipment}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Clothing">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Light colours, loose fit, and fabric that moves sweat away from the skin.</li>
          <li>A cap helps in daylight but traps heat after dark - take it off at night.</li>
          <li>Cotton holds sweat and gets heavy. It is fine for short runs, poor for long ones.</li>
        </ul>
      </Card>
    </div>
  );
}
