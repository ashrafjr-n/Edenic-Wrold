import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";

interface JourneyProgressProps {
  /** 1-based, so it reads the way the label does. */
  position: number;
  total: number;
  accent: string;
  dict: Dictionary["journey"];
  /** The template mixes this locale's words with the two numbers via
      `format()` — needed on the element itself so the browser doesn't fall
      back to its default `ltr` (see `lib/format-dict.ts`'s `dirFor`). */
  dir: "rtl" | "ltr";
}

/**
 * "Number 3 of 9" plus the bar underneath it.
 *
 * The bar counts the number being worked on as done, so arriving at the first
 * one already shows movement — an empty bar on arrival reads to a child as
 * "nothing is happening" rather than as "you are at the start".
 */
export function JourneyProgress({
  position,
  total,
  accent,
  dict,
  dir,
}: JourneyProgressProps) {
  const percent = Math.round((position / total) * 100);

  return (
    <div className="card card-clay-white card-pill flex min-w-0 flex-col gap-1.5 px-5 py-2.5 sm:px-6 sm:py-3">
      <span dir={dir} className="whitespace-nowrap text-center text-xs font-bold text-[var(--color-ink)] sm:text-sm">
        {format(dict.numberOf, { position, total })}
      </span>

      {/* **Deliberately NOT `.puzzle-progress-track`/`-fill`**, the chunky
          clay bar the number picker and both game grids use. It was tried
          here and reverted: that track sets its own `height: 0.875rem` and is
          unlayered, so a Tailwind `h-*` cannot slim it down — the chip grew
          by 8px, went from a caption with a hairline under it to a fat pill
          with a groove in it, and pushed the whole stage down far enough that
          Pinki's stick crossed her own speech bubble. This is a 6px hairline
          inside a chip, not a progress bar a child reads a count off. */}
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--color-locked)] sm:h-2 sm:w-44">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%`, backgroundColor: accent }}
          aria-hidden
        />
      </div>
    </div>
  );
}
