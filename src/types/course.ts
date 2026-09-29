import type { StaticImageData } from "next/image";
import type { Dictionary } from "@/lib/dictionaries/en";

export type ShapeId = "circle" | "square" | "triangle" | "rectangle";

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
  /** Tap the right tile. `show` is what the question is about, drawn above
      the tiles (an equation made of pictures); `word` is a taught word in
      clay letters above them instead. `answer` indexes `options` before they
      are shuffled. */
  | { type: "pick"; ask: Ask; show?: Face[]; word?: string; options: Face[]; answer: number }
  /** Put `target` things in the basket, by tap or drag. */
  | { type: "count"; ask: Ask; item: { src: StaticImageData; word: string }; target: number }
  /** Trace the shape over its dotted outline, after Pinki draws it. */
  | { type: "trace"; ask: Ask; shape: ShapeId }
  /** Meet the word: a big speaker, the shape it names, and the English word
      in clay letters. */
  | { type: "word"; ask: Ask; word: string; shape?: ShapeId }
  /** Build the word from its shuffled letters, by tap or drag. */
  | { type: "spell"; ask: Ask; word: string }
  /** Find every thing in the scene that is this shape. */
  | { type: "find"; ask: Ask; shape: ShapeId; scene: Scene }
  /** Put each thing, one at a time, in the box of its shape. */
  | { type: "sort"; ask: Ask; items: SceneItem[] };

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
