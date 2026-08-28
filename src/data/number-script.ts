import type { NumberScript } from "@/types/number-journey";

const WORDS: Record<number, string> = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
};

/** How each numeral is written, in stroke order — read out while Pinki draws
    it. Only the numbers whose journey has been designed are written by hand;
    the rest fall back to a generic line rather than a wrong one. */
const STROKE_HINTS: Record<number, string> = {
  1: "A little flag... then straight down!",
};

/**
 * Pinki's lines for one number.
 *
 * Kept as data rather than strings in the components for the ordinary reason —
 * the UI must not own its content — and one specific one: these are the script
 * that gets recorded when audio arrives, so they need to be readable in one
 * place rather than hunted through seven components.
 */
export function scriptFor(value: number): NumberScript {
  const word = WORDS[value] ?? String(value);

  return {
    word,
    discover: `I found Number ${value}! Let's learn it together.`,
    reveal: `This is Number ${value}!`,
    strokeHint: STROKE_HINTS[value] ?? "Watch how I draw it!",
    traceInvite: "Your turn! Follow the dots with your finger.",
    /* The whole point of this line: a miss is Pinki offering to go again, not
       the app telling a child they failed. */
    traceMiss: "Almost! Let's try again together.",
    find: `Help me find ${word.toUpperCase()}!`,
    findMiss: "Hmm... let's look again!",
    count: `Give me ${word.toUpperCase()} apple!`,
    countHow: "How many apples do I have now?",
    game: `Pop Number ${value}!`,
    celebrate: "We did it! You're amazing!",
  };
}
