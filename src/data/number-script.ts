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
    "Pick ONE apple!" makes no sense for a puzzle piece or an outline to
    colour in. `countHow` (the second, "how many did we pick" beat) only ever
    applies to `give`, so it's computed separately below.

    **"Pick", not "Give".** The child is choosing an item out of a tray, and
    the second beat asks about that choice — the two lines have to describe
    the same act or the question reads as being about something else. */
function countLine(value: number, word: string): string {
  const activity = countActivityFor(value);

  switch (activity.kind) {
    case "give":
      return `Pick ${word.toUpperCase()} ${pluralize(activity.itemLabel, value)}!`;
    case "complete":
      return `Complete Number ${value}!`;
    case "path":
      return `Walk me to Number ${value}!`;
    case "color":
      return `Color Number ${value}!`;
  }
}

/**
 * Pinki's lines for one number.
 *
 * Short and spoken, not written: she is talking to a child, so a line is a
 * phrase they can hold, and she speaks in the first person about her own
 * game ("Walk me to Number 5!"), never about herself in the third.
 *
 * Kept as data rather than strings in the components for the ordinary reason —
 * the UI must not own its content — and one specific one: these are the script
 * that gets recorded when audio arrives, so they need to be readable in one
 * place rather than hunted through seven components.
 */
export function scriptFor(value: number): NumberScript {
  const word = WORDS[value] ?? String(value);
  const activity = countActivityFor(value);
  /* ALWAYS the plural, unlike the invite line above. "Pick ONE apple!" counts
     the items being asked for, so it agrees with the number; "How many apples
     did we pick?" is asking about a quantity in the abstract and takes the
     plural whatever the answer turns out to be. Passing `value` here produced
     "How many apple did we pick?" on every number whose activity is `give`
     with a target of one. */
  const items =
    activity.kind === "give" ? pluralize(activity.itemLabel, 2) : "";

  return {
    word,
    discover: `Look what I found — Number ${value}!`,
    reveal: `This is Number ${value}!`,
    strokeHint: STROKE_HINTS[value] ?? "Watch me draw it!",
    traceInvite: "Trace it with me!",
    /* The whole point of this line: a miss is Pinki offering to go again, not
       the app telling a child they failed. */
    traceMiss: "So close! Let's go again.",
    find: `Which one is ${word.toUpperCase()}?`,
    findMiss: "Hmm... let's look again!",
    count: countLine(value, word),
    /* "did we pick", not "now": this asks about the act the child just
       performed, not about the state of the basket in front of them. */
    countHow: `How many ${items} did we pick?`,
    game: `Pop Number ${value}!`,
    celebrate: "Hooray! You did it!",
  };
}
