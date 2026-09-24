"use client";

import { useRef } from "react";
import { BookOpen, X } from "lucide-react";
import { letterItems } from "@/data/letter-items";
import { itemKey, useProgress } from "@/store/progress";
import type { LessonTheme } from "@/types/lesson";
import type { Dictionary } from "@/lib/dictionaries/en";
import { Button3D } from "@/components/ui/button-3d";
import { LetterGlyph } from "./letter-glyph";
import { WordPicture } from "./word-picture";

interface AlphabetBookProps {
  characterId: string;
  lessonId: string;
  theme: LessonTheme;
  dict: Dictionary;
}

/**
 * "My Alphabet Book" — a page per letter, A to Z, filled in as each letter
 * is finished: the clay letter pair and its headline word. It is how the
 * child SEES the alphabet growing, in the order they know it, whatever the
 * map looks like today. Not points and not stars — nothing is scored here.
 *
 * A native `<dialog>`: `showModal()` gives the top layer, the backdrop,
 * Escape to close and focus trapping for free, and hands focus back to the
 * button on close.
 */
export function AlphabetBook({ characterId, lessonId, theme, dict }: AlphabetBookProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const isDone = (id: string) =>
    hydrated && (progress[itemKey(characterId, lessonId, id)]?.stars ?? 0) > 0;
  const doneCount = letterItems.filter((item) => isDone(item.id)).length;

  return (
    <>
      <Button3D
        tone={{ face: theme.accent, edge: theme.accentDark }}
        onClick={() => dialogRef.current?.showModal()}
        className="flex w-full items-center justify-center gap-2.5 py-3 text-base sm:text-lg"
      >
        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
        {dict.letters.book}
        <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-sm font-bold">
          {doneCount} / {letterItems.length}
        </span>
      </Button3D>

      <dialog
        ref={dialogRef}
        aria-label={dict.letters.book}
        /* A tap on the backdrop lands on the dialog element itself. */
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto max-h-[88svh] w-[min(44rem,calc(100%-2rem))] overflow-visible border-0 bg-transparent p-0 backdrop:bg-[rgb(var(--shadow-hue)/45%)]"
      >
        <div className="card card-clay-white flex max-h-[88svh] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-7 sm:pt-6">
            <h2 className="text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
              {dict.letters.book}
            </h2>
            <Button3D
              tone={{ face: "var(--accent)", edge: "var(--accent-dark)" }}
              onClick={() => dialogRef.current?.close()}
              aria-label={dict.letters.bookClose}
              className="h-11 w-11 shrink-0"
            >
              <X className="h-5 w-5" strokeWidth={3} />
            </Button3D>
          </div>

          {doneCount === 0 && (
            <p className="px-5 pb-2 text-sm font-semibold text-[var(--color-ink-soft)] sm:px-7 sm:text-base">
              {dict.letters.bookEmpty}
            </p>
          )}

          <ol className="grid grid-cols-3 gap-3 overflow-y-auto px-5 pb-6 pt-1 sm:grid-cols-5 sm:gap-4 sm:px-7 sm:pb-7">
            {letterItems.map((item) => {
              const done = isDone(item.id);
              const headline = item.words[0];

              return (
                <li
                  key={item.id}
                  className={`tile tile-clay flex aspect-[3/4] flex-col items-center justify-center gap-1.5 p-2 ${
                    done ? "" : "opacity-45"
                  }`}
                  style={{ "--tile-tint": "var(--surface)" } as React.CSSProperties}
                >
                  <span className="flex items-end gap-0.5">
                    <LetterGlyph
                      letter={item.id}
                      capital
                      sizeClass="h-8 sm:h-9"
                      sizes="40px"
                      className={done ? "" : "grayscale"}
                    />
                    <LetterGlyph
                      letter={item.id}
                      capital={false}
                      sizeClass="h-6 sm:h-7"
                      sizes="32px"
                      className={done ? "" : "grayscale"}
                    />
                  </span>
                  {done ? (
                    <>
                      <WordPicture
                        word={headline}
                        sizeClass="h-9 w-9 sm:h-10 sm:w-10"
                        sizes="40px"
                        emojiClass="text-3xl sm:text-4xl"
                      />
                      <span className="text-xs font-bold text-[var(--color-ink)] sm:text-sm">
                        {headline.word}
                      </span>
                    </>
                  ) : (
                    <span className="h-9 sm:h-10" aria-hidden />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </dialog>
    </>
  );
}
