/**
 * How a thing the child can finish is addressed in the progress store.
 *
 * **These live here, not in `store/progress.ts`, precisely because that file
 * is `"use client"`.** They are pure string builders with no state in them,
 * but anything exported from a client module can only be CALLED from client
 * code — a Server Component that so much as maps a list through `puzzleKey`
 * crashes with "attempted to call puzzleKey() from the server". The
 * Activities cards are Server Components that need exactly that, so the
 * builders sit in `lib/` and the store re-exports them, which keeps every
 * existing client import working unchanged.
 */

export type ItemKey = string;

/** `pinki.numbers.1` — the shape CLAUDE.md describes (character → lesson →
    item), flattened to one key so the store stays a single flat map instead of
    three nested records to merge on every write. */
export function itemKey(
  characterId: string,
  lessonId: string,
  item: number | string,
): ItemKey {
  return `${characterId}.${lessonId}.${item}`;
}

/** Puzzles sit outside the character → lesson → item tree (they live under
    `/activities`), but they are the same thing to the store: one key, best
    score wins, one place completion lives. */
export function puzzleKey(stage: number): ItemKey {
  return `puzzle.${stage}`;
}

/** Same again for the memory game's twelve levels (`memory.1`). Unlike a
    puzzle — which is finished or not, and records a flat constant — a level
    records REAL stars here, so the store's "best score wins" rule is doing
    actual work for these keys. */
export function memoryKey(level: number): ItemKey {
  return `memory.${level}`;
}
