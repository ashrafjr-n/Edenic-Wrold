import type { Metadata } from "next";
import { Puzzle } from "lucide-react";
import { puzzleStages } from "@/data/puzzles";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import {
  HeadingMark,
  HEADING_CHIP_SHAPE,
  type HeadingChip,
} from "@/components/ui/heading-mark";
import { PuzzleGrid } from "@/components/activities/puzzle/puzzle-grid";
import { getDictionary } from "@/lib/locale";
import { dirFor } from "@/lib/format-dict";

export const metadata: Metadata = {
  title: "Puzzles — Edenic World",
  description: "Fifteen picture puzzles to build, one piece at a time.",
};

/** Three clay puzzle chips instead of a word — one per friend's colour, so
    the mark is the three of them holding a piece each. Shape comes from
    `HEADING_CHIP_SHAPE`, shared with Memory Match's mark. */
const CHIPS: HeadingChip[] = [
  { face: "var(--color-pinki)", edge: "var(--color-pinki-dark)" },
  { face: "var(--color-gold)", edge: "var(--color-gold-dark)" },
  { face: "var(--color-bloo)", edge: "var(--color-bloo-dark)" },
].map((tone, index) => ({ ...tone, ...HEADING_CHIP_SHAPE[index] }));

export default async function PuzzleStagesPage() {
  const dict = await getDictionary();

  return (
    <main
      className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20"
      style={pageAccent("var(--color-go)", "var(--color-go-dark)")}
    >
            {/* **The header stacks on a phone and becomes a ROW from `lg`.** As a
          stack — mark, then title, then subtitle, all centred — it costs about
          280px before the first card, which on a 900px-tall desktop pushed two
          thirds of the set below the fold. Side by side it costs about 130px
          and the grid starts near the top of the screen.

          **The phone keeps the stack exactly as it was**: every change here is
          `lg:`-prefixed, so below that width this is the same block layout it
          always rendered. The back button moved out of the mark's own row and
          onto this container, and `left-6 sm:left-8` reproduces the position
          it had there to the pixel — that row sat inside this container's
          content box, so its `left-0` WAS this padding.

          Deliberately `lg`, not `md`: at an iPad's width the row leaves the
          title cramped against the mark, and the stack still fits there. */}
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8 lg:flex lg:items-center lg:justify-center lg:gap-7">
        {/* Out of the flow, so the mark stays centred on the PAGE rather
            than on the space the button leaves. The wrapper carries the
            positioning, never the button: `.btn3d` sets `position:
            relative` and is UNLAYERED, so a Tailwind `absolute` on the
            button itself silently loses. */}
        {/* **`z-10` is not decoration — without it this button cannot be
            pressed at all.** The heading row below is `relative` (positioned,
            `z-auto`) and comes LATER in the DOM, so it paints over anything
            positioned before it — and it is a full-width flex row, so its box
            covers this corner even though its chips are centred. The click
            landed on that row and the page never navigated. Verified by
            `elementFromPoint` on the button's own centre, before and after. */}
        <span className="absolute left-6 top-0 z-10 sm:left-8">
          <BackButton href="/play" label={dict.activities.backToActivities} />
        </span>

        {/* Back on the left, the puzzle chips centred on the page — centred
            on the page itself rather than on the space left over, which is
            why the back button is taken out of the flow. */}
        <div
          className="anim-drop-in relative flex items-center justify-center"
          style={{ animationDelay: "0.1s" }}
        >
          <HeadingMark chips={CHIPS} icon={Puzzle} />
        </div>

        {/* The chips alone said "puzzles" without saying what the page is for.
            The title and the line under it give the fifteen cards a heading to
            sit beneath — the chips stay as the picture of it. */}
        <div
          className="anim-fade-up mt-4 text-center sm:mt-5 lg:mt-0 lg:text-left"
          style={{ animationDelay: "0.25s" }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            {dict.activities.puzzleTitle}
          </h1>
          {/* Deliberately a step down from the `h1` in BOTH size and weight —
              it is the one line telling a child what the page is for, not a
              second heading. At `text-base sm:text-lg` it sat close enough to
              the title that the whole head read as heavy. */}
          {/* `dir` because it ends in an exclamation mark: bidi-neutral, so
              without one it takes the page's `ltr` and renders on the wrong
              end of the Arabic line (see `dirFor`). */}
          <p
            dir={dirFor(dict.locale)}
            className="mt-1.5 text-sm font-medium text-[var(--color-ink)]/55 sm:text-base"
          >
            {dict.activities.puzzleSubtitle}
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:max-w-5xl lg:py-6 xl:max-w-6xl">
        <PuzzleGrid stages={puzzleStages} dict={dict} />
      </div>
    </main>
  );
}
