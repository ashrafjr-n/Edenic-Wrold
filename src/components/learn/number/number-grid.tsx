"use client";

import Image from "next/image";
import Link from "next/link";
import type { NumberItem } from "@/types/number-item";
import { itemKey, useProgress } from "@/store/progress";
import { Numeral } from "./numeral";

interface NumberGridProps {
  items: NumberItem[];
  characterId: string;
  lessonId: string;
  /** `/learn/pinki/numbers` — each numeral appends its own value. */
  basePath: string;
}

const ITEM_DELAY = 0.2;
const ITEM_STAGGER = 0.07;

/**
 * The nine numerals, as the way into the lesson.
 *
 * No cards: each numeral stands on the page on its own bloom (see `Numeral`).
 * Boxed, the grid read as a sheet of containers and the numbers — the entire
 * subject of the lesson — became the smallest thing on screen.
 *
 * A number is open when the one before it has been finished, so the row of
 * silver numerals turns pink one at a time as the child works through them.
 * The first is always open.
 *
 * A Client Component only because unlocking depends on saved progress. Until
 * the store has read localStorage it renders the nothing-finished-yet view,
 * which is exactly what the server rendered — anything else is a hydration
 * mismatch.
 */
export function NumberGrid({
  items,
  characterId,
  lessonId,
  basePath,
}: NumberGridProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const starsFor = (value: number) =>
    hydrated
      ? (progress[itemKey(characterId, lessonId, value)]?.stars ?? 0)
      : 0;

  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-12 sm:gap-y-14">
      {items.map((item, index) => {
        const previous = items[index - 1];
        const locked = previous ? starsFor(previous.value) === 0 : false;
        const earned = starsFor(item.value);

        const style = {
          animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s`,
        };

        const numeral = (
          <Numeral
            value={item.value}
            image={item.image}
            sizeClass="h-24 w-24 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
            locked={locked}
            decorative
          />
        );

        return (
          <li key={item.value} className="flex flex-col items-center gap-2">
            {locked ? (
              <span
                className="anim-rise-in block"
                style={style}
                aria-label={`The number ${item.value}, locked`}
              >
                {numeral}
              </span>
            ) : (
              /* The only motion on hover anywhere on the site is a lift, so
                 that is what an open numeral does too. */
              <Link
                href={`${basePath}/${item.value}`}
                className="anim-rise-in block transition-transform duration-300 hover:scale-105"
                style={style}
                aria-label={`Start the number ${item.value}`}
              >
                {numeral}
              </Link>
            )}

            {/* The stars a finished number earned, small, under it — the list
                is also the record of what the child has done. */}
            {earned > 0 && (
              <span
                className="anim-pop-in flex gap-0.5"
                style={style}
                aria-label={`${earned} of 3 stars`}
              >
                {Array.from({ length: earned }, (_, star) => (
                  <Image
                    key={star}
                    src="/assets/icons/yellow-star.png"
                    alt=""
                    width={140}
                    height={140}
                    className="h-5 w-5 object-contain sm:h-6 sm:w-6"
                  />
                ))}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
