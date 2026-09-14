"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Hash, Lock, Play } from "lucide-react";
import type { NumberItem } from "@/types/number-item";
import { itemKey, useProgress } from "@/store/progress";
import { StarReward } from "@/components/ui/star-reward";
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

const MAX_STARS = 3;
const ROW_DELAY = 0.15;
const ROW_STAGGER = 0.06;

/**
 * The nine numbers, as a lesson-list — one row per number, replacing the old
 * 3x3 tile grid on direct request (it read as unfinished and out of step
 * with the rest of the site). Reworked to the order and rhythm of a
 * reference screenshot: a stats row, then one card-row per item with a
 * numeral badge, a title, its stars, and a status mark (locked / next /
 * done) on the trailing edge — closed by a "Continue" button to the next
 * open number.
 *
 * A Client Component only because unlocking and stars depend on saved
 * progress. Until the store has read localStorage it renders the
 * nothing-finished-yet view, which is exactly what the server rendered —
 * anything else is a hydration mismatch.
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

  const totalStars = cast.reduce((sum, { stars }) => sum + stars, 0);
  const nextValue = cast.find(({ locked, stars }) => !locked && stars === 0)
    ?.item.value;
  /* All nine finished leaves no "next" number — loop the Continue button
     back to the last one rather than leaving it with nowhere to go. */
  const continueValue = nextValue ?? items[items.length - 1].value;

  const rowTint = `color-mix(in srgb, ${tone.face} 12%, #ffffff)`;

  return (
    <>
      <div className="mt-5 flex gap-3">
        <span
          className="tile flex items-center gap-2 px-3.5 py-2.5"
          style={{ "--tile-tint": rowTint } as RowVars}
        >
          <Hash className="h-4 w-4" style={{ color: tone.edge }} strokeWidth={2.75} />
          <span className="text-sm font-bold text-[var(--color-ink-fixed)]">
            {items.length}{" "}
            <span className="font-medium text-[var(--color-ink-soft-fixed)]">
              {dict.lessonPicker.numbersLabel}
            </span>
          </span>
        </span>

        <span
          className="tile flex items-center gap-2 px-3.5 py-2.5"
          style={{ "--tile-tint": rowTint } as RowVars}
        >
          <Image
            src="/assets/icons/yellow-star.png"
            alt=""
            width={20}
            height={20}
            className="h-4 w-4 object-contain"
          />
          <span className="text-sm font-bold text-[var(--color-ink-fixed)]">
            {totalStars}
            <span className="font-medium text-[var(--color-ink-soft-fixed)]">
              /{items.length * MAX_STARS}
            </span>
          </span>
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {cast.map(({ item, index, locked, stars }) => {
          const isNext = item.value === nextValue;
          const rowStyle: RowVars = {
            animationDelay: `${ROW_DELAY + index * ROW_STAGGER}s`,
            "--tile-tint": isNext
              ? `color-mix(in srgb, ${tone.face} 16%, #ffffff)`
              : rowTint,
          };
          const rowClass =
            "tile tile-clay anim-rise-in flex items-center gap-3 border-2 p-2.5 sm:gap-4 sm:p-3";
          const rowBorderColor = isNext ? tone.face : "transparent";

          const row = (
            <>
              <span
                className="tile tile-clay relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16"
                style={{ "--tile-tint": "#ffffff" } as RowVars}
              >
                <Numeral
                  value={item.value}
                  image={item.image}
                  sizeClass="h-10 w-10 sm:h-12 sm:w-12"
                  sizes="48px"
                  locked={locked}
                  decorative
                  bloom={false}
                  badge={false}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[var(--color-ink-fixed)] sm:text-base">
                  {format(dict.journey.numberButton, { value: item.value })}
                </span>
                <StarReward stars={stars} size="compact" dict={dict.ui} />
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
                  style={{ ...rowStyle, borderColor: rowBorderColor }}
                  aria-label={format(dict.lessonPicker.lockedNumberAria, { value: item.value })}
                >
                  {row}
                </span>
              ) : (
                <Link
                  href={`${basePath}/${item.value}`}
                  className={`${rowClass} transition-transform duration-300 hover:scale-[1.015]`}
                  style={{ ...rowStyle, borderColor: rowBorderColor }}
                  aria-label={format(dict.lessonPicker.startNumberAria, { value: item.value, stars })}
                >
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <Button3D
        href={`${basePath}/${continueValue}`}
        tone={{ face: tone.face, edge: tone.edge }}
        className="anim-fade-up mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-base sm:py-4 sm:text-lg"
        style={{ animationDelay: `${ROW_DELAY + items.length * ROW_STAGGER}s` }}
      >
        {dict.trail.ctaContinue}
        <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
      </Button3D>
    </>
  );
}
