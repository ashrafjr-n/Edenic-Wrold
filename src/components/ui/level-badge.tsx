import type { CSSProperties } from "react";

type ClayVars = CSSProperties & { "--clay-edge"?: string };

interface LevelBadgeProps {
  /** The number itself. */
  value: number;
  /** The bare word beside it — `dict.activities.levelWord`. It is translated,
      so it arrives as a prop: this lives in `components/ui/` and must not
      reach into a dictionary. */
  word: string;
  /** What it reads out as: "Level 2". The visible text says the same thing,
      but the digit and the word are two separate spans and a screen reader
      should hear one phrase. */
  label: string;
  /** The word is translated, so an Arabic or Kurdish badge needs its own
      direction — the layout never mirrors, so the pill itself does not move. */
  dir?: string;
}

/**
 * Which level or stage you are on, as a small clay pill in the corner of the
 * play screen. Green in the puzzles, gold in Memory Match.
 *
 * **It says "Level 4", not just "4".** It shipped as a bare digit in a
 * circle — before that, as a centred `LEVEL 01` caption above Memory Match's
 * clock, which was title-sized chrome for a one-digit fact and made the top
 * of the page heavy. The word came back beside the digit on direct request:
 * a lone number in a corner does not say what it is counting, and the grid
 * card the child just tapped had "Level 4" written on it. The middle version
 * (a circle with only the number) is the one not to go back to.
 *
 * **The HEIGHT is still the back button's** (`h-12 sm:h-14`, reading the same
 * `--page-accent-color` / `-edge` / `-ink`), which is what keeps the two ends
 * of the chrome row one set; only the width grew. It is `.clay`, so it
 * carries the grain and the inflated shading every other coloured object on
 * the site does.
 *
 * Not a button and not a link — it is a label, so it is a `<span>` with an
 * `aria-label`, its own text hidden from the reading order.
 */
export function LevelBadge({ value, word, label, dir }: LevelBadgeProps) {
  return (
    <span
      className="clay flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-lg font-bold leading-none sm:h-14 sm:px-5 sm:text-xl"
      style={
        {
          backgroundColor: "var(--page-accent-color)",
          "--clay-edge": "var(--page-accent-edge)",
          color: "var(--page-accent-ink)",
        } as ClayVars
      }
      aria-label={label}
      dir={dir}
    >
      {/* A step down in size and a touch translucent, the same relationship
          `.stage-chip-word` gives the word on a grid card — the NUMBER is the
          fact, the word only says what kind of number it is. */}
      <span aria-hidden className="text-[0.8em] opacity-85">
        {word}
      </span>
      <span aria-hidden>{value}</span>
    </span>
  );
}
