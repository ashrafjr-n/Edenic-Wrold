import type { CSSProperties } from "react";

/** The colours a word's letters are made of — the site's own clay hues.
    Gold is left out: it is the say-it colour and means "press to hear". */
const LETTER_TONES = [
  { face: "var(--brand)", edge: "var(--brand-dark)" },
  { face: "var(--accent)", edge: "var(--accent-dark)" },
  { face: "var(--color-go)", edge: "var(--color-go-dark)" },
  { face: "var(--color-subject-shapes)", edge: "var(--color-subject-shapes-dark)" },
  { face: "var(--color-nova)", edge: "var(--color-nova-dark)" },
  { face: "var(--color-bloo)", edge: "var(--color-bloo-dark)" },
] as const;

export type LetterTone = (typeof LETTER_TONES)[number];

/** One tone per letter of `word`. The SAME letter always gets the same tone
    ("circle"'s two c's match), so a letter tile's colour never argues with
    the word it belongs to. */
export function letterTones(word: string): LetterTone[] {
  const order: string[] = [];
  return [...word].map((letter) => {
    if (!order.includes(letter)) order.push(letter);
    return LETTER_TONES[order.indexOf(letter) % LETTER_TONES.length];
  });
}

type LetterVars = CSSProperties & { "--letter-face": string; "--letter-edge": string };

interface ClayWordProps {
  word: string;
  /** `lg` is the word on its own card; `md` sits above the spelling board;
      `sm` is the word on the done screen and above a pick; `demo` is the
      word inside a how-to demo, which never grows with the screen (the
      demo's box is the same size everywhere). */
  size?: "lg" | "md" | "sm" | "demo";
}

/**
 * An English word in clay letters, each its own colour, popping in one after
 * another. The look lives in `.clay-letter` (globals.css). Always `ltr` — the
 * taught word is English in every locale.
 */
export function ClayWord({ word, size = "lg" }: ClayWordProps) {
  const tones = letterTones(word);
  const long = word.length > 6;
  const type =
    size === "demo"
      ? /* Desktop: the docked panel's demo box is a container — the word
           fits its width however long it is. */
        long
        ? "text-5xl sm:text-6xl lg:text-[length:min(3.75rem,16cqi)]"
        : "text-5xl sm:text-6xl lg:text-[length:min(3.75rem,22cqi)]"
      : size === "sm"
      ? "text-5xl sm:text-6xl lg:text-[min(4.5rem,8svh)]"
      : size === "lg"
      ? long
        ? "text-6xl sm:text-8xl lg:text-[min(6rem,9svh)]"
        : "text-7xl sm:text-9xl lg:text-[min(8rem,11svh)]"
      : long
        ? "text-6xl lg:text-[min(4.5rem,8svh)]"
        : "text-[5rem] sm:text-7xl lg:text-[min(5.5rem,9svh)]";

  return (
    <span dir="ltr" aria-label={word} role="img" className={`flex font-bold tracking-wide ${type}`}>
      {[...word].map((letter, i) => (
        <span
          key={i}
          aria-hidden
          className="clay-letter anim-pop-in"
          style={
            {
              "--letter-face": tones[i].face,
              "--letter-edge": tones[i].edge,
              animationDelay: `${0.1 + i * 0.08}s`,
            } as LetterVars
          }
        >
          {letter}
        </span>
      ))}
    </span>
  );
}
