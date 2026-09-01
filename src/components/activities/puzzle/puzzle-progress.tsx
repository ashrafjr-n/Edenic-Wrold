import { Puzzle } from "lucide-react";

interface PuzzleProgressProps {
  /** How many stages the child has finished. */
  done: number;
  /** How many there are in all. */
  total: number;
}

/**
 * "8 / 15 Puzzles Complete" and a clay bar, directly under the page's title.
 *
 * The grid alone said nothing about how far a child had got — fifteen tiles
 * under one another read as a gallery, not as a journey with a position in
 * it. This is the one line that changes that: the count, and a bar saying the
 * same fact for a child who cannot read the numbers yet.
 *
 * It used to be a "Your Puzzle Journey" label on the left with the count on
 * the right — a two-column stat row, which is a DASHBOARD pattern and read as
 * one. One centred sentence with a puzzle piece in front of it is the same
 * information said the way a game says it, and it costs the cards less height.
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
      <p className="mb-1.5 flex items-center justify-center gap-1.5 text-[0.8125rem] font-bold text-[var(--color-ink)] sm:mb-2 sm:gap-2 sm:text-[0.9375rem]">
        <Puzzle
          aria-hidden
          className="h-4 w-4 shrink-0 fill-current text-[var(--color-go)] sm:h-[1.125rem] sm:w-[1.125rem]"
          strokeWidth={2}
        />
        {done} / {total} Puzzles Complete
      </p>

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
