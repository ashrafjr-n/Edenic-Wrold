/** A course. The route segment too: `/learn/pinki/shapes`. */
export type LessonId = "shapes" | "adding";

/** A lesson's own color world, worn from `sm` up (see `.lesson-theme`).
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
}
