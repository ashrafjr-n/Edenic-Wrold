import type { Metadata } from "next";
import { Brain } from "lucide-react";
import { memoryLevels } from "@/data/memory-levels";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import {
  HeadingMark,
  HEADING_CHIP_SHAPE,
  type HeadingChip,
} from "@/components/ui/heading-mark";
import { MemoryGrid } from "@/components/activities/memory/memory-grid";
import { getDictionary } from "@/lib/locale";
import { dirFor } from "@/lib/format-dict";

export const metadata: Metadata = {
  title: "Memory Match — Edenic World",
  description: "Twelve levels of matching pairs with Pinki, Nova and Bloo.",
};

/**
 * The heading's mark: **the puzzles' three chips exactly, in one gold, with
 * one repeated icon.**
 *
 * It used to be a hand of the game — a matched PAIR (two hearts) either side
 * of one card still face down (a star), each in its own treatment. That was
 * cut on direct request for the right reason: heart, star, heart does not
 * read as "memory" to anyone, and varying the icon across the three chips
 * turned the mark into decoration. One symbol repeated three times names a
 * subject; three different symbols name nothing.
 *
 * The `Brain` is the same icon the Activities card's own button carries, so
 * the game is marked the same way on the page that leads here and on the page
 * itself. No character on it, by request — and it could not carry one anyway:
 * the friends are card FACES from level 10 on, so a mascot here would give
 * away one of the pictures the last levels are built on.
 */
const CHIPS: HeadingChip[] = HEADING_CHIP_SHAPE.map((shape) => ({
  ...shape,
  face: "var(--color-gold)",
  edge: "var(--color-gold-dark)",
}));

export default async function MemoryMatchPage() {
  const dict = await getDictionary();

  return (
    <main
      className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20"
      style={pageAccent(
        "var(--color-gold)",
        "var(--color-gold-dark)",
        /* --color-ink-fixed, not --color-ink: gold is unaffected by theme, so its ink has to stay unaffected too. */
        "var(--color-ink-fixed)",
      )}
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
        <span className="absolute left-6 top-0 sm:left-8">
          <BackButton href="/play" label={dict.activities.backToActivities} />
        </span>

        {/* Back on the left, the heading's own mark centred on the page —
            centred on the page itself rather than on the space left over,
            which is why the back button is taken out of the flow. */}
        <div
          className="anim-drop-in relative flex items-center justify-center"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Ink, not white: gold is the one face on the site pale enough
              that a white icon disappears on it — the same call this game's
              CTA button and the puzzle hint chip's lightbulb make. */}
          {/* --color-ink-fixed, not --color-ink: the chips are gold, unaffected
              by theme, so the icon on them has to stay unaffected too. */}
          <HeadingMark chips={CHIPS} icon={Brain} ink="var(--color-ink-fixed)" />
        </div>

        <div
          className="anim-fade-up mt-4 text-center sm:mt-5 lg:mt-0 lg:text-left"
          style={{ animationDelay: "0.25s" }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            {dict.activities.memoryTitle}
          </h1>
          {/* A step down from the `h1` in size AND weight — the line telling
              a child what the page is for, not a second heading. */}
          {/* `dir` because it ends in an exclamation mark: bidi-neutral, so
              without one it takes the page's `ltr` and renders on the wrong
              end of the Arabic line (see `dirFor`). */}
          <p
            dir={dirFor(dict.locale)}
            className="mt-1.5 text-sm font-medium text-[var(--color-ink)]/55 sm:text-base"
          >
            {dict.activities.memorySubtitle}
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:max-w-5xl lg:py-6 xl:max-w-6xl">
        <MemoryGrid levels={memoryLevels} dict={dict} />
      </div>
    </main>
  );
}
