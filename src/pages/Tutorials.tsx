import { useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { Card, Detail, Notice, PageTitle, Pill, SegTabs, TextInput } from '@/components/ui';
import VideoLink from '@/components/VideoLink';
import { EXERCISES, MUSCLE_LABELS, type MuscleGroup } from '@/data/exercises';
import {
  COOLDOWN,
  GENERAL_WARMUP,
  LOWER_MOBILITY,
  UPPER_MOBILITY,
  WORKOUT_DAYS,
} from '@/data/program';
import { EVIDENCE_LIMITS, SOURCES } from '@/data/sources';
import { VERIFIED_ON, videoFor } from '@/data/tutorials';

type View = 'moves' | 'warmup' | 'sources';

export default function Tutorials() {
  const [view, setView] = useState<View>('moves');
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<'day' | 'muscle'>('day');

  const matches = EXERCISES.filter(
    (e) =>
      query.trim() === '' ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.primary.some((m) => MUSCLE_LABELS[m].toLowerCase().includes(query.toLowerCase())),
  );

  const byMuscle = new Map<MuscleGroup, typeof EXERCISES>();
  for (const ex of matches) {
    for (const m of ex.primary) byMuscle.set(m, [...(byMuscle.get(m) ?? []), ex]);
  }

  const withVideo = EXERCISES.filter((e) => videoFor(e.id)).length;

  return (
    <div className="space-y-4">
      <PageTitle sub="Watch how every exercise is done, then check the evidence behind the plan.">
        How to
      </PageTitle>

      <SegTabs
        items={[
          { key: 'moves', label: 'Exercises' },
          { key: 'warmup', label: 'Warm-up' },
          { key: 'sources', label: 'Evidence' },
        ]}
        active={view}
        onPick={(k) => setView(k as View)}
      />

      {view === 'moves' && (
        <>
          <div className="flex items-center gap-2 rounded-[16px] border border-line bg-surface px-3">
            <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercise or muscle"
              aria-label="Search exercises"
              className="border-0 bg-transparent px-0"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {(['day', 'muscle'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(g)}
                  aria-pressed={group === g}
                  className={`min-h-[36px] rounded-full border px-3 text-[12.5px] font-semibold ${
                    group === g
                      ? 'border-accent bg-accent-wash text-accent'
                      : 'border-line text-muted'
                  }`}
                >
                  {g === 'day' ? 'By workout' : 'By muscle'}
                </button>
              ))}
            </div>
            <Pill tone="win">{withVideo} videos</Pill>
          </div>

          {group === 'day'
            ? WORKOUT_DAYS.map((day) => {
                const items = day.main
                  .map((m) => EXERCISES.find((e) => e.id === m.exercise_id))
                  .filter(
                    (e): e is (typeof EXERCISES)[number] => Boolean(e) && matches.includes(e!),
                  );
                if (!items.length) return null;
                return (
                  <Card key={day.key} title={day.name} eyebrow={day.focus}>
                    <MoveList items={items} />
                  </Card>
                );
              })
            : [...byMuscle.entries()]
                .sort((a, b) => MUSCLE_LABELS[a[0]].localeCompare(MUSCLE_LABELS[b[0]]))
                .map(([muscle, items]) => (
                  <Card key={muscle} title={MUSCLE_LABELS[muscle]}>
                    <MoveList items={items} />
                  </Card>
                ))}

          <p className="px-1 text-[12px] text-faint">
            Every video was checked on {VERIFIED_ON} to confirm it exists and matches the exercise.
            If one is later removed, a YouTube search opens instead of a dead link.
          </p>
        </>
      )}

      {view === 'warmup' && (
        <>
          <Card title="Every session starts here" eyebrow="5 minutes">
            <ol className="space-y-2 text-[13.5px]">
              {GENERAL_WARMUP.map((s, i) => (
                <li key={s.name} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-wash text-[11px] font-bold text-accent">
                    {i + 1}
                  </span>
                  <span>
                    <strong>{s.name}</strong> <span className="text-faint">({s.duration})</span>
                    <br />
                    <span className="text-muted">{s.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Leg days" eyebrow="Then add">
            <ul className="space-y-1.5 text-[13.5px]">
              {LOWER_MOBILITY.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}</strong> — <span className="text-muted">{s.detail}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Upper body days" eyebrow="Then add">
            <ul className="space-y-1.5 text-[13.5px]">
              {UPPER_MOBILITY.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}</strong> — <span className="text-muted">{s.detail}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Cooldown" eyebrow="After every session">
            <ul className="space-y-1.5 text-[13.5px]">
              {COOLDOWN.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}</strong> <span className="text-faint">({s.hold})</span>
                  <br />
                  <span className="text-muted">{s.detail}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {view === 'sources' && (
        <>
          <Notice tone="info" title="Where this plan comes from">
            Seven sources, each opened and checked on 24 August 2026.
          </Notice>

          {SOURCES.map((s) => (
            <Card key={s.id} title={s.title} eyebrow={s.organisation}>
              <p className="text-[12.5px] text-faint">
                {s.published} · checked {s.reviewed}
              </p>
              <Detail label="What it's used for">
                <ul className="list-disc space-y-1 pl-4">
                  {s.used_for.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              </Detail>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex min-h-[40px] items-center gap-1.5 text-[13px] font-semibold text-accent"
              >
                Open source
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </Card>
          ))}

          <Card title="What this app can't do" tone="warm">
            <ul className="list-disc space-y-1.5 pl-4 text-[13px]">
              {EVIDENCE_LIMITS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function MoveList({ items }: { items: typeof EXERCISES }) {
  return (
    <ul className="space-y-3">
      {items.map((ex) => (
        <li key={ex.id} className="rounded-[14px] border border-line p-3">
          <div className="mb-2.5">
            <p className="text-[14px] font-semibold">{ex.name}</p>
            <p className="text-[12px] text-faint">
              {ex.primary.map((m) => MUSCLE_LABELS[m]).join(' · ')}
            </p>
          </div>

          <VideoLink
            exerciseId={ex.id}
            exerciseName={ex.name}
            searchPhrase={ex.tutorial.search_phrase}
          />

          <div className="mt-2.5">
            <Detail label="Form cues and mistakes">
              <p className="mb-1 font-semibold text-text">Do this</p>
              <ul className="mb-2.5 list-disc space-y-0.5 pl-4">
                {ex.cues.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="mb-1 font-semibold text-text">Avoid this</p>
              <ul className="mb-2.5 list-disc space-y-0.5 pl-4">
                {ex.mistakes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="mb-1">
                <strong className="text-text">Breathing:</strong> {ex.breathing}
              </p>
              <p className="mb-1">
                <strong className="text-text">Starting weight:</strong> {ex.starting_load}
              </p>
              <p className="mb-1">
                <strong className="text-text">Easier:</strong> {ex.easier}
              </p>
              <p>
                <strong className="text-text">Harder:</strong> {ex.harder}
              </p>
            </Detail>
          </div>
        </li>
      ))}
    </ul>
  );
}
