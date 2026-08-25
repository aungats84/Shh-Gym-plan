import { useState } from 'react';
import { Play, Search } from 'lucide-react';
import { searchUrl, thumbUrl, videoFor, watchUrl } from '@/data/tutorials';

/**
 * Tapping opens the video in the YouTube app on a phone, or the site on
 * a laptop. The thumbnail comes straight from YouTube, so a removed
 * video shows the search fallback instead of a broken image.
 */
export default function VideoLink({
  exerciseId,
  exerciseName,
  searchPhrase,
  compact = false,
}: {
  exerciseId: string;
  exerciseName: string;
  searchPhrase: string;
  compact?: boolean;
}) {
  const video = videoFor(exerciseId);
  const [thumbBroken, setThumbBroken] = useState(false);

  // Only fall back to search when there is genuinely no video for this
  // exercise. A thumbnail that fails to load says nothing about whether
  // the video plays, so the card stays and loses only the picture.
  if (!video) {
    return (
      <a
        href={searchUrl(searchPhrase)}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-[46px] items-center gap-2.5 rounded-[12px] border border-line bg-surface-2 px-3 text-[13px] font-semibold"
      >
        <Search className="h-4 w-4 shrink-0 text-faint" aria-hidden />
        Search YouTube for &quot;{exerciseName}&quot;
      </a>
    );
  }

  if (compact) {
    return (
      <a
        href={watchUrl(video)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-accent/30 bg-accent-wash px-3 text-[12px] font-semibold text-accent"
      >
        <Play className="h-3 w-3 fill-current" aria-hidden />
        Watch
      </a>
    );
  }

  return (
    <a
      href={watchUrl(video)}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-[14px] border border-line bg-surface-2 p-2.5"
    >
      <span className="relative block h-[54px] w-[96px] shrink-0 overflow-hidden rounded-[10px] bg-surface">
        {!thumbBroken && (
          <img
            src={thumbUrl(video)}
            alt=""
            loading="lazy"
            onError={() => setThumbBroken(true)}
            className="h-full w-full object-cover"
          />
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center ${
            thumbBroken ? 'bg-accent-wash' : 'bg-black/25'
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95">
            <Play className="ml-0.5 h-3.5 w-3.5 fill-black text-black" aria-hidden />
          </span>
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold">{video.title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-faint">{video.channel}</span>
      </span>
    </a>
  );
}
