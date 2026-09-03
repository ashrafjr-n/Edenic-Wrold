import type { CSSProperties } from "react";

type BarVars = CSSProperties & {
  "--bar-face"?: string;
  "--bar-edge"?: string;
};

interface ActivityProgressProps {
  /** What is being counted — "Puzzles", "Levels". */
  label: string;
  /** How many the child has finished. */
  done: number;
  /** How many there are in all. */
  total: number;
  /** The activity's hero colour pair. Defaults to the puzzles' green, which
      is also the site's "you passed this" colour; memory match passes gold. */
  tone?: { face: string; edge: string };
}

const GREEN = { face: "var(--color-go)", edge: "var(--color-go-dark)" };

/**
 * "9 / 15" and a clay bar, sitting above an activity's grid of levels.
 *
 * The count is set against the label rather than beside it as an equal: a
 * small muted caption on the left, the number itself big and in the
 * activity's own colour on the right.
 *
 * The grid alone said nothing about how far a child had got — fifteen cards
 * under one another read as a pile, not as a journey with a position in it.
 * This is the one line that turns the page into a thing being worked
 * through: a label, the count, and a bar showing the same fact for a child
 * who cannot read the numbers yet.
 *
 * Presentational only — it is handed its numbers rather than reading the
 * progress store itself, so the store stays read in exactly one place per
 * page (the grid, which needs it for unlocking anyway).
 *
 * Shared by `/activities/puzzle`, `/activities/memory-match` and the numbers
 * picker (`/learn/[character]/[lesson]`). It was `PuzzleProgress` in
 * `components/activities/` until the second one arrived, and moved to
 * `components/ui/` when the third did — the same call `Celebration` and
 * `StarReward` made rather than being imported across sections. Only the
 * label and the two colour tokens differ between the three, which is not
 * enough to justify a second copy of the bar.
 */
export function ActivityProgress({
  label,
  done,
  total,
  tone = GREEN,
}: ActivityProgressProps) {
  const percent = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="anim-fade-up mb-6 sm:mb-8" style={{ animationDelay: "0.3s" }}>
      {/* **The label and the count are deliberately not the same thing.** They
          used to be one size and one weight, which read as a plain line of
          text sitting above the grid. The label is now a small, light,
          spaced-out caption in muted ink, and the count is the big fact —
          bigger, bolder, and in the activity's own colour. The difference in
          WEIGHT between the two is what makes the line read as designed
          rather than typed, and it costs no extra element. */}
      <div className="mb-2 flex items-baseline justify-between gap-3 px-1 sm:mb-2.5">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]/45 sm:text-xs">
          {label}
        </span>

        {/* The total is the quieter half of the count — how many are done is
            what a child is actually looking for. */}
        <span className="flex items-baseline gap-0.5 font-bold leading-none">
          <span className="text-lg sm:text-xl" style={{ color: tone.edge }}>
            {done}
          </span>
          <span className="text-sm text-[var(--color-ink)]/40 sm:text-base">
            / {total}
          </span>
        </span>
      </div>

      <div
        className="puzzle-progress-track"
        role="progressbar"
        aria-label={`${label} completed`}
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
            style={
              {
                width: `${percent}%`,
                "--bar-face": tone.face,
                "--bar-edge": tone.edge,
              } as BarVars
            }
          />
        )}
      </div>
    </div>
  );
}
