interface PuzzleProgressProps {
  /** How many stages the child has finished. */
  done: number;
  /** How many there are in all. */
  total: number;
}

/**
 * "Your Puzzle Journey — 8 / 15 completed" and a clay bar, above the stage
 * grid.
 *
 * The grid alone said nothing about how far a child had got — fifteen cards
 * under one another read as a gallery, not as a journey with a position in
 * it. This is the one line that changes that: a name for the thing being
 * worked through, the count, and a bar saying the same fact for a child who
 * cannot read the numbers yet.
 *
 * The label used to be the word "Puzzles", which the page's own title
 * already says. One row rather than the two stacked lines it was drafted as,
 * because this page's vertical space belongs to the cards.
 *
 * Presentational only — it is handed the two numbers rather than reading the
 * progress store itself, so the store stays read in exactly one place on this
 * page (`PuzzleGrid`, which needs it for unlocking anyway).
 */
export function PuzzleProgress({ done, total }: PuzzleProgressProps) {
  const percent = total > 0 ? (done / total) * 100 : 0;

  return (
    <div
      className="anim-fade-up mb-4 sm:mb-6"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="mb-1.5 flex items-baseline justify-between gap-3 px-0.5 sm:mb-2">
        <span className="text-[0.8125rem] font-bold text-[var(--color-ink)] sm:text-[0.9375rem]">
          Your Puzzle Journey
        </span>
        <span className="text-[0.75rem] font-bold text-[var(--color-go-dark)] sm:text-[0.875rem]">
          {done} / {total} completed
        </span>
      </div>

      <div
        className="puzzle-progress-track"
        role="progressbar"
        aria-label="Puzzles completed"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        {/* Skipped entirely at zero rather than rendered at `width: 0` — the
            fill's own drop shadow would still paint as a sliver at the left
            end of an empty groove. */}
        {done > 0 && (
          <span
            className="puzzle-progress-fill"
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}
