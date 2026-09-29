"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Check, Lock, Play } from "lucide-react";
import { itemKey, useProgress } from "@/store/progress";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";

interface LessonListProps {
  /** One title per lesson, in order, already in the active locale. Lesson
      `n` is `titles[n - 1]` and lives at `${basePath}/${n}`. */
  titles: readonly string[];
  characterId: string;
  /** The course's id — `shapes` in `/learn/pinki/shapes`. */
  lessonId: string;
  /** `/learn/pinki/shapes` — each row appends its own lesson number. */
  basePath: string;
  /** The course's own subject colour pair — never a character colour. */
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
 * A course's lessons on tablet and desktop (`sm` and up; a phone gets
 * `LessonPath` instead): a grid of upright cards — the site's own
 * lesson-hub card language reused rather than invented: `.card clay`
 * (coloured, grained) for an open lesson, `.card card-clay-white` for a
 * locked one, a white "Next" pill on the one to play next, the lesson
 * number standing on its own white badge for contrast against the coloured
 * fill. 2 columns from `sm`, 3 from `lg`.
 *
 * The "Continue" button lives OUTSIDE this component entirely now —
 * `ContinueButton`, placed differently per breakpoint by the route.
 *
 * A Client Component only because unlocking depends on saved progress.
 * Until the store has read localStorage it renders the nothing-finished-yet
 * view, which is exactly what the server rendered — anything else is a
 * hydration mismatch.
 */
export function LessonList({
  titles,
  characterId,
  lessonId,
  basePath,
  tone,
  dict,
}: LessonListProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const starsFor = (n: number) =>
    hydrated ? (progress[itemKey(characterId, lessonId, n)]?.stars ?? 0) : 0;

  /* A lesson opens once the one before it is done — the same one-path rule
     the old number list used. */
  const cast = titles.map((title, index) => {
    const n = index + 1;
    return {
      n,
      title,
      index,
      locked: index > 0 && starsFor(n - 1) === 0,
      stars: starsFor(n),
    };
  });

  const nextValue = cast.find(({ locked, stars }) => !locked && stars === 0)?.n;

  return (
    <>
      {/* ---------- Tablet + desktop: a grid of cards (`hidden sm:grid`) ---------- */}
      <ul className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {cast.map(({ n, title, index, locked, stars }) => {
          const isNext = n === nextValue;
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
                  <span
                    className="text-5xl font-bold lg:text-6xl"
                    style={{ color: locked ? "var(--color-ink-soft)" : tone.face }}
                  >
                    {n}
                  </span>
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
                    {title}
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
            <li key={n}>
              {locked ? (
                <span
                  className={cardClass}
                  style={cardStyle}
                  aria-label={format(dict.lessonPicker.lockedLessonAria, { n, title })}
                >
                  {card}
                </span>
              ) : (
                <Link
                  href={`${basePath}/${n}`}
                  className={cardClass}
                  style={cardStyle}
                  aria-label={format(dict.lessonPicker.startLessonAria, { n, title })}
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
