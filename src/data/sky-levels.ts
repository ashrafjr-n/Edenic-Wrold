import type { CharacterId } from "@/types/character";

/** One short challenge of a Sky Trail level: a level of a game that already
    exists, so its difficulty is that game's own (`memoryLevels`,
    `puzzleStages`, `CUPS_LEVELS`) — nothing is tuned twice. */
export type SkyChallenge =
  | { game: "memory"; level: number }
  | { game: "puzzle"; stage: number }
  | { game: "cups"; level: number };

export interface SkyLevel {
  /** 1…n: the cloud's number, and the URL segment under `/play/sky`. */
  value: number;
  /** The friend flying along from this level's cloud on (none on the first three). */
  friend?: CharacterId;
  /** Three, played in order; the third finishes the level. */
  challenges: readonly [SkyChallenge, SkyChallenge, SkyChallenge];
}

/**
 * The Sky Trail's levels (2026-11-12, phase 1 of `edenic-plan.md`'s three):
 * each a notch harder than the one before, the order of the three games
 * turning so no two levels open the same way. Levels 1–3 are flown alone;
 * Pinki joins on level 4's cloud and brings her power — the puzzle's Help.
 *
 * The world (`data/sky-stops.ts`) is rendered with one cloud per level: add
 * a level here and it must be rendered again (`render.cjs stops sky`).
 */
export const SKY_LEVELS: readonly SkyLevel[] = [
  { value: 1, challenges: [{ game: "memory", level: 1 }, { game: "cups", level: 1 }, { game: "puzzle", stage: 1 }] },
  { value: 2, challenges: [{ game: "cups", level: 2 }, { game: "puzzle", stage: 2 }, { game: "memory", level: 2 }] },
  { value: 3, challenges: [{ game: "puzzle", stage: 3 }, { game: "memory", level: 3 }, { game: "cups", level: 3 }] },
  { value: 4, friend: "pinki", challenges: [{ game: "memory", level: 4 }, { game: "cups", level: 4 }, { game: "puzzle", stage: 4 }] },
  { value: 5, friend: "pinki", challenges: [{ game: "cups", level: 5 }, { game: "puzzle", stage: 5 }, { game: "memory", level: 5 }] },
];

/** The trail's two halves of a progress key (`play.sky.<n>`, `itemKey`), and
    what `CourseWorld` and the chest run know it by. */
export const SKY_KEY = { owner: "play", course: "sky" } as const;

export function findSkyLevel(value: number): SkyLevel | undefined {
  return SKY_LEVELS.find((level) => level.value === value);
}

/**
 * A game hosted by a Sky Trail level: its chrome goes back to the sky and
 * wears the level's number, and solving it tells the level — nothing is
 * recorded as that game's own progress, and it shows no Again / Next.
 */
export interface SkyHost {
  level: number;
  backHref: string;
  backLabel: string;
  onSolved: () => void;
  /** Pinki's power: the puzzle's Help (off without her). */
  help?: boolean;
}
