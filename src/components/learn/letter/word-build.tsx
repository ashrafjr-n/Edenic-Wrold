"use client";

import { useState } from "react";
import type { LetterId, LetterWord } from "@/types/letter-item";
import type { Dictionary } from "@/lib/dictionaries/en";
import { cueFor, playCue } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import { Celebration } from "@/components/ui/celebration";
import { CueButton } from "./cue-button";
import { LetterGlyph } from "./letter-glyph";
import { WordPicture } from "./word-picture";

interface WordBuildProps {
  word: LetterWord;
  /** The word's letters plus a couple of spares, shuffled. */
  tiles: string[];
  dict: Dictionary;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Spell the word under the picture, one sound at a time: each tapped letter
 * says its sound and flies into the next empty spot, so the child hears
 * /c/ /a/ /t/ become "cat". Only the next right letter goes in; any other
 * wobbles and stays — the word is built in order, the way it is read.
 */
export function WordBuild({ word, tiles, dict, onSolved, onMiss }: WordBuildProps) {
  const [used, setUsed] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const placed = used.length;
  const done = placed === word.word.length;

  const tap = (tile: string, index: number) => {
    if (done || used.includes(index)) return;
    void playCue(cueFor.letterSound(tile as LetterId));
    if (tile !== word.word[placed]) {
      setWrong(index);
      onMiss();
      return;
    }
    setUsed([...used, index]);
    if (placed + 1 === word.word.length) {
      void playCue(cueFor.word(word.word));
      onSolved();
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center gap-5 sm:gap-6">
      <div className="card card-clay-white flex items-center gap-4 px-6 py-4 sm:gap-5 sm:px-8">
        <WordPicture
          word={word}
          sizeClass="h-24 w-24 sm:h-28 sm:w-28"
          sizes="112px"
          emojiClass="text-8xl"
        />
        <CueButton cue={cueFor.word(word.word)} label={format(dict.letters.hearWord, { word: word.word })} />
      </div>

      <ol className="flex gap-3 sm:gap-4" aria-label={word.word}>
        {[...word.word].map((letter, index) => (
          <li
            key={index}
            aria-label={format(dict.letters.slotAria, { n: index + 1, total: word.word.length })}
            /* Clay both ways: an empty spot is PRESSED INTO the surface (the
               inset shading the progress track uses), a filled one is a raised
               white clay tile. */
            className={`flex h-24 w-[4.5rem] items-center justify-center sm:h-28 sm:w-20 ${
              index < placed ? "card card-clay-white" : "tile"
            }`}
            style={
              index < placed
                ? undefined
                : ({
                    "--tile-tint": "var(--color-locked)",
                    boxShadow:
                      "inset 0 4px 8px -2px color-mix(in srgb, var(--color-locked-dark) 95%, transparent), inset 0 -2px 3px -1px rgb(255 255 255 / 70%)",
                    outline: index === placed && !done ? "3px dashed var(--page-accent-color)" : undefined,
                    outlineOffset: "3px",
                  } as React.CSSProperties)
            }
          >
            {index < placed && (
              <LetterGlyph
                letter={letter as LetterId}
                capital={false}
                sizeClass="h-14 sm:h-16 anim-pop-in"
                sizes="64px"
              />
            )}
          </li>
        ))}
      </ol>

      <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {tiles.map((tile, index) => {
          const gone = used.includes(index);
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => tap(tile, index)}
                onAnimationEnd={() => setWrong(null)}
                disabled={gone}
                aria-label={format(dict.letters.tileAria, { letter: tile })}
                className={`card card-clay-white flex h-20 w-20 items-center justify-center transition-[scale,opacity] duration-200 active:scale-95 sm:h-24 sm:w-24 ${
                  gone ? "opacity-0" : ""
                } ${wrong === index ? "anim-wiggle" : ""}`}
              >
                <LetterGlyph letter={tile as LetterId} capital={false} sizeClass="h-12 sm:h-14" sizes="56px" />
              </button>
            </li>
          );
        })}
      </ul>

      {done && <Celebration />}
    </div>
  );
}
