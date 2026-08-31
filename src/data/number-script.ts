import type { NumberScript } from "@/types/number-journey";
import { countActivityFor } from "./count-activities";

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

/** "apple" + 1 stays "apple"; anything else gets an "s". */
function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

/** The `count` stage's invite line — different per activity kind, since
    "Give me ONE apple!" makes no sense for a puzzle piece or a hidden
    numeral. `countHow` (the second, "how many do I have now" beat) only
    ever applies to `give`, so it's computed separately below. */
function countLine(value: number, word: string): string {
  const activity = countActivityFor(value);

  switch (activity.kind) {
    case "give":
      return `Give me ${word.toUpperCase()} ${pluralize(activity.itemLabel, value)}!`;
    case "complete":
      return `Complete Number ${value}!`;
    case "path":
      return `Help Pinki reach Number ${value}!`;
    case "reveal":
      return `Reveal Number ${value}!`;
  }
}

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
  const activity = countActivityFor(value);
  const items =
    activity.kind === "give" ? pluralize(activity.itemLabel, value) : "";

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
    count: countLine(value, word),
    countHow: `How many ${items} do I have now?`,
    game: `Pop Number ${value}!`,
    celebrate: "We did it! You're amazing!",
  };
}
