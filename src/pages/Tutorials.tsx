import { useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { Card, Notice, Pill, SectionHeading, TextInput } from '@/components/ui';
import { EXERCISES, MUSCLE_LABELS, type MuscleGroup } from '@/data/exercises';
import {
  COOLDOWN,
  GENERAL_WARMUP,
  LOWER_MOBILITY,
  UPPER_MOBILITY,
  WORKOUT_DAYS,
} from '@/data/program';
import { EVIDENCE_LIMITS, SOURCES } from '@/data/sources';

type GroupBy = 'day' | 'muscle';

export default function Tutorials() {
  const [query, setQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  const filtered = EXERCISES.filter(
    (e) =>
      query.trim() === '' ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.primary.some((m) => MUSCLE_LABELS[m].toLowerCase().includes(query.toLowerCase())),
  );

  const byMuscle = new Map<MuscleGroup, typeof EXERCISES>();
  for (const ex of filtered) {
    for (const m of ex.primary) {
      byMuscle.set(m, [...(byMuscle.get(m) ?? []), ex]);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading sub="Every exercise, how to warm up and stretch, and where the advice comes from.">
        Tutorials and sources
      </SectionHeading>

      <Notice tone="warn" title="About the video links">
        This site does <strong>not</strong> link to specific YouTube videos, because nobody has
        checked them and a link that has not been checked is a link that might be wrong, dead, or
        teaching bad form. Instead every exercise gives you an <strong>exact search phrase</strong>.
        Paste it into YouTube and pick a demonstration from a source you trust - a physiotherapist,
        a qualified coach, or a recognised organisation.
      </Notice>

      <Card title="Find an exercise">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or muscle"
            aria-label="Search exercises"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setGroupBy('day')}
            aria-pressed={groupBy === 'day'}
            className={`min-h-[38px] rounded-[8px] border px-3 text-sm ${
              groupBy === 'day' ? 'border-accent bg-accent-soft' : 'border-border'
            }`}
          >
            By workout day
          </button>
          <button
            type="button"
            onClick={() => setGroupBy('muscle')}
            aria-pressed={groupBy === 'muscle'}
            className={`min-h-[38px] rounded-[8px] border px-3 text-sm ${
              groupBy === 'muscle' ? 'border-accent bg-accent-soft' : 'border-border'
            }`}
          >
            By muscle
          </button>
        </div>
      </Card>

      {groupBy === 'day'
        ? WORKOUT_DAYS.map((day) => {
            const items = day.main
              .map((m) => EXERCISES.find((e) => e.id === m.exercise_id))
              .filter((e): e is (typeof EXERCISES)[number] => Boolean(e) && filtered.includes(e!));
            if (items.length === 0) return null;
            return (
              <Card key={day.key} title={day.name} subtitle={day.focus}>
                <ExerciseList items={items} />
              </Card>
            );
          })
        : [...byMuscle.entries()]
            .sort((a, b) => MUSCLE_LABELS[a[0]].localeCompare(MUSCLE_LABELS[b[0]]))
            .map(([muscle, items]) => (
              <Card key={muscle} title={MUSCLE_LABELS[muscle]}>
                <ExerciseList items={items} />
              </Card>
            ))}

      <Card title="Warm-up and mobility">
        <h3 className="mb-1 text-sm font-semibold">General warm-up</h3>
        <ul className="mb-3 space-y-1 text-sm">
          {GENERAL_WARMUP.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> ({s.duration}) - {s.detail}
            </li>
          ))}
        </ul>
        <h3 className="mb-1 text-sm font-semibold">Lower body days</h3>
        <ul className="mb-3 space-y-1 text-sm">
          {LOWER_MOBILITY.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> - {s.detail}
            </li>
          ))}
        </ul>
        <h3 className="mb-1 text-sm font-semibold">Upper body days</h3>
        <ul className="space-y-1 text-sm">
          {UPPER_MOBILITY.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> - {s.detail}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Search phrase for any of these: &quot;dynamic warm up before workout beginner&quot;.
        </p>
      </Card>

      <Card title="Stretching and cooldown">
        <ul className="space-y-1 text-sm">
          {COOLDOWN.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> ({s.hold}) - {s.detail}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Search phrase: &quot;static stretching routine after workout 5 minutes&quot;.
        </p>
      </Card>

      <Card
        title="Sources"
        subtitle={`Every link below was opened and checked on ${SOURCES[0].reviewed}.`}
      >
        <ul className="space-y-3">
          {SOURCES.map((s) => (
            <li key={s.id} className="rounded-[8px] border border-border p-3 text-sm">
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-1.5 font-medium underline"
              >
                {s.title}
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
              <p className="mt-0.5 text-muted">{s.organisation}</p>
              <p className="mt-0.5 text-xs text-muted">
                Published: {s.published} &middot; Last checked by this site: {s.reviewed}
              </p>
              <p className="mt-1.5 text-xs font-medium">Used for:</p>
              <ul className="list-disc pl-5 text-xs text-muted">
                {s.used_for.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="What this site cannot do" tone="warn">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {EVIDENCE_LIMITS.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ExerciseList({ items }: { items: typeof EXERCISES }) {
  return (
    <ul className="space-y-2">
      {items.map((ex) => (
        <li key={ex.id}>
          <details className="rounded-[8px] border border-border p-3">
            <summary className="cursor-pointer text-sm font-medium">
              {ex.name}
              <span className="ml-2 font-normal text-muted">
                {ex.primary.map((m) => MUSCLE_LABELS[m]).join(', ')}
              </span>
            </summary>

            <div className="mt-2 space-y-2 text-sm">
              <p>
                <span className="font-medium">Also works:</span>{' '}
                {ex.secondary.length
                  ? ex.secondary.map((m) => MUSCLE_LABELS[m]).join(', ')
                  : 'nothing much else'}
              </p>
              <div>
                <p className="font-medium">Form cues</p>
                <ul className="mt-0.5 list-disc pl-5">
                  {ex.cues.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Common mistakes</p>
                <ul className="mt-0.5 list-disc pl-5">
                  {ex.mistakes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <p>
                <span className="font-medium">Breathing:</span> {ex.breathing}
              </p>
              <p>
                <span className="font-medium">Safe starting weight:</span> {ex.starting_load}
              </p>
              <p>
                <span className="font-medium">Equipment swaps:</span> {ex.substitutions.join('; ')}
              </p>
              <p>
                <span className="font-medium">Easier:</span> {ex.easier}
              </p>
              <p>
                <span className="font-medium">Harder:</span> {ex.harder}
              </p>

              <div className="rounded-[8px] border border-border bg-surface-2 p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="warn">Tutorial not verified</Pill>
                </div>
                <p className="mt-1.5">
                  Search YouTube for:{' '}
                  <span className="font-medium">&quot;{ex.tutorial.search_phrase}&quot;</span>
                </p>
                <a
                  className="mt-1 inline-flex items-center gap-1 text-xs underline"
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.tutorial.search_phrase)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open that search on YouTube
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
                <p className="mt-1 text-xs text-muted">
                  This opens a search, not a specific video. Nobody has checked an individual video
                  for this exercise, so the site will not pretend one is recommended.
                </p>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
