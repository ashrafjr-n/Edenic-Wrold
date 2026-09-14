"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check, Hash, Lock, Play } from "lucide-react";
import type { NumberItem } from "@/types/number-item";
import { itemKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";
import { Numeral } from "./numeral";

interface NumberListProps {
  items: NumberItem[];
  characterId: string;
  lessonId: string;
  /** `/learn/pinki/numbers` — each numeral appends its own value. */
  basePath: string;
  /** The lesson's own subject colour pair — never a character colour, so
      every character's numbers page reads the same. */
  tone: { face: string; edge: string };
  /** The whole dictionary — safe to pass wholesale since every leaf is a
      plain string (see `lib/dictionaries/en.ts`'s doc comment). */
  dict: Dictionary;
}

type RowVars = CSSProperties & {
  "--tile-tint"?: string;
  "--clay-edge"?: string;
};

const ROW_DELAY = 0.15;
const ROW_STAGGER = 0.06;

/**
 * The nine numbers, as a lesson-list — one row per number, replacing the old
 * 3x3 tile grid on direct request (it read as unfinished and out of step
 * with the rest of the site). Every row is the site's own white clay card
 * (`.card card-clay-white`, not a coloured tile) with a numeral badge, its
 * title, and a status mark on the trailing edge — no star count on the row
 * any more, on direct request; stars still drive the lock/next/done split
 * underneath, they just aren't drawn.
 *
 * The "Continue" button is its OWN `fixed` bar at the bottom of the
 * viewport, not part of this flow — see the JSX below.
 *
 * A Client Component only because unlocking depends on saved progress.
 * Until the store has read localStorage it renders the nothing-finished-yet
 * view, which is exactly what the server rendered — anything else is a
 * hydration mismatch.
 */
export function NumberList({
  items,
  characterId,
  lessonId,
  basePath,
  tone,
  dict,
}: NumberListProps) {
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

  const nextValue = cast.find(({ locked, stars }) => !locked && stars === 0)
    ?.item.value;
  /* All nine finished leaves no "next" number — loop the Continue button
     back to the last one rather than leaving it with nowhere to go. */
  const continueValue = nextValue ?? items[items.length - 1].value;

  return (
    <>
      <div className="mt-5">
        <span
          className="tile inline-flex items-center gap-2 px-3.5 py-2.5"
          style={{ "--tile-tint": `color-mix(in srgb, ${tone.face} 10%, #ffffff)` } as RowVars}
        >
          <Hash className="h-4 w-4" style={{ color: tone.edge }} strokeWidth={2.75} />
          <span className="text-sm font-bold text-[var(--color-ink-fixed)]">
            {items.length}{" "}
            <span className="font-medium text-[var(--color-ink-soft-fixed)]">
              {dict.lessonPicker.numbersLabel}
            </span>
          </span>
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-2.5">
        {cast.map(({ item, index, locked, stars }) => {
          const isNext = item.value === nextValue;
          const rowStyle: RowVars = {
            animationDelay: `${ROW_DELAY + index * ROW_STAGGER}s`,
            borderColor: isNext ? tone.face : "transparent",
          };
          const rowClass =
            "card card-clay-white anim-rise-in flex items-center gap-3 border-2 p-2 sm:gap-4 sm:p-2.5";

          const row = (
            <>
              <span
                className="tile tile-clay relative flex h-11 w-11 shrink-0 items-center justify-center sm:h-13 sm:w-13"
                style={{ "--tile-tint": "#ffffff" } as RowVars}
              >
                <Numeral
                  value={item.value}
                  image={item.image}
                  sizeClass="h-8 w-8 sm:h-9 sm:w-9"
                  sizes="36px"
                  locked={locked}
                  decorative
                  bloom={false}
                  badge={false}
                />
              </span>

              <span className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--color-ink)] sm:text-base">
                {format(dict.journey.numberButton, { value: item.value })}
              </span>

              {locked ? (
                <span
                  aria-hidden
                  className="lock-chip flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10"
                >
                  <Lock className="h-4 w-4" strokeWidth={2.75} />
                </span>
              ) : stars > 0 ? (
                <span
                  aria-hidden
                  className="clay flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
                  style={
                    {
                      backgroundColor: "var(--color-go)",
                      "--clay-edge": "var(--color-go-dark)",
                    } as RowVars
                  }
                >
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="clay flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
                  style={
                    {
                      backgroundColor: tone.face,
                      "--clay-edge": tone.edge,
                    } as RowVars
                  }
                >
                  <Play className="h-3.5 w-3.5 fill-white text-white" strokeWidth={0} />
                </span>
              )}
            </>
          );

          return (
            <li key={item.value}>
              {locked ? (
                <span
                  className={rowClass}
                  style={rowStyle}
                  aria-label={format(dict.lessonPicker.lockedNumberAria, { value: item.value })}
                >
                  {row}
                </span>
              ) : (
                <Link
                  href={`${basePath}/${item.value}`}
                  className={`${rowClass} transition-transform duration-300 hover:scale-[1.015]`}
                  style={rowStyle}
                  aria-label={format(dict.lessonPicker.startNumberAria, { value: item.value, stars })}
                >
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {/* A fixed bar, not part of the card's own flow — "always at the
          bottom of the screen" was a direct request. Sits above the
          phone's `BottomNav` (which reserves `4rem + safe-area` for
          itself) and fades the page into it so scrolling content never
          cuts hard against the button. The route's own bottom padding
          (`pb-36 sm:pb-28`) is what keeps the last row clear of this. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 pb-4 pt-10 sm:bottom-0 sm:pb-6"
        style={{ background: "linear-gradient(to top, var(--background) 55%, transparent)" }}
      >
        <div className="pointer-events-auto mx-auto w-full max-w-3xl px-6 sm:px-8 md:max-w-[35rem] lg:max-w-[37rem]">
          <Button3D
            href={`${basePath}/${continueValue}`}
            tone={{ face: tone.face, edge: tone.edge }}
            className="flex w-full items-center justify-center gap-2 py-3.5 text-base sm:py-4 sm:text-lg"
          >
            {dict.trail.ctaContinue}
            <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
          </Button3D>
        </div>
      </div>
    </>
  );
}
