import type { StaticImageData } from "next/image";
import { SKY_NIGHT_SEARCH } from "@/data/sky-night-search";
import type { CharacterId } from "@/types/character";
import type { Framed, SceneRect } from "@/types/course";
import type { MemoryLevel } from "@/types/memory";
import type { PuzzleGrid, PuzzlePicture } from "@/types/puzzle";
import starPicture from "../../public/assets/learn/chest-star.png";
import moonPicture from "../../public/assets/play/sky/sky-moon.png";
import cloudPicture from "../../public/assets/play/sky/sky-cloud.png";
/* The puzzles' pictures: the trail itself, where the level is (a frame of the
   world's own — full of things, so no two pieces look alike). */
import trailStart from "../../public/assets/play/sky/night/stops/landscape/f012.jpg";
import trailEnd from "../../public/assets/play/sky/night/stops/landscape/f078.jpg";

/** A level's search in one frame (`tools/picnic-scene`, `render.cjs search`): the
    night from the level's place, the hidden things IN the picture, where each is
    (`items`, % of the picture) and what a cloud lies over until it is tapped away
    (`covers`; `item` -1 covers no item — the moon). */
export interface SkySearchFrame {
  picture: StaticImageData;
  items: readonly SceneRect[];
  covers: readonly { box: SceneRect; item: number }[];
}

export type SkySearch = Framed<SkySearchFrame>;

/** One step of a level, played in order. A hosted game (memory, puzzle) is given
    whole — its difficulty is this level's own, tuned here. */
export type SkyStep =
  | { kind: "word"; word: string; picture: StaticImageData }
  | { kind: "spell"; word: string }
  | { kind: "search"; ask: "searchStars" | "searchDust" | "searchLights"; scene: SkySearch }
  | { kind: "memory"; level: MemoryLevel }
  | { kind: "puzzle"; picture: PuzzlePicture; grid: PuzzleGrid };

export interface SkyLevel {
  /** 1…18: the cloud's number, and the URL segment under `/play/sky`. */
  value: number;
  /** The friend flying along from this level's cloud on (none in world 1). */
  friend?: CharacterId;
  /** Played in order; the last finishes the level. */
  steps: readonly SkyStep[];
}

/** World 1's closing games — the MEDIUM step (the user: world 1 medium, world 4
    the hardest): a 12-piece puzzle of the trail where the level is, six pairs of the
    night's things (two of them stars that look alike). */
const MEDIUM_GRID: PuzzleGrid = { cols: 4, rows: 3 };
const NIGHT_PAIRS: MemoryLevel = { value: 0, pairs: 6, cols: 4, seconds: 66, faces: ["skyStar", "skyFallen", "skyMoon", "skyCloud", "skyRainbow", "skyBalloon"] };

/**
 * The Sky Trail's levels. **World 1, night (stage 3, 2026-11-12)** — a level is:
 * the word (its sound, then its letters put in order; no reel), a search in the
 * level's own view of the night (never for the fallen star), and a closing
 * game, Puzzle and Memory Match in turn.
 *
 * 1 "A star fell" — star: the small stars left in the sky.
 * 2 "The moon saw it all" — moon: tap the clouds off the moon, find the star's dust.
 * 3 "Who will help me?" — cloud: three far lights, the friends' houses.
 */
export const SKY_LEVELS: readonly SkyLevel[] = [
  {
    value: 1,
    steps: [
      { kind: "word", word: "star", picture: starPicture },
      { kind: "spell", word: "star" },
      { kind: "search", ask: "searchStars", scene: SKY_NIGHT_SEARCH[1] },
      { kind: "puzzle", picture: { image: trailStart, alt: "The night trail: clouds one, two and three, and a little pink house far off" }, grid: MEDIUM_GRID },
    ],
  },
  {
    value: 2,
    steps: [
      { kind: "word", word: "moon", picture: moonPicture },
      { kind: "spell", word: "moon" },
      { kind: "search", ask: "searchDust", scene: SKY_NIGHT_SEARCH[2] },
      { kind: "memory", level: NIGHT_PAIRS },
    ],
  },
  {
    value: 3,
    steps: [
      { kind: "word", word: "cloud", picture: cloudPicture },
      { kind: "spell", word: "cloud" },
      { kind: "search", ask: "searchLights", scene: SKY_NIGHT_SEARCH[3] },
      { kind: "puzzle", picture: { image: trailEnd, alt: "Pinki's pink house on its cloud, under the stars" }, grid: MEDIUM_GRID },
    ],
  },
];

/** One of the trail's four worlds (`edenic-plan.md` "four worlds, one story"): its
    levels, and the friend whose cloud house ends it — the door opens with that
    friend's stars (one per Learn course of theirs) once every level is done. */
export interface SkyWorld {
  id: "night" | "sunrise" | "garden" | "high";
  levels: readonly number[];
  door: CharacterId;
}

/** Built so far: world 1, night (stage 2, 2026-11-12). The rest come stage by stage. */
export const SKY_WORLDS: readonly SkyWorld[] = [{ id: "night", levels: [1, 2, 3], door: "pinki" }];

/** The world a level belongs to. */
export function worldOf(level: number): SkyWorld | undefined {
  return SKY_WORLDS.find((world) => world.levels.includes(level));
}

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
