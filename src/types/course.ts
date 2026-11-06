import type { StaticImageData } from "next/image";
import type { Dictionary } from "@/lib/dictionaries/en";

export type ShapeId = "circle" | "square" | "triangle" | "rectangle";

/** The ten colors the Colors course teaches, in the order it teaches them. */
export type ColorId = "red" | "blue" | "yellow" | "green" | "orange" | "purple" | "pink" | "brown" | "black" | "white";

/** The four seasons Nova's Seasons course teaches, in order. */
export type Season = "spring" | "summer" | "fall" | "winter";

/** The three animals of Bloo's review Sort (each has a home), in order. */
export type Animal = "cat" | "dog" | "fish";

/** The four weathers Bloo's Weather course teaches, in order. */
export type Weather = "sunny" | "rainy" | "windy" | "snowy";

/** The five vegetables Nova's Vegetables course teaches, in order. */
export type Vegetable = "carrot" | "broccoli" | "potato" | "tomato" | "pepper";

/** A set things belong to: the season a thing goes with (Nova's Seasons),
    the animal it is — whose home it goes in (Bloo's Animals) — the
    weather it is worn in (Bloo's Weather), or the vegetable it is (Find
    It! on Nova's kitchen counter). */
type Group = Season | Animal | Weather | Vegetable;

/** What a Find looks for, or what a Sort box takes: a shape, a color, or a
    group. */
export type Target = { shape: ShapeId } | { color: ColorId } | { group: Group };

/** A thing to show: a clay picture, one of the taught shapes, or text (a
    number, "+", "="). `word` is the English name — the taught word, and the
    picture's alt text. A `full` picture (a whole scene, not one thing)
    fills its tile edge to edge. */
export type Face =
  | { kind: "picture"; src: StaticImageData; word: string; full?: boolean }
  | { kind: "shape"; shape: ShapeId }
  | { kind: "text"; text: string };

/** A box in a scene, as percentages of the scene: left, top, width, height. */
export type SceneRect = readonly [number, number, number, number];

/** A thing to tell apart: its picture, and what it is — a Sort's things.
    `shape` is what it IS (a plate is a circle); `null` for things that are
    no taught shape (a kite). */
export interface Thing {
  id: string;
  src: StaticImageData;
  /** English, and the tap target's name. */
  word: string;
  shape: ShapeId | null;
  /** Its color, in the Colors course's scenes. */
  color?: ColorId;
  /** The season it goes with (Nova's Seasons), the animal it is, or the
      weather it is worn in. */
  group?: Group;
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

/** One box of a Sort: what goes in it, its name, what it shows, its clay. */
export interface SortBin {
  target: Target;
  /** English — the box's label. */
  word: string;
  face: Face;
  tone: { face: string; edge: string; text: string };
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
  /** Tap the right tile. `show` is what the question is about, drawn above
      the tiles (an equation made of pictures); `word` is a taught word in
      clay letters above them instead — `plain` writes it in one quiet ink,
      for a word that must be READ (a color word). `answer` indexes `options` before they
      are shuffled. `blind`: the task button's demo shows blank tiles — a
      lesson's own word, whose answer it must not give away. */
  | { type: "pick"; ask: Ask; show?: Face[]; word?: string; plain?: boolean; options: Face[]; answer: number; blind?: boolean }
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
  /** Put each thing, one at a time, in the box it belongs in. */
  | { type: "sort"; ask: Ask; items: Thing[]; bins: SortBin[] }
  /** Two paints and what they make: pick the color; the two run together
      into it (`MixColors`). `others` are the wrong answers. */
  | { type: "mix"; ask: Ask; a: ColorId; b: ColorId; color: ColorId; others: ColorId[] }
  /** Tap the things in their order — each lands in the next space of the
      line. `items` are in the right order. */
  | { type: "order"; ask: Ask; items: Face[] }
  /** Make it: what goes in (`list` — the English word, or a recipe of a
      few), Nova's soup pot and the things beside it. Drag or tap each one
      in; once all are in, it bubbles and fills. `full` is the pot full —
      rendered from the same camera as the empty one, so it lies exactly
      over it. */
  | { type: "make"; ask: Ask; list: string[]; stall: Face[]; full: StaticImageData }
  /** Do you like it? One thing at a time, thumbs up or down, onto the "I
      like" or the "I don't like" plate — no wrong answer: the sentences
      ("I like apples.") are the lesson. `things` is each one's plural. */
  | { type: "likes"; ask: Ask; items: { face: Face; things: string }[] }
  /** Pick what Nova's note says (a review's exam): three plants, the
      note — "3 apples, 1 banana, 2 oranges" — and her basket beside them.
      Tap one and it is picked (pulled up) into the basket, its word popping
      up where it was; one more than the note says wiggles back. `order` is
      each line: the English word, its plural and how many. */
  | { type: "harvest"; ask: Ask; order: { word: string; things: string; count: number }[]; garden: Garden }
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

/** Where the foods grow, to pick them (Nova's Fruits review) — one render
    (`tools/picnic-scene`, `?harvest=`): the garden without its food, each
    kind of food (all of one kind are alike) and what stands in front of
    them (the beds' near halves) — and the basket they are picked into. */
export interface Garden {
  ground: StaticImageData;
  /** Each kind of food that grows here, by its English word. */
  foods: Record<string, StaticImageData>;
  /** Each food: which it is, where its picture sits, what of it can be
      tapped (the part not behind the front), and how far it is turned (°,
      about its stem) so they are not all alike. */
  items: { food: string; box: SceneRect; hit: SceneRect; tilt: number }[];
  /** None in a garden of trees alone. */
  front?: { src: StaticImageData; box: SceneRect };
  basket: Basket;
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
  moves: readonly Framed<string>[];
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
}

/** A course's world of stops, its camera's way in, in both frames. */
export interface CourseStops extends Framed<CourseStopsFrame> {
  frames: number;
  /** What a done way's white stones are multiplied by (default Pinki's pink). */
  tint?: string;
  /** How tall the scroll is, in `svh` (default 340, Shapes'). */
  run?: number;
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
}
