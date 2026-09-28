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
      the tiles (an equation made of pictures). `answer` indexes `options`
      before they are shuffled. */
  | { type: "pick"; ask: Ask; show?: Face[]; options: Face[]; answer: number }
  /** Put `target` things in the basket, by tap or drag. */
  | { type: "count"; ask: Ask; item: { src: StaticImageData; word: string }; target: number }
  /** Trace the shape over its dotted outline, after Pinki draws it. */
  | { type: "trace"; ask: Ask; shape: ShapeId }
  /** Meet the word: a big speaker and the English word in clay letters. */
  | { type: "word"; ask: Ask; word: string }
  /** Build the word from its shuffled letters, by tap or drag. */
  | { type: "spell"; ask: Ask; word: string };

/** One lesson of a course: `/learn/pinki/shapes/1` is `pinkiShapes[0]`. */
export interface LessonDef {
  /** The lesson's reel, a path under `/public` (videos are played by path,
      never imported). Absent until the company delivers it — the lesson then
      starts straight at the questions. */
  reel?: string;
  /** Empty until the lesson is written; the page then says it is on its way. */
  questions: Question[];
}
