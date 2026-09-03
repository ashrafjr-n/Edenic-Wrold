"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { NumberItem } from "@/types/number-item";
import { itemKey, useProgress } from "@/store/progress";
import { ActivityProgress } from "@/components/ui/activity-progress";
import { StarReward } from "@/components/ui/star-reward";
import { Numeral } from "./numeral";

interface NumberGridProps {
  items: NumberItem[];
  characterId: string;
  lessonId: string;
  /** `/learn/pinki/numbers` — each numeral appends its own value. */
  basePath: string;
  /** The lesson's own subject colour pair, used for the progress bar, the
      cells' tint and the "Next" badge — never a character colour, so every
      character's numbers page reads the same. */
  tone: { face: string; edge: string };
  /** Shown ABOVE the white card, and ONLY to a child who has never finished
      a number — Pinki pointing at where to start.

      A named slot rather than `children` on purpose: `children` reads as
      "this always renders", and this does not. The page builds the node so
      `PinkiGuide` stays a Server Component; the grid decides whether it is
      on screen, because the progress that decides that is read here and
      nowhere else on this page. */
  intro?: ReactNode;
}

type CellVars = CSSProperties & { "--tile-tint"?: string };

const ITEM_DELAY = 0.2;
const ITEM_STAGGER = 0.07;

/**
 * The nine numerals, as the way into the lesson.
 *
 * **The grid lives inside one white `.card`, and each numeral stands on its
 * own tinted `.tile` cell inside it.** Both of those are reversals, made on
 * direct request: the numerals used to float straight on the page background
 * with nothing around them at all, which left the page with no structure and
 * nothing tying it to the rest of the site. An earlier version had gone the
 * other way — every numeral in its own white `.card` on the bare page — and
 * was rejected because a sheet of white containers on a white ground made the
 * numbers the smallest thing on screen. The cell being a pale TINT inside a
 * white card is what avoids both: the parent card gives the page its
 * structure, and the cell reads as a distinct, tappable object because it is
 * a different colour from the card it sits on, not because it is a second
 * white box on a white box.
 *
 * A number is open when the one before it has been finished, so the grid of
 * lavender numerals turns pink one at a time as the child works through them.
 * The first is always open.
 *
 * A Client Component only because unlocking and stars depend on saved
 * progress. Until the store has read localStorage it renders the
 * nothing-finished-yet view, which is exactly what the server rendered —
 * anything else is a hydration mismatch.
 */
export function NumberGrid({
  items,
  characterId,
  lessonId,
  basePath,
  tone,
  intro,
}: NumberGridProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const starsFor = (value: number) =>
    hydrated
      ? (progress[itemKey(characterId, lessonId, value)]?.stars ?? 0)
      : 0;

  const cast = items.map((item, index) => {
    const previous = items[index - 1];

    return {
      item,
      index,
      locked: previous ? starsFor(previous.value) === 0 : false,
      stars: starsFor(item.value),
    };
  });

  const finished = cast.filter(({ stars }) => stars > 0).length;

  /* The one number the child has actually reached: the first open number
     with no stars yet. It pulses and carries the badge, so a child glancing
     at the grid knows exactly where to tap instead of scanning all nine. */
  const nextValue = cast.find(({ locked, stars }) => !locked && stars === 0)
    ?.item.value;

  /* Pale enough that the pink numeral standing on it stays the saturated
     thing — the site's one rule for where a subject colour may appear. */
  const cellTint = `color-mix(in srgb, ${tone.face} 16%, #ffffff)`;

  return (
    /* A fragment, not the card: the intro stands ABOVE the white panel rather
       than inside it, so it reads as the page welcoming the child instead of
       as another row of the picker. The card itself is unchanged. */
    <>
      {/* `hydrated` is load-bearing, not belt-and-braces: it is false on the
          server AND on the first client render, so this is absent from the
          server HTML and can never be a mismatch. Gating on `finished === 0`
          alone would put Pinki in the HTML for everyone and then snatch her
          away from a returning child the moment localStorage was read — a
          flash of the wrong content, which is worse than arriving late.

          In the flow, never absolute: at 320px a grid cell is only ~69px
          wide, so an overlay on number 1 would be larger than the cell and
          spill onto number 2, and that tile's top edge is already taken by
          the "Next" pill. */}
      {intro && hydrated && finished === 0 && intro}

      <div className="card w-full px-5 py-7 sm:px-9 sm:py-10">
        <ActivityProgress
          label="Numbers"
          done={finished}
          total={items.length}
          tone={tone}
        />

        <ul className="grid grid-cols-3 gap-3 sm:gap-5">
          {cast.map(({ item, index, locked, stars }) => {
            const isNext = item.value === nextValue;
            const style = {
              animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s`,
            };

            const cell = (
              <>
                <span
                  className="tile tile-clay relative flex aspect-square w-full items-center justify-center"
                  style={{ "--tile-tint": cellTint } as CellVars}
                >
                  <Numeral
                    value={item.value}
                    image={item.image}
                    sizeClass="h-16 w-16 sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                    locked={locked}
                    decorative
                    /* The cell is the numeral's ground now, so the halo has a
                     surface to fight with — left on, it washes a light blob
                     into the middle of every tint. */
                    bloom={false}
                    /* The padlock goes on the CELL's corner below, not the
                     glyph's: sized against a numeral this small it covered
                     half the digit. */
                    badge={false}
                  />

                  {/* `.lock-chip` — the site's one padlock badge, corner-mounted
                    the same way the friend picker and the lesson cards mount
                    theirs, so "not yet" reads identically everywhere. */}
                  {locked && (
                    <span className="lock-chip absolute right-1 top-1 h-6 w-6 sm:right-1.5 sm:top-1.5 sm:h-7 sm:w-7">
                      <Lock
                        className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                        strokeWidth={2.75}
                      />
                    </span>
                  )}

                  {/* The same "Next up" mark the lesson hub uses, shortened to
                    fit a cell this size and hung over the tile's top edge so
                    it never crowds the numeral. */}
                  {isNext && (
                    <span
                      aria-hidden
                      className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white shadow-[0_6px_12px_-6px_rgb(var(--shadow-hue)/50%)] sm:text-xs"
                      style={{ backgroundColor: tone.face }}
                    >
                      Next
                    </span>
                  )}
                </span>

                {/* Always three slots, gold only for what was actually earned —
                  an unfinished number shows three empty ones rather than
                  nothing, so the reward is visible before it is won. */}
                <StarReward stars={stars} size="compact" />
              </>
            );

            return (
              <li key={item.value}>
                {/* The pulse lives on a WRAPPING span so its continuous `scale`
                  never fights the link's hover `scale` — Tailwind v4's
                  `scale` is its own standalone property, and an infinite
                  animation on the same element would keep overriding it. */}
                <span className={`block ${isNext ? "anim-pulse-invite" : ""}`}>
                  {locked ? (
                    <span
                      className="anim-rise-in flex flex-col items-center gap-2"
                      style={style}
                      aria-label={`The number ${item.value}, locked`}
                    >
                      {cell}
                    </span>
                  ) : (
                    <Link
                      href={`${basePath}/${item.value}`}
                      className="anim-rise-in flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-105"
                      style={style}
                      aria-label={`Start the number ${item.value}, ${stars} of 3 stars`}
                    >
                      {cell}
                    </Link>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
