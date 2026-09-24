import Image from "next/image";
import type { LetterWord } from "@/types/letter-item";

interface WordPictureProps {
  word: LetterWord;
  /** Tailwind size classes for the picture's box, e.g. `h-16 w-16`. */
  sizeClass: string;
  /** The painted width, for `next/image`'s srcset (see viewport-and-images). */
  sizes: string;
  /** Emoji font size — emoji scale with text, not with the box. */
  emojiClass: string;
}

/**
 * The picture for a taught word: its clay render where one exists, its emoji
 * until then. One component so the day a render lands it shows everywhere a
 * word is drawn — the meet cards, the sound game, spelling, the book.
 */
export function WordPicture({ word, sizeClass, sizes, emojiClass }: WordPictureProps) {
  return (
    <span className={`flex items-center justify-center ${sizeClass}`} aria-hidden>
      {word.picture ? (
        <Image
          src={word.picture}
          alt=""
          sizes={sizes}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className={`leading-none ${emojiClass}`}>{word.emoji}</span>
      )}
    </span>
  );
}
