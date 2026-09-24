"use client";

import type { CSSProperties } from "react";
import { Trophy, Unlock } from "lucide-react";
import { findLetterItem } from "@/data/letter-items";
import { Celebration } from "@/components/ui/celebration";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { format } from "@/lib/format-dict";
import type { LetterNode } from "@/types/letter-item";
import type { Locale } from "@/types/locale";
import type { Dictionary } from "@/lib/dictionaries/en";
import { cueFor } from "@/lib/cue";
import { LetterCoach } from "./letter-coach";
import { LetterGlyph } from "./letter-glyph";
import { WordPicture } from "./word-picture";

const GO_TONE = { face: "var(--color-go)", edge: "var(--color-go-dark)", text: "#fff" };

interface LetterCelebrateProps {
  node: LetterNode;
  /** The node this one opens, if any. */
  next?: LetterNode;
  basePath: string;
  dict: Dictionary;
  dir: "rtl" | "ltr";
  locale: Locale;
  onAgain: () => void;
}

/**
 * The end of a session. For a letter it is the new page of the Alphabet Book
 * — the clay pair and its word, the thing the child just earned — and what
 * it unlocked. For a checkpoint, the unit's trophy. Nothing is scored here.
 */
export function LetterCelebrate({ node, next, basePath, dict, dir, locale, onAgain }: LetterCelebrateProps) {
  const item = node.kind === "letter" ? findLetterItem(node.id) : undefined;
  const letter = node.id.toUpperCase();

  const title = item
    ? format(dict.letters.complete, { letter })
    : format(dict.letters.unitComplete, { n: node.unit });
  const unlocked = next
    ? next.kind === "letter"
      ? format(dict.letters.unlocked, { letter: next.id.toUpperCase() })
      : dict.letters.challengeUnlocked
    : undefined;
  const nextLabel = next
    ? next.kind === "letter"
      ? format(dict.letters.letterOf, { letter: next.id.toUpperCase() })
      : dict.letters.challenge
    : dict.journey.finish;

  return (
    <>
      <LetterCoach
        pose="celebrate"
        line={
          item
            ? format(dict.lettersPinki.celebrate, { letter })
            : dict.lettersPinki.challengeDone
        }
        cue={cueFor.pinki(locale, "celebrate", node.id)}
        listenLabel={dict.letters.listenAgain}
        dir={dir}
      />

      <div className="card card-clay-white anim-pop-in relative flex w-full max-w-sm flex-col items-center gap-4 px-6 py-6 text-center sm:max-w-md sm:px-10 sm:py-8">
        <Celebration />

        {item ? (
          <>
            <span className="flex items-end gap-2">
              <LetterGlyph letter={item.id} capital sizeClass="h-24 sm:h-28" sizes="112px" />
              <LetterGlyph letter={item.id} capital={false} sizeClass="h-16 sm:h-20" sizes="80px" />
            </span>
            <span className="flex items-center gap-2">
              <WordPicture
                word={item.words[0]}
                sizeClass="h-12 w-12"
                sizes="48px"
                emojiClass="text-4xl"
              />
              <span className="text-xl font-bold text-[var(--color-ink)]">{item.words[0].word}</span>
            </span>
            <p dir={dir} className="text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
              {dict.letters.newPage}
            </p>
          </>
        ) : (
          <span
            className="clay flex h-24 w-24 items-center justify-center rounded-full text-white"
            style={
              {
                backgroundColor: "var(--color-subject-letters)",
                "--clay-edge": "var(--color-subject-letters-dark)",
              } as CSSProperties
            }
          >
            <Trophy className="h-12 w-12" strokeWidth={2} />
          </span>
        )}

        <p dir={dir} className="text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
          {title}
        </p>

        {unlocked && (
          <div
            className="clay anim-pop-in flex items-center gap-2 rounded-full px-5 py-2.5"
            style={
              {
                backgroundColor: "var(--color-go)",
                "--clay-edge": "var(--color-go-dark)",
                animationDelay: "0.6s",
              } as CSSProperties
            }
          >
            <Unlock className="h-5 w-5 text-white" strokeWidth={2.75} />
            <span dir={dir} className="text-base font-bold text-white sm:text-lg">
              {unlocked}
            </span>
          </div>
        )}
      </div>

      <div className="anim-fade-up flex items-center gap-3 sm:gap-4">
        <AgainButton label={dict.journey.again} onPress={onAgain} dir={dir} />
        <NextButton
          label={nextLabel}
          tone={GO_TONE}
          href={next ? `${basePath}/${next.id}` : basePath}
          dir={dir}
        />
      </div>
    </>
  );
}
