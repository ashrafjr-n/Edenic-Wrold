interface PuzzleProgressProps {
  /** How many stages the child has finished. */
  done: number;
  /** How many there are in all. */
  total: number;
}

/**
 * "9 / 15" and a clay bar, sitting above the stage grid.
 *
 * The grid alone said nothing about how far a child had got — fifteen cards
 * under one another read as a pile, not as a journey with a position in it.
 * This is the one line that turns the page into a thing being worked
 * through: a label, the count, and a bar showing the same fact for a child
 * who cannot read the numbers yet.
 *
 * Presentational only — it is handed the two numbers rather than reading the
 * progress store itself, so the store stays read in exactly one place on
 * this page (`PuzzleGrid`, which needs it for unlocking anyway).
 */
export function PuzzleProgress({ done, total }: PuzzleProgressProps) {
  const percent = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="anim-fade-up mb-6 sm:mb-8" style={{ animationDelay: "0.3s" }}>
      <div className="mb-2 flex items-baseline justify-between gap-3 px-1 sm:mb-2.5">
        <span className="text-sm font-bold text-[var(--color-ink)] sm:text-base">
          Puzzles
        </span>
        <span className="text-sm font-bold text-[var(--brand-dark)] sm:text-base">
          {done} / {total}
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
          <span className="puzzle-progress-fill" style={{ width: `${percent}%` }} />
        )}
      </div>
    </div>
  );
}
