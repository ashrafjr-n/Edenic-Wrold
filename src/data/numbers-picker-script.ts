/**
 * What Pinki says on the number PICKER, as opposed to inside one number's
 * journey.
 *
 * Deliberately its own module rather than another field on `NumberScript`
 * (`data/number-script.ts`): that script is built per number by
 * `scriptFor(value)`, and every line in it is about the one numeral the child
 * is working on. These lines are about the lesson as a whole, so hanging them
 * off a per-number script would mean computing nine identical copies of one
 * string.
 *
 * Written to be read aloud later, same as the journey's lines — audio is not
 * built yet, but the wording assumes it.
 */
export const numbersPickerScript = {
  /** Nothing finished yet: the child has never opened a number. */
  notStarted:
    "Hi! I'm Pinki. Let's learn our numbers together — tap Number 1 to start! 🌟",
};
