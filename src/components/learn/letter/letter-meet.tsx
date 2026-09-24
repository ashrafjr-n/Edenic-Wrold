"use client";

import { useState } from "react";
import type { LetterItem, LetterWord } from "@/types/letter-item";
import type { Dictionary } from "@/lib/dictionaries/en";
import { cueFor, playCue } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import { CueButton } from "./cue-button";
import { LetterGlyph } from "./letter-glyph";
import { WordPicture } from "./word-picture";

interface LetterMeetProps {
  item: LetterItem;
  dict: Dictionary;
}

/**
 * Meet the letter: the clay pair (Aa), its NAME and its SOUND on two gold
 * buttons, and the words it is taught with. The name and the sound are two
 * different things and a child needs both — "ay" is what the letter is
 * called, /a/ is what it says in "apple".
 */
export function LetterMeet({ item, dict }: LetterMeetProps) {
  const upper = item.id.toUpperCase();

  return (
    <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
      <div className="card card-clay-white flex items-end justify-center gap-3 px-10 py-6 sm:gap-4 sm:px-14 sm:py-8">
        <LetterGlyph
          letter={item.id}
          capital
          sizeClass="h-28 sm:h-36"
          sizes="(min-width: 640px) 144px, 112px"
          alt={format(dict.letters.tileAria, { letter: upper })}
        />
        <LetterGlyph
          letter={item.id}
          capital={false}
          sizeClass="h-20 sm:h-28"
          sizes="(min-width: 640px) 112px, 80px"
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <CueButton cue={cueFor.letterName(item.id)} label={dict.letters.hearName} invite>
          {upper}
        </CueButton>
        <CueButton cue={cueFor.letterSound(item.id)} label={dict.letters.hearSound}>
          /{item.id}/
        </CueButton>
      </div>

      <ul className="grid w-full max-w-md grid-cols-3 gap-3 sm:gap-4">
        {item.words.map((word) => (
          <li key={word.word}>
            <WordCard word={word} letter={item.id} dict={dict} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface WordCardProps {
  word: LetterWord;
  letter: string;
  dict: Dictionary;
}

/** A picture that says its word when tapped, the taught letter in colour. */
function WordCard({ word, letter, dict }: WordCardProps) {
  const [speaking, setSpeaking] = useState(false);
  const at = word.word.indexOf(letter);

  const say = () => {
    if (speaking) return;
    setSpeaking(true);
    void playCue(cueFor.word(word.word)).then(() => setSpeaking(false));
  };

  return (
    <button
      type="button"
      onClick={say}
      aria-label={format(dict.letters.hearWord, { word: word.word })}
      className={`card card-clay-white flex w-full flex-col items-center gap-1.5 px-2 py-3 transition-transform duration-200 active:scale-95 sm:py-4 ${
        speaking ? "anim-jump" : ""
      }`}
    >
      <WordPicture
        word={word}
        sizeClass="h-14 w-14 sm:h-16 sm:w-16"
        sizes="64px"
        emojiClass="text-5xl sm:text-6xl"
      />
      <span className="text-sm font-bold text-[var(--color-ink)] sm:text-base">
        {word.word.slice(0, at)}
        <span style={{ color: "var(--color-subject-letters)" }}>{word.word[at]}</span>
        {word.word.slice(at + 1)}
      </span>
    </button>
  );
}
