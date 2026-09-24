import type { StaticImageData } from "next/image";
import type { NumberStroke } from "@/types/number-item";

/** The alphabet in teaching order. Letters are taught A–Z — the order
    children (and parents) already know from the song — and the phonics lives
    INSIDE each session (letter sounds, words that start with it), not in the
    order of the map. */
export const LETTER_IDS = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
] as const;

export type LetterId = (typeof LETTER_IDS)[number];

/** A word a letter is taught with. The word itself is English in every
    locale — it is the taught content. */
export interface LetterWord {
  word: string;
  /** The picture until a clay render exists for this word. */
  emoji: string;
  /** A clay 3D render, when one exists — shown instead of the emoji. */
  picture?: StaticImageData;
}

export interface LetterItem {
  id: LetterId;
  /** 1–5. Each unit ends in a checkpoint challenge on the map. */
  unit: number;
  capital: StaticImageData;
  small: StaticImageData;
  /** The letter's reel (9:16). Optional until every clip is delivered — a
      session without one simply starts at `meet`. */
  video?: string;
  /** The first is the headline word ("A is for apple"). Every one starts
      with the letter's most common sound — except x, which is taught as the
      sound at the END of a word (box, fox). */
  words: readonly LetterWord[];
  capitalStrokes: readonly NumberStroke[];
  smallStrokes: readonly NumberStroke[];
}

/** A node on the Letters map: a letter, or the challenge closing a unit. */
export type LetterNode =
  | { kind: "letter"; id: LetterId; unit: number }
  | { kind: "checkpoint"; id: `unit-${number}`; unit: number };
