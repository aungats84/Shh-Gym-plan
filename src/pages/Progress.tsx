import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useData } from '@/state/DataContext';
import { usePlan } from '@/state/usePlan';
import {
  Button,
  Card,
  Empty,
  Field,
  Notice,
  ScrollX,
  SectionHeading,
  Select,
  TextArea,
  TextInput,
} from '@/components/ui';
import { useChartTheme } from '@/components/chartTheme';
import { addDays, prettyDate, todayISO, weekStart } from '@/lib/time';
import { bmi } from '@/domain/nutrition';
import { totalsFor } from '@/domain/grocery';
import { sessionsInWeek } from '@/domain/progression';

type Range = 30 | 90 | 365;

export default function Progress() {
  const data = useData();
  const plan = usePlan();
  const theme = useChartTheme();
  const [range, setRange] = useState<Range>(90);
  const [showTable, setShowTable] = useState(false);

  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [note, setNote] = useState('');
  const [photoNote, setPhotoNote] = useState('');

  const from = addDays(todayISO(), -range);
  const measurements = useMemo(
    () =>
      data.measurements.filter((m) => m.date >= from).sort((a, b) => a.date.localeCompare(b.date)),
    [data.measurements, from],
  );

  /* Weekly averages smooth out day-to-day water swings. A single
     weigh-in means almost nothing on its own. */
  const weightSeries = useMemo(() => {
    const byWeek = new Map<string, number[]>();
    for (const m of measurements) {
      if (m.weight_kg == null) continue;
      const w = weekStart(m.date);
      (byWeek.get(w) ?? byWeek.set(w, []).get(w)!).push(m.weight_kg);
    }
    const weekly = [...byWeek.entries()].sort().map(([w, values]) => ({
      date: w,
      average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
    }));
    return measurements
      .filter((m) => m.weight_kg != null)
      .map((m) => ({
        date: m.date,
        daily: m.weight_kg as number,
        average: weekly.find((x) => x.date === weekStart(m.date))?.average ?? null,
      }));
  }, [measurements]);

  const waistSeries = measurements
    .filter((m) => m.waist_cm != null)
    .map((m) => ({ date: m.date, waist: m.waist_cm as number }));

  const weeklyTraining = useMemo(() => {
    const weeks: { week: string; sessions: number; sets: number }[] = [];
    for (let i = 7; i >= 0; i -= 1) {
      const ws = weekStart(addDays(todayISO(), -i * 7));
      const done = sessionsInWeek(data.workouts, ws);
      weeks.push({
        week: ws.slice(5),
        sessions: done.length,
        sets: done.reduce((n, s) => n + s.sets.filter((x) => x.done).length, 0),
      });
    }
    return weeks;
  }, [data.workouts]);

  const foodSeries = useMemo(() => {
    const days: { date: string; kcal: number; protein: number; cost: number }[] = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = addDays(todayISO(), -i);
      const t = totalsFor(data.meal_selections.filter((m) => m.date === d));
      days.push({ date: d.slice(5), kcal: t.kcal, protein: t.protein_g, cost: t.cost_thb });
    }
    return days;
  }, [data.meal_selections]);

  const habitSeries = useMemo(() => {
    const days: { date: string; water: number; steps: number; sleep: number }[] = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = addDays(todayISO(), -i);
      const log = data.daily_logs.find((l) => l.date === d);
      days.push({
        date: d.slice(5),
        water: log?.water_l ?? 0,
        steps: log?.steps ?? 0,
        sleep: log?.sleep_hours ?? 0,
      });
    }
    return days;
  }, [data.daily_logs]);

  function saveMeasurement() {
    if (!weight && !waist && !note && !photoNote) return;
    data.upsert('measurements', {
      date: todayISO(),
      weight_kg: weight ? Number(weight) : null,
      waist_cm: waist ? Number(waist) : null,
      hip_cm: null,
      arm_cm: null,
      thigh_cm: null,
      note,
      photo_note: photoNote,
    });
    setWeight('');
    setWaist('');
    setNote('');
    setPhotoNote('');
  }

  const tooltipStyle = {
    background: theme.surface,
    border: `1px solid ${theme.grid}`,
    borderRadius: 8,
    color: theme.text,
    fontSize: 12,
  };
  const axisProps = {
    stroke: theme.axis,
    tick: { fill: theme.muted, fontSize: 11 },
    tickLine: false,
    axisLine: { stroke: theme.grid },
  };

  /** "24 Aug" - full ISO dates do not fit a 390px screen. */
  const shortDate = (value: unknown) => {
    const iso = String(value ?? '');
    const parts = iso.split('-');
    if (parts.length < 2) return iso;
    const [m, d] = parts.length === 3 ? [parts[1], parts[2]] : parts;
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${Number(d)} ${months[Number(m) - 1] ?? ''}`.trim();
  };

  const latest = measurements.at(-1);
  const first = measurements.find((m) => m.weight_kg != null);

  return (
    <div className="space-y-4">
      <SectionHeading sub="Trends matter. A single weigh-in does not.">Progress</SectionHeading>

      <Card title="Add today's numbers">
        <div className="grid gap-x-3 sm:grid-cols-2">
          <Field label="Weight (kg)" htmlFor="w">
            <TextInput
              id="w"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Field>
          <Field label="Waist (cm)" htmlFor="wa" hint="Measure at the navel, same time of day.">
            <TextInput
              id="wa"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Note (optional)">
          <TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Field
          label="Photo note (optional)"
          hint="Photos are never uploaded anywhere. Keep them in your phone's album and just note the date here."
        >
          <TextInput value={photoNote} onChange={(e) => setPhotoNote(e.target.value)} />
        </Field>
        <Button size="sm" onClick={saveMeasurement}>
          Save
        </Button>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label="Date range"
          value={range}
          onChange={(e) => setRange(Number(e.target.value) as Range)}
          className="max-w-[180px]"
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </Select>
        <Button size="sm" variant="secondary" onClick={() => setShowTable((s) => !s)}>
          {showTable ? 'Show charts' : 'Show as a table'}
        </Button>
      </div>

      <Notice tone="info" title="How to read this">
        Body weight moves up and down by a kilogram or more from water and food alone. Look at the
        weekly average line, not the daily dots, and give any change at least two to three weeks
        before deciding it means something.
      </Notice>

      {showTable ? (
        <Card title="All measurements">
          {measurements.length === 0 ? (
            <Empty title="Nothing recorded yet" detail="Add a weight or waist measurement above." />
          ) : (
            <ScrollX>
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="py-1.5 pr-3 font-medium">Date</th>
                    <th className="py-1.5 pr-3 font-medium">Weight</th>
                    <th className="py-1.5 pr-3 font-medium">Waist</th>
                    <th className="py-1.5 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {[...measurements].reverse().map((m) => (
                    <tr key={m.date} className="border-b border-border last:border-0">
                      <td className="py-1.5 pr-3">{prettyDate(m.date)}</td>
                      <td className="py-1.5 pr-3 tabular-nums">{m.weight_kg ?? '-'}</td>
                      <td className="py-1.5 pr-3 tabular-nums">{m.waist_cm ?? '-'}</td>
                      <td className="py-1.5 text-muted">{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollX>
          )}
        </Card>
      ) : (
        <>
          <Card
            title="Body weight"
            subtitle="Dots are single weigh-ins. The line is the weekly average."
          >
            {weightSeries.length < 2 ? (
              <Empty
                title="Not enough data yet"
                detail="Record your weight a few times and the trend will appear here."
              />
            ) : (
              <>
                <div className="flex flex-wrap gap-4 pb-2 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: theme.series[0] }}
                      aria-hidden
                    />
                    Weekly average
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: theme.series[1] }}
                      aria-hidden
                    />
                    Single weigh-in
                  </span>
                </div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weightSeries}
                      margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid stroke={theme.grid} vertical={false} />
                      <XAxis
                        dataKey="date"
                        {...axisProps}
                        minTickGap={28}
                        tickFormatter={shortDate}
                      />
                      <YAxis {...axisProps} domain={['dataMin - 1', 'dataMax + 1']} width={52} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ stroke: theme.grid }}
                        labelFormatter={shortDate}
                      />
                      <Line
                        type="monotone"
                        dataKey="daily"
                        name="Single weigh-in"
                        stroke={theme.series[1]}
                        strokeWidth={0}
                        dot={{ r: 3, fill: theme.series[1], stroke: theme.surface, strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        name="Weekly average"
                        stroke={theme.series[0]}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {first?.weight_kg && latest?.weight_kg && (
                  <p className="mt-2 text-sm text-muted">
                    Change since {prettyDate(first.date)}:{' '}
                    <strong className="text-text">
                      {(latest.weight_kg - first.weight_kg).toFixed(1)} kg
                    </strong>
                    . BMI now {bmi(latest.weight_kg, data.profile?.height_cm ?? 152)}.
                  </p>
                )}
              </>
            )}
          </Card>

          <Card title="Waist" subtitle="Often a better signal than the scale.">
            {waistSeries.length < 2 ? (
              <Empty title="Not enough data yet" detail="Measure your waist once a week." />
            ) : (
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waistSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke={theme.grid} vertical={false} />
                    <XAxis
                      dataKey="date"
                      {...axisProps}
                      minTickGap={28}
                      tickFormatter={shortDate}
                    />
                    <YAxis {...axisProps} domain={['dataMin - 2', 'dataMax + 2']} width={52} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ stroke: theme.grid }}
                      labelFormatter={shortDate}
                    />
                    <Line
                      type="monotone"
                      dataKey="waist"
                      name="Waist (cm)"
                      stroke={theme.series[0]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: theme.series[0], stroke: theme.surface, strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card
            title="Sessions completed"
            subtitle={`The dashed line is your target of ${data.profile?.training_days_per_week ?? 4} a week.`}
          >
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTraining} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis dataKey="week" {...axisProps} tickFormatter={shortDate} />
                  <YAxis {...axisProps} allowDecimals={false} width={52} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: theme.grid, fillOpacity: 0.4 }}
                  />
                  <ReferenceLine
                    y={data.profile?.training_days_per_week ?? 4}
                    stroke={theme.reference}
                    strokeDasharray="4 4"
                  />
                  <Bar
                    dataKey="sessions"
                    name="Sessions"
                    fill={theme.series[0]}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Working sets per week" subtitle="Total sets you actually completed.">
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTraining} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis dataKey="week" {...axisProps} tickFormatter={shortDate} />
                  <YAxis {...axisProps} allowDecimals={false} width={52} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: theme.grid, fillOpacity: 0.4 }}
                  />
                  <Bar
                    dataKey="sets"
                    name="Sets"
                    fill={theme.series[2]}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Calories and protein are different scales, so they get their
              own charts rather than sharing two y-axes on one. */}
          <Card
            title="Calories logged"
            subtitle={`Dashed line is your target of ${plan.effectiveKcal} kcal.`}
          >
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={foodSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis dataKey="date" {...axisProps} minTickGap={20} tickFormatter={shortDate} />
                  <YAxis {...axisProps} width={52} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: theme.grid, fillOpacity: 0.4 }}
                  />
                  <ReferenceLine
                    y={plan.effectiveKcal}
                    stroke={theme.reference}
                    strokeDasharray="4 4"
                  />
                  <Bar
                    dataKey="kcal"
                    name="kcal"
                    fill={theme.series[1]}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card
            title="Protein logged"
            subtitle={`Dashed line is your target of ${plan.targets?.protein_g ?? 100} g.`}
          >
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={foodSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis dataKey="date" {...axisProps} minTickGap={20} tickFormatter={shortDate} />
                  <YAxis {...axisProps} width={52} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: theme.grid, fillOpacity: 0.4 }}
                  />
                  <ReferenceLine
                    y={plan.targets?.protein_g ?? 100}
                    stroke={theme.reference}
                    strokeDasharray="4 4"
                  />
                  <Bar
                    dataKey="protein"
                    name="Protein (g)"
                    fill={theme.series[0]}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card
            title="Steps"
            subtitle={`Dashed line is this week's goal of ${plan.stepGoal.toLocaleString()}.`}
          >
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis dataKey="date" {...axisProps} minTickGap={20} tickFormatter={shortDate} />
                  <YAxis {...axisProps} width={56} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: theme.grid, fillOpacity: 0.4 }}
                  />
                  <ReferenceLine y={plan.stepGoal} stroke={theme.reference} strokeDasharray="4 4" />
                  <Bar
                    dataKey="steps"
                    name="Steps"
                    fill={theme.series[3]}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      <Card title="If progress stalls">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Check you actually logged everything. Missing data looks like a plateau.</li>
          <li>Check sleep, stress and how the sessions have felt.</li>
          <li>
            Check whether the food estimates match reality - eating out is easy to underestimate.
          </li>
          <li>Change one thing only.</li>
          <li>Make the change small.</li>
          <li>Give it two to three weeks before judging it.</li>
        </ol>
        <p className="mt-2 text-sm text-muted">
          The exception is a safety issue. Those get acted on immediately, not after three weeks.
        </p>
      </Card>
    </div>
  );
}
