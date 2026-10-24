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

/** A set things belong to: the season a thing goes with (Nova's Seasons),
    the animal it is — whose home it goes in (Bloo's Animals) — or the
    weather it is worn in (Bloo's Weather). */
type Group = Season | Animal | Weather;

/** What a Find looks for, or what a Sort box takes: a shape, a color, or a
    group. */
export type Target = { shape: ShapeId } | { color: ColorId } | { group: Group };

/** A thing to show: a clay picture, one of the taught shapes, or text (a
    number, "+", "="). `word` is the English name — the taught word, and the
    picture's alt text. */
export type Face =
  | { kind: "picture"; src: StaticImageData; word: string }
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
      are shuffled. */
  | { type: "pick"; ask: Ask; show?: Face[]; word?: string; plain?: boolean; options: Face[]; answer: number }
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
  | { type: "find"; ask: Ask; target: Target; scene: Scene }
  /** Put each thing, one at a time, in the box it belongs in. */
  | { type: "sort"; ask: Ask; items: Thing[]; bins: SortBin[] }
  /** Balloons of many colors float up; pop every one of `color` (four of
      them) and leave the `others` be. */
  | { type: "pop"; ask: Ask; color: ColorId; others: ColorId[] }
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
  /** Make the weather by hand, in three goes, on Bloo's hill: tap the
      cloud (rain), push the clouds off the sun, swipe across the sky
      (wind), shake the cloud (snow). Nothing can go wrong — the weather is
      the lesson. */
  | { type: "weather"; ask: Ask; word: Weather; gesture: Gesture; scene: WeatherScene }
  /** Pick what Nova's note says (a review's exam): three plants, the
      note — "3 apples, 1 banana, 2 oranges" — and her basket beside them.
      Tap one and it is picked (pulled up) into the basket, its word popping
      up where it was; one more than the note says wiggles back. `order` is
      each line: the English word, its plural and how many. */
  | { type: "harvest"; ask: Ask; order: { word: string; things: string; count: number }[]; garden: Garden }
  /** Grow it (Nova's Vegetables, 2026-10-24): slide the knob from the
      left end of its line to the right and the vegetable grows from its
      seed in the soil under it — slid back, it shrinks again. Nothing can
      go wrong; the right end is the vegetable, whole (its `picture` waits
      there, faint). */
  | { type: "grow"; ask: Ask; word: string; picture: StaticImageData; scene: GrowScene };

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

/** How a weather is made by hand (Bloo's Weather lessons). */
export type Gesture = "tap" | "push" | "swipe" | "shake";

/** A weather made by hand (`tools/picnic-scene`, `?weathersteps=`): Bloo's
    hill before the weather and after each go (`frames`, all on one box —
    the sun has one: its clouds go instead), what is in its sky as layers of
    their own the same size (`sky` — the cloud to tap or shake, the clouds
    to push off the sun) with where each is (`box`, % of the picture), and
    what the weather sends down or across (`bits`: drops, flakes, swirls and
    leaves, sparkles). */
export interface WeatherScene {
  frames: readonly StaticImageData[];
  sky: readonly { src: StaticImageData; box: SceneRect }[];
  bits: readonly StaticImageData[];
}

/** Frames of a growing plant, side by side in one picture (`cols` a row):
    one frame's size in it (px), and where a frame lies (% of the scene). */
export interface GrowSheet {
  src: StaticImageData;
  cell: readonly [number, number];
  box: SceneRect;
}

/** A vegetable growing in the soil, cut open (`data/grow.ts`): the soil,
    and `frames` moments of the plant — what grows above the soil (swaying
    about its `foot`, % of its frame) and under it. `emerge`: when (0–1)
    the shoot breaks the soil; `veg`: where the vegetable is at the end. */
export interface GrowScene {
  ground: { src: StaticImageData; box: SceneRect };
  frames: number;
  cols: number;
  above: GrowSheet & { foot: readonly [number, number] };
  below: GrowSheet;
  emerge: number;
  veg: readonly [number, number];
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
}
