import type { CSSProperties } from "react";

type ClayVars = CSSProperties & { "--clay-edge"?: string };

interface LevelBadgeProps {
  /** The number alone — no "Level" word. */
  value: number;
  /** What it reads out as: "Level 2", "Puzzle 7". */
  label: string;
}

/**
 * Which level or stage you are on, as a small clay disc in the corner of the
 * play screen.
 *
 * **It replaced a centred "LEVEL 01" caption above Memory Match's clock**,
 * which was a title-sized piece of chrome for a one-digit fact and made the
 * top of the page heavy. A badge in a corner says the same thing as a passing
 * note, which is all it needs to be — the child knows what they tapped.
 *
 * Sized and coloured like the back button on purpose (`h-12 w-12 sm:h-14
 * sm:w-14`, reading the same `--page-accent-color` / `--page-accent-edge` /
 * `--page-accent-ink`), so the two ends of the chrome row are one set: green
 * in the puzzles, gold in Memory Match. It is `.clay`, so it carries the
 * grain and the inflated shading every other coloured object on the site
 * does.
 *
 * Not a button and not a link — it is a label, so it is a `<span>` with an
 * `aria-label` and the digit itself hidden from the reading order (the digit
 * alone would be announced as a bare number).
 */
export function LevelBadge({ value, label }: LevelBadgeProps) {
  return (
    <span
      className="clay flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold leading-none sm:h-14 sm:w-14 sm:text-xl"
      style={
        {
          backgroundColor: "var(--page-accent-color)",
          "--clay-edge": "var(--page-accent-edge)",
          color: "var(--page-accent-ink)",
        } as ClayVars
      }
      aria-label={label}
    >
      <span aria-hidden>{value}</span>
    </span>
  );
}
