/** A course. The route segment too: `/learn/pinki/shapes`. */
export type LessonId =
  | "shapes" | "colors" | "family"
  | "fruits" | "seasons" | "months"
  | "animals" | "weather" | "body";

/** A course's own colour world (its cards, banner, path and buttons).
    Deliberately independent of the character's accent: the hue says what
    the subject is, so a subject reads the same way on every hub. */
export interface LessonTheme {
  accent: string;
  accentDark: string;
}

/** `name`/`description` are translated content and live in the dictionaries
    (`dict.lessons[id]`) instead of here. */
export interface Lesson {
  id: LessonId;
  image: string;
  theme: LessonTheme;
  /** How many lessons this course has (numbered 1…n) — drives the
      "n / total" progress readout on its card and the rows on its page. */
  totalItems: number;
  locked: boolean;
  /** How its page lays the lessons out: a winding path (default), or a
      box of things that colour in as they are learned (`LessonBox` —
      Pinki's Shapes and Colors). */
  view?: "path" | "box";
}
