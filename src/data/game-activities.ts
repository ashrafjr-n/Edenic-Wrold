import type { GameActivityKind } from "@/types/number-journey";

/**
 * Per-number override for the `game` stage — the last thing a child does
 * before the celebration.
 *
 * The same idea as `count-activities.ts` and for the same reason: nine
 * journeys that all end on the identical exercise stop being a reward. Most
 * numbers pop balloons; the ones listed here get something else.
 *
 * **A number must never use `complete` here AND at `count`**, or it drags the
 * same missing piece back twice in one journey. 4 and 9 already use it at
 * `count`, which is why 2 is the one that uses it here.
 */
const gameActivityByValue: Record<number, GameActivityKind> = {
  2: "complete",
};

export function gameActivityFor(value: number): GameActivityKind {
  return gameActivityByValue[value] ?? "balloons";
}
