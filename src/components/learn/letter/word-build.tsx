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
          sizeClass="h-20 w-20 sm:h-24 sm:w-24"
          sizes="96px"
          emojiClass="text-7xl"
        />
        <CueButton cue={cueFor.word(word.word)} label={format(dict.letters.hearWord, { word: word.word })} />
      </div>

      <ol className="flex gap-2 sm:gap-3" aria-label={word.word}>
        {[...word.word].map((letter, index) => (
          <li
            key={index}
            aria-label={format(dict.letters.slotAria, { n: index + 1, total: word.word.length })}
            className="tile flex h-16 w-14 items-center justify-center sm:h-20 sm:w-16"
            style={
              {
                "--tile-tint": index < placed ? "var(--surface)" : "var(--color-locked)",
                outline: index === placed && !done ? "3px dashed var(--color-locked-dark)" : undefined,
                outlineOffset: "2px",
              } as React.CSSProperties
            }
          >
            {index < placed && (
              <LetterGlyph
                letter={letter as LetterId}
                capital={false}
                sizeClass="h-10 sm:h-12 anim-pop-in"
                sizes="48px"
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
                className={`card card-clay-white flex h-16 w-16 items-center justify-center transition-[scale,opacity] duration-200 active:scale-95 sm:h-20 sm:w-20 ${
                  gone ? "opacity-0" : ""
                } ${wrong === index ? "anim-wiggle" : ""}`}
              >
                <LetterGlyph letter={tile as LetterId} capital={false} sizeClass="h-10 sm:h-12" sizes="48px" />
              </button>
            </li>
          );
        })}
      </ul>

      {done && <Celebration />}
    </div>
  );
}
