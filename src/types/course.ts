import type { StaticImageData } from "next/image";
import type { Dictionary } from "@/lib/dictionaries/en";

export type ShapeId = "circle" | "square" | "triangle" | "rectangle";

/** The ten colors the Colors course teaches, in the order it teaches them. */
export type ColorId = "red" | "blue" | "yellow" | "green" | "orange" | "purple" | "pink" | "brown" | "black" | "white";

/** The four seasons Bloo's Seasons and Weather teaches, in order. */
export type Season = "spring" | "summer" | "fall" | "winter";

/** The four weathers Bloo's Seasons and Weather teaches, each with its season. */
export type Weather = "sunny" | "rainy" | "windy" | "snowy";

/** The five vegetables Nova's Vegetables course teaches, in order. */
export type Vegetable = "carrot" | "broccoli" | "potato" | "tomato" | "pepper";

/** The six things Nova's My Garden teaches, in order (2026-11-08). */
export type GardenThing = "flower" | "tree" | "leaf" | "grass" | "nest" | "bench";

/** What a Find looks for: a shape or a color. */
export type Target = { shape: ShapeId } | { color: ColorId };

/** A thing to show: a clay picture, one of the taught shapes, or text (a
    number, "+", "="). `word` is the English name — the taught word, and the
    picture's alt text. */
export type Face =
  | { kind: "picture"; src: StaticImageData; word: string }
  | { kind: "shape"; shape: ShapeId }
  | { kind: "text"; text: string };

/** A box in a scene, as percentages of the scene: left, top, width, height. */
export type SceneRect = readonly [number, number, number, number];

/** A thing to tell apart: its picture, and what it is. `shape` is what it
    IS (a plate is a circle); `null` for things that are no taught shape (a
    kite). */
export interface Thing {
  id: string;
  src: StaticImageData;
  /** English, and the tap target's name. */
  word: string;
  shape: ShapeId | null;
  /** Its color, in the Colors course's scenes. */
  color?: ColorId;
  /** The vegetable it is, on Basket Time's counter. */
  group?: Vegetable;
}

/** One thing lying in a scene, and where. */
export interface SceneItem extends Thing {
  /** Where its picture (shadow included) sits. */
  box: SceneRect;
  /** The thing itself, without its shadow — what a tap has to land on. */
  hit: SceneRect;
}

/** A pre-rendered world to find things in: an empty background and the
    items laid over it, all from one render (`tools/picnic-scene`). */
export interface Scene {
  background: StaticImageData;
  items: SceneItem[];
}

/** Pinki's question, as a key into `dict.asks` plus its values. The taught
    words in `vars` stay English in every locale. */
export interface Ask {
  key: keyof Dictionary["asks"];
  vars?: Record<string, string | number>;
}

/**
 * One step of a lesson after its reel. Three question types (see
 * `edenic-plan.md` §4) plus the two word steps a Shapes lesson is built
 * around: meet the word, then build it. Nothing here says what Pinki SAYS aloud — the line is
 * the `ask` in the child's language, and its audio id is derived from where
 * the question sits (`lessonCue`), so there is no second copy to drift.
 */
export type Question =
  /** Trace the shape over its dotted outline, after Pinki draws it. */
  | { type: "trace"; ask: Ask; shape: ShapeId }
  /** Meet the word: a big speaker, the shape (or picture) it names, and the
      English word in clay letters — a color word in its own `color`. A
      `tilt` picture (the videos' own animal) leans toward the finger. */
  | { type: "word"; ask: Ask; word: string; shape?: ShapeId; picture?: StaticImageData; color?: ColorId; tilt?: boolean }
  /** Build the word from its shuffled letters, by tap or drag. With a
      `picture`, the picture is shown INSTEAD of the word — spell it from
      memory. */
  | { type: "spell"; ask: Ask; word: string; picture?: StaticImageData; color?: ColorId }
  /** Find every thing in the scene that is this shape or color. */
  /* `world`: the Find in the lesson's world itself, both frames (Shapes:
     its picnic on the garden's lawn, seen from above); `scene` is then
     the task button's demo picture. */
  | { type: "find"; ask: Ask; target: Target; scene: Scene; world?: Framed<Scene> }
  /** Two paints and what they make: pick the color; the two run together
      into it (`MixColors`). `others` are the wrong answers. */
  | { type: "mix"; ask: Ask; a: ColorId; b: ColorId; color: ColorId; others: ColorId[] }
  /** Basket Time (Nova's Vegetables, the user's design, 2026-11-01 — Find
      It! merged in): the kitchen, its friend behind the counter, the word
      up on the wall; drag its vegetable from the counter into the basket
      (or tap it). `demo`: another vegetable carried into `basket` (the
      demo's own, small). */
  | { type: "basket"; ask: Ask; word: Vegetable; kitchen: Kitchen; basket: Basket; demo: Food }
  /** Feed the animal (Bloo's Animals, 2026-11-01): the animal over three
      foods — its own first (dealt in a seeded order), then two it would
      never eat. Drag one into it (or tap it): its own is eaten, anything
      else it shakes its head at. `mouth`: where the food goes, % of the
      picture. `demo`: another animal fed its own food. */
  | {
      type: "feed";
      ask: Ask;
      word: string;
      picture: StaticImageData;
      mouth: readonly [number, number];
      foods: readonly Food[];
      demo: { picture: StaticImageData; mouth: readonly [number, number]; food: Food };
    };

/** Something an animal eats (Feed the animal): its English word and its
    picture. */
export interface Food {
  word: string;
  src: StaticImageData;
}

/** Nova's basket, standing beside her garden (`?basket`): the basket, its
    near half — which goes over what is piled in it — and its mouth (% of
    the picture), where that piles up. */
export interface Basket {
  src: StaticImageData;
  rim: StaticImageData;
  mouth: SceneRect;
}

/** One frame of the kitchen (`tools/picnic-scene`, `render.cjs veg`):
    the room and the counter, the counter alone (laid over
    the friend standing behind it), where the friend stands, the basket on
    the counter and the things on it — boxes are % of the picture. */
export interface KitchenFrame {
  ground: StaticImageData;
  counter: { src: StaticImageData; box: SceneRect };
  friend: SceneRect;
  basket: Basket & { box: SceneRect };
  items: readonly SceneItem[];
}

/** The kitchen, framed for a wide board and for a phone's, and the
    friend in it — always their picture, never 3D (the user, 2026-11-01). */
export interface Kitchen {
  landscape: KitchenFrame;
  portrait: KitchenFrame;
  friend: { picture: StaticImageData; cheer: StaticImageData };
}

/** A picture (or anything) in both frames — the one that fits the screen
    shows: `landscape` on a screen wider than tall, `portrait` otherwise. */
export interface Framed<T = StaticImageData> {
  portrait: T;
  landscape: T;
}

/** A lesson's world (2026-11-02, Pinki's Shapes first): where its steps
    happen, the end of the lesson too. The camera stands at each step's
    place in it, out of focus, behind the step — sharp for a step played
    in it (a Find, `Question.world`) — and every change of step is the
    camera moving there, the flower of the step just done blooming first
    (`tools/picnic-scene`, `render.cjs garden`). */
export interface LessonWorld {
  /** Each step's still, after the reel — and one more, the lesson's end
      (the path in bloom). */
  stations: readonly Framed[];
  /** The camera's move INTO each station, a clip played by path (move 0
      is the entry, after the reel); the last frame is that station. */
  moves: readonly (Framed<string> | null)[];
  /** The station each step plays at (the last holds for the steps after it):
      absent, step `i` is at station `i`. Several steps at one station never
      change the picture between them — Nova's kitchen (2026-11-06): a blurred
      wide view that never moves for the word and the spelling (its station has
      no clip, `null`: it just fades in), one move in to the counter, the focus
      coming, for Basket Time, and the counter blurring again for the end.
      The lesson's end is always the last station. */
  stepStation?: readonly number[];
  /** Bloo's farm (2026-11-10): the word step's animal stands sharp in the world itself,
      so the page lays no picture of its own — just the speaker and the word. */
  animalInWorld?: boolean;
  /** Bloo's island (2026-11-10): the word step's station is the season (or its weather)
      itself, sharp — the page writes the word in the sky, as Colors does. */
  wordInSky?: boolean;
}

/** A frame of a course's world of stops (`CourseWorld`): the first picture
    (shown at once), where the rest are, and each stop's box at even steps
    along the camera's way. `focus`: the scroll (0..1) that brings each stop
    nearest the middle. */
export interface CourseStopsFrame {
  first: StaticImageData;
  path: string;
  version: string;
  focus: readonly number[];
  keys: readonly (readonly SceneRect[])[];
  /** Per frame, which ways the tiles of its mask sheet hold, in order (a long
      course shows only some ways in a frame). Absent: every way, in order. */
  maskWays?: readonly (readonly number[])[];
  /** Per frame, which drops its sheet of drop pixels (`d<nnn>.png`) holds, in
      order: the page greys the drops not yet open through them. Guided only. */
  dropWays?: readonly (readonly number[])[];
  /** How the picture moves from one frame to the next, measured off the
      frames: the point it grows from (% of the frame) and how much. */
  flow: readonly [number, number, number];
}

/** The gold chest opening in one frame of a course's world (2026-11-11,
    rendered — `tools/picnic-scene` `chest`): only the pixels that change, as
    cropped WebPs laid over the page's own frame, each with its box (% of
    the frame; empty when nothing changed). */
export interface ChestPlayFrame {
  /** The scroll frame the page rests on at the chest: the play is seen from it. */
  rest: number;
  version: string;
  /** The play, `c00.webp`…: shake, the lid swinging open, the light coming up. */
  play: readonly SceneRect[];
  /** The scroll frames from `from` on that show the chest, open: `o<frame>.webp`. */
  from: number;
  open: readonly SceneRect[];
}

export type ChestOpening = Framed<ChestPlayFrame>;

/** A course's world of stops, its camera's way in, in both frames. */
export interface CourseStops extends Framed<CourseStopsFrame> {
  /** The gold chest opening (absent: it never opens). */
  chest?: ChestOpening;
  frames: number;
  /** What a done way's white stones are multiplied by (default Pinki's pink). */
  tint?: string;
  /** How tall the scroll is, in `svh` (default 340, Shapes'). */
  run?: number;
  /** Played one lesson at a time (Colors, 2026-11-06): no scroll while there is
      a lesson left — the camera stands at the next lesson, the ones after it
      grey, one Start button; back from a lesson its way turns, the camera goes
      on and the next one gets its colour. All done, the scroll opens. */
  guided?: boolean;
}

/** One lesson of a course: `/learn/pinki/shapes/1` is `pinkiShapes[0]`. */
export interface LessonDef {
  /** The lesson's reel, a path under `/public` (videos are played by path,
      never imported). Absent until the company delivers it — the lesson then
      starts straight at the questions. */
  reel?: string;
  /** The picture(s) its stop on the course path wears — one thing, or a
      few for a lesson that mixes them (a review). */
  cover: readonly StaticImageData[];
  /** Empty until the lesson is written; the page then says it is on its way. */
  questions: Question[];
  /** Its course's world, when the course has one; without it the steps are
      on the friend's board in their classroom. */
  world?: LessonWorld;
  /** A second reel inside the lesson, played before question `at` (Seasons
      and Weather: the season's steps, then the weather's reel and steps). */
  midReel?: { src: string; at: number };
}
