interface JourneyProgressProps {
  /** 1-based, so it reads the way the label does. */
  position: number;
  total: number;
  accent: string;
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
}: JourneyProgressProps) {
  const percent = Math.round((position / total) * 100);

  return (
    <div className="card card-pill flex min-w-0 flex-col gap-1.5 px-5 py-2.5 sm:px-6 sm:py-3">
      <span className="whitespace-nowrap text-center text-xs font-bold text-[var(--color-ink)] sm:text-sm">
        Number {position} of {total}
      </span>

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
