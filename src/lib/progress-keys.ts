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
    `/play`), but they are the same thing to the store: one key, best
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

/** The star a Learn course's gold chest gives (`star.pinki.shapes`), one a
    course, earned when every lesson is done and the chest opens. */
export function chestStarKey(characterId: string, lessonId: string): ItemKey {
  return `star.${characterId}.${lessonId}`;
}


/** Play's games that stars open (`edenic-plan.md` "Stars → Play's games"). */
export type PlayGame = "puzzle" | "memory" | "find";

/** What one Play game costs: two chest stars. */
export const STARS_PER_GAME = 2;

/** A Play game the child has opened with their stars (`play.open.puzzle`) —
    kept for good: the stars are spent, the game stays open. */
export function playOpenKey(game: PlayGame): ItemKey {
  return `play.open.${game}`;
}

/** Every key that is a chest star — `chestStarKey`'s shape. */
export function isChestStarKey(key: ItemKey): boolean {
  return key.startsWith("star.");
}
