import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/types/locale";
import type { NumberScript } from "@/types/number-journey";
import { format } from "@/lib/format-dict";
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
    the rest fall back to a generic line rather than a wrong one. English
    only — `scriptFromDict` below reads each locale's own copy
    (`dict.pinki.strokeHint1`). */
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
      return `Pick ${word.toUpperCase()} ${pluralize(activity.itemLabel.en, value)}!`;
    case "complete":
      return `Complete Number ${value}!`;
    case "path":
      return `Walk me to Number ${value}!`;
    case "color":
      return `Color Number ${value}!`;
  }
}

/**
 * Pinki's lines for one number, in English — the site's original
 * composition, byte-for-byte unchanged (the English locale must never
 * change; see CLAUDE.md's language switcher conventions). `scriptFromDict`
 * below covers every OTHER locale, composed separately rather than through
 * these same helpers, since English pluralization/casing rules don't apply.
 *
 * Short and spoken, not written: she is talking to a child, so a line is a
 * phrase they can hold, and she speaks in the first person about her own
 * game ("Walk me to Number 5!"), never about herself in the third.
 */
function scriptForEn(value: number): NumberScript {
  const word = WORDS[value] ?? String(value);
  const activity = countActivityFor(value);
  /* ALWAYS the plural, unlike the invite line above. "Pick ONE apple!" counts
     the items being asked for, so it agrees with the number; "How many apples
     did we pick?" is asking about a quantity in the abstract and takes the
     plural whatever the answer turns out to be. Passing `value` here produced
     "How many apple did we pick?" on every number whose activity is `give`
     with a target of one. */
  const items =
    activity.kind === "give" ? pluralize(activity.itemLabel.en, 2) : "";

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

/**
 * Pinki's lines for one number in every locale EXCEPT English, composed from
 * that locale's own `dict.pinki` templates. There is no per-language branch
 * here on purpose: Arabic and Badini Kurdish differ only in the strings, so
 * a third right-to-left language needs a dictionary and nothing else.
 *
 * The number WORD itself (`WORDS[value]`, e.g. "One") is the taught content
 * and never translates — only the sentence around it does, per CLAUDE.md's
 * language switcher conventions. Noun agreement after a numeral is not
 * modelled in either language (see each dictionary's doc comment):
 * `countGive`/`countHow` use the bare digit and the item's plain singular.
 */
function scriptFromDict(
  value: number,
  locale: Locale,
  pinki: Dictionary["pinki"],
): NumberScript {
  const word = WORDS[value] ?? String(value);
  const activity = countActivityFor(value);
  const itemLabel = activity.kind === "give" ? activity.itemLabel[locale] : "";

  const countTemplate =
    activity.kind === "give"
      ? pinki.countGive
      : activity.kind === "complete"
        ? pinki.countComplete
        : activity.kind === "path"
          ? pinki.countPath
          : pinki.countColor;

  return {
    word,
    discover: format(pinki.discover, { value }),
    reveal: format(pinki.reveal, { value }),
    strokeHint: value === 1 ? pinki.strokeHint1 : pinki.strokeHintDefault,
    traceInvite: pinki.traceInvite,
    traceMiss: pinki.traceMiss,
    find: format(pinki.find, { word }),
    findMiss: pinki.findMiss,
    count: format(countTemplate, { value, word, itemLabel }),
    countHow: format(pinki.countHow, { itemLabel }),
    game: format(pinki.game, { value }),
    celebrate: pinki.celebrate,
  };
}

export function scriptFor(
  value: number,
  locale: Locale,
  dict: Dictionary,
): NumberScript {
  return locale === "en" ? scriptForEn(value) : scriptFromDict(value, locale, dict.pinki);
}
