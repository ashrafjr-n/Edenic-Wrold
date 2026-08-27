import { NUMBER_VALUES } from "@/data/number-items";

/**
 * The numbers to offer for "which one is this?", answer included.
 *
 * Deterministic, never `Math.random()`: this is rendered on the server as
 * well as the client, and a random set would hydrate mismatched. Derived from
 * the answer itself, so the two rounds on one number get different decoys and
 * the same number always looks the same on a reload.
 *
 * The step is 3, which is coprime with the eight non-answer numbers, so the
 * walk visits all of them and can never repeat before it has to.
 */
export function buildNumberChoices(answer: number, count: number): number[] {
  const others = NUMBER_VALUES.filter((value) => value !== answer);
  const decoys: number[] = [];

  let cursor = (answer * count) % others.length;
  while (decoys.length < Math.min(count - 1, others.length)) {
    const candidate = others[cursor % others.length];
    if (!decoys.includes(candidate)) decoys.push(candidate);
    cursor += 3;
  }

  /* The answer sits in a different slot per round, so a child cannot learn
     "it is always the middle one" instead of learning the numeral. */
  const slot = (answer + count) % (decoys.length + 1);
  return [...decoys.slice(0, slot), answer, ...decoys.slice(slot)];
}
