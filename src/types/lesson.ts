export type LessonId = "numbers" | "letters" | "colors" | "shapes";

/** A lesson's own color world, worn from `sm` up (see `.lesson-theme`).
    Deliberately independent of the character's accent: the hue says what
    the subject is, so the same four read the same way on every hub. */
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
  /** How many items this lesson actually contains — drives the "n / total"
      progress readout on its card. */
  totalItems: number;
  locked: boolean;
}
