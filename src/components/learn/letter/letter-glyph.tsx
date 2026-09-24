import Image from "next/image";
import { findLetterItem } from "@/data/letter-items";
import type { LetterId } from "@/types/letter-item";

interface LetterGlyphProps {
  letter: LetterId;
  capital: boolean;
  /** Height classes; the width follows the glyph's own shape. */
  sizeClass: string;
  /** The painted width, for `next/image`'s srcset. */
  sizes: string;
  /** Screen-reader name. Empty when the letter is already named nearby. */
  alt?: string;
  className?: string;
}

/** One clay letter, capital or small, cut from the two letter sheets. */
export function LetterGlyph({
  letter,
  capital,
  sizeClass,
  sizes,
  alt = "",
  className = "",
}: LetterGlyphProps) {
  const item = findLetterItem(letter);
  if (!item) return null;

  return (
    <Image
      src={capital ? item.capital : item.small}
      alt={alt}
      sizes={sizes}
      draggable={false}
      className={`w-auto select-none object-contain ${sizeClass} ${className}`}
    />
  );
}
