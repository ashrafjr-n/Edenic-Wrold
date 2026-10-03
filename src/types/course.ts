import type { StaticImageData } from "next/image";
import type { Dictionary } from "@/lib/dictionaries/en";

export type ShapeId = "circle" | "square" | "triangle" | "rectangle";

/** The ten colors the Colors course teaches, in the order it teaches them. */
export type ColorId = "red" | "blue" | "yellow" | "green" | "orange" | "purple" | "pink" | "brown" | "black" | "white";

/** A set things belong to: the season a thing goes with (Nova's Seasons). */
export type Group = "spring" | "summer" | "fall" | "winter";

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

/** One thing lying in a scene. `shape` is what it IS (a plate is a circle);
    `null` for things that are no taught shape (a kite). */
export interface SceneItem {
  id: string;
  src: StaticImageData;
  /** English, and the tap target's name. */
  word: string;
  shape: ShapeId | null;
  /** Its color, in the Colors course's scenes. */
  color?: ColorId;
  /** The group it belongs to, in Nova's scenes. */
  group?: Group;
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

/** One round of a Paint: the word names the color, the thing gets it. */
export interface PaintRound {
  color: ColorId;
  /** The thing in plain grey clay, and painted. */
  blank: StaticImageData;
  painted: StaticImageData;
  /** English — the thing's name. */
  word: string;
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
      English word in clay letters — a color word in its own `color`. */
  | { type: "word"; ask: Ask; word: string; shape?: ShapeId; picture?: StaticImageData; color?: ColorId }
  /** Build the word from its shuffled letters, by tap or drag. With a
      `picture`, the picture is shown INSTEAD of the word — spell it from
      memory. */
  | { type: "spell"; ask: Ask; word: string; picture?: StaticImageData; color?: ColorId }
  /** Find every thing in the scene that is this shape or color. */
  | { type: "find"; ask: Ask; target: Target; scene: Scene }
  /** Put each thing, one at a time, in the box it belongs in. */
  | { type: "sort"; ask: Ask; items: SceneItem[]; bins: SortBin[] }
  /** Read the color word, tap its pot, and the thing is painted — a round
      per color. `pots` are the colors on offer, in order. */
  | { type: "paint"; ask: Ask; rounds: PaintRound[]; pots: ColorId[] }
  /** Balloons of many colors float up; pop every one of `color` (four of
      them) and leave the `others` be. */
  | { type: "pop"; ask: Ask; color: ColorId; others: ColorId[] }
  /** Tap the things in their order — each lands in the next space of the
      line. `items` are in the right order. */
  | { type: "order"; ask: Ask; items: Face[] }
  /** Make it: what goes in (`list` — the English word, or a recipe of a
      few), Nova's blender (or her soup pot) and the things beside it. Drag
      or tap each one in; once all are in, it whirs (or bubbles) and fills.
      `full` is the blender or pot full — rendered from the same camera as
      the empty one, so it lies exactly over it — and `serve` what it
      pours out (a glass of juice). */
  | { type: "make"; ask: Ask; list: string[]; stall: Face[]; into: Maker; full: StaticImageData; serve?: StaticImageData }
  /** Do you like it? One thing at a time, thumbs up or down, onto the "I
      like" or the "I don't like" plate — no wrong answer: the sentences
      ("I like apples.") are the lesson. `things` is each one's plural. */
  | { type: "likes"; ask: Ask; items: { face: Face; things: string }[] }
  /** The word in big empty letters: rub each one with a finger and it
      fills with small `picture`s of the thing — a word made of apples. */
  | { type: "fill"; ask: Ask; word: string; picture: StaticImageData }
  /** Pick them: five of the thing on its tree (in its bed); tap one and it
      is picked (pulled up) into Nova's basket, its `word` popping up where
      it was. All five in → the word under the garden turns into `things`
      ("apples"). */
  | { type: "harvest"; ask: Ask; word: string; things: string; garden: Garden };

/** Where a food grows, to pick it (Nova's Fruits) — one render
    (`tools/picnic-scene`, `?harvest=`): the garden without the food, the
    food (the five are alike), what stands in front of it (a bed's near half
    and the basket) and the basket's near half, which goes over what is
    piled in it. */
export interface Garden {
  ground: StaticImageData;
  item: StaticImageData;
  /** Each food: where its picture sits, what of it can be tapped (the part
      not behind the front), and how far it is turned (°, about `pivot`) so
      the five are not all alike. */
  items: { box: SceneRect; hit: SceneRect; tilt: number }[];
  /** What a food turns about: a hanging fruit's stem, an ear of corn's foot. */
  pivot: "top" | "bottom";
  front: { src: StaticImageData; box: SceneRect };
  rim: { src: StaticImageData; box: SceneRect };
  /** The basket's mouth, where what is picked piles up. */
  basket: SceneRect;
}

/** What a Make fills: Nova's blender (a juice) or her soup pot (a soup). */
export type Maker = "blender" | "pot";

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
