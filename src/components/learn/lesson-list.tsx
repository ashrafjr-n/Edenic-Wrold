"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Check, Lock, Play } from "lucide-react";
import type { NumberItem } from "@/types/number-item";
import { itemKey, useProgress } from "@/store/progress";
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
 * The nine numbers — TWO renderings of the same data, swapped by CSS
 * breakpoint, never both visible at once:
 *
 * **Below `sm` (phone, frozen — do not touch): a stacked row list**, one
 * `.card card-clay-white` per number. This is the only thing a phone ever
 * sees; it replaced the old 3x3 tile grid on direct request.
 *
 * **`sm` and up (tablet + desktop): a grid of upright cards** — the site's
 * own lesson-hub card language (`/learn/[character]`) reused here rather
 * than invented: `.card clay` (coloured, grained) for an open number,
 * `.card card-clay-white` for a locked one, a white "Next" pill on the one
 * to play next, a numeral standing on its own white badge for contrast
 * against the coloured fill. 2 columns from `sm`, 3 from `lg` — a genuinely
 * different composition for wider screens, not the phone list stretched
 * out; the page itself forks around it too (see `page.tsx`'s doc comment).
 *
 * The "Continue" button lives OUTSIDE this component entirely now —
 * `ContinueButton`, placed differently per breakpoint by the route.
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

  return (
    <>
      {/* ---------- Phone: stacked rows (`sm:hidden`) ---------- */}
      <ul className="mt-5 flex flex-col gap-2.5 sm:hidden">
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

      {/* ---------- Tablet + desktop: a grid of cards (`hidden sm:grid`) ---------- */}
      <ul className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {cast.map(({ item, index, locked, stars }) => {
          const isNext = item.value === nextValue;
          const unlocked = !locked;
          const cardStyle: RowVars = {
            animationDelay: `${ROW_DELAY + index * ROW_STAGGER}s`,
            ...(unlocked
              ? { backgroundColor: tone.face, "--clay-edge": tone.edge }
              : {}),
          };
          const cardClass = `card card-lift anim-rise-in relative flex aspect-[3/4] flex-col justify-between p-4 lg:p-5 ${
            unlocked ? "clay" : "card-clay-white"
          }`;

          const card = (
            <>
              <div className="flex flex-1 items-center justify-center">
                <span
                  className="tile tile-round flex h-24 w-24 items-center justify-center lg:h-28 lg:w-28"
                  style={{ "--tile-tint": "#ffffff" } as RowVars}
                >
                  <Numeral
                    value={item.value}
                    image={item.image}
                    sizeClass="h-16 w-16 lg:h-20 lg:w-20"
                    sizes="(min-width: 1024px) 80px, 64px"
                    locked={locked}
                    decorative
                    bloom={false}
                    badge={false}
                  />
                </span>
              </div>

              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  {isNext && (
                    <span
                      className="mb-1.5 inline-block rounded-full bg-white px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide"
                      style={{ color: tone.edge }}
                    >
                      {dict.lessonPicker.next}
                    </span>
                  )}
                  <div
                    className={`truncate text-lg font-bold lg:text-xl ${
                      unlocked ? "text-white" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {format(dict.journey.numberButton, { value: item.value })}
                  </div>
                </div>

                {locked ? (
                  <span
                    aria-hidden
                    className="lock-chip flex h-10 w-10 shrink-0 items-center justify-center"
                  >
                    <Lock className="h-4 w-4" strokeWidth={2.75} />
                  </span>
                ) : stars > 0 ? (
                  <span
                    aria-hidden
                    className="clay flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
                    style={{ "--clay-edge": "var(--color-locked)" } as RowVars}
                  >
                    <Check className="h-4 w-4" style={{ color: "var(--color-go)" }} strokeWidth={3} />
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="clay flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
                    style={{ "--clay-edge": "var(--color-locked)" } as RowVars}
                  >
                    <Play
                      className="h-4 w-4"
                      style={{ color: tone.edge }}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  </span>
                )}
              </div>
            </>
          );

          return (
            <li key={item.value}>
              {locked ? (
                <span
                  className={cardClass}
                  style={cardStyle}
                  aria-label={format(dict.lessonPicker.lockedNumberAria, { value: item.value })}
                >
                  {card}
                </span>
              ) : (
                <Link
                  href={`${basePath}/${item.value}`}
                  className={cardClass}
                  style={cardStyle}
                  aria-label={format(dict.lessonPicker.startNumberAria, { value: item.value, stars })}
                >
                  {card}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
