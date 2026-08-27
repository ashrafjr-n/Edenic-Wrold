import Link from "next/link";
import type { NumberItem } from "@/types/number-item";
import { Numeral } from "./numeral";

interface NumberGridProps {
  items: NumberItem[];
  /** `/learn/pinki/numbers` — each numeral appends its own value. */
  basePath: string;
}

const ITEM_DELAY = 0.2;
const ITEM_STAGGER = 0.07;

/**
 * The nine numerals, as the way into the lesson.
 *
 * No cards: each numeral stands on the page on its own bloom (see
 * `Numeral`). Boxed, the grid read as a sheet of containers and the numbers —
 * the entire subject of the lesson — became the smallest thing on screen.
 *
 * A locked numeral is a plain `span`, not a dead link, so nothing about it
 * invites a tap in the first place.
 */
export function NumberGrid({ items, basePath }: NumberGridProps) {
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-5">
      {items.map((item, index) => {
        const style = {
          animationDelay: `${ITEM_DELAY + index * ITEM_STAGGER}s`,
        };

        return (
          <li key={item.value} className="flex justify-center">
            {item.locked ? (
              <span
                className="anim-rise-in block"
                style={style}
                aria-label={`The number ${item.value}, locked`}
              >
                <Numeral
                  value={item.value}
                  image={item.image}
                  sizeClass="h-24 w-24 sm:h-32 sm:w-32"
                  locked
                  decorative
                />
              </span>
            ) : (
              /* The only thing that moves on hover anywhere on the site is a
                 lift, so that is what an open numeral does too. */
              <Link
                href={`${basePath}/${item.value}`}
                className="anim-rise-in block transition-transform duration-300 hover:scale-105"
                style={style}
                aria-label={`Start the number ${item.value}`}
              >
                <Numeral
                  value={item.value}
                  image={item.image}
                  sizeClass="h-24 w-24 sm:h-32 sm:w-32"
                  decorative
                />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
